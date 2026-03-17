const fs = require('fs');
const path = require('path');

function searchFiles(dir, files = []) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchFiles(fullPath, files);
        } else if (['page.tsx', 'layout.tsx', 'error.tsx', 'not-found.tsx'].includes(file)) {
            files.push(fullPath);
        }
    });
    return files;
}

const allFiles = searchFiles('c:/bacx/src/app');
const results = [];

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let title = '(Inherits default)';

    const defaultMatch = content.match(/title\s*:\s*\{[^}]*default\s*:\s*(['"])(.*?)\1/s);
    if (defaultMatch) {
        title = defaultMatch[2];
    } else {
        const simpleMatch = content.match(/title\s*:\s*(['"])(.*?)\1/);
        if (simpleMatch) {
            title = simpleMatch[2];
        } else {
            const tagMatch = content.match(/<title[^>]*>(.*?)<\/title>/);
            if (tagMatch) {
                title = tagMatch[1];
            }
        }
    }

    const relativePath = file.substring('c:/bacx/src/app'.length).replace(/\\/g, '/');

    let routePath = relativePath.replace(/\/page\.tsx$/, '');
    routePath = routePath.replace(/\/layout\.tsx$/, '/[layout]');
    routePath = routePath.replace(/\/error\.tsx$/, '/[error]');
    routePath = routePath.replace(/\/not-found\.tsx$/, '/[not-found]');

    if (relativePath === '/page.tsx') routePath = '/';
    if (relativePath === '/layout.tsx') routePath = '/[root-layout]';
    if (relativePath === '/error.tsx') routePath = '/[root-error]';
    if (relativePath === '/not-found.tsx') routePath = '/[root-not-found]';
    if (routePath === '') routePath = '/';

    results.push({
        Route: routePath,
        Title: title,
        FilePath: 'src/app' + relativePath
    });
});

results.sort((a, b) => a.FilePath.localeCompare(b.FilePath));

let md = '| Route Path | Current Title | Exact File Path |\n|---|---|---|\n';
results.forEach(r => {
    let titleStr = r.Title === '(Inherits default)' ? '*(Inherits default)*' : '`"' + r.Title + '"`';
    md += '| `' + r.Route + '` | ' + titleStr + ' | `' + r.FilePath + '` |\n';
});
console.log(md);
