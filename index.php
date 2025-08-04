<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draftosaurus</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- CSS Modular -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/effects.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>

<body>
    <!-- Pantalla Principal -->
    <main id="pantalla-principal" class="main-screen">
        <!-- Sección de Información -->
        <section class="info-section">
            <article class="info-panel">
                <header class="info-header">
                    <h1 class="info-title">DRAFTOSAURUS</h1>
                    <h2 class="info-subtitle">El juego de estrategia prehistórico</h2>
                </header>

                <section class="info-description">
                    <p>Draftosaurus es un juego de mesa de estrategia donde los jugadores se convierten en directores de
                        parques de dinosaurios. Utiliza mecánicas de draft (selección de cartas) para crear el zoológico
                        de dinosaurios más impresionante y obtener la mayor puntuación.</p>
                </section>

                <section class="game-features row g-3">
                    <article class="col-md-6">
                        <div class="feature-card card h-100">
                            <div class="card-body text-center">
                                <h3 class="feature-title card-title">Jugadores</h3>
                                <p class="feature-text card-text">2-5 jugadores</p>
                            </div>
                        </div>
                    </article>
                    <article class="col-md-6">
                        <div class="feature-card card h-100">
                            <div class="card-body text-center">
                                <h3 class="feature-title card-title">Duración</h3>
                                <p class="feature-text card-text">10-15 minutos</p>
                            </div>
                        </div>
                    </article>
                    <article class="col-md-6">
                        <div class="feature-card card h-100">
                            <div class="card-body text-center">
                                <h3 class="feature-title card-title">Estrategia</h3>
                                <p class="feature-text card-text">Draft & Colocación</p>
                            </div>
                        </div>
                    </article>
                    <article class="col-md-6">
                        <div class="feature-card card h-100">
                            <div class="card-body text-center">
                                <h3 class="feature-title card-title">Objetivo</h3>
                                <p class="feature-text card-text">Máxima puntuación</p>
                            </div>
                        </div>
                    </article>
                </section>
            </article>
        </section>

        <!-- Panel Lateral -->
        <aside class="side-panel">
            <div class="panel-content">
                <figure class="main-logo">
                    <img src="recursos/img/logoDraftosaurus-titulo-sinfondon.png" alt="Logo Draftosaurus" width="800">
                </figure>
                <figure class="company-logo">
                    <img src="recursos/img/logoEmpresa-sinfondo.png" alt="Logo Empresa">
                </figure>
                <button id="play-button" class="btn-play" data-action="show-options">
                    Jugar
                </button>
            </div>
        </aside>
    </main>

    <!-- Pantalla de Opciones -->
    <section id="options-screen" class="options-screen hidden">
        <div class="options-container">
            <article class="option-card" data-option="1" data-mode="auxiliary">
                <div class="option-content">
                    <figure class="option-image">
                        <img src="recursos/img/auximg.png" alt="Imagen representativa del Modo Auxiliar">
                    </figure>
                    <div class="option-text">
                        <h3>Modo Auxiliar</h3>
                        <p>Calculadora de puntos para diferentes combinaciones</p>
                    </div>
                </div>
            </article>

            <article class="option-card" data-option="2" data-mode="playable">
                <div class="option-content">
                    <figure class="option-image">
                        <img src="recursos/img/jugableLOGO.png" alt="Logo del Modo Jugable">
                    </figure>
                    <div class="option-text">
                        <h3>Modo Jugable</h3>
                        <p>Juega una partida completa con drag & drop interactivo y tracking de cursor</p>
                    </div>
                </div>
            </article>


        </div>

        <nav class="options-navigation">
            <button class="btn-back" data-action="go-back">
                ← Volver
            </button>
        </nav>
    </section>

    <!-- Toast Container -->
    <div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3"></div>

    <!-- Footer -->
    <footer class="app-footer">
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="js/app.js"></script>
</body>

</html>