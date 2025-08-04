/**
 * RENDERIZADOR DE TABLERO INTERACTIVO
 * Renderiza el tablero personalizado con funcionalidad de drag and drop
 * Utiliza la imagen tableroPersonalizado.png como base y hace interactivas las zonas numéricas
 */

export class RenderizadorTableroInteractivo {
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

        // Configuración de zonas interactivas basadas en la imagen del tablero
        this.configurarZonasInteractivas();

        // Iniciar tracking del cursor inmediatamente
        this.iniciarTrackingCursor();
    }

    /**
     * Configura las zonas interactivas del tablero con contenedores específicos
     * Rectangular superior izquierda y cuadrado centro derecha como especificado
     */
    configurarZonasInteractivas() {
        this.zonasInteractivas = [
            // CONTENEDOR RECTANGULAR (superior izquierda) - Para múltiples dinosaurios
            {
                id: 'contenedor-rectangular',
                nombre: 'Contenedor Rectangular',
                posiciones: [
                    { x: 120, y: 180, numero: 1, tipo: 'contenedor' },
                    { x: 160, y: 180, numero: 2, tipo: 'contenedor' },
                    { x: 200, y: 180, numero: 3, tipo: 'contenedor' },
                    { x: 240, y: 180, numero: 4, tipo: 'contenedor' }
                ],
                color: '#9932CC',
                regla: 'CONTENEDOR_MULTIPLE',
                maxDinosaurios: 4,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'rectangulo',
                ancho: 160,
                alto: 80,
                x: 180,
                y: 180
            },

            // CONTENEDOR CUADRADO (centro derecha) - Para un dinosaurio
            {
                id: 'contenedor-cuadrado-centro',
                nombre: 'Contenedor Cuadrado Centro',
                posiciones: [
                    { x: 650, y: 300, numero: 1, tipo: 'contenedor' }
                ],
                color: '#FF8C00',
                regla: 'CONTENEDOR_INDIVIDUAL',
                maxDinosaurios: 1,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'cuadrado',
                ancho: 80,
                alto: 80,
                x: 650,
                y: 300
            },

            // CONTENEDORES CUADRADOS ADICIONALES
            {
                id: 'contenedor-cuadrado-1',
                nombre: 'Contenedor Cuadrado 1',
                posiciones: [
                    { x: 150, y: 350, numero: 1, tipo: 'contenedor' }
                ],
                color: '#4169E1',
                regla: 'CONTENEDOR_INDIVIDUAL',
                maxDinosaurios: 1,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'cuadrado',
                ancho: 60,
                alto: 60,
                x: 150,
                y: 350
            },

            {
                id: 'contenedor-cuadrado-2',
                nombre: 'Contenedor Cuadrado 2',
                posiciones: [
                    { x: 300, y: 450, numero: 1, tipo: 'contenedor' }
                ],
                color: '#DC143C',
                regla: 'CONTENEDOR_INDIVIDUAL',
                maxDinosaurios: 1,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'cuadrado',
                ancho: 60,
                alto: 60,
                x: 300,
                y: 450
            },

            {
                id: 'contenedor-cuadrado-3',
                nombre: 'Contenedor Cuadrado 3',
                posiciones: [
                    { x: 500, y: 200, numero: 1, tipo: 'contenedor' }
                ],
                color: '#228B22',
                regla: 'CONTENEDOR_INDIVIDUAL',
                maxDinosaurios: 1,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'cuadrado',
                ancho: 60,
                alto: 60,
                x: 500,
                y: 200
            },

            {
                id: 'contenedor-cuadrado-4',
                nombre: 'Contenedor Cuadrado 4',
                posiciones: [
                    { x: 750, y: 450, numero: 1, tipo: 'contenedor' }
                ],
                color: '#800080',
                regla: 'CONTENEDOR_INDIVIDUAL',
                maxDinosaurios: 1,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'cuadrado',
                ancho: 60,
                alto: 60,
                x: 750,
                y: 450
            },

            {
                id: 'contenedor-cuadrado-5',
                nombre: 'Contenedor Cuadrado 5',
                posiciones: [
                    { x: 400, y: 350, numero: 1, tipo: 'contenedor' }
                ],
                color: '#FF6347',
                regla: 'CONTENEDOR_INDIVIDUAL',
                maxDinosaurios: 1,
                restriccion: 'CUALQUIER_TIPO',
                forma: 'cuadrado',
                ancho: 60,
                alto: 60,
                x: 400,
                y: 350
            }
        ];
    }

    /**
     * Inicializa el renderizador
     */
    async inicializar() {
        try {
            console.log('Iniciando inicialización del tablero interactivo...');

            // Verificar que el contenedor existe
            if (!this.contenedor) {
                throw new Error('Contenedor no encontrado');
            }
            console.log('Contenedor encontrado:', this.contenedor);

            // Cargar imagen
            console.log('Cargando imagen del tablero...');
            await this.cargarImagenTablero();
            console.log('Imagen cargada exitosamente');

            // Crear canvas
            console.log('Creando canvas...');
            this.crearCanvas();
            console.log('Canvas creado');

            // Configurar eventos
            console.log('Configurando eventos...');
            this.configurarEventos();
            console.log('Eventos configurados');

            // Renderizar
            console.log('Renderizando tablero...');
            this.renderizar();
            console.log('Tablero renderizado');

            console.log('Tablero interactivo inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando tablero interactivo:', error);
            this.mostrarErrorEnContenedor(error);
            throw error;
        }
    }

    /**
     * Muestra un error en el contenedor cuando falla la inicialización
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
                    <h3>❌ Error cargando el tablero interactivo</h3>
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
                    ">🔄 Recargar página</button>
                </div>
            `;
        }
    }

    /**
     * Carga la imagen del tablero personalizado
     */
    async cargarImagenTablero() {
        return new Promise((resolve, reject) => {
            this.imagenTablero = new Image();
            this.imagenTablero.onload = () => {
                console.log('✅ Imagen del tablero cargada:', this.imagenTablero.width, 'x', this.imagenTablero.height);
                resolve();
            };
            this.imagenTablero.onerror = (error) => {
                console.error('❌ Error cargando imagen:', error);
                reject(new Error('No se pudo cargar la imagen del tablero: recursos/img/tableroPersonalizado.png'));
            };

            // Añadir timestamp para evitar cache
            const timestamp = new Date().getTime();
            this.imagenTablero.src = `recursos/img/tableroPersonalizado.png?t=${timestamp}`;
            console.log('📸 Intentando cargar imagen:', this.imagenTablero.src);
        });
    }

    /**
     * Crea el canvas y lo configura
     */
    crearCanvas() {
        // Limpiar contenedor
        this.contenedor.innerHTML = '';

        // Verificar dimensiones del contenedor
        let anchoContenedor = this.contenedor.clientWidth;
        console.log('📏 Ancho del contenedor:', anchoContenedor);

        // Si el contenedor no tiene ancho, usar un valor por defecto
        if (anchoContenedor <= 0) {
            anchoContenedor = 800; // Ancho por defecto
            console.log('⚠️ Usando ancho por defecto:', anchoContenedor);
        }

        // Crear canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'tablero-canvas';
        this.canvas.style.border = '2px solid #28a745';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.cursor = 'pointer';
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        this.canvas.style.display = 'block';

        // Verificar dimensiones de la imagen
        console.log('🖼️ Dimensiones de la imagen:', this.imagenTablero.width, 'x', this.imagenTablero.height);

        // Configurar tamaño del canvas
        const alturaImagen = (this.imagenTablero.height * anchoContenedor) / this.imagenTablero.width;

        this.canvas.width = anchoContenedor;
        this.canvas.height = alturaImagen;

        console.log('🎨 Dimensiones del canvas:', this.canvas.width, 'x', this.canvas.height);

        // Calcular escala
        this.escala = anchoContenedor / this.imagenTablero.width;
        console.log('📐 Escala calculada:', this.escala);

        // Obtener contexto
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }

        // Añadir canvas al contenedor
        this.contenedor.appendChild(this.canvas);
        console.log('✅ Canvas añadido al contenedor');

        // Crear panel de información
        this.crearPanelInformacion();
    }

    /**
     * Crea el panel de información del tablero
     */
    crearPanelInformacion() {
        const panel = document.createElement('div');
        panel.id = 'panel-info-tablero';
        panel.className = 'panel-info-tablero';
        panel.innerHTML = `
            <div class="info-header">
                <h3>🎯 Información del Tablero</h3>
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
        // Eventos básicos
        this.canvas.addEventListener('click', (e) => this.manejarClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.manejarMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.manejarMouseLeave());

        // Eventos de drag & drop
        this.canvas.addEventListener('mousedown', (e) => this.manejarMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.manejarMouseUp(e));

        // Eventos globales para drag & drop
        document.addEventListener('mousemove', (e) => this.manejarDragGlobal(e));
        document.addEventListener('mouseup', (e) => this.manejarDropGlobal(e));

        // Eventos de redimensionamiento
        window.addEventListener('resize', () => this.redimensionar());

        // Prevenir comportamientos por defecto
        this.canvas.addEventListener('dragstart', (e) => e.preventDefault());
        this.canvas.addEventListener('selectstart', (e) => e.preventDefault());
    }

    /**
     * Maneja los clicks en el canvas
     */
    manejarClick(evento) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        // Buscar zona clickeada
        const zonaClickeada = this.obtenerZonaEnPosicion(x, y);

        if (zonaClickeada && this.dinosaurioSeleccionado) {
            // Validar si la colocación es permitida
            const validacion = this.validarColocacion(zonaClickeada.id, this.dinosaurioSeleccionado);

            if (validacion.valida) {
                this.seleccionarRecinto(zonaClickeada.id);
                this.renderizar();
            } else {
                // Mostrar mensaje de error
                this.mostrarMensajeValidacion(validacion.mensaje, 'error');
            }
        }
    }

    /**
     * Maneja el movimiento del mouse
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
     * Obtiene la zona en una posición específica
     */
    obtenerZonaEnPosicion(x, y) {
        for (const zona of this.zonasInteractivas) {
            if (zona.forma === 'rectangulo' || zona.forma === 'cuadrado') {
                // Usar las coordenadas centrales de la zona
                const centroX = zona.x;
                const centroY = zona.y;
                const ancho = zona.ancho;
                const alto = zona.alto;

                if (x >= centroX - ancho / 2 && x <= centroX + ancho / 2 &&
                    y >= centroY - alto / 2 && y <= centroY + alto / 2) {
                    return zona;
                }
            } else {
                // Detección para líneas individuales (círculos)
                for (const posicion of zona.posiciones) {
                    const distancia = Math.sqrt(
                        Math.pow(x - posicion.x, 2) + Math.pow(y - posicion.y, 2)
                    );

                    if (distancia <= 25) { // Radio de detección
                        return zona;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Renderiza el tablero completo
     */
    renderizar() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar imagen de fondo
        this.ctx.drawImage(
            this.imagenTablero,
            0, 0,
            this.canvas.width,
            this.canvas.height
        );

        // Dibujar zonas interactivas
        this.dibujarZonasInteractivas();

        // Dibujar dinosaurios colocados
        this.dibujarDinosauriosColocados();

        // Resaltar recinto seleccionado
        if (this.recintoSeleccionado) {
            this.resaltarRecinto(this.recintoSeleccionado);
        }

        // Dibujar cursor tracker si está activo
        this.dibujarCursorTracker();

        // Dibujar dinosaurio siendo arrastrado
        if (this.dragState.isDragging) {
            this.dibujarDinosaurioArrastrado();
        }
    }

    /**
     * Inicia el sistema de tracking del cursor
     */
    iniciarTrackingCursor() {
        this.cursorTracker.isTracking = true;
        console.log('🎯 Sistema de tracking del cursor iniciado');

        // Listener global para el movimiento del mouse
        document.addEventListener('mousemove', (e) => {
            if (this.cursorTracker.isTracking) {
                this.cursorTracker.x = e.clientX;
                this.cursorTracker.y = e.clientY;
                this.cursorTracker.lastUpdate = Date.now();
            }
        });

        // Listener para cuando el mouse entra al canvas
        if (this.canvas) {
            this.canvas.addEventListener('mouseenter', () => {
                this.cursorTracker.isTracking = true;
            });
        }
    }

    /**
     * Detiene el tracking del cursor
     */
    detenerTrackingCursor() {
        this.cursorTracker.isTracking = false;
        console.log('🛑 Sistema de tracking del cursor detenido');
    }

    /**
     * Obtiene la posición actual del cursor
     */
    obtenerPosicionCursor() {
        return {
            x: this.cursorTracker.x,
            y: this.cursorTracker.y,
            timestamp: this.cursorTracker.lastUpdate
        };
    }

    /**
     * Dibuja el indicador del cursor tracker
     */
    dibujarCursorTracker() {
        if (!this.cursorTracker.isTracking || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (this.cursorTracker.x - rect.left) / this.escala;
        const y = (this.cursorTracker.y - rect.top) / this.escala;

        // Solo dibujar si el cursor está dentro del canvas
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

        console.log('🦕 Iniciando drag de dinosaurio:', dinosaurio);
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
            const validacion = this.validarColocacion(zona.id, this.dragState.dinosaurio);

            if (validacion.valida) {
                this.colocarDinosaurio(zona.id, this.dragState.dinosaurio);
                console.log('✅ Dinosaurio colocado exitosamente en:', zona.nombre);
            } else {
                console.log('❌ Colocación inválida:', validacion.mensaje);
                this.mostrarMensajeValidacion(validacion.mensaje, 'error');
            }
        }

        // Resetear estado de drag
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

        // Dibujar sombra del dinosaurio
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.dragState.currentX + 2) * this.escala,
            (this.dragState.currentY + 2) * this.escala,
            15, 0, 2 * Math.PI
        );
        this.ctx.fill();

        // Dibujar dinosaurio
        this.ctx.fillStyle = this.dragState.dinosaurio.color || '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            this.dragState.currentX * this.escala,
            this.dragState.currentY * this.escala,
            15, 0, 2 * Math.PI
        );
        this.ctx.fill();

        // Dibujar texto del dinosaurio
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.dragState.dinosaurio.tipo || 'D',
            this.dragState.currentX * this.escala,
            this.dragState.currentY * this.escala + 4
        );

        this.ctx.restore();
    }

    /**
     * Dibuja las zonas interactivas
     */
    dibujarZonasInteractivas() {
        for (const zona of this.zonasInteractivas) {
            this.ctx.save();

            if (zona.forma === 'rectangulo') {
                // Dibujar contenedor rectangular
                this.ctx.strokeStyle = zona.color;
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);

                const x = (zona.x - zona.ancho / 2) * this.escala;
                const y = (zona.y - zona.alto / 2) * this.escala;
                const ancho = zona.ancho * this.escala;
                const alto = zona.alto * this.escala;

                this.ctx.strokeRect(x, y, ancho, alto);

                // Dibujar fondo semi-transparente
                this.ctx.fillStyle = zona.color + '20';
                this.ctx.fillRect(x, y, ancho, alto);

            } else if (zona.forma === 'cuadrado') {
                // Dibujar contenedor cuadrado
                this.ctx.strokeStyle = zona.color;
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);

                const x = (zona.x - zona.ancho / 2) * this.escala;
                const y = (zona.y - zona.alto / 2) * this.escala;
                const tamaño = zona.ancho * this.escala;

                this.ctx.strokeRect(x, y, tamaño, tamaño);

                // Dibujar fondo semi-transparente
                this.ctx.fillStyle = zona.color + '20';
                this.ctx.fillRect(x, y, tamaño, tamaño);
            }

            // Dibujar nombre del contenedor
            this.ctx.fillStyle = zona.color;
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                zona.nombre,
                zona.x * this.escala,
                (zona.y - zona.alto / 2 - 10) * this.escala
            );

            this.ctx.restore();
        }
    }

    /**
     * Dibuja los dinosaurios colocados en el tablero
     */
    dibujarDinosauriosColocados() {
        // Implementar cuando tengamos dinosaurios colocados
        // Por ahora, método vacío
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
     * Valida si se puede colocar un dinosaurio en una zona
     */
    validarColocacion(zonaId, dinosaurio) {
        const zona = this.zonasInteractivas.find(z => z.id === zonaId);
        if (!zona) {
            return { valida: false, mensaje: 'Zona no encontrada' };
        }

        // Validaciones básicas
        if (zona.dinosauriosColocados && zona.dinosauriosColocados.length >= zona.maxDinosaurios) {
            return { valida: false, mensaje: 'Contenedor lleno' };
        }

        return { valida: true, mensaje: 'Colocación válida' };
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
     * Selecciona un recinto
     */
    seleccionarRecinto(recintoId) {
        this.recintoSeleccionado = recintoId;
        console.log('🎯 Recinto seleccionado:', recintoId);
    }

    /**
     * Muestra información de un recinto
     */
    mostrarInfoRecinto(zona) {
        const infoElement = document.getElementById('info-recinto');
        if (infoElement) {
            infoElement.innerHTML = `
                <h4>${zona.nombre}</h4>
                <p><strong>Tipo:</strong> ${zona.forma}</p>
                <p><strong>Capacidad:</strong> ${zona.maxDinosaurios}</p>
                <p><strong>Ocupado:</strong> ${zona.dinosauriosColocados ? zona.dinosauriosColocados.length : 0}/${zona.maxDinosaurios}</p>
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
        console.log(`${tipo === 'error' ? '❌' : '✅'} ${mensaje}`);
        // Aquí podrías añadir un toast o notificación visual
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
     * Método público para seleccionar un dinosaurio
     */
    seleccionarDinosaurio(dinosaurio) {
        this.dinosaurioSeleccionado = dinosaurio;
        console.log('🦕 Dinosaurio seleccionado:', dinosaurio);

        const dinoElement = document.getElementById('dino-seleccionado');
        if (dinoElement) {
            dinoElement.textContent = dinosaurio ? dinosaurio.tipo : 'Ninguno';
        }
    }

    /**
     * Maneja el evento mousedown para iniciar drag & drop
     */
    manejarMouseDown(evento) {
        if (!this.dinosaurioSeleccionado) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        // Iniciar drag si hay un dinosaurio seleccionado
        this.iniciarDrag(this.dinosaurioSeleccionado, x, y);
        evento.preventDefault();
    }

    /**
     * Maneja el evento mouseup en el canvas
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
     * Maneja el drag global (fuera del canvas)
     */
    manejarDragGlobal(evento) {
        if (!this.dragState.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        this.actualizarDrag(x, y);
    }

    /**
     * Maneja el drop global (fuera del canvas)
     */
    manejarDropGlobal(evento) {
        if (!this.dragState.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / this.escala;
        const y = (evento.clientY - rect.top) / this.escala;

        this.finalizarDrag(x, y);
    }

    /**
     * Crea un dinosaurio de prueba para testing
     */
    crearDinosaurioPrueba(tipo = 'T-Rex', color = '#ff6b6b') {
        return {
            id: `dino-${Date.now()}`,
            tipo: tipo,
            color: color,
            timestamp: Date.now()
        };
    }

    /**
     * Método de utilidad para simular selección de dinosaurio
     */
    simularSeleccionDinosaurio(tipo = 'T-Rex') {
        const dinosaurio = this.crearDinosaurioPrueba(tipo);
        this.seleccionarDinosaurio(dinosaurio);
        return dinosaurio;
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
                // Distribuir dinosaurios horizontalmente en el rectángulo
                const espaciado = zona.ancho / (dinosaurios.length + 1);
                x = zona.x - zona.ancho / 2 + espaciado * (i + 1);
                y = zona.y;
            } else {
                // Para cuadrados, centrar el dinosaurio
                x = zona.x;
                y = zona.y;
            }

            this.dibujarDinosaurio(dinosaurio, x, y);
        }
    }

    /**
     * Dibuja un dinosaurio individual en una posición específica
     */
    dibujarDinosaurio(dinosaurio, x, y) {
        this.ctx.save();

        // Dibujar sombra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc((x + 1) * this.escala, (y + 1) * this.escala, 12, 0, 2 * Math.PI);
        this.ctx.fill();

        // Dibujar dinosaurio
        this.ctx.fillStyle = dinosaurio.color || '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(x * this.escala, y * this.escala, 12, 0, 2 * Math.PI);
        this.ctx.fill();

        // Dibujar borde
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Dibujar texto del tipo
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            dinosaurio.tipo.charAt(0),
            x * this.escala,
            y * this.escala + 3
        );

        this.ctx.restore();
    }

    /**
     * Limpia todos los dinosaurios del tablero
     */
    limpiarTablero() {
        for (const zona of this.zonasInteractivas) {
            zona.dinosauriosColocados = [];
        }
        this.renderizar();
        console.log('🧹 Tablero limpiado');
    }

    /**
     * Obtiene estadísticas del tablero
     */
    obtenerEstadisticas() {
        let totalDinosaurios = 0;
        let contenedoresOcupados = 0;

        for (const zona of this.zonasInteractivas) {
            if (zona.dinosauriosColocados && zona.dinosauriosColocados.length > 0) {
                totalDinosaurios += zona.dinosauriosColocados.length;
                contenedoresOcupados++;
            }
        }

        return {
            totalDinosaurios,
            contenedoresOcupados,
            totalContenedores: this.zonasInteractivas.length,
            porcentajeOcupacion: (contenedoresOcupados / this.zonasInteractivas.length) * 100
        };
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
            estadisticas: this.obtenerEstadisticas()
        };
    }

    /**
     * Método de debugging para mostrar información del sistema
     */
    debug() {
        console.log('🔍 DEBUG - Estado del Renderizador Tablero Interactivo:');
        console.log('📊 Estadísticas:', this.obtenerEstadisticas());
        console.log('🎯 Cursor Tracker:', this.cursorTracker);
        console.log('🦕 Drag State:', this.dragState);
        console.log('🎮 Dinosaurio Seleccionado:', this.dinosaurioSeleccionado);
        console.log('📍 Recinto Seleccionado:', this.recintoSeleccionado);
        console.log('🏗️ Zonas Interactivas:', this.zonasInteractivas.length);
    }
}