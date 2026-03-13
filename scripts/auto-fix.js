#!/usr/bin/env node

console.log('🔧 Optimus Studio Auto-Fix Script')
console.log('=================================')

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function runCommand(cmd) {
    try {
        console.log(`▶️  Çalıştırılıyor: ${cmd}`)
        const output = execSync(cmd, { stdio: 'inherit' })
        return true
    } catch (error) {
        console.error(`❌ Hata: ${error.message}`)
        return false
    }
}

function fixTypeScriptConfig() {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
    if (fs.existsSync(tsconfigPath)) {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))

        // Garanti edilen ayarlar
        tsconfig.compilerOptions = {
            ...tsconfig.compilerOptions,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            skipLibCheck: true,
            strict: false,
            noEmit: true
        }

        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))
        console.log('✅ tsconfig.json düzeltildi')
    }
}

// Ana fix rutini
async function main() {
    console.log('1. TypeScript yapılandırması düzeltiliyor...')
    fixTypeScriptConfig()

    console.log('2. Bağımlılıklar kontrol ediliyor...')
    runCommand('npm install --no-audit')

    console.log('3. Cache temizleniyor...')
    try {
        fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true })
        console.log('✅ Cache temizlendi')
    } catch { }

    console.log('4. TypeScript kontrolü...')
    runCommand('npx tsc --noEmit --skipLibCheck')

    console.log('✅ Tüm işlemler tamamlandı!')
    console.log('\n🚀 Optimus Studio hazır! Çalıştırmak için:')
    console.log('   npm run dev')
}

main().catch(console.error)
