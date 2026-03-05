import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script aims to find all Cyrillic strings in the codebase, 
// extract them, generate keys, add them to i18n.ts, and replace them in the source code.

const I18N_PATH = path.join(__dirname, 'src/lib/i18n.ts');
const SRC_DIR = path.join(__dirname, 'src');

const IGNORED_FILES = [I18N_PATH, path.join(SRC_DIR, 'lib/auth.ts')];

const keyMap: Record<string, string> = {
    'Светлая': 'theme.light',
    'Тёмная': 'theme.dark',
    'Системная': 'theme.system',
    'Запуск кода...': 'sandbox.running',
    'Нет вывода': 'sandbox.noOutput',
    'Произошла ошибка при запуске кода.': 'sandbox.error',
    'Песочница (Sandbox)': 'sandbox.title',
    'Свободная среда для экспериментов с кодом. Этот код никуда не отправляется.': 'sandbox.desc',
    'Запустить': 'sandbox.runBtn',
    'Готово. Нажмите "Запустить" для выполнения.': 'sandbox.ready',
    'Ошибка выполнения': 'api.err.exec',
    'Код не передан': 'api.err.noCode',
    'Неподдерживаемый язык': 'api.err.lang',
    'Ученики в зоне риска': 'analytic.risk',
    'Сложные темы (Навыки)': 'analytic.weak',
    'Средний балл': 'analytic.avg',
    'Сдано работ': 'analytic.submitted',
    'Подозрений': 'analytic.suspicious',
    'Скачать оценки (CSV)': 'analytic.downloadCsv',
    'Все ученики справляются!': 'analytic.allGood',
    'Недостаточно данных.': 'analytic.noData',
    'Успеваемость:': 'analytic.performance',
    'Сбор аналитики...': 'analytic.gathering',
    'Нет данных для аналитики': 'analytic.noDataError',
    'Лекция': 'class.lecture',
    'Задание': 'class.assignment',
    'Лекций пока нет': 'class.noLectures',
    'Заданий пока нет': 'class.noAssignments',
    'Учеников пока нет. Поделитесь кодом класса!': 'class.noStudents',
    'Создана:': 'class.created',
    'Срок:': 'class.deadline',
    'критериев': 'class.criteriaCount',
    'работ': 'class.worksCount',
    'Учитель:': 'class.teacherName',
    'Материалы пока не загружены': 'class.noMaterials',
    'Скачать': 'class.download',
    'Загрузить файл': 'class.uploadFile',
    'Анонимная проверка': 'assign.anonCheck',
    'Имена учеников будут скрыты при проверке работ': 'assign.anonCheckDesc',
    'Режим экзамена (Anti-cheat)': 'assign.examMode',
    'Запрещает вставку кода при выполнении задания': 'assign.examModeDesc',
    'Напишите развернутый ответ на тему...': 'assign.textPlaceholder',
    'Например: Задание 1': 'assign.titlePlaceholder',
    'Напишите описание...': 'assign.descPlaceholder',
    'Ошибка создания задания': 'assign.errCreate',
    'Лучшее решение': 'class.bestSolution',
    'Анонимный ученик': 'class.anonStudent',
    'Отличное выполнение теста.': 'class.quizExcellent',
    'Учитель пока не отметил ни одной работы как лучшее решение.': 'class.noBestSolutions',
    'Галерея лучших решений': 'class.tabs.gallery',
    'Ожидает проверки': 'review.pending',
    'Проверено': 'review.done',
    'Отклонено': 'review.rejected',
    'Черновик': 'review.draft',
    'Оценка:': 'review.grade',
    'Тесты пройдены': 'review.testsPassed',
    'Тесты не пройдены': 'review.testsFailed',
    'комментарий': 'review.comment',
    'баллов': 'review.pointsCount',
    'Редактировать': 'common.edit',
    'Удалить': 'common.delete',
    'Добавить': 'common.add',
    'Отправить': 'common.send',
    'Назад': 'common.back',
    'Вперед': 'common.forward',
    'Поиск классов...': 'dash.searchClass',
    'Ожидание кода...': 'dash.waitingCode',
    'Скрыть код': 'dash.hideCode',
    'Вы не состоите ни в одном классе. Создайте свой первый класс или присоединитесь по коду!': 'dash.noClassesMessage',
    'Класс не найден': 'class.notFound',
    'Навыки': 'skills.title',
    'Пока нет навыков': 'skills.empty',
    'Материал загружен': 'material.uploaded',
    'Отмена': 'common.cancel',
    'Неверный код доступа': 'api.err.invalidCode',
    'Вы уже состоите в этом классе': 'api.err.alreadyJoined',
    'Задание не найдено': 'api.err.assignNotFound',
    'Присоединиться': 'common.joinButton',
    'Введите код класса': 'join.inputCode',
    'Все материалы': 'material.all',
    'Ваши баллы': 'grades.yourPoints',
    'Пока нет оценок': 'grades.noGrades',
    'Файл не найден': 'api.err.fileNotFound',
    'Ваш ответ сохранен.': 'review.saved',
    'Код не вставлен': 'error.noCodeInserted',
    'Код скопирован': 'success.codeCopied',
    'Отсутствует описание': 'assign.missingDesc',
    'Тип файла не поддерживается': 'api.err.invalidFileType',
    'Не удалось сохранить материал': 'api.err.saveMaterialError',
    'Неизвестная ошибка': 'api.err.unknown',
    'Ошибка сервера': 'api.err.server',
    'Нет доступа': 'api.err.forbidden',
    'Не авторизован': 'api.err.unauthorized',
    'Название': 'common.name',
    'Описание': 'common.description',
    'Успех': 'common.success',
    'Сдать работу': 'assign.submitWork',
    'Загрузите решение': 'assign.uploadSolution',
    'Вернуться назад': 'common.goBack',
    'Код доступа': 'class.accessCode',
    'Все классы': 'dash.allClasses',
    'Вам нужно войти': 'auth.needLogin',
};

// Utility to find all ts/tsx files
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
        'theme.light': { ru: 'Светлая', kz: 'Ашық', en: 'Light' },
        'theme.dark': { ru: 'Тёмная', kz: 'Қараңғы', en: 'Dark' },
        'theme.system': { ru: 'Системная', kz: 'Жүйелік', en: 'System' },
        'sandbox.running': { ru: 'Запуск кода...', kz: 'Код іске қосылуда...', en: 'Running code...' },
        'sandbox.noOutput': { ru: 'Нет вывода', kz: 'Нәтиже жоқ', en: 'No output' },
        'sandbox.error': { ru: 'Произошла ошибка при запуске кода.', kz: 'Кодты іске қосу кезінде қате пайда болды.', en: 'An error occurred while running the code.' },
        'sandbox.title': { ru: 'Песочница (Sandbox)', kz: 'Құмсалғыш (Sandbox)', en: 'Sandbox' },
        'sandbox.desc': { ru: 'Свободная среда для экспериментов с кодом. Этот код никуда не отправляется.', kz: 'Кодпен тәжірибе жасауға арналған еркін орта. Бұл код ешқайда жіберілмейді.', en: 'A free environment for experimenting with code. This code is not sent anywhere.' },
        'sandbox.runBtn': { ru: 'Запустить', kz: 'Іске қосу', en: 'Run' },
        'sandbox.ready': { ru: 'Готово. Нажмите "Запустить" для выполнения.', kz: 'Дайын. Орындау үшін "Іске қосу" түймесін басыңыз.', en: 'Ready. Click "Run" to execute.' },
        'api.err.exec': { ru: 'Ошибка выполнения', kz: 'Орындау қатесі', en: 'Execution error' },
        'api.err.noCode': { ru: 'Код не передан', kz: 'Код берілмеген', en: 'No code provided' },
        'api.err.lang': { ru: 'Неподдерживаемый язык', kz: 'Қолдау көрсетілмейтін тіл', en: 'Unsupported language' },
        'analytic.risk': { ru: 'Ученики в зоне риска', kz: 'Қауіп төнген оқушылар', en: 'Students at risk' },
        'analytic.weak': { ru: 'Сложные темы (Навыки)', kz: 'Күрделі тақырыптар (Дағдылар)', en: 'Weak topics (Skills)' },
        'analytic.avg': { ru: 'Средний балл', kz: 'Орташа балл', en: 'Average score' },
        'analytic.submitted': { ru: 'Сдано работ', kz: 'Тапсырылған жұмыстар', en: 'Submitted works' },
        'analytic.suspicious': { ru: 'Подозрений', kz: 'Күдіктер', en: 'Suspicious' },
        'analytic.downloadCsv': { ru: 'Скачать оценки (CSV)', kz: 'Бағаларды жүктеу (CSV)', en: 'Download grades (CSV)' },
        'analytic.allGood': { ru: 'Все ученики справляются!', kz: 'Барлық оқушылар жақсы оқып жатыр!', en: 'All students are doing well!' },
        'analytic.noData': { ru: 'Недостаточно данных.', kz: 'Деректер жеткіліксіз.', en: 'Not enough data.' },
        'analytic.performance': { ru: 'Успеваемость:', kz: 'Үлгерім:', en: 'Performance:' },
        'analytic.gathering': { ru: 'Сбор аналитики...', kz: 'Аналитиканы жинау...', en: 'Gathering analytics...' },
        'analytic.noDataError': { ru: 'Нет данных для аналитики', kz: 'Аналитика үшін деректер жоқ', en: 'No data for analytics' },
        'class.lecture': { ru: 'Лекция', kz: 'Дәріс', en: 'Lecture' },
        'class.assignment': { ru: 'Задание', kz: 'Тапсырма', en: 'Assignment' },
        'class.noLectures': { ru: 'Лекций пока нет', kz: 'Дәрістер әзірге жоқ', en: 'No lectures yet' },
        'class.noAssignments': { ru: 'Заданий пока нет', kz: 'Тапсырмалар әзірге жоқ', en: 'No assignments yet' },
        'class.noStudents': { ru: 'Учеников пока нет. Поделитесь кодом класса!', kz: 'Оқушылар әзірге жоқ. Сынып кодымен бөлісіңіз!', en: 'No students yet. Share the class code!' },
        'class.created': { ru: 'Создана:', kz: 'Жасалынған:', en: 'Created:' },
        'class.deadline': { ru: 'Срок:', kz: 'Мерзімі:', en: 'Deadline:' },
        'class.criteriaCount': { ru: 'критериев', kz: 'критерийлер', en: 'criteria' },
        'class.worksCount': { ru: 'работ', kz: 'жұмыстар', en: 'works' },
        'class.teacherName': { ru: 'Учитель:', kz: 'Мұғалім:', en: 'Teacher:' },
        'class.noMaterials': { ru: 'Материалы пока не загружены', kz: 'Материалдар әлі жүктелген жоқ', en: 'No materials uploaded yet' },
        'class.download': { ru: 'Скачать', kz: 'Жүктеу', en: 'Download' },
        'class.uploadFile': { ru: 'Загрузить файл', kz: 'Файлды жүктеу', en: 'Upload file' },
        'assign.anonCheck': { ru: 'Анонимная проверка', kz: 'Анонимді тексеру', en: 'Anonymous grading' },
        'assign.anonCheckDesc': { ru: 'Имена учеников будут скрыты при проверке работ', kz: 'Жұмыстарды тексеру кезінде оқушылардың аттары жасырылады', en: 'Student names will be hidden during grading' },
        'assign.examMode': { ru: 'Режим экзамена (Anti-cheat)', kz: 'Емтихан режимі (Anti-cheat)', en: 'Exam Mode (Anti-cheat)' },
        'assign.examModeDesc': { ru: 'Запрещает вставку кода при выполнении задания', kz: 'Тапсырманы орындау кезінде кодты кірістіруге тыйым салады', en: 'Prevents pasting code when completing the assignment' },
        'assign.textPlaceholder': { ru: 'Напишите развернутый ответ на тему...', kz: 'Тақырып бойынша толық жауап жазыңыз...', en: 'Write a detailed answer on the topic...' },
        'assign.titlePlaceholder': { ru: 'Например: Задание 1', kz: 'Мысалы: 1-тапсырма', en: 'E.g.: Assignment 1' },
        'assign.descPlaceholder': { ru: 'Напишите описание...', kz: 'Сипаттама жазыңыз...', en: 'Write a description...' },
        'assign.errCreate': { ru: 'Ошибка создания задания', kz: 'Тапсырманы жасау қатесі', en: 'Error creating assignment' },
        'class.bestSolution': { ru: 'Лучшее решение', kz: 'Ең жақсы шешім', en: 'Best solution' },
        'class.anonStudent': { ru: 'Анонимный ученик', kz: 'Анонимді оқушы', en: 'Anonymous student' },
        'class.quizExcellent': { ru: 'Отличное выполнение теста.', kz: 'Тестті тамаша орындау.', en: 'Excellent test execution.' },
        'class.noBestSolutions': { ru: 'Учитель пока не отметил ни одной работы как лучшее решение.', kz: 'Мұғалім әзірге ешбір жұмысты ең жақсы шешім ретінде белгілемеген.', en: 'The teacher has not marked any works as the best solution yet.' },
        'class.tabs.gallery': { ru: 'Галерея лучших решений', kz: 'Ең жақсы шешімдер галереясы', en: 'Best Solutions Gallery' },
        
        // newly added
        'dash.searchClass': { ru: 'Поиск классов...', kz: 'Сыныптарды іздеу...', en: 'Search classes...' },
        'dash.waitingCode': { ru: 'Ожидание кода...', kz: 'Кодты күту...', en: 'Waiting for code...' },
        'dash.hideCode': { ru: 'Скрыть код', kz: 'Кодты жасыру', en: 'Hide code' },
        'dash.noClassesMessage': { ru: 'Вы не состоите ни в одном классе. Создайте свой первый класс или присоединитесь по коду!', kz: 'Сіз ешбір сыныпқа кірмегенсіз. Алғашқы сыныбыңызды жасаңыз немесе код бойынша қосылыңыз!', en: 'You are not in any classes. Create your first class or join with a code!' },
        'class.notFound': { ru: 'Класс не найден', kz: 'Сынып табылмады', en: 'Class not found' },
        'skills.title': { ru: 'Навыки', kz: 'Дағдылар', en: 'Skills' },
        'skills.empty': { ru: 'Пока нет навыков', kz: 'Әзірге дағдылар жоқ', en: 'No skills yet' },
        'material.uploaded': { ru: 'Материал загружен', kz: 'Материал жүктелді', en: 'Material uploaded' },
        'common.cancel': { ru: 'Отмена', kz: 'Болдырмау', en: 'Cancel' },
        'api.err.invalidCode': { ru: 'Неверный код доступа', kz: 'Қол жеткізу коды қате', en: 'Invalid access code' },
        'api.err.alreadyJoined': { ru: 'Вы уже состоите в этом классе', kz: 'Сіз бұл сыныпқа кіргенсіз', en: 'You have already joined this class' },
        'api.err.assignNotFound': { ru: 'Задание не найдено', kz: 'Тапсырма табылмады', en: 'Assignment not found' },
        'common.joinButton': { ru: 'Присоединиться', kz: 'Қосылу', en: 'Join' },
        'join.inputCode': { ru: 'Введите код класса', kz: 'Сынып кодын енгізіңіз', en: 'Enter class code' },
        'material.all': { ru: 'Все материалы', kz: 'Барлық материалдар', en: 'All materials' },
        'grades.yourPoints': { ru: 'Ваши баллы', kz: 'Сіздің балдарыңыз', en: 'Your points' },
        'grades.noGrades': { ru: 'Пока нет оценок', kz: 'Әзірге бағалар жоқ', en: 'No grades yet' },
        'api.err.fileNotFound': { ru: 'Файл не найден', kz: 'Файл табылмады', en: 'File not found' },
        'review.saved': { ru: 'Ваш ответ сохранен.', kz: 'Сіздің жауабыңыз сақталды.', en: 'Your answer is saved.' },
        'error.noCodeInserted': { ru: 'Код не вставлен', kz: 'Код кірістірілмеген', en: 'Code not inserted' },
        'success.codeCopied': { ru: 'Код скопирован', kz: 'Код көшірілді', en: 'Code copied' },
        'assign.missingDesc': { ru: 'Отсутствует описание', kz: 'Сипаттамасы жоқ', en: 'Description missing' },
        'api.err.invalidFileType': { ru: 'Тип файла не поддерживается', kz: 'Файл түрі қолдау көрсетілмейді', en: 'File type not supported' },
        'api.err.saveMaterialError': { ru: 'Не удалось сохранить материал', kz: 'Материалды сақтау мүмкін болмады', en: 'Failed to save material' },
        'api.err.unknown': { ru: 'Неизвестная ошибка', kz: 'Белгісіз қате', en: 'Unknown error' },
        'api.err.server': { ru: 'Ошибка сервера', kz: 'Сервер қатесі', en: 'Server error' },
        'api.err.forbidden': { ru: 'Нет доступа', kz: 'Қол жеткізу мүмкін емес', en: 'Forbidden' },
        'api.err.unauthorized': { ru: 'Не авторизован', kz: 'Авторизацияланбаған', en: 'Unauthorized' },
        'common.name': { ru: 'Название', kz: 'Атауы', en: 'Name' },
        'common.description': { ru: 'Описание', kz: 'Сипаттамасы', en: 'Description' },
        'common.success': { ru: 'Успех', kz: 'Сәттілік', en: 'Success' },
        'assign.submitWork': { ru: 'Сдать работу', kz: 'Жұмысты тапсыру', en: 'Submit work' },
        'assign.uploadSolution': { ru: 'Загрузите решение', kz: 'Шешімді жүктеңіз', en: 'Upload solution' },
        'common.goBack': { ru: 'Вернуться назад', kz: 'Артқа қайту', en: 'Go back' },
        'class.accessCode': { ru: 'Код доступа', kz: 'Кіру коды', en: 'Access code' },
        'dash.allClasses': { ru: 'Все классы', kz: 'Барлық сыныптар', en: 'All classes' },
        'auth.needLogin': { ru: 'Вам нужно войти', kz: 'Сізге кіру қажет', en: 'You need to login' },
    };

    let modifiedFiles = 0;
    let i18nContent = fs.readFileSync(I18N_PATH, 'utf-8');

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        let fileChanged = false;

        const isServerApi = file.includes('/api/');
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
