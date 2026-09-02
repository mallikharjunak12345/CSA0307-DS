/**
 * Member Model
 * Represents a library member (Student or Faculty) with circulation privileges.
 */

export class Member {
    constructor({
        memberId,
        id,
        name,
        email,
        phone,
        membershipType = "Student", // "Faculty" | "Research Scholar" | "Student"
        department = "Computer Science",
        year = null, // "1", "2", "3", "4" for students
        registrationDate = new Date().toISOString().split('T')[0],
        borrowedBooks = [],
        fine = 0,
        status = "Active" // "Active" | "Inactive"
    }) {
        this.memberId = String(memberId || id);
        this.id = this.memberId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.membershipType = membershipType;
        this.department = department;
        this.year = membershipType === 'Student' ? (year || '1') : null;
        this.registrationDate = registrationDate;
        this.borrowedBooks = Array.isArray(borrowedBooks) ? [...borrowedBooks] : [];
        this.fine = Number(fine) || 0;
        this.status = status;
    }

    getPriorityLevel() {
        switch (this.membershipType) {
            case 'Faculty': return 1;
            case 'Research Scholar': return 2;
            case 'Student': return 3;
            default: return 3;
        }
    }
}
