/**
 * Authentication, Registration, and Role-Based Access Control (RBAC) Service
 * Manages user accounts, registration for Student, Faculty, and Admin with validation, active sessions, and permissions.
 */

import { Toast } from '../ui/Toast.js';
import { StorageService } from './StorageService.js';
import { Member } from '../models/Member.js';

export class AuthService {
    static STORAGE_KEYS = {
        SESSION: 'slms_active_session',
        USERS: 'slms_user_accounts',
        RESET_CODES: 'slms_reset_codes'
    };

    static getDefaultUsers() {
        return [
            {
                id: "ADM001",
                username: "admin",
                password: "admin123",
                name: "Library Administrator",
                role: "admin",
                email: "admin@smartlib.edu",
                phone: "+91 98765 00001",
                department: "Central Administration",
                membershipType: "Administrator",
                registrationDate: "2024-01-01",
                status: "Active",
                memberId: null
            },
            {
                id: "FAC001",
                username: "faculty",
                password: "faculty123",
                name: "Dr. Rajesh Kumar",
                role: "faculty",
                email: "rajesh.kumar@smartlib.edu",
                phone: "+91 98765 43210",
                department: "Computer Science & Engineering",
                membershipType: "Faculty",
                registrationDate: "2024-01-15",
                status: "Active",
                memberId: "FAC001"
            },
            {
                id: "STU001",
                username: "student",
                password: "student123",
                name: "Rahul Sharma",
                role: "student",
                email: "rahul.s23@student.smartlib.edu",
                phone: "+91 98765 43214",
                department: "Computer Science",
                year: "3",
                membershipType: "Student",
                registrationDate: "2024-08-20",
                status: "Active",
                memberId: "STU001"
            }
        ];
    }

    static getUsers() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEYS.USERS);
            if (!raw) {
                const defaults = this.getDefaultUsers();
                localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(defaults));
                return defaults;
            }
            return JSON.parse(raw);
        } catch (e) {
            console.error("Error loading users:", e);
            return this.getDefaultUsers();
        }
    }

    static saveUsers(users) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        } catch (e) {
            console.error("Error saving users:", e);
        }
    }

    /**
     * Register a new user (Student, Faculty, or Admin)
     * Validates required fields, email format, phone, password, uniqueness, and persists the account.
     */
    static register(userData) {
        const role = String(userData.role || userData.membershipType || 'student').toLowerCase().trim();
        if (role !== 'student' && role !== 'faculty' && role !== 'admin') {
            throw new Error("Invalid registration role. Allowed roles are Student, Faculty, and Admin.");
        }

        const name = String(userData.name || '').trim();
        const id = String(userData.id || userData.adminId || userData.studentId || userData.facultyId || userData.memberId || '').trim();
        const email = String(userData.email || '').trim().toLowerCase();
        const phone = String(userData.phone || '').trim();
        const department = role === 'admin' 
            ? String(userData.department || 'Central Administration').trim() 
            : String(userData.department || '').trim();
        const year = role === 'student' ? String(userData.year || '1').trim() : null;
        const password = String(userData.password || '');
        const confirmPassword = String(userData.confirmPassword || '');

        // Validation 1: Required Fields
        if (!id) {
            if (role === 'admin') throw new Error("Admin ID is required.");
            if (role === 'faculty') throw new Error("Faculty ID is required.");
            throw new Error("Student ID is required.");
        }
        if (!name) throw new Error("Full Name is required.");
        if (!email) throw new Error("Email address is required.");
        if (!phone) throw new Error("Phone number is required.");
        if (role !== 'admin' && !department) throw new Error("Department is required.");
        if (role === 'student' && !year) throw new Error("Academic Year is required.");
        if (!password) throw new Error("Password is required.");

        // Validation 2: Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Please enter a valid email address.");
        }

        // Validation 3: Phone number format (at least 10 digits)
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
            throw new Error("Please enter a valid 10-digit phone number.");
        }

        // Validation 4: Password Minimum Length
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long.");
        }

        // Validation 5: Password Confirmation Match
        if (confirmPassword && password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const users = this.getUsers();

        // Validation 6: Uniqueness Checks
        const existingById = users.find(u => u.id.toLowerCase() === id.toLowerCase() || u.username.toLowerCase() === id.toLowerCase());
        if (existingById) {
            if (role === 'admin') {
                throw new Error("An administrator with this Admin ID already exists.");
            } else if (role === 'faculty') {
                throw new Error("A faculty member with this Faculty ID already exists.");
            } else {
                throw new Error("A student with this Student ID already exists.");
            }
        }

        const existingByEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingByEmail) {
            throw new Error("Email address is already registered.");
        }

        // Create User Account Record
        const newUser = {
            id,
            username: id,
            name,
            role,
            email,
            phone,
            department,
            year,
            password,
            membershipType: role === 'admin' ? 'Administrator' : (role === 'faculty' ? 'Faculty' : 'Student'),
            registrationDate: new Date().toISOString().split('T')[0],
            status: userData.status || 'Active',
            memberId: role === 'admin' ? null : id
        };

        users.push(newUser);
        this.saveUsers(users);

        // Synchronize with Library Members in LocalStorage for Student & Faculty only
        if (role !== 'admin') {
            try {
                const rawMembers = StorageService.load(StorageService.STORAGE_KEYS.MEMBERS, StorageService.getDefaultMembers());
                const memberExists = rawMembers.some(m => m.memberId.toLowerCase() === id.toLowerCase());
                if (!memberExists) {
                    const newMember = new Member({
                        memberId: id,
                        name,
                        email,
                        phone,
                        membershipType: newUser.membershipType,
                        department,
                        year,
                        registrationDate: newUser.registrationDate,
                        borrowedBooks: [],
                        fine: 0,
                        status: newUser.status
                    });
                    rawMembers.push(newMember);
                    StorageService.save(StorageService.STORAGE_KEYS.MEMBERS, rawMembers);
                }
            } catch (e) {
                console.error("Error syncing new user to library members:", e);
            }
        }

        return newUser;
    }

    /**
     * Authenticate user credentials
     */
    static async login(username, password, role = null, remember = true) {
        await new Promise(r => setTimeout(r, 200));

        const u = String(username).trim().toLowerCase();
        const p = String(password).trim();
        const users = this.getUsers();

        const user = users.find(account => 
            (account.username.toLowerCase() === u || account.id.toLowerCase() === u || account.email.toLowerCase() === u) && 
            account.password === p
        );

        if (!user) {
            throw new Error("Invalid username or password. Please check your credentials.");
        }

        if (role && role !== 'all' && user.role !== role) {
            throw new Error(`Account "${user.username}" is registered as "${user.role}", not "${role}".`);
        }

        if (user.status === 'Inactive') {
            throw new Error("Your account is currently inactive. Please contact a system administrator.");
        }

        const sessionData = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            email: user.email,
            phone: user.phone,
            department: user.department,
            year: user.year,
            membershipType: user.membershipType,
            registrationDate: user.registrationDate,
            status: user.status || 'Active',
            memberId: user.memberId || user.id,
            loginTime: new Date().toISOString()
        };

        if (remember) {
            localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        }

        return sessionData;
    }

    static logout() {
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        sessionStorage.removeItem(this.STORAGE_KEYS.SESSION);
    }

    static getCurrentUser() {
        try {
            const sessionStr = localStorage.getItem(this.STORAGE_KEYS.SESSION) || 
                               sessionStorage.getItem(this.STORAGE_KEYS.SESSION);
            return sessionStr ? JSON.parse(sessionStr) : null;
        } catch (e) {
            return null;
        }
    }

    static updateUserAccount(userId, updatedFields) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id.toLowerCase() === String(userId).toLowerCase());
        if (userIndex === -1) return false;

        // Safety check: Do not deactivate/delete the only active administrator
        if (updatedFields.status === 'Inactive' && users[userIndex].role === 'admin') {
            const activeAdmins = users.filter(u => u.role === 'admin' && u.status === 'Active');
            if (activeAdmins.length <= 1 && activeAdmins[0].id.toLowerCase() === String(userId).toLowerCase()) {
                throw new Error("At least one active administrator must remain in the system.");
            }
        }

        if (updatedFields.name) users[userIndex].name = updatedFields.name;
        if (updatedFields.email) users[userIndex].email = updatedFields.email;
        if (updatedFields.phone) users[userIndex].phone = updatedFields.phone;
        if (updatedFields.department) users[userIndex].department = updatedFields.department;
        if (updatedFields.year) users[userIndex].year = updatedFields.year;
        if (updatedFields.status) users[userIndex].status = updatedFields.status;

        this.saveUsers(users);

        // Update active session if editing currently logged in user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id.toLowerCase() === String(userId).toLowerCase()) {
            Object.assign(currentUser, updatedFields);
            localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(currentUser));
        }

        return true;
    }

    static updateCurrentUserProfile(updatedFields) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;
        return this.updateUserAccount(currentUser.id, updatedFields);
    }

    static isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    static hasRole(allowedRoles) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (typeof allowedRoles === 'string') {
            return user.role === allowedRoles;
        }
        return allowedRoles.includes(user.role);
    }

    static requireRole(allowedRoles, customMessage = null) {
        const user = this.getCurrentUser();
        if (!user) {
            Toast.error("Authentication required. Please log in.");
            return false;
        }

        const isAllowed = typeof allowedRoles === 'string' 
            ? user.role === allowedRoles 
            : allowedRoles.includes(user.role);

        if (!isAllowed) {
            const message = customMessage || "Access Restricted — Administrator privileges required.";
            Toast.error(message);
            return false;
        }

        return true;
    }

    // ==========================================
    // PASSWORD RESET WORKFLOW (Student / Faculty / Admin)
    // ==========================================

    static getResetCodes() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEYS.RESET_CODES);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    static saveResetCodes(codes) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.RESET_CODES, JSON.stringify(codes));
        } catch (e) {
            console.error("Error saving reset codes:", e);
        }
    }

    /**
     * Mask email for privacy (e.g. rahul.s23@student.smartlib.edu -> r•••••@student.smartlib.edu)
     */
    static maskEmail(email) {
        if (!email || typeof email !== 'string' || !email.includes('@')) return '•••••@•••••.edu';
        const parts = email.split('@');
        const namePart = parts[0];
        const domainPart = parts[1];
        
        if (namePart.length <= 2) {
            return `${namePart[0]}•••••@${domainPart}`;
        }
        return `${namePart[0]}•••••${namePart[namePart.length - 1]}@${domainPart}`;
    }

    /**
     * Find user for password reset with strict role validation
     */
    static findUserForReset(id, role) {
        const targetId = String(id || '').trim().toLowerCase();
        const targetRole = String(role || '').trim().toLowerCase();

        if (!targetId) {
            const roleLabels = { student: 'Student ID', faculty: 'Faculty ID', admin: 'Admin ID' };
            throw new Error(`Please enter your ${roleLabels[targetRole] || 'ID'}.`);
        }

        const users = this.getUsers();
        const user = users.find(u => 
            (u.id.toLowerCase() === targetId || (u.username && u.username.toLowerCase() === targetId)) && 
            u.role.toLowerCase() === targetRole
        );

        if (!user) {
            if (targetRole === 'student') {
                throw new Error("No student account was found with this Student ID.");
            } else if (targetRole === 'faculty') {
                throw new Error("No faculty account was found with this Faculty ID.");
            } else if (targetRole === 'admin') {
                throw new Error("No administrator account was found with this Admin ID.");
            }
            throw new Error("Account not found.");
        }

        return {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            maskedEmail: this.maskEmail(user.email)
        };
    }

    /**
     * Generate a 6-digit temporary verification code (valid 10 minutes)
     */
    static generateResetCode(id, role) {
        const user = this.findUserForReset(id, role);
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const key = `${user.id.toUpperCase()}_${user.role.toLowerCase()}`;

        const resetStore = this.getResetCodes();
        resetStore[key] = {
            userId: user.id,
            role: user.role,
            code: code,
            createdAt: Date.now(),
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
            attempts: 0,
            verified: false
        };
        this.saveResetCodes(resetStore);

        return {
            success: true,
            maskedEmail: user.maskedEmail,
            simulatedCode: code // Used for demo verification prompt
        };
    }

    /**
     * Verify the 6-digit code with expiry and max 5 attempts protection
     */
    static verifyResetCode(id, role, inputCode) {
        const targetId = String(id || '').trim().toUpperCase();
        const targetRole = String(role || '').trim().toLowerCase();
        const codeStr = String(inputCode || '').trim();

        if (!codeStr) {
            throw new Error("Please enter the 6-digit verification code.");
        }

        const key = `${targetId}_${targetRole}`;
        const resetStore = this.getResetCodes();
        const record = resetStore[key];

        if (!record) {
            throw new Error("No active verification session found. Please request a new code.");
        }

        if (Date.now() > record.expiresAt) {
            delete resetStore[key];
            this.saveResetCodes(resetStore);
            throw new Error("This verification code has expired. Please request a new code.");
        }

        if (record.attempts >= 5) {
            delete resetStore[key];
            this.saveResetCodes(resetStore);
            throw new Error("Too many verification attempts. Please request a new code.");
        }

        record.attempts += 1;

        if (record.code !== codeStr) {
            this.saveResetCodes(resetStore);
            const remaining = 5 - record.attempts;
            if (remaining <= 0) {
                delete resetStore[key];
                this.saveResetCodes(resetStore);
                throw new Error("Too many verification attempts. Please request a new code.");
            }
            throw new Error("Incorrect verification code. Please try again.");
        }

        record.verified = true;
        record.verifiedAt = Date.now();
        this.saveResetCodes(resetStore);
        return true;
    }

    /**
     * Calculate password strength dynamically
     */
    static calculatePasswordStrength(password) {
        const pwd = String(password || '');
        if (!pwd) return { score: 0, label: 'None', percent: 0, color: 'var(--border-color)' };

        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

        if (score <= 1) {
            return { score: 1, label: 'Weak', percent: 25, color: 'var(--status-rejected)' };
        } else if (score === 2) {
            return { score: 2, label: 'Fair', percent: 50, color: '#ED8936' };
        } else if (score === 3 || score === 4) {
            return { score: 3, label: 'Good', percent: 75, color: '#38A169' };
        } else {
            return { score: 4, label: 'Strong', percent: 100, color: 'var(--gold-accent)' };
        }
    }

    /**
     * Reset the user password after verification
     */
    static resetPassword(id, role, newPassword, confirmPassword) {
        const targetId = String(id || '').trim().toUpperCase();
        const targetRole = String(role || '').trim().toLowerCase();
        const key = `${targetId}_${targetRole}`;

        const resetStore = this.getResetCodes();
        const record = resetStore[key];

        if (!record || !record.verified) {
            throw new Error("Verification required. Please complete the code verification step.");
        }

        // Must be reset within 15 minutes of verification
        if (Date.now() - record.verifiedAt > 15 * 60 * 1000) {
            delete resetStore[key];
            this.saveResetCodes(resetStore);
            throw new Error("Reset session expired. Please start the password recovery process again.");
        }

        const newPass = String(newPassword || '');
        const confPass = String(confirmPassword || '');

        if (!newPass || newPass.length < 6) {
            throw new Error("New password must be at least 6 characters long.");
        }

        if (newPass !== confPass) {
            throw new Error("Passwords do not match.");
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => 
            u.id.toUpperCase() === targetId && u.role.toLowerCase() === targetRole
        );

        if (userIndex === -1) {
            throw new Error("User account not found.");
        }

        // Update ONLY password, preserve all other attributes
        users[userIndex].password = newPass;
        this.saveUsers(users);

        // Invalidate reset session
        delete resetStore[key];
        this.saveResetCodes(resetStore);

        return {
            success: true,
            user: {
                id: users[userIndex].id,
                name: users[userIndex].name,
                role: users[userIndex].role
            }
        };
    }
}
