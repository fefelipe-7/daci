const UserPersonality = require('../models/UserPersonality');

/**
 * Script para criar perfis de teste pré-configurados
 * 
 * Execute: node scripts/seed_personalities.js <GUILD_ID> <NEAR_ID> <REST_ID> <PURE_ID>
 */

// Perfis pré-configurados
const PERFIS_TESTE = {
    Near: {
        // Perfil provocador e sarcástico
        extroversao: 0.75,
        sarcasmo: 0.90,
        sensibilidade: 0.20,
        lideranca: 0.80,
        afinidade: 0.65,
        espontaneidade: 0.85,
        paciencia: 0.30,
        criatividade: 0.80,
        humor_negro: 0.85,
        empatia: 0.40,
        zoeira_geral: 0.95,
        lealdade: 0.75,
        dominancia: 0.70,
        autoestima: 0.85,
        curiosidade: 0.75
    },
    
    Rest: {
        // Perfil provocador e sarcástico (similar ao Near)
        extroversao: 0.70,
        sarcasmo: 0.90,
        sensibilidade: 0.25,
        lideranca: 0.75,
        afinidade: 0.60,
        espontaneidade: 0.80,
        paciencia: 0.35,
        criatividade: 0.75,
        humor_negro: 0.85,
        empatia: 0.45,
        zoeira_geral: 0.90,
        lealdade: 0.70,
        dominancia: 0.65,
        autoestima: 0.80,
        curiosidade: 0.70
    },
    
    Pure: {
        // Perfil sensível e afetivo
        extroversao: 0.60,
        sarcasmo: 0.20,
        sensibilidade: 0.90,
        lideranca: 0.40,
        afinidade: 0.90,
        espontaneidade: 0.65,
        paciencia: 0.85,
        criatividade: 0.70,
        humor_negro: 0.15,
        empatia: 0.95,
        zoeira_geral: 0.50,
        lealdade: 0.90,
        dominancia: 0.30,
        autoestima: 0.60,
        curiosidade: 0.75
    },
    
    Neutro: {
        // Perfil completamente neutro (exemplo de baseline)
        extroversao: 0.50,
        sarcasmo: 0.50,
        sensibilidade: 0.50,
        lideranca: 0.50,
        afinidade: 0.50,
        espontaneidade: 0.50,
        paciencia: 0.50,
        criatividade: 0.50,
        humor_negro: 0.50,
        empatia: 0.50,
        zoeira_geral: 0.50,
        lealdade: 0.50,
        dominancia: 0.50,
        autoestima: 0.50,
        curiosidade: 0.50
    }
};

function seedPersonalities(guildId, userIds = {}) {
    console.log('🌱 Iniciando seed de perfis de personalidade...\n');

    let count = 0;

    // Criar perfis para cada usuário fornecido
    for (const [nome, perfil] of Object.entries(PERFIS_TESTE)) {
        const userId = userIds[nome];
        
        if (!userId) {
            console.log(`⚠️  Pulando ${nome} - nenhum user ID fornecido`);
            continue;
        }

        try {
            // Criar/atualizar perfil
            UserPersonality.update(userId, guildId, {
                username: nome,
                ...perfil
            });

            console.log(`✅ Perfil criado para ${nome} (${userId})`);
            console.log(`   └─ Sarcasmo: ${perfil.sarcasmo}, Afinidade: ${perfil.afinidade}, Sensibilidade: ${perfil.sensibilidade}`);
            count++;

        } catch (error) {
            console.error(`❌ Erro ao criar perfil para ${nome}:`, error.message);
        }
    }

    console.log(`\n✨ Seed completo! ${count} perfil(is) criado(s).\n`);
}

// Executar se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.error('❌ Uso: node scripts/seed_personalities.js <GUILD_ID> [NEAR_ID] [REST_ID] [PURE_ID] [NEUTRO_ID]');
        console.error('\nExemplo:');
        console.error('  node scripts/seed_personalities.js 987654321 123456789 111222333 444555666');
        process.exit(1);
    }

    const [guildId, nearId, restId, pureId, neutroId] = args;

    const userIds = {};
    if (nearId) userIds.Near = nearId;
    if (restId) userIds.Rest = restId;
    if (pureId) userIds.Pure = pureId;
    if (neutroId) userIds.Neutro = neutroId;

    seedPersonalities(guildId, userIds);
}

module.exports = { seedPersonalities, PERFIS_TESTE };

