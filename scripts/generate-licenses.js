const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PREFIX = 'DAGANGI';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const count = Number(process.argv[2] || 100);

function checksum(payload) {
  let hash = 2166136261;
  for (const char of `${PREFIX}-${payload}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const first = hash % ALPHABET.length;
  const second = Math.floor(hash / ALPHABET.length) % ALPHABET.length;
  return `${ALPHABET[first]}${ALPHABET[second]}`;
}

function payload() {
  let output = '';
  const bytes = crypto.randomBytes(10);
  for (const byte of bytes) {
    output += ALPHABET[byte % ALPHABET.length];
  }
  return output;
}

function formatSerial(body) {
  return `${PREFIX}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

const keys = new Set();
while (keys.size < count) {
  const base = payload();
  keys.add(formatSerial(`${base}${checksum(base)}`));
}

const outDir = path.join(process.cwd(), 'licenses');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'dagangi-offline-licenses.txt');
fs.writeFileSync(outPath, `${Array.from(keys).join('\n')}\n`);
console.log(`Generated ${keys.size} licenses: ${outPath}`);
