/**
 * Cinematic Role-Selection Reveal Transition Engine
 * Provides a Netflix-inspired dramatic academic reveal with custom SVGs, light sweep, and brand elevation.
 */

export class CinematicReveal {
    static getSymbols() {
        return {
            student: `
                <svg class="cinematic-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="goldGradS" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFE885"/>
                            <stop offset="50%" stop-color="#C9A227"/>
                            <stop offset="100%" stop-color="#8C6D15"/>
                        </linearGradient>
                        <linearGradient id="blueGradS" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#3182CE"/>
                            <stop offset="100%" stop-color="#102A43"/>
                        </linearGradient>
                        <filter id="glowFilterS" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>
                    <circle cx="80" cy="80" r="74" stroke="url(#goldGradS)" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.45"/>
                    <circle cx="80" cy="80" r="66" stroke="url(#goldGradS)" stroke-width="1" opacity="0.65"/>
                    <path d="M42 122 C58 114 74 117 80 123 C86 117 102 114 118 122 C112 100 98 97 80 102 C62 97 48 100 42 122 Z" fill="url(#blueGradS)" stroke="url(#goldGradS)" stroke-width="1.5"/>
                    <path d="M102 52 C98 41 86 37 74 40 C62 43 56 53 61 64 C66 74 94 72 98 84 C102 96 89 106 77 106 C65 106 57 98 55 88" stroke="url(#goldGradS)" stroke-width="8.5" stroke-linecap="round" fill="none" filter="url(#glowFilterS)"/>
                    <polygon points="80,22 82,28 88,30 82,32 80,38 78,32 72,30 78,28" fill="#FFE885"/>
                </svg>
            `,
            faculty: `
                <svg class="cinematic-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="goldGradF" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFE885"/>
                            <stop offset="50%" stop-color="#D69E2E"/>
                            <stop offset="100%" stop-color="#8C6D15"/>
                        </linearGradient>
                        <filter id="glowFilterF" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>
                    <circle cx="80" cy="80" r="74" stroke="url(#goldGradF)" stroke-width="1.5" stroke-dasharray="3 5" opacity="0.45"/>
                    <circle cx="80" cy="80" r="66" stroke="url(#goldGradF)" stroke-width="1" opacity="0.65"/>
                    <path d="M48 122 C40 92 50 62 68 50 M112 122 C120 92 110 62 92 50" stroke="url(#goldGradF)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
                    <path d="M64 42 L106 42 M64 74 L96 74 M64 42 L64 116" stroke="url(#goldGradF)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glowFilterF)"/>
                    <polygon points="80,18 83,25 90,27 83,30 80,37 77,30 70,27 77,25" fill="#FFE885"/>
                </svg>
            `,
            admin: `
                <svg class="cinematic-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="goldGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFF3C4"/>
                            <stop offset="45%" stop-color="#ECC94B"/>
                            <stop offset="100%" stop-color="#B7791F"/>
                        </linearGradient>
                        <filter id="glowFilterA" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>
                    <path d="M80 18 L126 38 C126 84 104 118 80 136 C56 118 34 84 34 38 Z" stroke="url(#goldGradA)" stroke-width="2" fill="none" opacity="0.6"/>
                    <circle cx="80" cy="80" r="54" stroke="url(#goldGradA)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/>
                    <path d="M80 38 L54 114 M80 38 L106 114 M63 86 L97 86" stroke="url(#goldGradA)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glowFilterA)"/>
                    <circle cx="80" cy="38" r="4" fill="#FFF3C4"/>
                    <polygon points="80,8 83,14 89,16 83,18 80,24 77,18 71,16 77,14" fill="#FFF3C4"/>
                </svg>
            `
        };
    }

    /**
     * Executes the cinematic role transition
     * @param {string} role 'student' | 'faculty' | 'admin'
     * @param {Function} onComplete Callback invoked when transition completes
     */
    static play(role, onComplete) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        const overlay = document.getElementById('cinematic-reveal-overlay');
        const svgWrap = document.getElementById('cinematic-svg-wrap');
        const titleEl = document.getElementById('cinematic-role-title');
        const lightSweep = document.getElementById('cinematic-light-sweep');
        const particlesLayer = document.getElementById('cinematic-particles-layer');

        if (!overlay || !svgWrap || !titleEl) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        const roleConfig = {
            student: {
                title: 'STUDENT',
                accentColor: 'var(--blue-academic)'
            },
            faculty: {
                title: 'FACULTY',
                accentColor: 'var(--navy-deep)'
            },
            admin: {
                title: 'ADMINISTRATOR',
                accentColor: 'var(--gold-accent)'
            }
        };

        const config = roleConfig[role] || roleConfig.student;
        const symbols = this.getSymbols();

        // 1. Inject SVG & Text
        svgWrap.innerHTML = symbols[role] || symbols.student;
        titleEl.textContent = config.title;

        // 2. Generate 12 Cinematic Dust Particles
        if (particlesLayer) {
            particlesLayer.innerHTML = '';
            for (let i = 0; i < 14; i++) {
                const p = document.createElement('div');
                p.className = 'cinematic-particle';
                const left = 15 + Math.random() * 70;
                const top = 20 + Math.random() * 60;
                const size = 3 + Math.random() * 4;
                const duration = 1200 + Math.random() * 600;
                const delay = Math.random() * 300;

                p.style.left = `${left}%`;
                p.style.top = `${top}%`;
                p.style.width = `${size}px`;
                p.style.height = `${size}px`;
                p.style.animation = `cinematicParticleDrift ${duration}ms ease-out ${delay}ms forwards`;
                particlesLayer.appendChild(p);
            }
        }

        // 3. Reset Classes & Start Cinematic Reveal Timeline
        overlay.className = 'cinematic-reveal-overlay cinematic-phase-enter';
        overlay.style.display = 'flex';

        // Stage 1: Symbol Zoom & Illumination (100ms)
        setTimeout(() => {
            overlay.classList.add('cinematic-phase-symbol');
        }, 100);

        // Stage 2: Light Sweep Ray Across Symbol (400ms)
        setTimeout(() => {
            if (lightSweep) {
                lightSweep.classList.remove('sweep-active');
                void lightSweep.offsetWidth; // force reflow
                lightSweep.classList.add('sweep-active');
            }
        }, 420);

        // Stage 3: Role Title & Subtitle Reveal (700ms)
        setTimeout(() => {
            overlay.classList.add('cinematic-phase-text');
        }, 720);

        // Stage 4: Cinematic Screen Dissolve to Login Form (1280ms)
        setTimeout(() => {
            overlay.classList.add('cinematic-phase-exit');
        }, 1280);

        // Stage 5: Final Complete & Handoff to Role Login Form (1550ms)
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.className = 'cinematic-reveal-overlay';
            if (particlesLayer) particlesLayer.innerHTML = '';
            if (typeof onComplete === 'function') onComplete();
        }, 1550);
    }
}
