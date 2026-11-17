// Check default rotation of arm bones in GLB
const data = require('fs').readFileSync('frontend/public/models/avatar.glb');
let offset = 12;
while (offset < data.length) {
  const chunkLen = data.readUInt32LE(offset);
  const chunkType = data.readUInt32LE(offset + 4);
  if (chunkType === 0x4E4F534A) {
    const json = JSON.parse(data.slice(offset + 8, offset + 8 + chunkLen).toString('utf8'));
    const nodes = json.nodes || [];
    ['LeftArm_27', 'RightArm_51', 'LeftForeArm_26', 'RightForeArm_50'].forEach(boneName => {
      const node = nodes.find(n => n.name === boneName);
      if (node) {
        console.log(boneName, 'rotation:', node.rotation, 'translation:', node.translation);
      }
    });
    break;
  }
  offset += 8 + chunkLen;
}
