/**
 * Templates de Saudações, Despedidas e Agradecimentos
 * 
 * Estilo Mandrake Jovem 17
 */

module.exports = {
    saudacao: {
        // ALTA AFINIDADE (>0.7) - Muito próximo
        alta_afinidade: [
            "eae {apelido}! como c tá fi? 🔥",
            "suave {apelido}? tmj parça 😎",
            "fala {apelido}! blz ai? tmj mano",
            "daora {apelido}! tudo certo ai? 🤝",
            "e ai {apelido}! qual é parça? tamo junto 💪",
            "salve {apelido}! to aqui fi 🔥",
            "opa {apelido}! como q tá? tmj mano 😎",
            "eaeee {apelido}! suave na nave? 🏍️",
            "fala meu {apelido}! tudo em cima? 💸",
            "e ai parçazão! qual é? tmj fi 🤝",
            "salve salve {apelido}! blz memo? 😎",
            "opa meu mano! como c tá hj? 🔥",
            "suavão {apelido}? tamo junto memo fi 💪",
            "eae meu irmão! tudo tranquilo? 🤝",
            "fala {apelido}! partiu trocar ideia? 😎"
        ],
        
        // MÉDIA AFINIDADE (0.4-0.7) - Amigável
        media_afinidade: [
            "fala {username} blz?",
            "e ai {username} suave?",
            "eae {username} como tá?",
            "tudo certo {username}?",
            "blz {username}? tmj",
            "salve {username}! tudo bem?",
            "opa {username}! como q é?",
            "fala fi! suave ai?",
            "e ai mano! tá de boa?",
            "{username}! qual é parça?",
            "beleza {username}? tamo ai",
            "fala tu {username}! blz?",
            "suave {username}? tudo tranquilo?",
            "e ai fi! como c tá?",
            "opa {username}! tudo certo?"
        ],
        
        // BAIXA AFINIDADE (<0.3) - Frio/Neutro
        baixa_afinidade: [
            "fala {username}",
            "e ai {username} 🫠",
            "opa {username}",
            "{username} blz?",
            "suave {username}?",
            "fala fi",
            "opa 🤨",
            "{username}...",
            "e ai 🫠",
            "fala tu",
            "blz? 😒",
            "{username} oi",
            "suave? 🤨",
            "opa... {username}",
            "fala 🫠"
        ],
        
        // NEUTRO/GENÉRICO
        neutro: [
            "eae",
            "fala tu",
            "suave?",
            "blz?",
            "e ai",
            "opa",
            "salve",
            "fala fi",
            "e ai mano",
            "beleza?"
        ]
    },

    despedida: [
        "falou {apelido}! tmj fi 🤝",
        "até mais mano! blz ai 👍",
        "falou {username}! sucesso parça 🔥",
        "até fi! tamo junto 💪",
        "vlw {apelido}! flw 👋",
        "falou mano! até 😎",
        "até {username}! tmj sempre 🤝",
        "flw fi! blz ai 👍",
        "falou parça! sucesso 🔥",
        "até mais {apelido}! tamo junto 💪",
        "vlw mano! até 👋",
        "falou {username}! flw fi 😎",
        "até parça! tmj 🤝",
        "flw {apelido}! sucesso 👍",
        "falou fi! até mais 🔥",
        "vlw {username}! blz 👋",
        "até mano! tamo junto 😎",
        "flw parça! tmj sempre 🤝",
        "falou {apelido}! até 👍",
        "vlw fi! sucesso 🔥"
    ],

    agradecer: [
        "valeu {apelido}! tmj fi 🤝",
        "obg mano! c é chave dms 🔥",
        "tmj parça! ajudou memo 💪",
        "valeu {username}! sucesso 😎",
        "obrigado fi! real memo",
        "tmj {apelido}! de vdd 🤝",
        "valeu demais mano 🔥",
        "obg {username}! chave dms 💪",
        "tmj fi! ajudou mt 😎",
        "valeu parça! tmj sempre 🤝",
        "obrigado {apelido}! mt bom 🔥",
        "tmj mano! valeu memo 💪",
        "valeu {username}! top dms 😎",
        "obg fi! sucesso parça 🤝",
        "tmj {apelido}! valeu mesmo 🔥"
    ],
    
    receber_agradecimento: [
        "tmj {apelido}! sempre 🤝",
        "nada fi, to aqui pra isso memo 😎",
        "de nada mano! disponha 💪",
        "tranquilo {username}! qualquer coisa chama",
        "tmj parça! pode contar cmg 🔥",
        "nada {apelido}! tamo junto sempre 🤝",
        "rlx fi, to aqui pra ajudar 😎",
        "de nada {username}! tmj memo 💪",
        "tranquilo mano! é nois 🔥",
        "nada parça! sempre q precisar 🤝",
        "tmj {apelido}! pode chamar 😎",
        "rlx fi! tamo junto 💪",
        "de nada {username}! disponha 🔥",
        "tranquilo parça! tmj sempre 🤝",
        "nada fi! to aqui memo 😎"
    ]
};

