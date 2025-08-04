/**
 * CONFIGURACIÓN DE LA APLICACIÓN
 * Contiene todas las constantes y configuraciones centralizadas
 */

export const CONFIGURACION = {
    // Información de la aplicación
    NOMBRE_APP: 'Draftosaurus',
    VERSION_APP: '0.2',
    
    // Rutas de navegación
    RUTAS: {
        MODO_AUXILIAR: './auxiliar.php',
        MODO_JUGABLE: './nueva_partida.php'
    },
    
    // Selectores DOM
    SELECTORES: {
        // Pantallas principales
        PANTALLA_PRINCIPAL: '#pantalla-principal',
        PANTALLA_OPCIONES: '#options-screen',
        
        // Botones
        BOTON_JUGAR: '#play-button',
        BOTON_VOLVER: '.btn-back',
        
        // Contenedores
        CONTENEDOR_OPCIONES: '.options-container',
        CONTENEDOR_TOAST: '#toast-container',
        
        // Elementos específicos
        TARJETAS_OPCION: '.option-card',
        TARJETAS_CARACTERISTICA: '.feature-card',
        TEXTO_VERSION: '.version-text'
    },
    
    // Clases CSS
    CLASES: {
        OCULTO: 'hidden',
        DIFUMINADO: 'blur',
        DESHABILITADO: 'disabled',
        SELECCIONADO: 'selected',
        EN_TRANSICION: 'transitioning',
        CARGANDO: 'loading'
    },
    
    // Atributos de datos
    ATRIBUTOS_DATOS: {
        ACCION: 'data-action',
        OPCION: 'data-option',
        MODO: 'data-mode'
    },
    
    // Acciones disponibles
    ACCIONES: {
        MOSTRAR_OPCIONES: 'show-options',
        VOLVER_ATRAS: 'go-back',
        SELECCIONAR_OPCION: 'select-option'
    },
    
    // Modos de juego
    MODOS_JUEGO: {
        AUXILIAR: 'auxiliary',
        JUGABLE: 'playable'
    },
    
    // Configuración de animaciones
    ANIMACIONES: {
        DURACION: {
            RAPIDA: 200,
            NORMAL: 300,
            LENTA: 500
        },
        SUAVIZADO: {
            SUAVE: 'ease',
            ENTRADA: 'ease-in',
            SALIDA: 'ease-out',
            ENTRADA_SALIDA: 'ease-in-out'
        }
    },
    
    // Configuración de efectos
    EFECTOS: {
        FACTOR_PARALLAX: 0.1,
        CANTIDAD_DIFUMINADO: '8px',
        RETRASO_ANIMACION_TARJETA: 100,
        RETRASO_CARGA: 1000
    },
    
    // Mensajes de la aplicación
    MENSAJES: {
        CARGANDO: 'Cargando modo seleccionado...',
        ERROR_GENERICO: 'Ha ocurrido un error inesperado',
        ERROR_NAVEGACION: 'Error al navegar. Inténtalo de nuevo.',
        ERROR_INICIALIZACION: 'Error al inicializar la aplicación'
    },
    
    // Configuración de toast
    TOAST: {
        TIPOS: {
            INFO: 'info',
            EXITO: 'success',
            ADVERTENCIA: 'warning',
            ERROR: 'danger'
        },
        DURACION: 3000,
        POSICION: 'top-end'
    },
    
    // Configuración responsive
    PUNTOS_RUPTURA: {
        XS: 320,
        SM: 576,
        MD: 768,
        LG: 992,
        XL: 1200,
        XXL: 1400
    },
    
    // Configuración de rendimiento
    RENDIMIENTO: {
        RETRASO_DEBOUNCE: 250,
        RETRASO_THROTTLE: 16, // ~60fps
        PRESUPUESTO_FRAME_ANIMACION: 16.67 // ms por frame a 60fps
    },
    
    // Configuración de accesibilidad
    ACCESIBILIDAD: {
        OBJETIVO_TACTIL_MINIMO: 44, // px
        ANCHO_CONTORNO_FOCO: 2, // px
        CONSULTA_MOVIMIENTO_REDUCIDO: '(prefers-reduced-motion: reduce)'
    },
    
    // URLs de recursos
    RECURSOS: {
        IMAGENES: {
            FONDO: '/recursos/img/nuevoFondoPantalla.png',
            LOGO_PRINCIPAL: '/recursos/img/logoDraftosaurus-titulo-sinfondon.png',
            LOGO_EMPRESA: '/recursos/img/logoEmpresa-sinfondo.png',
            MODO_AUXILIAR: '/recursos/img/auximg.png',
            MODO_JUGABLE: '/recursos/img/jugableLOGO.png'
        }
    },
    
    // Configuración de desarrollo
    DEPURACION: {
        HABILITADO: false, // Cambiar a true para modo debug
        NIVEL_LOG: 'info', // 'debug', 'info', 'warn', 'error'
        MOSTRAR_RENDIMIENTO: false
    }
};

// Configuración específica del entorno
export const CONFIGURACION_ENTORNO = {
    // Detectar si estamos en desarrollo
    esDesarrollo: window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1',
    
    // Detectar dispositivo móvil
    esMovil: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    // Detectar soporte táctil
    tieneTactil: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Detectar preferencias de movimiento reducido
    prefiereMovimientoReducido: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Información del navegador
    navegador: {
        esChrome: /Chrome/.test(navigator.userAgent),
        esFirefox: /Firefox/.test(navigator.userAgent),
        esSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        esEdge: /Edge/.test(navigator.userAgent)
    }
};

// Función para obtener configuración combinada
export function obtenerConfiguracion() {
    return {
        ...CONFIGURACION,
        entorno: CONFIGURACION_ENTORNO
    };
}

// Función para actualizar configuración en tiempo de ejecución
export function actualizarConfiguracion(nuevaConfiguracion) {
    Object.assign(CONFIGURACION, nuevaConfiguracion);
}

// Exportar como default para facilitar importación
export default CONFIGURACION;