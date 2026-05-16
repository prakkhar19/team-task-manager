const fs = require('fs');
const files = ['src/pages/Dashboard.tsx', 'src/pages/Projects.tsx', 'src/pages/ProjectBoard.tsx'];
for (const f of files) {
    let content = fs.readFileSync(f, 'utf-8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(f, content);
}
console.log('Fixed');
