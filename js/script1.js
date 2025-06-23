function handleClick() {
    // Obtiene elementos
    const pantallaPrincipal = document.getElementById('pantalla-principal');
    const botonJugar = document.getElementById('boton-jugar');
    const pantallaOpciones = document.getElementById('pantalla-opciones');
    const texto1 = document.querySelector('.texto1');
    
    // Verifica que los elementos existan
    if (!pantallaPrincipal || !pantallaOpciones) {
        console.error('No se encontraron los elementos necesarios');
        return;
    }
    
    // Aplica borroso a la pantalla principal
    pantallaPrincipal.classList.add('blur');
    
    // Oculta elementos de la pantalla principal con transiciones 
    pantallaPrincipal.style.transition = 'all 0.3s ease';
    pantallaPrincipal.style.opacity = '0.3';
    pantallaPrincipal.style.transform = 'translateY(-50px)';
    
    if (botonJugar) {
        botonJugar.style.transition = 'all 0.3s ease';
        botonJugar.style.opacity = '0';
        botonJugar.style.visibility = 'hidden';
        // Añade clase disabled de Bootstrap
        botonJugar.classList.add('disabled');
    }
    
    if (texto1) {
        texto1.style.transition = 'all 0.3s ease';
        texto1.style.opacity = '0';
    }
    
    // Muestra pantalla de opciones con animación
    setTimeout(() => {
        pantallaOpciones.classList.remove('oculta');
        
        // Añade animación de entrada escalonada a las tarjetas
        const cards = pantallaOpciones.querySelectorAll('.opcion-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(0px)';
                card.style.opacity = '1';
            }, index * 100);
        });
    }, 300);
}

function volverAtras() {
    const pantallaPrincipal = document.getElementById('pantalla-principal');
    const botonJugar = document.getElementById('boton-jugar');
    const pantallaOpciones = document.getElementById('pantalla-opciones');
    const texto1 = document.querySelector('.texto1');
    
    // Añade animación de salida a las tarjetas
    const cards = pantallaOpciones.querySelectorAll('.opcion-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(50px)';
            card.style.opacity = '0';
        }, index * 50);
    });
    
    // Oculta pantalla de opciones
    setTimeout(() => {
        pantallaOpciones.classList.add('oculta');
    }, 300);
    
    // Devuelve a la pantalla principal
    setTimeout(() => {
        // Quita el borroso
        pantallaPrincipal.classList.remove('blur');
        
        setTimeout(() => {
            pantallaPrincipal.style.opacity = '1';
            pantallaPrincipal.style.transform = 'translateY(0)';
            
            if (botonJugar) {
                botonJugar.classList.remove('disabled');
                botonJugar.style.opacity = '1';
                botonJugar.style.visibility = 'visible';
            }
            
            if (texto1) {
                texto1.style.opacity = '1';
            }
        }, 50);
    }, 300);
}

function seleccionarOpcion(opcion) {
    // Añade feedback visual antes de redireccionar
    const cards = document.querySelectorAll('.opcion-card');
    const selectedCard = cards[opcion - 1];
    
    if (selectedCard) {
        // Efecto de selección
        selectedCard.style.border = '3px solid #28a745';
        selectedCard.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
        selectedCard.style.transform = 'scale(1.05)';
        
        // Muestra spinner de carga
        const spinner = document.createElement('span');
        spinner.className = 'spinner-border text-light';
        spinner.style.position = 'absolute';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';
        spinner.style.zIndex = '1000';
        spinner.setAttribute('role', 'status');
        spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
        
        selectedCard.style.position = 'relative';
        selectedCard.appendChild(spinner);
        
        // Desactiva otras tarjetas
        cards.forEach((card, index) => {
            if (index !== opcion - 1) {
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
            }
        });
        
        // Mostrar toast de confirmación
        mostrarToast('Cargando modo seleccionado...', 'info');
    }
    
    // Delay para mostrar el feedback visual antes de redireccionar
    setTimeout(() => {
        if (opcion === 1) {
            // Redireccionar al modo auxiliar
            window.location.href = 'pantallas/modo auxiliar/auxiliar.html';
        } else if (opcion === 2) {
            // Redireccionar al modo jugable
            window.location.href = 'pantallas/modo jugable/jugable.html';
        }
    }, 1000);
}

// Efecto de parallax suave al hacer scroll (solo en pantalla principal)
window.addEventListener('scroll', () => {
    const pantallaPrincipal = document.getElementById('pantalla-principal');
    if (!pantallaPrincipal.classList.contains('blur')) {
        const scrolled = window.pageYOffset;
        const container = document.querySelector('.contenedor');
        if (container) {
            container.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap si existen
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Añade efectos hover mejorados a las tarjetas de características
    const caracteristicas = document.querySelectorAll('.caracteristica');
    caracteristicas.forEach(caracteristica => {
        // Efectos hover mejorados
        caracteristica.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.borderColor = '#f4d03f';
        });
        
        caracteristica.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
            this.style.transform = 'translateY(0) scale(1)';
            this.style.borderColor = '#dcaa68';
        });
    });
    
    // Mejorar las tarjetas de opciones con efectos Bootstrap
    const opcionCards = document.querySelectorAll('.opcion-card');
    opcionCards.forEach(card => {
        // Configurar estado inicial para animaciones
        card.style.transform = 'translateY(30px)';
        card.style.opacity = '0';
        card.style.transition = 'all 0.3s ease';
        
        // Efectos de hover mejorados
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
            this.style.borderColor = '#f4d03f';
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.querySelector('.spinner-border')) { // Solo si no está cargando
                this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                this.style.borderColor = '#dcaa68';
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
    
    // Mejora botón principal con efectos
    const botonJugar = document.getElementById('boton-jugar');
    if (botonJugar) {
        botonJugar.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
        });
        
        botonJugar.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
        });
    }
    
    // Mejora botón volver
    const botonVolver = document.querySelector('.boton-volver');
    if (botonVolver) {
        botonVolver.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.2)';
        });
        
        botonVolver.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    }
});

// Función para mostrar toast
function mostrarToast(mensaje, tipo = 'info') {
    // Crea toast dinámicamente
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('section');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('section');
    toast.className = `toast align-items-center text-bg-${tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <section class="d-flex">
            <section class="toast-body">
                ${mensaje}
            </section>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </section>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Limpia después de que se oculte
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}