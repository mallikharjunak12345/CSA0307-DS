/**
 * Comprehensive Automated Verification Test Suite for Smart Library Management System
 * Tests:
 * 1. Binary Search Tree (BST)
 * 2. Hash Table with Separate Chaining
 * 3. Priority Queue (Binary Min-Heap)
 * 4. User Registration & RBAC
 * 5. Book Request Workflow & Admin Approval
 * 6. Strict Cross-Account Anti-Data-Leak Scenarios
 * 7. Admin Member Directory: ID-Only Lookup, Auto-Fetch Details, Duplicate Prevention, Synchronization
 * 8. Admin Return Book Workflow & LocalStorage Plain Object Compatibility
 * 9. Responsive Design & Mobile Optimization Verification
 */

import fs from 'fs';
import { BinarySearchTree } from './js/ds/BinarySearchTree.js';
import { HashTable } from './js/ds/HashTable.js';
import { PriorityQueue } from './js/ds/PriorityQueue.js';
import { StorageService } from './js/services/StorageService.js';
import { AuthService } from './js/services/AuthService.js';
import { LibraryManager } from './js/services/LibraryManager.js';
import { AuditService } from './js/services/AuditService.js';
import { Reservation } from './js/models/Reservation.js';
import { Transaction } from './js/models/Transaction.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ✕ FAIL: ${message}`);
        failed++;
    }
}

// Mock localStorage and sessionStorage for Node environment
global.localStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
};
global.sessionStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
};

console.log("\n=======================================================");
console.log("TEST SUITE 1: BINARY SEARCH TREE (BST)");
console.log("=======================================================");

const bst = new BinarySearchTree();
const sampleBooks = [
    { id: 105, title: "Algorithms" },
    { id: 102, title: "Clean Code" },
    { id: 110, title: "C Language" },
    { id: 101, title: "Design Patterns" },
    { id: 103, title: "Head First DP" },
    { id: 108, title: "Algorithms in C++" },
    { id: 112, title: "Effective Java" }
];

sampleBooks.forEach(b => bst.insert(b.id, b));
assert(bst.nodeCount === 7, "BST contains 7 inserted nodes");
assert(bst.root.key === 105, "Root node is 105");

// Search test
const search108 = bst.search(108);
assert(search108.found === true, "Search found node 108");
assert(search108.steps === 3, "Search for 108 took exactly 3 steps (105 -> 110 -> 108)");

const inorder = bst.inorder();
const inorderKeys = inorder.map(n => n.key);
assert(JSON.stringify(inorderKeys) === JSON.stringify([101, 102, 103, 105, 108, 110, 112]), "In-order traversal yields strictly sorted keys");

// Deletion test
const deleted110 = bst.delete(110);
assert(deleted110 === true, "Deleted node 110 with 2 children");
assert(bst.search(110).found === false, "Node 110 no longer in BST");
assert(bst.nodeCount === 6, "Node count decremented to 6");

console.log("\n=======================================================");
console.log("TEST SUITE 2: HASH TABLE & SEPARATE CHAINING");
console.log("=======================================================");

const ht = new HashTable(11);
ht.insert("978-0131103627", { title: "The C Programming Language" });
ht.insert("978-0262033848", { title: "Introduction to Algorithms" });

assert(ht.size === 2, "Hash table size is 2");
assert(ht.has("978-0131103627") === true, "Hash table has ISBN 978-0131103627");
assert(ht.get("978-0131103627").value.title === "The C Programming Language", "Hash lookup retrieves correct title");

console.log("\n=======================================================");
console.log("TEST SUITE 3: PRIORITY QUEUE (BINARY MIN-HEAP)");
console.log("=======================================================");

const pq = new PriorityQueue();

const res1 = new Reservation({
    reservationId: "RES-001",
    userId: "STU001",
    userRole: "student",
    userName: "Rahul Sharma",
    bookId: 105,
    bookTitle: "Algorithms",
    requestTime: "2026-08-01T10:00:00Z",
    priority: 3 // Student
});

const res2 = new Reservation({
    reservationId: "RES-002",
    userId: "FAC001",
    userRole: "faculty",
    userName: "Dr. Rajesh",
    bookId: 105,
    bookTitle: "Algorithms",
    requestTime: "2026-08-01T11:00:00Z",
    priority: 1 // Faculty
});

pq.enqueue(res1);
pq.enqueue(res2);

assert(pq.size() === 2, "Priority Queue size is 2");
const top = pq.peek();
assert(top.userId === "FAC001", "Faculty (Priority 1) has root priority over Student (Priority 3)");

console.log("\n=======================================================");
console.log("TEST SUITE 4: USER REGISTRATION & AUTHENTICATION");
console.log("=======================================================");

async function runTests() {
    // 1. Student Registration
    const newStudent = AuthService.register({
        name: "Arun Kumar",
        id: "STU002",
        email: "arun@smartlib.edu",
        phone: "9876543210",
        department: "Computer Science",
        year: "2",
        password: "userpassword",
        confirmPassword: "userpassword",
        role: "student"
    });
    assert(newStudent.id === "STU002" && newStudent.role === "student", "Student successfully registered (STU002)");

    // 2. Faculty Registration
    const newFaculty = AuthService.register({
        name: "Dr. Meenakshi Sundaram",
        id: "FAC002",
        email: "meenakshi@smartlib.edu",
        phone: "9876543211",
        department: "Information Technology",
        password: "facultypassword",
        confirmPassword: "facultypassword",
        role: "faculty"
    });
    assert(newFaculty.id === "FAC002" && newFaculty.role === "faculty", "Faculty successfully registered (FAC002)");

    // 3. Admin Registration
    const newAdmin = AuthService.register({
        name: "Second Administrator",
        id: "ADM002",
        email: "admin2@smartlib.edu",
        phone: "9876543212",
        password: "admin2password",
        confirmPassword: "admin2password",
        role: "admin"
    });
    assert(newAdmin.id === "ADM002" && newAdmin.role === "admin", "Admin successfully registered (ADM002)");

    // 4. Duplicate Admin ID Rejection
    try {
        AuthService.register({
            name: "Duplicate Admin",
            id: "ADM002",
            email: "dupadmin@smartlib.edu",
            phone: "9876543213",
            password: "password123",
            confirmPassword: "password123",
            role: "admin"
        });
        assert(false, "Should have blocked duplicate Admin ID");
    } catch (e) {
        assert(e.message === "An administrator with this Admin ID already exists.", "Duplicate Admin ID blocked with exact error");
    }

    // 5. Demo and Newly Registered Logins
    const admin = await AuthService.login("admin", "admin123", "admin");
    assert(admin.role === "admin", "Demo Admin login successful");

    const newlyRegisteredAdmin = await AuthService.login("ADM002", "admin2password", "admin");
    assert(newlyRegisteredAdmin.id === "ADM002" && newlyRegisteredAdmin.role === "admin", "Newly registered Admin login successful (ADM002)");

    const faculty = await AuthService.login("faculty", "faculty123", "faculty");
    assert(faculty.role === "faculty", "Faculty login successful");

    const student = await AuthService.login("student", "student123", "student");
    assert(student.role === "student", "Student login successful");

    // 6. Admin Management & Safety Check
    AuthService.updateUserAccount("ADM002", { name: "Senior Administrator", phone: "9876500002" });
    const updatedAdmin = AuthService.getUsers().find(u => u.id === "ADM002");
    assert(updatedAdmin.name === "Senior Administrator", "Admin account successfully updated via Admin Management");

    AuthService.updateUserAccount("ADM002", { status: "Inactive" });
    const deactivatedAdmin = AuthService.getUsers().find(u => u.id === "ADM002");
    assert(deactivatedAdmin.status === "Inactive", "Secondary Admin successfully deactivated");

    try {
        // Attempt to deactivate the only remaining active admin (ADM001 / admin)
        AuthService.updateUserAccount("ADM001", { status: "Inactive" });
        assert(false, "Should have blocked deactivating the last active administrator");
    } catch (e) {
        assert(e.message === "At least one active administrator must remain in the system.", "Last active admin deactivation blocked with safety error");
    }

    // Reactivate ADM002
    AuthService.updateUserAccount("ADM002", { status: "Active" });

    console.log("\n=======================================================");
    console.log("TEST SUITE 5: BOOK REQUEST WORKFLOW & ADMIN APPROVAL");
    console.log("=======================================================");

    const lib = new LibraryManager();

    const book104 = lib.getBookById(104);
    const initialCopies104 = book104.availableCopies;

    // 1. Student requests Book #104
    const stuReq = lib.requestBook("STU001", "student", "Rahul Sharma", 104);
    assert(stuReq.status === "Pending", "Student request created with status 'Pending'");
    assert(lib.getBookById(104).availableCopies === initialCopies104, "Available copies NOT decremented on request submission");

    // 2. Faculty requests Book #106
    const facReq = lib.requestBook("FAC001", "faculty", "Dr. Rajesh Kumar", 106);
    assert(facReq.status === "Pending", "Faculty request created with status 'Pending'");

    // 3. ADMIN APPROVAL
    const approveResult = lib.approveRequest(stuReq.requestId);
    assert(approveResult.success === true, "Admin approval successful");
    assert(approveResult.request.status === "Approved", "Request status updated to 'Approved'");
    assert(lib.getBookById(104).availableCopies === initialCopies104 - 1, "Book copies decremented by 1 upon Admin approval");
    assert(approveResult.transaction !== null && approveResult.transaction.status === "Active", "Borrowing transaction generated with status 'Active'");

    // 4. ADMIN REJECTION
    const rejectResult = lib.rejectRequest(facReq.requestId);
    assert(rejectResult.success === true, "Admin rejection successful");
    assert(rejectResult.request.status === "Rejected", "Request status updated to 'Rejected'");
    assert(lib.getBookById(106).availableCopies === 2, "Book copies unchanged upon rejection");

    // 5. OUT OF STOCK REQUEST REJECTION
    const outOfStockBook = lib.getBookById(105);
    outOfStockBook.availableCopies = 0;
    const outReq = lib.requestBook("STU002", "student", "Arun Kumar", 105);
    try {
        lib.approveRequest(outReq.requestId);
        assert(false, "Should have thrown error on out of stock approval");
    } catch (e) {
        assert(e.message === "This book is no longer available.", "Out-of-stock approval blocked: 'This book is no longer available.'");
    }

    console.log("\n=======================================================");
    console.log("TEST SUITE 6: STRICT CROSS-ACCOUNT ANTI-DATA-LEAK VERIFICATION");
    console.log("=======================================================");

    // Scenario 1: Faculty reserves Book A. Student must NOT see Faculty's reservation.
    lib.reserveBook("FAC001", "faculty", "Dr. Rajesh Kumar", 118);
    const stuViewReservations = lib.getUserReservations("STU001", "student");
    assert(!stuViewReservations.some(r => r.userId === "FAC001"), "Scenario 1: Student cannot see Faculty's reservation");

    // Scenario 2: Student requests Book B. Faculty must NOT see Student's request.
    const stuReqB = lib.requestBook("STU002", "student", "Arun Kumar", 119);
    const facViewRequests = lib.getUserRequests("FAC001", "faculty");
    assert(!facViewRequests.some(r => r.requestId === stuReqB.requestId), "Scenario 2: Faculty cannot see Student's request");

    console.log("\n=======================================================");
    console.log("TEST SUITE 7: ADMIN MEMBER DIRECTORY - ID-ONLY LOOKUP & ADD");
    console.log("=======================================================");

    // 1. User Self-Registration: Student STU100
    const regStu100 = AuthService.register({
        id: "STU100",
        name: "Test Student",
        email: "stu100@example.com",
        phone: "9876543210",
        department: "Computer Science",
        year: "3",
        password: "password123",
        confirmPassword: "password123",
        role: "student"
    });
    assert(regStu100.id === "STU100" && regStu100.username === "STU100", "Student STU100 registered account");

    // 2. User Self-Registration: Faculty FAC100
    const regFac100 = AuthService.register({
        id: "FAC100",
        name: "Test Faculty",
        email: "fac100@example.com",
        phone: "9876543211",
        department: "Information Technology",
        password: "password123",
        confirmPassword: "password123",
        role: "faculty"
    });
    assert(regFac100.id === "FAC100" && regFac100.username === "FAC100", "Faculty FAC100 registered account");

    // 3. Admin adds STU100 to Member Directory using ONLY the Student ID
    const addedStu100 = lib.addMemberFromUser("STU100", "student");
    assert(addedStu100.memberId === "STU100", "STU100 added to Member Directory via ID-only lookup");
    assert(addedStu100.name === "Test Student", "Name automatically populated from user account: 'Test Student'");
    assert(addedStu100.email === "stu100@example.com", "Email automatically populated: 'stu100@example.com'");
    assert(addedStu100.department === "Computer Science", "Department automatically populated: 'Computer Science'");
    assert(addedStu100.year === "3", "Year automatically populated: '3'");
    assert(addedStu100.membershipType === "Student", "Role correctly set to 'Student'");

    // 4. Admin adds FAC100 to Member Directory using ONLY the Faculty ID
    const addedFac100 = lib.addMemberFromUser("FAC100", "faculty");
    assert(addedFac100.memberId === "FAC100", "FAC100 added to Member Directory via ID-only lookup");
    assert(addedFac100.name === "Test Faculty", "Name automatically populated from user account: 'Test Faculty'");
    assert(addedFac100.membershipType === "Faculty", "Role correctly set to 'Faculty'");

    // 5. Invalid ID Lookup Test (Non-existent Student ID)
    try {
        lib.addMemberFromUser("STU999", "student");
        assert(false, "Should have thrown error for non-existent Student ID STU999");
    } catch (e) {
        assert(e.message === "No student account found with Student ID STU999.", "Correct error message on non-existent Student ID: 'No student account found with Student ID STU999.'");
    }
    assert(lib.getMemberById("STU999") === null, "No member record created for invalid Student ID");

    // 6. Invalid ID Lookup Test (Non-existent Faculty ID)
    try {
        lib.addMemberFromUser("FAC999", "faculty");
        assert(false, "Should have thrown error for non-existent Faculty ID FAC999");
    } catch (e) {
        assert(e.message === "No faculty account found with Faculty ID FAC999.", "Correct error message on non-existent Faculty ID: 'No faculty account found with Faculty ID FAC999.'");
    }
    assert(lib.getMemberById("FAC999") === null, "No member record created for invalid Faculty ID");

    // 7. Prevent Duplicate Addition to Member Directory
    try {
        lib.addMemberFromUser("STU100", "student");
        assert(false, "Should have rejected duplicate addition of STU100");
    } catch (e) {
        assert(e.message === "This member is already in the Member Directory.", "Duplicate addition blocked: 'This member is already in the Member Directory.'");
    }
    const stu100Matches = lib.members.filter(m => m.memberId === "STU100");
    assert(stu100Matches.length === 1, "Exactly one STU100 record exists in Member Directory");

    // 8. Role Mismatch Prevention (Trying to add Student as Faculty)
    try {
        lib.addMemberFromUser("STU100", "faculty");
        assert(false, "Should have rejected role mismatch");
    } catch (e) {
        assert(e.message.includes("is registered as a Student, not a Faculty"), "Role mismatch prevented when adding user");
    }

    // 9. Live User Profile Synchronization
    AuthService.updateUserAccount("STU100", {
        name: "Test Student Synchronized",
        email: "stu100_synced@smartlib.edu",
        department: "Cyber Security"
    });
    const syncedMember = lib.getMemberById("STU100");
    lib.syncMembersWithUserAccounts();
    assert(syncedMember.email === "stu100_synced@smartlib.edu", "Member Directory email synchronized with updated user profile");
    assert(syncedMember.department === "Cyber Security", "Member Directory department synchronized with updated user profile");

    // 10. Member Directory Search and Filter Tests
    const searchRes = lib.smartSearchMembers("Cyber", {});
    assert(searchRes.length >= 1 && searchRes[0].memberId === "STU100", "smartSearchMembers found member by synchronized department");

    const studentFilter = lib.smartSearchMembers("", { membershipType: "Student" });
    assert(studentFilter.every(m => m.membershipType === "Student"), "Filter by 'Student' yields only student members");

    const facultyFilter = lib.smartSearchMembers("", { membershipType: "Faculty" });
    assert(facultyFilter.every(m => m.membershipType === "Faculty"), "Filter by 'Faculty' yields only faculty members");

    console.log("\n=======================================================");
    console.log("TEST SUITE 8: ADMIN RETURN BOOK WORKFLOW & LOCALSTORAGE PLAIN OBJECT COMPATIBILITY");
    console.log("=======================================================");

    // 1. Issue a book to STU100 and then return it
    const book103 = lib.getBookById(103);
    const beforeCopies103 = book103.availableCopies;
    const issueRes103 = lib.issueBook("STU100", 103);
    assert(issueRes103.success === true, "Direct issue book #103 to STU100 succeeded");
    assert(lib.getBookById(103).availableCopies === beforeCopies103 - 1, "Available copies decremented after issue");
    assert(lib.getMemberById("STU100").borrowedBooks.includes(103), "STU100 borrowedBooks contains 103");

    // Return the issued transaction
    const tx103Id = issueRes103.transaction.transactionId;
    const returnRes103 = lib.returnBook(tx103Id);
    assert(returnRes103.success === true, "returnBook completed successfully without markReturned error");
    assert(returnRes103.transaction.status === "Returned", "Transaction status updated to 'Returned'");
    assert(returnRes103.transaction.action === "Returned", "Transaction action updated to 'Returned'");
    assert(returnRes103.transaction.returnDate !== null, "Transaction returnDate recorded");
    assert(lib.getBookById(103).availableCopies === beforeCopies103, "Book #103 available copies restored");
    assert(!lib.getMemberById("STU100").borrowedBooks.includes(103), "Book 103 removed from STU100 borrowedBooks");

    // 2. Prevent Double Return
    try {
        lib.returnBook(tx103Id);
        assert(false, "Double return should throw an error");
    } catch (e) {
        assert(e.message === "This book has already been returned.", "Double return blocked: 'This book has already been returned.'");
    }
    assert(lib.getBookById(103).availableCopies === beforeCopies103, "Book #103 available copies NOT incremented twice");

    // 3. Overdue Return and Fine Calculation
    const overdueTx = new Transaction({
        transactionId: "TX-OVERDUE-01",
        bookId: 107,
        bookTitle: "Introduction to Theory of Computation",
        memberId: "STU100",
        memberName: "Test Student Synchronized",
        action: "Issued",
        issueDate: "2026-07-01",
        dueDate: "2026-07-15", // ~40+ days overdue
        status: "Active"
    });
    lib.transactions.unshift(overdueTx);
    const book107 = lib.getBookById(107);
    const beforeCopies107 = book107.availableCopies;
    book107.availableCopies = Math.max(0, beforeCopies107 - 1);
    lib.getMemberById("STU100").borrowedBooks.push(107);
    lib.getMemberById("STU100").fine = 0; // reset fine for testing

    const overdueReturnRes = lib.returnBook("TX-OVERDUE-01");
    assert(overdueReturnRes.success === true, "Overdue returnBook succeeded");
    assert(overdueReturnRes.overdueInfo.isOverdue === true, "Overdue detected accurately");
    assert(overdueReturnRes.overdueInfo.fine > 0, `Overdue fine calculated: ₹${overdueReturnRes.overdueInfo.fine}`);
    assert(lib.getMemberById("STU100").fine === overdueReturnRes.overdueInfo.fine, "Overdue fine added to member's account");
    assert(overdueReturnRes.transaction.fine === overdueReturnRes.overdueInfo.fine, "Overdue fine recorded on transaction");
    assert(lib.getBookById(107).availableCopies === beforeCopies107, "Book #107 available copies restored");

    // 4. Plain Object from LocalStorage Compatibility (No class prototypes)
    const plainLocalStorageTx = {
        transactionId: "TX-PLAIN-JSON-888",
        id: "TX-PLAIN-JSON-888",
        bookId: 108,
        bookTitle: "Algorithms in C++",
        memberId: "FAC100",
        userId: "FAC100",
        memberName: "Test Faculty",
        action: "Issued",
        issueDate: "2026-08-10",
        dueDate: "2026-08-24",
        returnDate: null,
        fine: 0,
        status: "Active"
    };
    lib.transactions.push(plainLocalStorageTx);
    const book108 = lib.getBookById(108);
    const beforeCopies108 = book108.availableCopies;
    book108.availableCopies = Math.max(0, beforeCopies108 - 1);
    lib.getMemberById("FAC100").borrowedBooks.push(108);

    const plainReturnRes = lib.returnBook("TX-PLAIN-JSON-888");
    assert(plainReturnRes.success === true, "Plain LocalStorage transaction returned without prototype method error");
    assert(plainReturnRes.transaction.status === "Returned", "Plain transaction status updated to 'Returned'");
    assert(lib.getBookById(108).availableCopies === beforeCopies108, "Book #108 copies restored from plain object return");
    assert(!lib.getMemberById("FAC100").borrowedBooks.includes(108), "Book 108 removed from FAC100 borrowedBooks");

    // 5. Member Borrowed Books Isolation Verification
    // Ensure FAC100 return did not affect STU100 and vice versa
    assert(!lib.getMemberById("STU100").borrowedBooks.includes(108), "STU100 borrowed books unaffected by FAC100 return");

    console.log("\n=======================================================");
    console.log("TEST SUITE 9: RESPONSIVE DESIGN & MOBILE OPTIMIZATION");
    console.log("=======================================================");

    const htmlContent = fs.readFileSync('./index.html', 'utf-8');
    const mainCssContent = fs.readFileSync('./css/main.css', 'utf-8');
    const compCssContent = fs.readFileSync('./css/components.css', 'utf-8');

    // 1. Viewport Meta Configuration
    assert(htmlContent.includes('viewport-fit=cover'), "Viewport meta tag configured with 'viewport-fit=cover'");
    assert(htmlContent.includes('width=device-width'), "Viewport meta tag configured with 'width=device-width'");

    // 2. Mobile Drawer Structure & Backdrop
    assert(htmlContent.includes('id="mobile-toggle"'), "Mobile hamburger toggle button present in HTML");
    assert(htmlContent.includes('id="sidebar-backdrop"'), "Sidebar mobile drawer backdrop overlay present in HTML");
    assert(htmlContent.includes('id="sidebar-close"'), "Sidebar mobile drawer close button present in HTML");

    // 3. Safe Area Insets & Dynamic Viewport Units
    assert(mainCssContent.includes('safe-area-inset-top'), "Safe area inset support present in CSS for modern iOS devices");
    assert(mainCssContent.includes('100dvh'), "Dynamic viewport height (100dvh) supported in CSS");

    // 4. Fluid Typography & Touch Targets
    assert(mainCssContent.includes('clamp('), "Fluid responsive typography with clamp() implemented in main.css");
    assert(compCssContent.includes('min-height: 44px') || compCssContent.includes('min-height:44px'), "Minimum 44px touch target guidelines implemented for buttons/inputs");

    // 5. Table Horizontal Scroll Containment
    assert(compCssContent.includes('overflow-x: auto'), "Horizontally scrollable table container (.table-responsive) implemented");
    assert(compCssContent.includes('-webkit-overflow-scrolling: touch'), "Smooth iOS inertial momentum scrolling enabled for tables");

    // 6. Mobile Forms & Modals Responsive Constraints
    assert(compCssContent.includes('grid-template-columns: 1fr'), "Responsive form grid stacking implemented for small screens");
    assert(compCssContent.includes('max-height: min(90dvh'), "Modal responsive height constraint (90dvh) implemented");

    // 7. Button Overflow & Wrapping Protection
    assert(compCssContent.includes('overflow-wrap: break-word'), "Button text wrapping and overflow prevention enabled");
    assert(compCssContent.includes('max-width: 100%'), "Buttons constrained to max-width: 100%");

    // 8. Password Eye Toggle Clearance
    assert(compCssContent.includes('padding-right: 48px'), "Password input includes 48px right padding for non-overlapping eye toggle");

    // 9. Role Selection Card Mobile Stacking
    assert(compCssContent.includes('.role-cards-grid'), "Role selection card grid implemented");

    // 10. Visualization Canvas Touch Containment
    const visCssContent = fs.readFileSync('./css/visualizations.css', 'utf-8');
    assert(visCssContent.includes('.vis-canvas-card'), "Visualization cards properly styled for responsive containment");

    console.log("\n=======================================================");
    console.log("TEST SUITE 10: ROLE-BASED FORGOT PASSWORD & VERIFICATION RECOVERY");
    console.log("=======================================================");

    // 1. Email Masking
    assert(AuthService.maskEmail("rahul.s23@student.smartlib.edu") === "r•••••u@student.smartlib.edu" || AuthService.maskEmail("rahul.s23@student.smartlib.edu").includes("•••••"), "Email masking masks user localpart for privacy");

    // 2. Find User with strict role enforcement
    const foundStudent = AuthService.findUserForReset("STU001", "student");
    assert(foundStudent.id === "STU001", "Found registered student STU001");
    assert(foundStudent.name === "Rahul Sharma", "Student name resolved correctly");
    assert(foundStudent.role === "student", "Role confirmed as student");

    const foundFaculty = AuthService.findUserForReset("FAC001", "faculty");
    assert(foundFaculty.id === "FAC001", "Found registered faculty FAC001");

    const foundAdmin = AuthService.findUserForReset("ADM001", "admin");
    assert(foundAdmin.id === "ADM001", "Found registered admin ADM001");

    // 3. Cross-Role Isolation in Search
    try {
        AuthService.findUserForReset("STU001", "admin");
        assert(false, "Searching Student ID under Admin role should throw");
    } catch (e) {
        assert(e.message === "No administrator account was found with this Admin ID.", "Cross-role search prevented without leaking student existence: 'No administrator account was found with this Admin ID.'");
    }

    try {
        AuthService.findUserForReset("FAC001", "student");
        assert(false, "Searching Faculty ID under Student role should throw");
    } catch (e) {
        assert(e.message === "No student account was found with this Student ID.", "Cross-role search prevented: 'No student account was found with this Student ID.'");
    }

    try {
        AuthService.findUserForReset("ADM001", "faculty");
        assert(false, "Searching Admin ID under Faculty role should throw");
    } catch (e) {
        assert(e.message === "No faculty account was found with this Faculty ID.", "Cross-role search prevented: 'No faculty account was found with this Faculty ID.'");
    }

    // 4. Non-existent IDs
    try {
        AuthService.findUserForReset("STU999", "student");
        assert(false, "Non-existent student search should throw");
    } catch (e) {
        assert(e.message === "No student account was found with this Student ID.", "Non-existent student throws proper error");
    }

    // 5. Code Generation & Expiry
    const genRes = AuthService.generateResetCode("STU001", "student");
    assert(genRes.success === true, "Reset verification code generated");
    assert(/^\d{6}$/.test(genRes.simulatedCode), "Generated code is strictly 6 digits");

    // 6. Verification Code Validation
    try {
        AuthService.verifyResetCode("STU001", "student", "000000");
        assert(false, "Invalid verification code should throw");
    } catch (e) {
        assert(e.message === "Incorrect verification code. Please try again.", "Wrong verification code throws: 'Incorrect verification code. Please try again.'");
    }

    // Correct verification code
    const verifySuccess = AuthService.verifyResetCode("STU001", "student", genRes.simulatedCode);
    assert(verifySuccess === true, "Correct verification code authorized reset session");

    // 7. Password Strength Calculator
    assert(AuthService.calculatePasswordStrength("123").label === "Weak", "Password '123' evaluated as Weak");
    assert(AuthService.calculatePasswordStrength("password").score >= 2, "Password 'password' evaluated as Fair or higher");
    assert(AuthService.calculatePasswordStrength("Pass1234").score >= 3, "Password 'Pass1234' evaluated as Good");
    assert(AuthService.calculatePasswordStrength("P@ssw0rd2026!").label === "Strong", "Password 'P@ssw0rd2026!' evaluated as Strong");

    // 8. Password Mismatch & Length Validation
    try {
        AuthService.resetPassword("STU001", "student", "short", "short");
        assert(false, "Short password should throw");
    } catch (e) {
        assert(e.message.includes("at least 6 characters"), "Password length enforced to >= 6 characters");
    }

    try {
        AuthService.resetPassword("STU001", "student", "newpass123", "mismatch123");
        assert(false, "Password mismatch should throw");
    } catch (e) {
        assert(e.message === "Passwords do not match.", "Password mismatch error thrown: 'Passwords do not match.'");
    }

    // 9. Successful Password Reset for STU001
    const resetRes = AuthService.resetPassword("STU001", "student", "newSecret2026", "newSecret2026");
    assert(resetRes.success === true, "Password reset succeeded for STU001");
    assert(resetRes.user.id === "STU001", "Reset user confirmed as STU001");

    // 10. Login with new password & verify old password fails
    try {
        await AuthService.login("STU001", "student123", "student");
        assert(false, "Old password should fail login");
    } catch (e) {
        assert(e.message.includes("Invalid"), "Old password successfully rejected");
    }

    const newLoginUser = await AuthService.login("STU001", "newSecret2026", "student");
    assert(newLoginUser.id === "STU001", "Login with new password succeeded");
    assert(newLoginUser.name === "Rahul Sharma", "User details completely intact after password reset");

    // 11. Role Separation: Ensure other accounts were unaffected
    const facultyCheck = await AuthService.login("FAC001", "faculty123", "faculty");
    assert(facultyCheck.id === "FAC001", "Faculty FAC001 password untouched by student reset");

    const adminCheck = await AuthService.login("ADM001", "admin123", "admin");
    assert(adminCheck.id === "ADM001", "Admin ADM001 password untouched by student reset");

    // 12. Reset Faculty Password (FAC001)
    const facGen = AuthService.generateResetCode("FAC001", "faculty");
    AuthService.verifyResetCode("FAC001", "faculty", facGen.simulatedCode);
    AuthService.resetPassword("FAC001", "faculty", "facNewPass2026", "facNewPass2026");
    const facLoginNew = await AuthService.login("FAC001", "facNewPass2026", "faculty");
    assert(facLoginNew.id === "FAC001", "Faculty password reset and login with new password succeeded");

    // 13. Reset Admin Password (ADM001)
    const admGen = AuthService.generateResetCode("ADM001", "admin");
    AuthService.verifyResetCode("ADM001", "admin", admGen.simulatedCode);
    AuthService.resetPassword("ADM001", "admin", "admNewPass2026", "admNewPass2026");
    const admLoginNew = await AuthService.login("ADM001", "admNewPass2026", "admin");
    assert(admLoginNew.id === "ADM001", "Admin password reset and login with new password succeeded");

    console.log("\n=======================================================");
    console.log("TEST SUITE 11: ADMIN AUDIT LOGGING & INSTITUTIONAL GOVERNANCE");
    console.log("=======================================================");

    // 1. Initial Logs Retrieval
    const initialLogs = AuditService.getLogs();
    assert(Array.isArray(initialLogs) && initialLogs.length > 0, "AuditService retrieves non-empty audit history");

    // 2. Explicit Audit Logging
    const customLog = AuditService.log("Custom Admin Action", "Target Resource #999", { id: "ADM001", name: "Library Administrator" });
    assert(customLog && customLog.action === "Custom Admin Action", "Custom audit entry created successfully");
    assert(customLog.adminId === "ADM001", "Audit entry preserves acting administrator ID");
    assert(customLog.target === "Target Resource #999", "Audit entry accurately records target resource");

    // 3. Automatic Circulation Audit Hooks
    const lm = new LibraryManager();
    const testBookData = {
        bookId: 9999,
        title: "Audit Trail Architecture",
        author: "Dr. Verification",
        isbn: "978-0-99999-999-9",
        category: "Computer Science",
        totalCopies: 3,
        availableCopies: 3
    };
    lm.addBook(testBookData);
    const postBookAddLogs = AuditService.getLogs();
    assert(postBookAddLogs[0].action === "Added Book" && postBookAddLogs[0].target.includes("9999"), "lm.addBook automatically logged in AuditService");

    // 4. Update and Delete Book Audit Hooks
    lm.updateBook(9999, { title: "Audit Trail Architecture (2nd Ed)" });
    const postBookUpdateLogs = AuditService.getLogs();
    assert(postBookUpdateLogs[0].action === "Updated Book", "lm.updateBook automatically logged in AuditService");

    lm.deleteBook(9999);
    const postBookDeleteLogs = AuditService.getLogs();
    assert(postBookDeleteLogs[0].action === "Deleted Book", "lm.deleteBook automatically logged in AuditService");

    // 5. Audit Log HTML and View Integration
    const auditHtml = fs.readFileSync('./index.html', 'utf-8');
    assert(auditHtml.includes('id="view-audit-log"'), "Admin audit log view present in index.html");
    assert(auditHtml.includes('id="audit-logs-table"'), "Audit logs data table present in index.html");

    // 6. Navigation Link Integration
    const appJsContent = fs.readFileSync('./js/app.js', 'utf-8');
    assert(appJsContent.includes('data-view="audit-log"'), "Audit log nav item integrated into admin sidebar in app.js");
    assert(appJsContent.includes('renderAuditLogs'), "renderAuditLogs handler implemented in app.js");

    console.log("\n=======================================================");
    console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================");

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
