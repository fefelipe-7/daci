/**
 * GoalPlanner - Planejamento multi-passo
 * Decompõe objetivos grandes em etapas menores e sugere próximas ações
 */

const logger = require('../Logger');

class GoalPlanner {
    constructor() {
        this.goalDatabase = this.initializeGoalDatabase();
        logger.debug('reasoning', 'GoalPlanner inicializado');
    }

    /**
     * Inicializa base de conhecimento de objetivos
     */
    initializeGoalDatabase() {
        return {
            // Objetivos e seus sub-objetivos
            'ficar rico': {
                steps: ['definir quanto é "rico"', 'conseguir fonte de renda', 'aprender a poupar', 'investir dinheiro', 'aumentar renda'],
                duration: 'anos',
                difficulty: 'high'
            },
            'aprender programação': {
                steps: ['escolher linguagem', 'aprender sintaxe básica', 'fazer exercícios', 'criar projetos pequenos', 'praticar diariamente'],
                duration: 'meses',
                difficulty: 'medium'
            },
            'emagrecer': {
                steps: ['definir meta de peso', 'ajustar alimentação', 'começar exercícios', 'criar rotina', 'manter consistência'],
                duration: 'meses',
                difficulty: 'medium'
            },
            'passar na prova': {
                steps: ['ver conteúdo da prova', 'estudar tópicos principais', 'fazer exercícios', 'revisar', 'descansar antes da prova'],
                duration: 'dias/semanas',
                difficulty: 'low-medium'
            },
            'arrumar emprego': {
                steps: ['atualizar currículo', 'procurar vagas', 'enviar candidaturas', 'preparar para entrevistas', 'fazer networking'],
                duration: 'semanas/meses',
                difficulty: 'medium'
            },
            'começar academia': {
                steps: ['escolher academia', 'fazer matrícula', 'definir dias', 'começar treino leve', 'criar hábito'],
                duration: 'semanas',
                difficulty: 'low'
            },
            'criar app': {
                steps: ['definir ideia', 'aprender ferramentas', 'fazer protótipo', 'desenvolver MVP', 'testar e melhorar'],
                duration: 'meses',
                difficulty: 'high'
            },
            'melhorar notas': {
                steps: ['identificar dificuldades', 'criar rotina de estudos', 'pedir ajuda', 'fazer exercícios', 'revisar regularmente'],
                duration: 'semanas/meses',
                difficulty: 'medium'
            }
        };
    }

    /**
     * Analisa mensagem para planejamento de objetivos
     */
    analyze(message, context = {}) {
        const insights = {
            type: 'goal_planning',
            detectedGoals: [],
            plans: [],
            nextActions: [],
            dependencies: [],
            warnings: [],
            confidence: 0
        };

        try {
            // 1. Detectar objetivos na mensagem
            const goals = this.detectGoals(message);
            
            if (goals.length > 0) {
                insights.detectedGoals = goals;
                insights.confidence = 0.7;

                // 2. Para cada objetivo, criar plano
                for (const goal of goals) {
                    const plan = this.createPlan(goal);
                    if (plan) {
                        insights.plans.push(plan);
                        insights.confidence = 0.8;

                        // 3. Sugerir próxima ação
                        const nextAction = this.suggestNextAction(plan, context);
                        if (nextAction) {
                            insights.nextActions.push(nextAction);
                        }

                        // 4. Identificar dependências
                        const deps = this.identifyDependencies(plan);
                        if (deps.length > 0) {
                            insights.dependencies.push(...deps);
                        }
                    }
                }

                // 5. Gerar warnings se objetivo é muito ambicioso
                for (const goal of goals) {
                    if (goal.difficulty === 'high') {
                        insights.warnings.push({
                            type: 'ambitious_goal',
                            goal: goal.text,
                            message: 'Objetivo complexo - vai precisar de tempo e dedicação'
                        });
                    }
                }
            }

        } catch (error) {
            logger.error('reasoning', 'Erro no GoalPlanner:', error);
        }

        return insights;
    }

    /**
     * Detecta objetivos na mensagem
     */
    detectGoals(message) {
        const goals = [];
        const lower = message.toLowerCase();

        // Padrões que indicam objetivo
        const goalPatterns = [
            /quero (.*?)(?:\.|!|$)/gi,
            /preciso (.*?)(?:\.|!|$)/gi,
            /vou (.*?)(?:\.|!|$)/gi,
            /como (?:fazer|faço|faço pra|fazer pra) (.*?)(?:\?|$)/gi,
            /queria (.*?)(?:\.|!|$)/gi,
            /gostaria de (.*?)(?:\.|!|$)/gi
        ];

        for (const pattern of goalPatterns) {
            const matches = [...message.matchAll(pattern)];
            for (const match of matches) {
                if (match[1]) {
                    const goalText = match[1].trim();
                    const goalData = this.matchGoalToDatabase(goalText);
                    
                    if (goalData) {
                        goals.push({
                            text: goalText,
                            normalized: goalData.normalized,
                            difficulty: goalData.difficulty,
                            duration: goalData.duration,
                            confidence: 0.8
                        });
                    } else {
                        // Objetivo não está no banco, mas ainda é um objetivo
                        goals.push({
                            text: goalText,
                            normalized: goalText,
                            difficulty: 'unknown',
                            duration: 'unknown',
                            confidence: 0.6
                        });
                    }
                }
            }
        }

        return goals;
    }

    /**
     * Tenta encontrar objetivo na base de dados
     */
    matchGoalToDatabase(goalText) {
        const lower = goalText.toLowerCase();

        // Busca exata
        for (const [key, data] of Object.entries(this.goalDatabase)) {
            if (lower.includes(key)) {
                return {
                    normalized: key,
                    ...data
                };
            }
        }

        // Busca por palavras-chave
        const keywords = {
            'dinheiro': 'ficar rico',
            'rico': 'ficar rico',
            'ganhar dinheiro': 'ficar rico',
            'programar': 'aprender programação',
            'código': 'aprender programação',
            'dev': 'aprender programação',
            'peso': 'emagrecer',
            'dieta': 'emagrecer',
            'gordo': 'emagrecer',
            'magro': 'emagrecer',
            'prova': 'passar na prova',
            'teste': 'passar na prova',
            'avaliação': 'passar na prova',
            'emprego': 'arrumar emprego',
            'trabalho': 'arrumar emprego',
            'vaga': 'arrumar emprego',
            'academia': 'começar academia',
            'malhar': 'começar academia',
            'treino': 'começar academia',
            'app': 'criar app',
            'aplicativo': 'criar app',
            'nota': 'melhorar notas',
            'notas': 'melhorar notas'
        };

        for (const [keyword, goal] of Object.entries(keywords)) {
            if (lower.includes(keyword)) {
                return {
                    normalized: goal,
                    ...this.goalDatabase[goal]
                };
            }
        }

        return null;
    }

    /**
     * Cria plano para um objetivo
     */
    createPlan(goal) {
        if (goal.normalized && this.goalDatabase[goal.normalized]) {
            const data = this.goalDatabase[goal.normalized];
            
            return {
                goal: goal.text,
                normalized: goal.normalized,
                steps: data.steps.map((step, index) => ({
                    order: index + 1,
                    description: step,
                    status: 'pending',
                    isFirst: index === 0,
                    isLast: index === data.steps.length - 1
                })),
                duration: data.duration,
                difficulty: data.difficulty,
                totalSteps: data.steps.length
            };
        }

        // Se não tem no banco, tentar criar plano genérico
        return this.createGenericPlan(goal);
    }

    /**
     * Cria plano genérico quando objetivo não está no banco
     */
    createGenericPlan(goal) {
        return {
            goal: goal.text,
            normalized: goal.text,
            steps: [
                { order: 1, description: 'Definir objetivo claramente', status: 'pending', isFirst: true },
                { order: 2, description: 'Pesquisar como fazer', status: 'pending' },
                { order: 3, description: 'Fazer um plano detalhado', status: 'pending' },
                { order: 4, description: 'Começar com pequenos passos', status: 'pending' },
                { order: 5, description: 'Manter consistência', status: 'pending', isLast: true }
            ],
            duration: 'depende',
            difficulty: 'unknown',
            totalSteps: 5,
            isGeneric: true
        };
    }

    /**
     * Sugere próxima ação baseada no plano
     */
    suggestNextAction(plan, context) {
        // Se tem contexto sobre progresso, sugerir próximo passo
        if (context.activeMemory && context.activeMemory.goalProgress) {
            const progress = context.activeMemory.goalProgress[plan.normalized];
            if (progress) {
                const nextStepIndex = progress.currentStep;
                if (nextStepIndex < plan.steps.length) {
                    return {
                        goal: plan.goal,
                        action: plan.steps[nextStepIndex].description,
                        stepNumber: nextStepIndex + 1,
                        totalSteps: plan.totalSteps,
                        priority: 'medium'
                    };
                }
            }
        }

        // Sem contexto, sugerir primeiro passo
        if (plan.steps.length > 0) {
            return {
                goal: plan.goal,
                action: plan.steps[0].description,
                stepNumber: 1,
                totalSteps: plan.totalSteps,
                priority: 'high',
                message: 'Comece por aqui'
            };
        }

        return null;
    }

    /**
     * Identifica dependências entre passos
     */
    identifyDependencies(plan) {
        const dependencies = [];

        // Para planos conhecidos, adicionar dependências específicas
        if (plan.normalized === 'criar app') {
            dependencies.push({
                step: 'desenvolver MVP',
                requires: ['aprender ferramentas', 'fazer protótipo'],
                reason: 'Precisa das habilidades e design antes'
            });
        }

        if (plan.normalized === 'ficar rico') {
            dependencies.push({
                step: 'investir dinheiro',
                requires: ['conseguir fonte de renda', 'aprender a poupar'],
                reason: 'Precisa ter dinheiro para investir'
            });
        }

        // Dependência genérica: passos devem ser feitos em ordem
        if (plan.steps.length > 1) {
            dependencies.push({
                type: 'sequential',
                message: 'Os passos devem ser seguidos em ordem',
                strictOrder: plan.normalized !== 'unknown'
            });
        }

        return dependencies;
    }

    /**
     * Verifica se usuário está progredindo em um objetivo
     */
    checkProgress(currentMessage, plan, context) {
        const progress = {
            goal: plan.goal,
            evidence: [],
            estimatedStep: 0,
            isProgressing: false
        };

        // Verificar se mensagem menciona algum passo do plano
        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];
            if (currentMessage.toLowerCase().includes(step.description.toLowerCase())) {
                progress.evidence.push({
                    step: i + 1,
                    description: step.description,
                    confidence: 0.7
                });
                progress.estimatedStep = i + 1;
                progress.isProgressing = true;
            }
        }

        return progress;
    }

    /**
     * Formata insights para inclusão no prompt
     */
    formatForPrompt(insights) {
        if (insights.confidence < 0.6) return '';

        let formatted = '\n## PLANEJAMENTO DE OBJETIVOS:\n';

        if (insights.detectedGoals.length > 0) {
            formatted += '- Objetivos detectados:\n';
            for (const goal of insights.detectedGoals) {
                formatted += `  🎯 ${goal.text}\n`;
            }
        }

        if (insights.plans.length > 0) {
            formatted += '\n- PLANOS:\n';
            for (const plan of insights.plans) {
                formatted += `  📋 ${plan.goal}:\n`;
                
                // Mostrar apenas primeiros 3 passos para não sobrecarregar
                const stepsToShow = plan.steps.slice(0, 3);
                for (const step of stepsToShow) {
                    formatted += `     ${step.order}. ${step.description}\n`;
                }
                
                if (plan.steps.length > 3) {
                    formatted += `     ... (${plan.steps.length - 3} passos a mais)\n`;
                }

                formatted += `     Duração estimada: ${plan.duration}\n`;
                formatted += `     Dificuldade: ${plan.difficulty}\n`;
            }
        }

        if (insights.nextActions.length > 0) {
            formatted += '\n- PRÓXIMA AÇÃO SUGERIDA:\n';
            for (const action of insights.nextActions) {
                formatted += `  💡 ${action.action} (passo ${action.stepNumber}/${action.totalSteps})\n`;
            }
        }

        if (insights.warnings.length > 0) {
            formatted += '\n- AVISOS:\n';
            for (const warn of insights.warnings) {
                formatted += `  ⚠️ ${warn.message}\n`;
            }
        }

        return formatted;
    }
}

module.exports = GoalPlanner;

