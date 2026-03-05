import prisma from './prisma';

// ─── Types ───────────────────────────────────────────────

interface DeadlineParams {
    dueDate: Date | null;
    hardDeadline: Date | null;
    submittedAt: Date;
}

interface XPParams {
    baseXP: number;
    version: number;
    deadlines: DeadlineParams;
    /** If graded: ratio of earned/max points (0-1) */
    gradeRatio?: number;
}

interface BadgeContext {
    type: 'submission' | 'graded';
    version?: number;
    submittedAt?: Date;
    dueDate?: Date | null;
    gradeRatio?: number;
}

// ─── Badge Definitions ───────────────────────────────────

const BADGE_DEFINITIONS: { id: string; check: (ctx: BadgeCheckContext) => boolean }[] = [
    { id: 'first_code', check: (ctx) => ctx.totalSubmissions === 1 },
    { id: 'five_assignments', check: (ctx) => ctx.uniqueAssignments >= 5 },
    { id: 'streak_5', check: (ctx) => ctx.streakDays >= 5 },
    { id: 'streak_10', check: (ctx) => ctx.streakDays >= 10 },
    { id: 'streak_20', check: (ctx) => ctx.streakDays >= 20 },
    { id: 'perfect_score', check: (ctx) => ctx.gradeRatio !== undefined && ctx.gradeRatio >= 1.0 },
    { id: 'fast_learner', check: (ctx) => ctx.hoursBeforeDeadline !== undefined && ctx.hoursBeforeDeadline >= 48 },
    { id: 'level_5', check: (ctx) => ctx.level >= 5 },
    { id: 'level_10', check: (ctx) => ctx.level >= 10 },
];

interface BadgeCheckContext {
    totalSubmissions: number;
    uniqueAssignments: number;
    streakDays: number;
    level: number;
    gradeRatio?: number;
    hoursBeforeDeadline?: number;
}

// ─── XP Calculation ──────────────────────────────────────

/**
 * Calculate XP earned for a submission or grading event.
 * - Base XP from assignment.xpReward
 * - +50 bonus for first attempt (version 1)
 * - Early bird bonus: +100 if >48h before deadline, +50 if >24h
 * - Late penalty: -10% per day late, max -50%
 * - Grade multiplier: earned/max points ratio (only on grading)
 */
export function calculateXP(params: XPParams): number {
    let xp = params.baseXP;

    // First attempt bonus
    if (params.version === 1) xp += 50;

    // Apply deadline bonuses/penalties
    xp = applyDeadlineModifier(xp, params.deadlines);

    // Apply grade quality multiplier (when grading)
    if (params.gradeRatio !== undefined) {
        xp = Math.round(xp * params.gradeRatio);
    }

    return Math.max(0, xp);
}

/**
 * Apply deadline-based bonuses and penalties to XP.
 */
export function applyDeadlineModifier(baseXP: number, deadlines: DeadlineParams): number {
    let xp = baseXP;
    const { dueDate, submittedAt } = deadlines;

    if (!dueDate) return xp;

    const hoursBeforeDeadline = (dueDate.getTime() - submittedAt.getTime()) / 3600000;

    if (hoursBeforeDeadline > 48) {
        xp += 100; // Early bird: >48h before
    } else if (hoursBeforeDeadline > 24) {
        xp += 50;  // Early: >24h before
    } else if (hoursBeforeDeadline < 0) {
        // Late penalty: -10% per day, max -50%
        const daysLate = Math.abs(hoursBeforeDeadline) / 24;
        const penalty = Math.min(0.5, daysLate * 0.1);
        xp = Math.round(xp * (1 - penalty));
    }

    return xp;
}

// ─── Level Management ────────────────────────────────────

const XP_PER_LEVEL = 500;

/**
 * Recalculate and update user level based on current XP.
 * Returns the new level.
 */
export async function updateLevel(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
    });

    if (!user) return 1;

    const newLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;

    if (newLevel !== user.level) {
        await prisma.user.update({
            where: { id: userId },
            data: { level: newLevel },
        });
    }

    return newLevel;
}

// ─── Streak Management ──────────────────────────────────

/**
 * Update the user's streak counter.
 * - If last activity was within 48 hours: increment streak
 * - If more than 48 hours or first activity: reset to 1
 * - Always updates lastActiveAt to now
 */
export async function updateStreak(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streakDays: true, lastActiveAt: true },
    });

    if (!user) return 0;

    const now = new Date();
    let newStreak = 1;

    if (user.lastActiveAt) {
        const hoursSinceLast = (now.getTime() - new Date(user.lastActiveAt).getTime()) / 3600000;

        if (hoursSinceLast < 48) {
            // Check it's a different calendar day to avoid double-counting same-day submissions
            const lastDate = new Date(user.lastActiveAt).toDateString();
            const todayDate = now.toDateString();

            if (lastDate !== todayDate) {
                newStreak = user.streakDays + 1;
            } else {
                newStreak = user.streakDays; // Same day, keep current streak
            }
        }
        // else: gap > 48h → streak resets to 1
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            streakDays: newStreak,
            lastActiveAt: now,
        },
    });

    return newStreak;
}

// ─── Badge System ────────────────────────────────────────

/**
 * Check all badge conditions and award any new badges.
 * Uses upsert-like pattern for idempotency.
 */
export async function checkAndAwardBadges(
    userId: string,
    context: BadgeContext
): Promise<string[]> {
    // Gather stats needed for badge checks
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, streakDays: true },
    });

    if (!user) return [];

    const totalSubmissions = await prisma.submissionVersion.count({
        where: { studentId: userId, status: { not: 'draft' } },
    });

    // Count unique assignments submitted
    const uniqueAssignmentsSubs = await prisma.submissionVersion.findMany({
        where: { studentId: userId, status: { not: 'draft' } },
        select: { assignmentId: true },
        distinct: ['assignmentId'],
    });

    // Calculate hours before deadline if applicable
    let hoursBeforeDeadline: number | undefined;
    if (context.submittedAt && context.dueDate) {
        hoursBeforeDeadline = (new Date(context.dueDate).getTime() - new Date(context.submittedAt).getTime()) / 3600000;
    }

    const checkCtx: BadgeCheckContext = {
        totalSubmissions,
        uniqueAssignments: uniqueAssignmentsSubs.length,
        streakDays: user.streakDays,
        level: user.level,
        gradeRatio: context.gradeRatio,
        hoursBeforeDeadline,
    };

    // Get already earned badges
    const existingBadges = await prisma.achievement.findMany({
        where: { userId },
        select: { badgeId: true },
    });
    const earnedSet = new Set(existingBadges.map((a) => a.badgeId));

    // Check and award new badges
    const newBadges: string[] = [];
    for (const badge of BADGE_DEFINITIONS) {
        if (earnedSet.has(badge.id)) continue;
        if (badge.check(checkCtx)) {
            try {
                await prisma.achievement.create({
                    data: { userId, badgeId: badge.id },
                });
                newBadges.push(badge.id);
            } catch {
                // Already exists (race condition) — ignore
            }
        }
    }

    return newBadges;
}

// ─── Academic Stability ──────────────────────────────────

/**
 * Recalculate academic stability for a user.
 * Based on last 10 graded submissions:
 * - Check proportion of late submissions
 * - >30% late → decrease stability by 0.1
 * - otherwise → increase by 0.05
 * Clamped to [0.0, 1.0]
 */
export async function updateAcademicStability(userId: string): Promise<number> {
    const recentSubs = await prisma.submissionVersion.findMany({
        where: { studentId: userId, status: 'graded' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            assignment: {
                select: { dueDate: true },
            },
        },
    });

    if (recentSubs.length === 0) return 1.0;

    // Count late submissions
    let lateCount = 0;
    for (const sub of recentSubs) {
        if (sub.assignment.dueDate) {
            const deadline = new Date(sub.assignment.dueDate);
            const submitted = new Date(sub.createdAt);
            if (submitted > deadline) lateCount++;
        }
    }

    const lateRatio = lateCount / recentSubs.length;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { academicStability: true },
    });

    const current = user?.academicStability ?? 1.0;
    let newStability: number;

    if (lateRatio > 0.3) {
        newStability = Math.max(0, current - 0.1);
    } else {
        newStability = Math.min(1.0, current + 0.05);
    }

    await prisma.user.update({
        where: { id: userId },
        data: { academicStability: newStability },
    });

    return newStability;
}

// ─── Skill Mastery Update ────────────────────────────────

/**
 * Update skill mastery for all skills linked to an assignment.
 */
export async function updateSkillMastery(
    userId: string,
    assignmentId: string,
    xpEarned: number
): Promise<void> {
    const assignmentSkills = await prisma.assignmentSkill.findMany({
        where: { assignmentId },
    });

    const masteryIncrement = Math.min(10, Math.round(xpEarned / 20));

    for (const as_ of assignmentSkills) {
        await (prisma as any).userSkill.upsert({
            where: { userId_skillId: { userId, skillId: as_.skillId } },
            update: { mastery: { increment: masteryIncrement } },
            create: { userId, skillId: as_.skillId, mastery: masteryIncrement },
        });
    }
}

// ─── Composite Helper: Full Gamification on Submission ───

/**
 * Run the full gamification pipeline when a student submits work.
 */
export async function processSubmissionGamification(params: {
    userId: string;
    assignmentId: string;
    xpReward: number;
    version: number;
    dueDate: Date | null;
    hardDeadline: Date | null;
}): Promise<{ xpEarned: number; newLevel: number; streakDays: number; newBadges: string[] }> {
    const now = new Date();

    // 1. Calculate XP
    const xpEarned = calculateXP({
        baseXP: params.xpReward,
        version: params.version,
        deadlines: {
            dueDate: params.dueDate,
            hardDeadline: params.hardDeadline,
            submittedAt: now,
        },
    });

    // 2. Grant XP
    await prisma.user.update({
        where: { id: params.userId },
        data: { xp: { increment: xpEarned } },
    });

    // 3. Update level
    const newLevel = await updateLevel(params.userId);

    // 4. Update streak
    const streakDays = await updateStreak(params.userId);

    // 5. Update skill mastery
    await updateSkillMastery(params.userId, params.assignmentId, xpEarned);

    // 6. Check and award badges
    const newBadges = await checkAndAwardBadges(params.userId, {
        type: 'submission',
        version: params.version,
        submittedAt: now,
        dueDate: params.dueDate,
    });

    return { xpEarned, newLevel, streakDays, newBadges };
}

// ─── Composite Helper: Full Gamification on Grading ──────

/**
 * Run gamification pipeline when a teacher grades a submission.
 */
export async function processGradingGamification(params: {
    studentId: string;
    assignmentId: string;
    xpReward: number;
    earnedPoints: number;
    maxPoints: number;
}): Promise<{ xpEarned: number; newLevel: number; newBadges: string[] }> {
    const gradeRatio = params.maxPoints > 0
        ? params.earnedPoints / params.maxPoints
        : 0;

    // Grade-based XP: half the base reward × ratio
    const xpEarned = Math.round((params.xpReward / 2) * gradeRatio);

    if (xpEarned > 0) {
        await prisma.user.update({
            where: { id: params.studentId },
            data: { xp: { increment: xpEarned } },
        });
    }

    // Update level
    const newLevel = await updateLevel(params.studentId);

    // Update academic stability
    await updateAcademicStability(params.studentId);

    // Check and award badges
    const newBadges = await checkAndAwardBadges(params.studentId, {
        type: 'graded',
        gradeRatio,
    });

    return { xpEarned, newLevel, newBadges };
}
