/**
 * Cinematic Portal-Entry & Logout Transition Engine
 * Provides personalized greeting, dynamic role emblems, light sweep,
 * and seamless transformation into the active dashboard layout.
 */

export class CinematicPortal {
    static getTimeGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning';
        if (hour >= 12 && hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }

    static getEmblems() {
        return {
            student: `
                <svg class="portal-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="portalGoldS" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFF3C4"/>
                            <stop offset="50%" stop-color="#ECC94B"/>
                            <stop offset="100%" stop-color="#B7791F"/>
                        </linearGradient>
                        <linearGradient id="portalBlueS" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#3182CE"/>
                            <stop offset="100%" stop-color="#102A43"/>
                        </linearGradient>
                        <filter id="portalGlowS" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>
                    <circle cx="80" cy="80" r="74" stroke="url(#portalGoldS)" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.5"/>
                    <circle cx="80" cy="80" r="66" stroke="url(#portalGoldS)" stroke-width="1" opacity="0.7"/>
                    <path d="M42 122 C58 114 74 117 80 123 C86 117 102 114 118 122 C112 100 98 97 80 102 C62 97 48 100 42 122 Z" fill="url(#portalBlueS)" stroke="url(#portalGoldS)" stroke-width="1.5"/>
                    <path d="M102 52 C98 41 86 37 74 40 C62 43 56 53 61 64 C66 74 94 72 98 84 C102 96 89 106 77 106 C65 106 57 98 55 88" stroke="url(#portalGoldS)" stroke-width="8.5" stroke-linecap="round" fill="none" filter="url(#portalGlowS)"/>
                    <polygon points="80,22 82,28 88,30 82,32 80,38 78,32 72,30 78,28" fill="#FFE885"/>
                </svg>
            `,
            faculty: `
                <svg class="portal-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="portalGoldF" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFF3C4"/>
                            <stop offset="50%" stop-color="#D69E2E"/>
                            <stop offset="100%" stop-color="#8C6D15"/>
                        </linearGradient>
                        <filter id="portalGlowF" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>
                    <circle cx="80" cy="80" r="74" stroke="url(#portalGoldF)" stroke-width="1.5" stroke-dasharray="3 5" opacity="0.5"/>
                    <circle cx="80" cy="80" r="66" stroke="url(#portalGoldF)" stroke-width="1" opacity="0.7"/>
                    <path d="M48 122 C40 92 50 62 68 50 M112 122 C120 92 110 62 92 50" stroke="url(#portalGoldF)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
                    <path d="M64 42 L106 42 M64 74 L96 74 M64 42 L64 116" stroke="url(#portalGoldF)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#portalGlowF)"/>
                    <polygon points="80,18 83,25 90,27 83,30 80,37 77,30 70,27 77,25" fill="#FFE885"/>
                </svg>
            `,
            admin: `
                <svg class="portal-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="portalGoldA" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFF3C4"/>
                            <stop offset="45%" stop-color="#ECC94B"/>
                            <stop offset="100%" stop-color="#B7791F"/>
                        </linearGradient>
                        <filter id="portalGlowA" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>
                    <path d="M80 18 L126 38 C126 84 104 118 80 136 C56 118 34 84 34 38 Z" stroke="url(#portalGoldA)" stroke-width="2" fill="none" opacity="0.6"/>
                    <circle cx="80" cy="80" r="54" stroke="url(#portalGoldA)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/>
                    <path d="M80 38 L54 114 M80 38 L106 114 M63 86 L97 86" stroke="url(#portalGoldA)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#portalGlowA)"/>
                    <circle cx="80" cy="38" r="4" fill="#FFF3C4"/>
                    <polygon points="80,8 83,14 89,16 83,18 80,24 77,18 71,16 77,14" fill="#FFF3C4"/>
                </svg>
            `
        };
    }

    /**
     * Executes the post-login cinematic portal entry transition
     * @param {Object} user Logged in user object
     * @param {Function} onComplete Callback invoked when dashboard should mount
     */
    static playEntry(user, onComplete) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        const overlay = document.getElementById('cinematic-portal-entry-overlay');
        const svgHost = document.getElementById('portal-svg-host');
        const greetingBadge = document.getElementById('portal-greeting-badge');
        const userNameEl = document.getElementById('portal-user-name');
        const roleTag = document.getElementById('portal-role-tag');
        const lightSweep = document.getElementById('portal-light-sweep');
        const particlesLayer = document.getElementById('portal-particles-container');

        if (!overlay || !svgHost || !userNameEl) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        const role = user.role || 'student';
        const roleLabels = {
            student: 'STUDENT PORTAL',
            faculty: 'FACULTY PORTAL',
            admin: 'ADMINISTRATOR PORTAL'
        };

        const greeting = this.getTimeGreeting();
        const emblems = this.getEmblems();

        // 1. Populate dynamic data
        svgHost.innerHTML = emblems[role] || emblems.student;
        if (greetingBadge) greetingBadge.textContent = greeting;
        if (userNameEl) userNameEl.textContent = user.name || 'User';
        if (roleTag) roleTag.textContent = roleLabels[role] || 'ACADEMIC PORTAL';

        // 2. Generate 12 ambient golden particles
        if (particlesLayer) {
            particlesLayer.innerHTML = '';
            for (let i = 0; i < 14; i++) {
                const p = document.createElement('div');
                p.className = 'portal-particle';
                const left = 15 + Math.random() * 70;
                const top = 25 + Math.random() * 55;
                const size = 3 + Math.random() * 4;
                const duration = 1200 + Math.random() * 500;
                const delay = Math.random() * 200;

                p.style.left = `${left}%`;
                p.style.top = `${top}%`;
                p.style.width = `${size}px`;
                p.style.height = `${size}px`;
                p.style.animation = `portalParticleFloat ${duration}ms ease-out ${delay}ms forwards`;
                particlesLayer.appendChild(p);
            }
        }

        // 3. Begin Cinematic Entrance Sequence
        overlay.className = 'cinematic-portal-overlay portal-phase-enter';
        overlay.style.display = 'flex';

        // Stage 1: Emblem Zooms & Illuminates (100ms)
        setTimeout(() => {
            overlay.classList.add('portal-phase-emblem');
        }, 100);

        // Stage 2: Shimmer Light Sweep Across Emblem (380ms)
        setTimeout(() => {
            if (lightSweep) {
                lightSweep.classList.remove('sweep-active');
                void lightSweep.offsetWidth; // force reflow
                lightSweep.classList.add('sweep-active');
            }
        }, 380);

        // Stage 3: Greeting, User Name, and Role Tag Reveal (580ms)
        setTimeout(() => {
            overlay.classList.add('portal-phase-text');
        }, 580);

        // Stage 4: Emblem & Background Morph toward Dashboard (1150ms)
        setTimeout(() => {
            overlay.classList.add('portal-phase-morph');
            if (typeof onComplete === 'function') {
                onComplete();
                this.triggerDashboardStagger();
            }
        }, 1150);

        // Stage 5: Clean up Portal Overlay (1450ms)
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.className = 'cinematic-portal-overlay';
            if (particlesLayer) particlesLayer.innerHTML = '';
        }, 1450);
    }

    /**
     * Staggers sidebar items, hero banner, and stat cards on dashboard load
     */
    static triggerDashboardStagger() {
        const sidebarItems = document.querySelectorAll('#dynamic-sidebar-nav .nav-item');
        sidebarItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-12px)';
            item.style.transition = 'opacity 240ms cubic-bezier(0.4, 0, 0.2, 1), transform 240ms cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 50 + (index * 35));
        });

        const heroBanner = document.querySelector('.academic-hero-banner');
        if (heroBanner) {
            heroBanner.style.opacity = '0';
            heroBanner.style.transform = 'translateY(14px)';
            heroBanner.style.transition = 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                heroBanner.style.opacity = '1';
                heroBanner.style.transform = 'translateY(0)';
            }, 100);
        }

        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            card.style.transition = 'opacity 260ms cubic-bezier(0.4, 0, 0.2, 1), transform 260ms cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 180 + (index * 45));
        });
    }

    /**
     * Fast cinematic reverse fade for logout (< 700ms)
     * @param {Function} onComplete Callback after logout fade completes
     */
    static playLogout(onComplete) {
        const mainApp = document.getElementById('main-app-layout');
        if (mainApp) {
            mainApp.style.transition = 'opacity 280ms ease, transform 280ms ease';
            mainApp.style.opacity = '0';
            mainApp.style.transform = 'scale(0.98)';
        }

        setTimeout(() => {
            if (mainApp) {
                mainApp.style.opacity = '1';
                mainApp.style.transform = 'none';
            }
            if (typeof onComplete === 'function') onComplete();
        }, 280);
    }
}
