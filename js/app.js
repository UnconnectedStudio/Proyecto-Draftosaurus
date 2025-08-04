/**
 * DRAFTOSAURUS - Aplicación Principal
 * Archivo principal que inicializa y coordina todos los módulos
 */

import { GestorUI } from './modules/gestor-ui.js';
import { GestorNavegacion } from './modules/gestor-navegacion.js';
import { GestorEfectos } from './modules/gestor-efectos.js';
import { GestorEventos } from './modules/gestor-eventos.js';
import { CONFIGURACION } from './config/configuracion-app.js';

class AplicacionDraftosaurus {
    constructor() {
        this.configuracion = CONFIGURACION;
        this.gestores = {};
        this.estaInicializada = false;
    }

    /**
     * Inicializa la aplicación
     */
    async inicializar() {
        try {
            console.log('Inicializando Draftosaurus App...');

            // Inicializar gestores
            this.gestores.ui = new GestorUI();
            this.gestores.navegacion = new GestorNavegacion();
            this.gestores.efectos = new GestorEfectos();
            this.gestores.eventos = new GestorEventos();

            // Configurar referencias cruzadas entre gestores
            this.configurarReferenciasGestores();

            // Inicializar cada gestor
            await this.inicializarGestores();

            // Configurar eventos globales
            this.configurarEventosGlobales();

            this.estaInicializada = true;
            console.log('Draftosaurus App inicializada correctamente');

        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
            this.manejarErrorInicializacion(error);
        }
    }

    /**
     * Configura referencias entre gestores
     */
    configurarReferenciasGestores() {
        // Permitir que los gestores se comuniquen entre sí
        Object.values(this.gestores).forEach(gestor => {
            gestor.establecerGestores(this.gestores);
        });
    }

    /**
     * Inicializa todos los gestores
     */
    async inicializarGestores() {
        const promesasInicializacion = Object.entries(this.gestores).map(async ([nombre, gestor]) => {
            try {
                await gestor.inicializar();
                console.log(`${nombre} gestor inicializado`);
            } catch (error) {
                console.error(`Error inicializando ${nombre} gestor:`, error);
                throw error;
            }
        });

        await Promise.all(promesasInicializacion);
    }

    /**
     * Configura eventos globales de la aplicación
     */
    configurarEventosGlobales() {
        // Evento de carga completa del DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.alDOMListar();
            });
        } else {
            this.alDOMListar();
        }

        // Eventos de ventana
        window.addEventListener('resize', this.manejarRedimensionamiento.bind(this));
        window.addEventListener('scroll', this.manejarDesplazamiento.bind(this));

        // Eventos de visibilidad
        document.addEventListener('visibilitychange', this.manejarCambioVisibilidad.bind(this));

        // Manejo de errores globales
        window.addEventListener('error', this.manejarErrorGlobal.bind(this));
        window.addEventListener('unhandledrejection', this.manejarPromesaRechazada.bind(this));
    }

    /**
     * Ejecuta cuando el DOM está listo
     */
    alDOMListar() {
        console.log('DOM listo');

        // Inicializar componentes Bootstrap si están disponibles
        this.inicializarComponentesBootstrap();

        // Aplicar efectos iniciales
        this.gestores.efectos?.aplicarEfectosIniciales();

        // Mostrar la aplicación
        this.mostrarAplicacion();
    }

    /**
     * Inicializa componentes de Bootstrap
     */
    inicializarComponentesBootstrap() {
        if (typeof bootstrap !== 'undefined') {
            // Inicializar tooltips
            const listaActivadoresTooltip = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="tooltip"]')
            );
            listaActivadoresTooltip.map(elementoActivadorTooltip => {
                return new bootstrap.Tooltip(elementoActivadorTooltip);
            });

            console.log('Componentes Bootstrap inicializados');
        }
    }

    /**
     * Muestra la aplicación con animación
     */
    mostrarAplicacion() {
        const pantallaPrincipal = document.getElementById('pantalla-principal');
        if (pantallaPrincipal) {
            pantallaPrincipal.style.opacity = '0';
            pantallaPrincipal.style.transform = 'translateY(20px)';

            requestAnimationFrame(() => {
                pantallaPrincipal.style.transition = 'all 0.5s ease';
                pantallaPrincipal.style.opacity = '1';
                pantallaPrincipal.style.transform = 'translateY(0)';
            });
        }
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    manejarRedimensionamiento() {
        // Debounce para evitar múltiples llamadas
        clearTimeout(this.tiempoEsperaRedimensionamiento);
        this.tiempoEsperaRedimensionamiento = setTimeout(() => {
            this.gestores.ui?.manejarRedimensionamiento();
            this.gestores.efectos?.manejarRedimensionamiento();
        }, 250);
    }

    /**
     * Maneja el scroll de la ventana
     */
    manejarDesplazamiento() {
        // Throttle para mejor rendimiento
        if (!this.desplazamientoEnProceso) {
            requestAnimationFrame(() => {
                this.gestores.efectos?.manejarDesplazamiento();
                this.desplazamientoEnProceso = false;
            });
            this.desplazamientoEnProceso = true;
        }
    }

    /**
     * Maneja cambios de visibilidad de la página
     */
    manejarCambioVisibilidad() {
        if (document.hidden) {
            console.log('Aplicación en segundo plano');
            this.gestores.efectos?.pausarAnimaciones();
        } else {
            console.log('Aplicación en primer plano');
            this.gestores.efectos?.reanudarAnimaciones();
        }
    }

    /**
     * Maneja errores globales
     */
    manejarErrorGlobal(evento) {
        console.error('Error global:', evento.error);
        this.gestores.ui?.mostrarMensajeError('Ha ocurrido un error inesperado');
    }

    /**
     * Maneja promesas rechazadas
     */
    manejarPromesaRechazada(evento) {
        console.error('Promesa rechazada:', evento.reason);
        this.gestores.ui?.mostrarMensajeError('Error de conexión o procesamiento');
    }

    /**
     * Maneja errores de inicialización
     */
    manejarErrorInicializacion(error) {
        const mensajeError = 'Error al inicializar la aplicación. Por favor, recarga la página.';

        // Mostrar mensaje de error básico si no hay gestor UI
        if (!this.gestores.ui) {
            alert(mensajeError);
        } else {
            this.gestores.ui.mostrarMensajeError(mensajeError);
        }
    }

    /**
     * Obtiene información del estado de la aplicación
     */
    obtenerInfoAplicacion() {
        return {
            version: this.configuracion.VERSION_APP,
            inicializada: this.estaInicializada,
            gestores: Object.keys(this.gestores),
            marcaTiempo: new Date().toISOString()
        };
    }

    /**
     * Limpia recursos al cerrar la aplicación
     */
    destruir() {
        console.log('Limpiando recursos de la aplicación...');

        // Limpiar gestores
        Object.values(this.gestores).forEach(gestor => {
            if (gestor.destruir) {
                gestor.destruir();
            }
        });

        // Limpiar timeouts
        if (this.tiempoEsperaRedimensionamiento) {
            clearTimeout(this.tiempoEsperaRedimensionamiento);
        }

        this.estaInicializada = false;
        console.log('Recursos limpiados');
    }
}

// Crear instancia global de la aplicación
const aplicacion = new AplicacionDraftosaurus();

// Inicializar cuando se carga el script
aplicacion.inicializar();

// Exponer la aplicación globalmente para debugging
window.AplicacionDraftosaurus = aplicacion;

// Limpiar al cerrar la ventana
window.addEventListener('beforeunload', () => {
    aplicacion.destruir();
});

export default aplicacion;