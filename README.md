# Draftosaurus - Proyecto Final ITI

## Descripción

**Draftosaurus** es una implementación digital del juego de mesa de estrategia donde los jugadores gestionan parques de dinosaurios. Este proyecto incluye dos modos principales:

1. **Modo Jugable**: Una experiencia interactiva para jugar directamente en formato digital.
2. **Modo Auxiliar**: Una herramienta para gestionar y calcular puntuaciones en partidas físicas del juego.

El proyecto está diseñado para ser visualmente atractivo y funcional en dispositivos de escritorio y móviles.

---

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
prototipo/
│
├── index.html                # Página principal del proyecto
├── css/
│   └── styles.css            # Estilos generales del proyecto
├── js/
│   └── script1.js            # Lógica de la página principal
├── pantallas/
│   ├── modo auxiliar/
│   │   ├── auxiliar.html     # Página del Modo Auxiliar
│   │   ├── css/
│   │   │   └── auxiliar.css  # Estilos específicos del Modo Auxiliar
│   │   └── js/
│   │       └── auxiliar.js   # Lógica del Modo Auxiliar
│   ├── modo jugable/
│       ├── jugable.html      # Página del Modo Jugable
│       ├── css/
│       │   └── jugableStyle.css # Estilos específicos del Modo Jugable
│       └── js/
│           └── jugable.js    # Lógica del Modo Jugable
└── recursos/
    └── img/                  # Imágenes y recursos gráficos
```

---

## Requisitos Previos

1. **Navegador Web**: Se recomienda usar navegadores modernos como Google Chrome, Mozilla Firefox o Microsoft Edge.
2. **Servidor Local**: Para ejecutar el proyecto, se recomienda usar un servidor local como [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) en Visual Studio Code.

---

## Configuración del Proyecto

1. **Clonar el Repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```

2. **Abrir en Visual Studio Code**:
   - Navega a la carpeta del proyecto y ábrela en Visual Studio Code.

3. **Configurar Live Server**:
   - Asegúrate de tener instalado el plugin **Live Server**.
   - Abre el archivo index.html y haz clic derecho para seleccionar **"Open with Live Server"**.

4. **Acceso a las Páginas**:
   - Página principal: `http://localhost:5501/index.html`
   - Modo Auxiliar: `http://localhost:5501/pantallas/modo auxiliar/auxiliar.html`
   - Modo Jugable: `http://localhost:5501/pantallas/modo jugable/jugable.html`

---

## Uso del Proyecto

### Página Principal (`index.html`)

- **Descripción**: Presenta información general sobre el juego Draftosaurus.
- **Opciones**:
  - **Modo Auxiliar**: Redirige a la página para gestionar puntuaciones.
  - **Modo Jugable**: Redirige a la página para jugar en formato digital.

### Modo Auxiliar (`auxiliar.html`)

- **Funciones**:
  - Configurar el número de jugadores.
  - Seleccionar el modo de juego (Clásico, Avanzado, Principiante).
  - Activar y configurar un temporizador por turno.
  - Calcular puntuaciones detalladas por jugador.
  - Mostrar el ganador de la partida.
  - Exportar puntuaciones en formato JSON.

### Modo Jugable (`jugable.html`)

- **Funciones**:
  - Generar dinosaurios dinámicamente.
  - Seleccionar dinosaurios y colocarlos en el tablero.
  - Mezclar dinosaurios disponibles.
  - Reiniciar la partida.
  - Mostrar estadísticas del jugador (puntos, partidas jugadas, nivel).

---

## Personalización

### Estilos
- Los estilos generales están en styles.css.
- Cada modo tiene su propio archivo CSS para personalización:
  - Modo Auxiliar: `pantallas/modo auxiliar/css/auxiliar.css`
  - Modo Jugable: `pantallas/modo jugable/css/jugableStyle.css`

### Scripts
- La lógica principal está en los archivos JavaScript:
  - Página principal: script1.js
  - Modo Auxiliar: `pantallas/modo auxiliar/js/auxiliar.js`
  - Modo Jugable: `pantallas/modo jugable/js/jugable.js`

---

## Recursos Gráficos

Las imágenes utilizadas en el proyecto están en la carpeta img. Incluyen:
- Logos del juego y la empresa.
- Imágenes representativas de los modos.
- Fondo del tablero.

---

## Créditos

Este proyecto fue desarrollado como parte del **Proyecto Final ITI**. Todos los derechos reservados.

