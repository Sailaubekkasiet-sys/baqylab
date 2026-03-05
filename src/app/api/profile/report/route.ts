import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import jsPDF from 'jspdf';

// GET /api/profile/report — Generate PDF report for the authenticated student
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                achievements: true,
                userSkills: { include: { skill: true } },
                submissions: {
                    where: { status: { not: 'draft' } },
                    include: {
                        assignment: { select: { title: true, xpReward: true, difficulty: true } },
                        grades: { include: { criterion: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                memberships: { include: { class: { select: { name: true } } } },
            },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Create PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // --- Header ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('BaqyLab', 14, y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student Report — ${new Date().toLocaleDateString()}`, pageWidth - 14, y, { align: 'right' });
        y += 12;

        // --- Student Info ---
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 8;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(user.name, 14, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${user.email} | Level ${user.level} | ${user.xp} XP | Streak: ${user.streakDays} days`, 14, y);
        y += 5;
        doc.text(`Academic Stability: ${Math.round((user.academicStability || 1) * 100)}%`, 14, y);
        y += 10;

        // --- Classes ---
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Classes', 14, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        user.memberships.forEach(m => {
            doc.text(`• ${m.class.name}`, 18, y);
            y += 5;
        });
        y += 4;

        // --- Skills ---
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Skill Map', 14, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (user.userSkills.length === 0) {
            doc.text('No skills tracked yet.', 18, y);
            y += 5;
        } else {
            user.userSkills.forEach(us => {
                const mastery = Math.min(100, (us as any).mastery || 0);
                doc.text(`${us.skill.name}: ${mastery}%`, 18, y);
                // Progress bar
                doc.setFillColor(229, 231, 235);
                doc.rect(80, y - 3, 80, 4, 'F');
                doc.setFillColor(99, 102, 241);
                doc.rect(80, y - 3, 80 * (mastery / 100), 4, 'F');
                y += 6;
            });
        }
        y += 4;

        // --- Badges ---
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Achievements', 14, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (user.achievements.length === 0) {
            doc.text('No badges earned yet.', 18, y);
            y += 5;
        } else {
            const badgeNames: Record<string, string> = {
                first_code: '🚀 First Code',
                five_assignments: '📚 5 Assignments',
                streak_5: '🔥 5-Day Streak',
                streak_10: '🔥 10-Day Streak',
                streak_20: '🔥 20-Day Streak',
                perfect_score: '⭐ Perfect Score',
                fast_learner: '⚡ Fast Learner',
                level_5: '🏆 Level 5',
                level_10: '👑 Level 10',
            };
            user.achievements.forEach(a => {
                doc.text(`${badgeNames[a.badgeId] || a.badgeId} — ${new Date(a.earnedAt).toLocaleDateString()}`, 18, y);
                y += 5;
            });
        }
        y += 4;

        // --- XP Growth Chart (text representation) ---
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Submission History', 14, y);
        y += 6;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Table header
        doc.setFont('helvetica', 'bold');
        doc.text('Assignment', 18, y);
        doc.text('Difficulty', 90, y);
        doc.text('XP', 125, y);
        doc.text('Score', 145, y);
        doc.text('Date', 170, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.line(14, y - 2, pageWidth - 14, y - 2);

        user.submissions.slice(-20).forEach(sub => {
            if (y > 275) { doc.addPage(); y = 20; }
            const totalPoints = sub.grades.reduce((s, g) => s + g.points, 0);
            const maxPoints = sub.grades.reduce((s, g) => s + g.criterion.maxPoints, 0);
            doc.text(sub.assignment.title.substring(0, 30), 18, y);
            doc.text(sub.assignment.difficulty || 'BASIC', 90, y);
            doc.text(`${sub.assignment.xpReward}`, 125, y);
            doc.text(maxPoints > 0 ? `${totalPoints}/${maxPoints}` : '—', 145, y);
            doc.text(new Date(sub.createdAt).toLocaleDateString(), 170, y);
            y += 5;
        });

        // --- Footer ---
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Generated by BaqyLab • ${new Date().toISOString()}`, 14, 290);

        // Return PDF
        const pdfBuffer = doc.output('arraybuffer');
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="report-${user.name.replace(/\s/g, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('GET /api/profile/report error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
