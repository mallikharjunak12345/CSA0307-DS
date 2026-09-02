/**
 * Binary Search Tree (BST) Implementation
 * Used for organizing books by numeric ID / ISBN numerical key.
 * Provides O(log n) average search, insertion, and deletion.
 */

export class TreeNode {
    constructor(key, data) {
        this.key = Number(key); // Numeric key for comparison (e.g. Book ID or numeric hash)
        this.data = data;       // Associated Book object
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

export class BinarySearchTree {
    constructor() {
        this.root = null;
        this.nodeCount = 0;
    }

    /**
     * Insert a book into the BST
     * Time Complexity: O(log n) average, O(n) worst-case
     */
    insert(key, data) {
        const numericKey = Number(key);
        const newNode = new TreeNode(numericKey, data);
        if (!this.root) {
            this.root = newNode;
            this.nodeCount++;
            return true;
        }

        let current = this.root;
        while (true) {
            if (numericKey === current.key) {
                // Key already exists; update data
                current.data = data;
                return false;
            }
            if (numericKey < current.key) {
                if (!current.left) {
                    current.left = newNode;
                    this.nodeCount++;
                    return true;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    this.nodeCount++;
                    return true;
                }
                current = current.right;
            }
        }
    }

    /**
     * Search for a key in the BST
     * Returns: { found: boolean, node: TreeNode|null, path: Array<number>, steps: number }
     * Time Complexity: O(log n) average
     */
    search(key) {
        const numericKey = Number(key);
        const path = [];
        let current = this.root;
        let steps = 0;

        while (current) {
            steps++;
            path.push(current.key);
            if (numericKey === current.key) {
                return { found: true, node: current, path, steps, data: current.data };
            }
            if (numericKey < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return { found: false, node: null, path, steps, data: null };
    }

    /**
     * Delete a node by key
     * Handles 3 cases: leaf node, 1 child, 2 children (with in-order successor)
     * Time Complexity: O(log n) average
     */
    delete(key) {
        const numericKey = Number(key);
        let deleted = false;

        const deleteNode = (node, k) => {
            if (!node) return null;

            if (k < node.key) {
                node.left = deleteNode(node.left, k);
                return node;
            } else if (k > node.key) {
                node.right = deleteNode(node.right, k);
                return node;
            } else {
                // Node found
                deleted = true;

                // Case 1: Leaf node
                if (!node.left && !node.right) {
                    return null;
                }

                // Case 2: One child
                if (!node.left) return node.right;
                if (!node.right) return node.left;

                // Case 3: Two children
                // Find in-order successor (minimum in right subtree)
                let successor = node.right;
                while (successor.left) {
                    successor = successor.left;
                }

                node.key = successor.key;
                node.data = successor.data;
                node.right = deleteNode(node.right, successor.key);
                return node;
            }
        };

        this.root = deleteNode(this.root, numericKey);
        if (deleted) this.nodeCount--;
        return deleted;
    }

    /**
     * In-Order Traversal (Left, Root, Right) -> Sorted Order
     * Time Complexity: O(n)
     */
    inorder() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            traverse(node.left);
            result.push({ key: node.key, data: node.data });
            traverse(node.right);
        };
        traverse(this.root);
        return result;
    }

    /**
     * Pre-Order Traversal (Root, Left, Right)
     * Time Complexity: O(n)
     */
    preorder() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            result.push({ key: node.key, data: node.data });
            traverse(node.left);
            traverse(node.right);
        };
        traverse(this.root);
        return result;
    }

    /**
     * Post-Order Traversal (Left, Right, Root)
     * Time Complexity: O(n)
     */
    postorder() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            traverse(node.left);
            traverse(node.right);
            result.push({ key: node.key, data: node.data });
        };
        traverse(this.root);
        return result;
    }

    /**
     * Calculate Tree Height/Depth
     */
    getHeight(node = this.root) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    /**
     * Clear the BST
     */
    clear() {
        this.root = null;
        this.nodeCount = 0;
    }

    /**
     * Check if tree is empty
     */
    isEmpty() {
        return this.root === null;
    }
}
