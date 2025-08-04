/**
 * GESTOR DE DRAFT
 * Maneja el sistema de draft de dinosaurios entre jugadores y bots
 */

export class GestorDraft {
    constructor(gestorBots) {
        this.gestorBots = gestorBots;
        this.jugadores = [];
        this.rondaActual = 1;
        this.turnoActual = 1;
        this.totalRondas = 2;
        this.turnosPorRonda = 6;
        this.jugadorActivo = 1; // ID del jugador activo (1 = humano)
        this.direccionDraft = 1; // 1 = horario, -1 = antihorario
        this.manosPorJugador = new Map();
        this.estadoJuego = 'esperando'; // esperando, jugando, completado
        this.jugadorConDado = 1; // Quién tiene el dado actualmente
        this.restriccionActual = null;
    }

    /**
     * Inicializa el sistema de draft
     */
    inicializarDraft(jugadorHumano, bots) {
        console.log('Inicializando sistema de draft...');
        
        // Configurar jugadores
        this.jugadores = [
            {
                id: 1,
                nombre: jugadorHumano.nombre,
                esBot: false,
                avatar: 'Jugador',
                tablero: this.inicializarTablero(),
                puntuacion: 0
            },
            ...bots
        ];

        // Inicializar manos vacías
        this.jugadores.forEach(jugador => {
            this.manosPorJugador.set(jugador.id, []);
        });

        this.estadoJuego = 'jugando';
        console.log('Sistema de draft inicializado con', this.jugadores.length, 'jugadores');
        
        // Comenzar primera ronda
        this.comenzarNuevaRonda();
    }

    /**
     * Inicializa un tablero vacío
     */
    inicializarTablero() {
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
     * Comienza una nueva ronda
     */
    async comenzarNuevaRonda() {
        console.log(`Comenzando Ronda ${this.rondaActual}`);
        
        // Cambiar dirección de draft en ronda 2
        if (this.rondaActual === 2) {
            this.direccionDraft = -1;
            console.log('Dirección de draft cambiada a antihorario');
        }

        // Generar nuevas manos para todos los jugadores
        await this.generarManosDinosaurios();
        
        // Determinar quién empieza con el dado
        this.jugadorConDado = this.rondaActual; // Ronda 1: jugador 1, Ronda 2: jugador 2, etc.
        if (this.jugadorConDado > this.jugadores.length) {
            this.jugadorConDado = 1;
        }

        // Lanzar dado inicial
        await this.lanzarDadoTurno();
        
        // Comenzar primer turno
        this.turnoActual = 1;
        this.jugadorActivo = 1; // Siempre empieza el jugador humano
        
        // Notificar inicio de ronda
        this.notificarEventoJuego('rondaIniciada', {
            ronda: this.rondaActual,
            direccion: this.direccionDraft === 1 ? 'horario' : 'antihorario',
            jugadorConDado: this.jugadorConDado
        });

        // Si el jugador activo es bot, procesar automáticamente
        if (this.esJugadorBot(this.jugadorActivo)) {
            await this.procesarTurnoBot();
        }
    }

    /**
     * Genera manos de 6 dinosaurios para todos los jugadores
     */
    async generarManosDinosaurios() {
        console.log('Generando manos de dinosaurios...');
        
        try {
            // Obtener dinosaurios disponibles del servidor
            const response = await fetch('obtener_dinosaurios_draft.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cantidadJugadores: this.jugadores.length,
                    dinosauriosPorJugador: 6
                })
            });

            if (!response.ok) {
                throw new Error('Error obteniendo dinosaurios del servidor');
            }

            const data = await response.json();
            
            // Asignar manos a cada jugador
            this.jugadores.forEach((jugador, index) => {
                const mano = data.manos[index] || [];
                this.manosPorJugador.set(jugador.id, mano);
                console.log(`${jugador.nombre} recibe ${mano.length} dinosaurios`);
            });

        } catch (error) {
            console.error('Error generando manos:', error);
            // Fallback: generar manos localmente
            this.generarManosLocalmente();
        }
    }

    /**
     * Genera manos localmente como fallback
     */
    generarManosLocalmente() {
        console.log('Generando manos localmente (fallback)');
        
        const familiasDinosaurios = [
            'T-Rex', 'Stegosaurus', 'Triceratops', 'Raptor', 
            'Sauropodo', 'Allosaurus'
        ];
        
        const tiposPorFamilia = {
            'T-Rex': 'carnivoro',
            'Stegosaurus': 'herbivoro',
            'Triceratops': 'herbivoro',
            'Raptor': 'carnivoro',
            'Sauropodo': 'herbivoro',
            'Allosaurus': 'carnivoro'
        };

        this.jugadores.forEach(jugador => {
            const mano = [];
            for (let i = 0; i < 6; i++) {
                const familiaAleatoria = familiasDinosaurios[Math.floor(Math.random() * familiasDinosaurios.length)];
                const dinosaurio = {
                    id: Date.now() + Math.random(),
                    nombre: `${familiaAleatoria} ${i + 1}`,
                    familia: familiaAleatoria,
                    tipo: tiposPorFamilia[familiaAleatoria]
                };
                mano.push(dinosaurio);
            }
            this.manosPorJugador.set(jugador.id, mano);
        });
    }

    /**
     * Lanza el dado para el turno actual
     */
    async lanzarDadoTurno() {
        const jugadorDado = this.jugadores.find(j => j.id === this.jugadorConDado);
        console.log(`${jugadorDado.nombre} lanza el dado`);

        // Generar restricción aleatoria
        const restricciones = [
            {
                codigo: 'BOSQUE',
                nombre: 'Bosque',
                descripcion: 'Solo se puede colocar en recintos del bosque',
                icono: 'Bosque'
            },
            {
                codigo: 'PRADERA',
                nombre: 'Pradera',
                descripcion: 'Solo se puede colocar en recintos de pradera',
                icono: 'Pradera'
            },
            {
                codigo: 'RECINTO_VACIO',
                nombre: 'Recinto Vacío',
                descripcion: 'Solo en recintos que no tengan dinosaurios',
                icono: 'Vacio'
            },
            {
                codigo: 'SIN_TREX',
                nombre: 'Sin T-Rex',
                descripcion: 'Solo en recintos que no tengan T-Rex',
                icono: 'Sin T-Rex'
            }
        ];

        this.restriccionActual = restricciones[Math.floor(Math.random() * restricciones.length)];
        
        // Notificar resultado del dado
        this.notificarEventoJuego('dadoLanzado', {
            jugador: jugadorDado,
            restriccion: this.restriccionActual
        });

        // Rotar el dado al siguiente jugador para el próximo turno
        this.jugadorConDado = this.obtenerSiguienteJugador(this.jugadorConDado);
    }

    /**
     * Procesa la selección de un jugador humano
     */
    async procesarSeleccionHumano(dinosaurioSeleccionado, recintoSeleccionado) {
        if (this.jugadorActivo !== 1) {
            console.warn('No es el turno del jugador humano');
            return false;
        }

        const jugador = this.jugadores[0]; // Jugador humano siempre es el primero
        const manoActual = this.manosPorJugador.get(1);
        
        // Verificar que el dinosaurio está en la mano
        const dinosaurio = manoActual.find(d => d.id === dinosaurioSeleccionado);
        if (!dinosaurio) {
            console.warn('Dinosaurio no encontrado en la mano');
            return false;
        }

        // Validar colocación
        if (!this.validarColocacion(jugador, dinosaurio, recintoSeleccionado)) {
            console.warn('Colocación no válida');
            return false;
        }

        // Realizar colocación
        jugador.tablero[recintoSeleccionado].push(dinosaurio);
        
        // Remover dinosaurio de la mano
        const nuevaMano = manoActual.filter(d => d.id !== dinosaurioSeleccionado);
        this.manosPorJugador.set(1, nuevaMano);

        console.log(`${jugador.nombre} coloca ${dinosaurio.nombre} en recinto ${recintoSeleccionado}`);

        // Notificar colocación
        this.notificarEventoJuego('dinosaurioColocado', {
            jugador: jugador,
            dinosaurio: dinosaurio,
            recinto: recintoSeleccionado
        });

        // Continuar con el siguiente turno
        await this.avanzarTurno();
        return true;
    }

    /**
     * Procesa el turno de un bot
     */
    async procesarTurnoBot() {
        const jugador = this.jugadores.find(j => j.id === this.jugadorActivo);
        if (!jugador || !jugador.esBot) {
            console.warn('Jugador activo no es un bot');
            return;
        }

        const manoActual = this.manosPorJugador.get(this.jugadorActivo);
        if (!manoActual || manoActual.length === 0) {
            console.warn('Bot no tiene dinosaurios en la mano');
            await this.avanzarTurno();
            return;
        }

        console.log(`Procesando turno de ${jugador.nombre}...`);

        // Notificar que el bot está pensando
        this.notificarEventoJuego('botPensando', {
            jugador: jugador,
            manoSize: manoActual.length
        });

        try {
            // Bot selecciona dinosaurio y recinto
            const seleccion = await this.gestorBots.seleccionarDinosaurioBot(
                this.jugadorActivo, 
                manoActual, 
                this.restriccionActual, 
                this.rondaActual
            );

            if (!seleccion) {
                console.warn('Bot no pudo hacer selección');
                await this.avanzarTurno();
                return;
            }

            // Validar y realizar colocación
            if (this.validarColocacion(jugador, seleccion.dinosaurio, seleccion.recinto)) {
                // Colocar en tablero del bot
                this.gestorBots.colocarDinosaurioBot(
                    this.jugadorActivo, 
                    seleccion.dinosaurio, 
                    seleccion.recinto
                );

                // Remover de la mano
                const nuevaMano = manoActual.filter(d => d.id !== seleccion.dinosaurio.id);
                this.manosPorJugador.set(this.jugadorActivo, nuevaMano);

                // Notificar colocación
                this.notificarEventoJuego('dinosaurioColocado', {
                    jugador: jugador,
                    dinosaurio: seleccion.dinosaurio,
                    recinto: seleccion.recinto
                });

            } else {
                console.warn('Colocación del bot no válida, usando río como fallback');
                
                // Fallback: colocar en el río
                jugador.tablero[7].push(seleccion.dinosaurio);
                const nuevaMano = manoActual.filter(d => d.id !== seleccion.dinosaurio.id);
                this.manosPorJugador.set(this.jugadorActivo, nuevaMano);
            }

        } catch (error) {
            console.error('Error procesando turno del bot:', error);
        }

        // Continuar con el siguiente turno
        await this.avanzarTurno();
    }

    /**
     * Avanza al siguiente turno
     */
    async avanzarTurno() {
        // Pasar manos al siguiente jugador (draft)
        await this.pasarManos();

        // Verificar si el turno ha terminado
        if (this.todasManosVacias()) {
            await this.finalizarTurno();
            return;
        }

        // Avanzar al siguiente jugador
        this.jugadorActivo = this.obtenerSiguienteJugador(this.jugadorActivo);

        // Notificar cambio de jugador
        this.notificarEventoJuego('jugadorCambiado', {
            jugadorActivo: this.jugadores.find(j => j.id === this.jugadorActivo),
            turno: this.turnoActual,
            ronda: this.rondaActual
        });

        // Si es bot, procesar automáticamente
        if (this.esJugadorBot(this.jugadorActivo)) {
            // Pequeña pausa para que se vea la transición
            setTimeout(() => {
                this.procesarTurnoBot();
            }, 1000);
        }
    }

    /**
     * Pasa las manos al siguiente jugador (mecánica de draft)
     */
    async pasarManos() {
        const nuevasManos = new Map();
        
        this.jugadores.forEach(jugador => {
            const siguienteJugadorId = this.obtenerSiguienteJugador(jugador.id);
            const manoActual = this.manosPorJugador.get(jugador.id);
            nuevasManos.set(siguienteJugadorId, manoActual);
        });

        // Actualizar todas las manos simultáneamente
        this.manosPorJugador = nuevasManos;

        console.log('Manos pasadas al siguiente jugador');
    }

    /**
     * Obtiene el siguiente jugador según la dirección del draft
     */
    obtenerSiguienteJugador(jugadorActualId) {
        const indiceActual = this.jugadores.findIndex(j => j.id === jugadorActualId);
        let siguienteIndice;

        if (this.direccionDraft === 1) {
            // Horario
            siguienteIndice = (indiceActual + 1) % this.jugadores.length;
        } else {
            // Antihorario
            siguienteIndice = (indiceActual - 1 + this.jugadores.length) % this.jugadores.length;
        }

        return this.jugadores[siguienteIndice].id;
    }

    /**
     * Verifica si todas las manos están vacías
     */
    todasManosVacias() {
        return Array.from(this.manosPorJugador.values()).every(mano => mano.length === 0);
    }

    /**
     * Finaliza el turno actual
     */
    async finalizarTurno() {
        console.log(`Turno ${this.turnoActual} completado`);
        
        this.turnoActual++;
        
        if (this.turnoActual > this.turnosPorRonda) {
            await this.finalizarRonda();
        } else {
            // Lanzar dado para el siguiente turno
            await this.lanzarDadoTurno();
            
            // Generar nuevas manos para el siguiente turno
            await this.generarManosDinosaurios();
            
            // Reiniciar con el jugador humano
            this.jugadorActivo = 1;
            
            // Notificar nuevo turno
            this.notificarEventoJuego('nuevoTurno', {
                turno: this.turnoActual,
                ronda: this.rondaActual
            });

            // Si es bot, procesar automáticamente
            if (this.esJugadorBot(this.jugadorActivo)) {
                setTimeout(() => {
                    this.procesarTurnoBot();
                }, 1000);
            }
        }
    }

    /**
     * Finaliza la ronda actual
     */
    async finalizarRonda() {
        console.log(`Ronda ${this.rondaActual} completada`);
        
        this.notificarEventoJuego('rondaCompletada', {
            ronda: this.rondaActual
        });

        this.rondaActual++;
        
        if (this.rondaActual > this.totalRondas) {
            await this.finalizarJuego();
        } else {
            // Comenzar siguiente ronda
            setTimeout(() => {
                this.comenzarNuevaRonda();
            }, 2000);
        }
    }

    /**
     * Finaliza el juego y calcula puntuaciones
     */
    async finalizarJuego() {
        console.log('Juego completado, calculando puntuaciones...');
        
        this.estadoJuego = 'completado';
        
        // Calcular puntuaciones finales
        const puntuaciones = [];
        
        this.jugadores.forEach(jugador => {
            let puntuacion = 0;
            
            if (jugador.esBot) {
                puntuacion = this.gestorBots.calcularPuntuacionBot(jugador.id);
            } else {
                puntuacion = this.calcularPuntuacionJugador(jugador);
            }
            
            puntuaciones.push({
                jugador: jugador,
                puntuacion: puntuacion
            });
        });

        // Ordenar por puntuación descendente
        puntuaciones.sort((a, b) => b.puntuacion - a.puntuacion);
        
        // Notificar fin del juego
        this.notificarEventoJuego('juegoCompletado', {
            puntuaciones: puntuaciones,
            ganador: puntuaciones[0]
        });

        console.log('Resultados finales:', puntuaciones);
    }

    /**
     * Calcula la puntuación del jugador humano
     */
    calcularPuntuacionJugador(jugador) {
        // Esta lógica debería ser la misma que en calcular_puntos.php
        let puntuacionTotal = 0;
        
        Object.entries(jugador.tablero).forEach(([recintoId, dinosaurios]) => {
            puntuacionTotal += this.calcularPuntosRecinto(parseInt(recintoId), dinosaurios, jugador.tablero);
        });
        
        // Bonus T-Rex
        let bonusTrex = 0;
        Object.values(jugador.tablero).forEach(recinto => {
            if (recinto.some(d => d.familia === 'T-Rex')) {
                bonusTrex++;
            }
        });
        
        puntuacionTotal += bonusTrex;
        return puntuacionTotal;
    }

    /**
     * Calcula puntos de un recinto (misma lógica que en gestor-bots)
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
     * Valida si una colocación es válida
     */
    validarColocacion(jugador, dinosaurio, recintoId) {
        const recinto = jugador.tablero[recintoId];
        
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
        return this.verificarRestriccionDado(jugador, recintoId);
    }

    /**
     * Verifica restricciones del dado
     */
    verificarRestriccionDado(jugador, recintoId) {
        if (!this.restriccionActual) return true;
        
        switch (this.restriccionActual.codigo) {
            case 'BOSQUE':
                return [1, 4, 5].includes(recintoId);
            case 'PRADERA':
                return [2, 3, 6].includes(recintoId);
            case 'RECINTO_VACIO':
                return jugador.tablero[recintoId].length === 0;
            case 'SIN_TREX':
                return !jugador.tablero[recintoId].some(d => d.familia === 'T-Rex');
            default:
                return true;
        }
    }

    /**
     * Verifica si un jugador es bot
     */
    esJugadorBot(jugadorId) {
        const jugador = this.jugadores.find(j => j.id === jugadorId);
        return jugador && jugador.esBot;
    }

    /**
     * Utilidades para verificar familias
     */
    todasMismaFamilia(dinosaurios) {
        if (dinosaurios.length === 0) return false;
        const primeraFamilia = dinosaurios[0].familia;
        return dinosaurios.every(d => d.familia === primeraFamilia);
    }

    todasFamiliasDiferentes(dinosaurios) {
        const familias = new Set(dinosaurios.map(d => d.familia));
        return familias.size === dinosaurios.length;
    }

    /**
     * Notifica eventos del juego
     */
    notificarEventoJuego(tipoEvento, datos) {
        const evento = new CustomEvent('eventoJuegoDraft', {
            detail: {
                tipo: tipoEvento,
                datos: datos,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(evento);
        console.log(`Evento: ${tipoEvento}`, datos);
    }

    /**
     * Obtiene el estado actual del draft
     */
    obtenerEstadoDraft() {
        return {
            rondaActual: this.rondaActual,
            turnoActual: this.turnoActual,
            jugadorActivo: this.jugadorActivo,
            jugadorConDado: this.jugadorConDado,
            restriccionActual: this.restriccionActual,
            direccionDraft: this.direccionDraft,
            estadoJuego: this.estadoJuego,
            jugadores: this.jugadores.map(j => ({
                id: j.id,
                nombre: j.nombre,
                esBot: j.esBot,
                avatar: j.avatar,
                manoSize: this.manosPorJugador.get(j.id)?.length || 0,
                dinosauriosColocados: Object.values(j.tablero).flat().length
            }))
        };
    }

    /**
     * Obtiene la mano del jugador humano
     */
    obtenerManoJugador() {
        return this.manosPorJugador.get(1) || [];
    }

    /**
     * Destruye el gestor de draft
     */
    destruir() {
        this.jugadores = [];
        this.manosPorJugador.clear();
        this.estadoJuego = 'destruido';
        console.log('Gestor de Draft destruido');
    }
}