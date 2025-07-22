/**
 * GESTOR DE TABLERO
 * Maneja la visualización y lógica del tablero de juego de Draftosaurus
 */

export class GestorTablero {
    constructor() {
        this.recintos = new Map();
        this.colocaciones = new Map();
        this.tableroElement = null;
        this.configuracionRecintos = [
            {
                id: 1,
                nombre: 'Bosque de lo Mismo',
                regla: 'BOSQUE_MISMO',
                maxDinos: 4,
                posicion: { x: 10, y: 20 },
                zona: 'bosque',
                icono: '🌲',
                color: '#2d5016'
            },
            {
                id: 2,
                nombre: 'Pradera de lo Diferente',
                regla: 'PRADERA_DIFERENTE',
                maxDinos: 4,
                posicion: { x: 70, y: 20 },
                zona: 'pradera',
                icono: '🌿',
                color: '#4a7c59'
            },
            {
                id: 3,
                nombre: 'Pradera de Parejas',
                regla: 'PRADERA_PAREJAS',
                maxDinos: 6,
                posicion: { x: 70, y: 60 },
                zona: 'pradera',
                icono: '👥',
                color: '#059669'
            },
            {
                id: 4,
                nombre: 'Trío Arbóreo',
                regla: 'TRIO_ARBOREO',
                maxDinos: 3,
                posicion: { x: 10, y: 60 },
                zona: 'bosque',
                icono: '🌳',
                color: '#166534'
            },
            {
                id: 5,
                nombre: 'Rey de la Selva',
                regla: 'REY_SELVA',
                maxDinos: 1,
                posicion: { x: 10, y: 80 },
                zona: 'bosque',
                icono: '👑',
                color: '#fbbf24'
            },
            {
                id: 6,
                nombre: 'Isla Solitaria',
                regla: 'ISLA_SOLITARIA',
                maxDinos: 1,
                posicion: { x: 70, y: 80 },
                zona: 'pradera',
                icono: '🏝️',
                color: '#0ea5e9'
            },
            {
                id: 7,
                nombre: 'El Río',
                regla: 'RIO',
                maxDinos: 99,
                posicion: { x: 40, y: 50 },
                zona: 'rio',
                icono: '🌊',
                color: '#0284c7'
            }
        ];
    }

    /**
     * Inicializa el gestor del tablero
     */
    inicializar() {
        this.crearTableroVisual();
        this.configurarEventos();
        this.inicializarRecintos();
        console.log('🗺️ Gestor de Tablero inicializado');
    }

    /**
     * Crea la visualización del tablero
     */
    crearTableroVisual() {
        // Buscar contenedor existente o crear uno nuevo
        let contenedor = document.querySelector('.tablero-container');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.className = 'tablero-container';
            
            // Insertar en el área principal del juego
            const main = document.querySelector('main') || document.querySelector('.tablero-juego');
            if (main) {
                main.insertBefore(contenedor, main.firstChild);
            }
        }

        contenedor.innerHTML = `
            <div class="tablero-visual" id="tablero-visual">
                <div class="tablero-fondo">
                    <div class="zona-bosque">
                        <div class="zona-titulo">🌲 Bosque</div>
                    </div>
                    <div class="zona-rio">
                        <div class="rio-visual">
                            <div class="rio-flujo"></div>
                            <div class="zona-titulo">🌊 Río</div>
                        </div>
                    </div>
                    <div class="zona-pradera">
                        <div class="zona-titulo">🌿 Pradera</div>
                    </div>
                </div>
                <div class="recintos-overlay" id="recintos-overlay">
                    <!-- Los recintos se generarán aquí -->
                </div>
                <div class="elementos-decorativos">
                    <div class="elemento-decorativo arbol" style="top: 15%; left: 5%;">🌳</div>
                    <div class="elemento-decorativo arbol" style="top: 25%; left: 15%;">🌲</div>
                    <div class="elemento-decorativo flor" style="top: 30%; right: 10%;">🌸</div>
                    <div class="elemento-decorativo flor" style="top: 70%; right: 5%;">🌺</div>
                    <div class="elemento-decorativo roca" style="bottom: 20%; left: 45%;">🪨</div>
                </div>
            </div>
            <div class="tablero-controles">
                <button class="tablero-boton" id="centrar-tablero">🎯 Centrar Vista</button>
                <button class="tablero-boton" id="zoom-in">🔍 Acercar</button>
                <button class="tablero-boton" id="zoom-out">🔍 Alejar</button>
                <button class="tablero-boton" id="vista-completa">📋 Vista Completa</button>
            </div>
        `;

        this.tableroElement = document.getElementById('tablero-visual');
        this.recintosOverlay = document.getElementById('recintos-overlay');
    }

    /**
     * Inicializa los recintos en el tablero
     */
    inicializarRecintos() {
        this.configuracionRecintos.forEach(config => {
            this.crearRecintoVisual(config);
            this.recintos.set(config.id, {
                ...config,
                dinosaurios: [],
                ocupacion: 0
            });
        });
    }

    /**
     * Crea la visualización de un recinto
     */
    crearRecintoVisual(config) {
        const recintoElement = document.createElement('div');
        recintoElement.className = `recinto recinto-${config.regla.toLowerCase()}`;
        recintoElement.dataset.recintoId = config.id;
        recintoElement.dataset.regla = config.regla;
        recintoElement.style.left = `${config.posicion.x}%`;
        recintoElement.style.top = `${config.posicion.y}%`;

        recintoElement.innerHTML = `
            <div class="recinto-header">
                <div class="recinto-icono">${config.icono}</div>
                <div class="recinto-nombre">${config.nombre}</div>
                <div class="recinto-capacidad">
                    <span class="ocupacion-actual">0</span>/<span class="capacidad-maxima">${config.maxDinos === 99 ? '∞' : config.maxDinos}</span>
                </div>
            </div>
            <div class="recinto-contenido">
                <div class="slots-dinosaurios" data-max-slots="${config.maxDinos}">
                    ${this.generarSlotsDinosaurios(config.maxDinos)}
                </div>
                <div class="recinto-regla">
                    ${this.obtenerDescripcionRegla(config.regla)}
                </div>
            </div>
            <div class="recinto-acciones">
                <button class="boton-colocar" data-recinto-id="${config.id}">
                    Colocar Aquí
                </button>
            </div>
        `;

        this.recintosOverlay.appendChild(recintoElement);
    }

    /**
     * Genera los slots para dinosaurios en un recinto
     */
    generarSlotsDinosaurios(maxDinos) {
        if (maxDinos === 99) {
            // Para el río, mostrar solo algunos slots visibles
            maxDinos = 6;
        }

        let slots = '';
        for (let i = 0; i < Math.min(maxDinos, 6); i++) {
            slots += `
                <div class="slot-dinosaurio" data-slot="${i + 1}">
                    <div class="slot-vacio">+</div>
                </div>
            `;
        }
        return slots;
    }

    /**
     * Obtiene la descripción de una regla
     */
    obtenerDescripcionRegla(regla) {
        const descripciones = {
            'BOSQUE_MISMO': 'Una sola especie: 1→1, 2→3, 3→6, 4→10 pts',
            'PRADERA_DIFERENTE': 'Especies diferentes: 1→1, 2→3, 3→6, 4→10 pts',
            'PRADERA_PAREJAS': 'Parejas idénticas: +5 pts por pareja',
            'TRIO_ARBOREO': 'Solo 3 espacios: 7 pts si está lleno',
            'REY_SELVA': '1 dinosaurio: 7 pts si tienes mayoría',
            'ISLA_SOLITARIA': '1 dinosaurio: 7 pts si es único',
            'RIO': 'Sin restricciones: +1 pt por dinosaurio'
        };
        return descripciones[regla] || 'Regla desconocida';
    }

    /**
     * Configura eventos del tablero
     */
    configurarEventos() {
        // Eventos de los botones de control
        document.getElementById('centrar-tablero')?.addEventListener('click', () => {
            this.centrarVista();
        });

        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.cambiarZoom(1.2);
        });

        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.cambiarZoom(0.8);
        });

        document.getElementById('vista-completa')?.addEventListener('click', () => {
            this.vistaCompleta();
        });

        // Eventos de colocación
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('boton-colocar')) {
                const recintoId = parseInt(e.target.dataset.recintoId);
                this.seleccionarRecinto(recintoId);
            }
        });

        // Eventos de hover para mostrar información
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('recinto')) {
                this.mostrarInfoRecinto(e.target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('recinto')) {
                this.ocultarInfoRecinto(e.target);
            }
        }, true);
    }

    /**
     * Coloca un dinosaurio en un recinto
     */
    colocarDinosaurio(recintoId, dinosaurio) {
        const recinto = this.recintos.get(recintoId);
        if (!recinto) {
            console.error('Recinto no encontrado:', recintoId);
            return false;
        }

        // Verificar capacidad
        if (recinto.ocupacion >= recinto.maxDinos && recinto.maxDinos !== 99) {
            console.warn('Recinto lleno:', recinto.nombre);
            return false;
        }

        // Verificar reglas específicas
        if (!this.validarReglaColocacion(recinto, dinosaurio)) {
            console.warn('Colocación no válida según reglas del recinto');
            return false;
        }

        // Realizar colocación
        recinto.dinosaurios.push(dinosaurio);
        recinto.ocupacion++;

        // Actualizar visualización
        this.actualizarVisualizacionRecinto(recintoId);

        // Disparar evento
        document.dispatchEvent(new CustomEvent('dinosaurioColocado', {
            detail: { recintoId, dinosaurio, recinto }
        }));

        console.log(`🦕 Dinosaurio ${dinosaurio.nombre} colocado en ${recinto.nombre}`);
        return true;
    }

    /**
     * Valida si se puede colocar un dinosaurio según las reglas del recinto
     */
    validarReglaColocacion(recinto, dinosaurio) {
        switch (recinto.regla) {
            case 'BOSQUE_MISMO':
                // Solo una especie
                if (recinto.dinosaurios.length > 0) {
                    const primeraFamilia = recinto.dinosaurios[0].familia;
                    return dinosaurio.familia === primeraFamilia;
                }
                return true;

            case 'PRADERA_DIFERENTE':
                // Solo especies diferentes
                return !recinto.dinosaurios.some(d => d.familia === dinosaurio.familia);

            case 'REY_SELVA':
            case 'ISLA_SOLITARIA':
                // Solo 1 dinosaurio
                return recinto.dinosaurios.length === 0;

            case 'TRIO_ARBOREO':
                // Máximo 3
                return recinto.dinosaurios.length < 3;

            case 'PRADERA_PAREJAS':
            case 'RIO':
            default:
                // Sin restricciones especiales
                return true;
        }
    }

    /**
     * Actualiza la visualización de un recinto
     */
    actualizarVisualizacionRecinto(recintoId) {
        const recinto = this.recintos.get(recintoId);
        const elemento = document.querySelector(`[data-recinto-id="${recintoId}"]`);
        
        if (!recinto || !elemento) return;

        // Actualizar contador de ocupación
        const ocupacionElement = elemento.querySelector('.ocupacion-actual');
        if (ocupacionElement) {
            ocupacionElement.textContent = recinto.ocupacion;
        }

        // Actualizar slots de dinosaurios
        const slots = elemento.querySelectorAll('.slot-dinosaurio');
        slots.forEach((slot, index) => {
            const dinosaurio = recinto.dinosaurios[index];
            if (dinosaurio) {
                slot.innerHTML = `
                    <div class="dinosaurio-colocado" data-familia="${dinosaurio.familia}">
                        <div class="dinosaurio-icono">${this.obtenerIconoDinosaurio(dinosaurio)}</div>
                        <div class="dinosaurio-nombre">${dinosaurio.nombre}</div>
                    </div>
                `;
                slot.classList.add('slot-ocupado');
            } else {
                slot.innerHTML = '<div class="slot-vacio">+</div>';
                slot.classList.remove('slot-ocupado');
            }
        });

        // Actualizar estado visual del recinto
        this.actualizarEstadoVisualRecinto(elemento, recinto);
    }

    /**
     * Actualiza el estado visual de un recinto
     */
    actualizarEstadoVisualRecinto(elemento, recinto) {
        // Remover clases de estado anteriores
        elemento.classList.remove('recinto-vacio', 'recinto-parcial', 'recinto-lleno', 'recinto-completo');

        if (recinto.ocupacion === 0) {
            elemento.classList.add('recinto-vacio');
        } else if (recinto.ocupacion >= recinto.maxDinos && recinto.maxDinos !== 99) {
            elemento.classList.add('recinto-lleno');
            
            // Verificar si cumple condiciones especiales
            if (this.verificarCondicionEspecial(recinto)) {
                elemento.classList.add('recinto-completo');
            }
        } else {
            elemento.classList.add('recinto-parcial');
        }
    }

    /**
     * Verifica condiciones especiales de un recinto
     */
    verificarCondicionEspecial(recinto) {
        switch (recinto.regla) {
            case 'TRIO_ARBOREO':
                return recinto.ocupacion === 3;
            case 'BOSQUE_MISMO':
                return recinto.ocupacion === 4 && this.todasMismaFamilia(recinto.dinosaurios);
            case 'PRADERA_DIFERENTE':
                return recinto.ocupacion === 4 && this.todasFamiliasDiferentes(recinto.dinosaurios);
            default:
                return false;
        }
    }

    /**
     * Verifica si todos los dinosaurios son de la misma familia
     */
    todasMismaFamilia(dinosaurios) {
        if (dinosaurios.length === 0) return false;
        const primeraFamilia = dinosaurios[0].familia;
        return dinosaurios.every(d => d.familia === primeraFamilia);
    }

    /**
     * Verifica si todos los dinosaurios son de familias diferentes
     */
    todasFamiliasDiferentes(dinosaurios) {
        const familias = new Set(dinosaurios.map(d => d.familia));
        return familias.size === dinosaurios.length;
    }

    /**
     * Obtiene el icono de un dinosaurio
     */
    obtenerIconoDinosaurio(dinosaurio) {
        const iconos = {
            'T-Rex': '🦖',
            'Stegosaurus': '🦕',
            'Triceratops': '🦴',
            'Raptor': '🦅',
            'Sauropodo': '🦕',
            'Allosaurus': '🐊'
        };
        return iconos[dinosaurio.familia] || '🦕';
    }

    /**
     * Selecciona un recinto para colocación
     */
    seleccionarRecinto(recintoId) {
        // Remover selección anterior
        document.querySelectorAll('.recinto').forEach(r => {
            r.classList.remove('recinto-seleccionado');
        });

        // Seleccionar nuevo recinto
        const elemento = document.querySelector(`[data-recinto-id="${recintoId}"]`);
        if (elemento) {
            elemento.classList.add('recinto-seleccionado');
        }

        // Disparar evento
        document.dispatchEvent(new CustomEvent('recintoSeleccionado', {
            detail: { recintoId }
        }));

        console.log('🎯 Recinto seleccionado:', recintoId);
    }

    /**
     * Muestra información detallada de un recinto
     */
    mostrarInfoRecinto(elemento) {
        const recintoId = parseInt(elemento.dataset.recintoId);
        const recinto = this.recintos.get(recintoId);
        
        if (!recinto) return;

        // Crear tooltip si no existe
        let tooltip = document.querySelector('.recinto-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'recinto-tooltip';
            document.body.appendChild(tooltip);
        }

        // Contenido del tooltip
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icono">${recinto.icono}</span>
                <span class="tooltip-nombre">${recinto.nombre}</span>
            </div>
            <div class="tooltip-regla">
                ${this.obtenerDescripcionRegla(recinto.regla)}
            </div>
            <div class="tooltip-estado">
                Ocupación: ${recinto.ocupacion}/${recinto.maxDinos === 99 ? '∞' : recinto.maxDinos}
            </div>
            ${recinto.dinosaurios.length > 0 ? `
                <div class="tooltip-dinosaurios">
                    <strong>Dinosaurios:</strong>
                    ${recinto.dinosaurios.map(d => `<span class="tooltip-dino">${d.nombre}</span>`).join(', ')}
                </div>
            ` : ''}
        `;

        // Posicionar tooltip
        const rect = elemento.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.display = 'block';
    }

    /**
     * Oculta información del recinto
     */
    ocultarInfoRecinto() {
        const tooltip = document.querySelector('.recinto-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Centra la vista del tablero
     */
    centrarVista() {
        this.tableroElement.style.transform = 'translate(-50%, -50%) scale(1)';
        this.tableroElement.style.left = '50%';
        this.tableroElement.style.top = '50%';
    }

    /**
     * Cambia el zoom del tablero
     */
    cambiarZoom(factor) {
        const transform = this.tableroElement.style.transform || 'scale(1)';
        const currentScale = parseFloat(transform.match(/scale\(([^)]+)\)/)?.[1] || 1);
        const newScale = Math.max(0.5, Math.min(2, currentScale * factor));
        
        this.tableroElement.style.transform = transform.replace(/scale\([^)]+\)/, `scale(${newScale})`);
    }

    /**
     * Muestra vista completa del tablero
     */
    vistaCompleta() {
        this.tableroElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        this.tableroElement.style.left = '50%';
        this.tableroElement.style.top = '50%';
    }

    /**
     * Obtiene el estado actual del tablero
     */
    obtenerEstadoTablero() {
        const estado = {};
        this.recintos.forEach((recinto, id) => {
            estado[id] = {
                nombre: recinto.nombre,
                ocupacion: recinto.ocupacion,
                maxDinos: recinto.maxDinos,
                dinosaurios: [...recinto.dinosaurios]
            };
        });
        return estado;
    }

    /**
     * Resetea el tablero
     */
    resetear() {
        this.recintos.forEach((recinto, id) => {
            recinto.dinosaurios = [];
            recinto.ocupacion = 0;
            this.actualizarVisualizacionRecinto(id);
        });

        // Remover selecciones
        document.querySelectorAll('.recinto').forEach(r => {
            r.classList.remove('recinto-seleccionado', 'recinto-permitido', 'recinto-prohibido');
        });

        console.log('🧹 Tablero reseteado');
    }

    /**
     * Destruye el gestor del tablero
     */
    destruir() {
        const contenedor = document.querySelector('.tablero-container');
        if (contenedor) {
            contenedor.remove();
        }

        const tooltip = document.querySelector('.recinto-tooltip');
        if (tooltip) {
            tooltip.remove();
        }

        this.recintos.clear();
        console.log('🧹 Gestor de Tablero destruido');
    }
}