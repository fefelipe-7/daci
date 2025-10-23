/**
 * Script para aplicar o perfil do Near no banco de dados
 * Uso: node scripts/apply_near_profile.js <GUILD_ID>
 */

const UserPersonality = require('../models/UserPersonality');

const NEAR_PROFILE = {
    user_id: '1340544045268733964',
    username: 'Near',
    
    // ⚡ near — agente do caos
    parametros: {
        extroversao: 0.85,      // Fala bastante e entra em tudo
        sarcasmo: 0.95,         // EXTREMAMENTE irônico
        sensibilidade: 0.10,    // Quase nada o afeta, gosta da treta
        lideranca: 0.60,        // Guia o clima do grupo pela zoeira
        afinidade: 0.25,        // Bot "tolera", mas vive implicando
        espontaneidade: 0.90,   // Age no impulso, zoa sem pensar
        paciencia: 0.20,        // Perde a paciência fácil (e o bot também)
        criatividade: 0.80,     // Faz piadas originais
        humor_negro: 0.85,      // Adora humor ácido
        empatia: 0.15,          // Pouco empático; gosta mais da piada
        zoeira_geral: 0.95,     // Está SEMPRE zoando
        lealdade: 0.40,         // Pode trair o bot por uma boa piada 😆
        dominancia: 0.65,       // Impõe presença em qualquer conversa
        autoestima: 0.90,       // Muito confiante
        curiosidade: 0.55       // Pergunta só pra provocar
    }
};

function applyNearProfile(guildId) {
    console.log('⚡ Aplicando perfil do Near (Agente do Caos)...\n');
    
    try {
        // Aplicar parâmetros
        UserPersonality.update(NEAR_PROFILE.user_id, guildId, {
            username: NEAR_PROFILE.username,
            ...NEAR_PROFILE.parametros
        });
        
        console.log('✅ Perfil do Near aplicado com sucesso!');
        console.log('\n📊 Parâmetros configurados:');
        console.log('  Sarcasmo: 95% (EXTREMAMENTE irônico) ⚡');
        console.log('  Zoeira: 95% (SEMPRE zoando) 🔥');
        console.log('  Autoestima: 90% (Muito confiante)');
        console.log('  Espontaneidade: 90% (Age no impulso)');
        console.log('  Extroversão: 85% (Fala bastante e entra em tudo)');
        console.log('  Humor Negro: 85% (Adora humor ácido)');
        console.log('  Criatividade: 80% (Piadas originais)');
        console.log('  Dominância: 65% (Impõe presença)');
        console.log('  Afinidade: 25% (Bot TOLERA mas implica) ⚠️');
        console.log('  Paciência: 20% (Perde fácil - bot também)');
        console.log('  Empatia: 15% (Gosta mais da piada)');
        console.log('  Sensibilidade: 10% (Quase nada o afeta)');
        
        console.log('\n🎭 Comportamento esperado do bot:');
        console.log('  → Reage de forma IRRITADA e debochada');
        console.log('  → Respostas CURTAS e cheias de ironia');
        console.log('  → SEMPRE tentando dar o troco');
        console.log('  → Exemplo: "Near, vai arrumar o que fazer 😤"');
        console.log('  → Tom hostil/provocador constante');
        
        // Verificar perfil aplicado
        const perfil = UserPersonality.get(NEAR_PROFILE.user_id, guildId);
        console.log('\n✓ Verificação:');
        console.log(`  Sarcasmo: ${(perfil.sarcasmo * 100).toFixed(0)}%`);
        console.log(`  Zoeira: ${(perfil.zoeira_geral * 100).toFixed(0)}%`);
        console.log(`  Afinidade: ${(perfil.afinidade * 100).toFixed(0)}%`);
        console.log(`  Sensibilidade: ${(perfil.sensibilidade * 100).toFixed(0)}%`);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar perfil:', error);
    }
}

if (require.main === module) {
    const guildId = process.argv[2];
    
    if (!guildId) {
        console.error('❌ Por favor, forneça o Guild ID:');
        console.error('   node scripts/apply_near_profile.js <GUILD_ID>');
        process.exit(1);
    }
    
    applyNearProfile(guildId);
}

module.exports = { applyNearProfile };

