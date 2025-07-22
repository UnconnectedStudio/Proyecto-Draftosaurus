/**
 * GESTOR PRINCIPAL DEL JUEGO
 * Coordina todos los componentes del juego de Draftosaurus con sistema de draft y bots
 */

import { GestorDados } from './gestor-dados.js';
import { GestorTablero } from './gestor-tablero.js';
import { GestorBots } from './gestor-bots.js';
import { GestorDraft } from './gestor-draft.js';
import { RenderizadorMapa } from './renderizador-mapa.js';

export class GestorJuego {
    constructor() {
        this.gestorDados = new GestorDados();
        this.gestorBots = new GestorBots();
        this.gestorDraft = new GestorDraft(this.gestorBots);
        this.renderizadorMapa = null;
        this.jugadorHumano = null;
        this.estadoJuego = {
            modo: 'draft', // 'draft' o 'clasico'
            dinosaurioSeleccionado: null,
            recintoSeleccionado: null,
            juegoActivo: false,
            jugadores: []
        };
    }

    /**
     * Inicializa el gestor principal del juego
     */
    async inicializar() {
        try {
            console.log('🎮 Inicializando Gestor de Juego con sistema de draft...');
            
            // Inicializar renderizador de mapa
            const contenedorMapa = document.getElementById('tablero-container-placeholder');
            if (contenedorMapa) {
                this.renderizadorMapa = new RenderizadorMapa(contenedorMapa);
                this.renderizadorMapa.inicializar();
            }
            
            // Inicializar componentes básicos
            await this.gestorDados.inicializar();
            
            // Configurar eventos
            this.configurarEventos();
            
            // Obtener información del jugador humano
            await this.obtenerJugadorHumano();
            
            // Inicializar bots
            const bots = this.gestorBots.inicializarBots({
                dificultad: 'medio'
            });
            
            // Inicializar sistema de draft
            this.gestorDraft.inicializarDraft(this.jugadorHumano, bots);
            
            this.estadoJuego.juegoActivo = true;
            console.log('✅ Gestor de Juego con draft inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Gestor de Juego:', error);
            this.mostrarError('Error al inicializar el juego');
        }
    }

    /**
     * Configura eventos del juego
     */
    configurarEventos() {
        // Eventos del sistema de draft
        document.addEventListener('eventoJuegoDraft', (e) => {
            this.manejarEventoDraft(e.detail);
        });

        // Eventos del renderizador de mapa
        document.addEventListener('recintoClickeado', (e) => {
            this.seleccionarRecinto(e.detail.recinto.id);
        });

        // Eventos de selección de dinosaurios (nuevos botones modernos)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('boton-seleccionar-moderno') || 
                e.target.closest('.boton-seleccionar-moderno')) {
                const tarjeta = e.target.closest('[data-id-dinosaurio]');
                if (tarjeta) {
                    const dinosaurioId = parseInt(tarjeta.dataset.idDinosaurio);
                    this.seleccionarDinosaurio(dinosaurioId);
                }
            }
        });

        // Evento de confirmación de colocación
        const botonConfirmar = document.getElementById('boton-confirmar');
        if (botonConfirmar) {
            botonConfirmar.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmarColocacionDraft();
            });
        }

        // Evento de resetear selección
        const botonResetear = document.getElementById('boton-resetear');
        if (botonResetear) {
            botonResetear.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetearSelecciones();
            });
        }

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.manejarTeclado(e);
        });
    }

    /**
     * Obtiene información del jugador humano
     */
    async obtenerJugadorHumano() {
        // Obtener nombre del jugador desde el DOM o sesión
        const infoJuego = document.querySelector('.informacion-juego');
        let nombreJugador = 'Jugador 1';
        
        if (infoJuego) {
            const jugadorElement = infoJuego.querySelector('p:first-child');
            if (jugadorElement) {
                const match = jugadorElement.textContent.match(/Jugador:\s*(.+)/);
                if (match) {
                    nombreJugador = match[1].trim();
                }
            }
        }
        
        this.jugadorHumano = {
            id: 1,
            nombre: nombreJugador,
            esBot: false,
            avatar: '👤'
        };
        
        console.log('👤 Jugador humano:', this.jugadorHumano);
    }

    /**
     * Maneja eventos del sistema de draft
     */
    manejarEventoDraft(detalle) {
        const { tipo, datos } = detalle;
        
        switch (tipo) {
            case 'rondaIniciada':
                this.manejarRondaIniciada(datos);
                break;
            case 'dadoLanzado':
                this.manejarDadoLanzado(datos);
                break;
            case 'jugadorCambiado':
                this.manejarJugadorCambiado(datos);
                break;
            case 'dinosaurioColocado':
                this.manejarDinosaurioColocadoDraft(datos);
                break;
            case 'botPensando':
                this.manejarBotPensando(datos);
                break;
            case 'nuevoTurno':
                this.manejarNuevoTurno(datos);
                break;
            case 'rondaCompletada':
                this.manejarRondaCompletada(datos);
                break;
            case 'juegoCompletado':
                this.manejarJuegoCompletado(datos);
                break;
        }
    }

    /**
     * Maneja el inicio de una nueva ronda
     */
    manejarRondaIniciada(datos) {
        console.log(`🎯 Ronda ${datos.ronda} iniciada`);
        
        this.mostrarNotificacion(
            `¡Ronda ${datos.ronda} iniciada! Dirección: ${datos.direccion}`, 
            'info'
        );
        
        // Actualizar UI con información de la ronda
        this.actualizarInfoRonda(datos);
        
        // Actualizar mano del jugador
        this.actualizarManoJugador();
    }

    /**
     * Maneja el lanzamiento del dado
     */
    manejarDadoLanzado(datos) {
        console.log('🎲 Dado lanzado por:', datos.jugador.nombre);
        
        // Aplicar restricción visual usando el gestor de dados
        this.gestorDados.aplicarRestriccion(datos.restriccion);
        
        // Actualizar renderizador de mapa si existe
        if (this.renderizadorMapa) {
            this.renderizadorMapa.actualizarEstado({
                restriccionActual: datos.restriccion
            });
        }
        
        this.mostrarNotificacion(
            `${datos.jugador.nombre} lanza el dado: ${datos.restriccion.nombre}`,
            'info'
        );
    }

    /**
     * Maneja el cambio de jugador activo
     */
    manejarJugadorCambiado(datos) {
        console.log('🔄 Turno de:', datos.jugadorActivo.nombre);
        
        // Actualizar UI para mostrar jugador activo
        this.actualizarJugadorActivo(datos.jugadorActivo);
        
        // Si es el turno del jugador humano, habilitar controles
        if (datos.jugadorActivo.id === 1) {
            this.habilitarControlesJugador();
            this.mostrarNotificacion('¡Es tu turno!', 'success');
        } else {
            this.deshabilitarControlesJugador();
            this.mostrarNotificacion(`Turno de ${datos.jugadorActivo.nombre}`, 'info');
        }
    }

    /**
     * Maneja la colocación de dinosaurios en el sistema de draft
     */
    manejarDinosaurioColocadoDraft(datos) {
        console.log('🦕 Dinosaurio colocado:', datos.dinosaurio.nombre, 'en recinto', datos.recinto);
        
        // Actualizar visualización en el mapa
        if (this.renderizadorMapa) {
            this.renderizadorMapa.colocarDinosaurioVisual(
                datos.recinto, 
                datos.dinosaurio, 
                0 // posición en el recinto
            );
        }
        
        // Actualizar información de jugadores
        this.actualizarInfoJugadores();
    }

    /**
     * Maneja cuando un bot está pensando
     */
    manejarBotPensando(datos) {
        console.log('🤖 Bot pensando:', datos.jugador.nombre);
        
        this.mostrarNotificacion(
            `${datos.jugador.nombre} está pensando... (${datos.manoSize} dinosaurios)`,
            'info'
        );
        
        // Mostrar indicador visual de bot pensando
        this.mostrarIndicadorBotPensando(datos.jugador);
    }

    /**
     * Maneja el inicio de un nuevo turno
     */
    manejarNuevoTurno(datos) {
        console.log(`🎯 Nuevo turno ${datos.turno} de la ronda ${datos.ronda}`);
        
        // Actualizar mano del jugador
        this.actualizarManoJugador();
        
        // Resetear selecciones
        this.resetearSelecciones();
        
        this.mostrarNotificacion(
            `Turno ${datos.turno} - ¡Nuevos dinosaurios!`,
            'info'
        );
    }

    /**
     * Maneja la finalización de una ronda
     */
    manejarRondaCompletada(datos) {
        console.log(`🏁 Ronda ${datos.ronda} completada`);
        
        this.mostrarNotificacion(
            `¡Ronda ${datos.ronda} completada!`,
            'success'
        );
    }

    /**
     * Maneja la finalización del juego
     */
    manejarJuegoCompletado(datos) {
        console.log('🏆 Juego completado');
        
        this.estadoJuego.juegoActivo = false;
        
        // Mostrar resultados
        this.mostrarResultadosFinales(datos.puntuaciones, datos.ganador);
    }

    /**
     * Confirma la colocación en el sistema de draft
     */
    async confirmarColocacionDraft() {
        if (!this.verificarPuedeConfirmar()) {
            this.mostrarError('Selecciona un dinosaurio y un recinto');
            return;
        }

        const { dinosaurioSeleccionado, recintoSeleccionado } = this.estadoJuego;
        
        try {
            // Mostrar indicador de carga
            this.mostrarCargando(true);

            // Procesar selección a través del gestor de draft
            const exito = await this.gestorDraft.procesarSeleccionHumano(
                dinosaurioSeleccionado.id, 
                recintoSeleccionado
            );
            
            if (exito) {
                // Resetear selecciones
                this.resetearSelecciones();
                
                this.mostrarNotificacion('¡Dinosaurio colocado exitosamente!', 'success');
            } else {
                this.mostrarError('Error al colocar el dinosaurio');
            }
            
        } catch (error) {
            console.error('❌ Error confirmando colocación draft:', error);
            this.mostrarError('Error inesperado al colocar el dinosaurio');
        } finally {
            this.mostrarCargando(false);
        }
    }

    /**
     * Actualiza la mano del jugador desde el gestor de draft
     */
    actualizarManoJugador() {
        const manoActual = this.gestorDraft.obtenerManoJugador();
        
        // Actualizar contenedor de dinosaurios
        const contenedorDinosaurios = document.querySelector('.tarjetas-dinosaurio-grid');
        if (!contenedorDinosaurios) return;
        
        // Limpiar contenedor
        contenedorDinosaurios.innerHTML = '';
        
        // Agregar nuevos dinosaurios
        manoActual.forEach((dinosaurio, index) => {
            const tarjeta = this.crearTarjetaDinosaurio(dinosaurio, index);
            contenedorDinosaurios.appendChild(tarjeta);
        });
        
        // Actualizar contador
        const contadorMano = document.querySelector('.contador-mano .badge');
        if (contadorMano) {
            contadorMano.textContent = `${manoActual.length} disponibles`;
        }
    }

    /**
     * Crea una tarjeta de dinosaurio
     */
    crearTarjetaDinosaurio(dinosaurio, index) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-dinosaurio-moderna';
        tarjeta.dataset.idDinosaurio = dinosaurio.id;
        tarjeta.style.animationDelay = `${index * 0.1}s`;
        
        const iconos = {
            'T-Rex': '🦖',
            'Stegosaurus': '🦕',
            'Triceratops': '🦴',
            'Raptor': '🦅',
            'Sauropodo': '🦕',
            'Allosaurus': '🐊'
        };
        
        tarjeta.innerHTML = `
            <div class="dinosaurio-icono-grande">
                ${iconos[dinosaurio.familia] || '🦕'}
            </div>
            <div class="dinosaurio-info">
                <h3>${dinosaurio.nombre}</h3>
                <div class="dinosaurio-detalles">
                    <span class="tipo-badge tipo-${dinosaurio.tipo.toLowerCase()}">
                        ${dinosaurio.tipo}
                    </span>
                    <span class="familia-text">${dinosaurio.familia}</span>
                </div>
            </div>
            <button type="button" class="boton-seleccionar-moderno" data-dinosaurio-id="${dinosaurio.id}">
                <span class="boton-texto">Seleccionar</span>
                <span class="boton-icono">✓</span>
            </button>
        `;
        
        return tarjeta;
    }

    /**
     * Actualiza información de la ronda
     */
    actualizarInfoRonda(datos) {
        // Actualizar header con información de la ronda
        const infoJuego = document.querySelector('.informacion-juego');
        if (infoJuego) {
            let rondaElement = infoJuego.querySelector('.info-ronda');
            if (!rondaElement) {
                rondaElement = document.createElement('p');
                rondaElement.className = 'info-ronda';
                infoJuego.appendChild(rondaElement);
            }
            rondaElement.innerHTML = `Ronda: <strong>${datos.ronda}/2</strong> (${datos.direccion})`;
        }
    }

    /**
     * Actualiza el jugador activo en la UI
     */
    actualizarJugadorActivo(jugadorActivo) {
        // Crear o actualizar indicador de jugador activo
        let indicador = document.querySelector('.jugador-activo-indicador');
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.className = 'jugador-activo-indicador';
            
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(indicador);
            }
        }
        
        indicador.innerHTML = `
            <div class="jugador-activo-card">
                <span class="jugador-avatar">${jugadorActivo.avatar}</span>
                <span class="jugador-nombre">${jugadorActivo.nombre}</span>
                <span class="jugador-estado">${jugadorActivo.esBot ? '🤖' : '👤'}</span>
            </div>
        `;
    }

    /**
     * Habilita controles del jugador
     */
    habilitarControlesJugador() {
        const panelDinosaurios = document.querySelector('.panel-dinosaurios');
        const botonConfirmar = document.getElementById('boton-confirmar');
        const botonResetear = document.getElementById('boton-resetear');
        
        if (panelDinosaurios) panelDinosaurios.classList.remove('disabled');
        if (botonConfirmar) botonConfirmar.disabled = !this.verificarPuedeConfirmar();
        if (botonResetear) botonResetear.disabled = false;
    }

    /**
     * Deshabilita controles del jugador
     */
    deshabilitarControlesJugador() {
        const panelDinosaurios = document.querySelector('.panel-dinosaurios');
        const botonConfirmar = document.getElementById('boton-confirmar');
        const botonResetear = document.getElementById('boton-resetear');
        
        if (panelDinosaurios) panelDinosaurios.classList.add('disabled');
        if (botonConfirmar) botonConfirmar.disabled = true;
        if (botonResetear) botonResetear.disabled = true;
    }

    /**
     * Muestra indicador de bot pensando
     */
    mostrarIndicadorBotPensando(jugador) {
        // Crear indicador temporal
        const indicador = document.createElement('div');
        indicador.className = 'bot-pensando-indicador';
        indicador.innerHTML = `
            <div class="bot-pensando-content">
                <span class="bot-avatar">${jugador.avatar}</span>
                <span class="bot-nombre">${jugador.nombre}</span>
                <div class="spinner-border spinner-border-sm ms-2"></div>
            </div>
        `;
        
        document.body.appendChild(indicador);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            indicador.remove();
        }, 3000);
    }

    /**
     * Actualiza información de jugadores
     */
    actualizarInfoJugadores() {
        const estadoDraft = this.gestorDraft.obtenerEstadoDraft();
        
        // Crear o actualizar panel de jugadores
        let panelJugadores = document.querySelector('.panel-jugadores');
        if (!panelJugadores) {
            panelJugadores = document.createElement('div');
            panelJugadores.className = 'panel-jugadores';
            
            const main = document.querySelector('main');
            if (main) {
                main.appendChild(panelJugadores);
            }
        }
        
        panelJugadores.innerHTML = `
            <h3>Jugadores</h3>
            ${estadoDraft.jugadores.map(jugador => `
                <div class="jugador-info ${jugador.id === estadoDraft.jugadorActivo ? 'activo' : ''}">
                    <span class="jugador-avatar">${jugador.avatar}</span>
                    <span class="jugador-nombre">${jugador.nombre}</span>
                    <span class="jugador-mano">${jugador.manoSize} 🦴</span>
                    <span class="jugador-colocados">${jugador.dinosauriosColocados} 📍</span>
                </div>
            `).join('')}
        `;
    }

    /**
     * Muestra resultados finales
     */
    mostrarResultadosFinales(puntuaciones, ganador) {
        // Crear modal de resultados
        const modal = document.createElement('div');
        modal.className = 'modal-resultados';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🏆 ¡Juego Completado!</h2>
                <div class="ganador">
                    <h3>Ganador: ${ganador.jugador.nombre}</h3>
                    <p>Puntuación: ${ganador.puntuacion} puntos</p>
                </div>
                <div class="puntuaciones">
                    <h4>Puntuaciones Finales:</h4>
                    ${puntuaciones.map((p, index) => `
                        <div class="puntuacion-item ${index === 0 ? 'ganador' : ''}">
                            <span class="posicion">${index + 1}°</span>
                            <span class="avatar">${p.jugador.avatar}</span>
                            <span class="nombre">${p.jugador.nombre}</span>
                            <span class="puntos">${p.puntuacion} pts</span>
                        </div>
                    `).join('')}
                </div>
                <div class="acciones-finales">
                    <button onclick="window.location.href='index.php'" class="btn btn-primary">
                        Nueva Partida
                    </button>
                    <button onclick="window.location.href='auxiliar.php'" class="btn btn-secondary">
                        Modo Auxiliar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Selecciona un dinosaurio de la mano
     */
    seleccionarDinosaurio(dinosaurioId) {
        const manoActual = this.gestorDraft.obtenerManoJugador();
        const dinosaurio = manoActual.find(d => d.id === dinosaurioId);
        
        if (!dinosaurio) {
            console.warn('Dinosaurio no encontrado en la mano:', dinosaurioId);
            return;
        }

        this.estadoJuego.dinosaurioSeleccionado = dinosaurio;
        
        // Actualizar UI
        this.actualizarSeleccionDinosaurio(dinosaurioId);
        this.verificarPuedeConfirmar();
        
        console.log('🦕 Dinosaurio seleccionado:', dinosaurio.nombre);
    }

    /**
     * Selecciona un recinto para colocación
     */
    seleccionarRecinto(recintoId) {
        this.estadoJuego.recintoSeleccionado = recintoId;
        
        // Actualizar campos ocultos del formulario
        const campoRecinto = document.getElementById('recinto-seleccionado');
        if (campoRecinto) {
            campoRecinto.value = recintoId;
        }
        
        this.verificarPuedeConfirmar();
        
        console.log('🏞️ Recinto seleccionado:', recintoId);
    }

    /**
     * Actualiza la selección visual del dinosaurio
     */
    actualizarSeleccionDinosaurio(dinosaurioId) {
        // Remover selección anterior
        document.querySelectorAll('.tarjeta-dinosaurio-moderna').forEach(tarjeta => {
            tarjeta.classList.remove('seleccionado');
        });

        // Seleccionar nuevo dinosaurio
        const tarjetaSeleccionada = document.querySelector(`[data-id-dinosaurio="${dinosaurioId}"]`);
        if (tarjetaSeleccionada) {
            tarjetaSeleccionada.classList.add('seleccionado');
        }

        // Actualizar campo oculto del formulario
        const campoDinosaurio = document.getElementById('dinosaurio-seleccionado');
        if (campoDinosaurio) {
            campoDinosaurio.value = dinosaurioId;
        }
    }

    /**
     * Verifica si se puede confirmar la colocación
     */
    verificarPuedeConfirmar() {
        const puedeConfirmar = this.estadoJuego.dinosaurioSeleccionado && 
                              this.estadoJuego.recintoSeleccionado;
        
        const botonConfirmar = document.getElementById('boton-confirmar');
        if (botonConfirmar) {
            botonConfirmar.disabled = !puedeConfirmar;
        }
        
        return puedeConfirmar;
    }

    /**
     * Resetea las selecciones actuales
     */
    resetearSelecciones() {
        this.estadoJuego.dinosaurioSeleccionado = null;
        this.estadoJuego.recintoSeleccionado = null;
        
        // Limpiar selecciones visuales
        document.querySelectorAll('.tarjeta-dinosaurio-moderna').forEach(tarjeta => {
            tarjeta.classList.remove('seleccionado');
        });
        
        // Limpiar campos del formulario
        const campoDinosaurio = document.getElementById('dinosaurio-seleccionado');
        const campoRecinto = document.getElementById('recinto-seleccionado');
        
        if (campoDinosaurio) campoDinosaurio.value = '';
        if (campoRecinto) campoRecinto.value = '';
        
        this.verificarPuedeConfirmar();
        
        console.log('🔄 Selecciones reseteadas');
    }

    /**
     * Maneja eventos de teclado
     */
    manejarTeclado(e) {
        if (!this.estadoJuego.juegoActivo) return;
        
        switch (e.key) {
            case 'Enter':
                if (this.verificarPuedeConfirmar()) {
                    e.preventDefault();
                    this.confirmarColocacionDraft();
                }
                break;
            case 'Escape':
                this.resetearSelecciones();
                break;
            case ' ':
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                    e.preventDefault();
                    this.gestorDados.lanzarDado();
                }
                break;
        }
    }

    /**
     * Muestra una notificación al usuario
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear toast si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1050';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${tipo === 'success' ? 'success' : tipo === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${mensaje}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Mostrar toast usando Bootstrap
        if (typeof bootstrap !== 'undefined') {
            const bsToast = new bootstrap.Toast(toast, {
                autohide: true,
                delay: 3000
            });
            bsToast.show();

            // Remover después de que se oculte
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        } else {
            // Fallback sin Bootstrap
            toast.style.display = 'block';
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    /**
     * Muestra un error al usuario
     */
    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    }

    /**
     * Muestra/oculta indicador de carga
     */
    mostrarCargando(mostrar) {
        const botonConfirmar = document.getElementById('boton-confirmar');
        if (botonConfirmar) {
            if (mostrar) {
                botonConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Colocando...';
                botonConfirmar.disabled = true;
            } else {
                botonConfirmar.innerHTML = '<span class="me-2">🎯</span>Confirmar Colocación';
                botonConfirmar.disabled = !this.verificarPuedeConfirmar();
            }
        }
    }

    /**
     * Obtiene el estado actual del juego
     */
    obtenerEstadoJuego() {
        return {
            ...this.estadoJuego,
            estadoDraft: this.gestorDraft.obtenerEstadoDraft(),
            restriccionDado: this.gestorDados.obtenerRestriccionActual()
        };
    }

    /**
     * Destruye el gestor del juego
     */
    destruir() {
        this.estadoJuego.juegoActivo = false;
        
        if (this.gestorDados) this.gestorDados.destruir();
        if (this.gestorBots) this.gestorBots.destruir();
        if (this.gestorDraft) this.gestorDraft.destruir();
        if (this.renderizadorMapa) this.renderizadorMapa.destruir();
        
        console.log('🧹 Gestor de Juego destruido');
    }
        try {
            // Obtener datos del DOM (ya renderizados por PHP)
            const infoJuego = document.querySelector('.informacion-juego');
            if (infoJuego) {
                const rondaText = infoJuego.querySelector('p:nth-child(2)')?.textContent;
                const turnoText = infoJuego.querySelector('p:nth-child(3)')?.textContent;
                
                if (rondaText) {
                    const rondaMatch = rondaText.match(/(\d+)\/(\d+)/);
                    if (rondaMatch) {
                        this.estadoJuego.ronda = parseInt(rondaMatch[1]);
                        this.estadoJuego.totalRondas = parseInt(rondaMatch[2]);
                    }
                }
                
                if (turnoText) {
                    const turnoMatch = turnoText.match(/(\d+)\/(\d+)/);
                    if (turnoMatch) {
                        this.estadoJuego.turno = parseInt(turnoMatch[1]);
                        this.estadoJuego.turnosPorRonda = parseInt(turnoMatch[2]);
                    }
                }
            }

            // Cargar dinosaurios de la mano actual
            this.cargarManoActual();
            
            // Cargar colocaciones existentes
            this.cargarColocacionesExistentes();
            
            console.log('📊 Estado del juego cargado:', this.estadoJuego);
            
        } catch (error) {
            console.error('❌ Error cargando estado del juego:', error);
        }
    }

    /**
     * Carga los dinosaurios de la mano actual
     */
    cargarManoActual() {
        const tarjetasDinosaurio = document.querySelectorAll('.tarjeta-dinosaurio');
        this.estadoJuego.manoActual = [];
        
        tarjetasDinosaurio.forEach(tarjeta => {
            const id = parseInt(tarjeta.dataset.idDinosaurio);
            const nombre = tarjeta.querySelector('h3')?.textContent;
            const tipo = tarjeta.querySelector('p:nth-child(2)')?.textContent?.replace('Tipo: ', '');
            const familia = tarjeta.querySelector('p:nth-child(3)')?.textContent?.replace('Familia: ', '');
            
            if (id && nombre) {
                this.estadoJuego.manoActual.push({
                    id,
                    nombre,
                    tipo,
                    familia
                });
            }
        });
        
        console.log('🦕 Mano actual cargada:', this.estadoJuego.manoActual.length, 'dinosaurios');
    }

    /**
     * Carga las colocaciones existentes en el tablero
     */
    cargarColocacionesExistentes() {
        const recintos = document.querySelectorAll('.recinto');
        let totalColocaciones = 0;
        
        recintos.forEach(recinto => {
            const dinosauriosColocados = recinto.querySelectorAll('.dinosaurio-colocado');
            const recintoId = parseInt(recinto.dataset.idRecinto || recinto.querySelector('[data-id-recinto]')?.dataset.idRecinto);
            
            if (recintoId && dinosauriosColocados.length > 0) {
                dinosauriosColocados.forEach(dinoElement => {
                    const nombre = dinoElement.textContent.trim();
                    if (nombre) {
                        // Simular datos del dinosaurio (en una implementación real vendría del servidor)
                        const dinosaurio = {
                            id: Date.now() + Math.random(), // ID temporal
                            nombre: nombre,
                            tipo: 'desconocido',
                            familia: nombre.split(' ')[0] // Aproximación
                        };
                        
                        this.gestorTablero.colocarDinosaurio(recintoId, dinosaurio);
                        totalColocaciones++;
                    }
                });
            }
        });
        
        this.estadoJuego.colocacionesRealizadas = totalColocaciones;
        console.log('📍 Colocaciones existentes cargadas:', totalColocaciones);
    }

    /**
     * Selecciona un dinosaurio de la mano
     */
    seleccionarDinosaurio(dinosaurioId) {
        const dinosaurio = this.estadoJuego.manoActual.find(d => d.id === dinosaurioId);
        if (!dinosaurio) {
            console.warn('Dinosaurio no encontrado en la mano:', dinosaurioId);
            return;
        }

        this.estadoJuego.dinosaurioSeleccionado = dinosaurio;
        
        // Actualizar UI
        this.actualizarSeleccionDinosaurio(dinosaurioId);
        this.verificarPuedeConfirmar();
        
        console.log('🦕 Dinosaurio seleccionado:', dinosaurio.nombre);
    }

    /**
     * Selecciona un recinto para colocación
     */
    seleccionarRecinto(recintoId) {
        this.estadoJuego.recintoSeleccionado = recintoId;
        
        // Usar el gestor de tablero para la selección visual
        this.gestorTablero.seleccionarRecinto(recintoId);
        this.verificarPuedeConfirmar();
        
        console.log('🏞️ Recinto seleccionado:', recintoId);
    }

    /**
     * Maneja las restricciones del dado
     */
    manejarRestriccionDado(restriccion) {
        console.log('🎲 Aplicando restricción del dado:', restriccion.nombre);
        
        // El gestor de dados ya maneja la visualización
        // Aquí podemos agregar lógica adicional si es necesaria
        
        this.mostrarNotificacion(`Restricción activa: ${restriccion.nombre}`, 'info');
    }

    /**
     * Verifica si se puede confirmar la colocación
     */
    verificarPuedeConfirmar() {
        const puedeConfirmar = this.estadoJuego.dinosaurioSeleccionado && 
                              this.estadoJuego.recintoSeleccionado;
        
        const botonConfirmar = document.getElementById('boton-confirmar');
        if (botonConfirmar) {
            botonConfirmar.disabled = !puedeConfirmar;
        }
        
        return puedeConfirmar;
    }

    /**
     * Confirma la colocación del dinosaurio
     */
    async confirmarColocacion() {
        if (!this.verificarPuedeConfirmar()) {
            this.mostrarError('Selecciona un dinosaurio y un recinto');
            return;
        }

        const { dinosaurioSeleccionado, recintoSeleccionado } = this.estadoJuego;
        
        try {
            // Validar restricciones del dado
            if (!this.gestorDados.esColocacionValida(recintoSeleccionado, dinosaurioSeleccionado.id)) {
                this.mostrarError('Esta colocación no es válida según la restricción del dado');
                return;
            }

            // Validar reglas del recinto
            if (!this.gestorTablero.validarReglaColocacion(
                this.gestorTablero.recintos.get(recintoSeleccionado), 
                dinosaurioSeleccionado
            )) {
                this.mostrarError('Esta colocación no es válida según las reglas del recinto');
                return;
            }

            // Mostrar indicador de carga
            this.mostrarCargando(true);

            // Realizar colocación en el servidor
            const exito = await this.enviarColocacionServidor(dinosaurioSeleccionado.id, recintoSeleccionado);
            
            if (exito) {
                // Actualizar estado local
                this.gestorTablero.colocarDinosaurio(recintoSeleccionado, dinosaurioSeleccionado);
                this.estadoJuego.colocacionesRealizadas++;
                
                // Remover dinosaurio de la mano
                this.removerDinosaurioMano(dinosaurioSeleccionado.id);
                
                // Resetear selecciones
                this.resetearSelecciones();
                
                // Verificar si el juego ha terminado
                this.verificarFinJuego();
                
                this.mostrarNotificacion('¡Dinosaurio colocado exitosamente!', 'success');
            } else {
                this.mostrarError('Error al colocar el dinosaurio');
            }
            
        } catch (error) {
            console.error('❌ Error confirmando colocación:', error);
            this.mostrarError('Error inesperado al colocar el dinosaurio');
        } finally {
            this.mostrarCargando(false);
        }
    }

    /**
     * Envía la colocación al servidor
     */
    async enviarColocacionServidor(dinosaurioId, recintoId) {
        try {
            const formData = new FormData();
            formData.append('id_dinosaurio', dinosaurioId);
            formData.append('id_recinto', recintoId);

            const response = await fetch('colocar_dino.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Si la respuesta es una redirección, recargar la página
                if (response.redirected) {
                    window.location.href = response.url;
                    return true;
                }
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('❌ Error enviando colocación:', error);
            return false;
        }
    }

    /**
     * Actualiza la selección visual del dinosaurio
     */
    actualizarSeleccionDinosaurio(dinosaurioId) {
        // Remover selección anterior
        document.querySelectorAll('.tarjeta-dinosaurio').forEach(tarjeta => {
            tarjeta.classList.remove('seleccionado');
        });

        // Seleccionar nuevo dinosaurio
        const tarjetaSeleccionada = document.querySelector(`[data-id-dinosaurio="${dinosaurioId}"]`);
        if (tarjetaSeleccionada) {
            tarjetaSeleccionada.classList.add('seleccionado');
        }

        // Actualizar campo oculto del formulario
        const campoOculto = document.getElementById('dinosaurio-seleccionado');
        if (campoOculto) {
            campoOculto.value = dinosaurioId;
        }
    }

    /**
     * Remueve un dinosaurio de la mano actual
     */
    removerDinosaurioMano(dinosaurioId) {
        this.estadoJuego.manoActual = this.estadoJuego.manoActual.filter(d => d.id !== dinosaurioId);
        
        // Remover del DOM
        const tarjeta = document.querySelector(`[data-id-dinosaurio="${dinosaurioId}"]`);
        if (tarjeta) {
            tarjeta.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                tarjeta.remove();
            }, 300);
        }
    }

    /**
     * Resetea las selecciones actuales
     */
    resetearSelecciones() {
        this.estadoJuego.dinosaurioSeleccionado = null;
        this.estadoJuego.recintoSeleccionado = null;
        
        // Limpiar selecciones visuales
        document.querySelectorAll('.tarjeta-dinosaurio').forEach(tarjeta => {
            tarjeta.classList.remove('seleccionado');
        });
        
        document.querySelectorAll('.recinto').forEach(recinto => {
            recinto.classList.remove('recinto-seleccionado');
        });
        
        // Limpiar campos del formulario
        const camposDinosaurio = document.getElementById('dinosaurio-seleccionado');
        const camposRecinto = document.getElementById('recinto-seleccionado');
        
        if (camposDinosaurio) camposDinosaurio.value = '';
        if (camposRecinto) camposRecinto.value = '';
    }

    /**
     * Verifica si el juego ha terminado
     */
    verificarFinJuego() {
        const totalColocacionesEsperadas = this.estadoJuego.totalRondas * this.estadoJuego.turnosPorRonda;
        
        if (this.estadoJuego.colocacionesRealizadas >= totalColocacionesEsperadas) {
            this.finalizarJuego();
        } else if (this.estadoJuego.manoActual.length === 0) {
            // Avanzar turno/ronda
            this.avanzarTurno();
        }
    }

    /**
     * Avanza al siguiente turno o ronda
     */
    avanzarTurno() {
        this.estadoJuego.turno++;
        
        if (this.estadoJuego.turno > this.estadoJuego.turnosPorRonda) {
            this.estadoJuego.ronda++;
            this.estadoJuego.turno = 1;
            
            if (this.estadoJuego.ronda <= this.estadoJuego.totalRondas) {
                this.mostrarNotificacion(`¡Comenzando Ronda ${this.estadoJuego.ronda}!`, 'info');
            }
        }
        
        // Actualizar UI
        this.actualizarInfoJuego();
        
        // Lanzar nuevo dado si no es el final del juego
        if (this.estadoJuego.ronda <= this.estadoJuego.totalRondas) {
            setTimeout(() => {
                this.gestorDados.lanzarDado();
            }, 1000);
        }
    }

    /**
     * Actualiza la información del juego en la UI
     */
    actualizarInfoJuego() {
        const infoJuego = document.querySelector('.informacion-juego');
        if (infoJuego) {
            const rondaElement = infoJuego.querySelector('p:nth-child(2)');
            const turnoElement = infoJuego.querySelector('p:nth-child(3)');
            
            if (rondaElement) {
                rondaElement.innerHTML = `Ronda: <strong>${this.estadoJuego.ronda}/${this.estadoJuego.totalRondas}</strong>`;
            }
            
            if (turnoElement) {
                turnoElement.innerHTML = `Turno: <strong>${this.estadoJuego.turno}/${this.estadoJuego.turnosPorRonda}</strong>`;
            }
        }
    }

    /**
     * Finaliza el juego
     */
    finalizarJuego() {
        this.juegoActivo = false;
        this.mostrarNotificacion('¡Juego completado! Calculando puntuación...', 'success');
        
        setTimeout(() => {
            window.location.href = 'calcular_puntos.php';
        }, 2000);
    }

    /**
     * Maneja eventos de teclado
     */
    manejarTeclado(e) {
        if (!this.juegoActivo) return;
        
        switch (e.key) {
            case 'Enter':
                if (this.verificarPuedeConfirmar()) {
                    e.preventDefault();
                    this.confirmarColocacion();
                }
                break;
            case 'Escape':
                this.resetearSelecciones();
                break;
            case ' ':
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                    e.preventDefault();
                    this.gestorDados.lanzarDado();
                }
                break;
        }
    }

    /**
     * Muestra una notificación al usuario
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear toast si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${tipo === 'success' ? 'success' : tipo === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${mensaje}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remover después de que se oculte
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    /**
     * Muestra un error al usuario
     */
    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    }

    /**
     * Muestra/oculta indicador de carga
     */
    mostrarCargando(mostrar) {
        const botonConfirmar = document.getElementById('boton-confirmar');
        if (botonConfirmar) {
            if (mostrar) {
                botonConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Colocando...';
                botonConfirmar.disabled = true;
            } else {
                botonConfirmar.innerHTML = 'Confirmar Colocación';
                botonConfirmar.disabled = !this.verificarPuedeConfirmar();
            }
        }
    }

    /**
     * Maneja la colocación de dinosaurios (callback del tablero)
     */
    manejarColocacionDinosaurio(detalle) {
        console.log('🦕 Dinosaurio colocado en tablero:', detalle);
        // Aquí se puede agregar lógica adicional si es necesaria
    }

    /**
     * Obtiene el estado actual del juego
     */
    obtenerEstadoJuego() {
        return {
            ...this.estadoJuego,
            tablero: this.gestorTablero.obtenerEstadoTablero(),
            restriccionDado: this.gestorDados.obtenerRestriccionActual()
        };
    }

    /**
     * Destruye el gestor del juego
     */
    destruir() {
        this.juegoActivo = false;
        this.gestorDados.destruir();
        this.gestorTablero.destruir();
        console.log('🧹 Gestor de Juego destruido');
    }
}