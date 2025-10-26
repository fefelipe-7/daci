/**
 * CommonSense - Conhecimento de senso comum
 * Fatos básicos sobre o mundo que todo humano sabe
 */

class CommonSense {
    /**
     * Opostos e antonimos comuns
     */
    static OPPOSITES = {
        'amar': 'odiar',
        'gostar': 'não gostar',
        'quente': 'frio',
        'dia': 'noite',
        'feliz': 'triste',
        'bom': 'ruim',
        'grande': 'pequeno',
        'rápido': 'lento',
        'fácil': 'difícil',
        'rico': 'pobre',
        'forte': 'fraco',
        'cheio': 'vazio',
        'começar': 'terminar',
        'sim': 'não',
        'certo': 'errado',
        'dentro': 'fora',
        'perto': 'longe',
        'novo': 'velho',
        'limpo': 'sujo',
        'saudável': 'doente'
    };

    /**
     * Necessidades básicas humanas
     */
    static BASIC_NEEDS = {
        'fome': { solution: 'comer', urgency: 'alta' },
        'sede': { solution: 'beber água', urgency: 'alta' },
        'cansaço': { solution: 'dormir/descansar', urgency: 'média' },
        'frio': { solution: 'se aquecer/vestir roupa', urgency: 'média' },
        'calor': { solution: 'se refrescar/tirar roupa', urgency: 'média' },
        'dor': { solution: 'remédio/médico', urgency: 'alta' },
        'tédio': { solution: 'entretenimento', urgency: 'baixa' },
        'solidão': { solution: 'companhia social', urgency: 'média' },
        'estresse': { solution: 'relaxamento', urgency: 'média' }
    };

    /**
     * Ações que requerem pré-requisitos
     */
    static PREREQUISITES = {
        'dirigir': ['ter carro', 'ter CNH', 'saber dirigir'],
        'cozinhar': ['ter ingredientes', 'ter utensílios', 'saber receita'],
        'viajar': ['ter dinheiro', 'ter tempo', 'ter destino'],
        'estudar': ['ter material', 'ter tempo', 'ter concentração'],
        'trabalhar': ['ter emprego', 'ter habilidades', 'ter disposição'],
        'exercitar': ['ter energia', 'ter tempo', 'ter local/equipamento'],
        'programar': ['ter computador', 'saber linguagem', 'ter projeto'],
        'namorar': ['ter parceiro', 'ter interesse mútuo', 'ter tempo']
    };

    /**
     * Incompatibilidades lógicas
     */
    static INCOMPATIBILITIES = {
        'dormir': ['trabalhar', 'estudar', 'dirigir', 'exercitar'],
        'comer': ['jejum', 'dieta severa'],
        'gastar': ['economizar', 'poupar'],
        'sair': ['ficar em casa'],
        'falar': ['ficar calado', 'silêncio'],
        'trabalhar': ['férias', 'folga', 'descanso'],
        'economizar': ['gastar muito', 'comprar luxo']
    };

    /**
     * Consequências típicas de estados
     */
    static STATE_CONSEQUENCES = {
        'cansado': ['baixa produtividade', 'irritação', 'necessidade de descanso'],
        'motivado': ['alta produtividade', 'energia', 'iniciativa'],
        'doente': ['fraqueza', 'necessidade de repouso', 'medicação'],
        'feliz': ['otimismo', 'sociabilidade', 'energia'],
        'triste': ['desmotivação', 'isolamento', 'baixa energia'],
        'estressado': ['ansiedade', 'irritação', 'insônia'],
        'relaxado': ['calma', 'clareza mental', 'bem-estar'],
        'com raiva': ['impulsividade', 'agressividade', 'arrependimento posterior'],
        'com medo': ['evitação', 'paralisia', 'ansiedade'],
        'confiante': ['ousadia', 'iniciativa', 'risco']
    };

    /**
     * Horários típicos de atividades
     */
    static TYPICAL_SCHEDULES = {
        'café da manhã': { start: 6, end: 9 },
        'almoço': { start: 11, end: 14 },
        'jantar': { start: 18, end: 21 },
        'trabalho': { start: 8, end: 18 },
        'escola': { start: 7, end: 18 },
        'academia': { start: 6, end: 22 },
        'dormir': { start: 22, end: 6 },
        'festa': { start: 20, end: 4 }
    };

    /**
     * Verifica se duas ações são opostas
     */
    static areOpposite(action1, action2) {
        const norm1 = action1.toLowerCase().trim();
        const norm2 = action2.toLowerCase().trim();

        // Busca direta
        if (this.OPPOSITES[norm1] === norm2 || this.OPPOSITES[norm2] === norm1) {
            return true;
        }

        // Busca por palavras-chave contidas
        for (const [key, value] of Object.entries(this.OPPOSITES)) {
            if ((norm1.includes(key) && norm2.includes(value)) ||
                (norm2.includes(key) && norm1.includes(value))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica se duas ações são incompatíveis
     */
    static areIncompatible(action1, action2) {
        const norm1 = action1.toLowerCase().trim();
        const norm2 = action2.toLowerCase().trim();

        for (const [key, incompatibles] of Object.entries(this.INCOMPATIBILITIES)) {
            if (norm1.includes(key)) {
                for (const inc of incompatibles) {
                    if (norm2.includes(inc)) {
                        return true;
                    }
                }
            }
            if (norm2.includes(key)) {
                for (const inc of incompatibles) {
                    if (norm1.includes(inc)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Obtém pré-requisitos para uma ação
     */
    static getPrerequisites(action) {
        const norm = action.toLowerCase().trim();

        for (const [key, prereqs] of Object.entries(this.PREREQUISITES)) {
            if (norm.includes(key)) {
                return {
                    action: key,
                    prerequisites: prereqs,
                    confidence: 0.8
                };
            }
        }

        return null;
    }

    /**
     * Identifica necessidade básica
     */
    static identifyNeed(state) {
        const norm = state.toLowerCase().trim();

        for (const [need, data] of Object.entries(this.BASIC_NEEDS)) {
            if (norm.includes(need)) {
                return {
                    need,
                    solution: data.solution,
                    urgency: data.urgency,
                    confidence: 0.9
                };
            }
        }

        return null;
    }

    /**
     * Prevê consequências de um estado
     */
    static predictConsequences(state) {
        const norm = state.toLowerCase().trim();

        for (const [key, consequences] of Object.entries(this.STATE_CONSEQUENCES)) {
            if (norm.includes(key)) {
                return {
                    state: key,
                    consequences,
                    confidence: 0.85
                };
            }
        }

        return null;
    }

    /**
     * Verifica se horário é apropriado para atividade
     */
    static isAppropriateTime(activity, hour) {
        const norm = activity.toLowerCase().trim();

        for (const [key, schedule] of Object.entries(this.TYPICAL_SCHEDULES)) {
            if (norm.includes(key)) {
                const isAppropriate = hour >= schedule.start && hour <= schedule.end;
                return {
                    activity: key,
                    appropriate: isAppropriate,
                    typicalStart: schedule.start,
                    typicalEnd: schedule.end
                };
            }
        }

        return null;
    }

    /**
     * Obtém oposto de um conceito
     */
    static getOpposite(concept) {
        const norm = concept.toLowerCase().trim();

        if (this.OPPOSITES[norm]) {
            return this.OPPOSITES[norm];
        }

        // Buscar por palavras-chave contidas
        for (const [key, value] of Object.entries(this.OPPOSITES)) {
            if (norm.includes(key)) {
                return value;
            }
        }

        return null;
    }
}

module.exports = CommonSense;

