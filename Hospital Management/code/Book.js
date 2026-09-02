/**
 * Book Model Entity
 */
export class Book {
    constructor({
        bookId,
        isbn,
        title,
        author,
        category,
        publicationYear,
        totalCopies = 1,
        availableCopies = 1,
        location = "Shelf A-1",
        status = "Available",
        borrowCount = 0,
        description = ""
    }) {
        this.bookId = Number(bookId);
        this.isbn = String(isbn).trim();
        this.title = String(title).trim();
        this.author = String(author).trim();
        this.category = String(category).trim();
        this.publicationYear = Number(publicationYear) || new Date().getFullYear();
        this.totalCopies = Number(totalCopies);
        this.availableCopies = Number(availableCopies);
        this.location = String(location).trim();
        this.borrowCount = Number(borrowCount) || 0;
        this.description = description || `A comprehensive guide and reference on ${this.title} by ${this.author}.`;
        this.status = this.calculateStatus();
    }

    calculateStatus() {
        if (this.availableCopies <= 0) return "Out of Stock";
        if (this.availableCopies < this.totalCopies) return "Partially Issued";
        return "Available";
    }

    issueCopy() {
        if (this.availableCopies > 0) {
            this.availableCopies--;
            this.borrowCount++;
            this.status = this.calculateStatus();
            return true;
        }
        return false;
    }

    returnCopy() {
        if (this.availableCopies < this.totalCopies) {
            this.availableCopies++;
            this.status = this.calculateStatus();
            return true;
        }
        return false;
    }
}
