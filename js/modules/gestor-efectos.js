/**
 * GESTOR EFECTOS
 * Gestiona efectos visuales, animaciones y transiciones
 */

import { CONFIGURACION, CONFIGURACION_ENTORNO } from '../config/configuracion-app.js';

export class GestorEfectos {
    constructor() {
        this.gestores = {};
        this.idFrameAnimacion = null;
        this.animacionesPausadas = false;
        this.animacionesActivas = new Set();
        this.elementosParallax = [];
    }

    /**
     * Inicializa el Gestor de Efectos
     */
    async inicializar() {
        try {
            this.configurarElementosParallax();
            this.configurarEfectosDesplazamiento();
            this.configurarEfectosHover();
            this.verificarPreferenciaMovimientoReducido();
            console.log('Gestor de Efectos inicializado');
        } catch (error) {
            console.error('Error inicializando Gestor de Efectos:', error);
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
     * Verifica preferencias de movimiento reducido
     */
    verificarPreferenciaMovimientoReducido() {
        if (CONFIGURACION_ENTORNO.prefiereMovimientoReducido) {
            console.log('Movimiento reducido detectado - Desactivando animaciones complejas');
            this.animacionesPausadas = true;
        }

        // Escuchar cambios en las preferencias
        const consultaMedia = window.matchMedia(CONFIGURACION.ACCESIBILIDAD.CONSULTA_MOVIMIENTO_REDUCIDO);
        consultaMedia.addEventListener('change', (e) => {
            this.animacionesPausadas = e.matches;
            console.log(`Preferencia de movimiento cambiada: ${e.matches ? 'reducido' : 'normal'}`);
        });
    }

    /**
     * Configura elementos para efecto parallax
     */
    configurarElementosParallax() {
        const contenedor = document.querySelector('.main-screen');
        if (contenedor) {
            this.elementosParallax.push({
                elemento: contenedor,
                factor: CONFIGURACION.EFECTOS.FACTOR_PARALLAX
            });
        }
    }

    /**
     * Configura efectos de scroll
     */
    configurarEfectosDesplazamiento() {
        // Solo en pantalla principal para evitar conflictos
        this.ultimoScrollY = window.scrollY;
        this.procesandoTick = false;
    }

    /**
     * Configura efectos hover mejorados
     */
    configurarEfectosHover() {
        // Solo aplicar en dispositivos no táctiles
        if (CONFIGURACION_ENTORNO.tieneTactil) return;

        this.configurarEfectosHoverBotones();
        this.configurarEfectosHoverTarjetas();
    }

    /**
     * Configura efectos hover para botones
     */
    configurarEfectosHoverBotones() {
        const botonJugar = document.querySelector(CONFIGURACION.SELECTORES.BOTON_JUGAR);
        const botonVolver = document.querySelector(CONFIGURACION.SELECTORES.BOTON_VOLVER);

        if (botonJugar) {
            this.agregarEfectoHoverBoton(botonJugar, {
                escala: 1.05,
                trasladarY: -5,
                intensidadSombra: 1.5
            });
        }

        if (botonVolver) {
            this.agregarEfectoHoverBoton(botonVolver, {
                trasladarX: -5,
                intensidadSombra: 1.2
            });
        }
    }

    /**
     * Configura efectos hover para tarjetas
     */
    configurarEfectosHoverTarjetas() {
        const tarjetasOpcion = document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_OPCION);
        const tarjetasCaracteristica = document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_CARACTERISTICA);

        tarjetasOpcion.forEach(tarjeta => {
            this.agregarEfectoHoverTarjeta(tarjeta, {
                escala: 1.02,
                trasladarY: -10,
                intensidadSombra: 2
            });
        });

        tarjetasCaracteristica.forEach(tarjeta => {
            this.agregarEfectoHoverTarjeta(tarjeta, {
                escala: 1.02,
                trasladarY: -5,
                intensidadSombra: 1.3
            });
        });
    }

    /**
     * Agrega efecto hover a un botón
     */
    agregarEfectoHoverBoton(boton, opciones = {}) {
        const {
            escala = 1,
            trasladarX = 0,
            trasladarY = 0,
            intensidadSombra = 1
        } = opciones;

        boton.addEventListener('mouseenter', () => {
            if (this.animacionesPausadas) return;

            const transformacion = `scale(${escala}) translateX(${trasladarX}px) translateY(${trasladarY}px)`;
            boton.style.transform = transformacion;
            
            if (intensidadSombra > 1) {
                const sombraActual = getComputedStyle(boton).boxShadow;
                if (sombraActual && sombraActual !== 'none') {
                    boton.style.boxShadow = this.intensificarSombra(sombraActual, intensidadSombra);
                }
            }
        });

        boton.addEventListener('mouseleave', () => {
            boton.style.transform = '';
            boton.style.boxShadow = '';
        });
    }

    /**
     * Agrega efecto hover a una tarjeta
     */
    agregarEfectoHoverTarjeta(tarjeta, opciones = {}) {
        const {
            escala = 1,
            trasladarY = 0,
            intensidadSombra = 1
        } = opciones;

        tarjeta.addEventListener('mouseenter', () => {
            if (this.animacionesPausadas) return;

            const transformacion = `scale(${escala}) translateY(${trasladarY}px)`;
            tarjeta.style.transform = transformacion;
            
            if (intensidadSombra > 1) {
                tarjeta.style.boxShadow = `0 ${Math.abs(trasladarY) + 5}px ${20 * intensidadSombra}px rgba(0, 0, 0, ${0.2 * intensidadSombra})`;
            }
        });

        tarjeta.addEventListener('mouseleave', () => {
            tarjeta.style.transform = '';
            tarjeta.style.boxShadow = '';
        });
    }

    /**
     * Intensifica una sombra existente
     */
    intensificarSombra(cadenaSombra, intensidad) {
        // Implementación básica - en producción se podría hacer más sofisticada
        return cadenaSombra.replace(/rgba?\([^)]+\)/g, (coincidencia) => {
            return coincidencia.replace(/[\d.]+\)$/, (alfa) => {
                const nuevoAlfa = Math.min(1, parseFloat(alfa) * intensidad);
                return `${nuevoAlfa})`;
            });
        });
    }

    /**
     * Maneja el scroll con efecto parallax
     */
    manejarDesplazamiento() {
        if (this.animacionesPausadas) return;

        const scrollYActual = window.scrollY;
        
        // Solo aplicar parallax en pantalla principal
        const pantallaPrincipal = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL);
        if (pantallaPrincipal && !pantallaPrincipal.classList.contains(CONFIGURACION.CLASES.DIFUMINADO)) {
            this.aplicarEfectoParallax(scrollYActual);
        }

        this.ultimoScrollY = scrollYActual;
    }

    /**
     * Aplica efecto parallax
     */
    aplicarEfectoParallax(scrollY) {
        this.elementosParallax.forEach(({ elemento, factor }) => {
            if (elemento) {
                const trasladarY = scrollY * factor;
                elemento.style.transform = `translateY(${trasladarY}px)`;
            }
        });
    }

    /**
     * Aplica efectos iniciales
     */
    aplicarEfectosIniciales() {
        if (this.animacionesPausadas) return;

        // Efecto de entrada para la pantalla principal
        const pantallaPrincipal = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL);
        if (pantallaPrincipal) {
            this.animarElementoEntrada(pantallaPrincipal, {
                duracion: CONFIGURACION.ANIMACIONES.DURACION.LENTA,
                retraso: 100
            });
        }

        // Efecto escalonado para tarjetas de características
        const tarjetasCaracteristica = document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_CARACTERISTICA);
        tarjetasCaracteristica.forEach((tarjeta, indice) => {
            this.animarElementoEntrada(tarjeta, {
                duracion: CONFIGURACION.ANIMACIONES.DURACION.NORMAL,
                retraso: 200 + (indice * 100)
            });
        });
    }

    /**
     * Anima un elemento hacia adentro
     */
    animarElementoEntrada(elemento, opciones = {}) {
        const {
            duracion = CONFIGURACION.ANIMACIONES.DURACION.NORMAL,
            retraso = 0,
            suavizado = CONFIGURACION.ANIMACIONES.SUAVIZADO.SALIDA
        } = opciones;

        // Estado inicial
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(20px)';
        elemento.style.transition = `all ${duracion}ms ${suavizado}`;

        setTimeout(() => {
            elemento.style.opacity = '1';
            elemento.style.transform = 'translateY(0)';
        }, retraso);
    }

    /**
     * Anima un elemento hacia afuera
     */
    animarElementoSalida(elemento, opciones = {}) {
        const {
            duracion = CONFIGURACION.ANIMACIONES.DURACION.NORMAL,
            suavizado = CONFIGURACION.ANIMACIONES.SUAVIZADO.ENTRADA
        } = opciones;

        elemento.style.transition = `all ${duracion}ms ${suavizado}`;
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(-20px)';

        return new Promise(resolve => {
            setTimeout(resolve, duracion);
        });
    }

    /**
     * Maneja cambios de pantalla
     */
    alCambiarPantalla(desdePantalla, aPantalla) {
        console.log(`Transición de efectos: ${desdePantalla} → ${aPantalla}`);

        // Limpiar efectos de parallax cuando no estamos en main
        if (aPantalla !== 'principal') {
            this.limpiarEfectosParallax();
        }

        // Aplicar efectos específicos según la transición
        this.aplicarEfectosTransicion(desdePantalla, aPantalla);
    }

    /**
     * Aplica efectos específicos de transición
     */
    aplicarEfectosTransicion(desdePantalla, aPantalla) {
        if (this.animacionesPausadas) return;

        switch (`${desdePantalla}-${aPantalla}`) {
            case 'principal-opciones':
                this.aplicarTransicionPrincipalAOpciones();
                break;
            case 'opciones-principal':
                this.aplicarTransicionOpcionesAPrincipal();
                break;
        }
    }

    /**
     * Efectos de transición de principal a opciones
     */
    aplicarTransicionPrincipalAOpciones() {
        // Efecto de blur progresivo
        const pantallaPrincipal = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL);
        if (pantallaPrincipal) {
            pantallaPrincipal.style.transition = `filter ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ease`;
        }
    }

    /**
     * Efectos de transición de opciones a principal
     */
    aplicarTransicionOpcionesAPrincipal() {
        // Restaurar efectos de la pantalla principal
        const pantallaPrincipal = document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL);
        if (pantallaPrincipal) {
            pantallaPrincipal.style.transition = `filter ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ease`;
        }
    }

    /**
     * Limpia efectos de parallax
     */
    limpiarEfectosParallax() {
        this.elementosParallax.forEach(({ elemento }) => {
            if (elemento) {
                elemento.style.transform = '';
            }
        });
    }

    /**
     * Pausa todas las animaciones
     */
    pausarAnimaciones() {
        this.animacionesPausadas = true;
        
        // Cancelar frame de animación activo
        if (this.idFrameAnimacion) {
            cancelAnimationFrame(this.idFrameAnimacion);
            this.idFrameAnimacion = null;
        }

        console.log('Animaciones pausadas');
    }

    /**
     * Reanuda las animaciones
     */
    reanudarAnimaciones() {
        if (CONFIGURACION_ENTORNO.prefiereMovimientoReducido) return;
        
        this.animacionesPausadas = false;
        console.log('Animaciones reanudadas');
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    manejarRedimensionamiento() {
        // Recalcular elementos de parallax si es necesario
        this.configurarElementosParallax();
        
        // Ajustar efectos según el nuevo tamaño
        if (window.innerWidth < CONFIGURACION.PUNTOS_RUPTURA.MD) {
            this.pausarAnimaciones();
        } else if (!CONFIGURACION_ENTORNO.prefiereMovimientoReducido) {
            this.reanudarAnimaciones();
        }
    }

    /**
     * Crea una animación personalizada
     */
    crearAnimacionPersonalizada(elemento, fotogramasClaves, opciones = {}) {
        if (this.animacionesPausadas) return Promise.resolve();

        const {
            duracion = CONFIGURACION.ANIMACIONES.DURACION.NORMAL,
            suavizado = CONFIGURACION.ANIMACIONES.SUAVIZADO.SUAVE,
            relleno = 'forwards'
        } = opciones;

        if (elemento.animate) {
            const animacion = elemento.animate(fotogramasClaves, {
                duration: duracion,
                easing: suavizado,
                fill: relleno
            });

            this.animacionesActivas.add(animacion);
            
            animacion.addEventListener('finish', () => {
                this.animacionesActivas.delete(animacion);
            });

            return animacion.finished;
        } else {
            // Fallback para navegadores sin soporte de Web Animations API
            return this.animacionFallback(elemento, fotogramasClaves, opciones);
        }
    }

    /**
     * Fallback para animaciones sin Web Animations API
     */
    animacionFallback(elemento, fotogramasClaves, opciones) {
        return new Promise(resolve => {
            const { duracion = CONFIGURACION.ANIMACIONES.DURACION.NORMAL } = opciones;
            
            // Aplicar el último fotograma clave
            const fotogramaFinal = fotogramasClaves[fotogramasClaves.length - 1];
            Object.assign(elemento.style, fotogramaFinal);
            
            setTimeout(resolve, duracion);
        });
    }

    /**
     * Obtiene información del estado de efectos
     */
    obtenerEstadoEfectos() {
        return {
            animacionesPausadas: this.animacionesPausadas,
            conteoAnimacionesActivas: this.animacionesActivas.size,
            conteoElementosParallax: this.elementosParallax.length,
            movimientoReducidoPreferido: CONFIGURACION_ENTORNO.prefiereMovimientoReducido
        };
    }

    /**
     * Limpia recursos del Gestor de Efectos
     */
    destruir() {
        // Cancelar animaciones activas
        this.animacionesActivas.forEach(animacion => {
            animacion.cancel();
        });
        this.animacionesActivas.clear();

        // Cancelar frame de animación
        if (this.idFrameAnimacion) {
            cancelAnimationFrame(this.idFrameAnimacion);
        }

        // Limpiar efectos de parallax
        this.limpiarEfectosParallax();

        // Resetear elementos
        this.elementosParallax = [];
        this.animacionesPausadas = false;

        console.log('Gestor de Efectos limpiado');
    }
}