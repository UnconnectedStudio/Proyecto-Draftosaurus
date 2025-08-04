/**
 * GESTOR DE NAVEGACIÓN
 * Maneja la navegación entre diferentes modos de juego y sistemas
 */

import { CONFIGURACION } from '../config/configuracion-app.js';

export class GestorNavegacion {
    constructor() {
        this.modoActual = 'menu';
        this.sistemaActivo = null;
        this.historialNavegacion = [];
        this.gestores = {};
    }

    /**
     * Establece referencias a otros gestores
     */
    establecerGestores(gestores) {
        this.gestores = gestores;
    }

    /**
     * Inicializa el gestor de navegación
     */
    inicializar() {
        this.detectarModoActual();
        this.configurarEventosNavegacion();
        console.log('Gestor de navegación inicializado');
    }

    /**
     * Detecta el modo actual basado en la URL o contexto
     */
    detectarModoActual() {
        const url = window.location.pathname;
        
        if (url.includes('partida')) {
            this.modoActual = 'partida';
        } else if (url.includes('auxiliar')) {
            this.modoActual = 'auxiliar';
        } else {
            this.modoActual = 'menu';
        }
        
        console.log('Modo actual detectado:', this.modoActual);
    }

    /**
     * Configura eventos de navegación
     */
    configurarEventosNavegacion() {
        // Configurar navegación con teclado
        document.addEventListener('keydown', (e) => {
            this.manejarTecladoNavegacion(e);
        });
    }

    /**
     * Maneja navegación con teclado
     */
    manejarTecladoNavegacion(evento) {
        // Ctrl + P para ir a partida
        if (evento.ctrlKey && evento.key === 'p') {
            evento.preventDefault();
            this.irAPartida();
        }
        
        // Ctrl + H para ir al inicio
        if (evento.ctrlKey && evento.key === 'h') {
            evento.preventDefault();
            this.irAInicio();
        }
    }

    /**
     * Navega a la partida
     */
    irAPartida() {
        this.registrarNavegacion('partida.php');
        window.location.href = 'partida.php';
    }

    /**
     * Navega al inicio
     */
    irAInicio() {
        this.registrarNavegacion('index.php');
        window.location.href = 'index.php';
    }

    /**
     * Registra la navegación en el historial
     */
    registrarNavegacion(destino) {
        this.historialNavegacion.push({
            destino,
            timestamp: Date.now(),
            origen: window.location.pathname
        });
        
        // Mantener solo los últimos 10 registros
        if (this.historialNavegacion.length > 10) {
            this.historialNavegacion = this.historialNavegacion.slice(-10);
        }
    }

    /**
     * Maneja mostrar opciones del menú principal
     */
    manejarMostrarOpciones() {
        const pantallaPrincipal = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL);
        const pantallaOpciones = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_OPCIONES);
        
        if (pantallaPrincipal && pantallaOpciones) {
            pantallaPrincipal.classList.add(CONFIGURACION.CLASES.OCULTO);
            pantallaOpciones.classList.remove(CONFIGURACION.CLASES.OCULTO);
            
            // Configurar eventos de las opciones
            this.configurarEventosOpciones();
            
            console.log('Mostrando pantalla de opciones');
        }
    }

    /**
     * Maneja volver atrás desde opciones
     */
    manejarVolverAtras() {
        const pantallaPrincipal = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL);
        const pantallaOpciones = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_OPCIONES);
        
        if (pantallaPrincipal && pantallaOpciones) {
            pantallaOpciones.classList.add(CONFIGURACION.CLASES.OCULTO);
            pantallaPrincipal.classList.remove(CONFIGURACION.CLASES.OCULTO);
            
            console.log('Volviendo a pantalla principal');
        }
    }

    /**
     * Maneja selección de opción del menú
     */
    manejarSeleccionarOpcion(numeroOpcion, elemento) {
        const modo = elemento.getAttribute(CONFIGURACION.ATRIBUTOS_DATOS.MODO);
        
        console.log(`Opción seleccionada: ${numeroOpcion}, Modo: ${modo}`);
        
        // Mostrar mensaje informativo
        if (this.gestores.ui) {
            this.gestores.ui.mostrarMensajeInfo(CONFIGURACION.MENSAJES.CARGANDO);
        }
        
        // Navegar según el modo seleccionado
        setTimeout(() => {
            switch (modo) {
                case CONFIGURACION.MODOS_JUEGO.AUXILIAR:
                    this.navegarAModo(CONFIGURACION.RUTAS.MODO_AUXILIAR);
                    break;
                case CONFIGURACION.MODOS_JUEGO.JUGABLE:
                    this.navegarAModo(CONFIGURACION.RUTAS.MODO_JUGABLE);
                    break;
                default:
                    console.warn('Modo no reconocido:', modo);
                    if (this.gestores.ui) {
                        this.gestores.ui.mostrarMensajeError(CONFIGURACION.MENSAJES.ERROR_NAVEGACION);
                    }
            }
        }, CONFIGURACION.EFECTOS.RETRASO_CARGA);
    }

    /**
     * Configura eventos específicos de las opciones
     */
    configurarEventosOpciones() {
        const tarjetasOpcion = document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_OPCION);
        
        tarjetasOpcion.forEach((tarjeta, index) => {
            // Añadir atributo de acción si no existe
            if (!tarjeta.hasAttribute(CONFIGURACION.ATRIBUTOS_DATOS.ACCION)) {
                tarjeta.setAttribute(CONFIGURACION.ATRIBUTOS_DATOS.ACCION, CONFIGURACION.ACCIONES.SELECCIONAR_OPCION);
            }
            
            // Añadir eventos de hover para efectos visuales (implementación directa)
            tarjeta.addEventListener('mouseenter', () => {
                // Aplicar efectos directamente sin depender del gestor de efectos
                tarjeta.style.transform = 'scale(1.02) translateY(-10px)';
                tarjeta.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
                tarjeta.style.transition = 'all 0.3s ease';
            });
            
            tarjeta.addEventListener('mouseleave', () => {
                // Remover efectos directamente
                tarjeta.style.transform = '';
                tarjeta.style.boxShadow = '';
            });
        });
    }

    /**
     * Navega a un modo específico
     */
    navegarAModo(ruta) {
        try {
            this.registrarNavegacion(ruta);
            window.location.href = ruta;
        } catch (error) {
            console.error('Error navegando a:', ruta, error);
            if (this.gestores.ui) {
                this.gestores.ui.mostrarMensajeError(CONFIGURACION.MENSAJES.ERROR_NAVEGACION);
            }
        }
    }

    /**
     * Obtiene el historial de navegación
     */
    obtenerHistorial() {
        return this.historialNavegacion;
    }

    /**
     * Limpia recursos del gestor
     */
    destruir() {
        // Limpiar eventos si es necesario
        console.log('Gestor de navegación destruido');
    }
}

// NOTA: La inicialización automática se ha eliminado para evitar duplicados
// El gestor se inicializa desde app.js como parte del sistema principal