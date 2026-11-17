const data = require('fs').readFileSync('frontend/public/models/avatar.glb');
// Find the JSON chunk in GLB (after 12-byte binary header + 8-byte chunk header)
let offset = 12;
while (offset < data.length) {
  const chunkLen = data.readUInt32LE(offset);
  const chunkType = data.readUInt32LE(offset + 4);
  if (chunkType === 0x4E4F534A) { // JSON
    const json = JSON.parse(data.slice(offset + 8, offset + 8 + chunkLen).toString('utf8'));
    const nodes = json.nodes || [];
    const armNodes = nodes.filter(n => n.name && /arm|hand|fore/i.test(n.name));
    armNodes.forEach(n => console.log(n.name));
    break;
  }
  offset += 8 + chunkLen;
}
