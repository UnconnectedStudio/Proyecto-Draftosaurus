/**
 * GESTOR UI
 * Gestiona la interfaz de usuario, elementos DOM y componentes visuales
 */

import { CONFIGURACION } from '../config/configuracion-app.js';

export class GestorUI {
    constructor() {
        this.elementos = {};
        this.gestores = {};
        this.estaInicializado = false;
    }

    /**
     * Inicializa el Gestor UI
     */
    async inicializar() {
        try {
            this.cachearElementos();
            this.configurarEstadoInicial();
            this.estaInicializado = true;
            console.log('🎨 Gestor UI inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Gestor UI:', error);
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
     * Cachea elementos DOM importantes
     */
    cachearElementos() {
        this.elementos = {
            pantallaPrincipal: document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_PRINCIPAL),
            pantallaOpciones: document.querySelector(CONFIGURACION.SELECTORES.PANTALLA_OPCIONES),
            botonJugar: document.querySelector(CONFIGURACION.SELECTORES.BOTON_JUGAR),
            botonVolver: document.querySelector(CONFIGURACION.SELECTORES.BOTON_VOLVER),
            tarjetasOpcion: document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_OPCION),
            tarjetasCaracteristica: document.querySelectorAll(CONFIGURACION.SELECTORES.TARJETAS_CARACTERISTICA),
            contenedorToast: document.querySelector(CONFIGURACION.SELECTORES.CONTENEDOR_TOAST),
            textoVersion: document.querySelector(CONFIGURACION.SELECTORES.TEXTO_VERSION)
        };

        // Verificar elementos críticos
        this.validarElementosCriticos();
    }

    /**
     * Valida que los elementos críticos existan
     */
    validarElementosCriticos() {
        const elementosCriticos = ['pantallaPrincipal', 'pantallaOpciones', 'botonJugar'];
        const elementosFaltantes = elementosCriticos.filter(clave => !this.elementos[clave]);
        
        if (elementosFaltantes.length > 0) {
            throw new Error(`Elementos críticos no encontrados: ${elementosFaltantes.join(', ')}`);
        }
    }

    /**
     * Configura el estado inicial de la UI
     */
    configurarEstadoInicial() {
        // Asegurar que la pantalla de opciones esté oculta
        this.ocultarPantallaOpciones();
        
        // Configurar estado inicial de tarjetas
        this.reiniciarTarjetasOpcion();
        
        // Aplicar efectos iniciales a las tarjetas de características
        this.configurarTarjetasCaracteristica();
    }

    /**
     * Muestra la pantalla de opciones con animación
     */
    mostrarPantallaOpciones() {
        if (!this.elementos.pantallaOpciones) return;

        // Aplicar difuminado a la pantalla principal
        this.elementos.pantallaPrincipal?.classList.add(CONFIGURACION.CLASES.DIFUMINADO);
        
        // Animar la pantalla principal hacia afuera
        this.animarPantallaPrincipalSalida();
        
        // Mostrar pantalla de opciones después de un delay
        setTimeout(() => {
            this.elementos.pantallaOpciones.classList.remove(CONFIGURACION.CLASES.OCULTO);
            this.animarTarjetasOpcionEntrada();
        }, CONFIGURACION.ANIMACIONES.DURACION.NORMAL);
    }

    /**
     * Oculta la pantalla de opciones con animación
     */
    ocultarPantallaOpciones() {
        if (!this.elementos.pantallaOpciones) return;

        // Animar tarjetas de opciones hacia afuera
        this.animarTarjetasOpcionSalida();
        
        // Ocultar pantalla de opciones
        setTimeout(() => {
            this.elementos.pantallaOpciones.classList.add(CONFIGURACION.CLASES.OCULTO);
        }, CONFIGURACION.ANIMACIONES.DURACION.NORMAL);
        
        // Restaurar pantalla principal
        setTimeout(() => {
            this.animarPantallaPrincipalEntrada();
            this.elementos.pantallaPrincipal?.classList.remove(CONFIGURACION.CLASES.DIFUMINADO);
        }, CONFIGURACION.ANIMACIONES.DURACION.NORMAL);
    }

    /**
     * Anima la pantalla principal hacia afuera
     */
    animarPantallaPrincipalSalida() {
        if (!this.elementos.pantallaPrincipal) return;

        this.elementos.pantallaPrincipal.style.transition = `all ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ${CONFIGURACION.ANIMACIONES.SUAVIZADO.SUAVE}`;
        this.elementos.pantallaPrincipal.style.opacity = '0.3';
        this.elementos.pantallaPrincipal.style.transform = 'translateY(-50px)';
        
        // Ocultar botón de jugar
        if (this.elementos.botonJugar) {
            this.elementos.botonJugar.style.transition = `all ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ${CONFIGURACION.ANIMACIONES.SUAVIZADO.SUAVE}`;
            this.elementos.botonJugar.style.opacity = '0';
            this.elementos.botonJugar.style.visibility = 'hidden';
            this.elementos.botonJugar.classList.add(CONFIGURACION.CLASES.DESHABILITADO);
        }
        
        // Ocultar texto de versión
        if (this.elementos.textoVersion) {
            this.elementos.textoVersion.style.transition = `all ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ${CONFIGURACION.ANIMACIONES.SUAVIZADO.SUAVE}`;
            this.elementos.textoVersion.style.opacity = '0';
        }
    }

    /**
     * Anima la pantalla principal hacia adentro
     */
    animarPantallaPrincipalEntrada() {
        if (!this.elementos.pantallaPrincipal) return;

        setTimeout(() => {
            this.elementos.pantallaPrincipal.style.opacity = '1';
            this.elementos.pantallaPrincipal.style.transform = 'translateY(0)';
            
            // Mostrar botón de jugar
            if (this.elementos.botonJugar) {
                this.elementos.botonJugar.classList.remove(CONFIGURACION.CLASES.DESHABILITADO);
                this.elementos.botonJugar.style.opacity = '1';
                this.elementos.botonJugar.style.visibility = 'visible';
            }
            
            // Mostrar texto de versión
            if (this.elementos.textoVersion) {
                this.elementos.textoVersion.style.opacity = '1';
            }
        }, 50);
    }

    /**
     * Anima las tarjetas de opciones hacia adentro
     */
    animarTarjetasOpcionEntrada() {
        this.elementos.tarjetasOpcion.forEach((tarjeta, indice) => {
            // Estado inicial
            tarjeta.style.transform = 'translateY(30px)';
            tarjeta.style.opacity = '0';
            
            // Animar con delay escalonado
            setTimeout(() => {
                tarjeta.style.transition = `all ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ${CONFIGURACION.ANIMACIONES.SUAVIZADO.SALIDA}`;
                tarjeta.style.transform = 'translateY(0px)';
                tarjeta.style.opacity = '1';
            }, indice * CONFIGURACION.EFECTOS.RETRASO_ANIMACION_TARJETA);
        });
    }

    /**
     * Anima las tarjetas de opciones hacia afuera
     */
    animarTarjetasOpcionSalida() {
        this.elementos.tarjetasOpcion.forEach((tarjeta, indice) => {
            setTimeout(() => {
                tarjeta.style.transition = `all ${CONFIGURACION.ANIMACIONES.DURACION.RAPIDA}ms ${CONFIGURACION.ANIMACIONES.SUAVIZADO.ENTRADA}`;
                tarjeta.style.transform = 'translateY(50px)';
                tarjeta.style.opacity = '0';
            }, indice * 50);
        });
    }

    /**
     * Configura efectos para las tarjetas de características
     */
    configurarTarjetasCaracteristica() {
        this.elementos.tarjetasCaracteristica.forEach(tarjeta => {
            // Configurar estado inicial para animaciones
            tarjeta.style.transition = `all ${CONFIGURACION.ANIMACIONES.DURACION.NORMAL}ms ${CONFIGURACION.ANIMACIONES.SUAVIZADO.SUAVE}`;
            
            // Efectos hover mejorados
            tarjeta.addEventListener('mouseenter', () => {
                if (!CONFIGURACION.entorno?.tieneTactil) {
                    tarjeta.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    tarjeta.style.transform = 'translateY(-5px) scale(1.02)';
                    tarjeta.style.borderColor = CONFIGURACION.COLORES?.SECUNDARIO || '#f4d03f';
                }
            });
            
            tarjeta.addEventListener('mouseleave', () => {
                if (!CONFIGURACION.entorno?.tieneTactil) {
                    tarjeta.style.boxShadow = '';
                    tarjeta.style.transform = 'translateY(0) scale(1)';
                    tarjeta.style.borderColor = CONFIGURACION.COLORES?.PRIMARIO || '#dcaa68';
                }
            });
        });
    }

    /**
     * Resetea el estado de las tarjetas de opciones
     */
    reiniciarTarjetasOpcion() {
        this.elementos.tarjetasOpcion.forEach(tarjeta => {
            tarjeta.classList.remove(CONFIGURACION.CLASES.SELECCIONADO);
            tarjeta.style.border = '';
            tarjeta.style.backgroundColor = '';
            tarjeta.style.transform = '';
            tarjeta.style.opacity = '';
            tarjeta.style.pointerEvents = '';
            
            // Remover spinners de carga si existen
            const spinner = tarjeta.querySelector('.spinner-carga');
            if (spinner) {
                spinner.remove();
            }
        });
    }

    /**
     * Marca una tarjeta de opción como seleccionada
     */
    seleccionarTarjetaOpcion(indiceTarjeta) {
        const tarjeta = this.elementos.tarjetasOpcion[indiceTarjeta];
        if (!tarjeta) return;

        // Marcar como seleccionada
        tarjeta.classList.add(CONFIGURACION.CLASES.SELECCIONADO);
        tarjeta.style.border = `3px solid ${CONFIGURACION.COLORES?.EXITO || '#28a745'}`;
        tarjeta.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
        tarjeta.style.transform = 'scale(1.05)';
        
        // Agregar spinner de carga
        this.agregarSpinnerCarga(tarjeta);
        
        // Desactivar otras tarjetas
        this.elementos.tarjetasOpcion.forEach((otraTarjeta, indice) => {
            if (indice !== indiceTarjeta) {
                otraTarjeta.style.opacity = '0.5';
                otraTarjeta.style.pointerEvents = 'none';
            }
        });
    }

    /**
     * Agrega un spinner de carga a una tarjeta
     */
    agregarSpinnerCarga(tarjeta) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-light spinner-carga';
        spinner.setAttribute('role', 'status');
        spinner.innerHTML = '<span class="visually-hidden">Cargando...</span>';
        
        // Posicionar el spinner
        spinner.style.position = 'absolute';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';
        spinner.style.zIndex = '1000';
        
        tarjeta.style.position = 'relative';
        tarjeta.appendChild(spinner);
    }

    /**
     * Muestra un mensaje toast
     */
    mostrarToast(mensaje, tipo = CONFIGURACION.TOAST.TIPOS.INFO) {
        // Crear contenedor si no existe
        if (!this.elementos.contenedorToast) {
            this.crearContenedorToast();
        }
        
        const toast = this.crearElementoToast(mensaje, tipo);
        this.elementos.contenedorToast.appendChild(toast);
        
        // Mostrar toast usando Bootstrap
        if (typeof bootstrap !== 'undefined') {
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            // Limpiar después de que se oculte
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        } else {
            // Fallback sin Bootstrap
            this.mostrarToastFallback(toast);
        }
    }

    /**
     * Crea el contenedor de toasts si no existe
     */
    crearContenedorToast() {
        const contenedor = document.createElement('div');
        contenedor.id = 'toast-container';
        contenedor.className = 'toast-container position-fixed top-0 end-0 p-3';
        contenedor.style.zIndex = '1100';
        document.body.appendChild(contenedor);
        this.elementos.contenedorToast = contenedor;
    }

    /**
     * Crea un elemento toast
     */
    crearElementoToast(mensaje, tipo) {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${tipo} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        return toast;
    }

    /**
     * Fallback para mostrar toast sin Bootstrap
     */
    mostrarToastFallback(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, CONFIGURACION.TOAST.DURACION);
    }

    /**
     * Muestra un mensaje de error
     */
    mostrarMensajeError(mensaje) {
        this.mostrarToast(mensaje, CONFIGURACION.TOAST.TIPOS.ERROR);
    }

    /**
     * Muestra un mensaje de éxito
     */
    mostrarMensajeExito(mensaje) {
        this.mostrarToast(mensaje, CONFIGURACION.TOAST.TIPOS.EXITO);
    }

    /**
     * Muestra un mensaje informativo
     */
    mostrarMensajeInfo(mensaje) {
        this.mostrarToast(mensaje, CONFIGURACION.TOAST.TIPOS.INFO);
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    manejarRedimensionamiento() {
        // Recalcular posiciones si es necesario
        // Implementar lógica específica de responsive si se requiere
    }

    /**
     * Obtiene información del estado actual de la UI
     */
    obtenerEstado() {
        return {
            pantallaPrincipalVisible: !this.elementos.pantallaPrincipal?.classList.contains(CONFIGURACION.CLASES.DIFUMINADO),
            pantallaOpcionesVisible: !this.elementos.pantallaOpciones?.classList.contains(CONFIGURACION.CLASES.OCULTO),
            tarjetaSeleccionada: Array.from(this.elementos.tarjetasOpcion).findIndex(tarjeta => 
                tarjeta.classList.contains(CONFIGURACION.CLASES.SELECCIONADO)
            )
        };
    }

    /**
     * Limpia recursos del Gestor UI
     */
    destruir() {
        // Limpiar estilos inline aplicados
        Object.values(this.elementos).forEach(elemento => {
            if (elemento && elemento.style) {
                elemento.style.cssText = '';
            }
        });
        
        // Resetear clases
        this.elementos.pantallaPrincipal?.classList.remove(CONFIGURACION.CLASES.DIFUMINADO);
        this.elementos.pantallaOpciones?.classList.add(CONFIGURACION.CLASES.OCULTO);
        this.reiniciarTarjetasOpcion();
        
        console.log('🧹 Gestor UI limpiado');
    }
}