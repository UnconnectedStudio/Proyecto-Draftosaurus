/**
 * INTEGRADOR TABLERO INTERACTIVO
 * Facilita la integración del renderizador tablero interactivo con el resto del sistema
 * Proporciona una API simplificada para usar el tablero con drag & drop
 */

import { RenderizadorTableroInteractivo } from './renderizador-tablero-interactivo.js';

export class IntegradorTableroInteractivo {
    constructor() {
        this.renderizador = null;
        this.contenedor = null;
        this.dinosauriosDisponibles = [];
        this.callbacks = {
            onDinosaurioColocado: null,
            onError: null,
            onEstadoCambiado: null
        };
        
        console.log('🔗 Integrador Tablero Interactivo inicializado');
    }

    /**
     * Inicializa el tablero interactivo en un contenedor específico
     */
    async inicializar(contenedorId, opciones = {}) {
        try {
            console.log('🚀 Iniciando integración del tablero interactivo...');
            
            // Buscar contenedor
            this.contenedor = document.getElementById(contenedorId);
            if (!this.contenedor) {
                throw new Error(`Contenedor '${contenedorId}' no encontrado`);
            }
            
            // Crear renderizador
            this.renderizador = new RenderizadorTableroInteractivo(this.contenedor);
            
            // Configurar opciones
            if (opciones.callbacks) {
                this.callbacks = { ...this.callbacks, ...opciones.callbacks };
            }
            
            // Inicializar renderizador
            await this.renderizador.inicializar();
            
            // Configurar eventos personalizados
            this.configurarEventosPersonalizados();
            
            console.log('✅ Tablero interactivo integrado exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error integrando tablero interactivo:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            throw error;
        }
    }

    /**
     * Configura eventos personalizados para la integración
     */
    configurarEventosPersonalizados() {
        // Sobrescribir el método de colocación para añadir callbacks
        const colocarOriginal = this.renderizador.colocarDinosaurio.bind(this.renderizador);
        
        this.renderizador.colocarDinosaurio = (zonaId, dinosaurio) => {
            const resultado = colocarOriginal(zonaId, dinosaurio);
            
            if (resultado && this.callbacks.onDinosaurioColocado) {
                this.callbacks.onDinosaurioColocado({
                    zonaId,
                    dinosaurio,
                    estadoTablero: this.renderizador.obtenerEstado()
                });
            }
            
            if (this.callbacks.onEstadoCambiado) {
                this.callbacks.onEstadoCambiado(this.renderizador.obtenerEstado());
            }
            
            return resultado;
        };
    }

    /**
     * Carga dinosaurios disponibles para el drag & drop
     */
    cargarDinosaurios(dinosaurios) {
        this.dinosauriosDisponibles = dinosaurios;
        console.log('🦕 Dinosaurios cargados:', dinosaurios.length);
        
        // Crear interfaz de selección de dinosaurios
        this.crearInterfazSeleccion();
    }

    /**
     * Crea una interfaz simple para seleccionar dinosaurios
     */
    crearInterfazSeleccion() {
        if (!this.contenedor || this.dinosauriosDisponibles.length === 0) return;
        
        // Buscar o crear panel de selección
        let panelSeleccion = document.getElementById('panel-seleccion-dinosaurios');
        if (!panelSeleccion) {
            panelSeleccion = document.createElement('div');
            panelSeleccion.id = 'panel-seleccion-dinosaurios';
            panelSeleccion.className = 'panel-seleccion-dinosaurios';
            this.contenedor.appendChild(panelSeleccion);
        }
        
        panelSeleccion.innerHTML = `
            <div class="seleccion-header">
                <h3>🦕 Seleccionar Dinosaurio</h3>
            </div>
            <div class="seleccion-content">
                ${this.dinosauriosDisponibles.map(dino => `
                    <button 
                        class="btn-dinosaurio" 
                        data-dino-id="${dino.id}"
                        style="
                            background: ${dino.color || '#ff6b6b'};
                            color: white;
                            border: none;
                            padding: 10px 15px;
                            margin: 5px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                        "
                    >
                        ${dino.tipo} ${dino.emoji || '🦕'}
                    </button>
                `).join('')}
                <button 
                    id="btn-limpiar-tablero"
                    style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        margin: 5px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    "
                >
                    🧹 Limpiar Tablero
                </button>
                <button 
                    id="btn-debug-tablero"
                    style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        margin: 5px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    "
                >
                    🔍 Debug
                </button>
            </div>
        `;
        
        // Configurar eventos de los botones
        this.configurarEventosBotones();
    }

    /**
     * Configura los eventos de los botones de selección
     */
    configurarEventosBotones() {
        // Botones de dinosaurios
        document.querySelectorAll('.btn-dinosaurio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dinoId = e.target.dataset.dinoId;
                const dinosaurio = this.dinosauriosDisponibles.find(d => d.id === dinoId);
                
                if (dinosaurio) {
                    this.seleccionarDinosaurio(dinosaurio);
                    
                    // Resaltar botón seleccionado
                    document.querySelectorAll('.btn-dinosaurio').forEach(b => {
                        b.style.opacity = '0.6';
                        b.style.transform = 'scale(1)';
                    });
                    
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scale(1.1)';
                }
            });
        });
        
        // Botón limpiar tablero
        const btnLimpiar = document.getElementById('btn-limpiar-tablero');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                this.limpiarTablero();
            });
        }
        
        // Botón debug
        const btnDebug = document.getElementById('btn-debug-tablero');
        if (btnDebug) {
            btnDebug.addEventListener('click', () => {
                this.debug();
            });
        }
    }

    /**
     * Selecciona un dinosaurio para drag & drop
     */
    seleccionarDinosaurio(dinosaurio) {
        if (this.renderizador) {
            this.renderizador.seleccionarDinosaurio(dinosaurio);
            console.log('🎯 Dinosaurio seleccionado para drag & drop:', dinosaurio.tipo);
        }
    }

    /**
     * Limpia todos los dinosaurios del tablero
     */
    limpiarTablero() {
        if (this.renderizador) {
            this.renderizador.limpiarTablero();
            
            // Resetear selección de botones
            document.querySelectorAll('.btn-dinosaurio').forEach(btn => {
                btn.style.opacity = '0.6';
                btn.style.transform = 'scale(1)';
            });
            
            console.log('🧹 Tablero limpiado desde integrador');
        }
    }

    /**
     * Obtiene el estado actual del tablero
     */
    obtenerEstado() {
        return this.renderizador ? this.renderizador.obtenerEstado() : null;
    }

    /**
     * Obtiene estadísticas del tablero
     */
    obtenerEstadisticas() {
        return this.renderizador ? this.renderizador.obtenerEstadisticas() : null;
    }

    /**
     * Configura callbacks para eventos del tablero
     */
    configurarCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Crea dinosaurios de ejemplo para testing
     */
    crearDinosauriosEjemplo() {
        const dinosauriosEjemplo = [
            {
                id: 'trex-1',
                tipo: 'T-Rex',
                color: '#ff6b6b',
                emoji: '🦖'
            },
            {
                id: 'tricera-1',
                tipo: 'Triceratops',
                color: '#4ecdc4',
                emoji: '🦕'
            },
            {
                id: 'veloci-1',
                tipo: 'Velociraptor',
                color: '#45b7d1',
                emoji: '🦖'
            },
            {
                id: 'bronto-1',
                tipo: 'Brontosaurus',
                color: '#96ceb4',
                emoji: '🦕'
            },
            {
                id: 'stego-1',
                tipo: 'Stegosaurus',
                color: '#feca57',
                emoji: '🦕'
            }
        ];
        
        this.cargarDinosaurios(dinosauriosEjemplo);
        return dinosauriosEjemplo;
    }

    /**
     * Método de debugging
     */
    debug() {
        console.log('🔍 DEBUG - Integrador Tablero Interactivo:');
        console.log('📊 Estado del renderizador:', this.obtenerEstado());
        console.log('🦕 Dinosaurios disponibles:', this.dinosauriosDisponibles);
        console.log('📞 Callbacks configurados:', Object.keys(this.callbacks).filter(k => this.callbacks[k] !== null));
        
        if (this.renderizador) {
            this.renderizador.debug();
        }
    }

    /**
     * Destruye la instancia y limpia eventos
     */
    destruir() {
        if (this.renderizador) {
            this.renderizador.detenerTrackingCursor();
        }
        
        // Limpiar contenedor
        if (this.contenedor) {
            this.contenedor.innerHTML = '';
        }
        
        console.log('🗑️ Integrador tablero interactivo destruido');
    }
}

// Función de utilidad para inicialización rápida
export async function inicializarTableroInteractivo(contenedorId, opciones = {}) {
    const integrador = new IntegradorTableroInteractivo();
    
    try {
        await integrador.inicializar(contenedorId, opciones);
        
        // Crear dinosaurios de ejemplo si no se proporcionaron
        if (!opciones.dinosaurios) {
            integrador.crearDinosauriosEjemplo();
        } else {
            integrador.cargarDinosaurios(opciones.dinosaurios);
        }
        
        return integrador;
        
    } catch (error) {
        console.error('❌ Error en inicialización rápida:', error);
        throw error;
    }
}