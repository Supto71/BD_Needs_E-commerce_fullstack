const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.prisma')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = [...walkDir('src'), ...walkDir('prisma')];
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /bdneeds\.com(?!\.bd)/g;
    if (regex.test(content)) {
        content = content.replace(regex, 'bdneeds.com.bd');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
        count++;
    }
});
console.log('Done! Updated ' + count + ' files.');
