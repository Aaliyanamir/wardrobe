const fs = require('fs');

const content = fs.readFileSync('frontend/data/products.ts', 'utf8');
const regex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?images:\s*\[([\s\S]*?)\]/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const id = match[1];
  const name = match[2];
  const category = match[3];
  const images = match[4].match(/https:[^'\s]+/g) || [];
  console.log(`[${category}] ${id} - ${name}: ${images[0]}`);
}
