const fs = require('fs');

let code = fs.readFileSync('frontend/data/products.ts', 'utf8');

const ids = [
  'top-linen-shirt', 'top-ringer-tee', 'hoodie-grey', 'top-001', 'top-002', 'top-003',
  'hoodie-001', 'hoodie-002', 'jacket-001', 'jacket-002', 'jacket-003',
  'pants-001', 'pants-002', 'pants-003'
];

ids.forEach(id => {
  const pRegex = new RegExp("(id:\\s*'" + id + "'[\\s\\S]*?images:\\s*\\[)[\\s\\S]*?(\\])");
  code = code.replace(pRegex, (m, p1, p2) => {
    return p1 + "\n      '/images/products/" + id + ".jpg',\n    " + p2;
  });
});

fs.writeFileSync('frontend/data/products.ts', code, 'utf8');
console.log('Updated products.ts with local images successfully!');
