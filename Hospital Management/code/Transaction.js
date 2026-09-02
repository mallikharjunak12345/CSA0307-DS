/**
 * Transaction Model Entity
 * Represents circulation records (Issuing and Returning of books).
 * Works reliably with both class instances and plain LocalStorage objects.
 */
export class Transaction {
    constructor({
        transactionId,
        id,
        bookId,
        bookTitle,
        memberId,
        userId,
        memberName,
        userName,
        action = "Issued", // "Issued" | "Returned" | "Reserved" | "Cancelled"
        issueDate = new Date().toISOString().split('T')[0],
        dueDate = "",
        returnDate = null,
        fine = 0,
        status = "Active" // "Active" | "Returned" | "Completed" | "Overdue"
    } = {}) {
        this.transactionId = transactionId || id || `TX-${Date.now().toString().slice(-6)}`;
        this.id = this.transactionId;
        this.bookId = Number(bookId);
        this.bookTitle = bookTitle || "";
        this.memberId = String(memberId || userId || "");
        this.userId = this.memberId;
        this.memberName = memberName || userName || "";
        this.userName = this.memberName;
        this.action = action;
        this.issueDate = issueDate;
        
        if (!dueDate && this.issueDate) {
            const due = new Date(this.issueDate);
            due.setDate(due.getDate() + 14); // 14 days standard borrowing period
            this.dueDate = due.toISOString().split('T')[0];
        } else {
            this.dueDate = dueDate || "";
        }

        this.returnDate = returnDate;
        this.fine = Number(fine) || 0;
        this.status = status;
    }

    /**
     * Instance method for calculating overdue status and fines
     */
    calculateOverdue(finePerDay = 5) {
        return Transaction.calculateOverdue(this, finePerDay);
    }

    /**
     * Instance method for marking transaction as returned
     */
    markReturned(fine = 0, returnDate = null) {
        return Transaction.markReturned(this, fine, returnDate);
    }

    /**
     * Static helper for calculating overdue status and fines on any transaction object
     * (Safe for both class instances and plain JSON objects from LocalStorage)
     */
    static calculateOverdue(tx, finePerDay = 5) {
        if (!tx) return { isOverdue: false, daysOverdue: 0, fine: 0 };
        
        // If already returned, return existing recorded fine
        if (tx.returnDate || tx.status === "Returned" || tx.status === "returned" || tx.status === "Completed") {
            return { isOverdue: false, daysOverdue: 0, fine: Number(tx.fine) || 0 };
        }

        if (!tx.dueDate) {
            return { isOverdue: false, daysOverdue: 0, fine: 0 };
        }

        const now = new Date();
        const due = new Date(tx.dueDate);

        // Normalize to midnight for accurate day calculations
        now.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            const calculatedFine = diffDays * Number(finePerDay);
            tx.status = "Overdue";
            tx.fine = calculatedFine;
            return { isOverdue: true, daysOverdue: diffDays, fine: calculatedFine };
        }

        return { isOverdue: false, daysOverdue: 0, fine: 0 };
    }

    /**
     * Static helper for marking any transaction object as returned
     * (Safe for both class instances and plain JSON objects from LocalStorage)
     */
    static markReturned(tx, fine = 0, returnDate = null) {
        if (!tx) return;
        tx.status = "Returned";
        tx.action = "Returned";
        tx.returnDate = returnDate || new Date().toISOString().split('T')[0];
        tx.fine = Number(fine) || 0;
        return tx;
    }
}
