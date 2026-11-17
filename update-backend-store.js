const fs = require('fs');
let code = fs.readFileSync('backend/data/store.js', 'utf8');

const ids = [
  'top-001', 'top-002', 'top-003',
  'hoodie-001', 'hoodie-002', 'jacket-001', 'jacket-002', 'jacket-003',
  'pants-001', 'pants-002', 'pants-003'
];

ids.forEach(id => {
  const pRegex = new RegExp("(id:\\s*'" + id + "'[\\s\\S]*?images:\\s*\\[)[\\s\\S]*?(\\])");
  code = code.replace(pRegex, (m, p1, p2) => {
    return p1 + "\n      '/images/products/" + id + ".jpg',\n    " + p2;
  });
});

fs.writeFileSync('backend/data/store.js', code, 'utf8');
console.log('Synced backend/data/store.js!');
