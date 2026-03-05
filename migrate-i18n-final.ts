import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_PATH = path.join(__dirname, 'src/lib/i18n.ts');
const SRC_DIR = path.join(__dirname, 'src');

const IGNORED_FILES = [I18N_PATH];

const keyMap: Record<string, string> = {
    'Создать класс': 'dash.createClassBtn',
    'Отмена': 'common.cancel',
    'Ваш прогресс по темам информатики': 'skills.progress_desc',
    'Навыки появятся после получения оценок': 'skills.appear_after',
    'баллов · ': 'skills.points_and',
    ' заданий': 'skills.tasks_count',
    'Ошибка регистрации': 'auth.err.registration',
    'Произошла ошибка. Попробуйте снова.': 'auth.err.tryAgain',
    'Регистрация': 'auth.registerLink',
    'Создайте аккаунт на BaqyLab': 'auth.createAccountDesc',
    'Имя': 'auth.name',
    'Иван Иванов': 'auth.namePlaceholder',
    'Пароль': 'auth.password',
    'Минимум 6 символов': 'auth.pwdPlaceholder',
    'Выберите роль': 'auth.selectRole',
    'Ученик': 'role.student',
    'Учусь и сдаю задания': 'auth.studentDesc',
    'Учитель': 'role.teacher',
    'Создаю курсы и оцениваю': 'auth.teacherDesc',
    'Создать аккаунт': 'auth.createAccount',
    'Войти': 'auth.loginBtn',
    'Уровень ': 'dash.level',
    'Программист-новичок': 'dash.novice',
    'До уровня ': 'dash.tillLevel',
    ' дней': 'dash.days',
    'Серия решений': 'dash.streak',
    'Мои Достижения': 'dash.achievements',
    'file и classId обязательны': 'api.err.fileClassRequired',
    'assignmentId обязателен': 'api.err.assignRequired',
    'Задание не найдено': 'api.err.assignNotFound',
    'Вы не в этом классе': 'api.err.notInClassShort',
    'Класс не найден': 'class.notFound',
    'Класс не найден или нет доступа': 'api.err.classNoAccess',
    'Ошибка сервера при сборе аналитики': 'api.err.serverAnalytics',
    'Только ученики могут присоединяться к классам': 'api.err.onlyStudentsJoin',
    'Код обязателен': 'api.err.codeRequired',
    'Класс с таким кодом не найден': 'api.err.classCodeNotFound',
    'Вы уже состоите в этом классе': 'api.err.alreadyJoined',
    'Только учитель может создавать классы': 'api.err.onlyTeacherCreate',
    'Название класса обязательно': 'api.err.classNameRequired',
    'Все поля обязательны': 'auth.err.allFieldsRequired',
    'Пароль должен содержать минимум 6 символов': 'auth.err.passwordLength',
    'Неверная роль': 'auth.err.invalidRole',
    'Пользователь с таким email уже существует': 'auth.err.emailExistsShort',
    'Внутренняя ошибка сервера': 'api.err.internalServer',
    'classId и title обязательны': 'api.err.classTitleRequired',
    'submissionId обязателен': 'api.err.submissionIdRequired',
    'Работа не найдена': 'api.err.workNotFound',
    'Оценок пока нет': 'grades.noGradesLong',
    ' · Версия #': 'grades.versionNum',
    'Email и пароль обязательны': 'auth.err.emailPasswordRequired',
    'Пользователь не найден': 'auth.err.userNotFound',
    'Неверный пароль': 'auth.err.invalidPassword'
};

function getFiles(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            if (!IGNORED_FILES.includes(fullPath)) {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

async function main() {
    const files = getFiles(SRC_DIR);
    console.log(`Analyzing ${files.length} files...`);

    const newTranslations: Record<string, { ru: string; kz: string; en: string }> = {
        'dash.createClassBtn': { ru: 'Создать класс', kz: 'Сынып жасау', en: 'Create class' },
        'common.cancel': { ru: 'Отмена', kz: 'Болдырмау', en: 'Cancel' },
        'skills.progress_desc': { ru: 'Ваш прогресс по темам информатики', kz: 'Информатика тақырыптары бойынша прогресіңіз', en: 'Your progress in computer science topics' },
        'skills.appear_after': { ru: 'Навыки появятся после получения оценок', kz: 'Дағдылар баға алғаннан кейін пайда болады', en: 'Skills will appear after receiving grades' },
        'skills.points_and': { ru: 'баллов · ', kz: 'ұпай · ', en: 'points · ' },
        'skills.tasks_count': { ru: ' заданий', kz: ' тапсырмалар', en: ' tasks' },
        'auth.err.registration': { ru: 'Ошибка регистрации', kz: 'Тіркелу қатесі', en: 'Registration error' },
        'auth.err.tryAgain': { ru: 'Произошла ошибка. Попробуйте снова.', kz: 'Қате пайда болды. Қайта көріңіз.', en: 'An error occurred. Try again.' },
        'auth.registerLink': { ru: 'Регистрация', kz: 'Тіркелу', en: 'Registration' },
        'auth.createAccountDesc': { ru: 'Создайте аккаунт на BaqyLab', kz: 'BaqyLab-да аккаунт жасаңыз', en: 'Create an account on BaqyLab' },
        'auth.name': { ru: 'Имя', kz: 'Аты', en: 'Name' },
        'auth.namePlaceholder': { ru: 'Иван Иванов', kz: 'Иван Иванов', en: 'John Doe' },
        'auth.password': { ru: 'Пароль', kz: 'Құпия сөз', en: 'Password' },
        'auth.pwdPlaceholder': { ru: 'Минимум 6 символов', kz: 'Кем дегенде 6 таңба', en: 'Minimum 6 characters' },
        'auth.selectRole': { ru: 'Выберите роль', kz: 'Рөлді таңдаңыз', en: 'Select role' },
        'role.student': { ru: 'Ученик', kz: 'Оқушы', en: 'Student' },
        'auth.studentDesc': { ru: 'Учусь и сдаю задания', kz: 'Оқимын және тапсырмалар тапсырамын', en: 'I study and submit assignments' },
        'role.teacher': { ru: 'Учитель', kz: 'Мұғалім', en: 'Teacher' },
        'auth.teacherDesc': { ru: 'Создаю курсы и оцениваю', kz: 'Курстар жасаймын және бағалаймын', en: 'I create courses and grade' },
        'auth.createAccount': { ru: 'Создать аккаунт', kz: 'Аккаунт жасау', en: 'Create account' },
        'auth.loginBtn': { ru: 'Войти', kz: 'Кіру', en: 'Sign in' },
        'dash.level': { ru: 'Уровень ', kz: 'Деңгей ', en: 'Level ' },
        'dash.novice': { ru: 'Программист-новичок', kz: 'Жаңадан бастаушы бағдарламашы', en: 'Novice programmer' },
        'dash.tillLevel': { ru: 'До уровня ', kz: 'Дейінгі деңгей ', en: 'To level ' },
        'dash.days': { ru: ' дней', kz: ' күн', en: ' days' },
        'dash.streak': { ru: 'Серия решений', kz: 'Шешімдер сериясы', en: 'Solution streak' },
        'dash.achievements': { ru: 'Мои Достижения', kz: 'Менің жетістіктерім', en: 'My Achievements' },
        'api.err.fileClassRequired': { ru: 'file и classId обязательны', kz: 'file мен classId міндетті', en: 'file and classId are required' },
        'api.err.assignRequired': { ru: 'assignmentId обязателен', kz: 'assignmentId міндетті', en: 'assignmentId is required' },
        'api.err.assignNotFound': { ru: 'Задание не найдено', kz: 'Тапсырма табылмады', en: 'Assignment not found' },
        'api.err.notInClassShort': { ru: 'Вы не в этом классе', kz: 'Сіз бұл сыныпта емессіз', en: 'You are not in this class' },
        'class.notFound': { ru: 'Класс не найден', kz: 'Сынып табылмады', en: 'Class not found' },
        'api.err.classNoAccess': { ru: 'Класс не найден или нет доступа', kz: 'Сынып табылмады немесе рұқсат жоқ', en: 'Class not found or no access' },
        'api.err.serverAnalytics': { ru: 'Ошибка сервера при сборе аналитики', kz: 'Аналитика жинау кезіндегі сервер қатесі', en: 'Server error while gathering analytics' },
        'api.err.onlyStudentsJoin': { ru: 'Только ученики могут присоединяться к классам', kz: 'Сыныптарға тек оқушылар қосыла алады', en: 'Only students can join classes' },
        'api.err.codeRequired': { ru: 'Код обязателен', kz: 'Код міндетті', en: 'Code is required' },
        'api.err.classCodeNotFound': { ru: 'Класс с таким кодом не найден', kz: 'Мұндай коды бар сынып табылмады', en: 'Class with this code not found' },
        'api.err.alreadyJoined': { ru: 'Вы уже состоите в этом классе', kz: 'Сіз бұл сыныпқа кіргенсіз', en: 'You have already joined this class' },
        'api.err.onlyTeacherCreate': { ru: 'Только учитель может создавать классы', kz: 'Сыныптарды тек мұғалім ғана жасай алады', en: 'Only a teacher can create classes' },
        'api.err.classNameRequired': { ru: 'Название класса обязательно', kz: 'Сынып атауы міндетті', en: 'Class name is required' },
        'auth.err.allFieldsRequired': { ru: 'Все поля обязательны', kz: 'Барлық өрістер міндетті', en: 'All fields are required' },
        'auth.err.passwordLength': { ru: 'Пароль должен содержать минимум 6 символов', kz: 'Құпия сөз кем дегенде 6 таңбадан тұруы тиіс', en: 'Password must contain at least 6 characters' },
        'auth.err.invalidRole': { ru: 'Неверная роль', kz: 'Қате рөл', en: 'Invalid role' },
        'auth.err.emailExistsShort': { ru: 'Пользователь с таким email уже существует', kz: 'Мұндай email бар пайдаланушы тіркелген', en: 'User with this email already exists' },
        'api.err.internalServer': { ru: 'Внутренняя ошибка сервера', kz: 'Ішкі сервер қатесі', en: 'Internal server error' },
        'api.err.classTitleRequired': { ru: 'classId и title обязательны', kz: 'classId мен title міндетті', en: 'classId and title are required' },
        'api.err.submissionIdRequired': { ru: 'submissionId обязателен', kz: 'submissionId міндетті', en: 'submissionId is required' },
        'api.err.workNotFound': { ru: 'Работа не найдена', kz: 'Жұмыс табылмады', en: 'Work not found' },
        'grades.noGradesLong': { ru: 'Оценок пока нет', kz: 'Әзірге бағалар жоқ', en: 'No grades yet' },
        'grades.versionNum': { ru: ' · Версия #', kz: ' · Нұсқа #', en: ' · Version #' },
        'auth.err.emailPasswordRequired': { ru: 'Email и пароль обязательны', kz: 'Email мен пароль міндетті', en: 'Email and password are required' },
        'auth.err.userNotFound': { ru: 'Пользователь не найден', kz: 'Пайдаланушы табылмады', en: 'User not found' },
        'auth.err.invalidPassword': { ru: 'Неверный пароль', kz: 'Құпия сөз қате', en: 'Invalid password' }
    };

    let modifiedFiles = 0;
    let i18nContent = fs.readFileSync(I18N_PATH, 'utf-8');

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        let fileChanged = false;

        const isServerApi = file.includes('/api/') || file.includes('lib/auth.ts');
        const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
        let needsI18nHook = false;

        for (const [text, key] of Object.entries(keyMap)) {
            if (content.includes(text)) {
                if (file.endsWith('.tsx') && isClientComponent) {
                    content = content.replace(new RegExp(`>\\s*${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'), `>{t('${key}')}<`);
                    content = content.replace(new RegExp(`"${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}"`, 'g'), `t('${key}')`);
                    content = content.replace(new RegExp(`'${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}'`, 'g'), `t('${key}')`);
                    needsI18nHook = true;
                } else if (file.endsWith('.tsx') && !isClientComponent) {
                    // Ignore
                } else if (isServerApi) {
                    content = content.replace(new RegExp(`"${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}"`, 'g'), `"${key}"`);
                    content = content.replace(new RegExp(`'${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}'`, 'g'), `'${key}'`);
                }
                fileChanged = true;
            }
        }

        if (fileChanged) {
            if (needsI18nHook && !content.includes('useI18n()') && !content.includes('useI18n')) {
                const depth = file.split(path.sep).length - SRC_DIR.split(path.sep).length;
                const importPath = depth === 1 ? './components/I18nProvider' : '@/components/I18nProvider';
                content = content.replace(/(import .* from .*;\n)+/, `$1import { useI18n } from '${importPath}';\n`);
            }
            fs.writeFileSync(file, content, 'utf-8');
            modifiedFiles++;
        }
    }

    // Append to i18n
    for (const locale of ['ru', 'kz', 'en'] as const) {
        const localeBlockRegex = new RegExp(`${locale}: \\{\\n([\\s\\S]*?)\\n\\s*\\},`);
        const match = i18nContent.match(localeBlockRegex);
        if (match) {
            let innerContent = match[1];
            for (const [key, tr] of Object.entries(newTranslations)) {
                if (!innerContent.includes(`'${key}':`)) {
                    innerContent += `\n        '${key}': '${tr[locale].replace(/'/g, "\\'")}',`;
                }
            }
            i18nContent = i18nContent.replace(match[0], `${locale}: {\n${innerContent}\n    },`);
        }
    }
    fs.writeFileSync(I18N_PATH, i18nContent, 'utf-8');

    console.log(`Modified ${modifiedFiles} files. Built new keys in i18n.`);
}

main().catch(console.error);
