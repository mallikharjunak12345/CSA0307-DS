/**
 * Cursor-Reactive Ambient Micro-Interactions & 3D Tilt Engine
 * Provides subtle, high-performance, university-grade interactive physics for login screen.
 */

export class CursorEffects {
    constructor() {
        this.container = null;
        this.glowHalo = null;
        this.trailDots = [];
        this.floatingSymbols = [];
        this.active = false;
        this.animationFrameId = null;

        // Pointer tracking
        this.mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.haloPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.isPointerOver = false;
        this.isFinePointer = window.matchMedia('(pointer: fine)').matches;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Hovered card tracking
        this.activeCard = null;
        this.cardTilt = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };
    }

    static init() {
        if (!window.__slmsCursorEffects) {
            window.__slmsCursorEffects = new CursorEffects();
            window.__slmsCursorEffects.setup();
        }
        return window.__slmsCursorEffects;
    }

    setup() {
        this.container = document.getElementById('view-login');
        if (!this.container) return;

        // Check accessibility
        if (this.prefersReducedMotion || !this.isFinePointer) {
            return;
        }

        this.createElements();
        this.bindEvents();
        this.startLoop();
    }

    createElements() {
        // 1. Cursor Glow Halo
        this.glowHalo = document.createElement('div');
        this.glowHalo.className = 'cursor-glow-halo';
        this.glowHalo.id = 'cursor-glow-halo';
        this.container.appendChild(this.glowHalo);

        // 2. Cursor Trail Particles (3 subtle dots)
        const trailContainer = document.createElement('div');
        trailContainer.className = 'cursor-trail-container';
        trailContainer.id = 'cursor-trail-container';

        this.trailDots = [];
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = `cursor-trail-dot trail-dot-${i}`;
            trailContainer.appendChild(dot);
            this.trailDots.push({
                el: dot,
                pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
                speed: 0.18 - (i * 0.04),
                opacity: 0.28 - (i * 0.08)
            });
        }
        this.container.appendChild(trailContainer);

        // 3. Ambient Floating Background Elements
        const floatingBg = document.createElement('div');
        floatingBg.className = 'login-floating-bg';
        floatingBg.id = 'login-floating-bg';

        const symbols = [
            { icon: '📖', x: 8, y: 18, depth: 0.015, size: '1.4rem' },
            { icon: '✦', x: 88, y: 12, depth: -0.02, size: '1.1rem' },
            { icon: '🏛️', x: 92, y: 76, depth: 0.018, size: '1.5rem' },
            { icon: '📜', x: 6, y: 80, depth: -0.014, size: '1.3rem' },
            { icon: '●', x: 22, y: 48, depth: 0.01, size: '0.5rem' },
            { icon: '✦', x: 78, y: 52, depth: -0.012, size: '0.8rem' }
        ];

        this.floatingSymbols = symbols.map(s => {
            const el = document.createElement('div');
            el.className = 'floating-academic-symbol';
            el.innerHTML = s.icon;
            el.style.left = `${s.x}%`;
            el.style.top = `${s.y}%`;
            el.style.fontSize = s.size;
            floatingBg.appendChild(el);
            return { el, depth: s.depth, baseLeft: s.x, baseTop: s.y };
        });

        this.container.insertBefore(floatingBg, this.container.firstChild);
    }

    bindEvents() {
        if (!this.container) return;

        // Container Pointer Move
        this.container.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            this.isPointerOver = true;
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            if (this.glowHalo) this.glowHalo.style.opacity = '1';
            this.trailDots.forEach(d => d.el.style.opacity = String(d.opacity));
        }, { passive: true });

        this.container.addEventListener('pointerleave', () => {
            this.isPointerOver = false;
            if (this.glowHalo) this.glowHalo.style.opacity = '0';
            this.trailDots.forEach(d => d.el.style.opacity = '0');
            this.resetCardTilt();
        });

        // 3D Card Tilt on Role Cards
        const cards = this.container.querySelectorAll('.role-card');
        cards.forEach(card => {
            card.addEventListener('pointerenter', () => {
                this.activeCard = card;
            });

            card.addEventListener('pointermove', (e) => {
                if (e.pointerType !== 'mouse' || this.activeCard !== card) return;
                const rect = card.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const relY = (e.clientY - rect.top) / rect.height;

                // Max tilt ±3.2 degrees
                this.cardTilt.targetX = (0.5 - relY) * 6.4;
                this.cardTilt.targetY = (relX - 0.5) * 6.4;

                // Update spotlight position CSS variables
                card.style.setProperty('--spotlight-x', `${(relX * 100).toFixed(1)}%`);
                card.style.setProperty('--spotlight-y', `${(relY * 100).toFixed(1)}%`);
            }, { passive: true });

            card.addEventListener('pointerleave', () => {
                if (this.activeCard === card) {
                    this.resetCardTilt();
                }
            });
        });
    }

    resetCardTilt() {
        if (this.activeCard) {
            this.activeCard.style.transform = '';
            this.activeCard = null;
        }
        this.cardTilt.targetX = 0;
        this.cardTilt.targetY = 0;
        this.cardTilt.currentX = 0;
        this.cardTilt.currentY = 0;
    }

    startLoop() {
        if (this.active) return;
        this.active = true;

        const updateFrame = () => {
            if (!this.active) return;

            // Check if login view is currently visible
            if (this.container && this.container.style.display !== 'none') {
                this.render();
            }

            this.animationFrameId = requestAnimationFrame(updateFrame);
        };

        this.animationFrameId = requestAnimationFrame(updateFrame);
    }

    stopLoop() {
        this.active = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    render() {
        // 1. Smooth Halo Interpolation (Lerp 0.12)
        this.haloPos.x += (this.mousePos.x - this.haloPos.x) * 0.12;
        this.haloPos.y += (this.mousePos.y - this.haloPos.y) * 0.12;

        if (this.glowHalo && this.isPointerOver) {
            this.glowHalo.style.transform = `translate3d(${this.haloPos.x}px, ${this.haloPos.y}px, 0) translate(-50%, -50%)`;
        }

        // 2. Cursor Trail Follower Dots
        let prevX = this.mousePos.x;
        let prevY = this.mousePos.y;

        for (let i = 0; i < this.trailDots.length; i++) {
            const dot = this.trailDots[i];
            dot.pos.x += (prevX - dot.pos.x) * dot.speed;
            dot.pos.y += (prevY - dot.pos.y) * dot.speed;

            if (this.isPointerOver) {
                dot.el.style.transform = `translate3d(${dot.pos.x}px, ${dot.pos.y}px, 0) translate(-50%, -50%)`;
            }

            prevX = dot.pos.x;
            prevY = dot.pos.y;
        }

        // 3. Card 3D Tilt Interpolation
        if (this.activeCard) {
            this.cardTilt.currentX += (this.cardTilt.targetX - this.cardTilt.currentX) * 0.15;
            this.cardTilt.currentY += (this.cardTilt.targetY - this.cardTilt.currentY) * 0.15;

            const isSelected = this.activeCard.classList.contains('card-selected');
            const scale = isSelected ? 1.02 : 1.0;
            const lift = isSelected ? -4 : -3;

            this.activeCard.style.transform = `translateY(${lift}px) perspective(900px) rotateX(${this.cardTilt.currentX.toFixed(2)}deg) rotateY(${this.cardTilt.currentY.toFixed(2)}deg) scale(${scale})`;
        }

        // 4. Subtle Parallax for Floating Background Symbols
        const deltaCenterX = (this.mousePos.x - window.innerWidth / 2);
        const deltaCenterY = (this.mousePos.y - window.innerHeight / 2);

        for (let i = 0; i < this.floatingSymbols.length; i++) {
            const s = this.floatingSymbols[i];
            const shiftX = (deltaCenterX * s.depth).toFixed(2);
            const shiftY = (deltaCenterY * s.depth).toFixed(2);
            s.el.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
        }

        // 5. Parallax for Split-Screen Showcase Image
        const showcaseBg = this.container.querySelector('.showcase-bg-layer');
        if (showcaseBg && this.isPointerOver) {
            const bgShiftX = (deltaCenterX * -0.007).toFixed(2);
            const bgShiftY = (deltaCenterY * -0.007).toFixed(2);
            showcaseBg.style.transform = `scale(1.04) translate3d(${bgShiftX}px, ${bgShiftY}px, 0)`;
        }
    }
}
