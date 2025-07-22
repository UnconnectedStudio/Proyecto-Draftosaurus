/**
 * GESTOR NAVEGACIÓN
 * Gestiona la navegación entre pantallas y modos de juego
 */

import { CONFIGURACION } from '../config/configuracion-app.js';

export class GestorNavegacion {
    constructor() {
        this.gestores = {};
        this.pantallaActual = 'principal';
        this.historialNavegacion = [];
        this.estaNavegando = false;
    }

    /**
     * Inicializa el Gestor de Navegación
     */
    async inicializar() {
        try {
            this.configurarEventosNavegacion();
            console.log('🧭 Gestor de Navegación inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Gestor de Navegación:', error);
            throw error;
        }
    }

    /**
     * Establece referencias a otros gestores
     */
    establecerGestores(gestores) {
        this.gestores = gestores;
    }

    /**
     * Configura eventos de navegación
     */
    configurarEventosNavegacion() {
        // Evento para mostrar opciones
        const botonJugar = document.querySelector(CONFIGURACION.SELECTORES.BOTON_JUGAR);
        if (botonJugar) {
            botonJugar.addEventListener('click', (e) => {
                e.preventDefault();
                this.manejarMostrarOpciones();
            });
        }

        // Evento para volver atrás
        const botonVolver = document.querySelector(CONFIGURACION.SELECTORES.BOTON_VOLVER);
        if (botonVolver) {
            botonVolver.addEventListener('click', (e) => {
                e.preventDefault();
                this.manejarVolverAtras();
            });
        }

        // Eventos para seleccionar opciones
        const tarjetasOpcion = document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_OPCION);
        tarjetasOpcion.forEach((tarjeta, indice) => {
            tarjeta.addEventListener('click', (e) => {
                e.preventDefault();
                this.manejarSeleccionarOpcion(indice + 1, tarjeta);
            });
        });

        // Navegación con teclado
        this.configurarNavegacionTeclado();

        // Navegación del navegador (back/forward)
        this.configurarNavegacionNavegador();
    }

    /**
     * Configura navegación con teclado
     */
    configurarNavegacionTeclado() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    if (this.pantallaActual === 'opciones') {
                        this.manejarVolverAtras();
                    }
                    break;
                case 'Enter':
                case ' ':
                    if (e.target.classList.contains('option-card')) {
                        e.preventDefault();
                        e.target.click();
                    }
                    break;
                case '1':
                    if (this.pantallaActual === 'opciones') {
                        this.manejarSeleccionarOpcion(1);
                    }
                    break;
                case '2':
                    if (this.pantallaActual === 'opciones') {
                        this.manejarSeleccionarOpcion(2);
                    }
                    break;
            }
        });
    }

    /**
     * Configura navegación del navegador
     */
    configurarNavegacionNavegador() {
        // Manejar el botón atrás del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.pantalla) {
                this.navegarAPantalla(e.state.pantalla, false);
            } else if (this.pantallaActual === 'opciones') {
                this.manejarVolverAtras();
            }
        });

        // Establecer estado inicial
        history.replaceState({ pantalla: 'principal' }, 'Draftosaurus', window.location.href);
    }

    /**
     * Maneja la acción de mostrar opciones
     */
    async manejarMostrarOpciones() {
        if (this.estaNavegando) return;

        try {
            this.estaNavegando = true;

            // Agregar a historial
            this.agregarAHistorial('principal');

            // Navegar a pantalla de opciones
            await this.navegarAPantalla('opciones');

            // Actualizar historial del navegador
            history.pushState({ pantalla: 'opciones' }, 'Opciones - Draftosaurus', '#opciones');

        } catch (error) {
            console.error('❌ Error mostrando opciones:', error);
            this.gestores.ui?.mostrarMensajeError(CONFIGURACION.MENSAJES.ERROR_NAVEGACION);
        } finally {
            this.estaNavegando = false;
        }
    }

    /**
     * Maneja la acción de volver atrás
     */
    async manejarVolverAtras() {
        if (this.estaNavegando) return;

        try {
            this.estaNavegando = true;

            // Obtener pantalla anterior del historial
            const pantallaAnterior = this.historialNavegacion.pop() || 'principal';

            // Navegar a pantalla anterior
            await this.navegarAPantalla(pantallaAnterior);

            // Actualizar historial del navegador
            if (pantallaAnterior === 'principal') {
                history.pushState({ pantalla: 'principal' }, 'Draftosaurus', window.location.pathname);
            }

        } catch (error) {
            console.error('❌ Error navegando atrás:', error);
            this.gestores.ui?.mostrarMensajeError(CONFIGURACION.MENSAJES.ERROR_NAVEGACION);
        } finally {
            this.estaNavegando = false;
        }
    }

    /**
     * Maneja la selección de una opción
     */
    async manejarSeleccionarOpcion(numeroOpcion, elementoTarjeta = null) {
        if (this.estaNavegando) return;

        try {
            this.estaNavegando = true;

            // Obtener información de la opción
            const infoOpcion = this.obtenerInfoOpcion(numeroOpcion);
            if (!infoOpcion) {
                throw new Error(`Opción ${numeroOpcion} no válida`);
            }

            // Mostrar feedback visual
            this.mostrarFeedbackSeleccion(numeroOpcion - 1, infoOpcion);

            // Mostrar mensaje de carga
            this.gestores.ui?.mostrarMensajeInfo(CONFIGURACION.MENSAJES.CARGANDO);

            // Delay para mostrar el feedback antes de navegar
            await this.esperar(CONFIGURACION.EFECTOS.RETRASO_CARGA);

            // Navegar al modo seleccionado
            await this.navegarAModoJuego(infoOpcion.modo);

        } catch (error) {
            console.error('❌ Error seleccionando opción:', error);
            this.gestores.ui?.mostrarMensajeError(CONFIGURACION.MENSAJES.ERROR_NAVEGACION);

            // Resetear estado visual
            this.gestores.ui?.reiniciarTarjetasOpcion();
        } finally {
            this.estaNavegando = false;
        }
    }

    /**
     * Obtiene información de una opción
     */
    obtenerInfoOpcion(numeroOpcion) {
        const mapaOpciones = {
            1: {
                modo: CONFIGURACION.MODOS_JUEGO.AUXILIAR,
                ruta: CONFIGURACION.RUTAS.MODO_AUXILIAR,
                nombre: 'Modo Auxiliar'
            },
            2: {
                modo: CONFIGURACION.MODOS_JUEGO.JUGABLE,
                ruta: CONFIGURACION.RUTAS.MODO_JUGABLE,
                nombre: 'Modo Jugable'
            }
        };

        return mapaOpciones[numeroOpcion];
    }

    /**
     * Muestra feedback visual de selección
     */
    mostrarFeedbackSeleccion(indiceTarjeta, infoOpcion) {
        // Usar Gestor UI para mostrar la selección
        this.gestores.ui?.seleccionarTarjetaOpcion(indiceTarjeta);

        console.log(`🎮 Seleccionado: ${infoOpcion.nombre}`);
    }

    /**
     * Navega a una pantalla específica
     */
    async navegarAPantalla(nombrePantalla, actualizarHistorial = true) {
        const pantallaAnterior = this.pantallaActual;
        this.pantallaActual = nombrePantalla;

        switch (nombrePantalla) {
            case 'principal':
                this.gestores.ui?.ocultarPantallaOpciones();
                break;
            case 'opciones':
                this.gestores.ui?.mostrarPantallaOpciones();
                break;
            default:
                throw new Error(`Pantalla desconocida: ${nombrePantalla}`);
        }

        // Aplicar efectos si están disponibles
        this.gestores.efectos?.alCambiarPantalla(pantallaAnterior, nombrePantalla);

        console.log(`📱 Navegado de ${pantallaAnterior} a ${nombrePantalla}`);
    }

    /**
     * Navega a un modo de juego específico
     */
    async navegarAModoJuego(modo) {
        // Buscar la información de la opción que corresponde al modo
        let infoOpcion = null;

        // Revisar opción 1
        const opcion1 = this.obtenerInfoOpcion(1);
        if (opcion1 && opcion1.modo === modo) {
            infoOpcion = opcion1;
        }

        // Revisar opción 2 si no se encontró en la opción 1
        if (!infoOpcion) {
            const opcion2 = this.obtenerInfoOpcion(2);
            if (opcion2 && opcion2.modo === modo) {
                infoOpcion = opcion2;
            }
        }

        if (!infoOpcion) {
            throw new Error(`Modo de juego desconocido: ${modo}`);
        }

        // Validar que la ruta existe
        if (!this.validarRuta(infoOpcion.ruta)) {
            throw new Error(`Ruta no válida: ${infoOpcion.ruta}`);
        }

        // Navegar a la nueva página
        window.location.href = infoOpcion.ruta;
    }

    /**
     * Valida que una ruta sea accesible
     */
    validarRuta(ruta) {
        // Validación básica de formato de ruta
        return ruta && typeof ruta === 'string' && ruta.length > 0;
    }

    /**
     * Agrega una pantalla al historial de navegación
     */
    agregarAHistorial(pantalla) {
        this.historialNavegacion.push(pantalla);

        // Limitar el tamaño del historial
        if (this.historialNavegacion.length > 10) {
            this.historialNavegacion.shift();
        }
    }

    /**
     * Obtiene el historial de navegación
     */
    obtenerHistorialNavegacion() {
        return [...this.historialNavegacion];
    }

    /**
     * Verifica si se puede navegar atrás
     */
    puedeVolverAtras() {
        return this.historialNavegacion.length > 0 || this.pantallaActual !== 'principal';
    }

    /**
     * Obtiene información del estado actual de navegación
     */
    obtenerEstadoNavegacion() {
        return {
            pantallaActual: this.pantallaActual,
            estaNavegando: this.estaNavegando,
            puedeVolverAtras: this.puedeVolverAtras(),
            longitudHistorial: this.historialNavegacion.length
        };
    }

    /**
     * Función utilitaria para delays
     */
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Maneja errores de navegación
     */
    manejarErrorNavegacion(error, contexto = '') {
        console.error(`❌ Error de navegación ${contexto}:`, error);

        // Resetear estado de navegación
        this.estaNavegando = false;

        // Mostrar mensaje de error al usuario
        this.gestores.ui?.mostrarMensajeError(
            CONFIGURACION.MENSAJES.ERROR_NAVEGACION + (contexto ? ` (${contexto})` : '')
        );

        // Intentar volver a un estado estable
        if (this.pantallaActual !== 'principal') {
            setTimeout(() => {
                this.navegarAPantalla('principal').catch(console.error);
            }, 1000);
        }
    }

    /**
     * Limpia recursos del Gestor de Navegación
     */
    destruir() {
        // Limpiar historial
        this.historialNavegacion = [];
        this.pantallaActual = 'principal';
        this.estaNavegando = false;

        console.log('🧹 Gestor de Navegación limpiado');
    }
}