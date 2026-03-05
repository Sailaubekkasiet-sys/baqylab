import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_PATH = path.join(__dirname, 'src/lib/i18n.ts');
const SRC_DIR = path.join(__dirname, 'src');

const keyMap: Record<string, string> = {
    '← Назад к классу':'class.backToClass',
    'В экзаменационном режиме вставка кода запрещена!':'assign.pasteDisabled',
    'Напишите ваш код на ':'assign.writeCodeOn',
    ' здесь...':'assign.here',
    'Ответить':'comment.reply',
    'Отменить ответ':'comment.cancelReply',
    'Комментарий к строке ':'comment.lineToLine',
    'Ошибка создания класса':'dash.errCreateClass',
    'Вы присоединились к классу "':'join.successJoined',
    'Ошибка подключения':'join.errConnect',
    'Анонимный ученик':'class.anonStudent',
    'Скачать':'class.download',
    'Самопроверка':'assign.selfCheck',
    'Выполните все обязательные пункты':'assign.completeRequired',
    '(Верно)':'quiz.correct',
    '(Неверно)':'quiz.incorrect',
    'Задать вопрос или оставить комментарий':'comment.askOrLeave',
    'Ответить на комментарий':'comment.replyToTitle',
    'Оценено':'review.graded',
    'Ожидает':'review.pendingStatus',
    'Отправлено':'review.submitted',
    'Ваш комментарий...':'comment.placeholder',
    'Ваш развернутый ответ...':'assign.detailedAnswer',
    'Введение в массивы':'lecture.introArrays',
    'Введите 6-значный код, который вам дал учитель':'join.enterCode',
    'Введите email и пароль для входа':'auth.enterCredentials',
    'Версия ':'review.version',
    'Вложения:':'assign.attachments',
    'Вопрос/Тема:':'bot.questionTopic',
    'Вопросы и ответы':'comment.qa',
    'Вход в BaqyLab':'auth.loginBaqyLab',
    'Вы ещё не отправляли работы':'assign.notSubmittedYet',
    'Добавить в галерею "Лучших решений"':'review.addBestSolution',
    'Зарегистрироваться':'auth.registerAction',
    'Итоговые баллы:':'review.totalPoints',
    'Итоговый балл:':'review.finalScore',
    'Комментарии по коду:':'review.codeComments',
    'Комментарий к критерию (необязательно)...':'review.criterionComment',
    'Краткое описание курса...':'class.shortDesc',
    'Навыки':'nav.skills',
    'Например, ссылка на Google Документ или GitHub...':'assign.linkExample',
    'Например: A3F7K2':'join.codeExample',
    'Нет аккаунта? ':'auth.noAccount',
    'Новая лекция':'class.newLecture',
    'Обязательно':'assign.required',
    'Ответ: ':'quiz.answer',
    'Отправить решение':'assign.submitSolution',
    'Оценка по критериям':'review.gradingCriteria',
    'Пока нет комментариев. Будьте первыми!':'comment.noComments',
    'Преподаватель':'role.teacher',
    'Прикрепить ссылку или файл (необязательно)':'assign.attachFileOpt',
    'Присоединиться':'nav.join',
    'Работ пока нет':'review.noWorks',
    'Решение':'assign.solution',
    'Сохранить оценку':'review.saveGrade',
    'Текст вопроса':'quiz.questionText',
    'Уровень ':'dash.levelTitle',
    'Успеваемость: ':'analytics.performanceLine',
    'Учитель: ':'class.teacherLine',
    'Экзамен':'assign.examType',
    'например, 10-А Информатика':'class.exampleTitle',
    'Ваше решение':'assign.yourSolution'
};

function getFiles(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            if (fullPath !== I18N_PATH) {
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
        'class.backToClass': { ru: '← Назад к классу', kz: '← Сыныпқа қайту', en: '← Back to class' },
        'assign.pasteDisabled': { ru: 'В экзаменационном режиме вставка кода запрещена!', kz: 'Емтихан режимінде код кірістіруге тыйым салынған!', en: 'Pasting code is disabled in exam mode!' },
        'assign.writeCodeOn': { ru: 'Напишите ваш код на ', kz: 'Кодыңызда жазыңыз ', en: 'Write your code in ' },
        'assign.here': { ru: ' здесь...', kz: ' осында...', en: ' here...' },
        'comment.reply': { ru: 'Ответить', kz: 'Жауап беру', en: 'Reply' },
        'comment.cancelReply': { ru: 'Отменить ответ', kz: 'Жауапты болдырмау', en: 'Cancel reply' },
        'comment.lineToLine': { ru: 'Комментарий к строке ', kz: 'Жолға түсініктеме ', en: 'Comment to line ' },
        'dash.errCreateClass': { ru: 'Ошибка создания класса', kz: 'Сыныпты жасау қатесі', en: 'Error creating class' },
        'join.successJoined': { ru: 'Вы присоединились к классу "', kz: 'Сіз сыныпқа қосылдыңыз "', en: 'You joined the class "' },
        'join.errConnect': { ru: 'Ошибка подключения', kz: 'Қосылу қатесі', en: 'Connection error' },
        'assign.selfCheck': { ru: 'Самопроверка', kz: 'Өзін-өзі тексеру', en: 'Self-check' },
        'assign.completeRequired': { ru: 'Выполните все обязательные пункты', kz: 'Барлық міндетті пункттерді орындаңыз', en: 'Complete all required items' },
        'quiz.correct': { ru: '(Верно)', kz: '(Дұрыс)', en: '(Correct)' },
        'quiz.incorrect': { ru: '(Неверно)', kz: '(Қате)', en: '(Incorrect)' },
        'comment.askOrLeave': { ru: 'Задать вопрос или оставить комментарий', kz: 'Сұрақ қою немесе түсініктеме қалдыру', en: 'Ask a question or leave a comment' },
        'comment.replyToTitle': { ru: 'Ответить на комментарий', kz: 'Түсініктемеге жауап беру', en: 'Reply to comment' },
        'review.graded': { ru: 'Оценено', kz: 'Бағаланды', en: 'Graded' },
        'review.pendingStatus': { ru: 'Ожидает', kz: 'Күтуде', en: 'Pending' },
        'review.submitted': { ru: 'Отправлено', kz: 'Жіберілді', en: 'Submitted' },
        'comment.placeholder': { ru: 'Ваш комментарий...', kz: 'Сіздің түсініктемеңіз...', en: 'Your comment...' },
        'assign.detailedAnswer': { ru: 'Ваш развернутый ответ...', kz: 'Сіздің толық жауабыңыз...', en: 'Your detailed answer...' },
        'lecture.introArrays': { ru: 'Введение в массивы', kz: 'Массивтерге кіріспе', en: 'Introduction to Arrays' },
        'join.enterCode': { ru: 'Введите 6-значный код, который вам дал учитель', kz: 'Мұғалім берген 6 таңбалы кодты енгізіңіз', en: 'Enter the 6-digit code your teacher gave you' },
        'auth.enterCredentials': { ru: 'Введите email и пароль для входа', kz: 'Кіру үшін email мен құпия сөзді енгізіңіз', en: 'Enter email and password to login' },
        'review.version': { ru: 'Версия ', kz: 'Нұсқа ', en: 'Version ' },
        'assign.attachments': { ru: 'Вложения:', kz: 'Қосымшалар:', en: 'Attachments:' },
        'bot.questionTopic': { ru: 'Вопрос/Тема:', kz: 'Сұрақ/Тақырып:', en: 'Question/Topic:' },
        'comment.qa': { ru: 'Вопросы и ответы', kz: 'Сұрақ-жауап', en: 'Q&A' },
        'auth.loginBaqyLab': { ru: 'Вход в BaqyLab', kz: 'BaqyLab-ға кіру', en: 'Login to BaqyLab' },
        'assign.notSubmittedYet': { ru: 'Вы ещё не отправляли работы', kz: 'Сіз әлі жұмыс жіберген жоқсыз', en: 'You haven\'t submitted any works yet' },
        'review.addBestSolution': { ru: 'Добавить в галерею "Лучших решений"', kz: '"Ең жақсы шешімдер" галереясына қосу', en: 'Add to "Best Solutions" gallery' },
        'auth.registerAction': { ru: 'Зарегистрироваться', kz: 'Тіркелу', en: 'Register' },
        'review.totalPoints': { ru: 'ИтоговbIe баллы:', kz: 'Қорытынды ұпайлар:', en: 'Total points:' },
        'review.finalScore': { ru: 'Итоговый балл:', kz: 'Қорытынды балл:', en: 'Final score:' },
        'review.codeComments': { ru: 'Комментарии по коду:', kz: 'Код бойынша түсініктемелер:', en: 'Code comments:' },
        'review.criterionComment': { ru: 'Комментарий к критерию (необязательно)...', kz: 'Критерийге түсініктеме (міндетті емес)...', en: 'Criterion comment (optional)...' },
        'class.shortDesc': { ru: 'Краткое описание курса...', kz: 'Курстың қысқаша сипаттамасы...', en: 'Short course description...' },
        'assign.linkExample': { ru: 'Например, ссылка на Google Документ или GitHub...', kz: 'Мысалы, Google Document немесе GitHub сілтемесі...', en: 'E.g., link to Google Doc or GitHub...' },
        'join.codeExample': { ru: 'Например: A3F7K2', kz: 'Мысалы: A3F7K2', en: 'E.g.: A3F7K2' },
        'class.newLecture': { ru: 'Новая лекция', kz: 'Жаңа дәріс', en: 'New lecture' },
        'assign.required': { ru: 'Обязательно', kz: 'Міндетті', en: 'Required' },
        'quiz.answer': { ru: 'Ответ: ', kz: 'Жауап: ', en: 'Answer: ' },
        'assign.submitSolution': { ru: 'Отправить решение', kz: 'Шешімді жіберу', en: 'Submit solution' },
        'review.gradingCriteria': { ru: 'Оценка по критериям', kz: 'Критерийлер бойынша бағалау', en: 'Grading criteria' },
        'comment.noComments': { ru: 'Пока нет комментариев. Будьте первыми!', kz: 'Әзірге түсініктемелер жоқ. Бірінші болыңыз!', en: 'No comments yet. Be the first!' },
        'assign.attachFileOpt': { ru: 'Прикрепить ссылку или файл (необязательно)', kz: 'Сілтеме немесе файл қосу (міндетті емес)', en: 'Attach link or file (optional)' },
        'review.noWorks': { ru: 'Работ пока нет', kz: 'Жұмыстар әзірге жоқ', en: 'No works yet' },
        'review.saveGrade': { ru: 'Сохранить оценку', kz: 'Бағаны сақтау', en: 'Save grade' },
        'quiz.questionText': { ru: 'Текст вопроса', kz: 'Сұрақ мәтіні', en: 'Question text' },
        'dash.levelTitle': { ru: 'Уровень ', kz: 'Деңгей ', en: 'Level ' },
        'analytics.performanceLine': { ru: 'Успеваемость: ', kz: 'Үлгерім: ', en: 'Performance: ' },
        'class.teacherLine': { ru: 'Учитель: ', kz: 'Мұғалім: ', en: 'Teacher: ' },
        'assign.examType': { ru: 'Экзамен', kz: 'Емтихан', en: 'Exam' },
        'class.exampleTitle': { ru: 'например, 10-А Информатика', kz: 'мысалы, 10-А Информатика', en: 'e.g., 10-A Computer Science' },
        'assign.yourSolution': { ru: 'Ваше решение', kz: 'Сіздің шешіміңіз', en: 'Your solution' },
        'auth.noAccount': { ru: 'Нет аккаунта? ', kz: 'Аккаунт жоқ па? ', en: 'No account? ' }
    };

    let modifiedFiles = 0;
    let i18nContent = fs.readFileSync(I18N_PATH, 'utf-8');

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        let fileChanged = false;

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
                } else {
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
