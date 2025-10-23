// Patch para @discordjs/voice aceitar sodium-javascript
const fs = require('fs');
const path = require('path');

const voiceIndexPath = path.join(__dirname, 'node_modules', '@discordjs', 'voice', 'dist', 'index.js');

console.log('🔧 Aplicando patch no @discordjs/voice...');

try {
    let voiceCode = fs.readFileSync(voiceIndexPath, 'utf8');
    
    // Procurar pela função chooseEncryptionMode
    if (voiceCode.includes('chooseEncryptionMode')) {
        console.log('✅ Função chooseEncryptionMode encontrada');
        
        // Adicionar fallback para aceitar qualquer modo de criptografia
        const patchCode = `
// PATCH: Aceitar qualquer modo de criptografia
const originalChooseEncryptionMode = chooseEncryptionMode;
function chooseEncryptionMode(options) {
    // Tentar os modos modernos primeiro
    const preferredModes = ['aead_aes256_gcm_rtpsize', 'aead_xchacha20_poly1305_rtpsize'];
    for (const mode of preferredModes) {
        if (options.includes(mode)) {
            console.log('[VOICE-PATCH] Usando modo:', mode);
            return mode;
        }
    }
    // Fallback: usar qualquer modo disponível
    if (options.length > 0) {
        console.log('[VOICE-PATCH] Usando modo fallback:', options[0]);
        return options[0];
    }
    throw new Error('Nenhum modo de criptografia disponível');
}
`;
        
        // Inserir patch antes da função chooseEncryptionMode
        voiceCode = voiceCode.replace(
            'function chooseEncryptionMode(',
            patchCode + '\nfunction chooseEncryptionMode_original('
        );
        
        fs.writeFileSync(voiceIndexPath, voiceCode);
        console.log('✅ Patch aplicado com sucesso!');
        console.log('💡 Reinicie o bot para aplicar as mudanças');
    } else {
        console.log('⚠️ Função chooseEncryptionMode não encontrada');
        console.log('💡 Talvez a versão do @discordjs/voice seja diferente');
    }
} catch (error) {
    console.error('❌ Erro ao aplicar patch:', error.message);
}

