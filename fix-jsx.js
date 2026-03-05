const fs = require('fs');
const glob = require('glob');

const files = [
    'src/app/classes/[id]/assignments/[aid]/page.tsx',
    'src/app/classes/[id]/assignments/new/page.tsx',
    'src/app/classes/[id]/lectures/[lid]/page.tsx',
    'src/app/classes/[id]/lectures/new/page.tsx',
    'src/app/classes/[id]/page.tsx',
    'src/app/classes/new/page.tsx',
    'src/app/join/page.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix props missing braces: label=t('foo') -> label={t('foo')}
    content = content.replace(/([a-zA-Z0-9_]+)=t\('([^']+)'\)/g, '$1={t(\'$2\')}');

    // Fix text missing braces: >t('foo')< -> >{t('foo')}<
    content = content.replace(/>\s*t\('([^']+)'\)\s*</g, '>{t(\'$1\')}<');

    // Fix cases where it's next to other JSX elements or tags like />t('foo')<
    content = content.replace(/\/>\s*t\('([^']+)'\)\s*</g, '/>{t(\'$1\')}<');
    content = content.replace(/\s+t\('([^']+)'\)\s+<\/h1>/g, ' {t(\'$1\')} </h1>');
    content = content.replace(/<\/svg>\s*t\('([^']+)'\)\s*<\/h1>/g, '</svg>{t(\'$1\')}</h1>');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Fixed", file);
    }
}
