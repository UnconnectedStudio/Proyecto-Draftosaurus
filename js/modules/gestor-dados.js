/**
 * GESTOR DE DADOS
 * Maneja la lógica de restricciones del dado en Draftosaurus
 */

export class GestorDados {
    constructor() {
        this.restriccionActual = null;
        this.dadoElement = null;
        this.restriccionesPosibles = [
            {
                codigo: 'BOSQUE',
                nombre: 'Bosque',
                descripcion: 'Solo se puede colocar en recintos del bosque (lado izquierdo)',
                icono: 'Bosque',
                color: '#2d5016'
            },
            {
                codigo: 'PRADERA',
                nombre: 'Pradera', 
                descripcion: 'Solo se puede colocar en recintos de pradera (lado derecho)',
                icono: 'Pradera',
                color: '#4a7c59'
            },
            {
                codigo: 'ZONA_BANOS',
                nombre: 'Zona de Baños',
                descripcion: 'Solo en recintos cerca de la zona de baños',
                icono: 'Baños',
                color: '#1e40af'
            },
            {
                codigo: 'ZONA_COMEDOR',
                nombre: 'Zona de Comedor',
                descripcion: 'Solo en recintos cerca de la zona de comedor',
                icono: 'Comedor',
                color: '#dc2626'
            },
            {
                codigo: 'RECINTO_VACIO',
                nombre: 'Recinto Vacío',
                descripcion: 'Solo en recintos que no tengan ningún dinosaurio',
                icono: 'Vacio',
                color: '#6b7280'
            },
            {
                codigo: 'SIN_TREX',
                nombre: 'Sin T-Rex',
                descripcion: 'Solo en recintos que no tengan un T-Rex',
                icono: 'Sin T-Rex',
                color: '#7c2d12'
            }
        ];
    }

    /**
     * Inicializa el gestor de dados
     */
    inicializar() {
        this.crearElementoDado();
        this.configurarEventos();
        console.log('Gestor de Dados inicializado');
    }

    /**
     * Crea el elemento visual del dado
     */
    crearElementoDado() {
        // Buscar contenedor existente o crear uno nuevo
        let contenedor = document.querySelector('.dado-container');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.className = 'dado-container';
            
            // Insertar en el header del juego
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(contenedor);
            }
        }

        contenedor.innerHTML = `
            <div class="dado-wrapper">
                <div class="dado-visual" id="dado-visual">
                    <div class="dado-cara dado-cara-activa">
                        <div class="dado-icono">Dado</div>
                        <div class="dado-texto">Lanzar Dado</div>
                    </div>
                </div>
                <div class="dado-info" id="dado-info" style="display: none;">
                    <div class="restriccion-titulo"></div>
                    <div class="restriccion-descripcion"></div>
                </div>
                <button class="dado-boton" id="lanzar-dado" type="button">
                    Lanzar Dado
                </button>
            </div>
        `;

        this.dadoElement = document.getElementById('dado-visual');
        this.infoElement = document.getElementById('dado-info');
        this.botonElement = document.getElementById('lanzar-dado');
    }

    /**
     * Configura eventos del dado
     */
    configurarEventos() {
        if (this.botonElement) {
            this.botonElement.addEventListener('click', () => {
                this.lanzarDado();
            });
        }

        // Evento para mostrar/ocultar información
        if (this.dadoElement) {
            this.dadoElement.addEventListener('click', () => {
                this.toggleInfo();
            });
        }
    }

    /**
     * Lanza el dado y obtiene una restricción aleatoria
     */
    async lanzarDado() {
        if (this.dadoElement.classList.contains('lanzando')) {
            return; // Ya se está lanzando
        }

        // Iniciar animación de lanzamiento
        this.iniciarAnimacionLanzamiento();

        // Simular tiempo de lanzamiento
        await this.esperar(2000);

        // Seleccionar restricción aleatoria
        const restriccionAleatoria = this.restriccionesPosibles[
            Math.floor(Math.random() * this.restriccionesPosibles.length)
        ];

        // Aplicar restricción
        this.aplicarRestriccion(restriccionAleatoria);

        // Finalizar animación
        this.finalizarAnimacionLanzamiento();

        console.log('Dado lanzado:', restriccionAleatoria.nombre);
    }

    /**
     * Inicia la animación de lanzamiento del dado
     */
    iniciarAnimacionLanzamiento() {
        this.dadoElement.classList.add('lanzando');
        this.botonElement.disabled = true;
        this.botonElement.textContent = 'Lanzando...';

        // Animación de rotación rápida
        let rotaciones = 0;
        const intervalo = setInterval(() => {
            if (rotaciones >= 20) {
                clearInterval(intervalo);
                return;
            }

            const restriccionTemp = this.restriccionesPosibles[
                Math.floor(Math.random() * this.restriccionesPosibles.length)
            ];
            
            this.actualizarVisualizacionDado(restriccionTemp, true);
            rotaciones++;
        }, 100);
    }

    /**
     * Finaliza la animación de lanzamiento
     */
    finalizarAnimacionLanzamiento() {
        this.dadoElement.classList.remove('lanzando');
        this.botonElement.disabled = false;
        this.botonElement.textContent = 'Nuevo Lanzamiento';
        
        // Mostrar información de la restricción
        this.mostrarInfo();
    }

    /**
     * Aplica una restricción específica
     */
    aplicarRestriccion(restriccion) {
        this.restriccionActual = restriccion;
        this.actualizarVisualizacionDado(restriccion);
        this.actualizarInfoRestriccion(restriccion);
        this.aplicarRestriccionesVisuales(restriccion);
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('dadoLanzado', {
            detail: { restriccion }
        }));
    }

    /**
     * Actualiza la visualización del dado
     */
    actualizarVisualizacionDado(restriccion, esAnimacion = false) {
        const cara = this.dadoElement.querySelector('.dado-cara');
        const icono = cara.querySelector('.dado-icono');
        const texto = cara.querySelector('.dado-texto');

        icono.textContent = restriccion.icono;
        texto.textContent = restriccion.nombre;
        
        if (!esAnimacion) {
            cara.style.backgroundColor = restriccion.color + '20';
            cara.style.borderColor = restriccion.color;
        }
    }

    /**
     * Actualiza la información de la restricción
     */
    actualizarInfoRestriccion(restriccion) {
        const titulo = this.infoElement.querySelector('.restriccion-titulo');
        const descripcion = this.infoElement.querySelector('.restriccion-descripcion');

        titulo.innerHTML = `${restriccion.icono} ${restriccion.nombre}`;
        descripcion.textContent = restriccion.descripcion;
    }

    /**
     * Aplica restricciones visuales a los recintos
     */
    aplicarRestriccionesVisuales(restriccion) {
        // Remover restricciones anteriores
        document.querySelectorAll('.recinto').forEach(recinto => {
            recinto.classList.remove('recinto-permitido', 'recinto-prohibido');
        });

        // Aplicar nuevas restricciones según el código
        const recintos = document.querySelectorAll('.recinto');
        recintos.forEach(recinto => {
            const puedeColocar = this.validarRestriccionRecinto(restriccion, recinto);
            recinto.classList.add(puedeColocar ? 'recinto-permitido' : 'recinto-prohibido');
        });
    }

    /**
     * Valida si se puede colocar en un recinto según la restricción
     */
    validarRestriccionRecinto(restriccion, elementoRecinto) {
        const recintoId = elementoRecinto.dataset.recintoId;
        const reglaCodigo = elementoRecinto.dataset.regla;

        switch (restriccion.codigo) {
            case 'BOSQUE':
                return ['BOSQUE_MISMO', 'TRIO_ARBOREO', 'REY_SELVA'].includes(reglaCodigo);
            
            case 'PRADERA':
                return ['PRADERA_DIFERENTE', 'PRADERA_PAREJAS', 'ISLA_SOLITARIA'].includes(reglaCodigo);
            
            case 'ZONA_BANOS':
                // Recintos del lado derecho (IDs pares o específicos)
                return ['PRADERA_DIFERENTE', 'PRADERA_PAREJAS', 'RIO'].includes(reglaCodigo);
            
            case 'ZONA_COMEDOR':
                // Recintos del lado izquierdo (IDs impares o específicos)
                return ['BOSQUE_MISMO', 'TRIO_ARBOREO', 'REY_SELVA'].includes(reglaCodigo);
            
            case 'RECINTO_VACIO':
                // Verificar si el recinto está vacío
                const dinosauriosColocados = elementoRecinto.querySelectorAll('.dinosaurio-colocado');
                return dinosauriosColocados.length === 0;
            
            case 'SIN_TREX':
                // Verificar si no hay T-Rex en el recinto
                const trexEnRecinto = elementoRecinto.querySelector('.dinosaurio-colocado[data-familia="T-Rex"]');
                return !trexEnRecinto;
            
            default:
                return true;
        }
    }

    /**
     * Muestra/oculta la información del dado
     */
    toggleInfo() {
        if (this.infoElement.style.display === 'none') {
            this.mostrarInfo();
        } else {
            this.ocultarInfo();
        }
    }

    /**
     * Muestra la información del dado
     */
    mostrarInfo() {
        if (this.restriccionActual) {
            this.infoElement.style.display = 'block';
            this.infoElement.classList.add('info-visible');
        }
    }

    /**
     * Oculta la información del dado
     */
    ocultarInfo() {
        this.infoElement.style.display = 'none';
        this.infoElement.classList.remove('info-visible');
    }

    /**
     * Obtiene la restricción actual
     */
    obtenerRestriccionActual() {
        return this.restriccionActual;
    }

    /**
     * Verifica si una colocación es válida según la restricción actual
     */
    esColocacionValida(recintoId, dinosaurioId) {
        if (!this.restriccionActual) {
            return true; // Sin restricción
        }

        const elementoRecinto = document.querySelector(`[data-recinto-id="${recintoId}"]`);
        if (!elementoRecinto) {
            return false;
        }

        return this.validarRestriccionRecinto(this.restriccionActual, elementoRecinto);
    }

    /**
     * Resetea el dado
     */
    resetear() {
        this.restriccionActual = null;
        this.ocultarInfo();
        
        // Resetear visualización
        const cara = this.dadoElement.querySelector('.dado-cara');
        const icono = cara.querySelector('.dado-icono');
        const texto = cara.querySelector('.dado-texto');

        icono.textContent = 'Dado';
        texto.textContent = 'Lanzar Dado';
        cara.style.backgroundColor = '';
        cara.style.borderColor = '';

        // Remover restricciones visuales
        document.querySelectorAll('.recinto').forEach(recinto => {
            recinto.classList.remove('recinto-permitido', 'recinto-prohibido');
        });

        this.botonElement.textContent = 'Lanzar Dado';
    }

    /**
     * Función utilitaria para delays
     */
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destruye el gestor de dados
     */
    destruir() {
        if (this.botonElement) {
            this.botonElement.removeEventListener('click', this.lanzarDado);
        }
        
        const contenedor = document.querySelector('.dado-container');
        if (contenedor) {
            contenedor.remove();
        }

        console.log('Gestor de Dados destruido');
    }
}