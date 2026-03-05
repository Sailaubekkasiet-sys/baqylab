const fs = require('fs');

let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

const ruKeys = `
        'sandbox.title': 'Песочница',
        'sandbox.desc': 'Протестируйте свой код в браузере',
        'sandbox.runBtn': 'Запустить',
        'sandbox.running': 'Выполнение...',
        'sandbox.noOutput': 'Нет вывода',
        'sandbox.error': 'Ошибка выполнения',
        'sandbox.ready': 'Готово. Нажмите "Запустить" для выполнения.',
        'dash.errCreateClass': 'Ошибка при создании класса',
        'dash.createClassBtn': 'Создать класс',
        'class.nameLabel': 'Название класса',
        'class.exampleTitle': 'Например, Информатика 10А',
        'class.descLabel': 'Описание (необязательно)',
        'class.shortDesc': 'Краткое описание',
        'common.cancel': 'Отмена',`;

const kzKeys = `
        'sandbox.title': 'Құмсалғыш',
        'sandbox.desc': 'Кодты браузерде тексеріңіз',
        'sandbox.runBtn': 'Қосу',
        'sandbox.running': 'Орындалуда...',
        'sandbox.noOutput': 'Шығарылым жоқ',
        'sandbox.error': 'Орындалу қатесі',
        'sandbox.ready': 'Дайын. Орындау үшін «Қосу» түймесін басыңыз.',
        'dash.errCreateClass': 'Сыныпты жасау қатесі',
        'dash.createClassBtn': 'Сынып жасау',
        'class.nameLabel': 'Сынып атауы',
        'class.exampleTitle': 'Мысалы, Информатика 10А',
        'class.descLabel': 'Сипаттама (міндетті емес)',
        'class.shortDesc': 'Қысқаша сипаттама',
        'common.cancel': 'Болдырмау',`;

const enKeys = `
        'sandbox.title': 'Sandbox',
        'sandbox.desc': 'Test your code in the browser',
        'sandbox.runBtn': 'Run',
        'sandbox.running': 'Running...',
        'sandbox.noOutput': 'No output',
        'sandbox.error': 'Execution error',
        'sandbox.ready': 'Ready. Click "Run" to execute.',
        'dash.errCreateClass': 'Error creating class',
        'dash.createClassBtn': 'Create Class',
        'class.nameLabel': 'Class Name',
        'class.exampleTitle': 'e.g. Computer Science 10A',
        'class.descLabel': 'Description (Optional)',
        'class.shortDesc': 'Short description',
        'common.cancel': 'Cancel',`;

content = content.replace(/(\s+)('common\.loading': 'Загрузка\.\.\.',\s+)/, '$1$2' + ruKeys + '$1');
content = content.replace(/(\s+)('common\.loading': 'Жүктелуде\.\.\.',\s+)/, '$1$2' + kzKeys + '$1');
content = content.replace(/(\s+)('common\.loading': 'Loading\.\.\.',\s+)/, '$1$2' + enKeys + '$1');

fs.writeFileSync('src/lib/i18n.ts', content);
console.log("Translations added.");
