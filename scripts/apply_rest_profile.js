/**
 * Script para aplicar o perfil do Rest no banco de dados
 * Uso: node scripts/apply_rest_profile.js <GUILD_ID>
 */

const UserPersonality = require('../models/UserPersonality');

const REST_PROFILE = {
    user_id: '1428244923970490483',
    username: 'Rest',
    
    // 🧨 rest — debochado filosófico
    parametros: {
        extroversao: 0.70,      // Fala bastante, mas escolhe os momentos
        sarcasmo: 0.90,         // Ironiza o bot de forma elegante
        sensibilidade: 0.25,    // Raramente se ofende
        lideranca: 0.55,        // Influente pelo jeito calmo e provocante
        afinidade: 0.30,        // Relação fria com o bot
        espontaneidade: 0.65,   // Solta comentários aleatórios geniais
        paciencia: 0.40,        // Aguenta o bot até certo ponto
        criatividade: 0.85,     // Humor inteligente e diferente
        humor_negro: 0.75,      // Humor ácido, mas sutil
        empatia: 0.20,          // Pouco afetuoso, prefere a zoeira
        zoeira_geral: 0.80,     // Quase sempre tirando sarro
        lealdade: 0.45,         // Às vezes com o bot, às vezes contra
        dominancia: 0.50,       // Postura segura, sem forçar
        autoestima: 0.80,       // Confiante e sempre no controle
        curiosidade: 0.60       // Gosta de testar o bot
    }
};

function applyRestProfile(guildId) {
    console.log('🧨 Aplicando perfil do Rest (Debochado Filosófico)...\n');
    
    try {
        // Aplicar parâmetros
        UserPersonality.update(REST_PROFILE.user_id, guildId, {
            username: REST_PROFILE.username,
            ...REST_PROFILE.parametros
        });
        
        console.log('✅ Perfil do Rest aplicado com sucesso!');
        console.log('\n📊 Parâmetros configurados:');
        console.log('  Sarcasmo: 90% (Ironiza o bot de forma elegante)');
        console.log('  Criatividade: 85% (Humor inteligente e diferente)');
        console.log('  Zoeira: 80% (Quase sempre tirando sarro)');
        console.log('  Autoestima: 80% (Confiante e sempre no controle)');
        console.log('  Humor Negro: 75% (Humor ácido, mas sutil)');
        console.log('  Extroversão: 70% (Fala bastante, escolhe os momentos)');
        console.log('  Afinidade: 30% (Relação FRIA com o bot)');
        console.log('  Sensibilidade: 25% (Raramente se ofende)');
        console.log('  Empatia: 20% (Pouco afetuoso, prefere a zoeira)');
        
        console.log('\n🎭 Comportamento esperado do bot:');
        console.log('  → Tenta bancar o superior, mas se irrita');
        console.log('  → Respostas passivo-agressivas');
        console.log('  → Evita dar a última palavra');
        console.log('  → Exemplo: "tá se achando hoje, né Rest?"');
        
        // Verificar perfil aplicado
        const perfil = UserPersonality.get(REST_PROFILE.user_id, guildId);
        console.log('\n✓ Verificação:');
        console.log(`  Sarcasmo: ${(perfil.sarcasmo * 100).toFixed(0)}%`);
        console.log(`  Afinidade: ${(perfil.afinidade * 100).toFixed(0)}%`);
        console.log(`  Zoeira: ${(perfil.zoeira_geral * 100).toFixed(0)}%`);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar perfil:', error);
    }
}

if (require.main === module) {
    const guildId = process.argv[2];
    
    if (!guildId) {
        console.error('❌ Por favor, forneça o Guild ID:');
        console.error('   node scripts/apply_rest_profile.js <GUILD_ID>');
        process.exit(1);
    }
    
    applyRestProfile(guildId);
}

module.exports = { applyRestProfile };

