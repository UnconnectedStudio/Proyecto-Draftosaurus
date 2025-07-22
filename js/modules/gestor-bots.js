/**
 * GESTOR DE BOTS
 * Maneja la inteligencia artificial de los bots en Draftosaurus
 */

export class GestorBots {
    constructor() {
        this.bots = [];
        this.dificultades = {
            FACIL: 'facil',
            MEDIO: 'medio',
            DIFICIL: 'dificil'
        };
        this.estrategias = {
            AGRESIVA: 'agresiva',
            DEFENSIVA: 'defensiva',
            EQUILIBRADA: 'equilibrada',
            ESPECIALISTA: 'especialista'
        };
    }

    /**
     * Inicializa los bots para la partida
     */
    inicializarBots(configuracion = {}) {
        const nombresBot = [
            'Dr. Paleonto', 'Rex Hunter', 'Dino Master'
        ];
        
        const avatares = ['🤖', '🦖', '🧠'];
        
        this.bots = [];
        
        for (let i = 0; i < 3; i++) {
            const bot = {
                id: i + 2, // El jugador humano es ID 1
                nombre: nombresBot[i],
                avatar: avatares[i],
                esBot: true,
                dificultad: configuracion.dificultad || this.dificultades.MEDIO,
                estrategia: this.obtenerEstrategiaAleatoria(),
                manoActual: [],
                tablero: this.inicializarTableroBot(),
                puntuacion: 0,
                estadisticas: {
                    dinosauriosColocados: 0,
                    recintosCompletados: 0,
                    bonusTrex: 0
                }
            };
            
            this.bots.push(bot);
        }
        
        console.log('🤖 Bots inicializados:', this.bots.length);
        return this.bots;
    }

    /**
     * Inicializa el tablero de un bot
     */
    inicializarTableroBot() {
        return {
            1: [], // Bosque de lo Mismo
            2: [], // Pradera de lo Diferente  
            3: [], // Pradera de Parejas
            4: [], // Trío Arbóreo
            5: [], // Rey de la Selva
            6: [], // Isla Solitaria
            7: []  // El Río
        };
    }

    /**
     * Obtiene una estrategia aleatoria para el bot
     */
    obtenerEstrategiaAleatoria() {
        const estrategias = Object.values(this.estrategias);
        return estrategias[Math.floor(Math.random() * estrategias.length)];
    }

    /**
     * Bot selecciona un dinosaurio de su mano
     */
    seleccionarDinosaurioBot(botId, manoDisponible, restriccionDado = null, ronda = 1) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot || !manoDisponible || manoDisponible.length === 0) {
            return null;
        }

        // Simular tiempo de pensamiento
        const tiempoPensamiento = this.calcularTiempoPensamiento(bot.dificultad);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const seleccion = this.ejecutarEstrategiaSeleccion(bot, manoDisponible, restriccionDado, ronda);
                resolve(seleccion);
            }, tiempoPensamiento);
        });
    }

    /**
     * Calcula el tiempo de pensamiento según la dificultad
     */
    calcularTiempoPensamiento(dificultad) {
        switch (dificultad) {
            case this.dificultades.FACIL:
                return Math.random() * 1000 + 500; // 0.5-1.5s
            case this.dificultades.MEDIO:
                return Math.random() * 2000 + 1000; // 1-3s
            case this.dificultades.DIFICIL:
                return Math.random() * 3000 + 2000; // 2-5s
            default:
                return 1500;
        }
    }

    /**
     * Ejecuta la estrategia de selección del bot
     */
    ejecutarEstrategiaSeleccion(bot, manoDisponible, restriccionDado, ronda) {
        const evaluaciones = manoDisponible.map(dinosaurio => {
            return {
                dinosaurio,
                puntuacion: this.evaluarDinosaurio(bot, dinosaurio, restriccionDado, ronda)
            };
        });

        // Ordenar por puntuación descendente
        evaluaciones.sort((a, b) => b.puntuacion - a.puntuacion);

        // Aplicar factor de aleatoriedad según dificultad
        const indiceSeleccion = this.aplicarFactorAleatorio(bot.dificultad, evaluaciones.length);
        
        const seleccionado = evaluaciones[indiceSeleccion];
        
        console.log(`🤖 ${bot.nombre} selecciona: ${seleccionado.dinosaurio.nombre} (puntuación: ${seleccionado.puntuacion})`);
        
        return {
            dinosaurio: seleccionado.dinosaurio,
            recinto: this.seleccionarRecintoOptimo(bot, seleccionado.dinosaurio, restriccionDado)
        };
    }

    /**
     * Evalúa qué tan valioso es un dinosaurio para el bot
     */
    evaluarDinosaurio(bot, dinosaurio, restriccionDado, ronda) {
        let puntuacion = 0;
        
        // Evaluar cada recinto posible
        for (let recintoId = 1; recintoId <= 7; recintoId++) {
            const puntuacionRecinto = this.evaluarColocacionEnRecinto(
                bot, dinosaurio, recintoId, restriccionDado
            );
            puntuacion = Math.max(puntuacion, puntuacionRecinto);
        }

        // Aplicar modificadores según estrategia
        puntuacion = this.aplicarModificadoresEstrategia(bot, dinosaurio, puntuacion, ronda);
        
        return puntuacion;
    }

    /**
     * Evalúa la colocación de un dinosaurio en un recinto específico
     */
    evaluarColocacionEnRecinto(bot, dinosaurio, recintoId, restriccionDado) {
        const recinto = bot.tablero[recintoId];
        
        // Verificar si la colocación es válida
        if (!this.esColocacionValida(bot, dinosaurio, recintoId, restriccionDado)) {
            return -1000; // Penalización por colocación inválida
        }

        let puntuacion = 0;

        switch (recintoId) {
            case 1: // Bosque de lo Mismo
                puntuacion = this.evaluarBosqueMismo(recinto, dinosaurio);
                break;
            case 2: // Pradera de lo Diferente
                puntuacion = this.evaluarPraderaDiferente(recinto, dinosaurio);
                break;
            case 3: // Pradera de Parejas
                puntuacion = this.evaluarPraderaParejas(recinto, dinosaurio);
                break;
            case 4: // Trío Arbóreo
                puntuacion = this.evaluarTrioArboreo(recinto, dinosaurio);
                break;
            case 5: // Rey de la Selva
                puntuacion = this.evaluarReySelva(recinto, dinosaurio);
                break;
            case 6: // Isla Solitaria
                puntuacion = this.evaluarIslaSolitaria(bot, dinosaurio);
                break;
            case 7: // El Río
                puntuacion = this.evaluarRio(recinto, dinosaurio);
                break;
        }

        // Bonus por T-Rex
        if (dinosaurio.familia === 'T-Rex') {
            puntuacion += 10; // Bonus por el punto extra
        }

        return puntuacion;
    }

    /**
     * Evaluaciones específicas por recinto
     */
    evaluarBosqueMismo(recinto, dinosaurio) {
        if (recinto.length === 0) {
            return 50; // Buena opción para empezar
        }
        
        if (recinto[0].familia === dinosaurio.familia) {
            // Puntuación progresiva: 1→1, 2→3, 3→6, 4→10
            const puntuaciones = [0, 10, 30, 60, 100];
            return puntuaciones[recinto.length] || 0;
        }
        
        return -1000; // No se puede colocar
    }

    evaluarPraderaDiferente(recinto, dinosaurio) {
        const familiasExistentes = recinto.map(d => d.familia);
        
        if (familiasExistentes.includes(dinosaurio.familia)) {
            return -1000; // No se puede colocar
        }
        
        // Puntuación progresiva por diversidad
        const puntuaciones = [0, 10, 30, 60, 100];
        return puntuaciones[recinto.length] || 0;
    }

    evaluarPraderaParejas(recinto, dinosaurio) {
        const conteoFamilias = {};
        recinto.forEach(d => {
            conteoFamilias[d.familia] = (conteoFamilias[d.familia] || 0) + 1;
        });
        
        const cantidadActual = conteoFamilias[dinosaurio.familia] || 0;
        
        if (cantidadActual === 1) {
            return 80; // Completar pareja es muy valioso
        } else if (cantidadActual === 0) {
            return 30; // Empezar nueva familia
        }
        
        return 10; // Valor base
    }

    evaluarTrioArboreo(recinto, dinosaurio) {
        if (recinto.length >= 3) {
            return -1000; // Recinto lleno
        }
        
        if (recinto.length === 2) {
            return 100; // Completar trío es muy valioso
        }
        
        return 40; // Valor moderado
    }

    evaluarReySelva(recinto, dinosaurio) {
        if (recinto.length > 0) {
            return -1000; // Solo 1 dinosaurio
        }
        
        return 70; // Valor alto por ser garantizado
    }

    evaluarIslaSolitaria(bot, dinosaurio) {
        // Verificar si ya tiene esta familia en otros recintos
        let cantidadTotal = 0;
        Object.values(bot.tablero).forEach(recinto => {
            cantidadTotal += recinto.filter(d => d.familia === dinosaurio.familia).length;
        });
        
        if (cantidadTotal === 0) {
            return 70; // Muy valioso si es único
        }
        
        return -1000; // No es único
    }

    evaluarRio(recinto, dinosaurio) {
        return 20; // Valor base, siempre disponible
    }

    /**
     * Verifica si una colocación es válida
     */
    esColocacionValida(bot, dinosaurio, recintoId, restriccionDado) {
        const recinto = bot.tablero[recintoId];
        
        // Verificar capacidad
        const capacidades = {1: 4, 2: 4, 3: 6, 4: 3, 5: 1, 6: 1, 7: 99};
        if (recinto.length >= capacidades[recintoId]) {
            return false;
        }
        
        // Verificar reglas del recinto
        switch (recintoId) {
            case 1: // Bosque de lo Mismo
                return recinto.length === 0 || recinto[0].familia === dinosaurio.familia;
            case 2: // Pradera de lo Diferente
                return !recinto.some(d => d.familia === dinosaurio.familia);
            case 5: // Rey de la Selva
            case 6: // Isla Solitaria
                return recinto.length === 0;
        }
        
        // Verificar restricciones del dado
        return this.verificarRestriccionDado(bot, recintoId, restriccionDado);
    }

    /**
     * Verifica restricciones del dado
     */
    verificarRestriccionDado(bot, recintoId, restriccionDado) {
        if (!restriccionDado) return true;
        
        switch (restriccionDado.codigo) {
            case 'BOSQUE':
                return [1, 4, 5].includes(recintoId); // Bosque de lo Mismo, Trío Arbóreo, Rey de la Selva
            case 'PRADERA':
                return [2, 3, 6].includes(recintoId); // Pradera Diferente, Parejas, Isla Solitaria
            case 'RECINTO_VACIO':
                return bot.tablero[recintoId].length === 0;
            case 'SIN_TREX':
                return !bot.tablero[recintoId].some(d => d.familia === 'T-Rex');
            default:
                return true;
        }
    }

    /**
     * Selecciona el recinto óptimo para un dinosaurio
     */
    seleccionarRecintoOptimo(bot, dinosaurio, restriccionDado) {
        let mejorRecinto = 7; // Por defecto el río
        let mejorPuntuacion = -1000;
        
        for (let recintoId = 1; recintoId <= 7; recintoId++) {
            const puntuacion = this.evaluarColocacionEnRecinto(bot, dinosaurio, recintoId, restriccionDado);
            
            if (puntuacion > mejorPuntuacion) {
                mejorPuntuacion = puntuacion;
                mejorRecinto = recintoId;
            }
        }
        
        return mejorRecinto;
    }

    /**
     * Aplica modificadores según la estrategia del bot
     */
    aplicarModificadoresEstrategia(bot, dinosaurio, puntuacionBase, ronda) {
        let modificador = 1;
        
        switch (bot.estrategia) {
            case this.estrategias.AGRESIVA:
                // Prefiere puntuaciones altas inmediatas
                if (puntuacionBase > 70) modificador = 1.3;
                break;
                
            case this.estrategias.DEFENSIVA:
                // Prefiere jugadas seguras
                if (puntuacionBase > 30 && puntuacionBase < 70) modificador = 1.2;
                break;
                
            case this.estrategias.EQUILIBRADA:
                // Sin modificadores especiales
                break;
                
            case this.estrategias.ESPECIALISTA:
                // Se enfoca en completar recintos específicos
                if (ronda === 1 && puntuacionBase > 50) modificador = 1.4;
                break;
        }
        
        return puntuacionBase * modificador;
    }

    /**
     * Aplica factor de aleatoriedad según dificultad
     */
    aplicarFactorAleatorio(dificultad, longitudArray) {
        switch (dificultad) {
            case this.dificultades.FACIL:
                // 40% probabilidad de elegir la mejor opción
                return Math.random() < 0.4 ? 0 : Math.floor(Math.random() * Math.min(3, longitudArray));
                
            case this.dificultades.MEDIO:
                // 70% probabilidad de elegir entre las 2 mejores
                return Math.random() < 0.7 ? Math.floor(Math.random() * Math.min(2, longitudArray)) : 
                       Math.floor(Math.random() * longitudArray);
                       
            case this.dificultades.DIFICIL:
                // 90% probabilidad de elegir la mejor opción
                return Math.random() < 0.9 ? 0 : Math.floor(Math.random() * Math.min(2, longitudArray));
                
            default:
                return 0;
        }
    }

    /**
     * Coloca un dinosaurio en el tablero del bot
     */
    colocarDinosaurioBot(botId, dinosaurio, recintoId) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return false;
        
        bot.tablero[recintoId].push(dinosaurio);
        bot.estadisticas.dinosauriosColocados++;
        
        // Verificar si completó un recinto
        if (this.verificarRecintoCompletado(bot.tablero[recintoId], recintoId)) {
            bot.estadisticas.recintosCompletados++;
        }
        
        // Verificar bonus T-Rex
        if (dinosaurio.familia === 'T-Rex') {
            bot.estadisticas.bonusTrex++;
        }
        
        console.log(`🤖 ${bot.nombre} coloca ${dinosaurio.nombre} en recinto ${recintoId}`);
        return true;
    }

    /**
     * Verifica si un recinto está completado según sus reglas
     */
    verificarRecintoCompletado(recinto, recintoId) {
        switch (recintoId) {
            case 1: // Bosque de lo Mismo
                return recinto.length === 4 && this.todasMismaFamilia(recinto);
            case 2: // Pradera de lo Diferente
                return recinto.length === 4 && this.todasFamiliasDiferentes(recinto);
            case 4: // Trío Arbóreo
                return recinto.length === 3;
            case 5: // Rey de la Selva
            case 6: // Isla Solitaria
                return recinto.length === 1;
            default:
                return false;
        }
    }

    /**
     * Verifica si todos los dinosaurios son de la misma familia
     */
    todasMismaFamilia(dinosaurios) {
        if (dinosaurios.length === 0) return false;
        const primeraFamilia = dinosaurios[0].familia;
        return dinosaurios.every(d => d.familia === primeraFamilia);
    }

    /**
     * Verifica si todos los dinosaurios son de familias diferentes
     */
    todasFamiliasDiferentes(dinosaurios) {
        const familias = new Set(dinosaurios.map(d => d.familia));
        return familias.size === dinosaurios.length;
    }

    /**
     * Obtiene el estado actual de todos los bots
     */
    obtenerEstadoBots() {
        return this.bots.map(bot => ({
            id: bot.id,
            nombre: bot.nombre,
            avatar: bot.avatar,
            estrategia: bot.estrategia,
            tablero: bot.tablero,
            estadisticas: bot.estadisticas,
            cantidadDinosaurios: Object.values(bot.tablero).flat().length
        }));
    }

    /**
     * Calcula la puntuación final de un bot
     */
    calcularPuntuacionBot(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return 0;
        
        let puntuacionTotal = 0;
        
        // Calcular puntos por cada recinto
        Object.entries(bot.tablero).forEach(([recintoId, dinosaurios]) => {
            puntuacionTotal += this.calcularPuntosRecinto(parseInt(recintoId), dinosaurios, bot.tablero);
        });
        
        // Agregar bonus T-Rex
        let bonusTrex = 0;
        Object.values(bot.tablero).forEach(recinto => {
            if (recinto.some(d => d.familia === 'T-Rex')) {
                bonusTrex++;
            }
        });
        
        puntuacionTotal += bonusTrex;
        bot.puntuacion = puntuacionTotal;
        
        return puntuacionTotal;
    }

    /**
     * Calcula puntos de un recinto específico
     */
    calcularPuntosRecinto(recintoId, dinosaurios, tableroCompleto) {
        if (dinosaurios.length === 0) return 0;
        
        switch (recintoId) {
            case 1: // Bosque de lo Mismo
                if (this.todasMismaFamilia(dinosaurios)) {
                    const puntos = [0, 1, 3, 6, 10];
                    return puntos[dinosaurios.length] || 0;
                }
                return 0;
                
            case 2: // Pradera de lo Diferente
                if (this.todasFamiliasDiferentes(dinosaurios)) {
                    const puntos = [0, 1, 3, 6, 10];
                    return puntos[dinosaurios.length] || 0;
                }
                return 0;
                
            case 3: // Pradera de Parejas
                const conteoFamilias = {};
                dinosaurios.forEach(d => {
                    conteoFamilias[d.familia] = (conteoFamilias[d.familia] || 0) + 1;
                });
                let pares = 0;
                Object.values(conteoFamilias).forEach(cantidad => {
                    pares += Math.floor(cantidad / 2);
                });
                return pares * 5;
                
            case 4: // Trío Arbóreo
                return dinosaurios.length === 3 ? 7 : 0;
                
            case 5: // Rey de la Selva
                return dinosaurios.length === 1 ? 7 : 0;
                
            case 6: // Isla Solitaria
                if (dinosaurios.length === 1) {
                    const familia = dinosaurios[0].familia;
                    const totalFamilia = Object.values(tableroCompleto).flat()
                        .filter(d => d.familia === familia).length;
                    return totalFamilia === 1 ? 7 : 0;
                }
                return 0;
                
            case 7: // El Río
                return dinosaurios.length;
                
            default:
                return 0;
        }
    }

    /**
     * Obtiene información de un bot específico
     */
    obtenerBot(botId) {
        return this.bots.find(b => b.id === botId);
    }

    /**
     * Resetea el estado de todos los bots
     */
    resetearBots() {
        this.bots.forEach(bot => {
            bot.tablero = this.inicializarTableroBot();
            bot.puntuacion = 0;
            bot.estadisticas = {
                dinosauriosColocados: 0,
                recintosCompletados: 0,
                bonusTrex: 0
            };
        });
        
        console.log('🔄 Bots reseteados');
    }

    /**
     * Destruye el gestor de bots
     */
    destruir() {
        this.bots = [];
        console.log('🧹 Gestor de Bots destruido');
    }
}