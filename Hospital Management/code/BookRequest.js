/**
 * BookRequest Model
 * Represents a user's request to borrow a book, awaiting Admin approval.
 */

let reqCounter = 1000;

export class BookRequest {
    constructor({
        requestId,
        userId,
        userRole, // 'student' | 'faculty'
        userName,
        bookId,
        bookTitle,
        requestDate = new Date().toISOString(),
        status = 'Pending', // 'Pending' | 'Approved' | 'Rejected' | 'Unavailable' | 'Cancelled'
        decisionDate = null,
        issueDate = null,
        dueDate = null,
        transactionId = null
    }) {
        this.requestId = requestId || `REQ-${Date.now().toString().slice(-4)}-${++reqCounter}`;
        this.userId = String(userId);
        this.userRole = String(userRole).toLowerCase();
        this.userName = userName;
        this.bookId = Number(bookId);
        this.bookTitle = bookTitle;
        this.requestDate = requestDate;
        this.status = status;
        this.decisionDate = decisionDate;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.transactionId = transactionId;
    }
}
