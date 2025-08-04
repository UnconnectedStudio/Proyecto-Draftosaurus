/**
 * GESTOR EVENTOS
 * Gestiona eventos globales, delegación de eventos y comunicación entre componentes
 */

import { CONFIGURACION } from '../config/configuracion-app.js';

export class GestorEventos {
    constructor() {
        this.gestores = {};
        this.oyentesEventos = new Map();
        this.manejadoresEventosPersonalizados = new Map();
        this.eventosDelegados = new Set();
    }

    /**
     * Inicializa el Gestor de Eventos
     */
    async inicializar() {
        try {
            this.configurarDelegacionEventos();
            this.configurarEventosPersonalizados();
            this.configurarManejadoresEventosGlobales();
            console.log('Gestor de Eventos inicializado');
        } catch (error) {
            console.error('Error inicializando Gestor de Eventos:', error);
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
     * Configura delegación de eventos
     */
    configurarDelegacionEventos() {
        // Delegación de eventos de click
        this.agregarEventoDelegado('click', document.body, (e) => {
            this.manejarClickDelegado(e);
        });

        // Delegación de eventos de teclado
        this.agregarEventoDelegado('keydown', document, (e) => {
            this.manejarTecladoDelegado(e);
        });

        // Delegación de eventos de focus
        this.agregarEventoDelegado('focusin', document, (e) => {
            this.manejarFocoDelegado(e);
        });

        // Delegación de eventos táctiles
        if ('ontouchstart' in window) {
            this.agregarEventoDelegado('touchstart', document.body, (e) => {
                this.manejarTactilDelegado(e);
            });
        }
    }

    /**
     * Agrega un evento delegado
     */
    agregarEventoDelegado(tipoEvento, elemento, manejador) {
        const manejadorEnvuelto = (e) => {
            try {
                manejador(e);
            } catch (error) {
                console.error(`Error en evento delegado ${tipoEvento}:`, error);
            }
        };

        elemento.addEventListener(tipoEvento, manejadorEnvuelto);
        this.eventosDelegados.add({ tipoEvento, elemento, manejador: manejadorEnvuelto });
    }

    /**
     * Maneja clicks delegados
     */
    manejarClickDelegado(e) {
        const objetivo = e.target.closest('[data-action]');
        if (!objetivo) return;

        const accion = objetivo.getAttribute(CONFIGURACION.ATRIBUTOS_DATOS.ACCION);
        this.manejarAccion(accion, objetivo, e);
    }

    /**
     * Maneja eventos de teclado delegados
     */
    manejarTecladoDelegado(e) {
        // Manejar navegación con teclado
        if (e.key === 'Tab') {
            this.manejarNavegacionTab(e);
        }

        // Manejar teclas de acceso rápido
        if (e.ctrlKey || e.metaKey) {
            this.manejarAtajosTeclado(e);
        }

        // Manejar teclas de navegación
        this.manejarTeclasNavegacion(e);
    }

    /**
     * Maneja eventos de focus delegados
     */
    manejarFocoDelegado(e) {
        // Mejorar visibilidad del focus
        if (e.target.matches('button, .option-card, .feature-card')) {
            this.mejorarVisibilidadFoco(e.target);
        }
    }

    /**
     * Maneja eventos táctiles delegados
     */
    manejarTactilDelegado(e) {
        // Agregar clase para indicar interacción táctil
        const objetivo = e.target.closest('.option-card, .feature-card, button');
        if (objetivo) {
            objetivo.classList.add('tactil-activo');
            
            // Remover la clase después de un tiempo
            setTimeout(() => {
                objetivo.classList.remove('tactil-activo');
            }, 150);
        }
    }

    /**
     * Maneja acciones basadas en data-action
     */
    manejarAccion(accion, elemento, evento) {
        console.log(`Acción ejecutada: ${accion}`);

        switch (accion) {
            case CONFIGURACION.ACCIONES.MOSTRAR_OPCIONES:
                this.gestores.navegacion?.manejarMostrarOpciones();
                break;
                
            case CONFIGURACION.ACCIONES.VOLVER_ATRAS:
                this.gestores.navegacion?.manejarVolverAtras();
                break;
                
            case CONFIGURACION.ACCIONES.SELECCIONAR_OPCION:
                const numeroOpcion = parseInt(elemento.getAttribute(CONFIGURACION.ATRIBUTOS_DATOS.OPCION));
                this.gestores.navegacion?.manejarSeleccionarOpcion(numeroOpcion, elemento);
                break;
                
            default:
                console.warn(`Acción desconocida: ${accion}`);
        }

        // Emitir evento personalizado
        this.emitir('accion:ejecutada', {
            accion,
            elemento,
            eventoOriginal: evento
        });
    }

    /**
     * Maneja navegación con Tab
     */
    manejarNavegacionTab(e) {
        // Mejorar el orden de tabulación en pantalla de opciones
        const pantallaOpciones = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_OPCIONES);
        if (pantallaOpciones && !pantallaOpciones.classList.contains(CONFIGURACION.CLASES.OCULTO)) {
            this.manejarTabulacionPantallaOpciones(e);
        }
    }

    /**
     * Maneja tabulación en pantalla de opciones
     */
    manejarTabulacionPantallaOpciones(e) {
        const elementosEnfocables = document.querySelectorAll(
            '.option-card, .btn-back'
        );
        
        const arrayEnfocables = Array.from(elementosEnfocables);
        const indiceActual = arrayEnfocables.indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Tab hacia atrás
            if (indiceActual <= 0) {
                e.preventDefault();
                arrayEnfocables[arrayEnfocables.length - 1].focus();
            }
        } else {
            // Tab hacia adelante
            if (indiceActual >= arrayEnfocables.length - 1) {
                e.preventDefault();
                arrayEnfocables[0].focus();
            }
        }
    }

    /**
     * Maneja atajos de teclado
     */
    manejarAtajosTeclado(e) {
        // Ctrl/Cmd + H para mostrar ayuda (ejemplo)
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            this.mostrarAyudaTeclado();
        }
    }

    /**
     * Maneja teclas de navegación
     */
    manejarTeclasNavegacion(e) {
        switch (e.key) {
            case 'Escape':
                this.manejarTeclaEscape(e);
                break;
            case 'Enter':
            case ' ':
                this.manejarTeclaActivacion(e);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                this.manejarTeclasFlechas(e);
                break;
        }
    }

    /**
     * Maneja la tecla Escape
     */
    manejarTeclaEscape(e) {
        const pantallaOpciones = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_OPCIONES);
        if (pantallaOpciones && !pantallaOpciones.classList.contains(CONFIGURACION.CLASES.OCULTO)) {
            e.preventDefault();
            this.gestores.navegacion?.manejarVolverAtras();
        }
    }

    /**
     * Maneja teclas de activación (Enter/Space)
     */
    manejarTeclaActivacion(e) {
        const objetivo = e.target;
        
        if (objetivo.matches('.option-card')) {
            e.preventDefault();
            objetivo.click();
        } else if (objetivo.matches('button') && e.key === ' ') {
            e.preventDefault();
            objetivo.click();
        }
    }

    /**
     * Maneja teclas de flecha
     */
    manejarTeclasFlechas(e) {
        const pantallaOpciones = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_OPCIONES);
        if (pantallaOpciones && !pantallaOpciones.classList.contains(CONFIGURACION.CLASES.OCULTO)) {
            this.manejarNavegacionFlechasOpciones(e);
        }
    }

    /**
     * Maneja navegación con flechas en opciones
     */
    manejarNavegacionFlechasOpciones(e) {
        const tarjetasOpcion = document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_OPCION);
        const indiceActual = Array.from(tarjetasOpcion).indexOf(document.activeElement);
        
        if (indiceActual === -1) return;
        
        let nuevoIndice;
        if (e.key === 'ArrowLeft') {
            nuevoIndice = indiceActual > 0 ? indiceActual - 1 : tarjetasOpcion.length - 1;
        } else if (e.key === 'ArrowRight') {
            nuevoIndice = indiceActual < tarjetasOpcion.length - 1 ? indiceActual + 1 : 0;
        }
        
        if (nuevoIndice !== undefined) {
            e.preventDefault();
            tarjetasOpcion[nuevoIndice].focus();
        }
    }

    /**
     * Mejora la visibilidad del focus
     */
    mejorarVisibilidadFoco(elemento) {
        // Agregar clase temporal para mejorar el focus
        elemento.classList.add('foco-mejorado');
        
        // Remover después de que pierda el focus
        const removerFoco = () => {
            elemento.classList.remove('foco-mejorado');
            elemento.removeEventListener('blur', removerFoco);
        };
        
        elemento.addEventListener('blur', removerFoco);
    }

    /**
     * Configura eventos personalizados
     */
    configurarEventosPersonalizados() {
        // Evento para cambios de pantalla
        this.escuchar('pantalla:cambio', (datos) => {
            console.log(`Cambio de pantalla detectado:`, datos);
        });

        // Evento para errores
        this.escuchar('error:ocurrido', (datos) => {
            console.error(`Error detectado:`, datos);
            this.manejarErrorAplicacion(datos);
        });

        // Evento para acciones de usuario
        this.escuchar('usuario:accion', (datos) => {
            console.log(`Acción de usuario:`, datos);
        });
    }

    /**
     * Configura manejadores de eventos globales
     */
    configurarManejadoresEventosGlobales() {
        // Manejo de errores no capturados
        window.addEventListener('error', (e) => {
            this.emitir('error:ocurrido', {
                tipo: 'javascript',
                mensaje: e.message,
                archivo: e.filename,
                linea: e.lineno,
                columna: e.colno,
                error: e.error
            });
        });

        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            this.emitir('error:ocurrido', {
                tipo: 'promesa',
                razon: e.reason
            });
        });

        // Cambios de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            this.emitir('pagina:visibilidad', {
                oculta: document.hidden,
                estadoVisibilidad: document.visibilityState
            });
        });

        // Cambios de conexión de red
        if ('navigator' in window && 'onLine' in navigator) {
            window.addEventListener('online', () => {
                this.emitir('red:conectada');
            });
            
            window.addEventListener('offline', () => {
                this.emitir('red:desconectada');
            });
        }
    }

    /**
     * Registra un manejador de evento personalizado
     */
    escuchar(nombreEvento, manejador) {
        if (!this.manejadoresEventosPersonalizados.has(nombreEvento)) {
            this.manejadoresEventosPersonalizados.set(nombreEvento, new Set());
        }
        
        this.manejadoresEventosPersonalizados.get(nombreEvento).add(manejador);
    }

    /**
     * Desregistra un manejador de evento personalizado
     */
    dejarDeEscuchar(nombreEvento, manejador) {
        if (this.manejadoresEventosPersonalizados.has(nombreEvento)) {
            this.manejadoresEventosPersonalizados.get(nombreEvento).delete(manejador);
        }
    }

    /**
     * Emite un evento personalizado
     */
    emitir(nombreEvento, datos = {}) {
        if (this.manejadoresEventosPersonalizados.has(nombreEvento)) {
            this.manejadoresEventosPersonalizados.get(nombreEvento).forEach(manejador => {
                try {
                    manejador(datos);
                } catch (error) {
                    console.error(`Error en manejador de evento ${nombreEvento}:`, error);
                }
            });
        }

        // También emitir como evento DOM personalizado
        const eventoPersonalizado = new CustomEvent(nombreEvento, { detail: datos });
        document.dispatchEvent(eventoPersonalizado);
    }

    /**
     * Maneja errores de aplicación
     */
    manejarErrorAplicacion(datosError) {
        // Mostrar mensaje de error al usuario si es apropiado
        if (datosError.tipo === 'javascript' && this.gestores.ui) {
            this.gestores.ui.mostrarMensajeError(CONFIGURACION.MENSAJES.ERROR_GENERICO);
        }
    }

    /**
     * Muestra ayuda de teclado
     */
    mostrarAyudaTeclado() {
        const mensajeAyuda = `
            Atajos de teclado:
            • Escape: Volver atrás
            • Enter/Espacio: Activar elemento
            • Tab: Navegar entre elementos
            • Flechas: Navegar entre opciones
            • 1/2: Seleccionar modo (en pantalla de opciones)
        `;
        
        if (this.gestores.ui) {
            this.gestores.ui.mostrarMensajeInfo('Ayuda de teclado disponible en consola');
        }
        
        console.info(mensajeAyuda);
    }

    /**
     * Obtiene estadísticas de eventos
     */
    obtenerEstadisticasEventos() {
        return {
            manejadoresEventosPersonalizados: this.manejadoresEventosPersonalizados.size,
            eventosDelegados: this.eventosDelegados.size,
            oyentesActivos: this.oyentesEventos.size
        };
    }

    /**
     * Limpia recursos del Gestor de Eventos
     */
    destruir() {
        // Remover eventos delegados
        this.eventosDelegados.forEach(({ tipoEvento, elemento, manejador }) => {
            elemento.removeEventListener(tipoEvento, manejador);
        });
        this.eventosDelegados.clear();

        // Limpiar manejadores personalizados
        this.manejadoresEventosPersonalizados.clear();

        // Limpiar listeners registrados
        this.oyentesEventos.clear();

        console.log('Gestor de Eventos limpiado');
    }
}