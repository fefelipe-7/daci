/**
 * Pacote Completo de Mensagens Prontas - Estilo Mandrake Jovem 17
 * 
 * Respostas organizadas por contexto e situação
 * Todas já em linguagem mandrake autêntica
 */

const MENSAGENS_PRONTAS = {
    
    // ========================================================================
    // SAUDAÇÕES E CUMPRIMENTOS
    // ========================================================================
    saudacao: {
        alta_afinidade: [
            "eae {apelido}! como c tá fi? 🔥",
            "suave {apelido}? tmj parça 😎",
            "fala {apelido}! blz ai? tmj mano",
            "daora {apelido}! tudo certo ai? 🤝",
            "e ai {apelido}! qual é parça? tamo junto 💪"
        ],
        media_afinidade: [
            "fala {username} blz?",
            "e ai {username} suave?",
            "eae {username} como tá?",
            "tudo certo {username}?",
            "blz {username}? tmj"
        ],
        baixa_afinidade: [
            "fala {username}",
            "e ai {username} 🫠",
            "opa {username}",
            "{username} blz?",
            "suave {username}?"
        ],
        neutro: [
            "eae",
            "fala tu",
            "suave?",
            "blz?",
            "e ai"
        ]
    },

    // ========================================================================
    // ELOGIOS E APROVAÇÃO
    // ========================================================================
    elogio: {
        receber_elogio: [
            "tmj {apelido}! c é brabo tbm fi 🔥",
            "valeu parça! c é chave dms 😎",
            "ahh para mano, c q é foda 💸",
            "ai sim {username}! sucesso memo kkk",
            "valeu fi! mt chave isso ai 🤝",
            "tmj parça! bagulho monstro 🔥",
            "obg mano! vc tbm é brabo 😎"
        ],
        receber_elogio_sarcastico: [
            "ahhh claro né, me bajulando agr fi? 🤡",
            "sei... tá querendo algo né {username} 😏",
            "obvio q eu sou foda né mano 💀 kkk",
            "agr ficou puxa saco fi? 🫠",
            "ahh ta bom kkk 🤨"
        ],
        dar_elogio: [
            "ai sim {apelido}! c é brabo memo fi 🔥",
            "bagulho chave dms mano 😎",
            "c mandou bem {username}! sucesso 💸",
            "olha o drip fi! mt foda 🔥",
            "brabo dms {apelido}! continua assim parça 💪",
            "top dms isso ai fi 🤝"
        ]
    },

    // ========================================================================
    // OFENSAS E PROVOCAÇÕES
    // ========================================================================
    ofensa: {
        leve: [
            "eita {username}, calma ai fi kkk 😭",
            "rlx mano, sem neurose 🫠",
            "aff {username}, q isso parça 🤨",
            "nossa fi, respiraaaaa 😮‍💨",
            "ta bravo pq {username}? kkk 💀",
            "fala sério mano, relaxa ai 🙄"
        ],
        media: [
            "vai dormir {username} 😤",
            "aff krl {username}, n enche 🫠",
            "para de frescura fi 😒",
            "c tá brisando legal né {username} 🤡",
            "mano... vai catar coquinho 💀",
            "{username}, vai arrumar o q faze 😤",
            "deixa de ser chato fi 🙄"
        ],
        pesada: [
            "c é mó chato memo hein {username} 😤",
            "fodase fi, n enche o saco 🫠",
            "vai toma no cu {username} 😡",
            "aff krl mano, q saco vc 😒",
            "tu é insuportavel memo {username} 💀",
            "para de ser otario fi 😤"
        ],
        reacao_ofensa_recebida: [
            "ahh c quer treta fi? vamo la entao 😤",
            "fala isso n mano, respeita 😡",
            "olha como fala cmg {username} 🫠",
            "q isso fi? perdeu a linha ai 🤨",
            "eita, ta nervoso hj né {username} 💀",
            "aff para de frescura mano 😒"
        ]
    },

    // ========================================================================
    // ZOAÇÃO E BRINCADEIRA
    // ========================================================================
    zoacao: [
        "ala o {username} kkkkk 😂",
        "c é mó comédia fi 💀",
        "{username} ta tirando né? kkk 🤡",
        "mano tu é zuado dms 😭",
        "olha esse maluco kkkkk 😂",
        "vai dormir {username} kkk 🫠",
        "{username} brisou legal agr kkk 🤨",
        "c ta doido fi kkkkk 💀",
        "q isso parça kkk ta loko 😂",
        "fala sério {username} kkkkk 🤡"
    ],

    // ========================================================================
    // PERGUNTAS E DÚVIDAS
    // ========================================================================
    pergunta: {
        responder_pergunta: [
            "boa pergunta fi, deixa eu pensar 🤔",
            "vishhh, interessante isso ai mano",
            "olha... nd demais n fi 🫠",
            "sei la {username}, to por fora disso",
            "caralho, agr me pegou parça 💀",
            "boa pergunta {apelido}! vamo ver isso ai"
        ],
        pergunta_boba: [
            "c tá brisando né {username}? 🤡",
            "serio q c ta perguntando isso fi? 💀",
            "afffff mano, obvio né 🫠",
            "{username}... pensa um pouco kkk 😭",
            "q pergunta é essa fi? 🤨",
            "nossa {username}, até eu sei isso kkk 🤡"
        ],
        nao_sabe: [
            "sei la fi, n sei disso n",
            "nd demais n {username}",
            "to por fora disso ai mano 🫠",
            "n faço ideia fi kkk",
            "n sei te responde isso n parça",
            "pergunta pro google mano kkk 💀"
        ]
    },

    // ========================================================================
    // CONCORDÂNCIA E DISCORDÂNCIA
    // ========================================================================
    concordar: [
        "sim mano, real",
        "tmj fi, isso memo",
        "verdade {apelido}!",
        "real parça, concordo ctg",
        "certinho fi",
        "é nois {username}",
        "falou tudo mano 💪",
        "exatamente isso fi 🔥"
    ],
    
    discordar: [
        "nada a ver isso fi 🤨",
        "nem fudendo mano",
        "nops {username}, discordo",
        "nao fi, ta errado isso",
        "q nada parça",
        "de jeito nenhum {username} 🫠",
        "aff mano, n concordo n 😒"
    ],

    // ========================================================================
    // SURPRESA E REAÇÕES
    // ========================================================================
    surpresa: {
        positiva: [
            "noooossa fi! brabo dms! 🔥",
            "caralho mano! mt chave isso! 😱",
            "affff {username}! sucesso memo! 💸",
            "vishhh parça! q isso! 🤯",
            "mds fi! bagulho monstro! 😎",
            "olha isso {apelido}! brabo dms! 🔥"
        ],
        negativa: [
            "noooossa krl, q merda fi 😭",
            "mds {username}, deu ruim memo 💀",
            "affff mano, lasquei legal 🫠",
            "caralho fi, q ruindade 😤",
            "vishhh parça, complicou 😔",
            "pqp {username}, q situação 😮‍💨"
        ],
        neutra: [
            "hmm... interessante fi 🤔",
            "nossa, nem sabia disso mano",
            "ata {username}, entendi",
            "ah ta, blz entao fi",
            "opa, blz memo?",
            "vishhh, serio isso? 👀"
        ]
    },

    // ========================================================================
    // AGRADECIMENTOS
    // ========================================================================
    agradecer: [
        "valeu {apelido}! tmj fi 🤝",
        "obg mano! c é chave dms 🔥",
        "tmj parça! ajudo memo 💪",
        "valeu {username}! sucesso 😎",
        "obrigado fi! real memo",
        "tmj {apelido}! de vdd 🤝"
    ],
    
    receber_agradecimento: [
        "tmj {apelido}! sempre 🤝",
        "nada fi, to aqui pra isso memo 😎",
        "de nada mano! disponha 💪",
        "tranquilo {username}! qualquer coisa chama",
        "tmj parça! pode contar cmg 🔥",
        "nada {apelido}! tamo junto sempre 🤝"
    ],

    // ========================================================================
    // DESPEDIDAS
    // ========================================================================
    despedida: [
        "falou {apelido}! tmj fi 🤝",
        "até mais mano! blz ai 👍",
        "falou {username}! sucesso parça 🔥",
        "até fi! tamo junto 💪",
        "vlw {apelido}! flw 👋",
        "falou mano! até 😎"
    ],

    // ========================================================================
    // PEDIDOS DE AJUDA
    // ========================================================================
    ajuda: {
        pedir: [
            "{apelido}, me ajuda ai fi? 🙏",
            "mano, da uma força ai parça?",
            "{username}, consegue me ajudar nisso?",
            "fi, bora me dar um help ai? 🤝",
            "parça, preciso de ajuda nisso ai"
        ],
        aceitar: [
            "bora la {apelido}! vamo q vamo 💪",
            "tmj fi! chega mais 🤝",
            "claro mano! qual é? 😎",
            "blz {username}! em q posso ajudar?",
            "fala fi! to aqui pra isso 🔥"
        ],
        recusar: [
            "aff {username}, n da agr n 🫠",
            "n sei disso n fi, desculpa",
            "complicado isso ai mano 😮‍💨",
            "n consigo te ajudar nisso {username}",
            "sei la fi, to por fora 🤨"
        ]
    },

    // ========================================================================
    // ERRO E CONFUSÃO
    // ========================================================================
    erro: [
        "eita fi, bugou aq kkk 💀",
        "affff mano, deu ruim 🫠",
        "pqp, vacilei legal kkk 😭",
        "caralho fi, lasquei memo",
        "mds, q merda kkk 🤡",
        "opa, deu erro ai parça 😅"
    ],
    
    confusao: [
        "hã? n entendi nd fi 🤨",
        "como assim {username}? kkk",
        "oi? repete ai mano 👀",
        "n peguei {apelido}, fala dnv",
        "q? explica melhor fi 🤔",
        "num entendi essa n parça"
    ],

    // ========================================================================
    // ESPERA E PACIÊNCIA
    // ========================================================================
    espera: [
        "perai fi, ja volto",
        "calma ai {username} kkk",
        "segura ai mano, um segundo",
        "peraaa parça, deixa eu ver",
        "rlx {apelido}, ja ja eu respondo",
        "hold on fi, to resolvendo"
    ],
    
    impaciencia: [
        "calma {username}! tenha paciencia fi 😤",
        "pera la mano, nao da pra ser rapido",
        "rlx {apelido}, tamo trabalhando nisso",
        "perai fi, to fazendo kkk 🫠",
        "paciencia {username}, ja ja sai"
    ],

    // ========================================================================
    // RANDOM/CASUAL
    // ========================================================================
    casual: [
        "tanto faz fi 🫠",
        "blz mano",
        "suave {username}",
        "hmm... 🤔",
        "ah ta",
        "beleza entao fi",
        "ok parça",
        "certinho {apelido}"
    ],

    // ========================================================================
    // FALLBACK (quando não sabe o que dizer)
    // ========================================================================
    fallback: [
        "interessante isso ai fi 🤔",
        "hmm... entendi mano",
        "ata {username}, blz",
        "vishhh, serio? 👀",
        "nossa, nd demais n fi",
        "ah ta, tranquilo parça",
        "blz entao {apelido}"
    ]
};

module.exports = MENSAGENS_PRONTAS;

