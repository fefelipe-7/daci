/**
 * StyleEnforcer - Garante que respostas sigam o estilo "Daci"
 * Implementação híbrida: regras fixas + IA auxiliar quando necessário
 */

const logger = require('./Logger');

class StyleEnforcer {
    constructor(processor = null) {
        this.processor = processor; // Processor para IA auxiliar
        
        // Dicionário de substituições formais → informais
        this.formalToInformal = {
            // Pronomes
            'você': 'cê',
            'Você': 'Cê',
            'vocês': 'cês',
            'Vocês': 'Cês',
            
            // Preposições e contrações
            'para': 'pra',
            'Para': 'Pra',
            'para o': 'pro',
            'para a': 'pra',
            'está': 'tá',
            'Está': 'Tá',
            'estou': 'to',
            'Estou': 'To',
            'estão': 'tão',
            'estava': 'tava',
            'estava': 'tava',
            
            // Saudações formais
            'olá': 'oi',
            'Olá': 'Oi',
            'bom dia': 'opa, bom dia',
            'Bom dia': 'Opa, bom dia',
            'boa tarde': 'e aí',
            'Boa tarde': 'E aí',
            'boa noite': 'fala aí',
            'Boa noite': 'Fala aí',
            
            // Frases corporativas (remover/substituir)
            'como posso ajudar': 'fala aí',
            'Como posso ajudar': 'Fala aí',
            'em que posso ajudar': 'que que cê precisa',
            'posso te ajudar': 'precisa de algo',
            'estou à disposição': '',
            'fico à disposição': '',
            'qualquer dúvida': 'qualquer coisa',
            
            // Conectivos formais
            'portanto': 'então',
            'Portanto': 'Então',
            'dessa forma': 'assim',
            'Dessa forma': 'Assim',
            'contudo': 'mas',
            'Contudo': 'Mas',
            'todavia': 'mas',
            'entretanto': 'mas',
            'ademais': 'além disso',
            
            // Verbos e expressões
            'compreendo': 'entendi',
            'Compreendo': 'Entendi',
            'entendo perfeitamente': 'saquei',
            'com certeza': 'com ctz',
            'Com certeza': 'Com ctz',
            'exatamente': 'isso aí',
            'Exatamente': 'Isso aí',
            'correto': 'isso mesmo',
            'Correto': 'Isso mesmo',
            
            // Advérbios formais
            'realmente': 'real',
            'Realmente': 'Real',
            'definitivamente': 'com ctz',
            'certamente': 'com ctz',
            'obviamente': 'óbvio',
            'Obviamente': 'Óbvio'
        };
        
        // Gírias do Daci que devem estar presentes
        this.daciGirias = [
            'mano', 'cara', 'pô', 'aí sim', 'massa', 'top', 'demais',
            'fala', 'opa', 'daora', 'brabo', 'cê', 'tá', 'pra', 
            'né', 'tipo', 'saca', 'beleza', 'blz', 'vlw', 'tmj'
        ];
        
        // Padrões de formalidade excessiva (regex)
        this.formalPatterns = [
            /\bsenhora?\b/i,
            /\bagradecemos\b/i,
            /\batenciosamente\b/i,
            /\brespeitosamente\b/i,
            /\bcordialmente\b/i,
            /\bprezad[oa]\b/i,
            /\bV\. S\./i,
            /\bIlm[oa]\b/i
        ];
    }
    
    /**
     * Analisa o estilo da resposta e retorna score (0-1)
     */
    analyzeStyle(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }
        
        let score = 0.5; // Base
        const lower = text.toLowerCase();
        
        // +pontos: presença de gírias Daci
        const giriasEncontradas = this.daciGirias.filter(giria => 
            lower.includes(giria.toLowerCase())
        ).length;
        score += Math.min(giriasEncontradas * 0.1, 0.3);
        
        // +pontos: informalidade gramatical (contrações)
        const informalidade = ['cê', 'tá', 'pra', 'né', 'tô', 'tava', 'pô'].filter(word =>
            lower.includes(word)
        ).length;
        score += Math.min(informalidade * 0.05, 0.2);
        
        // -pontos: formalidade excessiva
        const formalidadeDetectada = this.formalPatterns.filter(pattern =>
            pattern.test(text)
        ).length;
        score -= formalidadeDetectada * 0.3;
        
        // -pontos: frases corporativas
        const corporativo = [
            'como posso ajudar',
            'estou à disposição',
            'qualquer dúvida',
            'atenciosamente',
            'cordialmente'
        ].filter(phrase => lower.includes(phrase)).length;
        score -= corporativo * 0.2;
        
        // -pontos: muito formal (uso excessivo de pronomes formais)
        const voceFormal = (text.match(/\bvocê\b/gi) || []).length;
        if (voceFormal > 2) {
            score -= 0.15;
        }
        
        // +pontos: pontuação informal (reticências, exclamações simples)
        if (text.includes('...')) score += 0.05;
        if (text.match(/!(?!!)/)) score += 0.05; // Uma exclamação, não múltiplas
        
        // Normalizar entre 0 e 1
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * Aplica regras fixas de informalização
     */
    applyFixedRules(text) {
        let result = text;
        
        // Aplicar substituições
        for (const [formal, informal] of Object.entries(this.formalToInformal)) {
            // Usar regex com word boundaries para evitar substituições parciais
            const regex = new RegExp(`\\b${formal}\\b`, 'g');
            result = result.replace(regex, informal);
        }
        
        // Remover espaços duplos que possam ter sido criados
        result = result.replace(/\s{2,}/g, ' ').trim();
        
        // Casualizar pontuação
        result = this.casualizePunctuation(result);
        
        return result;
    }
    
    /**
     * Casualiza pontuação (menos formal)
     */
    casualizePunctuation(text) {
        let result = text;
        
        // Múltiplas exclamações → uma única
        result = result.replace(/!{2,}/g, '!');
        
        // Múltiplas interrogações → uma única
        result = result.replace(/\?{2,}/g, '?');
        
        // Ponto final + espaço + letra maiúscula → vírgula (mais casual)
        // Mas apenas se não for fim de texto
        result = result.replace(/\.\s+([A-Z])/g, (match, letter) => {
            // 30% de chance de manter o ponto
            return Math.random() < 0.3 ? match : `, ${letter.toLowerCase()}`;
        });
        
        return result;
    }
    
    /**
     * Adiciona gírias se necessário
     */
    addSlangIfNeeded(text, intensity = 0.3) {
        if (Math.random() > intensity) {
            return text; // Não adicionar sempre
        }
        
        const prefixes = ['pô', 'cara', 'mano', 'rapaz'];
        const suffixes = ['né', 'pô', 'cara', 'saca'];
        
        let result = text;
        
        // 50% chance de adicionar no início
        if (Math.random() < 0.5 && !text.match(/^(pô|cara|mano|opa|e aí)/i)) {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            result = `${prefix}, ${result}`;
        }
        
        // 30% chance de adicionar no final
        if (Math.random() < 0.3 && !text.match(/(né|pô|cara|saca)$/i)) {
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            result = `${result.replace(/[.!?]$/, '')}, ${suffix}`;
        }
        
        return result;
    }
    
    /**
     * Usa IA auxiliar para ajustar estilo (quando necessário)
     */
    async applyAIFix(text, targetStyle = 'daci', timeout = 5000) {
        if (!this.processor) {
            logger.warn('style-enforcer', 'Processor não disponível para IA auxiliar');
            return text;
        }
        
        try {
            const aiPackage = {
                prompt: {
                    system: `Você é um assistente que converte texto formal em linguagem informal brasileira.
                    
ESTILO ALVO:
- Use linguagem coloquial brasileira
- Gírias naturais: mano, cara, pô, massa, top
- Contrações: você→cê, para→pra, está→tá
- Tom casual e amigável
- SEM emojis (já serão adicionados depois)
- Mantenha o significado original

IMPORTANTE: Retorne APENAS o texto convertido, sem explicações.`,
                    user: `Converta este texto para linguagem informal brasileira:\n\n"${text}"`
                },
                parameters: {
                    temperature: 0.7,
                    maxTokens: 200
                },
                metadata: {
                    userId: 'system',
                    username: 'StyleEnforcer'
                }
            };
            
            // Timeout de 5 segundos
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            );
            
            const result = await Promise.race([
                this.processor.process(aiPackage),
                timeoutPromise
            ]);
            
            logger.info('style-enforcer', 'IA auxiliar aplicada com sucesso');
            return result.content;
            
        } catch (error) {
            logger.warn('style-enforcer', `IA auxiliar falhou: ${error.message}`);
            return text; // Retornar original se falhar
        }
    }
    
    /**
     * Força estilo Daci (método principal - híbrido)
     */
    async enforce(text, options = {}) {
        const { useAI = true, slangIntensity = 0.3 } = options;
        
        // 1. SEMPRE aplicar regras fixas primeiro
        let result = this.applyFixedRules(text);
        
        // 2. Calcular score após regras fixas
        const scoreAfterRules = this.analyzeStyle(result);
        logger.debug('style-enforcer', `Score após regras fixas: ${scoreAfterRules.toFixed(2)}`);
        
        // 3. Se score ainda baixo E IA disponível, tentar IA auxiliar
        if (scoreAfterRules < 0.6 && useAI && this.processor) {
            logger.info('style-enforcer', 'Score baixo, aplicando IA auxiliar...');
            const aiResult = await this.applyAIFix(result);
            
            // Verificar se IA melhorou
            const scoreAfterAI = this.analyzeStyle(aiResult);
            if (scoreAfterAI > scoreAfterRules) {
                logger.success('style-enforcer', `IA melhorou score: ${scoreAfterRules.toFixed(2)} → ${scoreAfterAI.toFixed(2)}`);
                result = aiResult;
            }
        }
        
        // 4. Adicionar gírias se ainda necessário
        if (slangIntensity > 0) {
            result = this.addSlangIfNeeded(result, slangIntensity);
        }
        
        // 5. Score final
        const finalScore = this.analyzeStyle(result);
        logger.info('style-enforcer', `Score final: ${finalScore.toFixed(2)}`);
        
        return result;
    }
}

module.exports = StyleEnforcer;

