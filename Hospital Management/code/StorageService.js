/**
 * StorageService
 * Manages LocalStorage persistence, seed datasets, and migration for the Smart Library Management System.
 */

import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { Transaction } from '../models/Transaction.js';
import { Reservation } from '../models/Reservation.js';
import { BookRequest } from '../models/BookRequest.js';

export class StorageService {
    static STORAGE_KEYS = {
        BOOKS: 'slms_books',
        MEMBERS: 'slms_members',
        TRANSACTIONS: 'slms_transactions',
        RESERVATIONS: 'slms_reservations',
        REQUESTS: 'slms_book_requests',
        SETTINGS: 'slms_settings'
    };

    static getDefaultBooks() {
        return [
            new Book({
                bookId: 101,
                title: "Design Patterns: Elements of Reusable Object-Oriented Software",
                author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
                isbn: "978-0201633610",
                category: "Software Engineering",
                totalCopies: 4,
                availableCopies: 2,
                location: "Shelf CS-01",
                publicationYear: 1994,
                borrowCount: 18,
                description: "The classic seminal work on object-oriented software design patterns and architectural best practices."
            }),
            new Book({
                bookId: 102,
                title: "Clean Code: A Handbook of Agile Software Craftsmanship",
                author: "Robert C. Martin",
                isbn: "978-0132350884",
                category: "Software Engineering",
                totalCopies: 5,
                availableCopies: 3,
                location: "Shelf CS-01",
                publicationYear: 2008,
                borrowCount: 29,
                description: "Practical principles, patterns, and practices of writing clean, maintainable, and readable code."
            }),
            new Book({
                bookId: 103,
                title: "Introduction to Algorithms (CLRS)",
                author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
                isbn: "978-0262033848",
                category: "Algorithms & Data Structures",
                totalCopies: 6,
                availableCopies: 1,
                location: "Shelf CS-02",
                publicationYear: 2009,
                borrowCount: 45,
                description: "Comprehensive textbook on contemporary algorithms, data structures, and mathematical proofs."
            }),
            new Book({
                bookId: 104,
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt, David Thomas",
                isbn: "978-0201616224",
                category: "Software Engineering",
                totalCopies: 3,
                availableCopies: 2,
                location: "Shelf CS-01",
                publicationYear: 1999,
                borrowCount: 22,
                description: "Timeless advice on software development craft, career development, and problem solving."
            }),
            new Book({
                bookId: 105,
                title: "Algorithms in C++ (Parts 1-4)",
                author: "Robert Sedgewick",
                isbn: "978-0201350883",
                category: "Algorithms & Data Structures",
                totalCopies: 2,
                availableCopies: 0, // Out of stock to test Priority Queue
                location: "Shelf CS-02",
                publicationYear: 1998,
                borrowCount: 31,
                description: "In-depth treatment of fundamental algorithms, trees, hashing, and graphs in C++."
            }),
            new Book({
                bookId: 106,
                title: "Artificial Intelligence: A Modern Approach",
                author: "Stuart Russell, Peter Norvig",
                isbn: "978-0136042594",
                category: "Artificial Intelligence",
                totalCopies: 4,
                availableCopies: 2,
                location: "Shelf CS-03",
                publicationYear: 2020,
                borrowCount: 38,
                description: "The authoritative textbook on intelligent agents, machine learning, and probabilistic reasoning."
            }),
            new Book({
                bookId: 107,
                title: "Computer Networks: A Systems Approach",
                author: "Larry L. Peterson, Bruce S. Davie",
                isbn: "978-0123850591",
                category: "Networking",
                totalCopies: 3,
                availableCopies: 1,
                location: "Shelf CS-04",
                publicationYear: 2011,
                borrowCount: 14,
                description: "Concepts and principles that govern the Internet and high-speed modern networks."
            }),
            new Book({
                bookId: 108,
                title: "Database System Concepts",
                author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
                isbn: "978-0073523323",
                category: "Database Systems",
                totalCopies: 5,
                availableCopies: 3,
                location: "Shelf CS-05",
                publicationYear: 2019,
                borrowCount: 27,
                description: "Fundamental concepts of database management, SQL, relational calculus, and query optimization."
            }),
            new Book({
                bookId: 109,
                title: "Operating System Concepts",
                author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
                isbn: "978-1118063330",
                category: "Operating Systems",
                totalCopies: 4,
                availableCopies: 2,
                location: "Shelf CS-06",
                publicationYear: 2018,
                borrowCount: 33,
                description: "Classic dinosaur book covering processes, virtual memory, concurrency, and file systems."
            }),
            new Book({
                bookId: 110,
                title: "The C Programming Language (2nd Edition)",
                author: "Brian W. Kernighan, Dennis M. Ritchie",
                isbn: "978-0131103627",
                category: "Programming Languages",
                totalCopies: 4,
                availableCopies: 2,
                location: "Shelf CS-07",
                publicationYear: 1988,
                borrowCount: 42,
                description: "The authoritative guide to ANSI C written by its creators."
            }),
            new Book({
                bookId: 111,
                title: "Effective Java",
                author: "Joshua Bloch",
                isbn: "978-0134685991",
                category: "Programming Languages",
                totalCopies: 3,
                availableCopies: 1,
                location: "Shelf CS-07",
                publicationYear: 2018,
                borrowCount: 20,
                description: "Best practices and idioms for the Java programming platform."
            }),
            new Book({
                bookId: 112,
                title: "Deep Learning",
                author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
                isbn: "978-0262035613",
                category: "Artificial Intelligence",
                totalCopies: 3,
                availableCopies: 0, // Out of stock to test Priority Queue
                location: "Shelf CS-03",
                publicationYear: 2016,
                borrowCount: 36,
                description: "Mathematical and conceptual background of deep neural networks and representation learning."
            }),
            new Book({
                bookId: 113,
                title: "Structure and Interpretation of Computer Programs (SICP)",
                author: "Harold Abelson, Gerald Jay Sussman, Julie Sussman",
                isbn: "978-0262510875",
                category: "Computer Science Theory",
                totalCopies: 2,
                availableCopies: 1,
                location: "Shelf CS-08",
                publicationYear: 1996,
                borrowCount: 19,
                description: "MIT classic text on computational processes, abstraction, and functional programming."
            }),
            new Book({
                bookId: 114,
                title: "Compilers: Principles, Techniques, and Tools (Dragon Book)",
                author: "Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman",
                isbn: "978-0321486813",
                category: "Computer Science Theory",
                totalCopies: 3,
                availableCopies: 2,
                location: "Shelf CS-08",
                publicationYear: 2006,
                borrowCount: 16,
                description: "The definitive guide to compiler construction, lexical analysis, and code generation."
            }),
            new Book({
                bookId: 115,
                title: "Refactoring: Improving the Design of Existing Code",
                author: "Martin Fowler",
                isbn: "978-0134757599",
                category: "Software Engineering",
                totalCopies: 3,
                availableCopies: 1,
                location: "Shelf CS-01",
                publicationYear: 2018,
                borrowCount: 24,
                description: "Techniques for restructuring existing bodies of code safely without changing external behavior."
            }),
            new Book({
                bookId: 116,
                title: "Head First Design Patterns",
                author: "Eric Freeman, Elisabeth Robson",
                isbn: "978-1492078005",
                category: "Software Engineering",
                totalCopies: 4,
                availableCopies: 3,
                location: "Shelf CS-01",
                publicationYear: 2020,
                borrowCount: 25,
                description: "Brain-friendly guide to design patterns with rich visuals and interactive puzzles."
            }),
            new Book({
                bookId: 117,
                title: "Designing Data-Intensive Applications",
                author: "Martin Kleppmann",
                isbn: "978-1449373320",
                category: "Distributed Systems",
                totalCopies: 4,
                availableCopies: 2,
                location: "Shelf CS-09",
                publicationYear: 2017,
                borrowCount: 39,
                description: "The big ideas behind reliable, scalable, and maintainable distributed data systems."
            }),
            new Book({
                bookId: 118,
                title: "Cracking the Coding Interview",
                author: "Gayle Laakmann McDowell",
                isbn: "978-0984782857",
                category: "Algorithms & Data Structures",
                totalCopies: 5,
                availableCopies: 0, // Out of stock
                location: "Shelf CS-02",
                publicationYear: 2015,
                borrowCount: 52,
                description: "189 programming interview questions with solutions covering trees, graphs, and dynamic programming."
            }),
            new Book({
                bookId: 119,
                title: "Modern Operating Systems (4th Edition)",
                author: "Andrew S. Tanenbaum, Herbert Bos",
                isbn: "978-0133591620",
                category: "Operating Systems",
                totalCopies: 3,
                availableCopies: 2,
                location: "Shelf CS-06",
                publicationYear: 2014,
                borrowCount: 17,
                description: "Clear coverage of operating systems design, virtualization, and multi-core architectures."
            }),
            new Book({
                bookId: 120,
                title: "Data Structures and Algorithm Analysis in Java",
                author: "Mark Allen Weiss",
                isbn: "978-0132576277",
                category: "Algorithms & Data Structures",
                totalCopies: 4,
                availableCopies: 3,
                location: "Shelf CS-02",
                publicationYear: 2011,
                borrowCount: 28,
                description: "Rigorous treatment of data structures with Java implementations and algorithmic time complexity."
            }),
            new Book({
                bookId: 121,
                title: "Clean Architecture: A Craftsman's Guide to Software Structure",
                author: "Robert C. Martin",
                isbn: "978-0134494166",
                category: "Software Engineering",
                totalCopies: 3,
                availableCopies: 2,
                location: "Shelf CS-01",
                publicationYear: 2017,
                borrowCount: 21,
                description: "Universal rules of software architecture and domain-driven design."
            })
        ];
    }

    static getDefaultMembers() {
        return [
            new Member({
                memberId: "FAC001",
                name: "Dr. Rajesh Kumar",
                email: "rajesh.kumar@smartlib.edu",
                phone: "+91 98765 43210",
                membershipType: "Faculty",
                registrationDate: "2024-01-15",
                borrowedBooks: [103],
                fine: 0
            }),
            new Member({
                memberId: "FAC002",
                name: "Dr. Meenakshi Sundaram",
                email: "meenakshi@smartlib.edu",
                phone: "+91 98765 43211",
                membershipType: "Faculty",
                registrationDate: "2024-02-10",
                borrowedBooks: [],
                fine: 0
            }),
            new Member({
                memberId: "MEM-103",
                name: "Vikram Sengupta",
                email: "vikram.phd@smartlib.edu",
                phone: "+91 98765 43212",
                membershipType: "Research Scholar",
                registrationDate: "2024-03-05",
                borrowedBooks: [106],
                fine: 20
            }),
            new Member({
                memberId: "MEM-104",
                name: "Pooja Hegde",
                email: "pooja.res@smartlib.edu",
                phone: "+91 98765 43213",
                membershipType: "Research Scholar",
                registrationDate: "2024-04-12",
                borrowedBooks: [],
                fine: 0
            }),
            new Member({
                memberId: "STU001",
                name: "Rahul Sharma",
                email: "rahul.s23@student.smartlib.edu",
                phone: "+91 98765 43214",
                membershipType: "Student",
                registrationDate: "2024-08-20",
                borrowedBooks: [108],
                fine: 0
            }),
            new Member({
                memberId: "STU002",
                name: "Arun Kumar",
                email: "arun@smartlib.edu",
                phone: "+91 98765 43215",
                membershipType: "Student",
                registrationDate: "2024-08-22",
                borrowedBooks: [],
                fine: 0
            }),
            new Member({
                memberId: "MEM-107",
                name: "Karthik Raja",
                email: "karthik.r24@student.smartlib.edu",
                phone: "+91 98765 43216",
                membershipType: "Student",
                registrationDate: "2024-08-25",
                borrowedBooks: [],
                fine: 0
            }),
            new Member({
                memberId: "MEM-108",
                name: "Neha Nair",
                email: "neha.n24@student.smartlib.edu",
                phone: "+91 98765 43217",
                membershipType: "Student",
                registrationDate: "2024-09-01",
                borrowedBooks: [],
                fine: 15
            }),
            new Member({
                memberId: "MEM-109",
                name: "Siddharth Jain",
                email: "siddharth.j24@student.smartlib.edu",
                phone: "+91 98765 43218",
                membershipType: "Student",
                registrationDate: "2024-09-05",
                borrowedBooks: [],
                fine: 0
            }),
            new Member({
                memberId: "MEM-110",
                name: "Divya Prakash",
                email: "divya.p24@student.smartlib.edu",
                phone: "+91 98765 43219",
                membershipType: "Student",
                registrationDate: "2024-09-10",
                borrowedBooks: [],
                fine: 0
            })
        ];
    }

    static getDefaultTransactions() {
        return [
            new Transaction({
                transactionId: "TX-1001",
                bookId: 103,
                bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
                memberId: "FAC001",
                memberName: "Dr. Rajesh Kumar",
                action: "Issued",
                issueDate: "2026-08-10",
                dueDate: "2026-08-24",
                returnDate: null,
                fine: 0,
                status: "Active"
            }),
            new Transaction({
                transactionId: "TX-1002",
                bookId: 106,
                bookTitle: "The Pragmatic Programmer: Your Journey to Mastery",
                memberId: "MEM-103",
                memberName: "Vikram Sengupta",
                action: "Issued",
                issueDate: "2026-08-01",
                dueDate: "2026-08-15",
                returnDate: null,
                fine: 20,
                status: "Overdue"
            }),
            new Transaction({
                transactionId: "TX-1003",
                bookId: 108,
                bookTitle: "Algorithms in C++ (Parts 1-4)",
                memberId: "STU001",
                memberName: "Rahul Sharma",
                action: "Issued",
                issueDate: "2026-08-12",
                dueDate: "2026-08-26",
                returnDate: null,
                fine: 0,
                status: "Active"
            }),
            new Transaction({
                transactionId: "TX-1004",
                bookId: 101,
                bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
                memberId: "STU002",
                memberName: "Arun Kumar",
                action: "Returned",
                issueDate: "2026-07-15",
                dueDate: "2026-07-29",
                returnDate: "2026-07-28",
                fine: 0,
                status: "Completed"
            }),
            new Transaction({
                transactionId: "TX-1005",
                bookId: 111,
                bookTitle: "Database System Concepts (7th Edition)",
                memberId: "MEM-108",
                memberName: "Neha Nair",
                action: "Returned",
                issueDate: "2026-07-10",
                dueDate: "2026-07-24",
                returnDate: "2026-07-27",
                fine: 15,
                status: "Completed"
            })
        ];
    }

    static getDefaultReservations() {
        return [
            new Reservation({
                reservationId: "RES-201",
                userId: "FAC001",
                userRole: "faculty",
                userName: "Dr. Rajesh Kumar",
                bookId: 105,
                bookTitle: "Introduction to Algorithms (4th Edition)",
                requestTime: "2026-08-22T09:30:00Z",
                priority: 1, // Faculty
                status: "Pending"
            }),
            new Reservation({
                reservationId: "RES-202",
                userId: "MEM-103",
                userRole: "faculty",
                userName: "Vikram Sengupta",
                bookId: 105,
                bookTitle: "Introduction to Algorithms (4th Edition)",
                requestTime: "2026-08-22T10:15:00Z",
                priority: 2, // Scholar
                status: "Pending"
            }),
            new Reservation({
                reservationId: "RES-203",
                userId: "STU001",
                userRole: "student",
                userName: "Rahul Sharma",
                bookId: 105,
                bookTitle: "Introduction to Algorithms (4th Edition)",
                requestTime: "2026-08-22T11:00:00Z",
                priority: 3, // Student
                status: "Pending"
            })
        ];
    }

    static getDefaultRequests() {
        return [
            new BookRequest({
                requestId: "REQ-101",
                userId: "FAC002",
                userRole: "faculty",
                userName: "Dr. Meenakshi Sundaram",
                bookId: 103,
                bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
                requestDate: "2026-08-23T14:30:00Z",
                status: "Pending"
            }),
            new BookRequest({
                requestId: "REQ-102",
                userId: "STU001",
                userRole: "student",
                userName: "Rahul Sharma",
                bookId: 101,
                bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
                requestDate: "2026-08-23T15:45:00Z",
                status: "Pending"
            })
        ];
    }

    static getDefaultSettings() {
        return {
            libraryName: "Smart Library System",
            finePerDay: 5,
            maxBorrowDays: 14,
            maxBooksPerMember: 4,
            theme: "light"
        };
    }

    /**
     * Data Migration: Ensure every request and reservation has proper userId, userRole, and userName
     */
    static migrateData() {
        try {
            // 1. Migrate Reservations
            const rawRes = localStorage.getItem(this.STORAGE_KEYS.RESERVATIONS);
            if (rawRes) {
                const reservations = JSON.parse(rawRes);
                const migrated = reservations.map(r => {
                    const userId = r.userId || r.memberId || 'UNKNOWN';
                    let userRole = r.userRole || r.memberType || 'student';
                    userRole = userRole.toLowerCase();
                    if (userRole.includes('faculty')) userRole = 'faculty';
                    else if (userRole.includes('scholar') || userRole.includes('research')) userRole = 'researcher';
                    else userRole = 'student';

                    return {
                        ...r,
                        userId,
                        userRole,
                        userName: r.userName || r.memberName || 'Library User'
                    };
                });
                localStorage.setItem(this.STORAGE_KEYS.RESERVATIONS, JSON.stringify(migrated));
            }

            // 2. Migrate Requests
            const rawReq = localStorage.getItem(this.STORAGE_KEYS.REQUESTS);
            if (rawReq) {
                const requests = JSON.parse(rawReq);
                const migrated = requests.map(req => {
                    return {
                        ...req,
                        userId: req.userId || req.memberId || 'UNKNOWN',
                        userRole: (req.userRole || 'student').toLowerCase(),
                        userName: req.userName || req.memberName || 'Library User'
                    };
                });
                localStorage.setItem(this.STORAGE_KEYS.REQUESTS, JSON.stringify(migrated));
            }
        } catch (e) {
            console.error("Data migration error:", e);
        }
    }

    static load(key, defaultData) {
        try {
            const item = localStorage.getItem(key);
            if (!item) {
                this.save(key, defaultData);
                return defaultData;
            }
            return JSON.parse(item);
        } catch (e) {
            console.error(`Error loading key "${key}" from LocalStorage:`, e);
            return defaultData;
        }
    }

    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving key "${key}" to LocalStorage:`, e);
        }
    }

    static resetAll() {
        localStorage.removeItem(this.STORAGE_KEYS.BOOKS);
        localStorage.removeItem(this.STORAGE_KEYS.MEMBERS);
        localStorage.removeItem(this.STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(this.STORAGE_KEYS.RESERVATIONS);
        localStorage.removeItem(this.STORAGE_KEYS.REQUESTS);
        localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
    }
}
