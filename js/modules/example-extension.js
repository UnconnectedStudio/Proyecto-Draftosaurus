/**
 * EJEMPLO DE EXTENSIÓN
 * Muestra cómo crear nuevos managers y extender la funcionalidad
 * Este archivo es solo para referencia y no se carga automáticamente
 */

import { CONFIG } from '../config/app-config.js';

/**
 * Ejemplo de Manager personalizado
 * Demuestra cómo crear nuevos managers siguiendo el patrón establecido
 */
export class ExampleManager {
    constructor() {
        this.managers = {};
        this.isInitialized = false;
        this.customData = new Map();
    }

    /**
     * Inicializa el manager
     */
    async init() {
        try {
            console.log('🔧 Example Manager inicializando...');
            
            // Configuración inicial
            this.setupCustomFeatures();
            
            this.isInitialized = true;
            console.log('✅ Example Manager inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Example Manager:', error);
            throw error;
        }
    }

    /**
     * Establece referencias a otros managers
     */
    setManagers(managers) {
        this.managers = managers;
    }

    /**
     * Configura características personalizadas
     */
    setupCustomFeatures() {
        // Ejemplo: Agregar funcionalidad de estadísticas
        this.trackUserInteractions();
        
        // Ejemplo: Agregar nuevos eventos personalizados
        this.setupCustomEvents();
    }

    /**
     * Rastrea interacciones del usuario
     */
    trackUserInteractions() {
        // Escuchar eventos de la aplicación
        document.addEventListener('action:executed', (e) => {
            this.recordInteraction(e.detail);
        });
    }

    /**
     * Registra una interacción
     */
    recordInteraction(actionData) {
        const timestamp = new Date().toISOString();
        const interaction = {
            ...actionData,
            timestamp,
            sessionId: this.getSessionId()
        };
        
        // Almacenar en memoria (en producción podrías enviarlo a un servidor)
        const interactions = this.customData.get('interactions') || [];
        interactions.push(interaction);
        this.customData.set('interactions', interactions);
        
        console.log('📊 Interacción registrada:', interaction);
    }

    /**
     * Configura eventos personalizados
     */
    setupCustomEvents() {
        // Ejemplo: Evento cuando el usuario permanece mucho tiempo en una pantalla
        this.setupIdleDetection();
        
        // Ejemplo: Evento de preferencias de usuario
        this.setupUserPreferences();
    }

    /**
     * Detecta cuando el usuario está inactivo
     */
    setupIdleDetection() {
        let idleTimer;
        const IDLE_TIME = 30000; // 30 segundos

        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                this.handleUserIdle();
            }, IDLE_TIME);
        };

        // Eventos que resetean el timer
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });

        resetIdleTimer();
    }

    /**
     * Maneja cuando el usuario está inactivo
     */
    handleUserIdle() {
        console.log('😴 Usuario inactivo detectado');
        
        // Emitir evento personalizado
        this.managers.events?.emit('user:idle', {
            timestamp: new Date().toISOString(),
            currentScreen: this.managers.navigation?.currentScreen
        });
        
        // Ejemplo: Mostrar mensaje o pausar animaciones
        this.managers.effects?.pauseAnimations();
    }

    /**
     * Configura preferencias de usuario
     */
    setupUserPreferences() {
        // Ejemplo: Detectar preferencia de tema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        prefersDark.addEventListener('change', (e) => {
            this.handleThemeChange(e.matches ? 'dark' : 'light');
        });
        
        // Aplicar tema inicial
        this.handleThemeChange(prefersDark.matches ? 'dark' : 'light');
    }

    /**
     * Maneja cambios de tema
     */
    handleThemeChange(theme) {
        console.log(`🎨 Tema cambiado a: ${theme}`);
        
        // Emitir evento
        this.managers.events?.emit('theme:changed', { theme });
        
        // Aplicar cambios visuales si es necesario
        document.body.setAttribute('data-theme', theme);
    }

    /**
     * Obtiene o crea un ID de sesión
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('draftosaurus-session-id');
        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('draftosaurus-session-id', sessionId);
        }
        return sessionId;
    }

    /**
     * Obtiene estadísticas de uso
     */
    getUsageStats() {
        const interactions = this.customData.get('interactions') || [];
        
        return {
            totalInteractions: interactions.length,
            sessionId: this.getSessionId(),
            mostUsedAction: this.getMostUsedAction(interactions),
            sessionDuration: this.getSessionDuration(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Obtiene la acción más utilizada
     */
    getMostUsedAction(interactions) {
        const actionCounts = {};
        
        interactions.forEach(interaction => {
            const action = interaction.action || 'unknown';
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });
        
        return Object.keys(actionCounts).reduce((a, b) => 
            actionCounts[a] > actionCounts[b] ? a : b
        ) || 'none';
    }

    /**
     * Calcula la duración de la sesión
     */
    getSessionDuration() {
        const interactions = this.customData.get('interactions') || [];
        if (interactions.length < 2) return 0;
        
        const first = new Date(interactions[0].timestamp);
        const last = new Date(interactions[interactions.length - 1].timestamp);
        
        return last.getTime() - first.getTime();
    }

    /**
     * Exporta datos para análisis
     */
    exportData() {
        return {
            stats: this.getUsageStats(),
            interactions: this.customData.get('interactions') || [],
            preferences: {
                theme: document.body.getAttribute('data-theme'),
                reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            }
        };
    }

    /**
     * Limpia recursos del manager
     */
    destroy() {
        // Limpiar datos
        this.customData.clear();
        
        // Limpiar timers si existen
        // (en este ejemplo no hay timers persistentes que limpiar)
        
        this.isInitialized = false;
        console.log('🧹 Example Manager limpiado');
    }
}

/**
 * EJEMPLO DE USO:
 * 
 * Para usar este manager en la aplicación:
 * 
 * 1. Importar en app.js:
 *    import { ExampleManager } from './modules/example-extension.js';
 * 
 * 2. Agregar al constructor de DraftosaurusApp:
 *    this.managers.example = new ExampleManager();
 * 
 * 3. El manager se inicializará automáticamente con los demás
 * 
 * 4. Acceder desde la consola:
 *    window.DraftosaurusApp.managers.example.getUsageStats()
 */

export default ExampleManager;