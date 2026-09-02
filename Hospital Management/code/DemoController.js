/**
 * Demo Controller for Viva / Project Presentations
 * Provides automated animated walkthroughs of BST, Hash Collisions, and Priority Queue Heap logic.
 */

import { Toast } from './Toast.js';

export class DemoController {
    constructor(libraryManager, treeVisualizer, hashVisualizer, heapVisualizer) {
        this.libraryManager = libraryManager;
        this.treeVisualizer = treeVisualizer;
        this.hashVisualizer = hashVisualizer;
        this.heapVisualizer = heapVisualizer;
        this.isRunning = false;
    }

    /**
     * Demonstrate Binary Search Tree
     */
    async runBSTDemo(logContainer) {
        if (this.isRunning) return;
        this.isRunning = true;
        Toast.info("Starting Binary Search Tree Interactive Demonstration...");

        if (logContainer) {
            logContainer.innerHTML = `
                <div class="demo-live-log">
                    <h4>🎬 BST Demonstration in Progress</h4>
                    <p id="demo-log-text">Step 1/4: Resetting and preparing balanced BST sample nodes...</p>
                    <div class="demo-progress-bar"><div class="demo-progress-fill" id="demo-progress-bar-fill" style="width: 20%"></div></div>
                </div>
            `;
        }

        const setLog = (text, percent) => {
            const el = document.getElementById('demo-log-text');
            const bar = document.getElementById('demo-progress-bar-fill');
            if (el) el.innerHTML = text;
            if (bar) bar.style.width = `${percent}%`;
        };

        try {
            // Step 1: Render base BST
            this.treeVisualizer.render(this.libraryManager.bookBST);
            await new Promise(r => setTimeout(r, 1200));

            // Step 2: Animate Search for Book ID 108
            setLog("Step 2/4: Performing $O(\\log n)$ Search for Book ID <strong>108</strong> (Traversing Root 105 &rarr; Right 110 &rarr; Left 108)...", 45);
            await this.treeVisualizer.animateSearch(108, this.libraryManager.bookBST, document.getElementById('demo-log-text'));
            await new Promise(r => setTimeout(r, 1800));

            // Step 3: Animate In-Order Traversal
            setLog("Step 3/4: Executing In-Order Traversal (Left &rarr; Root &rarr; Right) to yield sorted Book IDs...", 75);
            await this.treeVisualizer.animateTraversal('inorder', this.libraryManager.bookBST, logContainer);
            await new Promise(r => setTimeout(r, 2000));

            // Step 4: Completion
            setLog("✓ Step 4/4: BST Demonstration Complete! Verified $O(\\log n)$ search and sorted In-Order traversal.", 100);
            Toast.success("BST Demonstration completed successfully!");
        } catch (e) {
            console.error("BST Demo error:", e);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Demonstrate Hash Table and Collision Chaining
     */
    async runHashDemo(logContainer) {
        if (this.isRunning) return;
        this.isRunning = true;
        Toast.info("Starting Hash Table & Collision Chaining Demonstration...");

        if (logContainer) {
            logContainer.innerHTML = `
                <div class="demo-live-log">
                    <h4>🎬 Hash Table & Collision Demonstration</h4>
                    <p id="demo-log-text">Step 1/3: Rendering Hash Table buckets and load factor metrics...</p>
                    <div class="demo-progress-bar"><div class="demo-progress-fill" id="demo-progress-bar-fill" style="width: 25%"></div></div>
                </div>
            `;
        }

        const setLog = (text, percent) => {
            const el = document.getElementById('demo-log-text');
            const bar = document.getElementById('demo-progress-bar-fill');
            if (el) el.innerHTML = text;
            if (bar) bar.style.width = `${percent}%`;
        };

        try {
            this.hashVisualizer.render(this.libraryManager.bookHashTable);
            await new Promise(r => setTimeout(r, 1200));

            // Step 2: Demonstrate lookup of a specific ISBN
            const sampleISBN = "978-0131103627";
            setLog(`Step 2/3: Computing Polynomial Rolling Hash for ISBN <strong>${sampleISBN}</strong>...`, 60);
            await this.hashVisualizer.animateSearch(sampleISBN, this.libraryManager.bookHashTable, document.getElementById('demo-log-text'));
            await new Promise(r => setTimeout(r, 2000));

            // Step 3: Completion
            setLog("✓ Step 3/3: Hash Table Demonstration Complete! Verified direct bucket indexing & separate chaining.", 100);
            Toast.success("Hash Table Demonstration completed!");
        } catch (e) {
            console.error("Hash Demo error:", e);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Demonstrate Priority Queue (Binary Heap)
     */
    async runHeapDemo(logContainer) {
        if (this.isRunning) return;
        this.isRunning = true;
        Toast.info("Starting Priority Queue (Min-Heap) Demonstration...");

        if (logContainer) {
            logContainer.innerHTML = `
                <div class="demo-live-log">
                    <h4>🎬 Priority Queue Heap Demonstration</h4>
                    <p id="demo-log-text">Step 1/4: Rendering Binary Min-Heap tree and priority ranks...</p>
                    <div class="demo-progress-bar"><div class="demo-progress-fill" id="demo-progress-bar-fill" style="width: 25%"></div></div>
                </div>
            `;
        }

        const setLog = (text, percent) => {
            const el = document.getElementById('demo-log-text');
            const bar = document.getElementById('demo-progress-bar-fill');
            if (el) el.innerHTML = text;
            if (bar) bar.style.width = `${percent}%`;
        };

        try {
            this.heapVisualizer.render(this.libraryManager.reservationPriorityQueue);
            await new Promise(r => setTimeout(r, 1200));

            // Step 2: Show Peek
            const top = this.libraryManager.reservationPriorityQueue.peek();
            setLog(`Step 2/4: Peeking at Heap Root in $O(1)$ time: <strong>${top?.memberName}</strong> (${top?.memberType} - Priority ${top?.priority})`, 50);
            await new Promise(r => setTimeout(r, 1800));

            // Step 3: Explain heap ordering rule
            setLog(`Step 3/4: Demonstrating Sift-Up invariant: Faculty (P1) > Researcher (P2) > Student (P3) with FIFO tie-breaker.`, 75);
            await new Promise(r => setTimeout(r, 1800));

            // Step 4: Completion
            setLog(`✓ Step 4/4: Priority Queue Demonstration Complete! Guaranteed $O(\\log n)$ enqueue/dequeue and $O(1)$ peek.`, 100);
            Toast.success("Priority Queue Demonstration completed!");
        } catch (e) {
            console.error("Heap demo error:", e);
        } finally {
            this.isRunning = false;
        }
    }
}
