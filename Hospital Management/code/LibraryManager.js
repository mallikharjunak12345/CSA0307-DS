/**
 * LibraryManager
 * Core business logic coordinator managing books, members, transactions, priority reservations, and book requests.
 */

import { BinarySearchTree } from '../ds/BinarySearchTree.js';
import { HashTable } from '../ds/HashTable.js';
import { PriorityQueue } from '../ds/PriorityQueue.js';
import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { Transaction } from '../models/Transaction.js';
import { Reservation } from '../models/Reservation.js';
import { BookRequest } from '../models/BookRequest.js';
import { StorageService } from './StorageService.js';
import { AuthService } from './AuthService.js';
import { AuditService } from './AuditService.js';

let lmCounter = 5000;

export class LibraryManager {
    constructor() {
        this.bookBST = new BinarySearchTree();
        this.bookHashTable = new HashTable(53);
        this.memberHashTable = new HashTable(29);
        this.reservationPriorityQueue = new PriorityQueue();

        this.books = [];
        this.members = [];
        this.transactions = [];
        this.reservations = [];
        this.requests = [];
        this.settings = StorageService.getDefaultSettings();

        this.loadData();
    }

    loadData() {
        StorageService.migrateData();

        // 1. Load Books
        const rawBooks = StorageService.load(StorageService.STORAGE_KEYS.BOOKS, StorageService.getDefaultBooks());
        this.books = rawBooks.map(b => new Book(b));
        this.rebuildBookIndex();

        // 2. Load Members
        const rawMembers = StorageService.load(StorageService.STORAGE_KEYS.MEMBERS, StorageService.getDefaultMembers());
        this.members = rawMembers.map(m => new Member(m));
        this.rebuildMemberIndex();

        // 3. Load Transactions
        const rawTx = StorageService.load(StorageService.STORAGE_KEYS.TRANSACTIONS, StorageService.getDefaultTransactions());
        this.transactions = rawTx.map(t => new Transaction(t));

        // 4. Load Reservations & Priority Queue
        const rawRes = StorageService.load(StorageService.STORAGE_KEYS.RESERVATIONS, StorageService.getDefaultReservations());
        this.reservations = rawRes.map(r => new Reservation(r));
        this.rebuildPriorityQueue();

        // 5. Load Book Requests
        const rawReq = StorageService.load(StorageService.STORAGE_KEYS.REQUESTS, StorageService.getDefaultRequests());
        this.requests = rawReq.map(req => new BookRequest(req));

        // 6. Load Settings
        this.settings = StorageService.load(StorageService.STORAGE_KEYS.SETTINGS, StorageService.getDefaultSettings());
    }

    rebuildBookIndex() {
        this.bookBST.clear();
        this.bookHashTable.clear();
        for (const book of this.books) {
            this.bookBST.insert(book.bookId, book);
            this.bookHashTable.insert(book.isbn, book);
        }
    }

    rebuildMemberIndex() {
        this.memberHashTable.clear();
        for (const member of this.members) {
            this.memberHashTable.insert(member.memberId, member);
        }
    }

    rebuildPriorityQueue() {
        this.reservationPriorityQueue.clear();
        for (const res of this.reservations) {
            if (res.status === 'Pending') {
                this.reservationPriorityQueue.enqueue(res);
            }
        }
    }

    saveAll() {
        StorageService.save(StorageService.STORAGE_KEYS.BOOKS, this.books);
        StorageService.save(StorageService.STORAGE_KEYS.MEMBERS, this.members);
        StorageService.save(StorageService.STORAGE_KEYS.TRANSACTIONS, this.transactions);
        StorageService.save(StorageService.STORAGE_KEYS.RESERVATIONS, this.reservations);
        StorageService.save(StorageService.STORAGE_KEYS.REQUESTS, this.requests);
        StorageService.save(StorageService.STORAGE_KEYS.SETTINGS, this.settings);
    }

    saveRequests() {
        StorageService.save(StorageService.STORAGE_KEYS.REQUESTS, this.requests);
    }

    // ==========================================
    // BOOK OPERATIONS
    // ==========================================

    getBookById(bookId) {
        const result = this.bookBST.search(Number(bookId));
        return result.found ? result.node.data : null;
    }

    getBookByISBN(isbn) {
        const res = this.bookHashTable.get(isbn);
        return res && res.found ? res.value : null;
    }

    addBook(bookData) {
        const id = Number(bookData.bookId);
        if (this.getBookById(id)) {
            throw new Error(`Book with ID #${id} already exists in the BST!`);
        }
        if (this.getBookByISBN(bookData.isbn)) {
            throw new Error(`Book with ISBN "${bookData.isbn}" already exists in the Hash Table!`);
        }

        const newBook = new Book(bookData);
        this.books.push(newBook);
        this.bookBST.insert(newBook.bookId, newBook);
        this.bookHashTable.insert(newBook.isbn, newBook);
        this.saveAll();
        AuditService.log('Added Book', `Book #${newBook.bookId} - ${newBook.title}`);
        return newBook;
    }

    updateBook(bookId, updatedFields) {
        const book = this.getBookById(bookId);
        if (!book) throw new Error(`Book #${bookId} not found.`);

        Object.assign(book, updatedFields);
        this.rebuildBookIndex();
        this.saveAll();
        AuditService.log('Updated Book', `Book #${book.bookId} - ${book.title}`);
        return book;
    }

    deleteBook(bookId) {
        const id = Number(bookId);
        const index = this.books.findIndex(b => b.bookId === id);
        if (index === -1) throw new Error(`Book #${id} not found.`);

        const [deleted] = this.books.splice(index, 1);
        this.bookBST.delete(id);
        this.bookHashTable.remove(deleted.isbn);
        this.saveAll();
        AuditService.log('Deleted Book', `Book #${deleted.bookId} - ${deleted.title}`);
        return deleted;
    }

    smartSearch(query, filters = {}) {
        let results = [...this.books];
        if (query && query.trim() !== '') {
            const q = query.trim().toLowerCase();
            if (!isNaN(q) && Number(q) > 0) {
                const bstLookup = this.getBookById(Number(q));
                if (bstLookup) return [bstLookup];
            }
            const hashLookup = this.getBookByISBN(query.trim());
            if (hashLookup) return [hashLookup];

            results = results.filter(b => 
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q) ||
                b.isbn.toLowerCase().includes(q) ||
                b.location.toLowerCase().includes(q)
            );
        }

        if (filters.category && filters.category !== 'all') {
            results = results.filter(b => b.category === filters.category);
        }
        if (filters.availability && filters.availability !== 'all') {
            if (filters.availability === 'available') results = results.filter(b => b.availableCopies > 0);
            else if (filters.availability === 'out_of_stock') results = results.filter(b => b.availableCopies === 0);
        }

        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'id_asc': results.sort((a, b) => a.bookId - b.bookId); break;
                case 'id_desc': results.sort((a, b) => b.bookId - a.bookId); break;
                case 'title_asc': results.sort((a, b) => a.title.localeCompare(b.title)); break;
                case 'popular': results.sort((a, b) => b.borrowCount - a.borrowCount); break;
                case 'year_desc': results.sort((a, b) => b.publicationYear - a.publicationYear); break;
            }
        }
        return results;
    }

    // ==========================================
    // MEMBER OPERATIONS (Admin Directory)
    // ==========================================

    getMemberById(memberId) {
        if (!memberId) return null;
        return this.members.find(m => m.memberId.toLowerCase() === String(memberId).toLowerCase()) || null;
    }

    syncMembersWithUserAccounts() {
        try {
            const users = AuthService.getUsers();
            let changed = false;
            for (const member of this.members) {
                const user = users.find(u => u.id.toLowerCase() === member.memberId.toLowerCase());
                if (user) {
                    if (member.name !== user.name ||
                        member.email !== user.email ||
                        member.phone !== user.phone ||
                        member.department !== user.department ||
                        (user.year && member.year !== user.year) ||
                        (user.status && member.status !== user.status)) {
                        member.name = user.name;
                        member.email = user.email;
                        member.phone = user.phone;
                        member.department = user.department;
                        if (user.year) member.year = user.year;
                        if (user.status) member.status = user.status;
                        changed = true;
                    }
                }
            }
            if (changed) {
                this.rebuildMemberIndex();
                this.saveAll();
            }
        } catch (e) {
            // Ignore if in minimal context
        }
    }

    addMemberFromUser(userId, role = null) {
        const uid = String(userId).trim();
        const users = AuthService.getUsers();
        const user = users.find(u => u.id.toLowerCase() === uid.toLowerCase() || u.username.toLowerCase() === uid.toLowerCase());

        if (!user) {
            const roleName = role ? (role.toLowerCase() === 'faculty' ? 'Faculty' : 'Student') : 'user';
            throw new Error(`No ${roleName.toLowerCase()} account found with ${roleName} ID ${uid}.`);
        }

        if (role && role !== 'all' && user.role.toLowerCase() !== role.toLowerCase()) {
            const expectedRole = role.toLowerCase() === 'faculty' ? 'Faculty' : 'Student';
            const actualRole = user.role.toLowerCase() === 'faculty' ? 'Faculty' : 'Student';
            throw new Error(`Account "${uid}" is registered as a ${actualRole}, not a ${expectedRole}.`);
        }

        // Check if member is already in Member Directory
        if (this.getMemberById(user.id)) {
            throw new Error("This member is already in the Member Directory.");
        }

        const newMember = new Member({
            memberId: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            department: user.department,
            year: user.year,
            membershipType: user.role === 'faculty' ? 'Faculty' : 'Student',
            status: user.status || 'Active',
            registrationDate: user.registrationDate || new Date().toISOString().split('T')[0],
            borrowedBooks: [],
            fine: 0
        });

        this.members.push(newMember);
        this.memberHashTable.insert(newMember.memberId, newMember);
        this.saveAll();
        AuditService.log('Added Member', `${newMember.name} (${newMember.memberId}) - ${newMember.membershipType}`);
        return newMember;
    }

    addMember(memberData) {
        const id = memberData.memberId || memberData.id;
        if (this.getMemberById(id)) {
            throw new Error("This member is already in the Member Directory.");
        }
        const newMember = new Member(memberData);
        this.members.push(newMember);
        this.memberHashTable.insert(newMember.memberId, newMember);
        this.saveAll();
        AuditService.log('Added Member', `${newMember.name} (${newMember.memberId}) - ${newMember.membershipType}`);
        return newMember;
    }

    updateMember(memberId, updatedFields) {
        const member = this.getMemberById(memberId);
        if (!member) throw new Error(`Member "${memberId}" not found.`);

        // Update Member Record (ID and Role cannot be changed)
        if (updatedFields.name) member.name = updatedFields.name;
        if (updatedFields.email) member.email = updatedFields.email;
        if (updatedFields.phone) member.phone = updatedFields.phone;
        if (updatedFields.department) member.department = updatedFields.department;
        if (updatedFields.year) member.year = updatedFields.year;
        if (updatedFields.status) member.status = updatedFields.status;

        this.rebuildMemberIndex();
        this.saveAll();

        // Synchronize with User Account
        AuthService.updateUserAccount(memberId, {
            name: member.name,
            email: member.email,
            phone: member.phone,
            department: member.department,
            year: member.year,
            status: member.status
        });

        AuditService.log('Updated Member', `${member.name} (${member.memberId})`);
        return member;
    }

    deleteMember(memberId) {
        const index = this.members.findIndex(m => m.memberId.toLowerCase() === String(memberId).toLowerCase());
        if (index === -1) throw new Error(`Member "${memberId}" not found.`);

        const [deleted] = this.members.splice(index, 1);
        this.memberHashTable.remove(deleted.memberId);
        this.saveAll();
        AuditService.log('Deleted Member', `${deleted.name} (${deleted.memberId})`);
        return deleted;
    }

    smartSearchMembers(query = '', filters = {}) {
        this.syncMembersWithUserAccounts();
        let results = [...this.members];
        if (query && query.trim() !== '') {
            const q = query.trim().toLowerCase();
            results = results.filter(m => 
                m.memberId.toLowerCase().includes(q) ||
                m.name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.department.toLowerCase().includes(q) ||
                (m.phone && m.phone.includes(q))
            );
        }

        if (filters.membershipType && filters.membershipType !== 'all') {
            const fType = filters.membershipType.toLowerCase();
            results = results.filter(m => m.membershipType.toLowerCase().includes(fType));
        }

        if (filters.status && filters.status !== 'all') {
            results = results.filter(m => (m.status || 'Active').toLowerCase() === filters.status.toLowerCase());
        }

        return results;
    }

    payMemberFine(memberId) {
        const member = this.getMemberById(memberId);
        if (!member) throw new Error("Member not found.");
        const paid = member.fine;
        member.fine = 0;
        this.saveAll();
        return paid;
    }

    // ==========================================
    // BOOK REQUESTS WORKFLOW (Student & Faculty -> Admin)
    // ==========================================

    requestBook(userId, userRole, userName, bookId) {
        const book = this.getBookById(bookId);
        if (!book) throw new Error(`Book #${bookId} not found.`);

        const uid = String(userId).trim();
        const role = String(userRole).toLowerCase().trim();

        // Check if user already has a pending request for this book
        const existingPending = this.requests.find(r => 
            r.userId.toLowerCase() === uid.toLowerCase() && 
            r.userRole === role && 
            r.bookId === Number(bookId) && 
            r.status === 'Pending'
        );
        if (existingPending) {
            throw new Error(`You already have a pending request for "${book.title}".`);
        }

        const newRequest = new BookRequest({
            requestId: `REQ-${Date.now().toString().slice(-4)}-${++lmCounter}`,
            userId: uid,
            userRole: role,
            userName: userName || uid,
            bookId: book.bookId,
            bookTitle: book.title,
            requestDate: new Date().toISOString(),
            status: 'Pending'
        });

        this.requests.unshift(newRequest);
        this.saveRequests();
        return newRequest;
    }

    approveRequest(requestId) {
        const request = this.requests.find(r => r.requestId === requestId);
        if (!request) throw new Error("Book request not found.");
        if (request.status !== 'Pending') {
            throw new Error(`Request is already ${request.status}.`);
        }

        const book = this.getBookById(request.bookId);
        if (!book) throw new Error("Requested book no longer exists.");

        // Check availability
        if (book.availableCopies <= 0) {
            request.status = 'Unavailable';
            request.decisionDate = new Date().toISOString();
            this.saveRequests();
            throw new Error("This book is no longer available.");
        }

        const member = this.getMemberById(request.userId);
        if (!member) throw new Error(`User account "${request.userId}" not found in members directory.`);

        // Decrement book inventory
        book.availableCopies -= 1;
        book.borrowCount = (book.borrowCount || 0) + 1;
        if (!member.borrowedBooks.includes(book.bookId)) {
            member.borrowedBooks.push(book.bookId);
        }

        // Calculate Dates
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (this.settings.maxBorrowDays || 14));

        const issueDateStr = now.toISOString().split('T')[0];
        const dueDateStr = dueDate.toISOString().split('T')[0];

        // Create Borrowing Transaction
        const transaction = new Transaction({
            transactionId: `TX-${Date.now().toString().slice(-4)}-${++lmCounter}`,
            bookId: book.bookId,
            bookTitle: book.title,
            memberId: request.userId,
            memberName: request.userName,
            action: "Issued",
            issueDate: issueDateStr,
            dueDate: dueDateStr,
            status: "Active"
        });
        this.transactions.unshift(transaction);

        // Update Request Record
        request.status = 'Approved';
        request.decisionDate = now.toISOString();
        request.issueDate = issueDateStr;
        request.dueDate = dueDateStr;
        request.transactionId = transaction.transactionId;

        // Fulfill any matching reservation if present
        const activeRes = this.reservations.find(r => 
            r.userId.toLowerCase() === request.userId.toLowerCase() && 
            r.bookId === book.bookId && 
            r.status === 'Pending'
        );
        if (activeRes) {
            activeRes.status = 'Fulfilled';
            this.rebuildPriorityQueue();
        }

        this.saveAll();
        AuditService.log('Approved Request', `${request.userName} (${request.userId}) - Book #${book.bookId} (${book.title})`);
        return { success: true, request, transaction, book };
    }

    rejectRequest(requestId) {
        const request = this.requests.find(r => r.requestId === requestId);
        if (!request) throw new Error("Book request not found.");
        if (request.status !== 'Pending') {
            throw new Error(`Request is already ${request.status}.`);
        }

        request.status = 'Rejected';
        request.decisionDate = new Date().toISOString();
        this.saveRequests();
        AuditService.log('Rejected Request', `${request.userName} (${request.userId}) - Book #${request.bookId}`);
        return { success: true, request };
    }

    cancelRequest(requestId, userId, userRole) {
        const request = this.requests.find(r => r.requestId === requestId);
        if (!request) throw new Error("Book request not found.");
        if (request.userId.toLowerCase() !== String(userId).toLowerCase() || request.userRole !== String(userRole).toLowerCase()) {
            throw new Error("You are not authorized to cancel this request.");
        }
        if (request.status !== 'Pending') {
            throw new Error(`Cannot cancel a request that is already ${request.status}.`);
        }

        request.status = 'Cancelled';
        request.decisionDate = new Date().toISOString();
        this.saveRequests();
        return { success: true, request };
    }

    // Isolated Query Helpers
    getUserRequests(userId, userRole) {
        const uid = String(userId).toLowerCase();
        const role = String(userRole).toLowerCase();
        return this.requests.filter(r => 
            r.userId.toLowerCase() === uid && 
            r.userRole.toLowerCase() === role
        );
    }

    getUserReservations(userId, userRole) {
        const uid = String(userId).toLowerCase();
        const role = String(userRole).toLowerCase();
        return this.reservations.filter(r => 
            (r.userId.toLowerCase() === uid || (r.memberId && r.memberId.toLowerCase() === uid)) && 
            r.userRole.toLowerCase() === role && 
            r.status === 'Pending'
        );
    }

    getUserTransactions(userId) {
        const uid = String(userId).toLowerCase();
        return this.transactions.filter(t => 
            t.memberId.toLowerCase() === uid || (t.userId && t.userId.toLowerCase() === uid)
        );
    }

    getUserLoans(userId) {
        const uid = String(userId).toLowerCase();
        return this.transactions.filter(t => 
            (t.memberId.toLowerCase() === uid || (t.userId && t.userId.toLowerCase() === uid)) && 
            (t.status === 'Active' || t.status === 'Overdue')
        );
    }

    // ==========================================
    // ADMIN DIRECT CIRCULATION (Issue & Return)
    // ==========================================

    issueBook(memberId, bookId) {
        const member = this.getMemberById(memberId);
        const book = this.getBookById(bookId);

        if (!member) throw new Error(`Member "${memberId}" not found.`);
        if (!book) throw new Error(`Book #${bookId} not found.`);

        if (member.borrowedBooks.length >= this.settings.maxBooksPerMember) {
            throw new Error(`Member has reached borrowing limit of ${this.settings.maxBooksPerMember} books.`);
        }
        if (member.fine > 50) {
            throw new Error(`Member has unpaid fines (₹${member.fine}). Fines must be cleared first.`);
        }
        if (book.availableCopies <= 0) {
            return {
                success: false,
                outOfStock: true,
                message: `Book "${book.title}" is out of stock (0 copies available).`
            };
        }

        book.availableCopies -= 1;
        book.borrowCount = (book.borrowCount || 0) + 1;
        member.borrowedBooks.push(book.bookId);

        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + this.settings.maxBorrowDays);

        const transaction = new Transaction({
            transactionId: `TX-${Date.now().toString().slice(-4)}-${++lmCounter}`,
            bookId: book.bookId,
            bookTitle: book.title,
            memberId: member.memberId,
            memberName: member.name,
            action: "Issued",
            issueDate: now.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            status: "Active"
        });

        this.transactions.unshift(transaction);
        this.saveAll();
        AuditService.log('Issued Book', `${member.name} (${member.memberId}) - Book #${book.bookId} (${book.title})`);
        return { success: true, transaction, member, book };
    }

    returnBook(transactionId) {
        const tid = String(transactionId).trim().toLowerCase();
        const tx = this.transactions.find(t => 
            (t.transactionId && String(t.transactionId).toLowerCase() === tid) || 
            (t.id && String(t.id).toLowerCase() === tid)
        );

        if (!tx) {
            throw new Error("Transaction not found.");
        }

        if (tx.status === "Returned" || tx.status === "returned" || tx.status === "Completed" || tx.returnDate) {
            throw new Error("This book has already been returned.");
        }

        const overdueInfo = Transaction.calculateOverdue(tx, this.settings.finePerDay || 5);
        const returnDateStr = new Date().toISOString().split('T')[0];

        // 1. Direct object updates (no dependency on prototype methods)
        tx.status = "Returned";
        tx.action = "Returned";
        tx.returnDate = returnDateStr;
        tx.fine = Number(overdueInfo.fine) || 0;

        // 2. Update Book stock safely
        const book = this.getBookById(tx.bookId);
        if (book) {
            book.availableCopies = Math.max(0, Math.min((Number(book.availableCopies) || 0) + 1, Number(book.totalCopies) || 1));
            if (book.availableCopies > 0 && book.status === "Out of Stock") {
                book.status = "Available";
            }
        }

        // 3. Update Member borrowed books & fine
        const memberId = tx.memberId || tx.userId;
        const member = this.getMemberById(memberId);
        if (member) {
            member.borrowedBooks = (member.borrowedBooks || []).filter(id => Number(id) !== Number(tx.bookId));
            if (overdueInfo.isOverdue && overdueInfo.fine > 0) {
                member.fine = (Number(member.fine) || 0) + overdueInfo.fine;
            }
        }

        // 4. Identify next reservation in the Priority Queue if any (preserving Admin-only approval)
        let nextReservation = null;
        if (this.reservationPriorityQueue && this.reservationPriorityQueue.size() > 0) {
            const queueItems = this.reservationPriorityQueue.getSortedQueue();
            const matchingReservation = queueItems.find(r => Number(r.bookId) === Number(tx.bookId) && r.status === 'Pending');
            if (matchingReservation) {
                nextReservation = matchingReservation;
            }
        }

        this.saveAll();
        AuditService.log('Returned Book', `Tx #${tx.transactionId} - Book #${tx.bookId} (${memberId})`);
        return { success: true, transaction: tx, overdueInfo, nextReservation, book, member };
    }

    // ==========================================
    // PRIORITY QUEUE RESERVATIONS
    // ==========================================

    reserveBook(userId, userRole, userName, bookId) {
        const book = this.getBookById(bookId);
        if (!book) throw new Error(`Book #${bookId} not found.`);

        const uid = String(userId);
        const role = String(userRole || 'student').toLowerCase();

        // Check if already has pending reservation
        const existing = this.reservations.find(r => 
            r.userId.toLowerCase() === uid.toLowerCase() && 
            r.userRole === role && 
            r.bookId === Number(bookId) && 
            r.status === 'Pending'
        );
        if (existing) {
            throw new Error(`You already have a pending reservation for "${book.title}".`);
        }

        const priority = role === 'faculty' ? 1 : (role === 'researcher' ? 2 : 3);

        const reservation = new Reservation({
            reservationId: `RES-${Date.now().toString().slice(-4)}-${++lmCounter}`,
            userId: uid,
            userRole: role,
            userName: userName || uid,
            bookId: book.bookId,
            bookTitle: book.title,
            requestTime: new Date().toISOString(),
            priority: priority,
            status: "Pending"
        });

        this.reservations.push(reservation);
        this.reservationPriorityQueue.enqueue(reservation);
        this.saveAll();

        const queuePos = this.getQueuePosition(reservation.reservationId);
        return { success: true, reservation, queuePosition: queuePos };
    }

    fulfillReservation(reservationId) {
        const res = this.reservations.find(r => r.reservationId === reservationId);
        if (!res) throw new Error("Reservation not found.");
        res.status = "Fulfilled";
        this.rebuildPriorityQueue();
        this.saveAll();
        return res;
    }

    cancelReservation(reservationId) {
        const res = this.reservations.find(r => r.reservationId === reservationId);
        if (!res) throw new Error("Reservation not found.");
        res.status = "Cancelled";
        this.rebuildPriorityQueue();
        this.saveAll();
        return res;
    }

    getQueuePosition(reservationId) {
        const sorted = this.reservationPriorityQueue.getSortedQueue();
        const index = sorted.findIndex(r => r.reservationId === reservationId);
        return index !== -1 ? index + 1 : 1;
    }

    // ==========================================
    // ANALYTICS & STATISTICS
    // ==========================================

    getStatistics() {
        const totalBooksCount = this.books.reduce((acc, b) => acc + b.totalCopies, 0);
        const availableBooksCount = this.books.reduce((acc, b) => acc + b.availableCopies, 0);
        const borrowedBooksCount = totalBooksCount - availableBooksCount;
        const overdueBooksCount = this.transactions.filter(t => t.status === 'Overdue').length;
        const activeReservations = this.reservations.filter(r => r.status === 'Pending').length;
        const pendingRequests = this.requests.filter(r => r.status === 'Pending').length;

        return {
            totalBooksCount,
            uniqueTitles: this.books.length,
            availableBooksCount,
            borrowedBooksCount,
            totalMembers: this.members.length,
            activeReservations,
            pendingRequests,
            overdueBooksCount
        };
    }

    getCategories() {
        const counts = {};
        for (const b of this.books) {
            counts[b.category] = (counts[b.category] || 0) + 1;
        }
        return Object.keys(counts).map(category => ({ category, count: counts[category] }));
    }

    getPopularBooks(limit = 5) {
        return [...this.books].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, limit);
    }
}
