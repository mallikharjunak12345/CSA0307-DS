/**
 * Hash Table Implementation with Separate Chaining
 * Used for O(1) average lookup of Books by ISBN/Book ID and Members by Member ID.
 * Features customizable capacity, polynomial rolling hash, and collision metrics.
 */

export class HashNode {
    constructor(key, value) {
        this.key = String(key);
        this.value = value;
        this.next = null;
    }
}

export class HashTable {
    constructor(capacity = 17) {
        this.capacity = capacity;
        this.buckets = new Array(capacity).fill(null);
        this.size = 0;
        this.collisionCount = 0;
    }

    /**
     * Polynomial Rolling Hash Function
     * Formula: hash = (s[0]*p^0 + s[1]*p^1 + ... + s[n-1]*p^(n-1)) % capacity
     * Returns: { index: number, rawHash: number, steps: Array<string> }
     */
    hashDetails(key) {
        const str = String(key);
        const p = 31;
        let rawHash = 0;
        let pPow = 1;
        const steps = [];

        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            rawHash = (rawHash + charCode * pPow) >>> 0; // Unsigned 32-bit integer
            pPow = (pPow * p) >>> 0;
            if (i < 5) {
                steps.push(`'${str[i]}' (${charCode}) × 31^${i}`);
            }
        }
        if (str.length > 5) {
            steps.push(`... + remaining ${str.length - 5} chars`);
        }

        const index = rawHash % this.capacity;
        return { index, rawHash, steps: steps.join(' + ') };
    }

    _hash(key) {
        return this.hashDetails(key).index;
    }

    /**
     * Insert a key-value pair into the Hash Table
     * Time Complexity: O(1) average, O(n) worst-case (heavy collisions)
     */
    insert(key, value) {
        const strKey = String(key);
        const index = this._hash(strKey);
        const newNode = new HashNode(strKey, value);

        if (!this.buckets[index]) {
            this.buckets[index] = newNode;
            this.size++;
            return { index, collision: false, chainLength: 1 };
        }

        // Collision occurred -> Traverse the chain
        this.collisionCount++;
        let current = this.buckets[index];
        let chainLength = 1;

        while (current) {
            if (current.key === strKey) {
                // Key already exists; update value
                current.value = value;
                return { index, collision: true, updated: true, chainLength };
            }
            if (!current.next) {
                current.next = newNode;
                this.size++;
                chainLength++;
                return { index, collision: true, chainLength };
            }
            current = current.next;
            chainLength++;
        }
    }

    /**
     * Search for a key in the Hash Table
     * Returns: { found: boolean, value: any, steps: number, index: number, hashInfo: object }
     * Time Complexity: O(1) average
     */
    get(key) {
        const strKey = String(key);
        const hashInfo = this.hashDetails(strKey);
        const index = hashInfo.index;
        let current = this.buckets[index];
        let steps = 0;

        while (current) {
            steps++;
            if (current.key === strKey) {
                return { found: true, value: current.value, steps, index, hashInfo };
            }
            current = current.next;
        }

        return { found: false, value: null, steps, index, hashInfo };
    }

    /**
     * Delete a key-value pair from the Hash Table
     * Time Complexity: O(1) average
     */
    remove(key) {
        const strKey = String(key);
        const index = this._hash(strKey);
        let current = this.buckets[index];
        let prev = null;
        let steps = 0;

        while (current) {
            steps++;
            if (current.key === strKey) {
                if (prev === null) {
                    this.buckets[index] = current.next;
                } else {
                    prev.next = current.next;
                }
                this.size--;
                return { success: true, steps, index };
            }
            prev = current;
            current = current.next;
        }

        return { success: false, steps, index };
    }

    /**
     * Check if a key exists in the Hash Table
     */
    has(key) {
        return this.get(key).found;
    }

    /**
     * Export all items as an array
     */
    getAll() {
        const items = [];
        for (let i = 0; i < this.capacity; i++) {
            let current = this.buckets[i];
            while (current) {
                items.push({ key: current.key, value: current.value, index: i });
                current = current.next;
            }
        }
        return items;
    }

    /**
     * Export bucket structure for visualization
     */
    getBucketsForVisualizer() {
        const result = [];
        for (let i = 0; i < this.capacity; i++) {
            const chain = [];
            let current = this.buckets[i];
            while (current) {
                chain.push({
                    key: current.key,
                    value: current.value
                });
                current = current.next;
            }
            result.push({
                index: i,
                isEmpty: chain.length === 0,
                chainLength: chain.length,
                nodes: chain
            });
        }
        return result;
    }

    /**
     * Get real-time metrics for Data Structures Lab
     */
    getMetrics() {
        let occupiedBuckets = 0;
        let maxChainLength = 0;
        let totalCollisions = 0;

        for (let i = 0; i < this.capacity; i++) {
            let count = 0;
            let current = this.buckets[i];
            while (current) {
                count++;
                current = current.next;
            }
            if (count > 0) occupiedBuckets++;
            if (count > 1) totalCollisions += (count - 1);
            if (count > maxChainLength) maxChainLength = count;
        }

        const loadFactor = this.capacity > 0 ? (this.size / this.capacity).toFixed(2) : 0;

        return {
            capacity: this.capacity,
            size: this.size,
            occupiedBuckets,
            collisionCount: totalCollisions,
            maxChainLength,
            loadFactor: Number(loadFactor)
        };
    }

    /**
     * Clear the hash table
     */
    clear() {
        this.buckets = new Array(this.capacity).fill(null);
        this.size = 0;
        this.collisionCount = 0;
    }
}
