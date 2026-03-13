const fs = require('fs');
const path = require('path');

// Tum src dosyalarini tara
function getAllFiles(dir, ext = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (item === 'node_modules' || item === '.next' || item === '.git') continue;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) results = results.concat(getAllFiles(full, ext));
      else if (ext.some(e => full.endsWith(e))) results.push(full);
    }
  } catch(e) {}
  return results;
}

// Import'lari cek
function extractImports(file) {
  const content = fs.readFileSync(file, 'utf8');
  const imports = new Set();
  
  // import ... from 'package'
  const re1 = /(?:import|from)\s+['"]([^./][^'"]*)['"]/g;
  // require('package')
  const re2 = /require\s*\(\s*['"]([^./][^'"]*)['"]\s*\)/g;
  // dynamic import('package')
  const re3 = /import\s*\(\s*['"]([^./][^'"]*)['"]\s*\)/g;
  
  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(content)) !== null) {
      let pkg = m[1];
      // @scope/package durumu
      if (pkg.startsWith('@')) {
        pkg = pkg.split('/').slice(0, 2).join('/');
      } else {
        pkg = pkg.split('/')[0];
      }
      imports.add(pkg);
    }
  }
  return imports;
}

// Node.js built-in modulleri (bunlar yuklenmeye gerek yok)
const builtins = new Set([
  'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'util',
  'stream', 'events', 'buffer', 'querystring', 'child_process',
  'net', 'tls', 'dns', 'dgram', 'cluster', 'readline', 'zlib',
  'assert', 'vm', 'worker_threads', 'perf_hooks', 'async_hooks',
  'string_decoder', 'timers', 'tty', 'v8', 'process',
  'node:fs', 'node:path', 'node:os', 'node:crypto', 'node:http',
  'node:https', 'node:url', 'node:util', 'node:stream', 'node:events',
  'node:buffer', 'node:child_process', 'node:net', 'node:zlib',
  'node:readline', 'node:worker_threads', 'node:process',
  'react', 'react-dom', 'next', 'react/jsx-runtime', 'react/jsx-dev-runtime'
]);

// package.json oku
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const installed = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.optionalDependencies || {})
]);

// Tum dosyalari tara
const files = getAllFiles('src');
console.log(`Taranan dosya sayisi: ${files.length}\n`);

const allImports = new Set();
for (const f of files) {
  const imports = extractImports(f);
  for (const imp of imports) allImports.add(imp);
}

// Eksik olanlari bul
const missing = [];
for (const imp of [...allImports].sort()) {
  if (builtins.has(imp)) continue;
  if (imp.startsWith('next/')) continue;
  if (imp.startsWith('react/')) continue;
  if (imp.startsWith('react-dom/')) continue;
  if (installed.has(imp)) continue;
  // @ ile baslayan alt-paketler
  if (imp.startsWith('@/')) continue; // path alias
  missing.push(imp);
}

console.log('=== EKSIK BAGIMLILIKLAR ===');
if (missing.length === 0) {
  console.log('Hicbir eksik bagimlili yok!');
} else {
  console.log(`Toplam ${missing.length} eksik paket:\n`);
  missing.forEach(m => console.log(`  ${m}`));
  console.log(`\n=== TEK KOMUTLA YUKLE ===`);
  console.log(`npm install ${missing.join(' ')} --legacy-peer-deps`);
}

console.log('\n=== KURULU AMA KULLANILMAYAN ===');
const used = new Set([...allImports].map(i => i.startsWith('@') ? i.split('/').slice(0,2).join('/') : i.split('/')[0]));
const unused = [...installed].filter(i => !used.has(i) && !i.startsWith('@types/'));
if (unused.length > 0) {
  unused.forEach(u => console.log(`  ${u}`));
}
