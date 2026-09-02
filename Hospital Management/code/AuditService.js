/**
 * AuditService
 * Immutable governance and circulation audit logging for library administration.
 */

import { AuthService } from './AuthService.js';

export class AuditService {
    static STORAGE_KEY = 'slms_audit_logs';

    static getDefaultLogs() {
        return [
            {
                id: 'AUD-001',
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
                adminId: 'ADM001',
                adminName: 'Library Administrator',
                action: 'Added Book',
                target: 'Book #101 - Clean Code'
            },
            {
                id: 'AUD-002',
                timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
                adminId: 'ADM001',
                adminName: 'Library Administrator',
                action: 'Added Member',
                target: 'Rahul Sharma (STU001) - Student'
            },
            {
                id: 'AUD-003',
                timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
                adminId: 'ADM001',
                adminName: 'Library Administrator',
                action: 'Added Member',
                target: 'Dr. Rajesh Kumar (FAC001) - Faculty'
            },
            {
                id: 'AUD-004',
                timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
                adminId: 'ADM001',
                adminName: 'Library Administrator',
                action: 'Approved Request',
                target: 'Rahul Sharma (STU001) - Book #101'
            },
            {
                id: 'AUD-005',
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                adminId: 'ADM001',
                adminName: 'Library Administrator',
                action: 'Issued Book',
                target: 'STU001 - Book #101'
            }
        ];
    }

    static getLogs() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) {
                const defaults = this.getDefaultLogs();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaults));
                return defaults;
            }
            return JSON.parse(raw);
        } catch (e) {
            return this.getDefaultLogs();
        }
    }

    static saveLogs(logs) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error("Error saving audit logs:", e);
        }
    }

    static log(action, target, admin = null) {
        try {
            const currentAdmin = admin || AuthService.getCurrentUser() || { id: 'ADM001', name: 'Library Administrator' };
            const logs = this.getLogs();
            const newLog = {
                id: `AUD-${Date.now().toString().slice(-6)}`,
                timestamp: new Date().toISOString(),
                adminId: currentAdmin.id || 'ADM001',
                adminName: currentAdmin.name || 'Administrator',
                action: action,
                target: target
            };
            logs.unshift(newLog);
            if (logs.length > 200) logs.pop();
            this.saveLogs(logs);
            return newLog;
        } catch (e) {
            console.error("Audit log error:", e);
        }
    }

    static clearLogs() {
        this.saveLogs([]);
    }
}
