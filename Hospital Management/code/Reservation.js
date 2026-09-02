/**
 * Reservation Model
 * Used within the Priority Queue (Binary Min-Heap) for book waitlists.
 */

let resCounter = 2000;

export class Reservation {
    constructor({
        reservationId,
        userId,
        memberId,
        userRole, // 'faculty' | 'student' | 'researcher'
        memberType = 'Student',
        userName,
        memberName,
        bookId,
        bookTitle,
        requestTime = new Date().toISOString(),
        priority = 3, // 1: Faculty, 2: Researcher, 3: Student
        queuePosition = null,
        status = 'Pending' // 'Pending' | 'Fulfilled' | 'Cancelled'
    }) {
        this.reservationId = reservationId || `RES-${Date.now().toString().slice(-4)}-${++resCounter}`;
        this.userId = String(userId || memberId);
        this.memberId = this.userId; // Compatibility
        
        let role = (userRole || memberType || 'student').toLowerCase();
        if (role.includes('faculty')) role = 'faculty';
        else if (role.includes('scholar') || role.includes('research')) role = 'researcher';
        else role = 'student';

        this.userRole = role;
        this.memberType = role === 'faculty' ? 'Faculty' : (role === 'researcher' ? 'Research Scholar' : 'Student');
        this.userName = userName || memberName || 'Library User';
        this.memberName = this.userName;
        this.bookId = Number(bookId);
        this.bookTitle = bookTitle;
        this.requestTime = requestTime;
        this.priority = Number(priority || (role === 'faculty' ? 1 : (role === 'researcher' ? 2 : 3)));
        this.queuePosition = queuePosition;
        this.status = status;
    }
}
