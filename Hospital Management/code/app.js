/**
 * Master Application Coordinator
 * Connects UI interactions, authentication, self-registration, Member Directory management, and the Admin Book Requests workflow.
 */

import { LibraryManager } from './services/LibraryManager.js';
import { StorageService } from './services/StorageService.js';
import { AuthService } from './services/AuthService.js';
import { AuditService } from './services/AuditService.js';
import { Transaction } from './models/Transaction.js';
import { Toast } from './ui/Toast.js';
import { Modal } from './ui/Modal.js';
import { Charts } from './ui/Charts.js';
import { CursorEffects } from './ui/CursorEffects.js';
import { CinematicReveal } from './ui/CinematicReveal.js';
import { CinematicPortal } from './ui/CinematicPortal.js';

class App {
    constructor() {
        this.libraryManager = new LibraryManager();
        this.currentView = 'dashboard';
        this.selectedLoginRole = 'admin';
        this.selectedRegisterRole = 'student';
        this.adminRequestRoleFilter = 'all';

        this.init();
    }

    init() {
        Modal.init();
        Toast.init();
        CursorEffects.init();
        this.initTheme();
        this.bindEvents();
        this.checkAuth();
    }

    // ==========================================
    // AUTHENTICATION & REGISTRATION
    // ==========================================

    checkAuth() {
        const currentUser = AuthService.getCurrentUser();
        const loginOverlay = document.getElementById('view-login');
        const registerOverlay = document.getElementById('view-register');
        const mainApp = document.getElementById('main-app-layout');

        if (currentUser) {
            if (loginOverlay) loginOverlay.style.display = 'none';
            if (registerOverlay) registerOverlay.style.display = 'none';
            if (mainApp) mainApp.style.display = 'flex';
            this.updateHeaderUserProfile(currentUser);
            this.renderSidebarForRole(currentUser.role);
            this.navigateTo('dashboard');
        } else {
            if (loginOverlay) loginOverlay.style.display = 'flex';
            if (registerOverlay) registerOverlay.style.display = 'none';
            if (mainApp) mainApp.style.display = 'none';
            this.showAccountSelection(false);
        }
    }

    updateHeaderUserProfile(user) {
        const avatarEl = document.getElementById('header-user-avatar');
        const nameEl = document.getElementById('header-user-name');
        const roleEl = document.getElementById('header-user-role');

        if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) {
            const roleLabels = { admin: 'Administrator', faculty: 'Faculty Member', student: 'Student User' };
            roleEl.textContent = roleLabels[user.role] || user.role;
            roleEl.className = `user-role-badge-display text-${user.role === 'admin' ? 'danger' : (user.role === 'faculty' ? 'warning' : 'primary')}`;
        }
    }

    renderSidebarForRole(role) {
        const navContainer = document.getElementById('dynamic-sidebar-nav');
        if (!navContainer) return;

        let navHTML = '';

        if (role === 'admin') {
            navHTML = `
                <div class="nav-section-title">Core Operations</div>
                <a class="nav-item active" data-view="dashboard">
                    <span class="nav-icon">📊</span><span>Dashboard</span>
                </a>
                <a class="nav-item" data-view="books">
                    <span class="nav-icon">📖</span><span>Books</span>
                </a>
                <a class="nav-item" data-view="members">
                    <span class="nav-icon">👥</span><span>Member Directory</span>
                </a>
                <a class="nav-item" data-view="admin-requests">
                    <span class="nav-icon">📩</span><span>Book Requests</span>
                </a>
                <a class="nav-item" data-view="reservations">
                    <span class="nav-icon">⏳</span><span>Reservations</span>
                </a>
                <a class="nav-item" data-view="issue-return">
                    <span class="nav-icon">🔄</span><span>Issue / Return</span>
                </a>
                <a class="nav-item" data-view="transactions">
                    <span class="nav-icon">📜</span><span>Transactions</span>
                </a>

                <div class="nav-section-title">Administration</div>
                <a class="nav-item" data-view="analytics">
                    <span class="nav-icon">📈</span><span>Analytics</span>
                </a>
                <a class="nav-item" data-view="audit-log">
                    <span class="nav-icon">📋</span><span>Audit Log</span>
                </a>
                <a class="nav-item" data-view="admin-mgmt">
                    <span class="nav-icon">👑</span><span>Admin Management</span>
                </a>
                <a class="nav-item" data-view="settings">
                    <span class="nav-icon">⚙️</span><span>Settings</span>
                </a>
            `;
        } else if (role === 'faculty') {
            navHTML = `
                <div class="nav-section-title">Faculty Portal</div>
                <a class="nav-item active" data-view="dashboard">
                    <span class="nav-icon">📊</span><span>Dashboard</span>
                </a>
                <a class="nav-item" data-view="books">
                    <span class="nav-icon">📖</span><span>Books</span>
                </a>
                <a class="nav-item" data-view="my-requests">
                    <span class="nav-icon">📩</span><span>My Requests</span>
                </a>
                <a class="nav-item" data-view="faculty-loans">
                    <span class="nav-icon">📖</span><span>My Borrowed Books</span>
                </a>
                <a class="nav-item" data-view="reservations">
                    <span class="nav-icon">⏳</span><span>My Reservations</span>
                </a>
                <a class="nav-item" data-view="transactions">
                    <span class="nav-icon">📜</span><span>My Transactions</span>
                </a>

                <div class="nav-section-title">Account</div>
                <a class="nav-item" data-view="profile">
                    <span class="nav-icon">👤</span><span>My Profile</span>
                </a>
            `;
        } else {
            // Student Role
            navHTML = `
                <div class="nav-section-title">Student Library</div>
                <a class="nav-item active" data-view="dashboard">
                    <span class="nav-icon">📊</span><span>Dashboard</span>
                </a>
                <a class="nav-item" data-view="books">
                    <span class="nav-icon">🔍</span><span>Search Books</span>
                </a>
                <a class="nav-item" data-view="my-requests">
                    <span class="nav-icon">📩</span><span>My Requests</span>
                </a>
                <a class="nav-item" data-view="student-books">
                    <span class="nav-icon">📖</span><span>My Borrowed Books</span>
                </a>
                <a class="nav-item" data-view="student-reservations">
                    <span class="nav-icon">⏳</span><span>My Reservations</span>
                </a>
                <a class="nav-item" data-view="student-fines">
                    <span class="nav-icon">💰</span><span>My Fines</span>
                </a>
                <a class="nav-item" data-view="transactions">
                    <span class="nav-icon">📜</span><span>My Transactions</span>
                </a>

                <div class="nav-section-title">Account</div>
                <a class="nav-item" data-view="profile">
                    <span class="nav-icon">👤</span><span>My Profile</span>
                </a>
            `;
        }

        navContainer.innerHTML = navHTML;

        // Bind clicks
        navContainer.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                if (view) this.navigateTo(view);
            });
        });
    }

    // ==========================================
    // THEME & NAVIGATION
    // ==========================================

    initTheme() {
        const theme = this.libraryManager.settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeButtonUI(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.libraryManager.settings.theme = newTheme;
        this.libraryManager.saveAll();
        this.updateThemeButtonUI(newTheme);
        Toast.info(`Switched to ${newTheme} theme`);
    }

    updateThemeButtonUI(theme) {
        const icon = document.getElementById('theme-icon');
        const label = document.getElementById('theme-label');
        if (icon && label) {
            if (theme === 'dark') {
                icon.textContent = '☀️';
                label.textContent = 'Light';
            } else {
                icon.textContent = '🌙';
                label.textContent = 'Dark';
            }
        }
    }

    // ==========================================
    // ACCOUNT SELECTION & ROLE LOGIN FLOWS
    // ==========================================

    selectLoginRole(role, animated = true) {
        this.selectedLoginRole = role;

        const roleConfig = {
            student: {
                icon: '🎓',
                badgeText: 'Student Portal Access',
                title: 'Student Sign In',
                subtitle: 'Enter your student credentials to access loans and catalog',
                usernameLabel: 'Student ID / Email',
                usernamePlaceholder: 'Enter Student ID (e.g. STU001) or email',
                buttonText: 'Sign In to Student Portal',
                demoFillText: 'student / student123',
                institution: 'University Central Library',
                showcaseTitle: 'STUDENT PORTAL',
                quote: 'Course Materials, Loan Tracking & Queue Reservations',
                pill: '● Active Student Membership'
            },
            faculty: {
                icon: '👨‍🏫',
                badgeText: 'Faculty Portal Access',
                title: 'Faculty Sign In',
                subtitle: 'Enter your faculty credentials to access priority reserves',
                usernameLabel: 'Faculty ID / Email',
                usernamePlaceholder: 'Enter Faculty ID (e.g. FAC001) or email',
                buttonText: 'Sign In to Faculty Portal',
                demoFillText: 'faculty / faculty123',
                institution: 'Academic Research Wing',
                showcaseTitle: 'FACULTY PORTAL',
                quote: 'Advancing Academic Research & Instructional Reserves',
                pill: '● Priority Queue & Research Access'
            },
            admin: {
                icon: '🔐',
                badgeText: 'Administrator Secure Access',
                title: 'Administrator Sign In',
                subtitle: 'Enter your administrator credentials to access library operations',
                usernameLabel: 'Admin ID / Username',
                usernamePlaceholder: 'Enter Admin ID (e.g. ADM001) or username',
                buttonText: 'Sign In to Administrator Portal',
                demoFillText: 'admin / admin123',
                institution: 'Central Library Administration',
                showcaseTitle: 'ADMIN PORTAL',
                quote: 'Complete Institutional Control, Approvals & Audits',
                pill: '● Full Administrative Oversight'
            }
        };

        const config = roleConfig[role] || roleConfig.student;

        // Update UI Text & Elements
        const iconEl = document.getElementById('login-role-icon');
        const badgeEl = document.getElementById('login-role-badge-text');
        const titleEl = document.getElementById('login-portal-title');
        const subtitleEl = document.getElementById('login-portal-subtitle');
        const userLabelEl = document.getElementById('label-login-username');
        const userInputEl = document.getElementById('login-username');
        const btnTextEl = document.getElementById('login-btn-text');
        const demoTextEl = document.getElementById('role-demo-btn-text');
        const showcaseInstEl = document.getElementById('showcase-role-institution');
        const showcaseTitleEl = document.getElementById('showcase-role-title');
        const showcaseQuoteEl = document.getElementById('showcase-role-quote');
        const showcasePillEl = document.getElementById('showcase-role-pill');

        if (iconEl) iconEl.textContent = config.icon;
        if (badgeEl) badgeEl.textContent = config.badgeText;
        if (titleEl) titleEl.textContent = config.title;
        if (subtitleEl) subtitleEl.textContent = config.subtitle;
        if (userLabelEl) userLabelEl.textContent = config.usernameLabel;
        if (userInputEl) userInputEl.placeholder = config.usernamePlaceholder;
        if (btnTextEl) btnTextEl.textContent = config.buttonText;
        if (demoTextEl) demoTextEl.textContent = config.demoFillText;
        if (showcaseInstEl) showcaseInstEl.textContent = config.institution;
        if (showcaseTitleEl) showcaseTitleEl.textContent = config.showcaseTitle;
        if (showcaseQuoteEl) showcaseQuoteEl.textContent = config.quote;
        if (showcasePillEl) showcasePillEl.innerHTML = `<span class="pill-dot">●</span> ${config.pill}`;

        const selContainer = document.getElementById('account-selection-screen');
        const roleLogin = document.getElementById('role-login-screen');
        const allCards = document.querySelectorAll('.role-card');

        if (animated) {
            // Temporarily pause cursor physics during cinematic transition
            CursorEffects.init()?.stopLoop?.();

            // Sequence: Highlight clicked card, fade others
            allCards.forEach(c => {
                if (c.dataset.role === role) {
                    c.classList.add('card-selected');
                    c.classList.remove('card-unselected');
                } else {
                    c.classList.add('card-unselected');
                    c.classList.remove('card-selected');
                }
            });

            // Fade selection out
            setTimeout(() => {
                selContainer?.classList.add('selection-hide');
            }, 120);

            // Trigger Cinematic Academic Reveal
            setTimeout(() => {
                CinematicReveal.play(role, () => {
                    if (selContainer) selContainer.style.display = 'none';
                    if (roleLogin) {
                        roleLogin.style.display = 'block';
                        roleLogin.classList.remove('login-panel-exit');
                        roleLogin.classList.remove('login-panel-active');
                        void roleLogin.offsetWidth; // Force reflow
                        roleLogin.classList.add('login-panel-active');
                    }
                    allCards.forEach(c => {
                        c.classList.remove('card-selected');
                        c.classList.remove('card-unselected');
                    });
                    // Focus username field for instant usability
                    userInputEl?.focus();
                });
            }, 220);
        } else {
            if (selContainer) selContainer.style.display = 'none';
            if (roleLogin) {
                roleLogin.style.display = 'block';
                roleLogin.classList.remove('login-panel-exit');
                roleLogin.classList.add('login-panel-active');
            }
        }
    }

    showAccountSelection(animated = true) {
        // Restart cursor physics for account selection screen
        CursorEffects.init()?.startLoop?.();

        const roleLogin = document.getElementById('role-login-screen');
        const selContainer = document.getElementById('account-selection-screen');

        if (animated) {
            if (roleLogin) {
                roleLogin.classList.remove('login-panel-active');
                roleLogin.classList.add('login-panel-exit');
            }

            setTimeout(() => {
                if (roleLogin) {
                    roleLogin.style.display = 'none';
                    roleLogin.classList.remove('login-panel-exit');
                }
                if (selContainer) {
                    selContainer.style.display = 'flex';
                    selContainer.classList.remove('selection-hide');
                    void selContainer.offsetWidth; // Force reflow
                }
                // Clear fields
                const u = document.getElementById('login-username');
                const p = document.getElementById('login-password');
                if (u) u.value = '';
                if (p) p.value = '';
                const err = document.getElementById('login-error-text');
                if (err) err.style.display = 'none';
            }, 200);
        } else {
            if (roleLogin) {
                roleLogin.style.display = 'none';
                roleLogin.classList.remove('login-panel-exit');
                roleLogin.classList.remove('login-panel-active');
            }
            if (selContainer) {
                selContainer.style.display = 'flex';
                selContainer.classList.remove('selection-hide');
            }
            const u = document.getElementById('login-username');
            const p = document.getElementById('login-password');
            if (u) u.value = '';
            if (p) p.value = '';
            const err = document.getElementById('login-error-text');
            if (err) err.style.display = 'none';
        }
    }

    // ==========================================
    // FORGOT PASSWORD MULTI-STEP NAVIGATION
    // ==========================================

    openForgotPassword() {
        const role = this.selectedLoginRole || 'student';
        this.resetState = {
            role: role,
            step: 1,
            user: null,
            code: null,
            countdownTimer: null,
            countdownSeconds: 45
        };

        const config = {
            student: {
                icon: '🎓',
                badge: 'STUDENT PASSWORD RESET',
                idLabel: 'Enter your Student ID *',
                idPlaceholder: 'e.g. STU001',
                backLabel: 'Back to Student Login'
            },
            faculty: {
                icon: '👨‍🏫',
                badge: 'FACULTY PASSWORD RESET',
                idLabel: 'Enter your Faculty ID *',
                idPlaceholder: 'e.g. FAC001',
                backLabel: 'Back to Faculty Login'
            },
            admin: {
                icon: '🔐',
                badge: 'ADMIN PASSWORD RESET',
                idLabel: 'Enter your Admin ID *',
                idPlaceholder: 'e.g. ADM001',
                backLabel: 'Back to Admin Login'
            }
        };

        const c = config[role] || config.student;

        const iconEl = document.getElementById('reset-role-icon');
        const badgeEl = document.getElementById('reset-role-badge');
        const idLabelEl = document.getElementById('label-reset-id');
        const idInputEl = document.getElementById('reset-input-id');
        const backLabelEl = document.getElementById('reset-back-label');
        const successBackLabelEl = document.getElementById('btn-reset-login-label');

        if (iconEl) iconEl.textContent = c.icon;
        if (badgeEl) badgeEl.textContent = c.badge;
        if (idLabelEl) idLabelEl.textContent = c.idLabel;
        if (idInputEl) {
            idInputEl.placeholder = c.idPlaceholder;
            const currentLoginUser = document.getElementById('login-username')?.value;
            idInputEl.value = currentLoginUser || '';
        }
        if (backLabelEl) backLabelEl.textContent = c.backLabel;
        if (successBackLabelEl) successBackLabelEl.textContent = c.backLabel;

        this.goToResetStep(1);

        document.getElementById('view-login').style.display = 'none';
        document.getElementById('view-register').style.display = 'none';
        document.getElementById('view-forgot-password').style.display = 'flex';
    }

    closeForgotPassword() {
        if (this.resetState?.countdownTimer) {
            clearInterval(this.resetState.countdownTimer);
        }
        document.getElementById('view-forgot-password').style.display = 'none';
        document.getElementById('view-login').style.display = 'flex';
        this.selectLoginRole(this.resetState?.role || 'student', false);
    }

    goToResetStep(step) {
        if (!this.resetState) this.resetState = { role: 'student' };
        this.resetState.step = step;

        const stepTitles = {
            1: { title: 'Reset Your Password', subtitle: 'Enter your institutional ID to locate your account' },
            2: { title: 'Verify Your Identity', subtitle: 'Confirm your registered account to send a verification code' },
            3: { title: 'Enter Verification Code', subtitle: 'Enter the 6-digit code to authorize the password reset' },
            4: { title: 'Create New Password', subtitle: 'Choose a strong and secure password for your account' },
            5: { title: 'Password Reset Successful', subtitle: 'Your account credentials have been securely restored' }
        };

        const t = stepTitles[step] || stepTitles[1];
        const titleEl = document.getElementById('reset-step-title');
        const subtitleEl = document.getElementById('reset-step-subtitle');
        if (titleEl) titleEl.textContent = t.title;
        if (subtitleEl) subtitleEl.textContent = t.subtitle;

        // Hide error message
        const errEl = document.getElementById('reset-error-msg');
        if (errEl) errEl.style.display = 'none';

        for (let i = 1; i <= 5; i++) {
            const panel = document.getElementById(`reset-panel-step${i}`);
            if (panel) panel.style.display = (i === step) ? 'block' : 'none';
        }
    }

    startResendCountdown() {
        if (this.resetState?.countdownTimer) {
            clearInterval(this.resetState.countdownTimer);
        }
        let seconds = 45;
        const resendBtn = document.getElementById('btn-resend-code');
        if (!resendBtn) return;

        resendBtn.disabled = true;
        resendBtn.style.cursor = 'not-allowed';
        resendBtn.style.color = 'var(--text-muted)';
        resendBtn.textContent = `Resend code in ${seconds}s`;

        this.resetState.countdownTimer = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(this.resetState.countdownTimer);
                this.resetState.countdownTimer = null;
                resendBtn.disabled = false;
                resendBtn.style.cursor = 'pointer';
                resendBtn.style.color = 'var(--gold-accent)';
                resendBtn.textContent = 'Resend Code';
            } else {
                resendBtn.textContent = `Resend code in ${seconds}s`;
            }
        }, 1000);
    }

    navigateTo(viewId) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            this.checkAuth();
            return;
        }

        // Role Permission Route Protection
        const adminOnlyViews = ['members', 'admin-requests', 'issue-return', 'admin-mgmt', 'settings', 'analytics'];
        if (adminOnlyViews.includes(viewId) && currentUser.role !== 'admin') {
            Toast.error("Access Restricted — Administrator privileges required.");
            return;
        }

        this.currentView = viewId;

        // Update nav items
        document.querySelectorAll('#dynamic-sidebar-nav .nav-item').forEach(item => {
            if (item.getAttribute('data-view') === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all views
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active-view');
        });

        let targetViewId = viewId;
        if (viewId === 'dashboard') {
            if (currentUser.role === 'faculty') targetViewId = 'faculty-dashboard';
            else targetViewId = 'dashboard';
        } else if (viewId === 'faculty-loans') {
            targetViewId = 'faculty-dashboard';
        }

        const targetView = document.getElementById(`view-${targetViewId}`);
        if (targetView) {
            targetView.classList.remove('page-enter-active');
            targetView.classList.add('active-view');
            void targetView.offsetWidth; // Force browser reflow to re-trigger transition animation
            targetView.classList.add('page-enter-active');
        }

        // Close mobile sidebar drawer
        document.getElementById('app-sidebar')?.classList.remove('sidebar-open');
        document.getElementById('sidebar-backdrop')?.classList.remove('active');
        document.body.classList.remove('sidebar-active');

        // Update page title
        const titles = {
            'dashboard': 'Library Dashboard',
            'faculty-dashboard': 'Faculty Library Dashboard',
            'books': currentUser.role === 'admin' ? 'Book Catalog & Inventory' : 'Search Books Catalog',
            'members': 'Member Directory & Access Management',
            'admin-requests': 'Member Book Requests Review',
            'my-requests': 'My Book Borrowing Requests',
            'issue-return': 'Circulation Desk (Direct Issue & Return)',
            'reservations': currentUser.role === 'faculty' ? 'My Reservations' : 'Priority Queue Reservations',
            'transactions': currentUser.role === 'admin' ? 'Circulation Transaction Log' : 'My Transaction History',
            'analytics': 'Library Analytics & Statistics',
            'profile': 'My User Profile',
            'admin-mgmt': 'Admin Management & User Accounts',
            'student-books': 'My Borrowed Books',
            'student-reservations': 'My Reservations',
            'student-fines': 'My Fines & Settlement',
            'audit-log': 'Institutional System Audit Log',
            'settings': 'System Settings & Data'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titles[targetViewId] || 'Smart Library System';

        // Render view data
        this.renderView(targetViewId);
    }

    renderView(viewId) {
        switch (viewId) {
            case 'dashboard':
                this.renderAdminDashboard();
                break;
            case 'faculty-dashboard':
                this.renderFacultyDashboard();
                break;
            case 'books':
                this.renderBooks();
                break;
            case 'members':
                this.renderMembers();
                break;
            case 'admin-requests':
                this.renderAdminRequests();
                break;
            case 'my-requests':
                this.renderMyRequests();
                break;
            case 'issue-return':
                this.renderIssueReturn();
                break;
            case 'reservations':
                this.renderReservations();
                break;
            case 'transactions':
                this.renderTransactions();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'profile':
                this.renderProfile();
                break;
            case 'admin-mgmt':
                this.renderAdminManagement();
                break;
            case 'audit-log':
                this.renderAuditLogs();
                break;
            case 'student-books':
                this.renderStudentBooks();
                break;
            case 'student-reservations':
                this.renderStudentReservations();
                break;
            case 'student-fines':
                this.renderStudentFines();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    // ==========================================
    // 1. ADMIN DASHBOARD VIEW
    // ==========================================

    renderAdminDashboard() {
        const stats = this.libraryManager.getStatistics();
        document.getElementById('stat-total-books').textContent = stats.totalBooksCount;
        document.getElementById('stat-unique-titles').textContent = `${stats.uniqueTitles} unique titles`;
        document.getElementById('stat-available-books').textContent = stats.availableBooksCount;
        document.getElementById('stat-borrowed-books').textContent = stats.borrowedBooksCount;
        document.getElementById('stat-pending-requests').textContent = stats.pendingRequests;
        document.getElementById('stat-active-reservations').textContent = stats.activeReservations;
        document.getElementById('stat-overdue-books').textContent = stats.overdueBooksCount;

        const qaContainer = document.getElementById('quick-actions-container');
        if (qaContainer) {
            qaContainer.innerHTML = `
                <button class="quick-action-btn" id="qa-add-book">
                    <span class="quick-action-icon">➕📖</span><span class="quick-action-label">Add Book</span>
                </button>
                <button class="quick-action-btn" id="qa-register-member">
                    <span class="quick-action-icon">➕👤</span><span class="quick-action-label">Add Member</span>
                </button>
                <button class="quick-action-btn" id="qa-review-requests">
                    <span class="quick-action-icon">📩</span><span class="quick-action-label">Book Requests (${stats.pendingRequests})</span>
                </button>
                <button class="quick-action-btn" id="qa-issue-book">
                    <span class="quick-action-icon">📤</span><span class="quick-action-label">Direct Issue</span>
                </button>
                <button class="quick-action-btn" id="qa-return-book">
                    <span class="quick-action-icon">📥</span><span class="quick-action-label">Return Book</span>
                </button>
                <button class="quick-action-btn" id="qa-reserve-book">
                    <span class="quick-action-icon">⏳</span><span class="quick-action-label">Reserve Book</span>
                </button>
            `;

            qaContainer.querySelector('#qa-add-book')?.addEventListener('click', () => this.openAddBookModal());
            qaContainer.querySelector('#qa-register-member')?.addEventListener('click', () => this.openAddMemberModal());
            qaContainer.querySelector('#qa-review-requests')?.addEventListener('click', () => this.navigateTo('admin-requests'));
            qaContainer.querySelector('#qa-issue-book')?.addEventListener('click', () => this.navigateTo('issue-return'));
            qaContainer.querySelector('#qa-return-book')?.addEventListener('click', () => {
                this.navigateTo('issue-return');
                document.getElementById('tab-return-book')?.click();
            });
            qaContainer.querySelector('#qa-reserve-book')?.addEventListener('click', () => this.openAddReservationModal());
        }

        // Recent Transactions
        const txTbody = document.getElementById('dash-tx-tbody');
        if (txTbody) {
            const recentTx = this.libraryManager.transactions.slice(0, 5);
            if (recentTx.length === 0) {
                txTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No recent transactions</td></tr>`;
            } else {
                txTbody.innerHTML = recentTx.map(tx => {
                    const statusClass = tx.status === 'Active' ? 'badge-warning' : (tx.status === 'Overdue' ? 'badge-danger' : 'badge-success');
                    return `
                        <tr>
                            <td><code>${tx.transactionId}</code></td>
                            <td><strong>${tx.bookTitle}</strong></td>
                            <td>${tx.memberName}</td>
                            <td>${tx.action}</td>
                            <td>${tx.issueDate}</td>
                            <td><span class="badge ${statusClass}">${tx.status}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }

        Charts.renderPopularBooks('dash-popular-books-chart', this.libraryManager.getPopularBooks(4));

        // Priority Queue Snapshot
        const queueContainer = document.getElementById('dash-priority-snapshot');
        if (queueContainer) {
            const topReservations = this.libraryManager.reservationPriorityQueue.getSortedQueue().slice(0, 3);
            if (topReservations.length === 0) {
                queueContainer.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No pending reservations.</p>';
            } else {
                queueContainer.innerHTML = topReservations.map((res, i) => {
                    const badgeClass = res.priority === 1 ? 'badge-faculty' : (res.priority === 2 ? 'badge-scholar' : 'badge-student');
                    const label = res.priority === 1 ? 'Faculty (P1)' : (res.priority === 2 ? 'Scholar (P2)' : 'Student (P3)');
                    return `
                        <div class="heap-service-card" style="margin-bottom: 8px;">
                            <div class="rank-badge">#${i + 1}</div>
                            <div class="card-info">
                                <div class="member-name">${res.userName}</div>
                                <div class="book-title">${res.bookTitle}</div>
                                <span class="badge ${badgeClass}">${label}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // ==========================================
    // 2. STREAMLINED FACULTY DASHBOARD VIEW
    // ==========================================

    renderFacultyDashboard() {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        const welcomeEl = document.getElementById('faculty-welcome-title');
        if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.name}`;

        const member = this.libraryManager.getMemberById(user.id);
        const loans = this.libraryManager.getUserLoans(user.id);
        const reservations = this.libraryManager.getUserReservations(user.id, user.role);
        const requests = this.libraryManager.getUserRequests(user.id, user.role);
        const pendingRequests = requests.filter(r => r.status === 'Pending').length;
        const fine = member ? member.fine : 0;

        document.getElementById('faculty-stat-borrowed').textContent = loans.length;
        document.getElementById('faculty-stat-reservations').textContent = reservations.length;
        document.getElementById('faculty-stat-pending').textContent = pendingRequests;
        document.getElementById('faculty-stat-fine').textContent = `₹${fine}`;

        document.getElementById('fqa-search-books')?.addEventListener('click', () => this.navigateTo('books'));
        document.getElementById('fqa-my-requests')?.addEventListener('click', () => this.navigateTo('my-requests'));
        document.getElementById('fqa-my-loans')?.addEventListener('click', () => {
            const table = document.getElementById('faculty-dash-loans-tbody');
            table?.scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('fqa-reserve-book')?.addEventListener('click', () => this.navigateTo('reservations'));

        const loansTbody = document.getElementById('faculty-dash-loans-tbody');
        if (loansTbody) {
            if (loans.length === 0) {
                loansTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 20px;">No books currently borrowed</td></tr>`;
            } else {
                loansTbody.innerHTML = loans.map(tx => {
                    const book = this.libraryManager.getBookById(tx.bookId);
                    const statusBadge = tx.status === 'Overdue' 
                        ? `<span class="badge badge-danger">Overdue</span>` 
                        : `<span class="badge badge-available">Active (Due: ${tx.dueDate})</span>`;
                    return `
                        <tr>
                            <td><strong>${tx.bookTitle}</strong></td>
                            <td>${book?.author || 'N/A'}</td>
                            <td>${tx.issueDate}</td>
                            <td>${tx.dueDate}</td>
                            <td>${statusBadge}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        const resTbody = document.getElementById('faculty-dash-reservations-tbody');
        if (resTbody) {
            if (reservations.length === 0) {
                resTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding: 20px;">No active reservations</td></tr>`;
            } else {
                resTbody.innerHTML = reservations.map(r => `
                    <tr>
                        <td><strong>${r.bookTitle}</strong></td>
                        <td>${new Date(r.requestTime).toLocaleDateString()}</td>
                        <td><span class="badge badge-faculty">Priority Rank #${this.libraryManager.getQueuePosition(r.reservationId)}</span></td>
                        <td><span class="badge badge-warning">${r.status}</span></td>
                    </tr>
                `).join('');
            }
        }
    }

    // ==========================================
    // 3. BOOK CATALOG & SEARCH VIEW
    // ==========================================

    renderBooks() {
        const currentUser = AuthService.getCurrentUser();

        const addBookBtn = document.getElementById('btn-open-add-book');
        if (addBookBtn) {
            addBookBtn.style.display = currentUser?.role === 'admin' ? 'inline-flex' : 'none';
        }

        const catSelect = document.getElementById('books-category-filter');
        if (catSelect && catSelect.options.length <= 1) {
            const categories = this.libraryManager.getCategories();
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.category;
                opt.textContent = `${c.category} (${c.count})`;
                catSelect.appendChild(opt);
            });
        }

        const query = document.getElementById('books-search-input')?.value || '';
        const category = document.getElementById('books-category-filter')?.value || 'all';
        const availability = document.getElementById('books-availability-filter')?.value || 'all';
        const sortBy = document.getElementById('books-sort-filter')?.value || 'id_asc';

        const filteredBooks = this.libraryManager.smartSearch(query, { category, availability, sortBy });
        const tbody = document.getElementById('books-tbody');
        if (!tbody) return;

        if (filteredBooks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 30px;">No books matching your criteria</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredBooks.map(b => {
            const statusClass = b.availableCopies === 0 ? 'badge-outofstock' : (b.availableCopies < b.totalCopies ? 'badge-partially' : 'badge-available');
            const isAdmin = currentUser?.role === 'admin';

            return `
                <tr>
                    <td><code>#${b.bookId}</code></td>
                    <td><strong>${b.title}</strong></td>
                    <td>${b.author}</td>
                    <td><code>${b.isbn}</code></td>
                    <td><span class="badge badge-info">${b.category}</span></td>
                    <td>${b.location}</td>
                    <td><strong>${b.availableCopies}</strong> / ${b.totalCopies}</td>
                    <td><span class="badge ${statusClass}">${b.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-outline btn-sm btn-view-book" data-id="${b.bookId}" title="View Details">👁️</button>
                            ${isAdmin ? `
                                <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${b.bookId}" title="Edit Book">✏️</button>
                                <button class="btn btn-danger btn-sm btn-delete-book" data-id="${b.bookId}" title="Delete Book">🗑️</button>
                            ` : (b.availableCopies > 0 ? `
                                <button class="btn btn-primary btn-sm btn-quick-request" data-id="${b.bookId}" title="Request to Borrow">📤 Request Book</button>
                            ` : `
                                <button class="btn btn-warning btn-sm btn-quick-reserve" data-id="${b.bookId}" title="Reserve Book (Waitlist)">⏳ Reserve</button>
                            `)}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-view-book').forEach(btn => {
            btn.addEventListener('click', () => {
                const book = this.libraryManager.getBookById(btn.dataset.id);
                if (book) this.showBookDetails(book);
            });
        });

        tbody.querySelectorAll('.btn-edit-book').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!AuthService.requireRole(['admin'])) return;
                const book = this.libraryManager.getBookById(btn.dataset.id);
                if (book) this.openEditBookModal(book);
            });
        });

        tbody.querySelectorAll('.btn-delete-book').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!AuthService.requireRole(['admin'])) return;
                this.confirmDeleteBook(btn.dataset.id);
            });
        });

        tbody.querySelectorAll('.btn-quick-request').forEach(btn => {
            btn.addEventListener('click', () => {
                const book = this.libraryManager.getBookById(btn.dataset.id);
                if (book && currentUser) {
                    try {
                        this.libraryManager.requestBook(currentUser.id, currentUser.role, currentUser.name, book.bookId);
                        Toast.success("Book request submitted successfully. Waiting for admin approval.");
                        this.renderBooks();
                    } catch (e) {
                        Toast.error(e.message);
                    }
                }
            });
        });

        tbody.querySelectorAll('.btn-quick-reserve').forEach(btn => {
            btn.addEventListener('click', () => {
                const book = this.libraryManager.getBookById(btn.dataset.id);
                if (book && currentUser) {
                    try {
                        const res = this.libraryManager.reserveBook(currentUser.id, currentUser.role, currentUser.name, book.bookId);
                        Toast.success(`Book reserved! You are at Queue Position #${res.queuePosition} in the Priority Waitlist.`);
                        this.renderBooks();
                    } catch (e) {
                        Toast.error(e.message);
                    }
                }
            });
        });
    }

    showBookDetails(book) {
        const content = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="font-size: 1.2rem; margin-bottom: 4px;">${book.title}</h4>
                        <span style="color: var(--text-muted); font-size: 0.9rem;">By ${book.author} &bull; Published ${book.publicationYear}</span>
                    </div>
                    <span class="badge ${book.availableCopies > 0 ? 'badge-available' : 'badge-outofstock'}">${book.status}</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--text-muted);">${book.description}</p>
                <div class="form-row-grid" style="background: var(--bg-main); padding: 14px; border-radius: var(--radius-md);">
                    <div><strong>Book ID:</strong> <code>${book.bookId}</code></div>
                    <div><strong>ISBN:</strong> <code>${book.isbn}</code></div>
                    <div><strong>Category:</strong> ${book.category}</div>
                    <div><strong>Shelf Location:</strong> ${book.location}</div>
                    <div><strong>Copies:</strong> ${book.availableCopies} available / ${book.totalCopies} total</div>
                    <div><strong>Total Borrows:</strong> ${book.borrowCount} times</div>
                </div>
            </div>
        `;

        Modal.open({
            title: `📖 Book Details - ID #${book.bookId}`,
            content,
            footer: `<button class="btn btn-secondary" onclick="document.querySelector('.modal-close-btn').click()">Close</button>`,
            size: 'medium'
        });
    }

    openAddBookModal() {
        if (!AuthService.requireRole(['admin'])) return;

        const content = `
            <form id="modal-form-add-book">
                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Book ID (Numeric ID) *</label>
                        <input type="number" class="form-control" name="bookId" required placeholder="e.g. 125">
                    </div>
                    <div class="form-group">
                        <label class="form-label">ISBN *</label>
                        <input type="text" class="form-control" name="isbn" required placeholder="e.g. 978-0131103627">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Book Title *</label>
                    <input type="text" class="form-control" name="title" required placeholder="Title of the book">
                </div>
                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Author(s) *</label>
                        <input type="text" class="form-control" name="author" required placeholder="Author name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category *</label>
                        <input type="text" class="form-control" name="category" required placeholder="e.g. Computer Science">
                    </div>
                </div>
                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Total Copies *</label>
                        <input type="number" class="form-control" name="totalCopies" min="1" value="3" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Shelf Location</label>
                        <input type="text" class="form-control" name="location" value="Shelf CS-12">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Publication Year</label>
                    <input type="number" class="form-control" name="publicationYear" value="2023">
                </div>
            </form>
        `;

        const modalBox = Modal.open({
            title: "➕ Add New Book to Catalog",
            content,
            footer: `
                <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
                <button class="btn btn-primary" id="modal-save-book-btn">Add Book</button>
            `
        });

        modalBox.querySelector('#modal-cancel-btn').addEventListener('click', () => Modal.close());
        modalBox.querySelector('#modal-save-book-btn').addEventListener('click', () => {
            if (!AuthService.requireRole(['admin'])) return;
            const form = modalBox.querySelector('#modal-form-add-book');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const bookData = {
                bookId: Number(formData.get('bookId')),
                isbn: formData.get('isbn'),
                title: formData.get('title'),
                author: formData.get('author'),
                category: formData.get('category'),
                totalCopies: Number(formData.get('totalCopies')),
                availableCopies: Number(formData.get('totalCopies')),
                location: formData.get('location'),
                publicationYear: Number(formData.get('publicationYear'))
            };

            try {
                this.libraryManager.addBook(bookData);
                Toast.success(`Book "${bookData.title}" added to inventory!`);
                Modal.close();
                this.renderBooks();
            } catch (err) {
                Toast.error(err.message);
            }
        });
    }

    openEditBookModal(book) {
        if (!AuthService.requireRole(['admin'])) return;

        const content = `
            <form id="modal-form-edit-book">
                <div class="form-group">
                    <label class="form-label">Book Title *</label>
                    <input type="text" class="form-control" name="title" value="${book.title}" required>
                </div>
                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Author *</label>
                        <input type="text" class="form-control" name="author" value="${book.author}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category *</label>
                        <input type="text" class="form-control" name="category" value="${book.category}" required>
                    </div>
                </div>
                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Total Copies *</label>
                        <input type="number" class="form-control" name="totalCopies" value="${book.totalCopies}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Available Copies *</label>
                        <input type="number" class="form-control" name="availableCopies" value="${book.availableCopies}" min="0" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Shelf Location</label>
                    <input type="text" class="form-control" name="location" value="${book.location}">
                </div>
            </form>
        `;

        const modalBox = Modal.open({
            title: `✏️ Edit Book - ID #${book.bookId}`,
            content,
            footer: `
                <button class="btn btn-secondary" id="modal-edit-cancel">Cancel</button>
                <button class="btn btn-primary" id="modal-edit-save">Save Changes</button>
            `
        });

        modalBox.querySelector('#modal-edit-cancel').addEventListener('click', () => Modal.close());
        modalBox.querySelector('#modal-edit-save').addEventListener('click', () => {
            if (!AuthService.requireRole(['admin'])) return;
            const form = modalBox.querySelector('#modal-form-edit-book');
            const formData = new FormData(form);
            try {
                this.libraryManager.updateBook(book.bookId, {
                    title: formData.get('title'),
                    author: formData.get('author'),
                    category: formData.get('category'),
                    totalCopies: Number(formData.get('totalCopies')),
                    availableCopies: Number(formData.get('availableCopies')),
                    location: formData.get('location')
                });
                Toast.success(`Book #${book.bookId} updated!`);
                Modal.close();
                this.renderBooks();
            } catch (err) {
                Toast.error(err.message);
            }
        });
    }

    confirmDeleteBook(bookId) {
        if (!AuthService.requireRole(['admin'])) return;
        const book = this.libraryManager.getBookById(bookId);
        if (!book) return;

        Modal.confirm({
            title: "Delete Book",
            message: `Are you sure you want to delete <strong>"${book.title}"</strong> (ID #${book.bookId})?`,
            confirmText: "Delete Book",
            confirmClass: "btn-danger",
            onConfirm: () => {
                if (!AuthService.requireRole(['admin'])) return;
                try {
                    this.libraryManager.deleteBook(bookId);
                    Toast.success(`Book #${bookId} removed from inventory.`);
                    this.renderBooks();
                } catch (err) {
                    Toast.error(err.message);
                }
            }
        });
    }

    // ==========================================
    // 4. ADMIN BOOK REQUESTS MANAGEMENT VIEW
    // ==========================================

    renderAdminRequests() {
        if (!AuthService.requireRole(['admin'])) return;

        const tbody = document.getElementById('admin-requests-tbody');
        const badge = document.getElementById('admin-pending-req-badge');
        if (!tbody) return;

        let requests = [...this.libraryManager.requests];
        const pendingCount = requests.filter(r => r.status === 'Pending').length;
        if (badge) badge.textContent = `${pendingCount} Pending`;

        if (this.adminRequestRoleFilter !== 'all') {
            requests = requests.filter(r => r.userRole === this.adminRequestRoleFilter);
        }

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 30px;">No book requests in this category</td></tr>`;
            return;
        }

        tbody.innerHTML = requests.map(req => {
            const roleBadgeClass = req.userRole === 'faculty' ? 'badge-faculty' : 'badge-student';
            const roleLabel = req.userRole === 'faculty' ? 'Faculty' : 'Student';
            
            let statusBadgeClass = 'badge-pending';
            if (req.status === 'Approved') statusBadgeClass = 'badge-approved';
            else if (req.status === 'Rejected') statusBadgeClass = 'badge-rejected';
            else if (req.status === 'Unavailable' || req.status === 'Cancelled') statusBadgeClass = 'badge-unavailable';

            return `
                <tr>
                    <td><code>${req.requestId}</code></td>
                    <td><strong>${req.userName}</strong></td>
                    <td><code>${req.userId}</code></td>
                    <td><span class="badge ${roleBadgeClass}">${roleLabel}</span></td>
                    <td><strong>${req.bookTitle}</strong> (ID #${req.bookId})</td>
                    <td><small>${new Date(req.requestDate).toLocaleString()}</small></td>
                    <td><span class="badge ${statusBadgeClass}">${req.status}</span></td>
                    <td>
                        <div class="table-actions">
                            ${req.status === 'Pending' ? `
                                <button class="btn btn-success btn-sm btn-approve-req" data-id="${req.requestId}">✓ Approve</button>
                                <button class="btn btn-danger btn-sm btn-reject-req" data-id="${req.requestId}">✕ Reject</button>
                            ` : `<small class="text-muted">${req.status}</small>`}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-approve-req').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    this.libraryManager.approveRequest(btn.dataset.id);
                    Toast.success("Book request approved and book issued successfully.");
                    this.renderAdminRequests();
                } catch (err) {
                    Toast.error(err.message);
                    this.renderAdminRequests();
                }
            });
        });

        tbody.querySelectorAll('.btn-reject-req').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    this.libraryManager.rejectRequest(btn.dataset.id);
                    Toast.info("Book request rejected.");
                    this.renderAdminRequests();
                } catch (err) {
                    Toast.error(err.message);
                }
            });
        });
    }

    // ==========================================
    // 5. USER MY REQUESTS VIEW (Student & Faculty)
    // ==========================================

    renderMyRequests() {
        const user = AuthService.getCurrentUser();
        const tbody = document.getElementById('my-requests-tbody');
        if (!tbody || !user) return;

        const requests = this.libraryManager.getUserRequests(user.id, user.role);

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 30px;">You have no book requests submitted.</td></tr>`;
            return;
        }

        tbody.innerHTML = requests.map(req => {
            let statusBadgeClass = 'badge-pending';
            if (req.status === 'Approved') statusBadgeClass = 'badge-approved';
            else if (req.status === 'Rejected') statusBadgeClass = 'badge-rejected';
            else if (req.status === 'Unavailable' || req.status === 'Cancelled') statusBadgeClass = 'badge-unavailable';

            let decisionInfo = '-';
            if (req.status === 'Approved') {
                decisionInfo = `<small class="text-success">Issued: ${req.issueDate}<br>Due: <strong>${req.dueDate}</strong></small>`;
            } else if (req.status === 'Rejected') {
                decisionInfo = `<small class="text-danger">Rejected by Admin</small>`;
            } else if (req.status === 'Unavailable') {
                decisionInfo = `<small class="text-muted">Copies became out of stock</small>`;
            }

            return `
                <tr>
                    <td><code>${req.requestId}</code></td>
                    <td><strong>${req.bookTitle}</strong> (ID #${req.bookId})</td>
                    <td>${new Date(req.requestDate).toLocaleDateString()}</td>
                    <td><span class="badge ${statusBadgeClass}">${req.status}</span></td>
                    <td>${decisionInfo}</td>
                    <td>
                        ${req.status === 'Pending' ? `
                            <button class="btn btn-outline btn-sm btn-cancel-my-req" data-id="${req.requestId}">Cancel</button>
                        ` : `<small class="text-muted">Completed</small>`}
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-cancel-my-req').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    this.libraryManager.cancelRequest(btn.dataset.id, user.id, user.role);
                    Toast.info("Request cancelled.");
                    this.renderMyRequests();
                } catch (e) {
                    Toast.error(e.message);
                }
            });
        });
    }

    // ==========================================
    // 6. MEMBER DIRECTORY VIEW (Admin Only)
    // ==========================================

    renderMembers() {
        if (!AuthService.requireRole(['admin'])) return;

        const query = document.getElementById('members-search-input')?.value || '';
        const typeFilter = document.getElementById('members-type-filter')?.value || 'all';
        const statusFilter = document.getElementById('members-status-filter')?.value || 'all';

        const members = this.libraryManager.smartSearchMembers(query, {
            membershipType: typeFilter,
            status: statusFilter
        });

        const tbody = document.getElementById('members-tbody');
        if (!tbody) return;

        if (members.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 30px;">No members found matching your search criteria</td></tr>`;
            return;
        }

        tbody.innerHTML = members.map(m => {
            const isFaculty = m.membershipType === 'Faculty';
            const badgeClass = isFaculty ? 'badge-faculty' : 'badge-student';
            const roleLabel = isFaculty ? 'Faculty' : 'Student';
            const statusBadgeClass = (m.status || 'Active') === 'Active' ? 'badge-success' : 'badge-danger';
            const yearText = !isFaculty && m.year ? `${m.year} Year` : '-';

            return `
                <tr>
                    <td><code>${m.memberId}</code></td>
                    <td><strong>${m.name}</strong></td>
                    <td><span class="badge ${badgeClass}">${roleLabel}</span></td>
                    <td><small>${m.email}</small></td>
                    <td>${m.department || 'General'}</td>
                    <td>${yearText}</td>
                    <td><span class="badge ${statusBadgeClass}">${m.status || 'Active'}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-outline btn-sm btn-view-member" data-id="${m.memberId}" title="View Member Profile">👁️</button>
                            <button class="btn btn-secondary btn-sm btn-edit-member" data-id="${m.memberId}" title="Edit Member Information">✏️</button>
                            ${m.fine > 0 ? `<button class="btn btn-warning btn-sm btn-pay-fine" data-id="${m.memberId}" title="Settle Fine">💰</button>` : ''}
                            <button class="btn btn-danger btn-sm btn-delete-member" data-id="${m.memberId}" title="Delete Member">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-view-member').forEach(btn => {
            btn.addEventListener('click', () => {
                const member = this.libraryManager.getMemberById(btn.dataset.id);
                if (member) this.showMemberProfile(member);
            });
        });

        tbody.querySelectorAll('.btn-edit-member').forEach(btn => {
            btn.addEventListener('click', () => {
                const member = this.libraryManager.getMemberById(btn.dataset.id);
                if (member) this.openEditMemberModal(member);
            });
        });

        tbody.querySelectorAll('.btn-pay-fine').forEach(btn => {
            btn.addEventListener('click', () => {
                this.payMemberFine(btn.dataset.id);
            });
        });

        tbody.querySelectorAll('.btn-delete-member').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!AuthService.requireRole(['admin'])) return;
                this.confirmDeleteMember(btn.dataset.id);
            });
        });
    }

    openAddMemberModal() {
        if (!AuthService.requireRole(['admin'])) return;

        let selectedType = 'Student';
        let foundUser = null;

        const content = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">1. Select Member Type</label>
                    <select class="form-select" id="admin-add-member-type">
                        <option value="Student" selected>🎒 Student</option>
                        <option value="Faculty">🎓 Faculty</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" id="admin-add-id-label">2. Enter Student ID</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" class="form-control" id="admin-add-member-id" placeholder="e.g. STU001" autocomplete="off" style="font-weight: 600; letter-spacing: 0.5px;">
                        <button type="button" class="btn btn-secondary" id="btn-find-member" style="white-space: nowrap; padding: 0 16px;">
                            🔍 Find Member
                        </button>
                    </div>
                    <small style="color: var(--text-muted); font-size: 0.78rem; margin-top: 4px; display: block;">
                        Auto-searches registered accounts as you type.
                    </small>
                </div>

                <!-- Dynamic Results / Preview Container -->
                <div id="admin-add-member-preview" style="min-height: 80px;">
                    <div style="background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
                        Enter a Student ID or Faculty ID above to locate the registered account.
                    </div>
                </div>
            </div>
        `;

        const modalBox = Modal.open({
            title: "➕ Add Member to Directory",
            content,
            footer: `
                <button class="btn btn-secondary" id="modal-cancel-add-m">Cancel</button>
                <button class="btn btn-primary" id="modal-submit-add-m" disabled>Add to Member Directory</button>
            `
        });

        const typeSelect = modalBox.querySelector('#admin-add-member-type');
        const idLabel = modalBox.querySelector('#admin-add-id-label');
        const idInput = modalBox.querySelector('#admin-add-member-id');
        const findBtn = modalBox.querySelector('#btn-find-member');
        const previewContainer = modalBox.querySelector('#admin-add-member-preview');
        const submitBtn = modalBox.querySelector('#modal-submit-add-m');

        const updateTypeUI = (type) => {
            selectedType = type;
            typeSelect.value = type;
            if (type === 'Faculty') {
                idLabel.textContent = '2. Enter Faculty ID';
                idInput.placeholder = 'e.g. FAC001';
            } else {
                idLabel.textContent = '2. Enter Student ID';
                idInput.placeholder = 'e.g. STU001';
            }
        };

        typeSelect.addEventListener('change', () => {
            updateTypeUI(typeSelect.value);
            performLookup();
        });

        const performLookup = () => {
            const rawInput = idInput.value.trim();
            if (!rawInput) {
                foundUser = null;
                submitBtn.disabled = true;
                previewContainer.innerHTML = `
                    <div style="background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
                        Enter a ${selectedType} ID above to locate the registered account.
                    </div>
                `;
                return;
            }

            // Smart prefix detection
            const upper = rawInput.toUpperCase();
            if (upper.startsWith('STU') && selectedType !== 'Student') {
                updateTypeUI('Student');
            } else if (upper.startsWith('FAC') && selectedType !== 'Faculty') {
                updateTypeUI('Faculty');
            }

            const targetRole = selectedType.toLowerCase();
            const users = AuthService.getUsers();
            const user = users.find(u => 
                (u.id.toLowerCase() === rawInput.toLowerCase() || u.username.toLowerCase() === rawInput.toLowerCase()) &&
                u.role.toLowerCase() === targetRole
            );

            if (!user) {
                foundUser = null;
                submitBtn.disabled = true;
                const roleLabel = selectedType === 'Faculty' ? 'Faculty ID' : 'Student ID';
                previewContainer.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 16px;">
                        <div style="color: var(--danger); font-weight: 700; font-size: 0.92rem; margin-bottom: 4px;">
                            ✕ No ${selectedType.toLowerCase()} account found with ${roleLabel} ${rawInput}.
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.82rem;">
                            The ${selectedType.toLowerCase()} member must register an account before being added to the Member Directory.
                        </div>
                    </div>
                `;
                return;
            }

            // Check if already in Member Directory
            const existingMember = this.libraryManager.getMemberById(user.id);
            if (existingMember) {
                foundUser = null;
                submitBtn.disabled = true;
                previewContainer.innerHTML = `
                    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 16px;">
                        <div style="color: var(--warning); font-weight: 700; font-size: 0.92rem; margin-bottom: 6px;">
                            ⚠️ This member is already in the Member Directory.
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-main); display: flex; flex-direction: column; gap: 4px;">
                            <div><strong>ID:</strong> <code>${user.id}</code> &bull; <strong>Name:</strong> ${user.name}</div>
                            <div><strong>Department:</strong> ${user.department || 'General'} &bull; <strong>Status:</strong> ${existingMember.status || 'Active'}</div>
                        </div>
                    </div>
                `;
                return;
            }

            // User Found & Not Yet Enrolled -> Display Read-Only Preview Card
            foundUser = user;
            submitBtn.disabled = false;
            const badgeClass = user.role === 'faculty' ? 'badge-faculty' : 'badge-student';

            previewContainer.innerHTML = `
                <div class="member-found-preview" style="background: var(--bg-card); border: 1px solid rgba(46, 125, 50, 0.4); border-left: 4px solid var(--status-approved); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        <div style="color: var(--status-approved); font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                            <span>✓</span> <span>${selectedType} Found</span>
                        </div>
                        <span class="badge ${badgeClass}">${selectedType}</span>
                    </div>

                    <div class="form-row-grid" style="font-size: 0.88rem; gap: 10px;">
                        <div><strong style="color: var(--text-muted);">${selectedType} ID:</strong> <code>${user.id}</code></div>
                        <div><strong style="color: var(--text-muted);">Full Name:</strong> <strong>${user.name}</strong></div>
                        <div><strong style="color: var(--text-muted);">Email:</strong> ${user.email}</div>
                        <div><strong style="color: var(--text-muted);">Phone:</strong> ${user.phone || 'N/A'}</div>
                        <div><strong style="color: var(--text-muted);">Department:</strong> ${user.department || 'General'}</div>
                        ${user.role === 'student' ? `<div><strong style="color: var(--text-muted);">Academic Year:</strong> ${user.year || '1'} Year</div>` : ''}
                    </div>
                </div>
            `;
        };

        // Debounce auto-search while typing
        let debounceTimer = null;
        idInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(performLookup, 250);
        });

        findBtn.addEventListener('click', performLookup);
        idInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performLookup();
            }
        });

        modalBox.querySelector('#modal-cancel-add-m').addEventListener('click', () => Modal.close());
        submitBtn.addEventListener('click', () => {
            if (!foundUser) return;

            try {
                this.libraryManager.addMemberFromUser(foundUser.id, foundUser.role);
                Toast.success(`Member ${foundUser.id} added to Member Directory successfully.`);
                Modal.close();
                this.renderMembers();
                if (this.currentView === 'dashboard') this.renderAdminDashboard();
            } catch (err) {
                Toast.error(err.message);
            }
        });
    }

    openEditMemberModal(member) {
        if (!AuthService.requireRole(['admin'])) return;

        const isStudent = member.membershipType === 'Student';

        const content = `
            <form id="modal-form-edit-member">
                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">${isStudent ? 'Student ID' : 'Faculty ID'} (Read-Only)</label>
                        <input type="text" class="form-control" value="${member.memberId}" disabled style="opacity: 0.7;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Member Type (Read-Only)</label>
                        <input type="text" class="form-control" value="${member.membershipType}" disabled style="opacity: 0.7;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control" name="name" value="${member.name}" required>
                </div>

                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Email Address *</label>
                        <input type="email" class="form-control" name="email" value="${member.email}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number *</label>
                        <input type="tel" class="form-control" name="phone" value="${member.phone}" required>
                    </div>
                </div>

                <div class="form-row-grid">
                    <div class="form-group">
                        <label class="form-label">Department *</label>
                        <input type="text" class="form-control" name="department" value="${member.department || ''}" required>
                    </div>
                    ${isStudent ? `
                        <div class="form-group">
                            <label class="form-label">Academic Year *</label>
                            <select class="form-select" name="year">
                                <option value="1" ${member.year === '1' ? 'selected' : ''}>1st Year</option>
                                <option value="2" ${member.year === '2' ? 'selected' : ''}>2nd Year</option>
                                <option value="3" ${member.year === '3' ? 'selected' : ''}>3rd Year</option>
                                <option value="4" ${member.year === '4' ? 'selected' : ''}>4th Year</option>
                            </select>
                        </div>
                    ` : `
                        <div class="form-group">
                            <label class="form-label">Account Status</label>
                            <select class="form-select" name="status">
                                <option value="Active" ${(member.status || 'Active') === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                    `}
                </div>

                ${isStudent ? `
                    <div class="form-group">
                        <label class="form-label">Account Status</label>
                        <select class="form-select" name="status">
                            <option value="Active" ${(member.status || 'Active') === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                ` : ''}
            </form>
        `;

        const modalBox = Modal.open({
            title: `✏️ Edit Member - ${member.memberId}`,
            content,
            footer: `
                <button class="btn btn-secondary" id="modal-cancel-edit-m">Cancel</button>
                <button class="btn btn-primary" id="modal-save-edit-m">Save Changes</button>
            `
        });

        modalBox.querySelector('#modal-cancel-edit-m').addEventListener('click', () => Modal.close());
        modalBox.querySelector('#modal-save-edit-m').addEventListener('click', () => {
            const form = modalBox.querySelector('#modal-form-edit-member');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const updatedFields = {
                name: formData.get('name').trim(),
                email: formData.get('email').trim().toLowerCase(),
                phone: formData.get('phone').trim(),
                department: formData.get('department').trim(),
                status: formData.get('status')
            };
            if (isStudent) {
                updatedFields.year = formData.get('year');
            }

            try {
                this.libraryManager.updateMember(member.memberId, updatedFields);
                Toast.success(`Member ${member.memberId} updated successfully!`);
                Modal.close();
                this.renderMembers();
            } catch (err) {
                Toast.error(err.message);
            }
        });
    }

    showMemberProfile(member) {
        const isFaculty = member.membershipType === 'Faculty';
        const loans = this.libraryManager.getUserLoans(member.memberId);
        const requests = this.libraryManager.getUserRequests(member.memberId, member.membershipType.toLowerCase());
        const reservations = this.libraryManager.getUserReservations(member.memberId, member.membershipType.toLowerCase());

        const content = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="width: 52px; height: 52px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #fff;">👤</div>
                    <div>
                        <h4 style="font-size: 1.2rem; margin-bottom: 2px;">${member.name}</h4>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="badge ${isFaculty ? 'badge-faculty' : 'badge-student'}">${member.membershipType}</span>
                            <span class="badge ${(member.status || 'Active') === 'Active' ? 'badge-success' : 'badge-danger'}">${member.status || 'Active'}</span>
                        </div>
                    </div>
                </div>

                <div class="form-row-grid" style="background: var(--bg-main); padding: 14px; border-radius: var(--radius-md); font-size: 0.88rem;">
                    <div><strong>${isFaculty ? 'Faculty ID' : 'Student ID'}:</strong> <code>${member.memberId}</code></div>
                    <div><strong>Email:</strong> ${member.email}</div>
                    <div><strong>Phone:</strong> ${member.phone}</div>
                    <div><strong>Department:</strong> ${member.department || 'General'}</div>
                    <div><strong>Year:</strong> ${!isFaculty && member.year ? `${member.year} Year` : 'N/A'}</div>
                    <div><strong>Registration Date:</strong> ${member.registrationDate}</div>
                    <div><strong>Outstanding Fine:</strong> <strong class="${member.fine > 0 ? 'text-danger' : 'text-success'}">₹${member.fine}</strong></div>
                </div>

                <div>
                    <h5 style="color: var(--text-main); font-size: 0.9rem; margin-bottom: 8px;">📖 Active Borrowed Books (${loans.length})</h5>
                    ${loans.length === 0 ? '<p class="text-muted" style="font-size:0.85rem;">No active books currently borrowed.</p>' : `
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${loans.map(tx => `
                                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span><strong>${tx.bookTitle}</strong> (ID #${tx.bookId})</span>
                                    <span class="badge ${tx.status === 'Overdue' ? 'badge-danger' : 'badge-available'}">Due: ${tx.dueDate}</span>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <div>
                    <h5 style="color: var(--text-main); font-size: 0.9rem; margin-bottom: 8px;">📩 Active Book Requests (${requests.length})</h5>
                    ${requests.length === 0 ? '<p class="text-muted" style="font-size:0.85rem;">No recent requests.</p>' : `
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${requests.map(r => `
                                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span><strong>${r.bookTitle}</strong> (<code>${r.requestId}</code>)</span>
                                    <span class="badge ${r.status === 'Approved' ? 'badge-success' : (r.status === 'Pending' ? 'badge-warning' : 'badge-danger')}">${r.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <div>
                    <h5 style="color: var(--text-main); font-size: 0.9rem; margin-bottom: 8px;">⏳ Active Reservations in Waitlist (${reservations.length})</h5>
                    ${reservations.length === 0 ? '<p class="text-muted" style="font-size:0.85rem;">No pending reservations.</p>' : `
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${reservations.map(r => `
                                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span><strong>${r.bookTitle}</strong></span>
                                    <span class="badge badge-primary">Rank #${this.libraryManager.getQueuePosition(r.reservationId)}</span>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        Modal.open({
            title: `Member Profile - ${member.memberId}`,
            content,
            footer: `<button class="btn btn-secondary" onclick="document.querySelector('.modal-close-btn').click()">Close</button>`
        });
    }

    payMemberFine(memberId) {
        const member = this.libraryManager.getMemberById(memberId);
        if (!member) return;

        Modal.confirm({
            title: "Settle Fine",
            message: `Collect and mark fine payment of <strong>₹${member.fine}</strong> for <strong>${member.name}</strong> (${member.memberId})?`,
            confirmText: "Mark Paid & Settle",
            confirmClass: "btn-success",
            onConfirm: () => {
                const paid = this.libraryManager.payMemberFine(memberId);
                Toast.success(`₹${paid} fine settled successfully.`);
                if (this.currentView === 'members') this.renderMembers();
                if (this.currentView === 'profile') this.renderProfile();
                if (this.currentView === 'student-fines') this.renderStudentFines();
                if (this.currentView === 'faculty-dashboard') this.renderFacultyDashboard();
            }
        });
    }

    confirmDeleteMember(memberId) {
        if (!AuthService.requireRole(['admin'])) return;
        const member = this.libraryManager.getMemberById(memberId);
        if (!member) return;

        Modal.confirm({
            title: "Delete Member",
            message: `Are you sure you want to remove member <strong>${member.name}</strong> (${memberId}) from the directory?`,
            confirmText: "Delete",
            confirmClass: "btn-danger",
            onConfirm: () => {
                if (!AuthService.requireRole(['admin'])) return;
                try {
                    this.libraryManager.deleteMember(memberId);
                    Toast.success(`Member ${member.name} deleted.`);
                    this.renderMembers();
                } catch (err) {
                    Toast.error(err.message);
                }
            }
        });
    }

    // ==========================================
    // 7. ISSUE & RETURN VIEW (Admin Only)
    // ==========================================

    renderIssueReturn() {
        if (!AuthService.requireRole(['admin'])) return;

        const memberSelect = document.getElementById('issue-member-select');
        const bookSelect = document.getElementById('issue-book-select');

        if (memberSelect) {
            memberSelect.innerHTML = '<option value="">-- Choose Member --</option>' +
                this.libraryManager.members.map(m => `
                    <option value="${m.memberId}">${m.name} (${m.memberId} - ${m.membershipType})</option>
                `).join('');
        }

        if (bookSelect) {
            bookSelect.innerHTML = '<option value="">-- Choose Book --</option>' +
                this.libraryManager.books.map(b => `
                    <option value="${b.bookId}">${b.title} (ID #${b.bookId} - ${b.availableCopies} available)</option>
                `).join('');
        }

        const returnTbody = document.getElementById('return-loans-tbody');
        if (returnTbody) {
            const activeLoans = this.libraryManager.transactions.filter(t => t.status === 'Active' || t.status === 'Overdue');

            if (activeLoans.length === 0) {
                returnTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 30px;">No active loans to return</td></tr>`;
            } else {
                returnTbody.innerHTML = activeLoans.map(tx => {
                    const overdueInfo = Transaction.calculateOverdue(tx, this.libraryManager.settings.finePerDay);
                    const statusClass = overdueInfo.isOverdue ? 'badge-danger' : 'badge-available';
                    const fineBadge = overdueInfo.fine > 0 ? `<span class="badge badge-danger">₹${overdueInfo.fine} Due</span>` : '₹0';

                    return `
                        <tr>
                            <td><code>${tx.transactionId}</code></td>
                            <td><strong>${tx.bookTitle}</strong> (ID #${tx.bookId})</td>
                            <td>${tx.memberName} (${tx.memberId})</td>
                            <td>${tx.issueDate}</td>
                            <td>${tx.dueDate}</td>
                            <td><span class="badge ${statusClass}">${overdueInfo.isOverdue ? `Overdue (${overdueInfo.daysOverdue}d)` : 'Active (On Time)'}</span></td>
                            <td>${fineBadge}</td>
                            <td>
                                <button class="btn btn-primary btn-sm btn-execute-return" data-tx="${tx.transactionId}">
                                    📥 Return Book
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');

                returnTbody.querySelectorAll('.btn-execute-return').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.processBookReturn(btn.dataset.tx);
                    });
                });
            }
        }
    }

    processBookIssue(memberId, bookId) {
        try {
            const result = this.libraryManager.issueBook(memberId, bookId);
            if (!result.success && result.outOfStock) {
                Toast.warning(result.message);
                return;
            }

            Toast.success(`Book "${result.book.title}" successfully issued to ${result.member.name}!`);
            this.renderIssueReturn();
            if (this.currentView === 'dashboard') this.renderAdminDashboard();
            if (this.currentView === 'books') this.renderBooks();
            if (this.currentView === 'members') this.renderMembers();
            if (this.currentView === 'transactions') this.renderTransactions();
        } catch (err) {
            Toast.error(err.message);
        }
    }

    processBookReturn(transactionId) {
        try {
            const result = this.libraryManager.returnBook(transactionId);
            let msg = `Book "${result.transaction.bookTitle}" returned successfully!`;
            if (result.overdueInfo.isOverdue) {
                msg += ` Overdue fine of ₹${result.overdueInfo.fine} added to member account.`;
            }
            if (result.nextReservation) {
                msg += ` (Next reservation queued: ${result.nextReservation.userName})`;
            }

            Toast.success(msg);
            this.renderIssueReturn();
            this.renderTransactions();
            if (this.currentView === 'dashboard') this.renderAdminDashboard();
            if (this.currentView === 'faculty-dashboard') this.renderFacultyDashboard();
            if (this.currentView === 'books') this.renderBooks();
            if (this.currentView === 'members') this.renderMembers();
        } catch (err) {
            Toast.error(err.message);
        }
    }

    // ==========================================
    // 8. RESERVATIONS (PRIORITY QUEUE) VIEW
    // ==========================================

    renderReservations() {
        const currentUser = AuthService.getCurrentUser();
        const tbody = document.getElementById('reservations-tbody');
        const titleEl = document.getElementById('reservations-table-title');

        if (titleEl) {
            titleEl.textContent = currentUser?.role === 'faculty' ? '⏳ My Priority Reservations' : '🎯 Priority Queue Waitlist';
        }

        if (!tbody || !currentUser) return;

        let displayQueue = [];
        if (currentUser.role === 'admin') {
            displayQueue = this.libraryManager.reservationPriorityQueue.getSortedQueue();
        } else {
            displayQueue = this.libraryManager.getUserReservations(currentUser.id, currentUser.role);
        }

        if (displayQueue.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 30px;">No pending reservations</td></tr>`;
            return;
        }

        tbody.innerHTML = displayQueue.map((r, i) => {
            const badgeClass = r.priority === 1 ? 'badge-faculty' : (r.priority === 2 ? 'badge-scholar' : 'badge-student');
            const label = r.priority === 1 ? 'Priority 1 (Faculty)' : (r.priority === 2 ? 'Priority 2 (Researcher)' : 'Priority 3 (Student)');
            const rankPos = this.libraryManager.getQueuePosition(r.reservationId);
            const canManage = currentUser.role === 'admin' || r.userId === currentUser.id;

            return `
                <tr>
                    <td><strong>#${rankPos}</strong></td>
                    <td><code>${r.reservationId}</code></td>
                    <td><strong>${r.userName}</strong></td>
                    <td><span class="badge ${badgeClass}">${label}</span></td>
                    <td><strong>${r.bookTitle}</strong> (ID #${r.bookId})</td>
                    <td><small>${new Date(r.requestTime).toLocaleString()}</small></td>
                    <td><span class="badge badge-warning">${r.status}</span></td>
                    <td>
                        <div class="table-actions">
                            ${currentUser.role === 'admin' ? `
                                <button class="btn btn-primary btn-sm btn-fulfill-res" data-id="${r.reservationId}" title="Fulfill & Issue">Fulfill</button>
                            ` : ''}
                            ${canManage ? `
                                <button class="btn btn-danger btn-sm btn-cancel-res" data-id="${r.reservationId}" title="Cancel Reservation">Cancel</button>
                            ` : '<small class="text-muted">Read-Only</small>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-fulfill-res').forEach(btn => {
            btn.addEventListener('click', () => {
                const res = this.libraryManager.reservations.find(r => r.reservationId === btn.dataset.id);
                if (res) {
                    try {
                        this.libraryManager.fulfillReservation(res.reservationId);
                        this.libraryManager.issueBook(res.userId, res.bookId);
                        Toast.success(`Reservation fulfilled and book issued to ${res.userName}!`);
                        this.renderReservations();
                    } catch (err) {
                        Toast.error(err.message);
                    }
                }
            });
        });

        tbody.querySelectorAll('.btn-cancel-res').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    this.libraryManager.cancelReservation(btn.dataset.id);
                    Toast.info("Reservation cancelled.");
                    this.renderReservations();
                    if (this.currentView === 'faculty-dashboard') this.renderFacultyDashboard();
                } catch (err) {
                    Toast.error(err.message);
                }
            });
        });
    }

    openAddReservationModal() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return;

        const content = `
            <form id="modal-form-add-res">
                <div class="form-group">
                    <label class="form-label">Member</label>
                    <input type="text" class="form-control" value="${currentUser.name} (${currentUser.role.toUpperCase()})" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Book to Reserve *</label>
                    <select class="form-select" name="bookId" required>
                        <option value="">-- Choose Book --</option>
                        ${this.libraryManager.books.map(b => `
                            <option value="${b.bookId}">${b.title} (ID #${b.bookId} - ${b.availableCopies} available)</option>
                        `).join('')}
                    </select>
                </div>
            </form>
        `;

        const modalBox = Modal.open({
            title: "⏳ Add Priority Queue Reservation",
            content,
            footer: `
                <button class="btn btn-secondary" id="modal-cancel-res">Cancel</button>
                <button class="btn btn-primary" id="modal-save-res">Enqueue Reservation</button>
            `
        });

        modalBox.querySelector('#modal-cancel-res').addEventListener('click', () => Modal.close());
        modalBox.querySelector('#modal-save-res').addEventListener('click', () => {
            const form = modalBox.querySelector('#modal-form-add-res');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            const formData = new FormData(form);
            const bookId = formData.get('bookId');

            try {
                const resResult = this.libraryManager.reserveBook(currentUser.id, currentUser.role, currentUser.name, bookId);
                Toast.success(`Reservation added! Position #${resResult.queuePosition} in Priority Heap.`);
                Modal.close();
                this.renderReservations();
                if (this.currentView === 'faculty-dashboard') this.renderFacultyDashboard();
            } catch (err) {
                Toast.error(err.message);
            }
        });
    }

    // ==========================================
    // 9. TRANSACTIONS LOG VIEW
    // ==========================================

    renderTransactions() {
        const query = document.getElementById('tx-search-input')?.value.toLowerCase().trim() || '';
        const actionFilter = document.getElementById('tx-action-filter')?.value || 'all';
        const statusFilter = document.getElementById('tx-status-filter')?.value || 'all';
        const currentUser = AuthService.getCurrentUser();

        let transactions = [];
        if (currentUser && currentUser.role === 'admin') {
            transactions = [...this.libraryManager.transactions];
        } else if (currentUser) {
            transactions = this.libraryManager.getUserTransactions(currentUser.id);
        }

        if (query) {
            transactions = transactions.filter(t => 
                t.transactionId.toLowerCase().includes(query) ||
                t.bookTitle.toLowerCase().includes(query) ||
                t.memberName.toLowerCase().includes(query)
            );
        }
        if (actionFilter !== 'all') {
            transactions = transactions.filter(t => t.action === actionFilter);
        }
        if (statusFilter !== 'all') {
            transactions = transactions.filter(t => t.status === statusFilter);
        }

        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;

        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 30px;">No transactions recorded</td></tr>`;
            return;
        }

        tbody.innerHTML = transactions.map(t => {
            const statusClass = t.status === 'Active' ? 'badge-warning' : (t.status === 'Overdue' ? 'badge-danger' : 'badge-success');
            return `
                <tr>
                    <td><code>${t.transactionId}</code></td>
                    <td><strong>${t.bookTitle}</strong> (ID #${t.bookId})</td>
                    <td>${t.memberName} (${t.memberId})</td>
                    <td>${t.action}</td>
                    <td>${t.issueDate}</td>
                    <td>${t.dueDate}</td>
                    <td>${t.returnDate || '-'}</td>
                    <td>${t.fine > 0 ? `<span class="text-danger">₹${t.fine}</span>` : '₹0'}</td>
                    <td><span class="badge ${statusClass}">${t.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================
    // 10. USER PROFILE VIEW (All Roles)
    // ==========================================

    renderProfile() {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        document.getElementById('profile-full-name').textContent = user.name;
        document.getElementById('profile-role-badge').textContent = user.role.toUpperCase();
        document.getElementById('profile-role-badge').className = `badge badge-${user.role}`;
        document.getElementById('profile-user-id').textContent = `User ID: ${user.id}`;
        document.getElementById('profile-input-email').value = user.email || '';
        document.getElementById('profile-input-phone').value = user.phone || '';
        document.getElementById('profile-input-dept').value = user.department || '';
        document.getElementById('profile-joined-text').value = user.registrationDate || '';

        const personalSection = document.getElementById('profile-personal-data-section');
        const borrowedList = document.getElementById('profile-borrowed-list');
        const resList = document.getElementById('profile-reservations-list');
        const fineAmount = document.getElementById('profile-fine-amount');
        const payFineBtn = document.getElementById('profile-pay-fine-btn');

        if (user.role === 'admin') {
            if (personalSection) {
                personalSection.innerHTML = `
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); margin-top: 10px;">
                        <h4 style="color: var(--primary); margin-bottom: 8px;">👑 Administrator Privileges Active</h4>
                        <p style="font-size: 0.88rem; color: var(--text-muted);">
                            You have full administrative authorization across all library modules: Book catalog maintenance, member registrations, book request approval, fine management, and system configuration.
                        </p>
                    </div>
                `;
            }
            return;
        }

        const loans = this.libraryManager.getUserLoans(user.id);
        const reservations = this.libraryManager.getUserReservations(user.id, user.role);
        const member = this.libraryManager.getMemberById(user.id);

        if (borrowedList) {
            if (loans.length === 0) {
                borrowedList.innerHTML = '<p class="text-muted" style="font-size: 0.88rem;">No active books currently borrowed.</p>';
            } else {
                borrowedList.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${loans.map(tx => {
                            return `
                                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <strong>${tx.bookTitle}</strong>
                                        <div style="font-size: 0.78rem; color: var(--text-muted);">ID #${tx.bookId} &bull; Due: <strong>${tx.dueDate}</strong></div>
                                    </div>
                                    <span class="badge ${tx.status === 'Overdue' ? 'badge-danger' : 'badge-available'}">${tx.status}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        }

        if (resList) {
            if (reservations.length === 0) {
                resList.innerHTML = '<p class="text-muted" style="font-size: 0.88rem;">No pending reservations.</p>';
            } else {
                resList.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${reservations.map(r => `
                            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <strong>${r.bookTitle}</strong>
                                    <div style="font-size: 0.78rem; color: var(--text-muted);">Requested: ${new Date(r.requestTime).toLocaleDateString()}</div>
                                </div>
                                <span class="badge badge-primary">Queue Rank #${this.libraryManager.getQueuePosition(r.reservationId)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        if (fineAmount) {
            fineAmount.textContent = member ? `₹${member.fine}` : '₹0';
            if (member && member.fine > 0) {
                if (payFineBtn) {
                    payFineBtn.style.display = 'inline-flex';
                    payFineBtn.onclick = () => this.payMemberFine(member.memberId);
                }
            } else {
                if (payFineBtn) payFineBtn.style.display = 'none';
            }
        }
    }

    // ==========================================
    // 11. ADMIN MANAGEMENT VIEW
    // ==========================================

    renderAdminManagement() {
        if (!AuthService.requireRole(['admin'])) return;

        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;

        const admins = AuthService.getUsers().filter(u => u.role === 'admin');
        const activeAdminsCount = admins.filter(u => u.status === 'Active').length;

        tbody.innerHTML = admins.map(admin => {
            const statusClass = admin.status === 'Active' ? 'badge-approved' : 'badge-danger';
            const toggleActionText = admin.status === 'Active' ? 'Deactivate' : 'Activate';
            const toggleBtnClass = admin.status === 'Active' ? 'btn-danger' : 'btn-success';

            return `
                <tr>
                    <td><code>${admin.id}</code></td>
                    <td><strong>${admin.name}</strong></td>
                    <td>${admin.email}</td>
                    <td>${admin.phone || 'N/A'}</td>
                    <td><span class="badge ${statusClass}">${admin.status || 'Active'}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-secondary btn-sm btn-view-admin" data-id="${admin.id}">👁️ View</button>
                            <button class="btn btn-secondary btn-sm btn-edit-admin" data-id="${admin.id}">✏️ Edit</button>
                            <button class="btn ${toggleBtnClass} btn-sm btn-toggle-admin" data-id="${admin.id}" data-status="${admin.status || 'Active'}">${toggleActionText}</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // View Admin Details
        tbody.querySelectorAll('.btn-view-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                const adminId = btn.dataset.id;
                const admin = AuthService.getUsers().find(u => u.id === adminId && u.role === 'admin');
                if (!admin) return;

                Modal.open({
                    title: `👑 Administrator Details - ${admin.id}`,
                    content: `
                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            <div class="form-row-grid" style="background: var(--bg-main); padding: 16px; border-radius: var(--radius-md); font-size: 0.9rem;">
                                <div><strong>Admin ID:</strong> <code>${admin.id}</code></div>
                                <div><strong>Full Name:</strong> <strong>${admin.name}</strong></div>
                                <div><strong>Email:</strong> ${admin.email}</div>
                                <div><strong>Phone:</strong> ${admin.phone || 'N/A'}</div>
                                <div><strong>Department:</strong> ${admin.department || 'Central Administration'}</div>
                                <div><strong>Status:</strong> <span class="badge ${admin.status === 'Active' ? 'badge-approved' : 'badge-danger'}">${admin.status || 'Active'}</span></div>
                                <div><strong>Registered On:</strong> ${admin.registrationDate || 'N/A'}</div>
                            </div>
                        </div>
                    `,
                    footer: `<button class="btn btn-secondary" onclick="document.querySelector('.modal-close-btn').click()">Close</button>`,
                    size: 'medium'
                });
            });
        });

        // Edit Admin
        tbody.querySelectorAll('.btn-edit-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                const adminId = btn.dataset.id;
                const admin = AuthService.getUsers().find(u => u.id === adminId && u.role === 'admin');
                if (!admin) return;

                const modalBox = Modal.open({
                    title: `✏️ Edit Administrator - ${admin.id}`,
                    content: `
                        <form id="form-modal-edit-admin" style="display: flex; flex-direction: column; gap: 12px;">
                            <div class="form-group">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-control" id="edit-admin-name" value="${admin.name}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address *</label>
                                <input type="email" class="form-control" id="edit-admin-email" value="${admin.email}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone Number *</label>
                                <input type="tel" class="form-control" id="edit-admin-phone" value="${admin.phone || ''}" required>
                            </div>
                        </form>
                    `,
                    footer: `
                        <button class="btn btn-secondary" id="modal-cancel-edit-admin">Cancel</button>
                        <button class="btn btn-primary" id="modal-save-edit-admin">Save Changes</button>
                    `
                });

                modalBox.querySelector('#modal-cancel-edit-admin').addEventListener('click', () => Modal.close());
                modalBox.querySelector('#modal-save-edit-admin').addEventListener('click', () => {
                    const name = modalBox.querySelector('#edit-admin-name').value.trim();
                    const email = modalBox.querySelector('#edit-admin-email').value.trim();
                    const phone = modalBox.querySelector('#edit-admin-phone').value.trim();

                    if (!name || !email || !phone) {
                        Toast.error("All fields are required.");
                        return;
                    }

                    try {
                        AuthService.updateUserAccount(admin.id, { name, email, phone });
                        Toast.success(`Administrator ${admin.id} updated successfully.`);
                        Modal.close();
                        this.renderAdminManagement();
                        if (this.currentView === 'dashboard') this.renderAdminDashboard();
                    } catch (err) {
                        Toast.error(err.message);
                    }
                });
            });
        });

        // Activate / Deactivate Admin
        tbody.querySelectorAll('.btn-toggle-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                const adminId = btn.dataset.id;
                const currentStatus = btn.dataset.status;
                const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

                if (newStatus === 'Inactive' && activeAdminsCount <= 1) {
                    Toast.error("At least one active administrator must remain in the system.");
                    return;
                }

                Modal.confirm({
                    title: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Administrator`,
                    message: `Are you sure you want to ${newStatus.toLowerCase()} administrator <strong>${adminId}</strong>?`,
                    confirmText: `${newStatus} Admin`,
                    confirmClass: newStatus === 'Active' ? 'btn-success' : 'btn-danger',
                    onConfirm: () => {
                        try {
                            AuthService.updateUserAccount(adminId, { status: newStatus });
                            Toast.success(`Administrator ${adminId} is now ${newStatus}.`);
                            this.renderAdminManagement();
                        } catch (err) {
                            Toast.error(err.message);
                        }
                    }
                });
            });
        });
    }

    // ==========================================
    // 12. STUDENT SPECIALIZED VIEWS
    // ==========================================

    renderStudentBooks() {
        const user = AuthService.getCurrentUser();
        const tbody = document.getElementById('student-loans-tbody');
        if (!tbody || !user) return;

        const loans = this.libraryManager.getUserLoans(user.id);

        if (loans.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 30px;">No books currently borrowed. Request a book from the catalog!</td></tr>`;
            return;
        }

        tbody.innerHTML = loans.map(tx => {
            const overdueInfo = Transaction.calculateOverdue(tx, this.libraryManager.settings.finePerDay);
            const statusBadge = overdueInfo.isOverdue 
                ? `<span class="badge badge-danger">Overdue (${overdueInfo.daysOverdue} days)</span>` 
                : `<span class="badge badge-available">Active (Due: ${tx.dueDate})</span>`;

            return `
                <tr>
                    <td><strong>${tx.bookTitle}</strong></td>
                    <td><code>#${tx.bookId}</code></td>
                    <td>${tx.issueDate}</td>
                    <td>${tx.dueDate}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

    renderStudentReservations() {
        const user = AuthService.getCurrentUser();
        const tbody = document.getElementById('student-reservations-tbody');
        if (!tbody || !user) return;

        const reservations = this.libraryManager.getUserReservations(user.id, user.role);

        if (reservations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 30px;">No active reservations in the queue.</td></tr>`;
            return;
        }

        tbody.innerHTML = reservations.map(r => `
            <tr>
                <td><span class="rank-badge" style="width: 28px; height: 28px; font-size: 0.8rem;">#${this.libraryManager.getQueuePosition(r.reservationId)}</span></td>
                <td><strong>${r.bookTitle}</strong></td>
                <td><code>#${r.bookId}</code></td>
                <td>${new Date(r.requestTime).toLocaleString()}</td>
                <td><span class="badge badge-student">Student Priority (P3)</span></td>
                <td>
                    <button class="btn btn-danger btn-sm btn-cancel-student-res" data-id="${r.reservationId}">Cancel</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-cancel-student-res').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    this.libraryManager.cancelReservation(btn.dataset.id);
                    Toast.info("Reservation cancelled.");
                    this.renderStudentReservations();
                } catch (e) {
                    Toast.error(e.message);
                }
            });
        });
    }

    renderStudentFines() {
        const user = AuthService.getCurrentUser();
        const container = document.getElementById('student-fines-container');
        if (!container || !user) return;

        const member = this.libraryManager.getMemberById(user.id);
        const fine = member ? member.fine : 0;

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-size: 0.9rem; color: var(--text-muted);">Current Unpaid Fine Balance</div>
                        <div style="font-size: 2rem; font-weight: 900; color: ${fine > 0 ? 'var(--danger)' : 'var(--success)'};">₹${fine}</div>
                        <div style="font-size: 0.78rem; color: var(--text-dim);">Calculated at ₹${this.libraryManager.settings.finePerDay}/day for overdue loans</div>
                    </div>
                    ${fine > 0 ? `<button class="btn btn-success" id="btn-student-pay-fine">💰 Pay Fine Online</button>` : `<span class="badge badge-success" style="font-size: 0.9rem; padding: 8px 14px;">✓ No Outstanding Fines</span>`}
                </div>
            </div>
        `;

        container.querySelector('#btn-student-pay-fine')?.addEventListener('click', () => {
            this.payMemberFine(user.id);
        });
    }

    // ==========================================
    // 13. ANALYTICS & SETTINGS
    // ==========================================

    renderAnalytics() {
        Charts.renderCategoryDonut('analytics-category-chart', this.libraryManager.getCategories());
        Charts.renderPopularBooks('analytics-popular-chart', this.libraryManager.getPopularBooks(6));
        Charts.renderMonthlyActivity('analytics-monthly-chart');
    }

    renderSettings() {
        if (!AuthService.requireRole(['admin'])) return;
        document.getElementById('setting-lib-name').value = this.libraryManager.settings.libraryName;
        document.getElementById('setting-fine-rate').value = this.libraryManager.settings.finePerDay;
        document.getElementById('setting-max-days').value = this.libraryManager.settings.maxBorrowDays;
        document.getElementById('setting-max-books').value = this.libraryManager.settings.maxBooksPerMember;
    }

    renderAuditLogs() {
        if (!AuthService.requireRole(['admin'])) return;
        const tbody = document.getElementById('audit-logs-tbody');
        if (!tbody) return;

        const query = document.getElementById('audit-log-search-input')?.value?.toLowerCase().trim() || '';
        const actionFilter = document.getElementById('audit-log-action-filter')?.value || 'all';

        let logs = AuditService.getLogs();

        if (query) {
            logs = logs.filter(l => 
                l.action.toLowerCase().includes(query) ||
                l.adminId.toLowerCase().includes(query) ||
                l.adminName.toLowerCase().includes(query) ||
                l.target.toLowerCase().includes(query)
            );
        }

        if (actionFilter && actionFilter !== 'all') {
            logs = logs.filter(l => l.action.toLowerCase() === actionFilter.toLowerCase());
        }

        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 30px;">No audit log records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(log => {
            let actionBadgeClass = 'badge-info';
            if (log.action.includes('Approved') || log.action.includes('Issued')) actionBadgeClass = 'badge-success';
            else if (log.action.includes('Rejected') || log.action.includes('Deleted')) actionBadgeClass = 'badge-danger';
            else if (log.action.includes('Returned')) actionBadgeClass = 'badge-primary';
            else if (log.action.includes('Added')) actionBadgeClass = 'badge-warning';

            const dateFormatted = new Date(log.timestamp).toLocaleString();

            return `
                <tr>
                    <td><span style="font-family: var(--font-mono); font-size: 0.84rem;">${dateFormatted}</span></td>
                    <td><strong>${log.adminId}</strong></td>
                    <td>${log.adminName}</td>
                    <td><span class="badge ${actionBadgeClass}">${log.action}</span></td>
                    <td><code>${log.target}</code></td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================
    // EVENT BINDINGS
    // ==========================================

    bindEvents() {
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => this.toggleTheme());

        document.getElementById('header-logout-btn')?.addEventListener('click', () => {
            Modal.confirm({
                title: "Logout Confirmation",
                message: "Are you sure you want to sign out of your library session?",
                confirmText: "Sign Out",
                confirmClass: "btn-danger",
                onConfirm: () => {
                    CinematicPortal.playLogout(() => {
                        AuthService.logout();
                        Toast.info("Signed out successfully.");
                        this.checkAuth();
                    });
                }
            });
        });

        document.getElementById('mobile-toggle')?.addEventListener('click', () => {
            document.getElementById('app-sidebar')?.classList.toggle('sidebar-open');
        });

        // Audit Log Filter Events
        document.getElementById('audit-log-search-input')?.addEventListener('input', () => this.renderAuditLogs());
        document.getElementById('audit-log-action-filter')?.addEventListener('change', () => this.renderAuditLogs());
        document.getElementById('btn-refresh-audit-logs')?.addEventListener('click', () => {
            this.renderAuditLogs();
            Toast.info("Audit log refreshed.");
        });

        // ----------------------------------------------------
        // ACCOUNT SELECTION & ROLE LOGIN TRANSITIONS
        // ----------------------------------------------------
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                const role = card.dataset.role;
                if (role) this.selectLoginRole(role, true);
            });

            // Keyboard accessibility (Enter / Space)
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const role = card.dataset.role;
                    if (role) this.selectLoginRole(role, true);
                }
            });
        });

        // Back to Account Selection Button
        document.getElementById('btn-back-to-selection')?.addEventListener('click', () => {
            this.showAccountSelection(true);
        });

        // Quick 1-Click Demo Logins from Selection Screen
        document.getElementById('demo-quick-student')?.addEventListener('click', () => {
            this.selectLoginRole('student', true);
            setTimeout(() => {
                document.getElementById('login-username').value = 'student';
                document.getElementById('login-password').value = 'student123';
                document.getElementById('form-login').dispatchEvent(new Event('submit'));
            }, 300);
        });

        document.getElementById('demo-quick-faculty')?.addEventListener('click', () => {
            this.selectLoginRole('faculty', true);
            setTimeout(() => {
                document.getElementById('login-username').value = 'faculty';
                document.getElementById('login-password').value = 'faculty123';
                document.getElementById('form-login').dispatchEvent(new Event('submit'));
            }, 300);
        });

        document.getElementById('demo-quick-admin')?.addEventListener('click', () => {
            this.selectLoginRole('admin', true);
            setTimeout(() => {
                document.getElementById('login-username').value = 'admin';
                document.getElementById('login-password').value = 'admin123';
                document.getElementById('form-login').dispatchEvent(new Event('submit'));
            }, 300);
        });

        // Role-Specific Demo Credentials Fill Button
        document.getElementById('btn-fill-role-demo')?.addEventListener('click', () => {
            const role = this.selectedLoginRole || 'student';
            const demoMap = {
                student: { user: 'student', pass: 'student123' },
                faculty: { user: 'faculty', pass: 'faculty123' },
                admin: { user: 'admin', pass: 'admin123' }
            };
            const creds = demoMap[role] || demoMap.student;
            const u = document.getElementById('login-username');
            const p = document.getElementById('login-password');
            if (u) u.value = creds.user;
            if (p) p.value = creds.pass;
            Toast.info(`Filled demo credentials for ${role.toUpperCase()}`);
        });

        // Password Show/Hide Toggle
        const passInput = document.getElementById('login-password');
        const passEyeBtn = document.getElementById('btn-toggle-password');
        const eyeIcon = document.getElementById('password-eye-icon');

        passEyeBtn?.addEventListener('click', () => {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                eyeIcon.textContent = '🔒';
            } else {
                passInput.type = 'password';
                eyeIcon.textContent = '👁️';
            }
        });

        // ----------------------------------------------------
        // FORGOT PASSWORD WORKFLOW EVENT BINDINGS
        // ----------------------------------------------------
        document.getElementById('link-forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openForgotPassword();
        });

        document.getElementById('btn-back-from-reset')?.addEventListener('click', () => {
            this.closeForgotPassword();
        });

        document.getElementById('btn-reset-change-id')?.addEventListener('click', () => {
            this.goToResetStep(1);
        });

        // Step 1: Find Account
        document.getElementById('form-reset-step1')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('reset-input-id').value;
            const errEl = document.getElementById('reset-error-msg');
            if (errEl) errEl.style.display = 'none';

            try {
                const user = AuthService.findUserForReset(id, this.resetState.role);
                this.resetState.user = user;

                const roleLabels = { student: 'Student ID:', faculty: 'Faculty ID:', admin: 'Admin ID:' };
                const foundIdLabel = document.getElementById('found-id-label');
                if (foundIdLabel) foundIdLabel.textContent = roleLabels[user.role] || 'User ID:';
                
                const foundIdVal = document.getElementById('found-id-val');
                if (foundIdVal) foundIdVal.textContent = user.id;

                const foundNameVal = document.getElementById('found-name-val');
                if (foundNameVal) foundNameVal.textContent = user.name;

                const foundEmailVal = document.getElementById('found-email-val');
                if (foundEmailVal) foundEmailVal.textContent = user.maskedEmail;

                this.goToResetStep(2);
            } catch (err) {
                if (errEl) {
                    errEl.textContent = err.message;
                    errEl.style.display = 'block';
                }
                Toast.error(err.message);
            }
        });

        // Step 2: Send Code
        document.getElementById('btn-reset-send-code')?.addEventListener('click', () => {
            const errEl = document.getElementById('reset-error-msg');
            if (errEl) errEl.style.display = 'none';

            try {
                const res = AuthService.generateResetCode(this.resetState.user.id, this.resetState.role);
                this.resetState.code = res.simulatedCode;

                const verifyEmailDisplay = document.getElementById('verify-email-display');
                if (verifyEmailDisplay) verifyEmailDisplay.textContent = res.maskedEmail;

                const demoCodeVal = document.getElementById('demo-code-val');
                if (demoCodeVal) demoCodeVal.textContent = res.simulatedCode;

                const codeInput = document.getElementById('reset-input-code');
                if (codeInput) codeInput.value = '';

                this.startResendCountdown();
                this.goToResetStep(3);
                Toast.info("Verification code generated (simulated for demo).");
            } catch (err) {
                if (errEl) {
                    errEl.textContent = err.message;
                    errEl.style.display = 'block';
                }
                Toast.error(err.message);
            }
        });

        // Step 3: Autofill Code & Resend
        document.getElementById('btn-autofill-code')?.addEventListener('click', () => {
            if (this.resetState?.code) {
                const input = document.getElementById('reset-input-code');
                if (input) input.value = this.resetState.code;
                Toast.info("Filled simulated verification code.");
            }
        });

        document.getElementById('btn-resend-code')?.addEventListener('click', () => {
            if (this.resetState?.user) {
                const res = AuthService.generateResetCode(this.resetState.user.id, this.resetState.role);
                this.resetState.code = res.simulatedCode;
                const demoCodeVal = document.getElementById('demo-code-val');
                if (demoCodeVal) demoCodeVal.textContent = res.simulatedCode;
                this.startResendCountdown();
                Toast.info("New verification code generated.");
            }
        });

        // Step 3: Verify Code Submit
        document.getElementById('form-reset-step3')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('reset-input-code').value;
            const errEl = document.getElementById('reset-error-msg');
            if (errEl) errEl.style.display = 'none';

            try {
                AuthService.verifyResetCode(this.resetState.user.id, this.resetState.role, code);
                this.goToResetStep(4);
                const p1 = document.getElementById('reset-new-password');
                const p2 = document.getElementById('reset-confirm-password');
                if (p1) p1.value = '';
                if (p2) p2.value = '';
                const bar = document.getElementById('reset-strength-bar');
                const lbl = document.getElementById('reset-strength-label');
                if (bar) { bar.style.width = '0%'; bar.style.backgroundColor = 'var(--border-color)'; }
                if (lbl) { lbl.textContent = 'None'; lbl.style.color = 'var(--text-sub)'; }
                Toast.success("Identity verified! Please set your new password.");
            } catch (err) {
                if (errEl) {
                    errEl.textContent = err.message;
                    errEl.style.display = 'block';
                }
                Toast.error(err.message);
            }
        });

        // Step 4: Live Dynamic Password Strength
        document.getElementById('reset-new-password')?.addEventListener('input', (e) => {
            const str = AuthService.calculatePasswordStrength(e.target.value);
            const bar = document.getElementById('reset-strength-bar');
            const lbl = document.getElementById('reset-strength-label');
            if (bar) {
                bar.style.width = `${str.percent}%`;
                bar.style.backgroundColor = str.color;
            }
            if (lbl) {
                lbl.textContent = str.label;
                lbl.style.color = str.color;
            }
        });

        // Password Reset Eye Toggles
        const setupEyeToggle = (btnId, inputId, eyeId) => {
            document.getElementById(btnId)?.addEventListener('click', () => {
                const input = document.getElementById(inputId);
                const eye = document.getElementById(eyeId);
                if (!input || !eye) return;
                if (input.type === 'password') {
                    input.type = 'text';
                    eye.textContent = '🔒';
                } else {
                    input.type = 'password';
                    eye.textContent = '👁️';
                }
            });
        };
        setupEyeToggle('btn-toggle-reset-p1', 'reset-new-password', 'eye-reset-p1');
        setupEyeToggle('btn-toggle-reset-p2', 'reset-confirm-password', 'eye-reset-p2');

        // Step 4: Submit New Password
        document.getElementById('form-reset-step4')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = document.getElementById('reset-new-password').value;
            const confPass = document.getElementById('reset-confirm-password').value;
            const errEl = document.getElementById('reset-error-msg');
            if (errEl) errEl.style.display = 'none';

            try {
                AuthService.resetPassword(this.resetState.user.id, this.resetState.role, newPass, confPass);
                this.goToResetStep(5);
                Toast.success("Password updated successfully!");
            } catch (err) {
                if (errEl) {
                    errEl.textContent = err.message;
                    errEl.style.display = 'block';
                }
                Toast.error(err.message);
            }
        });

        // Step 5: Back to Login
        document.getElementById('btn-reset-success-login')?.addEventListener('click', () => {
            const resetUser = this.resetState?.user;
            this.closeForgotPassword();
            if (resetUser) {
                const usernameEl = document.getElementById('login-username');
                const passwordEl = document.getElementById('login-password');
                if (usernameEl) usernameEl.value = resetUser.id;
                if (passwordEl) {
                    passwordEl.value = '';
                    passwordEl.focus();
                }
            }
        });

        // Switch between Selection/Login and Register Views
        document.getElementById('link-selection-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('view-login').style.display = 'none';
            document.getElementById('view-register').style.display = 'flex';
        });

        document.getElementById('link-open-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('view-login').style.display = 'none';
            document.getElementById('view-register').style.display = 'flex';
            // Pre-select the matching registration role
            const role = this.selectedLoginRole || 'student';
            const regBtn = document.getElementById(`reg-role-${role}`);
            if (regBtn) regBtn.click();
        });

        document.getElementById('link-open-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('view-register').style.display = 'none';
            document.getElementById('view-login').style.display = 'flex';
            this.showAccountSelection(false);
        });

        // Register Role Toggle Pills (Student, Faculty, Admin)
        const regStudentBtn = document.getElementById('reg-role-student');
        const regFacultyBtn = document.getElementById('reg-role-faculty');
        const regAdminBtn = document.getElementById('reg-role-admin');
        const regIdLabel = document.getElementById('reg-id-label');
        const regIdInput = document.getElementById('reg-id');
        const regAcademicFields = document.getElementById('reg-academic-fields');
        const regDeptGroup = document.getElementById('reg-dept-group');
        const regYearGroup = document.getElementById('reg-year-group');
        const regBtnText = document.getElementById('reg-btn-text');

        regStudentBtn?.addEventListener('click', () => {
            regStudentBtn.classList.add('active');
            regFacultyBtn?.classList.remove('active');
            regAdminBtn?.classList.remove('active');
            this.selectedRegisterRole = 'student';
            if (regIdLabel) regIdLabel.textContent = 'Student ID *';
            if (regIdInput) regIdInput.placeholder = 'e.g. STU002';
            if (regAcademicFields) regAcademicFields.style.display = 'grid';
            if (regDeptGroup) regDeptGroup.style.display = 'block';
            if (regYearGroup) regYearGroup.style.display = 'block';
            if (regBtnText) regBtnText.textContent = 'Create Student Account';
        });

        regFacultyBtn?.addEventListener('click', () => {
            regFacultyBtn.classList.add('active');
            regStudentBtn?.classList.remove('active');
            regAdminBtn?.classList.remove('active');
            this.selectedRegisterRole = 'faculty';
            if (regIdLabel) regIdLabel.textContent = 'Faculty ID *';
            if (regIdInput) regIdInput.placeholder = 'e.g. FAC002';
            if (regAcademicFields) regAcademicFields.style.display = 'grid';
            if (regDeptGroup) regDeptGroup.style.display = 'block';
            if (regYearGroup) regYearGroup.style.display = 'none';
            if (regBtnText) regBtnText.textContent = 'Create Faculty Account';
        });

        regAdminBtn?.addEventListener('click', () => {
            regAdminBtn.classList.add('active');
            regStudentBtn?.classList.remove('active');
            regFacultyBtn?.classList.remove('active');
            this.selectedRegisterRole = 'admin';
            if (regIdLabel) regIdLabel.textContent = 'Admin ID *';
            if (regIdInput) regIdInput.placeholder = 'e.g. ADM002';
            if (regAcademicFields) regAcademicFields.style.display = 'none';
            if (regBtnText) regBtnText.textContent = 'Create Admin Account';
        });

        // Public Register Form Submit
        document.getElementById('form-register')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('register-error-text');
            if (errorEl) errorEl.style.display = 'none';

            const userData = {
                name: document.getElementById('reg-name').value,
                id: document.getElementById('reg-id').value,
                email: document.getElementById('reg-email').value,
                phone: document.getElementById('reg-phone').value,
                department: document.getElementById('reg-department')?.value || 'Central Administration',
                year: document.getElementById('reg-year')?.value,
                password: document.getElementById('reg-password').value,
                confirmPassword: document.getElementById('reg-confirm-password').value,
                role: this.selectedRegisterRole
            };

            try {
                const newUser = AuthService.register(userData);
                const roleSuccessMsg = newUser.role === 'admin' 
                    ? "Admin account created successfully."
                    : (newUser.role === 'faculty' ? "Faculty account created successfully." : "Student account created successfully.");
                
                Toast.success(roleSuccessMsg);
                
                document.getElementById('view-register').style.display = 'none';
                document.getElementById('view-login').style.display = 'flex';
                this.selectLoginRole(newUser.role, false);
                document.getElementById('login-username').value = newUser.id;
                document.getElementById('login-password').value = '';
            } catch (err) {
                if (errorEl) {
                    errorEl.textContent = err.message;
                    errorEl.style.display = 'block';
                }
                Toast.error(err.message);
            }
        });

        // Login Form Submission
        document.getElementById('form-login')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const remember = document.getElementById('login-remember').checked;
            const submitBtn = document.getElementById('btn-submit-login');
            const errorText = document.getElementById('login-error-text');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-sm"></span> Signing in...';
            if (errorText) errorText.style.display = 'none';

            try {
                const user = await AuthService.login(username, password, this.selectedLoginRole, remember);
                // Trigger Cinematic Portal Entry Transition
                CinematicPortal.playEntry(user, () => {
                    this.checkAuth();
                    Toast.success(`Welcome back, ${user.name}!`);
                });
            } catch (err) {
                if (errorText) {
                    errorText.textContent = err.message;
                    errorText.style.display = 'block';
                }
                Toast.error(err.message);
            } finally {
                submitBtn.disabled = false;
                const role = this.selectedLoginRole || 'student';
                const roleLabels = { student: 'Student Portal', faculty: 'Faculty Portal', admin: 'Administrator Portal' };
                submitBtn.innerHTML = `<span id="login-btn-text">Sign In to ${roleLabels[role] || 'Library'}</span>`;
            }
        });

        // Edit Profile Form
        document.getElementById('form-edit-profile')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('profile-input-email').value;
            const phone = document.getElementById('profile-input-phone').value;
            const department = document.getElementById('profile-input-dept').value;

            AuthService.updateCurrentUserProfile({ email, phone, department });
            Toast.success("Profile information updated!");
        });

        // Admin Requests Tabs (All, Student, Faculty)
        ['all', 'student', 'faculty'].forEach(role => {
            const btn = document.getElementById(`tab-req-${role}`);
            btn?.addEventListener('click', () => {
                document.querySelectorAll('#view-admin-requests .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.adminRequestRoleFilter = role;
                this.renderAdminRequests();
            });
        });

        // Book View Filters
        document.getElementById('books-search-input')?.addEventListener('input', () => this.renderBooks());
        document.getElementById('books-category-filter')?.addEventListener('change', () => this.renderBooks());
        document.getElementById('books-availability-filter')?.addEventListener('change', () => this.renderBooks());
        document.getElementById('books-sort-filter')?.addEventListener('change', () => this.renderBooks());
        document.getElementById('btn-open-add-book')?.addEventListener('click', () => this.openAddBookModal());

        // Member View Filters & Register Button
        document.getElementById('members-search-input')?.addEventListener('input', () => this.renderMembers());
        document.getElementById('members-type-filter')?.addEventListener('change', () => this.renderMembers());
        document.getElementById('members-status-filter')?.addEventListener('change', () => this.renderMembers());
        document.getElementById('btn-open-register-member')?.addEventListener('click', () => this.openAddMemberModal());

        // Issue / Return Tabs (Admin only)
        document.getElementById('tab-issue-book')?.addEventListener('click', () => {
            document.getElementById('tab-issue-book').classList.add('active');
            document.getElementById('tab-return-book').classList.remove('active');
            document.getElementById('pane-issue-book').style.display = 'block';
            document.getElementById('pane-return-book').style.display = 'none';
        });

        document.getElementById('tab-return-book')?.addEventListener('click', () => {
            document.getElementById('tab-return-book').classList.add('active');
            document.getElementById('tab-issue-book').classList.remove('active');
            document.getElementById('pane-return-book').style.display = 'block';
            document.getElementById('pane-issue-book').style.display = 'none';
            this.renderIssueReturn();
        });

        // Form Direct Issue Book (Admin only)
        document.getElementById('form-issue-book')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const memberId = document.getElementById('issue-member-select').value;
            const bookId = document.getElementById('issue-book-select').value;
            if (memberId && bookId) {
                this.processBookIssue(memberId, bookId);
            }
        });

        // Reservations
        document.getElementById('btn-open-add-reservation')?.addEventListener('click', () => this.openAddReservationModal());
        document.getElementById('reservations-search-input')?.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            document.querySelectorAll('#reservations-tbody tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
            });
        });

        // Transactions Filters
        document.getElementById('tx-search-input')?.addEventListener('input', () => this.renderTransactions());
        document.getElementById('tx-action-filter')?.addEventListener('change', () => this.renderTransactions());
        document.getElementById('tx-status-filter')?.addEventListener('change', () => this.renderTransactions());

        // Settings Form (Admin Only)
        document.getElementById('form-settings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!AuthService.requireRole(['admin'])) return;

            this.libraryManager.settings.libraryName = document.getElementById('setting-lib-name').value;
            this.libraryManager.settings.finePerDay = Number(document.getElementById('setting-fine-rate').value);
            this.libraryManager.settings.maxBorrowDays = Number(document.getElementById('setting-max-days').value);
            this.libraryManager.settings.maxBooksPerMember = Number(document.getElementById('setting-max-books').value);
            this.libraryManager.saveAll();
            Toast.success("Circulation settings saved!");
        });

        document.getElementById('btn-reload-sample-data')?.addEventListener('click', () => {
            if (!AuthService.requireRole(['admin'])) return;
            Modal.confirm({
                title: "Reload Sample Data",
                message: "This will reload the full comprehensive dataset (20+ books, 10+ members, 15+ transactions, 5+ reservations). Proceed?",
                confirmText: "Reload Data",
                confirmClass: "btn-primary",
                onConfirm: () => {
                    StorageService.resetAll();
                    this.libraryManager.loadData();
                    Toast.success("Sample dataset reloaded successfully!");
                    this.navigateTo('dashboard');
                }
            });
        });

        document.getElementById('btn-reset-all-data')?.addEventListener('click', () => {
            if (!AuthService.requireRole(['admin'])) return;
            Modal.confirm({
                title: "Reset All Data",
                message: "Are you sure you want to reset all data? This will clear customized records and reload factory state.",
                confirmText: "Reset Everything",
                confirmClass: "btn-danger",
                onConfirm: () => {
                    StorageService.resetAll();
                    this.libraryManager.loadData();
                    Toast.success("Factory defaults restored.");
                    this.navigateTo('dashboard');
                }
            });
        });

        // Dashboard Hero & Quick Action Buttons
        document.getElementById('btn-hero-search-books')?.addEventListener('click', () => this.navigateTo('books'));
        document.getElementById('btn-hero-view-requests')?.addEventListener('click', () => this.navigateTo('issue-return'));
        document.getElementById('dash-view-all-tx')?.addEventListener('click', () => this.navigateTo('transactions'));
        document.getElementById('dash-view-all-res')?.addEventListener('click', () => this.navigateTo('reservations'));
        document.getElementById('fqa-search-books')?.addEventListener('click', () => this.navigateTo('books'));
        document.getElementById('fqa-my-requests')?.addEventListener('click', () => this.navigateTo('my-requests'));
        document.getElementById('fqa-my-loans')?.addEventListener('click', () => this.navigateTo('faculty-dashboard'));
        document.getElementById('fqa-reserve-book')?.addEventListener('click', () => this.navigateTo('reservations'));

        // Mobile Sidebar Drawer Controls
        const mobileToggle = document.getElementById('mobile-toggle');
        const sidebarClose = document.getElementById('sidebar-close');
        const sidebarBackdrop = document.getElementById('sidebar-backdrop');
        const appSidebar = document.getElementById('app-sidebar');

        const openMobileSidebar = () => {
            appSidebar?.classList.add('sidebar-open');
            sidebarBackdrop?.classList.add('active');
            document.body.classList.add('sidebar-active');
        };

        const closeMobileSidebar = () => {
            appSidebar?.classList.remove('sidebar-open');
            sidebarBackdrop?.classList.remove('active');
            document.body.classList.remove('sidebar-active');
        };

        mobileToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (appSidebar?.classList.contains('sidebar-open')) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });

        sidebarClose?.addEventListener('click', closeMobileSidebar);
        sidebarBackdrop?.addEventListener('click', closeMobileSidebar);
    }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
