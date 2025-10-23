// Configuração de voz usando sodium-javascript (implementação pura JS)
const sodium = require('sodium-javascript');

// Desabilitar tentativas de usar sodium-native
process.env.SODIUM_NATIVE = 'disable';

// Criar wrapper compatível com libsodium-wrappers
const sodiumWrapper = {
    ready: Promise.resolve(),
    
    // Constantes
    crypto_secretbox_KEYBYTES: sodium.crypto_secretbox_KEYBYTES,
    crypto_secretbox_NONCEBYTES: sodium.crypto_secretbox_NONCEBYTES,
    crypto_secretbox_MACBYTES: sodium.crypto_secretbox_MACBYTES,
    
    // Métodos
    crypto_secretbox_easy(message, nonce, key) {
        const cipher = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES);
        sodium.crypto_secretbox_easy(cipher, message, nonce, key);
        return cipher;
    },
    
    crypto_secretbox_open_easy(ciphertext, nonce, key) {
        const message = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES);
        const result = sodium.crypto_secretbox_open_easy(message, ciphertext, nonce, key);
        return result ? message : null;
    },
    
    randombytes_buf(buffer) {
        sodium.randombytes_buf(buffer);
        return buffer;
    },
    
    // Métodos adicionais que @discordjs/voice pode precisar
    crypto_box_PUBLICKEYBYTES: sodium.crypto_box_PUBLICKEYBYTES || 32,
    crypto_box_SECRETKEYBYTES: sodium.crypto_box_SECRETKEYBYTES || 32,
    crypto_box_NONCEBYTES: sodium.crypto_box_NONCEBYTES || 24,
    crypto_box_MACBYTES: sodium.crypto_box_MACBYTES || 16,
};

// Interceptar require() para forçar uso do sodium-javascript
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    // Interceptar qualquer tentativa de carregar bibliotecas sodium
    if (id === 'sodium' || 
        id === 'libsodium' || 
        id === 'libsodium-wrappers' || 
        id === 'sodium-native' ||
        id === '@discordjs/libsodium' ||
        id === 'tweetnacl') {
        console.log(`[VOICE-CONFIG] Interceptado require('${id}'), retornando sodium-javascript`);
        return sodiumWrapper;
    }
    return originalRequire.apply(this, arguments);
};

console.log('✅ voice-config.js carregado - usando sodium-javascript');

module.exports = sodiumWrapper;
