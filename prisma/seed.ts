import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create skills
    const skills = await Promise.all([
        prisma.skill.upsert({ where: { name: 'Переменные' }, update: {}, create: { name: 'Переменные', description: 'Объявление и использование переменных', color: '#3b82f6' } }),
        prisma.skill.upsert({ where: { name: 'Циклы' }, update: {}, create: { name: 'Циклы', description: 'for, while, do-while', color: '#10b981' } }),
        prisma.skill.upsert({ where: { name: 'Массивы' }, update: {}, create: { name: 'Массивы', description: 'Одномерные и многомерные массивы', color: '#f59e0b' } }),
        prisma.skill.upsert({ where: { name: 'Функции' }, update: {}, create: { name: 'Функции', description: 'Определение и вызов функций', color: '#8b5cf6' } }),
        prisma.skill.upsert({ where: { name: 'ООП' }, update: {}, create: { name: 'ООП', description: 'Классы, наследование, полиморфизм', color: '#ef4444' } }),
        prisma.skill.upsert({ where: { name: 'SQL' }, update: {}, create: { name: 'SQL', description: 'Запросы к базам данных', color: '#06b6d4' } }),
        prisma.skill.upsert({ where: { name: 'Алгоритмы' }, update: {}, create: { name: 'Алгоритмы', description: 'Сортировка, поиск, рекурсия', color: '#ec4899' } }),
        prisma.skill.upsert({ where: { name: 'Сети' }, update: {}, create: { name: 'Сети', description: 'TCP/IP, HTTP, DNS', color: '#14b8a6' } }),
        prisma.skill.upsert({ where: { name: 'HTML/CSS' }, update: {}, create: { name: 'HTML/CSS', description: 'Вёрстка веб-страниц', color: '#f97316' } }),
        prisma.skill.upsert({ where: { name: 'Git' }, update: {}, create: { name: 'Git', description: 'Система контроля версий', color: '#64748b' } }),
    ]);

    // Create demo teacher
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@teachera.io' },
        update: {},
        create: {
            email: 'teacher@teachera.io',
            name: 'Анна Петрова',
            passwordHash: teacherPassword,
            role: 'TEACHER',
        },
    });

    // Create demo student
    const studentPassword = await bcrypt.hash('student123', 12);
    const student = await prisma.user.upsert({
        where: { email: 'student@teachera.io' },
        update: {},
        create: {
            email: 'student@teachera.io',
            name: 'Иван Сидоров',
            passwordHash: studentPassword,
            role: 'STUDENT',
        },
    });

    // Create demo class
    const demoClass = await prisma.class.upsert({
        where: { inviteCode: 'DEMO01' },
        update: {},
        create: {
            name: '10-А Информатика',
            description: 'Основы программирования на Python',
            inviteCode: 'DEMO01',
            teacherId: teacher.id,
        },
    });

    // Add student to class
    await prisma.classMember.upsert({
        where: { userId_classId: { userId: student.id, classId: demoClass.id } },
        update: {},
        create: { userId: student.id, classId: demoClass.id },
    });

    // Create demo lecture
    await prisma.lecture.upsert({
        where: { id: 'demo-lecture-1' },
        update: {},
        create: {
            id: 'demo-lecture-1',
            classId: demoClass.id,
            title: 'Введение в Python',
            content: '# Введение в Python\n\nPython — это высокоуровневый язык программирования.\n\n## Первая программа\n\n```python\nprint("Hello, World!")\n```\n\n## Переменные\n\n```python\nname = "Иван"\nage = 16\nprint(f"Привет, {name}! Тебе {age} лет.")\n```',
            order: 0,
        },
    });

    console.log('✅ Seeding complete!');
    console.log('');
    console.log('Demo accounts:');
    console.log('  Teacher: teacher@teachera.io / teacher123');
    console.log('  Student: student@teachera.io / student123');
    console.log('  Class code: DEMO01');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
