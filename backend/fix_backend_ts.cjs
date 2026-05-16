const fs = require('fs');
const files = [
  'src/controllers/taskController.ts',
  'src/index.ts'
];
for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf-8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(f, content);
  }
}
console.log('Fixed backend TS issues');
