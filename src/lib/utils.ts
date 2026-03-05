import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { v4 as uuidv4 } from 'uuid';

// Get authenticated session or null
export async function getSession() {
    return await getServerSession(authOptions);
}

// Get session and throw if not authenticated
export async function requireAuth() {
    const session = await getSession();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }
    return session;
}

// Require a specific role
export async function requireRole(role: 'TEACHER' | 'STUDENT') {
    const session = await requireAuth();
    if ((session.user as any).role !== role) {
        throw new Error('Forbidden: insufficient permissions');
    }
    return session;
}

// Generate a 6-character invite code
export function generateInviteCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
}

// Format date for display
export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// Format date and time
export function formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Clamp a number between min and max
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// Get initials from a name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// CN utility for merging class names
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
