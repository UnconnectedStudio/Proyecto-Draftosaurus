/**
 * GESTOR PRINCIPAL DEL JUEGO
 * Coordina todos los componentes del juego de Draftosaurus con sistema de draft y bots
 */

import { GestorDados } from './gestor-dados.js';
import { GestorTablero } from './gestor-tablero.js';
import { GestorBots } from './gestor-bots.js';
import { GestorDraft } from './gestor-draft.js';
import { RenderizadorMapa } from './renderizador-mapa.js';
import { RenderizadorTableroFuncional } from './renderizador-tablero-funcional.js';

export class GestorJuego {
    constructor() {
        this.gestorDados = new GestorDados();
        this.gestorTablero = new GestorTablero();
        this.gestorBots = new GestorBots();
        this.gestorDraft = new GestorDraft(this.gestorBots);
        this.renderizadorMapa = null;
        this.renderizadorTableroInteractivo = null;
        this.jugadorHumano = null;
        this.juegoActivo = false;
        this.estadoJuego = {
            modo: 'draft', // 'draft' o 'clasico'
            dinosaurioSeleccionado: null,
            recintoSeleccionado: null,
            juegoActivo: false,
            jugadores: [],
            manoActual: [],
            ronda: 1,
            turno: 1,
            totalRondas: 2,
            turnosPorRonda: 6,
            colocacionesRealizadas: 0
        };
    }

    /**
     * Inicializa el gestor principal del juego
     */
    async inicializar() {
        try {
            console.log('Inicializando Gestor de Juego...');

            // Inicializar componentes básicos
            await this.gestorDados.inicializar();
            await this.gestorTablero.inicializar();

            // Inicializar renderizador de tablero funcional como principal
            const contenedorTablero = document.getElementById('tablero-container-placeholder');
            if (contenedorTablero) {
                this.renderizadorTableroInteractivo = new RenderizadorTableroFuncional(contenedorTablero);
                await this.renderizadorTableroInteractivo.inicializar();
                
                // Configurar eventos del renderizador funcional
                this.configurarEventosRenderizador();
                
                // Mapear recintos de la base de datos con contenedores visuales
                await this.mapearRecintos();
                
                console.log('Renderizador funcional inicializado como sistema principal');
            }

            // Configurar eventos
            this.configurarEventos();

            // Cargar estado del juego desde el DOM
            this.cargarEstadoJuego();

            // Obtener información del jugador humano
            await this.obtenerJugadorHumano();

            this.juegoActivo = true;
            this.estadoJuego.juegoActivo = true;

            console.log('Gestor de Juego inicializado correctamente');

        } catch (error) {
            console.error('Error inicializando Gestor de Juego:', error);
            this.mostrarError('Error al inicializar el juego');
        }
    }

    /**
     * Configura eventos del juego
     */
    configurarEventos() {
        // Eventos del renderizador de mapa
        document.addEventListener('recintoClickeado', (e) => {
            this.seleccionarRecinto(e.detail.recinto.id);
        });

        // Eventos de selección de dinosaurios
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
                this.confirmarColocacion();
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
     * Carga el estado del juego desde el DOM
     */
    cargarEstadoJuego() {
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

            console.log('Estado del juego cargado:', this.estadoJuego);

        } catch (error) {
            console.error('Error cargando estado del juego:', error);
        }
    }

    /**
     * Carga los dinosaurios de la mano actual
     */
    cargarManoActual() {
        const tarjetasDinosaurio = document.querySelectorAll('.tarjeta-dinosaurio-moderna');
        this.estadoJuego.manoActual = [];

        tarjetasDinosaurio.forEach(tarjeta => {
            const id = parseInt(tarjeta.dataset.idDinosaurio);
            const nombre = tarjeta.querySelector('h3')?.textContent;
            const tipoElement = tarjeta.querySelector('.tipo-badge');
            const familiaElement = tarjeta.querySelector('.familia-text');

            const tipo = tipoElement ? tipoElement.textContent.trim() : 'desconocido';
            const familia = familiaElement ? familiaElement.textContent.trim() : 'desconocida';

            if (id && nombre) {
                this.estadoJuego.manoActual.push({
                    id,
                    nombre: nombre.trim(),
                    tipo,
                    familia
                });
            }
        });

        console.log('Mano actual cargada:', this.estadoJuego.manoActual.length, 'dinosaurios');
    }

    /**
     * Carga las colocaciones existentes en el tablero
     */
    cargarColocacionesExistentes() {
        const recintos = document.querySelectorAll('.recinto-data');
        let totalColocaciones = 0;

        recintos.forEach(recinto => {
            const dinosauriosColocados = recinto.querySelectorAll('.dinosaurio-colocado');
            const recintoId = parseInt(recinto.dataset.id);

            if (recintoId && dinosauriosColocados.length > 0) {
                dinosauriosColocados.forEach(dinoElement => {
                    const nombre = dinoElement.textContent.trim();
                    const familia = dinoElement.dataset.familia || nombre.split(' ')[0];

                    if (nombre) {
                        const dinosaurio = {
                            id: Date.now() + Math.random(),
                            nombre: nombre,
                            tipo: 'desconocido',
                            familia: familia
                        };

                        if (this.gestorTablero && this.gestorTablero.colocarDinosaurio) {
                            this.gestorTablero.colocarDinosaurio(recintoId, dinosaurio);
                        }
                        totalColocaciones++;
                    }
                });
            }
        });

        this.estadoJuego.colocacionesRealizadas = totalColocaciones;
        console.log('Colocaciones existentes cargadas:', totalColocaciones);
    }

    /**
     * Obtiene información del jugador humano
     */
    async obtenerJugadorHumano() {
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
            avatar: 'Jugador'
        };

        console.log('Jugador humano:', this.jugadorHumano);
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
        
        // Actualizar renderizador de tablero interactivo
        if (this.renderizadorTableroInteractivo) {
            this.renderizadorTableroInteractivo.seleccionarDinosaurio(dinosaurioId);
        }
        
        this.verificarPuedeConfirmar();

        console.log('Dinosaurio seleccionado:', dinosaurio.nombre);
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

        // Usar el gestor de tablero para la selección visual si existe
        if (this.gestorTablero && this.gestorTablero.seleccionarRecinto) {
            this.gestorTablero.seleccionarRecinto(recintoId);
        }

        this.verificarPuedeConfirmar();

        console.log('Recinto seleccionado:', recintoId);
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
     * Confirma la colocación del dinosaurio
     */
    async confirmarColocacion() {
        if (!this.verificarPuedeConfirmar()) {
            this.mostrarError('Selecciona un dinosaurio y un recinto');
            return;
        }

        const { dinosaurioSeleccionado, recintoSeleccionado } = this.estadoJuego;

        try {
            // Validar restricciones del dado si existe el gestor
            if (this.gestorDados && this.gestorDados.esColocacionValida) {
                if (!this.gestorDados.esColocacionValida(recintoSeleccionado, dinosaurioSeleccionado.id)) {
                    this.mostrarError('Esta colocación no es válida según la restricción del dado');
                    return;
                }
            }

            // Validar reglas del recinto si existe el gestor
            if (this.gestorTablero && this.gestorTablero.validarReglaColocacion) {
                const recinto = this.gestorTablero.recintos?.get(recintoSeleccionado);
                if (recinto && !this.gestorTablero.validarReglaColocacion(recinto, dinosaurioSeleccionado)) {
                    this.mostrarError('Esta colocación no es válida según las reglas del recinto');
                    return;
                }
            }

            // Mostrar indicador de carga
            this.mostrarCargando(true);

            // Realizar colocación en el servidor
            const exito = await this.enviarColocacionServidor(dinosaurioSeleccionado.id, recintoSeleccionado);

            if (exito) {
                // Actualizar estado local
                if (this.gestorTablero && this.gestorTablero.colocarDinosaurio) {
                    this.gestorTablero.colocarDinosaurio(recintoSeleccionado, dinosaurioSeleccionado);
                }

                this.estadoJuego.colocacionesRealizadas++;

                // Remover dinosaurio de la mano
                this.removerDinosaurioMano(dinosaurioSeleccionado.id);

                // Resetear selecciones
                this.resetearSelecciones();

                // Verificar si el juego ha terminado
                this.verificarFinJuego();

                this.mostrarNotificacion('Dinosaurio colocado exitosamente', 'success');
            } else {
                this.mostrarError('Error al colocar el dinosaurio');
            }

        } catch (error) {
            console.error('Error confirmando colocación:', error);
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
            console.error('Error enviando colocación:', error);
            return false;
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
        document.querySelectorAll('.tarjeta-dinosaurio-moderna').forEach(tarjeta => {
            tarjeta.classList.remove('seleccionado');
        });

        document.querySelectorAll('.recinto').forEach(recinto => {
            recinto.classList.remove('recinto-seleccionado');
        });

        // Resetear renderizador de tablero interactivo
        if (this.renderizadorTableroInteractivo) {
            this.renderizadorTableroInteractivo.resetearSelecciones();
        }

        // Limpiar campos del formulario
        const campoDinosaurio = document.getElementById('dinosaurio-seleccionado');
        const campoRecinto = document.getElementById('recinto-seleccionado');

        if (campoDinosaurio) campoDinosaurio.value = '';
        if (campoRecinto) campoRecinto.value = '';

        this.verificarPuedeConfirmar();

        console.log('Selecciones reseteadas');
    }

    /**
     * Verifica si el juego ha terminado
     */
    verificarFinJuego() {
        const totalColocacionesEsperadas = this.estadoJuego.totalRondas * this.estadoJuego.turnosPorRonda;

        if (this.estadoJuego.colocacionesRealizadas >= totalColocacionesEsperadas) {
            this.finalizarJuego();
        } else if (this.estadoJuego.manoActual.length === 0) {
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
                this.mostrarNotificacion(`Comenzando Ronda ${this.estadoJuego.ronda}`, 'info');
            }
        }

        // Actualizar UI
        this.actualizarInfoJuego();

        // Lanzar nuevo dado si no es el final del juego
        if (this.estadoJuego.ronda <= this.estadoJuego.totalRondas) {
            setTimeout(() => {
                if (this.gestorDados && this.gestorDados.lanzarDado) {
                    this.gestorDados.lanzarDado();
                }
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
        this.estadoJuego.juegoActivo = false;
        this.mostrarNotificacion('Juego completado. Calculando puntuación...', 'success');

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
                    if (this.gestorDados && this.gestorDados.lanzarDado) {
                        this.gestorDados.lanzarDado();
                    }
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
                botonConfirmar.innerHTML = '<span class="me-2">Confirmar</span>Confirmar Colocación';
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
            tablero: this.gestorTablero?.obtenerEstadoTablero?.() || null,
            restriccionDado: this.gestorDados?.obtenerRestriccionActual?.() || null
        };
    }

    /**
     * Configura eventos específicos del renderizador funcional
     */
    configurarEventosRenderizador() {
        if (!this.renderizadorTableroInteractivo) return;

        // Cargar dinosaurios disponibles en el renderizador
        if (this.estadoJuego.manoActual.length > 0) {
            this.renderizadorTableroInteractivo.cargarDinosaurios(this.estadoJuego.manoActual);
        }

        // Configurar restricción del dado si existe
        if (this.gestorDados && this.gestorDados.obtenerRestriccionActual) {
            const restriccion = this.gestorDados.obtenerRestriccionActual();
            if (restriccion) {
                this.renderizadorTableroInteractivo.establecerRestriccionDado(restriccion);
            }
        }

        // Escuchar eventos de colocación del renderizador
        document.addEventListener('dinosaurioColocado', (e) => {
            const { zonaId, dinosaurio } = e.detail;
            console.log('Dinosaurio colocado desde renderizador:', dinosaurio.familia, 'en', zonaId);
            
            // Convertir zonaId del contenedor visual a recintoId de BD
            const recintoIdReal = this.obtenerRecintoIdDesdeContenedor(zonaId);
            
            if (recintoIdReal) {
                // Actualizar estado del juego con ID real de BD
                this.estadoJuego.recintoSeleccionado = recintoIdReal;
                this.estadoJuego.dinosaurioSeleccionado = dinosaurio;
                
                // Confirmar colocación automáticamente
                this.confirmarColocacion();
            } else {
                console.error('No se pudo mapear contenedor a recinto de BD:', zonaId);
                this.mostrarError('Error al identificar el recinto seleccionado');
            }
        });

        console.log('Eventos del renderizador funcional configurados');
    }

    /**
     * Obtiene el ID real del recinto de BD desde el contenedor visual
     */
    obtenerRecintoIdDesdeContenedor(zonaId) {
        if (!this.renderizadorTableroInteractivo || !this.renderizadorTableroInteractivo.zonasInteractivas) {
            return null;
        }

        const contenedor = this.renderizadorTableroInteractivo.zonasInteractivas.find(
            zona => zona.id === zonaId
        );

        return contenedor ? contenedor.recintoId : null;
    }

    /**
     * Actualiza el renderizador con nuevos datos
     */
    actualizarRenderizador() {
        if (!this.renderizadorTableroInteractivo) return;

        // Actualizar dinosaurios disponibles
        this.renderizadorTableroInteractivo.cargarDinosaurios(this.estadoJuego.manoActual);

        // Actualizar restricción del dado
        if (this.gestorDados && this.gestorDados.obtenerRestriccionActual) {
            const restriccion = this.gestorDados.obtenerRestriccionActual();
            this.renderizadorTableroInteractivo.establecerRestriccionDado(restriccion);
        }
    }

    /**
     * Selecciona un dinosaurio de la mano (versión mejorada)
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
        
        // Actualizar renderizador de tablero funcional
        if (this.renderizadorTableroInteractivo) {
            this.renderizadorTableroInteractivo.seleccionarDinosaurio(dinosaurio);
        }
        
        this.verificarPuedeConfirmar();

        console.log('Dinosaurio seleccionado:', dinosaurio.nombre);
    }

    /**
     * Resetea las selecciones actuales (versión mejorada)
     */
    resetearSelecciones() {
        this.estadoJuego.dinosaurioSeleccionado = null;
        this.estadoJuego.recintoSeleccionado = null;

        // Limpiar selecciones visuales
        document.querySelectorAll('.tarjeta-dinosaurio-moderna').forEach(tarjeta => {
            tarjeta.classList.remove('seleccionado');
        });

        document.querySelectorAll('.recinto').forEach(recinto => {
            recinto.classList.remove('recinto-seleccionado');
        });

        // Resetear renderizador de tablero funcional
        if (this.renderizadorTableroInteractivo) {
            this.renderizadorTableroInteractivo.seleccionarDinosaurio(null);
        }

        // Limpiar campos del formulario
        const campoDinosaurio = document.getElementById('dinosaurio-seleccionado');
        const campoRecinto = document.getElementById('recinto-seleccionado');

        if (campoDinosaurio) campoDinosaurio.value = '';
        if (campoRecinto) campoRecinto.value = '';

        this.verificarPuedeConfirmar();

        console.log('Selecciones reseteadas');
    }

    /**
     * Carga los dinosaurios de la mano actual (versión mejorada)
     */
    cargarManoActual() {
        const tarjetasDinosaurio = document.querySelectorAll('.tarjeta-dinosaurio-moderna');
        this.estadoJuego.manoActual = [];

        tarjetasDinosaurio.forEach(tarjeta => {
            const id = parseInt(tarjeta.dataset.idDinosaurio);
            const nombre = tarjeta.querySelector('h3')?.textContent;
            const tipoElement = tarjeta.querySelector('.tipo-badge');
            const familiaElement = tarjeta.querySelector('.familia-text');

            const tipo = tipoElement ? tipoElement.textContent.trim() : 'desconocido';
            const familia = familiaElement ? familiaElement.textContent.trim() : 'desconocida';

            if (id && nombre) {
                this.estadoJuego.manoActual.push({
                    id,
                    nombre: nombre.trim(),
                    tipo,
                    familia
                });
            }
        });

        // Actualizar renderizador con los nuevos dinosaurios
        if (this.renderizadorTableroInteractivo) {
            this.renderizadorTableroInteractivo.cargarDinosaurios(this.estadoJuego.manoActual);
        }

        console.log('Mano actual cargada:', this.estadoJuego.manoActual.length, 'dinosaurios');
    }

    /**
     * Avanza al siguiente turno o ronda (versión mejorada)
     */
    avanzarTurno() {
        this.estadoJuego.turno++;

        if (this.estadoJuego.turno > this.estadoJuego.turnosPorRonda) {
            this.estadoJuego.ronda++;
            this.estadoJuego.turno = 1;

            if (this.estadoJuego.ronda <= this.estadoJuego.totalRondas) {
                this.mostrarNotificacion(`Comenzando Ronda ${this.estadoJuego.ronda}`, 'info');
            }
        }

        // Actualizar UI
        this.actualizarInfoJuego();

        // Actualizar renderizador
        this.actualizarRenderizador();

        // Lanzar nuevo dado si no es el final del juego
        if (this.estadoJuego.ronda <= this.estadoJuego.totalRondas) {
            setTimeout(() => {
                if (this.gestorDados && this.gestorDados.lanzarDado) {
                    this.gestorDados.lanzarDado();
                }
            }, 1000);
        }
    }

    /**
     * Mapea recintos de la base de datos con contenedores visuales del renderizador
     */
    async mapearRecintos() {
        if (!this.renderizadorTableroInteractivo) return;

        // Obtener datos de recintos del DOM (renderizados por PHP)
        const recintosBD = this.obtenerRecintosDeBD();
        
        // Mapear con contenedores visuales
        const mapeoRecintos = this.crearMapeoRecintos(recintosBD);
        
        // Actualizar contenedores del renderizador con datos reales
        this.actualizarContenedoresConDatosBD(mapeoRecintos);
        
        console.log('Recintos mapeados correctamente:', mapeoRecintos.length);
    }

    /**
     * Obtiene datos de recintos desde el DOM (renderizados por PHP)
     */
    obtenerRecintosDeBD() {
        const recintos = [];
        const elementosRecinto = document.querySelectorAll('.recinto-data');
        
        elementosRecinto.forEach(elemento => {
            const recinto = {
                id: parseInt(elemento.dataset.id),
                nombre: elemento.dataset.nombre,
                regla: elemento.dataset.regla,
                maxDinos: parseInt(elemento.dataset.maxDinos),
                descripcion: elemento.dataset.descripcion,
                dinosauriosColocados: []
            };
            
            // Obtener dinosaurios ya colocados
            const dinosauriosColocados = elemento.querySelectorAll('.dinosaurio-colocado');
            dinosauriosColocados.forEach(dinoElement => {
                recinto.dinosauriosColocados.push({
                    nombre: dinoElement.textContent.trim(),
                    familia: dinoElement.dataset.familia || 'desconocida'
                });
            });
            
            recintos.push(recinto);
        });
        
        return recintos;
    }

    /**
     * Crea el mapeo entre recintos de BD y contenedores visuales
     */
    crearMapeoRecintos(recintosBD) {
        const mapeo = [];
        
        // Mapeo específico basado en las reglas de Draftosaurus
        const mapeoReglas = {
            'MANADA': 'recinto-manada',
            'REY': 'recinto-rey', 
            'BOSQUE': 'recinto-bosque',
            'DESIERTO': 'recinto-desierto',
            'LAGO': 'recinto-lago',
            'MONTAÑA': 'recinto-montaña',
            'DIVERSIDAD': 'recinto-diversidad'
        };
        
        recintosBD.forEach((recintoBD, index) => {
            // Intentar mapear por regla específica
            let contenedorId = mapeoReglas[recintoBD.regla];
            
            // Si no hay mapeo específico, usar contenedores genéricos
            if (!contenedorId) {
                const contenedoresGenericos = [
                    'recinto-manada',
                    'recinto-rey',
                    'recinto-bosque',
                    'recinto-desierto',
                    'recinto-lago',
                    'recinto-montaña',
                    'recinto-diversidad'
                ];
                contenedorId = contenedoresGenericos[index % contenedoresGenericos.length];
            }
            
            mapeo.push({
                recintoId: recintoBD.id,
                contenedorId: contenedorId,
                recintoBD: recintoBD
            });
        });
        
        return mapeo;
    }

    /**
     * Actualiza contenedores del renderizador con datos reales de BD
     */
    actualizarContenedoresConDatosBD(mapeoRecintos) {
        if (!this.renderizadorTableroInteractivo.zonasInteractivas) return;
        
        mapeoRecintos.forEach(mapeo => {
            const contenedor = this.renderizadorTableroInteractivo.zonasInteractivas.find(
                zona => zona.id === mapeo.contenedorId
            );
            
            if (contenedor) {
                // Actualizar datos del contenedor con información real
                contenedor.recintoId = mapeo.recintoId;
                contenedor.nombre = mapeo.recintoBD.nombre;
                contenedor.descripcion = mapeo.recintoBD.descripcion;
                contenedor.maxDinosaurios = mapeo.recintoBD.maxDinos;
                
                // Cargar dinosaurios ya colocados
                if (mapeo.recintoBD.dinosauriosColocados.length > 0) {
                    contenedor.dinosauriosColocados = mapeo.recintoBD.dinosauriosColocados;
                }
                
                // Actualizar reglas según la BD
                this.actualizarReglasContenedor(contenedor, mapeo.recintoBD);
            }
        });
        
        // Re-renderizar para mostrar los cambios
        this.renderizadorTableroInteractivo.renderizar();
    }

    /**
     * Actualiza las reglas de un contenedor según datos de BD
     */
    actualizarReglasContenedor(contenedor, recintoBD) {
        // Mapear reglas de BD a reglas del renderizador
        const mapeoReglasBD = {
            'LINEA_INDIVIDUAL': 'INDIVIDUAL',
            'CONTENEDOR_MORADO': 'MANADA',
            'CONTENEDOR_NARANJA': 'PAREJAS',
            'CONTENEDOR_GRIS': 'INDIVIDUAL',
            'CONTENEDOR_AZUL': 'INDIVIDUAL',
            'CONTENEDOR_ROJO': 'INDIVIDUAL'
        };
        
        contenedor.regla = mapeoReglasBD[recintoBD.regla] || recintoBD.regla;
        
        // Actualizar restricciones según la regla
        switch (contenedor.regla) {
            case 'MANADA':
                contenedor.restriccion = 'MISMO_TIPO';
                break;
            case 'REY':
                contenedor.restriccion = 'SOLO_TREX';
                break;
            case 'BOSQUE':
                contenedor.restriccion = 'HERBIVOROS';
                break;
            case 'DESIERTO':
                contenedor.restriccion = 'CARNIVOROS';
                break;
            case 'LAGO':
                contenedor.restriccion = 'ACUATICOS';
                break;
            case 'MONTAÑA':
                contenedor.restriccion = 'VOLADORES';
                break;
            case 'DIVERSIDAD':
                contenedor.restriccion = 'TIPOS_DIFERENTES';
                break;
            default:
                contenedor.restriccion = 'CUALQUIER_TIPO';
        }
    }

    /**
     * Destruye el gestor del juego
     */
    destruir() {
        this.juegoActivo = false;
        this.estadoJuego.juegoActivo = false;

        if (this.gestorDados && this.gestorDados.destruir) {
            this.gestorDados.destruir();
        }
        if (this.gestorTablero && this.gestorTablero.destruir) {
            this.gestorTablero.destruir();
        }
        if (this.gestorBots && this.gestorBots.destruir) {
            this.gestorBots.destruir();
        }
        if (this.gestorDraft && this.gestorDraft.destruir) {
            this.gestorDraft.destruir();
        }
        if (this.renderizadorMapa && this.renderizadorMapa.destruir) {
            this.renderizadorMapa.destruir();
        }
        if (this.renderizadorTableroInteractivo && this.renderizadorTableroInteractivo.destruir) {
            this.renderizadorTableroInteractivo.destruir();
        }

        console.log('Gestor de Juego destruido');
    }
}
