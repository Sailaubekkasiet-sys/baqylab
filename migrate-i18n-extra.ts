import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_PATH = path.join(__dirname, 'src/lib/i18n.ts');
const SRC_DIR = path.join(__dirname, 'src');
const IGNORED_FILES = [I18N_PATH, path.join(SRC_DIR, 'lib/auth.ts')];

const keyMap: Record<string, string> = {
    'Вы не состоите в этом классе': 'api.err.notInClass',
    'Лекция не найдена': 'api.err.lectureNotFound',
    'Загрузка...': 'common.loading',
    'Загрузка': 'common.loadingWord',
    'Работы': 'assign.reviewWorks',
    'Ответ скопирован': 'success.answerCopied',
    'Вопрос': 'assign.questionSingular',
    'Вариант': 'assign.optionSingular',
    'Email и пароль обязательны': 'auth.err.emailPasswordRequired',
    'Пользователь не найден': 'auth.err.userNotFound',
    'Неверный пароль': 'auth.err.invalidPassword',
    'Пользователь с таким email уже существует, возможно он зарегистрирован с другой ролью.': 'auth.err.emailExists',
    'Требуются email, пароль, имя и роль': 'auth.err.missingFields',
    'Пароль должен быть не менее 6 символов': 'auth.err.passwordLength',
    'Ошибка при регистрации': 'auth.err.registerError',
    'Ошибка на стороне сервера (AI)': 'bot.err.aiError',
    'Вы вошли как:': 'auth.loggedInAs',
    'Формат теста': 'assign.quizFormat',
    'Самопроверка перед сдачей': 'assign.selfCheck',
    'Пункт самопроверки': 'assign.selfCheckItem',
    'Добавить пункт': 'assign.addSelfCheck',
    'Создать задание': 'assign.create',
    'Добавить вариант': 'assign.addOption',
    'Добавить вопрос': 'assign.addQuestion',
    'Конструктор рубрик': 'assign.rubricBuilder',
    'Всего': 'assign.totalPoints',
    'Баллы': 'assign.points',
    'Название критерия': 'assign.criterionName',
    'Описание критерия': 'assign.criterionDesc',
    'Шкала': 'assign.scale',
    'Галочка': 'assign.checkbox',
    'Текст': 'assign.text',
    'Добавить критерий': 'assign.addCriterion',
    'Задавайте вопросы по информатике нашему Telegram-боту': 'bot.desc',
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
        'api.err.notInClass': { ru: 'Вы не состоите в этом классе', kz: 'Сіз бұл сыныпқа кірмегенсіз', en: 'You are not in this class' },
        'api.err.lectureNotFound': { ru: 'Лекция не найдена', kz: 'Дәріс табылмады', en: 'Lecture not found' },
        'assign.reviewWorks': { ru: 'Работы', kz: 'Жұмыстар', en: 'Works' },
        'common.loadingWord': { ru: 'Загрузка', kz: 'Жүктелуде', en: 'Loading' },
        'success.answerCopied': { ru: 'Ответ скопирован', kz: 'Жауап көшірілді', en: 'Answer copied' },
        'assign.questionSingular': { ru: 'Вопрос', kz: 'Сұрақ', en: 'Question' },
        'assign.optionSingular': { ru: 'Вариант', kz: 'Нұсқа', en: 'Option' },
        'auth.err.emailPasswordRequired': { ru: 'Email и пароль обязательны', kz: 'Email мен пароль міндетті', en: 'Email and password are required' },
        'auth.err.userNotFound': { ru: 'Пользователь не найден', kz: 'Пайдаланушы табылмады', en: 'User not found' },
        'auth.err.invalidPassword': { ru: 'Неверный пароль', kz: 'Құпия сөз қате', en: 'Invalid password' },
        'auth.err.emailExists': { ru: 'Пользователь с таким email уже существует, возможно он зарегистрирован с другой ролью.', kz: 'Мұндай email бар пайдаланушы тіркелген.', en: 'User with this email already exists, perhaps registered with another role.' },
        'auth.err.missingFields': { ru: 'Требуются email, пароль, имя и роль', kz: 'Email, құпия сөз, аты мен рөлі міндетті', en: 'Email, password, name, and role are required' },
        'auth.err.passwordLength': { ru: 'Пароль должен быть не менее 6 символов', kz: 'Құпия сөз кем дегенде 6 таңбадан тұруы тиіс', en: 'Password must be at least 6 characters' },
        'auth.err.registerError': { ru: 'Ошибка при регистрации', kz: 'Тіркелу кезінде қате', en: 'Registration error' },
        'bot.err.aiError': { ru: 'Ошибка на стороне сервера (AI)', kz: 'Сервер жағындағы қате (AI)', en: 'Server side error (AI)' },
        'auth.loggedInAs': { ru: 'Вы вошли как:', kz: 'Сіз ретінде кірдіңіз:', en: 'You are logged in as:' },
    };

    let modifiedFiles = 0;
    let i18nContent = fs.readFileSync(I18N_PATH, 'utf-8');

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        let fileChanged = false;

        const isServerApi = file.includes('/api/');
        const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
        let needsI18nHook = false;

        // Use a generic find-and-replace for these keys.
        // Similar to the first script, this applies the replaces directly.
        for (const [text, key] of Object.entries(keyMap)) {
            if (content.includes(text)) {
                if (file.endsWith('.tsx') && isClientComponent) {
                    content = content.replace(new RegExp(`>\\s*${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'), `>{t('${key}')}<`);
                    content = content.replace(new RegExp(`"${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}"`, 'g'), `t('${key}')`);
                    content = content.replace(new RegExp(`'${text.replace(/[.*+?^$\\{}()|[\]\\]/g, '\\$&')}'`, 'g'), `t('${key}')`);
                    needsI18nHook = true;
                } else if (file.endsWith('.tsx') && !isClientComponent) {
                    // Ignore for now and handle manually if needed
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
                // simple check
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
