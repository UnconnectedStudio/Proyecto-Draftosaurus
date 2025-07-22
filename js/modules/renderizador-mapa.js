/**
 * RENDERIZADOR DE MAPA
 * Renderiza dinámicamente el mapa del tablero de Draftosaurus
 */

export class RenderizadorMapa {
    constructor(contenedor) {
        this.contenedor = contenedor;
        this.canvas = null;
        this.ctx = null;
        this.escala = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.animaciones = new Map();
        this.elementosInteractivos = [];
        this.configuracionMapa = {
            ancho: 1000,
            alto: 600,
            zonas: {
                bosque: { x: 0, y: 0, ancho: 350, alto: 600, color: '#22c55e' },
                rio: { x: 350, y: 0, ancho: 300, alto: 600, color: '#0ea5e9' },
                pradera: { x: 650, y: 0, ancho: 350, alto: 600, color: '#16a34a' }
            },
            recintos: [
                {
                    id: 1,
                    nombre: 'Bosque de lo Mismo',
                    x: 50, y: 100, ancho: 250, alto: 120,
                    zona: 'bosque',
                    icono: '🌲',
                    color: '#166534'
                },
                {
                    id: 2,
                    nombre: 'Pradera de lo Diferente',
                    x: 700, y: 100, ancho: 250, alto: 120,
                    zona: 'pradera',
                    icono: '🌿',
                    color: '#15803d'
                },
                {
                    id: 3,
                    nombre: 'Pradera de Parejas',
                    x: 700, y: 350, ancho: 250, alto: 120,
                    zona: 'pradera',
                    icono: '👥',
                    color: '#059669'
                },
                {
                    id: 4,
                    nombre: 'Trío Arbóreo',
                    x: 50, y: 350, ancho: 250, alto: 120,
                    zona: 'bosque',
                    icono: '🌳',
                    color: '#166534'
                },
                {
                    id: 5,
                    nombre: 'Rey de la Selva',
                    x: 50, y: 480, ancho: 120, alto: 100,
                    zona: 'bosque',
                    icono: '👑',
                    color: '#fbbf24'
                },
                {
                    id: 6,
                    nombre: 'Isla Solitaria',
                    x: 830, y: 480, ancho: 120, alto: 100,
                    zona: 'pradera',
                    icono: '🏝️',
                    color: '#0ea5e9'
                },
                {
                    id: 7,
                    nombre: 'El Río',
                    x: 375, y: 250, ancho: 250, alto: 100,
                    zona: 'rio',
                    icono: '🌊',
                    color: '#0284c7'
                }
            ]
        };
    }

    /**
     * Inicializa el renderizador
     */
    inicializar() {
        this.crearCanvas();
        this.configurarEventos();
        this.iniciarBucleRenderizado();
        console.log('🗺️ Renderizador de Mapa inicializado');
    }

    /**
     * Crea el canvas para el renderizado
     */
    crearCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.configuracionMapa.ancho;
        this.canvas.height = this.configuracionMapa.alto;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        this.canvas.style.borderRadius = '15px';
        this.canvas.style.cursor = 'pointer';
        
        this.ctx = this.canvas.getContext('2d');
        this.contenedor.appendChild(this.canvas);
        
        // Ajustar resolución para pantallas de alta densidad
        this.ajustarResolucion();
    }

    /**
     * Ajusta la resolución del canvas para pantallas de alta densidad
     */
    ajustarResolucion() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * Configura eventos del canvas
     */
    configurarEventos() {
        this.canvas.addEventListener('click', (e) => {
            this.manejarClick(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.manejarMouseMove(e);
        });

        this.canvas.addEventListener('wheel', (e) => {
            this.manejarZoom(e);
        });

        // Redimensionar canvas cuando cambie el tamaño
        window.addEventListener('resize', () => {
            this.ajustarResolucion();
        });
    }

    /**
     * Inicia el bucle de renderizado
     */
    iniciarBucleRenderizado() {
        const renderizar = () => {
            this.limpiarCanvas();
            this.renderizarFondo();
            this.renderizarZonas();
            this.renderizarRio();
            this.renderizarRecintos();
            this.renderizarDinosaurios();
            this.renderizarEfectos();
            
            requestAnimationFrame(renderizar);
        };
        
        renderizar();
    }

    /**
     * Limpia el canvas
     */
    limpiarCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Renderiza el fondo del mapa
     */
    renderizarFondo() {
        // Gradiente de fondo
        const gradiente = this.ctx.createLinearGradient(0, 0, this.configuracionMapa.ancho, this.configuracionMapa.alto);
        gradiente.addColorStop(0, '#0f172a');
        gradiente.addColorStop(0.5, '#1e293b');
        gradiente.addColorStop(1, '#334155');
        
        this.ctx.fillStyle = gradiente;
        this.ctx.fillRect(0, 0, this.configuracionMapa.ancho, this.configuracionMapa.alto);
    }

    /**
     * Renderiza las zonas del mapa
     */
    renderizarZonas() {
        Object.entries(this.configuracionMapa.zonas).forEach(([nombre, zona]) => {
            // Gradiente para cada zona
            const gradiente = this.ctx.createLinearGradient(zona.x, zona.y, zona.x + zona.ancho, zona.y + zona.alto);
            
            switch (nombre) {
                case 'bosque':
                    gradiente.addColorStop(0, '#166534');
                    gradiente.addColorStop(1, '#22c55e');
                    break;
                case 'rio':
                    gradiente.addColorStop(0, '#0ea5e9');
                    gradiente.addColorStop(0.5, '#0284c7');
                    gradiente.addColorStop(1, '#0369a1');
                    break;
                case 'pradera':
                    gradiente.addColorStop(0, '#22c55e');
                    gradiente.addColorStop(1, '#16a34a');
                    break;
            }
            
            this.ctx.fillStyle = gradiente;
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(zona.x, zona.y, zona.ancho, zona.alto);
            this.ctx.globalAlpha = 1;
            
            // Título de la zona
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.obtenerTituloZona(nombre),
                zona.x + zona.ancho / 2,
                zona.y + 40
            );
        });
    }

    /**
     * Obtiene el título de una zona
     */
    obtenerTituloZona(nombre) {
        const titulos = {
            bosque: '🌲 Bosque',
            rio: '🌊 Río',
            pradera: '🌿 Pradera'
        };
        return titulos[nombre] || nombre;
    }

    /**
     * Renderiza el río con animación
     */
    renderizarRio() {
        const rio = this.configuracionMapa.zonas.rio;
        const tiempo = Date.now() * 0.001;
        
        // Ondas animadas
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            const y = rio.y + rio.alto * 0.2 + i * 30;
            
            for (let x = rio.x; x < rio.x + rio.ancho; x += 10) {
                const ondaY = y + Math.sin((x * 0.02) + (tiempo * 2) + (i * 0.5)) * 8;
                
                if (x === rio.x) {
                    this.ctx.moveTo(x, ondaY);
                } else {
                    this.ctx.lineTo(x, ondaY);
                }
            }
            
            this.ctx.stroke();
        }
        
        // Burbujas animadas
        this.renderizarBurbujas(rio, tiempo);
    }

    /**
     * Renderiza burbujas animadas en el río
     */
    renderizarBurbujas(rio, tiempo) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        
        for (let i = 0; i < 8; i++) {
            const x = rio.x + (rio.ancho * 0.2) + (i * 40) + Math.sin(tiempo + i) * 20;
            const y = rio.y + (rio.alto * 0.3) + Math.cos(tiempo * 0.8 + i) * 30;
            const radio = 3 + Math.sin(tiempo * 2 + i) * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radio, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Renderiza los recintos
     */
    renderizarRecintos() {
        this.configuracionMapa.recintos.forEach(recinto => {
            this.renderizarRecinto(recinto);
        });
    }

    /**
     * Renderiza un recinto individual
     */
    renderizarRecinto(recinto) {
        const { x, y, ancho, alto, color, nombre, icono } = recinto;
        
        // Fondo del recinto
        const gradiente = this.ctx.createLinearGradient(x, y, x + ancho, y + alto);
        gradiente.addColorStop(0, color + '80');
        gradiente.addColorStop(1, color + 'CC');
        
        this.ctx.fillStyle = gradiente;
        this.ctx.fillRect(x, y, ancho, alto);
        
        // Borde del recinto
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, ancho, alto);
        
        // Icono del recinto
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(icono, x + 30, y + 40);
        
        // Nombre del recinto
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(nombre, x + 60, y + 30);
        
        // Slots para dinosaurios
        this.renderizarSlotsRecinto(recinto);
        
        // Información del recinto
        this.renderizarInfoRecinto(recinto);
    }

    /**
     * Renderiza los slots de dinosaurios en un recinto
     */
    renderizarSlotsRecinto(recinto) {
        const { x, y, ancho, alto, id } = recinto;
        const maxSlots = this.obtenerMaxSlots(id);
        const slotSize = 30;
        const padding = 10;
        const slotsPerRow = Math.floor((ancho - 60) / (slotSize + padding));
        
        for (let i = 0; i < Math.min(maxSlots, 6); i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            
            const slotX = x + 60 + col * (slotSize + padding);
            const slotY = y + 50 + row * (slotSize + padding);
            
            // Fondo del slot
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(slotX, slotY, slotSize, slotSize);
            
            // Borde del slot
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(slotX, slotY, slotSize, slotSize);
            
            // Símbolo de slot vacío
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('+', slotX + slotSize/2, slotY + slotSize/2 + 7);
        }
    }

    /**
     * Obtiene el máximo de slots para un recinto
     */
    obtenerMaxSlots(recintoId) {
        const maxSlots = {1: 4, 2: 4, 3: 6, 4: 3, 5: 1, 6: 1, 7: 6};
        return maxSlots[recintoId] || 6;
    }

    /**
     * Renderiza información del recinto
     */
    renderizarInfoRecinto(recinto) {
        const { x, y, ancho, alto, id } = recinto;
        const regla = this.obtenerReglaRecinto(id);
        
        // Fondo de información
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x + 5, y + alto - 25, ancho - 10, 20);
        
        // Texto de la regla
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(regla, x + 10, y + alto - 10);
    }

    /**
     * Obtiene la regla de un recinto
     */
    obtenerReglaRecinto(recintoId) {
        const reglas = {
            1: 'Una especie: 1→1, 2→3, 3→6, 4→10 pts',
            2: 'Especies diferentes: 1→1, 2→3, 3→6, 4→10 pts',
            3: 'Parejas: +5 pts por pareja',
            4: 'Solo 3 espacios: 7 pts si lleno',
            5: '1 dinosaurio: 7 pts si mayoría',
            6: '1 dinosaurio: 7 pts si único',
            7: 'Sin restricciones: +1 pt por dino'
        };
        return reglas[recintoId] || '';
    }

    /**
     * Renderiza dinosaurios colocados
     */
    renderizarDinosaurios() {
        // Esta función será llamada por el gestor principal
        // con los datos de dinosaurios colocados
    }

    /**
     * Coloca un dinosaurio visualmente en el mapa
     */
    colocarDinosaurioVisual(recintoId, dinosaurio, posicion) {
        const recinto = this.configuracionMapa.recintos.find(r => r.id === recintoId);
        if (!recinto) return;
        
        const slotSize = 30;
        const padding = 10;
        const slotsPerRow = Math.floor((recinto.ancho - 60) / (slotSize + padding));
        
        const row = Math.floor(posicion / slotsPerRow);
        const col = posicion % slotsPerRow;
        
        const x = recinto.x + 60 + col * (slotSize + padding);
        const y = recinto.y + 50 + row * (slotSize + padding);
        
        // Animación de colocación
        this.animarColocacion(x, y, dinosaurio);
    }

    /**
     * Anima la colocación de un dinosaurio
     */
    animarColocacion(x, y, dinosaurio) {
        const animacion = {
            x: x,
            y: y,
            dinosaurio: dinosaurio,
            escala: 0,
            rotacion: 0,
            tiempo: 0,
            duracion: 500
        };
        
        const id = Date.now() + Math.random();
        this.animaciones.set(id, animacion);
        
        // Remover animación después de completarse
        setTimeout(() => {
            this.animaciones.delete(id);
        }, animacion.duracion);
    }

    /**
     * Renderiza efectos y animaciones
     */
    renderizarEfectos() {
        this.animaciones.forEach((animacion, id) => {
            this.renderizarAnimacion(animacion);
            animacion.tiempo += 16; // ~60fps
        });
    }

    /**
     * Renderiza una animación específica
     */
    renderizarAnimacion(animacion) {
        const progreso = Math.min(animacion.tiempo / animacion.duracion, 1);
        const escala = this.easeOutBounce(progreso);
        
        this.ctx.save();
        this.ctx.translate(animacion.x + 15, animacion.y + 15);
        this.ctx.scale(escala, escala);
        this.ctx.rotate(animacion.rotacion);
        
        // Renderizar dinosaurio
        this.ctx.fillStyle = this.obtenerColorDinosaurio(animacion.dinosaurio);
        this.ctx.fillRect(-15, -15, 30, 30);
        
        // Icono del dinosaurio
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.obtenerIconoDinosaurio(animacion.dinosaurio), 0, 5);
        
        this.ctx.restore();
    }

    /**
     * Función de easing para animaciones
     */
    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    /**
     * Obtiene el color de un dinosaurio según su tipo
     */
    obtenerColorDinosaurio(dinosaurio) {
        const colores = {
            carnivoro: '#ef4444',
            herbivoro: '#22c55e'
        };
        return colores[dinosaurio.tipo] || '#6b7280';
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
     * Maneja clicks en el canvas
     */
    manejarClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Verificar si se hizo click en un recinto
        const recintoClickeado = this.configuracionMapa.recintos.find(recinto => {
            return x >= recinto.x && x <= recinto.x + recinto.ancho &&
                   y >= recinto.y && y <= recinto.y + recinto.alto;
        });
        
        if (recintoClickeado) {
            this.notificarClickRecinto(recintoClickeado);
        }
    }

    /**
     * Maneja movimiento del mouse
     */
    manejarMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Verificar si está sobre un recinto
        const recintoHover = this.configuracionMapa.recintos.find(recinto => {
            return x >= recinto.x && x <= recinto.x + recinto.ancho &&
                   y >= recinto.y && y <= recinto.y + recinto.alto;
        });
        
        if (recintoHover) {
            this.canvas.style.cursor = 'pointer';
            this.mostrarTooltipRecinto(recintoHover, e);
        } else {
            this.canvas.style.cursor = 'default';
            this.ocultarTooltip();
        }
    }

    /**
     * Maneja zoom del canvas
     */
    manejarZoom(e) {
        e.preventDefault();
        
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        this.escala = Math.max(0.5, Math.min(2, this.escala * factor));
        
        this.canvas.style.transform = `scale(${this.escala})`;
    }

    /**
     * Muestra tooltip de recinto
     */
    mostrarTooltipRecinto(recinto, evento) {
        // Implementar tooltip si es necesario
    }

    /**
     * Oculta tooltip
     */
    ocultarTooltip() {
        // Implementar ocultación de tooltip
    }

    /**
     * Notifica click en recinto
     */
    notificarClickRecinto(recinto) {
        const evento = new CustomEvent('recintoClickeado', {
            detail: { recinto }
        });
        document.dispatchEvent(evento);
        console.log('🎯 Click en recinto:', recinto.nombre);
    }

    /**
     * Actualiza el estado visual del mapa
     */
    actualizarEstado(estadoJuego) {
        // Actualizar restricciones visuales
        if (estadoJuego.restriccionActual) {
            this.aplicarRestriccionVisual(estadoJuego.restriccionActual);
        }
        
        // Actualizar dinosaurios colocados
        if (estadoJuego.tableros) {
            this.actualizarDinosauriosColocados(estadoJuego.tableros);
        }
    }

    /**
     * Aplica restricción visual a los recintos
     */
    aplicarRestriccionVisual(restriccion) {
        // Esta función modificará el renderizado de los recintos
        // según la restricción activa
    }

    /**
     * Actualiza dinosaurios colocados en el mapa
     */
    actualizarDinosauriosColocados(tableros) {
        // Actualizar visualización de dinosaurios colocados
    }

    /**
     * Redimensiona el canvas
     */
    redimensionar() {
        this.ajustarResolucion();
    }

    /**
     * Destruye el renderizador
     */
    destruir() {
        if (this.canvas) {
            this.canvas.remove();
        }
        this.animaciones.clear();
        console.log('🧹 Renderizador de Mapa destruido');
    }
}