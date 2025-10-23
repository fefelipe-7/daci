/**
 * Script para aplicar TODOS os perfis configurados no banco de dados
 * Uso: node scripts/apply_all_profiles.js <GUILD_ID>
 */

const { applyRestProfile } = require('./apply_rest_profile');
const { applyNearProfile } = require('./apply_near_profile');

function applyAllProfiles(guildId) {
    console.log('🎭 APLICANDO TODOS OS PERFIS DE PERSONALIDADE\n');
    console.log('━'.repeat(60));
    
    // Rest - Debochado Filosófico
    applyRestProfile(guildId);
    
    console.log('\n' + '━'.repeat(60) + '\n');
    
    // Near - Agente do Caos
    applyNearProfile(guildId);
    
    console.log('\n' + '━'.repeat(60));
    console.log('\n✅ TODOS OS PERFIS APLICADOS COM SUCESSO!');
    console.log('\n📝 Próximos passos:');
    console.log('  1. Reinicie o bot se necessário');
    console.log('  2. Mencione o bot como Rest ou Near');
    console.log('  3. Observe as diferenças de comportamento');
    console.log('  4. Use /debug_personalidade para ver cálculos');
    console.log('  5. Use /perfil para ver parâmetros');
    console.log('\n🎯 Personagens configurados:');
    console.log('  🧨 Rest  → Debochado Filosófico (afinidade 30%)');
    console.log('  ⚡ Near  → Agente do Caos (afinidade 25%)');
    console.log('  🎲 Outros → Usar /definir para configurar\n');
}

if (require.main === module) {
    const guildId = process.argv[2];
    
    if (!guildId) {
        console.error('❌ Por favor, forneça o Guild ID:');
        console.error('   node scripts/apply_all_profiles.js <GUILD_ID>');
        console.error('\nExemplo:');
        console.error('   node scripts/apply_all_profiles.js 987654321');
        process.exit(1);
    }
    
    applyAllProfiles(guildId);
}

module.exports = { applyAllProfiles };

