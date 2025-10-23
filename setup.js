const fs = require('fs');
const path = require('path');

console.log('🚀 Configuração do Bot Multifuncional');
console.log('=====================================\n');

// Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '.env');
const configEnvPath = path.join(__dirname, 'config.env');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(configEnvPath)) {
        console.log('📋 Copiando config.env para .env...');
        fs.copyFileSync(configEnvPath, envPath);
        console.log('✅ Arquivo .env criado!');
    } else {
        console.log('❌ Arquivo config.env não encontrado!');
        console.log('📝 Crie um arquivo .env com as seguintes variáveis:');
        console.log('');
        console.log('DISCORD_TOKEN=seu_token_do_discord_aqui');
        console.log('CLIENT_ID=seu_client_id_aqui');
        console.log('OWNER_ID=seu_id_de_usuario_aqui');
        console.log('LOG_CHANNEL_ID=id_do_canal_de_logs_aqui');
        console.log('');
        process.exit(1);
    }
}

// Verificar se todas as variáveis estão configuradas
require('dotenv').config();

const requiredVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'OWNER_ID'];
const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName].includes('seu_'));

if (missingVars.length > 0) {
    console.log('❌ Variáveis não configuradas:');
    missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('');
    console.log('📝 Configure as variáveis no arquivo .env antes de continuar!');
    process.exit(1);
}

console.log('✅ Todas as variáveis estão configuradas!');
console.log('🎯 Próximos passos:');
console.log('   1. node deploy-commands.js  # Registrar comandos slash');
console.log('   2. npm start               # Iniciar o bot');
console.log('');
console.log('🎉 Bot pronto para uso!');

