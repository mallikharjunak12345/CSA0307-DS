/**
 * Priority Queue Implementation using a Binary Min-Heap
 * Used for managing book reservations.
 * 
 * Priority Rules:
 *  1: Faculty (Highest Priority)
 *  2: Research Scholar (Medium Priority)
 *  3: Student (Standard Priority)
 * 
 * If two members have the same priority level, the reservation with the earlier
 * timestamp (FIFO) is served first.
 */

export class HeapNode {
    constructor(reservation) {
        this.reservation = reservation;
        this.priority = Number(reservation.priority); // 1, 2, or 3
        this.timestamp = new Date(reservation.requestTime).getTime() || Date.now();
        this.id = reservation.reservationId;
    }
}

export class PriorityQueue {
    constructor() {
        this.heap = []; // Array-based binary heap representation
    }

    /**
     * Compare two nodes. Returns true if nodeA has higher priority than nodeB.
     * Higher priority = smaller priority number (1 < 2 < 3).
     * Tie-breaker = earlier timestamp (smaller timestamp number).
     */
    compare(nodeA, nodeB) {
        if (nodeA.priority !== nodeB.priority) {
            return nodeA.priority < nodeB.priority;
        }
        return nodeA.timestamp < nodeB.timestamp;
    }

    /**
     * Enqueue a new reservation into the Min-Heap
     * Time Complexity: O(log n)
     * Returns: { success: boolean, index: number, siftSteps: Array }
     */
    enqueue(reservation) {
        const node = new HeapNode(reservation);
        this.heap.push(node);
        const siftSteps = this.siftUp(this.heap.length - 1);
        return { success: true, node, siftSteps };
    }

    /**
     * Sift Up operation to maintain Heap property
     */
    siftUp(index) {
        const steps = [];
        let current = index;

        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
            steps.push({ current, parent });

            if (this.compare(this.heap[current], this.heap[parent])) {
                // Swap current and parent
                [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
                current = parent;
            } else {
                break;
            }
        }

        return steps;
    }

    /**
     * Dequeue the highest priority reservation
     * Time Complexity: O(log n)
     * Returns: { dequeued: Reservation|null, siftSteps: Array }
     */
    dequeue() {
        if (this.isEmpty()) {
            return { dequeued: null, siftSteps: [] };
        }

        const highest = this.heap[0];
        const last = this.heap.pop();

        if (this.heap.length > 0 && last) {
            this.heap[0] = last;
            const siftSteps = this.siftDown(0);
            return { dequeued: highest.reservation, siftSteps };
        }

        return { dequeued: highest.reservation, siftSteps: [] };
    }

    /**
     * Sift Down operation to maintain Heap property
     */
    siftDown(index) {
        const steps = [];
        let current = index;
        const length = this.heap.length;

        while (true) {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let smallest = current;

            if (left < length && this.compare(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }

            if (right < length && this.compare(this.heap[right], this.heap[smallest])) {
                smallest = right;
            }

            if (smallest !== current) {
                steps.push({ current, smallest, left, right });
                [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
                current = smallest;
            } else {
                break;
            }
        }

        return steps;
    }

    /**
     * Peek at the highest priority reservation without removing
     * Time Complexity: O(1)
     */
    peek() {
        return this.isEmpty() ? null : this.heap[0].reservation;
    }

    /**
     * Find and update priority of an existing reservation
     * Time Complexity: O(n + log n)
     */
    changePriority(reservationId, newPriority) {
        const index = this.heap.findIndex(item => item.id === reservationId);
        if (index === -1) return false;

        const oldPriority = this.heap[index].priority;
        this.heap[index].priority = Number(newPriority);
        this.heap[index].reservation.priority = Number(newPriority);

        if (newPriority < oldPriority) {
            this.siftUp(index);
        } else {
            this.siftDown(index);
        }
        return true;
    }

    /**
     * Remove a specific reservation by ID
     */
    remove(reservationId) {
        const index = this.heap.findIndex(item => item.id === reservationId);
        if (index === -1) return false;

        if (index === this.heap.length - 1) {
            this.heap.pop();
            return true;
        }

        const last = this.heap.pop();
        this.heap[index] = last;
        this.siftUp(index);
        this.siftDown(index);
        return true;
    }

    /**
     * Returns an array sorted in priority order (without modifying original heap)
     */
    getSortedQueue() {
        const tempHeap = new PriorityQueue();
        tempHeap.heap = this.heap.map(node => new HeapNode({ ...node.reservation }));
        const result = [];
        while (!tempHeap.isEmpty()) {
            result.push(tempHeap.dequeue().dequeued);
        }
        return result;
    }

    /**
     * Get raw heap array for visualization
     */
    getHeapArray() {
        return this.heap.map(node => ({
            id: node.id,
            priority: node.priority,
            reservation: node.reservation,
            timestamp: node.timestamp
        }));
    }

    /**
     * Convert heap array to hierarchical tree object for SVG/Visualizer rendering
     */
    getHeapTree(index = 0) {
        if (index >= this.heap.length) return null;
        const node = this.heap[index];
        return {
            index,
            id: node.id,
            priority: node.priority,
            reservation: node.reservation,
            left: this.getHeapTree(2 * index + 1),
            right: this.getHeapTree(2 * index + 2)
        };
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    clear() {
        this.heap = [];
    }
}
