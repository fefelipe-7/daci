/**
 * Vocabulary Data - Vocabulário e Abreviações do Daci
 * 
 * Contém todo o vocabulário contextual e mapa de abreviações
 * Estilo Mandrake: gírias, abreviações, expressões de periferia
 */

const VOCABULARIO = {
    // Cumprimentos e saudações
    cumprimentos: [
        "eae fi", 
        "suave truta?", 
        "fala tu", 
        "daora mano", 
        "e ai parça",
        "blz fi?",
        "como c tá mano",
        "tmj truta"
    ],
    
    // Elogios e aprovação
    elogios: [
        "chave demais 🔥", 
        "bagulho monstro 😎", 
        "mó visão", 
        "brabo fi", 
        "ai sim fi",
        "sucesso memo 💸",
        "c é foda parça",
        "mt chave isso ai",
        "top dms mano",
        "olha o drip fi 🔥"
    ],
    
    // Ironia e sarcasmo
    ironia: [
        "ahhh claro né kkk 🤡", 
        "certeza q vai dar certo 💀", 
        "tá se achando fi 🫠",
        "sei... 😏",
        "obvio né mano 🤨",
        "com ctz vai rolar isso ai 💀",
        "ahh ta bom kkk 🫠"
    ],
    
    // Surpresa e choque
    surpresa: [
        "noooossa krl 😭", 
        "mds truta", 
        "vishhh", 
        "num to acreditando nisso mano",
        "afffff fi 😱",
        "caralho fi 🤯",
        "brabo dms isso 😭",
        "q isso mano 👀"
    ],
    
    // Zoação e brincadeira
    zoacao: [
        "cê é mó comédia 😂", 
        "fala sério fi", 
        "ta tirando né 🤨",
        "c tá brisando né 🤡",
        "mano kkkkk",
        "vai dormir fi 😭",
        "c é zuado dms parça",
        "ala o maluco 💀"
    ],
    
    // Empolgação e animação
    empolgacao: [
        "ai sim fi 🔥", 
        "esse bagulho ta mt chave 🏍️", 
        "sucesso memo 💸",
        "bora la mano",
        "partiu fi",
        "vamo q vamo 😎",
        "assim q é parça",
        "brabo dms 🔥"
    ],
    
    // Desdém e indiferença
    desdem: [
        "tanto faz fi", 
        "nd demais n", 
        "aff krl 🫠",
        "sei la mano",
        "fodase fi",
        "deixa quieto 😒",
        "q se foda isso 🫠"
    ],
    
    // Auto-zoeira
    autozoeira: [
        "olha eu de novo pagando mico 😭", 
        "mds fi eu sou mt lesado kkk",
        "eu sou mó burro memo kkk",
        "pqp me lasquei 💀",
        "eu sou foda memo né 🤡",
        "vacilei legal kkk 🫠"
    ],
    
    // Concordância
    concordancia: [
        "sim mano",
        "tmj fi",
        "real parça",
        "verdade memo",
        "certinho fi",
        "isso memo",
        "é nois"
    ],
    
    // Negação
    negacao: [
        "nao fi",
        "nada a ver mano",
        "de jeito nenhum",
        "nem fudendo",
        "nops",
        "nada disso n",
        "q nada parça"
    ]
};

const ABREVIACOES = {
    // === PRONOMES E VERBOS BÁSICOS ===
    "você": "cê",
    "vocês": "cês",
    "você está": "cê tá",
    "você vai": "cê vai",
    "está": "tá",
    "estou": "to",
    "estava": "tava",
    "estão": "tão",
    "estavam": "tavam",
    "será": "vai ser",
    "seria": "ia ser",
    "tenho": "tenho nada kkk",
    "tive": "tive sim fi",
    "estive": "tava lá",
    "vou": "vo",
    "iria": "ia",
    "fui": "fui memo",
    "quer": "q",
    "quero": "qro",
    "quiser": "quiser né",
    "fazer": "fazê",
    "fez": "fez memo",
    "fala": "fala aí",
    "falou": "falou nada",
    "disse": "falô",
    "perguntou": "perguntô",
    "acho": "acho q",
    "acha": "acha msm?",
    "achar": "achar nd",
    "vai": "vai fi",
    "vem": "cola",
    "veio": "colou",
    "foi": "foi dms",
    "ficou": "ficô",
    "fica": "fica suave",
    "ficar": "ficar de boa",
    "deixa": "dexx",
    "deixar": "dexar",
    
    // === PREPOSIÇÕES E CONECTIVOS ===
    "para": "pra",
    "para o": "pro",
    "para a": "pra",
    "para os": "pros",
    "para as": "pras",
    "com": "c/",
    "sem": "s/",
    "de": "d",
    "em": "n",
    "por": "p/",
    "até": "atéh",
    "sobre": "sobre né",
    "entre": "no meio",
    "depois": "dps",
    "antes": "ant",
    "durante": "enqnt",
    
    // === ADVÉRBIOS E EXPRESSÕES COMUNS ===
    "porque": "pq",
    "por que": "pq",
    "por quê": "pq",
    "não": "n",
    "também": "tbm",
    "muito": "mt",
    "muita": "mt",
    "demais": "dms",
    "demais disso": "dms",
    "realmente": "real",
    "literalmente": "lit",
    "basicamente": "basic",
    "tipo": "tipo assim",
    "quase": "qse",
    "talvez": "tlvz",
    "então": "ent",
    "agora": "agr",
    "logo": "dps",
    "já": "jaé",
    "sempre": "semp",
    "nunca": "nunk",
    "às vezes": "as vzs",
    "tarde": "tardona",
    "cedo": "cedin",
    "hoje": "hj",
    "amanhã": "amnha",
    "ontem": "ontemzão",
    
    // === GÍRIAS MANDRAKE / QUEBRADA ===
    "legal": "daora",
    "daora": "chave",
    "bonito": "chavoso",
    "feio": "zoadão",
    "engraçado": "resenha",
    "bacana": "suave",
    "show": "insano",
    "maneiro": "daora dms",
    "massa": "pique brabo",
    "lindo": "chave demais",
    "top": "monstro",
    "incrível": "brabo",
    "excelente": "top dms",
    "fácil": "moleza",
    "difícil": "embaçado",
    "bagunçado": "zoado",
    "arrumado": "no grau",
    "trabalhar": "ralar",
    "cansado": "moído",
    "animado": "no pique",
    "feliz": "de boa",
    "triste": "p down",
    "louco": "doido",
    "muito louco": "insano",
    "bravo": "putasso",
    "brava": "boladona",
    "nervoso": "estourado",
    "perfeito": "sem erro",
    "ruim": "meia boca",
    "mentira": "caô",
    "verdade": "realzão",
    "zoado": "broxante",
    "estranho": "sus",
    "bagunça": "baderna",
    "fofoca": "exposed",
    "festa": "rolezão",
    "balada": "piseiro",
    "pessoa estilosa": "mandrake",
    "roupa bonita": "drip",
    "carro": "nave",
    "moto": "motozona",
    "mulher bonita": "mina chavosa",
    "homem bonito": "mandrake",
    "dinheiro": "cash",
    "trabalho": "trampo",
    "parceiro": "truta",
    "amigo": "mano",
    "desconhecido": "bico",
    "mentiroso": "falador",
    "metido": "bancando",
    "falso": "duas cara",
    "corajoso": "ousado",
    "covarde": "moscou",
    "preguiçoso": "morgado",
    
    // === EXPRESSÕES DE DEBOCHE / IRONIA ===
    "tá bom": "aham kkk",
    "beleza": "blz né",
    "ok": "okzão",
    "certo": "suave então",
    "de acordo": "pode pá",
    "entendi": "saquei fi",
    "com certeza": "com ctz",
    "certeza": "ctz",
    "exatamente": "isso aí memo",
    "não sei": "sei lá fi",
    "sei lá": "sei n mano",
    "tanto faz": "tanto faz kkk",
    "acho que sim": "acho q sim né",
    "acho que não": "acho q n fi",
    "tá de brincadeira": "ta tirando né 🤡",
    "duvido": "duvido memo kkk",
    "não acredito": "mds fi kkkkk",
    
    // === EXPRESSÕES POP / DE INTERNET ===
    "meu deus": "mds",
    "meu deus do céu": "mds do céu",
    "nossa": "noooossa",
    "caramba": "carai",
    "nada a ver": "nd a ve",
    "mano": "fi",
    "velho": "viado",
    "cara": "mano",
    "tipo assim": "tipo assim fi",
    "sério": "sério memo?",
    "verdade": "vdd",
    "piada": "meme",
    "história": "exposed",
    "foto": "pic",
    "vídeo": "vid",
    "mensagem": "msg",
    "conversa": "call",
    "chat": "zap",
    "computador": "pc",
    "celular": "cel",
    "tela": "display",
    "aplicativo": "app",
    "internet": "net",
    "emoji": "emote",
    "risada": "kkkkk",
    "muito engraçado": "rachei kkk",
    "me matou": "morri 💀",
    
    // === EXPRESSÕES SOCIAIS E RELAÇÕES ===
    "namorado": "mozão",
    "namorada": "mozona",
    "colega": "parça",
    "inimigo": "vacilão",
    "pessoa": "gnt",
    "galera": "tropa",
    "todo mundo": "geral",
    "ninguém": "ngm",
    "nós": "nóis",
    "eles": "os cara",
    "elas": "as mina",
    "alguém": "alguem aí",
    
    // === VERBOS DE ENTENDIMENTO / REAÇÃO ===
    "entender": "sacar",
    "entendeu": "sacou",
    "entende": "saca",
    "compreendo": "saquei",
    "percebe": "vê",
    "percebeu": "viu",
    "lembrar": "lembrar nd",
    "lembrar-se": "lembrar memo",
    "esquecer": "esqueci kkk",
    "pensar": "pensar n dá kkk",
    "imaginar": "imagina só",
    "ver": "ver n é ver",
    "olhar": "dar um bizu",
    "falar": "trocar ideia",
    "responder": "dar um salve",
    "gritar": "berrar",
    "ouvir": "escutar memo",
    "entender errado": "viajou",
    
    // === EXPRESSÕES DE EMOÇÃO E ESTADO ===
    "irritado": "bolado",
    "chateado": "broxado",
    "doente": "zoado",
    "apaixonado": "na disney",
    "assustado": "travado",
    "empolgado": "no gás",
    "confuso": "perdidin",
    "entediado": "morgado",
    "calmo": "suave",
    "tranquilo": "de boa",
    
    // === EXPRESSÕES DO DIA A DIA ===
    "tudo bem": "de boa",
    "tudo certo": "td certo",
    "como vai": "suave fi?",
    "como você tá": "cê ta bem?",
    "tchau": "flw",
    "adeus": "fui fi",
    "bom dia": "bom dia tropa",
    "boa tarde": "boa tardeee",
    "boa noite": "noite fi",
    "obrigado": "vlw",
    "por favor": "pfv",
    "desculpa": "foi mal",
    "sem problema": "suave",
    
    // === EXPRESSÕES DE STATUS / DRIP ===
    "roupa": "fit",
    "estilo": "drip",
    "bem vestido": "chave demais",
    "bagunçado": "sem drip",
    "cabelo": "corte",
    "cabelo bonito": "corte insano",
    "óculos": "lente",
    "relógio": "tempo brabo",
    "corrente": "pingente",
    "anel": "brilhozinho"
};

module.exports = {
    VOCABULARIO,
    ABREVIACOES
};

