/**
 * RENDERIZADOR DE TABLERO FUNCIONAL
 * Versión limpia del renderizador tablero interactivo sin emojis y con funciones completas
 * Integrado con el sistema de dinosaurios y reglas de Draftosaurus
 */

export class RenderizadorTableroFuncional {
    constructor(contenedor) {
        this.contenedor = contenedor;
        this.canvas = null;
        this.ctx = null;
        this.imagenTablero = null;
        this.zonasInteractivas = [];
        this.dinosaurioSeleccionado = null;
        this.recintoSeleccionado = null;
        this.escala = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        // Sistema de tracking del cursor
        this.cursorTracker = {
            x: 0,
            y: 0,
            isTracking: false,
            lastUpdate: Date.now()
        };

        // Sistema de drag and drop
        this.dragState = {
            isDragging: false,
            dinosaurio: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };

        // Conexión con sistema de dinosaurios
        this.dinosauriosDisponibles = [];
        this.restriccionDado = null;

        // Configuración de zonas interactivas
        this.configurarZonasInteractivas();
        this.iniciarTrackingCursor();
    }

    /**
     * Configura las zonas interactivas del tablero optimizadas para evitar superposiciones
     */
    configurarZonasInteractivas() {
        this.zonasInteractivas = [
            // CONTENEDOR RECTANGULAR (área libre superior) - Recinto de Manada
            {
                id: 'recinto-manada',
                nombre: 'Manada',
                posiciones: [
                    { x: 120, y: 120, numero: 1, tipo: 'contenedor' },
                    { x: 160, y: 120, numero: 2, tipo: 'contenedor' },
                    { x: 200, y: 120, numero: 3, tipo: 'contenedor' },
                    { x: 240, y: 120, numero: 4, tipo: 'contenedor' }
                ],
                color: '#9932CC',
                regla: 'MANADA',
                maxDinosaurios: 4,
                restriccion: 'MISMO_TIPO',
                forma: 'rectangulo',
                ancho: 140,
                alto: 70,
                x: 180,
                y: 120,
                puntuacion: 'SUMA_TIPOS_IGUALES'
            },

            // CONTENEDOR CUADRADO (esquina superior derecha) - Recinto del Rey
            {
                id: 'recinto-rey',
                nombre: 'Rey',
                posiciones: [
                    { x: 720, y: 120, numero: 1, tipo: 'contenedor' }
                ],
                color: '#FFD700',
                regla: 'REY',
                maxDinosaurios: 1,
                restriccion: 'SOLO_TREX',
                forma: 'cuadrado',
                ancho: 70,
                alto: 70,
                x: 720,
                y: 120,
                puntuacion: 'BONUS_TREX'
            },

            // CONTENEDOR CUADRADO (lateral izquierdo) - Recinto del Bosque
            {
                id: 'recinto-bosque',
                nombre: 'Bosque',
                posiciones: [
                    { x: 80, y: 280, numero: 1, tipo: 'contenedor' }
                ],
                color: '#228B22',
                regla: 'BOSQUE',
                maxDinosaurios: 1,
                restriccion: 'HERBIVOROS',
                forma: 'cuadrado',
                ancho: 65,
                alto: 65,
                x: 80,
                y: 280,
                puntuacion: 'BONUS_HERBIVORO'
            },

            // CONTENEDOR CUADRADO (lateral derecho) - Recinto del Desierto
            {
                id: 'recinto-desierto',
                nombre: 'Desierto',
                posiciones: [
                    { x: 720, y: 280, numero: 1, tipo: 'contenedor' }
                ],
                color: '#DC143C',
                regla: 'DESIERTO',
                maxDinosaurios: 1,
                restriccion: 'CARNIVOROS',
                forma: 'cuadrado',
                ancho: 65,
                alto: 65,
                x: 720,
                y: 280,
                puntuacion: 'BONUS_CARNIVORO'
            },

            // CONTENEDOR CUADRADO (centro superior) - Recinto del Lago
            {
                id: 'recinto-lago',
                nombre: 'Lago',
                posiciones: [
                    { x: 400, y: 120, numero: 1, tipo: 'contenedor' }
                ],
                color: '#4169E1',
                regla: 'LAGO',
                maxDinosaurios: 1,
                restriccion: 'ACUATICOS',
                forma: 'cuadrado',
                ancho: 65,
                alto: 65,
                x: 400,
                y: 120,
                puntuacion: 'BONUS_ACUATICO'
            },

            // CONTENEDOR CUADRADO (esquina inferior derecha) - Recinto de la Montaña
            {
                id: 'recinto-montaña',
                nombre: 'Montaña',
                posiciones: [
                    { x: 720, y: 440, numero: 1, tipo: 'contenedor' }
                ],
                color: '#800080',
                regla: 'MONTAÑA',
                maxDinosaurios: 1,
                restriccion: 'VOLADORES',
                forma: 'cuadrado',
                ancho: 65,
                alto: 65,
                x: 720,
                y: 440,
                puntuacion: 'BONUS_VOLADOR'
            },

            // CONTENEDOR CUADRADO (esquina inferior izquierda) - Recinto de Diversidad
            {
                id: 'recinto-diversidad',
                nombre: 'Diversidad',
                posiciones: [
                    { x: 80, y: 440, numero: 1, tipo: 'contenedor' }
                ],
                color: '#FF6347',
                regla: 'DIVERSIDAD',
                maxDinosaurios: 1,
                restriccion: 'TIPOS_DIFERENTES',
                forma: 'cuadrado',
                ancho: 65,
                alto: 65,
                x: 80,
                y: 440,
                puntuacion: 'BONUS_DIVERSIDAD'
            }
        ];
    }

    /**
     * Inicializa el renderizador sin dependencia de imagen de fondo
     */
    async inicializar() {
        try {
            console.log('Iniciando renderizador tablero funcional...');

            if (!this.contenedor) {
                throw new Error('Contenedor no encontrado');
            }

            // Ya no necesitamos cargar imagen del tablero
            this.crearCanvasSinImagen();
            this.configurarEventos();
            this.renderizar();

            console.log('Renderizador tablero funcional inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando renderizador:', error);
            this.mostrarErrorEnContenedor(error);
            throw error;
        }
    }

    /**
     * Carga la imagen del tablero
     */
    async cargarImagenTablero() {
        return new Promise((resolve, reject) => {
            this.imagenTablero = new Image();
            this.imagenTablero.onload = () => {
                console.log('Imagen del tablero cargada:', this.imagenTablero.width, 'x', this.imagenTablero.height);
                resolve();
            };
            this.imagenTablero.onerror = (error) => {
                console.error('Error cargando imagen:', error);
                reject(new Error('No se pudo cargar la imagen del tablero'));
            };

            const timestamp = new Date().getTime();
            this.imagenTablero.src = `recursos/img/tableroPersonalizado.png?t=${timestamp}`;
        });
    }

    /**
     * Crea el canvas sin dependencia de imagen de fondo
     */
    crearCanvasSinImagen() {
        this.contenedor.innerHTML = '';

        let anchoContenedor = this.contenedor.clientWidth;
        if (anchoContenedor <= 0) {
            anchoContenedor = 800;
        }

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'tablero-canvas';
        this.canvas.style.border = '2px solid #28a745';
        this.canvas.style.borderRadius = '15px';
        this.canvas.style.cursor = 'pointer';
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        this.canvas.style.display = 'block';
        this.canvas.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';

        // Usar proporción 16:10 para un tablero moderno
        const alturaCanvas = (anchoContenedor * 10) / 16;
        this.canvas.width = anchoContenedor;
        this.canvas.height = alturaCanvas;
        this.escala = 1; // Escala base sin dependencia de imagen

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }

        this.contenedor.appendChild(this.canvas);
        this.crearPanelInformacion();
    }

    /**
     * Crea el canvas y lo configura (método legacy mantenido para compatibilidad)
     */
    crearCanvas() {
        // Redirigir al nuevo método sin imagen
        this.crearCanvasSinImagen();
    }

    /**
     * Crea el panel de información
     */
    crearPanelInformacion() {
        const panel = document.createElement('div');
        panel.id = 'panel-info-tablero';
        panel.className = 'panel-info-tablero';
        panel.innerHTML = `
            <div class="info-header">
                <h3>Información del Tablero</h3>
            </div>
            <div class="info-content">
                <div id="info-recinto" class="info-recinto">
                    <p>Selecciona un recinto para ver su información</p>
                </div>
                <div id="info-seleccion" class="info-seleccion">
                    <p><strong>Dinosaurio:</strong> <span id="dino-seleccionado">Ninguno</span></p>
                    <p><strong>Recinto:</strong> <span id="recinto-seleccionado">Ninguno</span></p>
                </div>
            </div>
        `;
        this.contenedor.appendChild(panel);
    }

    /**
     * Configura los eventos del canvas
     */
    configurarEventos() {
        this.canvas.addEventListener('click', (e) => this.manejarClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.manejarMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.manejarMouseLeave());
        this.canvas.addEventListener('mousedown', (e) => this.manejarMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.manejarMouseUp(e));

        document.addEventListener('mousemove', (e) => this.manejarDragGlobal(e));
        document.addEventListener('mouseup', (e) => this.manejarDropGlobal(e));
        window.addEventListener('resize', () => this.redimensionar());

        this.canvas.addEventListener('dragstart', (e) => e.preventDefault());
        this.canvas.addEventListener('selectstart', (e) => e.preventDefault());
    }

    /**
     * Maneja clicks en el canvas
     */
    manejarClick(evento) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        const zonaClickeada = this.obtenerZonaEnPosicion(x, y);

        if (zonaClickeada && this.dinosaurioSeleccionado) {
            const validacion = this.validarColocacionCompleta(zonaClickeada.id, this.dinosaurioSeleccionado);

            if (validacion.valida) {
                this.colocarDinosaurio(zonaClickeada.id, this.dinosaurioSeleccionado);
                this.notificarColocacion(zonaClickeada.id, this.dinosaurioSeleccionado);
                this.renderizar();
            } else {
                this.mostrarMensajeValidacion(validacion.mensaje, 'error');
            }
        }
    }

    /**
     * Maneja movimiento del mouse
     */
    manejarMouseMove(evento) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        const zona = this.obtenerZonaEnPosicion(x, y);

        if (zona) {
            this.canvas.style.cursor = this.dinosaurioSeleccionado ? 'pointer' : 'help';
            this.mostrarInfoRecinto(zona);
        } else {
            this.canvas.style.cursor = 'default';
            this.ocultarInfoRecinto();
        }
    }

    /**
     * Maneja cuando el mouse sale del canvas
     */
    manejarMouseLeave() {
        this.canvas.style.cursor = 'default';
        this.ocultarInfoRecinto();
    }

    /**
     * Maneja mousedown para drag & drop
     */
    manejarMouseDown(evento) {
        if (!this.dinosaurioSeleccionado) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        this.iniciarDrag(this.dinosaurioSeleccionado, x, y);
        evento.preventDefault();
    }

    /**
     * Maneja mouseup en el canvas
     */
    manejarMouseUp(evento) {
        if (!this.dragState.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        this.finalizarDrag(x, y);
        evento.preventDefault();
    }

    /**
     * Maneja drag global
     */
    manejarDragGlobal(evento) {
        if (!this.dragState.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        this.actualizarDrag(x, y);
    }

    /**
     * Maneja drop global
     */
    manejarDropGlobal(evento) {
        if (!this.dragState.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        this.finalizarDrag(x, y);
    }

    /**
     * Obtiene la zona en una posición específica
     */
    obtenerZonaEnPosicion(x, y) {
        for (const zona of this.zonasInteractivas) {
            if (zona.forma === 'rectangulo' || zona.forma === 'cuadrado') {
                const centroX = zona.x;
                const centroY = zona.y;
                const ancho = zona.ancho;
                const alto = zona.alto;

                if (x >= centroX - ancho / 2 && x <= centroX + ancho / 2 &&
                    y >= centroY - alto / 2 && y <= centroY + alto / 2) {
                    return zona;
                }
            }
        }
        return null;
    }

    /**
     * Renderiza el tablero completo con sistema de capas
     */
    renderizar() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // CAPA 1: Fondo del tablero (con opacidad reducida para no interferir)
        this.dibujarCapaFondo();

        // CAPA 2: Contenedores visuales independientes
        this.dibujarCapaContenedores();

        // CAPA 3: Dinosaurios colocados
        this.dibujarCapaDinosaurios();

        // CAPA 4: Efectos de interacción
        this.dibujarCapaEfectos();
    }

    /**
     * Dibuja la capa de fondo neutro y moderno
     */
    dibujarCapaFondo() {
        this.ctx.save();
        
        // Crear gradiente de fondo sutil y elegante
        const gradienteFondo = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradienteFondo.addColorStop(0, '#1a1a2e');      // Azul oscuro en la esquina superior
        gradienteFondo.addColorStop(0.5, '#16213e');    // Azul medio en el centro
        gradienteFondo.addColorStop(1, '#0f3460');      // Azul más intenso en la esquina inferior
        
        this.ctx.fillStyle = gradienteFondo;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Añadir patrón sutil de puntos para textura
        this.dibujarPatronTextura();
        
        this.ctx.restore();
    }

    /**
     * Dibuja un patrón sutil de textura de fondo
     */
    dibujarPatronTextura() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = '#ffffff';
        
        // Crear patrón de puntos sutiles
        const espaciado = 30;
        for (let x = 0; x < this.canvas.width; x += espaciado) {
            for (let y = 0; y < this.canvas.height; y += espaciado) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }

    /**
     * Dibuja la capa de contenedores visuales independientes
     */
    dibujarCapaContenedores() {
        for (const zona of this.zonasInteractivas) {
            this.dibujarContenedorIndependiente(zona);
        }
    }

    /**
     * Dibuja la capa de dinosaurios colocados
     */
    dibujarCapaDinosaurios() {
        this.dibujarDinosauriosColocados();
    }

    /**
     * Dibuja la capa de efectos de interacción
     */
    dibujarCapaEfectos() {
        // Resaltar recinto seleccionado
        if (this.recintoSeleccionado) {
            this.resaltarRecinto(this.recintoSeleccionado);
        }

        // Cursor tracker
        this.dibujarCursorTracker();

        if (this.dragState.isDragging) {
            this.dibujarDinosaurioArrastrado();
        }
    }

    /**
     * Dibuja un contenedor visual independiente con diseño moderno
     */
    dibujarContenedorIndependiente(zona) {
        this.ctx.save();

        const x = (zona.x - zona.ancho / 2) * this.escala;
        const y = (zona.y - zona.alto / 2) * this.escala;
        const ancho = zona.ancho * this.escala;
        const alto = zona.alto * this.escala;

        // FONDO DEL CONTENEDOR - Diseño moderno con gradiente
        this.dibujarFondoContenedor(x, y, ancho, alto, zona);

        // BORDE DEL CONTENEDOR - Línea sólida y clara
        this.dibujarBordeContenedor(x, y, ancho, alto, zona);

        // ICONO/SÍMBOLO DEL RECINTO
        this.dibujarIconoRecinto(zona);

        // ETIQUETA DEL CONTENEDOR
        this.dibujarEtiquetaContenedor(zona);

        // INDICADOR DE CAPACIDAD
        this.dibujarIndicadorCapacidad(zona);

        this.ctx.restore();
    }

    /**
     * Dibuja el fondo del contenedor con gradiente moderno
     */
    dibujarFondoContenedor(x, y, ancho, alto, zona) {
        // Crear gradiente radial desde el centro
        const centroX = x + ancho / 2;
        const centroY = y + alto / 2;
        const radio = Math.min(ancho, alto) / 2;

        const gradiente = this.ctx.createRadialGradient(
            centroX, centroY, 0,
            centroX, centroY, radio
        );

        // Colores del gradiente basados en el tipo de recinto
        const colorBase = zona.color;
        gradiente.addColorStop(0, colorBase + '40'); // Centro más opaco
        gradiente.addColorStop(0.7, colorBase + '20'); // Medio transparente
        gradiente.addColorStop(1, colorBase + '10'); // Borde muy transparente

        this.ctx.fillStyle = gradiente;
        
        if (zona.forma === 'rectangulo') {
            // Rectángulo con esquinas redondeadas
            this.dibujarRectanguloRedondeado(x, y, ancho, alto, 8);
        } else {
            // Cuadrado con esquinas redondeadas
            this.dibujarRectanguloRedondeado(x, y, ancho, alto, 6);
        }
        
        this.ctx.fill();
    }

    /**
     * Dibuja el borde del contenedor
     */
    dibujarBordeContenedor(x, y, ancho, alto, zona) {
        this.ctx.strokeStyle = zona.color;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]); // Línea sólida, no punteada
        this.ctx.globalAlpha = 0.8;

        if (zona.forma === 'rectangulo') {
            this.dibujarRectanguloRedondeado(x, y, ancho, alto, 8);
        } else {
            this.dibujarRectanguloRedondeado(x, y, ancho, alto, 6);
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    /**
     * Dibuja un rectángulo con esquinas redondeadas
     */
    dibujarRectanguloRedondeado(x, y, ancho, alto, radio) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radio, y);
        this.ctx.lineTo(x + ancho - radio, y);
        this.ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
        this.ctx.lineTo(x + ancho, y + alto - radio);
        this.ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
        this.ctx.lineTo(x + radio, y + alto);
        this.ctx.quadraticCurveTo(x, y + alto, x, y + alto - radio);
        this.ctx.lineTo(x, y + radio);
        this.ctx.quadraticCurveTo(x, y, x + radio, y);
        this.ctx.closePath();
    }

    /**
     * Dibuja el icono representativo del recinto
     */
    dibujarIconoRecinto(zona) {
        const iconos = {
            'recinto-manada': '👥',
            'recinto-rey': '👑',
            'recinto-bosque': '🌲',
            'recinto-desierto': '🏜️',
            'recinto-lago': '🌊',
            'recinto-montaña': '⛰️',
            'recinto-diversidad': '🌈'
        };

        const icono = iconos[zona.id] || '📦';
        
        this.ctx.font = `${Math.min(zona.ancho, zona.alto) * 0.3 * this.escala}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = zona.color;
        this.ctx.globalAlpha = 0.7;
        
        this.ctx.fillText(
            icono,
            zona.x * this.escala,
            (zona.y - 5) * this.escala
        );
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Dibuja la etiqueta del contenedor
     */
    dibujarEtiquetaContenedor(zona) {
        // Fondo de la etiqueta
        const etiquetaY = (zona.y + zona.alto / 2 + 15) * this.escala;
        const textoAncho = this.ctx.measureText(zona.nombre).width;
        const paddingX = 8;
        const paddingY = 4;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.dibujarRectanguloRedondeado(
            zona.x * this.escala - textoAncho / 2 - paddingX,
            etiquetaY - 8 - paddingY,
            textoAncho + paddingX * 2,
            16 + paddingY * 2,
            4
        );
        this.ctx.fill();

        // Texto de la etiqueta
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillText(
            zona.nombre,
            zona.x * this.escala,
            etiquetaY
        );
    }

    /**
     * Dibuja el indicador de capacidad del contenedor
     */
    dibujarIndicadorCapacidad(zona) {
        const ocupados = zona.dinosauriosColocados ? zona.dinosauriosColocados.length : 0;
        const total = zona.maxDinosaurios;
        
        // Posición del indicador
        const indicadorX = (zona.x + zona.ancho / 2 - 15) * this.escala;
        const indicadorY = (zona.y - zona.alto / 2 + 5) * this.escala;
        
        // Fondo del indicador
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.dibujarRectanguloRedondeado(indicadorX, indicadorY, 30, 16, 8);
        this.ctx.fill();
        
        // Texto del indicador
        this.ctx.fillStyle = ocupados >= total ? '#ff4444' : '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillText(
            `${ocupados}/${total}`,
            indicadorX + 15,
            indicadorY + 8
        );
    }

    /**
     * Inicia el sistema de tracking del cursor
     */
    iniciarTrackingCursor() {
        this.cursorTracker.isTracking = true;

        document.addEventListener('mousemove', (e) => {
            if (this.cursorTracker.isTracking) {
                this.cursorTracker.x = e.clientX;
                this.cursorTracker.y = e.clientY;
                this.cursorTracker.lastUpdate = Date.now();
            }
        });
    }

    /**
     * Dibuja el indicador del cursor tracker
     */
    dibujarCursorTracker() {
        if (!this.cursorTracker.isTracking || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (this.cursorTracker.x - rect.left) / this.escala;
        const y = (this.cursorTracker.y - rect.top) / this.escala;

        if (x >= 0 && x <= this.canvas.width / this.escala &&
            y >= 0 && y <= this.canvas.height / this.escala) {

            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(x * this.escala, y * this.escala, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Inicia el drag de un dinosaurio
     */
    iniciarDrag(dinosaurio, x, y) {
        this.dragState = {
            isDragging: true,
            dinosaurio: dinosaurio,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y
        };

        this.canvas.style.cursor = 'grabbing';
    }

    /**
     * Actualiza la posición del drag
     */
    actualizarDrag(x, y) {
        if (this.dragState.isDragging) {
            this.dragState.currentX = x;
            this.dragState.currentY = y;
            this.renderizar();
        }
    }

    /**
     * Finaliza el drag y maneja el drop
     */
    finalizarDrag(x, y) {
        if (!this.dragState.isDragging) return;

        const zona = this.obtenerZonaEnPosicion(x, y);

        if (zona) {
            const validacion = this.validarColocacionCompleta(zona.id, this.dragState.dinosaurio);

            if (validacion.valida) {
                this.colocarDinosaurio(zona.id, this.dragState.dinosaurio);
                this.notificarColocacion(zona.id, this.dragState.dinosaurio);
            } else {
                this.mostrarMensajeValidacion(validacion.mensaje, 'error');
            }
        }

        this.dragState = {
            isDragging: false,
            dinosaurio: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };

        this.canvas.style.cursor = 'pointer';
        this.renderizar();
    }

    /**
     * Dibuja el dinosaurio siendo arrastrado
     */
    dibujarDinosaurioArrastrado() {
        if (!this.dragState.isDragging || !this.dragState.dinosaurio) return;

        this.ctx.save();
        this.ctx.globalAlpha = 0.8;

        // Sombra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.dragState.currentX + 2) * this.escala,
            (this.dragState.currentY + 2) * this.escala,
            15, 0, 2 * Math.PI
        );
        this.ctx.fill();

        // Dinosaurio
        this.ctx.fillStyle = this.obtenerColorDinosaurio(this.dragState.dinosaurio);
        this.ctx.beginPath();
        this.ctx.arc(
            this.dragState.currentX * this.escala,
            this.dragState.currentY * this.escala,
            15, 0, 2 * Math.PI
        );
        this.ctx.fill();

        // Texto
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.obtenerInicialDinosaurio(this.dragState.dinosaurio),
            this.dragState.currentX * this.escala,
            this.dragState.currentY * this.escala + 4
        );

        this.ctx.restore();
    }



    /**
     * Dibuja los dinosaurios colocados en el tablero
     */
    dibujarDinosauriosColocados() {
        for (const zona of this.zonasInteractivas) {
            if (zona.dinosauriosColocados && zona.dinosauriosColocados.length > 0) {
                this.dibujarDinosauriosEnZona(zona);
            }
        }
    }

    /**
     * Dibuja los dinosaurios en una zona específica
     */
    dibujarDinosauriosEnZona(zona) {
        const dinosaurios = zona.dinosauriosColocados;

        for (let i = 0; i < dinosaurios.length; i++) {
            const dinosaurio = dinosaurios[i];
            let x, y;

            if (zona.forma === 'rectangulo') {
                const espaciado = zona.ancho / (dinosaurios.length + 1);
                x = zona.x - zona.ancho / 2 + espaciado * (i + 1);
                y = zona.y;
            } else {
                x = zona.x;
                y = zona.y;
            }

            this.dibujarDinosaurio(dinosaurio, x, y);
        }
    }

    /**
     * Dibuja un dinosaurio individual
     */
    dibujarDinosaurio(dinosaurio, x, y) {
        this.ctx.save();

        // Sombra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc((x + 1) * this.escala, (y + 1) * this.escala, 12, 0, 2 * Math.PI);
        this.ctx.fill();

        // Dinosaurio
        this.ctx.fillStyle = this.obtenerColorDinosaurio(dinosaurio);
        this.ctx.beginPath();
        this.ctx.arc(x * this.escala, y * this.escala, 12, 0, 2 * Math.PI);
        this.ctx.fill();

        // Borde
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Texto
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.obtenerInicialDinosaurio(dinosaurio),
            x * this.escala,
            y * this.escala + 3
        );

        this.ctx.restore();
    }

    /**
     * Resalta un recinto específico
     */
    resaltarRecinto(recintoId) {
        const zona = this.zonasInteractivas.find(z => z.id === recintoId);
        if (!zona) return;

        this.ctx.save();
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([]);

        if (zona.forma === 'rectangulo') {
            const x = (zona.x - zona.ancho / 2) * this.escala;
            const y = (zona.y - zona.alto / 2) * this.escala;
            const ancho = zona.ancho * this.escala;
            const alto = zona.alto * this.escala;
            this.ctx.strokeRect(x, y, ancho, alto);
        } else if (zona.forma === 'cuadrado') {
            const x = (zona.x - zona.ancho / 2) * this.escala;
            const y = (zona.y - zona.alto / 2) * this.escala;
            const tamaño = zona.ancho * this.escala;
            this.ctx.strokeRect(x, y, tamaño, tamaño);
        }

        this.ctx.restore();
    }

    /**
     * Validación completa de colocación con reglas de Draftosaurus
     */
    validarColocacionCompleta(zonaId, dinosaurio) {
        const zona = this.zonasInteractivas.find(z => z.id === zonaId);
        if (!zona) {
            return { valida: false, mensaje: 'Zona no encontrada' };
        }

        // Validar capacidad
        if (zona.dinosauriosColocados && zona.dinosauriosColocados.length >= zona.maxDinosaurios) {
            return { valida: false, mensaje: 'Contenedor lleno' };
        }

        // Validar restricción del dado
        if (this.restriccionDado && !this.validarRestriccionDado(zonaId, dinosaurio)) {
            return { valida: false, mensaje: 'Restricción del dado no cumplida' };
        }

        // Validar reglas específicas del recinto
        const validacionRecinto = this.validarReglaRecinto(zona, dinosaurio);
        if (!validacionRecinto.valida) {
            return validacionRecinto;
        }

        return { valida: true, mensaje: 'Colocación válida' };
    }

    /**
     * Valida las reglas específicas de cada recinto
     */
    validarReglaRecinto(zona, dinosaurio) {
        switch (zona.regla) {
            case 'MANADA':
                return this.validarReglaManda(zona, dinosaurio);
            case 'REY':
                return this.validarReglaRey(zona, dinosaurio);
            case 'BOSQUE':
                return this.validarReglaBosque(zona, dinosaurio);
            case 'DESIERTO':
                return this.validarReglaDesierto(zona, dinosaurio);
            case 'LAGO':
                return this.validarReglaLago(zona, dinosaurio);
            case 'MONTAÑA':
                return this.validarReglaMontaña(zona, dinosaurio);
            case 'DIVERSIDAD':
                return this.validarReglaDiversidad(zona, dinosaurio);
            default:
                return { valida: true, mensaje: 'Sin restricciones' };
        }
    }

    /**
     * Valida regla de manada (mismo tipo)
     */
    validarReglaManda(zona, dinosaurio) {
        if (!zona.dinosauriosColocados || zona.dinosauriosColocados.length === 0) {
            return { valida: true, mensaje: 'Primera colocación en manada' };
        }

        const primerTipo = zona.dinosauriosColocados[0].familia;
        if (dinosaurio.familia !== primerTipo) {
            return { valida: false, mensaje: 'En la manada solo pueden ir dinosaurios del mismo tipo' };
        }

        return { valida: true, mensaje: 'Tipo compatible con la manada' };
    }

    /**
     * Valida regla del rey (solo T-Rex)
     */
    validarReglaRey(zona, dinosaurio) {
        if (dinosaurio.familia !== 'T-Rex') {
            return { valida: false, mensaje: 'Solo T-Rex puede ir en el recinto del rey' };
        }
        return { valida: true, mensaje: 'T-Rex válido para el recinto del rey' };
    }

    /**
     * Valida regla del bosque (herbívoros)
     */
    validarReglaBosque(zona, dinosaurio) {
        const herbivoros = ['Triceratops', 'Stegosaurus', 'Brontosaurus'];
        if (!herbivoros.includes(dinosaurio.familia)) {
            return { valida: false, mensaje: 'Solo herbívoros pueden ir en el bosque' };
        }
        return { valida: true, mensaje: 'Herbívoro válido para el bosque' };
    }

    /**
     * Valida regla del desierto (carnívoros)
     */
    validarReglaDesierto(zona, dinosaurio) {
        const carnivoros = ['T-Rex', 'Velociraptor', 'Allosaurus'];
        if (!carnivoros.includes(dinosaurio.familia)) {
            return { valida: false, mensaje: 'Solo carnívoros pueden ir en el desierto' };
        }
        return { valida: true, mensaje: 'Carnívoro válido para el desierto' };
    }

    /**
     * Valida regla del lago (acuáticos)
     */
    validarReglaLago(zona, dinosaurio) {
        const acuaticos = ['Spinosaurus', 'Plesiosaur'];
        if (!acuaticos.includes(dinosaurio.familia)) {
            return { valida: false, mensaje: 'Solo dinosaurios acuáticos pueden ir en el lago' };
        }
        return { valida: true, mensaje: 'Dinosaurio acuático válido para el lago' };
    }

    /**
     * Valida regla de la montaña (voladores)
     */
    validarReglaMontaña(zona, dinosaurio) {
        const voladores = ['Pteranodon', 'Quetzalcoatlus'];
        if (!voladores.includes(dinosaurio.familia)) {
            return { valida: false, mensaje: 'Solo dinosaurios voladores pueden ir en la montaña' };
        }
        return { valida: true, mensaje: 'Dinosaurio volador válido para la montaña' };
    }

    /**
     * Valida regla de diversidad (tipos diferentes)
     */
    validarReglaDiversidad(zona, dinosaurio) {
        if (!zona.dinosauriosColocados || zona.dinosauriosColocados.length === 0) {
            return { valida: true, mensaje: 'Primera colocación en diversidad' };
        }

        const tiposExistentes = zona.dinosauriosColocados.map(d => d.familia);
        if (tiposExistentes.includes(dinosaurio.familia)) {
            return { valida: false, mensaje: 'En diversidad no puede haber tipos repetidos' };
        }

        return { valida: true, mensaje: 'Tipo válido para diversidad' };
    }

    /**
     * Valida restricción del dado
     */
    validarRestriccionDado(zonaId, dinosaurio) {
        if (!this.restriccionDado) return true;

        // Implementar validaciones específicas del dado según las reglas de Draftosaurus
        switch (this.restriccionDado.tipo) {
            case 'SOLO_CARNIVOROS':
                return ['T-Rex', 'Velociraptor', 'Allosaurus'].includes(dinosaurio.familia);
            case 'SOLO_HERBIVOROS':
                return ['Triceratops', 'Stegosaurus', 'Brontosaurus'].includes(dinosaurio.familia);
            case 'ZONA_ESPECIFICA':
                return zonaId === this.restriccionDado.zonaPermitida;
            default:
                return true;
        }
    }

    /**
     * Coloca un dinosaurio en una zona
     */
    colocarDinosaurio(zonaId, dinosaurio) {
        const zona = this.zonasInteractivas.find(z => z.id === zonaId);
        if (!zona) return false;

        if (!zona.dinosauriosColocados) {
            zona.dinosauriosColocados = [];
        }

        zona.dinosauriosColocados.push(dinosaurio);
        return true;
    }

    /**
     * Notifica la colocación al sistema principal
     */
    notificarColocacion(zonaId, dinosaurio) {
        const evento = new CustomEvent('dinosaurioColocado', {
            detail: {
                zonaId: zonaId,
                dinosaurio: dinosaurio,
                timestamp: Date.now(),
                recintoId: this.obtenerRecintoIdReal(zonaId)
            }
        });
        document.dispatchEvent(evento);
        
        // También notificar al sistema de UI para feedback visual
        this.mostrarFeedbackColocacion(zonaId, dinosaurio, true);
    }

    /**
     * Obtiene el ID real del recinto de BD desde el contenedor
     */
    obtenerRecintoIdReal(zonaId) {
        const zona = this.zonasInteractivas.find(z => z.id === zonaId);
        return zona ? zona.recintoId : null;
    }

    /**
     * Muestra feedback visual de la colocación
     */
    mostrarFeedbackColocacion(zonaId, dinosaurio, exito) {
        const zona = this.zonasInteractivas.find(z => z.id === zonaId);
        if (!zona) return;

        // Efecto visual en el contenedor
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        
        if (exito) {
            this.ctx.fillStyle = 'rgba(40, 167, 69, 0.6)';
            this.ctx.strokeStyle = '#28a745';
        } else {
            this.ctx.fillStyle = 'rgba(220, 53, 69, 0.6)';
            this.ctx.strokeStyle = '#dc3545';
        }
        
        this.ctx.lineWidth = 4;
        
        if (zona.forma === 'rectangulo') {
            const x = (zona.x - zona.ancho / 2) * this.escala;
            const y = (zona.y - zona.alto / 2) * this.escala;
            const ancho = zona.ancho * this.escala;
            const alto = zona.alto * this.escala;
            
            this.ctx.fillRect(x, y, ancho, alto);
            this.ctx.strokeRect(x, y, ancho, alto);
        } else if (zona.forma === 'cuadrado') {
            const x = (zona.x - zona.ancho / 2) * this.escala;
            const y = (zona.y - zona.alto / 2) * this.escala;
            const tamaño = zona.ancho * this.escala;
            
            this.ctx.fillRect(x, y, tamaño, tamaño);
            this.ctx.strokeRect(x, y, tamaño, tamaño);
        }
        
        this.ctx.restore();
        
        // Limpiar el efecto después de un tiempo
        setTimeout(() => {
            this.renderizar();
        }, 1000);
    }

    /**
     * Obtiene el color de un dinosaurio según su tipo
     */
    obtenerColorDinosaurio(dinosaurio) {
        const colores = {
            'T-Rex': '#ff4444',
            'Triceratops': '#44ff44',
            'Stegosaurus': '#4444ff',
            'Velociraptor': '#ffff44',
            'Brontosaurus': '#ff44ff',
            'Allosaurus': '#44ffff'
        };
        return colores[dinosaurio.familia] || '#888888';
    }

    /**
     * Obtiene la inicial de un dinosaurio
     */
    obtenerInicialDinosaurio(dinosaurio) {
        return dinosaurio.familia ? dinosaurio.familia.charAt(0) : 'D';
    }

    /**
     * Selecciona un dinosaurio
     */
    seleccionarDinosaurio(dinosaurio) {
        this.dinosaurioSeleccionado = dinosaurio;
        console.log('Dinosaurio seleccionado:', dinosaurio);

        const dinoElement = document.getElementById('dino-seleccionado');
        if (dinoElement) {
            dinoElement.textContent = dinosaurio ? dinosaurio.familia : 'Ninguno';
        }
    }

    /**
     * Establece la restricción del dado
     */
    establecerRestriccionDado(restriccion) {
        this.restriccionDado = restriccion;
        console.log('Restricción del dado establecida:', restriccion);
    }

    /**
     * Carga dinosaurios disponibles
     */
    cargarDinosaurios(dinosaurios) {
        this.dinosauriosDisponibles = dinosaurios;
        console.log('Dinosaurios cargados:', dinosaurios.length);
    }

    /**
     * Muestra información de un recinto
     */
    mostrarInfoRecinto(zona) {
        const infoElement = document.getElementById('info-recinto');
        if (infoElement) {
            infoElement.innerHTML = `
                <h4>${zona.nombre}</h4>
                <p><strong>Regla:</strong> ${zona.regla}</p>
                <p><strong>Capacidad:</strong> ${zona.maxDinosaurios}</p>
                <p><strong>Ocupado:</strong> ${zona.dinosauriosColocados ? zona.dinosauriosColocados.length : 0}/${zona.maxDinosaurios}</p>
                <p><strong>Restricción:</strong> ${zona.restriccion}</p>
            `;
        }
    }

    /**
     * Oculta información del recinto
     */
    ocultarInfoRecinto() {
        const infoElement = document.getElementById('info-recinto');
        if (infoElement) {
            infoElement.innerHTML = '<p>Selecciona un recinto para ver su información</p>';
        }
    }

    /**
     * Muestra mensaje de validación
     */
    mostrarMensajeValidacion(mensaje, tipo) {
        console.log(`${tipo === 'error' ? 'ERROR' : 'OK'}: ${mensaje}`);
        
        // Crear notificación visual
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${tipo === 'error' ? '#dc3545' : '#28a745'};
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }

    /**
     * Muestra error en el contenedor
     */
    mostrarErrorEnContenedor(error) {
        if (this.contenedor) {
            this.contenedor.innerHTML = `
                <div style="
                    padding: 40px;
                    text-align: center;
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid rgba(239, 68, 68, 0.3);
                    border-radius: 10px;
                    color: #ef4444;
                    font-family: Arial, sans-serif;
                ">
                    <h3>Error cargando el tablero interactivo</h3>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Revisa la consola del navegador para más detalles.</p>
                    <button onclick="location.reload()" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Recargar página</button>
                </div>
            `;
        }
    }

    /**
     * Redimensiona el canvas
     */
    redimensionar() {
        if (!this.canvas || !this.imagenTablero) return;

        const anchoContenedor = this.contenedor.clientWidth;
        if (anchoContenedor <= 0) return;

        const alturaImagen = (this.imagenTablero.height * anchoContenedor) / this.imagenTablero.width;

        this.canvas.width = anchoContenedor;
        this.canvas.height = alturaImagen;
        this.escala = anchoContenedor / this.imagenTablero.width;

        this.renderizar();
    }

    /**
     * Obtiene el estado actual del tablero
     */
    obtenerEstado() {
        return {
            cursorTracker: this.cursorTracker,
            dragState: this.dragState,
            dinosaurioSeleccionado: this.dinosaurioSeleccionado,
            recintoSeleccionado: this.recintoSeleccionado,
            zonasInteractivas: this.zonasInteractivas,
            restriccionDado: this.restriccionDado,
            dinosauriosDisponibles: this.dinosauriosDisponibles
        };
    }

    /**
     * Limpia el tablero
     */
    limpiarTablero() {
        for (const zona of this.zonasInteractivas) {
            zona.dinosauriosColocados = [];
        }
        this.renderizar();
    }

    /**
     * Destruye el renderizador
     */
    destruir() {
        this.cursorTracker.isTracking = false;
        if (this.contenedor) {
            this.contenedor.innerHTML = '';
        }
    }
}