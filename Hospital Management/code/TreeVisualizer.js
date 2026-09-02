/**
 * Interactive Binary Search Tree (BST) SVG Visualizer
 * Provides dynamic layout calculation, click inspection, glowing search paths, and animated traversals.
 */

export class TreeVisualizer {
    constructor(containerId, onNodeClick = null) {
        this.container = document.getElementById(containerId);
        this.onNodeClick = onNodeClick;
        this.svg = null;
        this.nodeRadius = 24;
        this.verticalSpacing = 70;
        this.activeAnimationTimeout = null;
    }

    render(bst) {
        if (!this.container) return;
        this.container.innerHTML = '';

        if (!bst || !bst.root) {
            this.container.innerHTML = `
                <div class="tree-empty-state">
                    <div class="tree-empty-icon">🌳</div>
                    <p class="tree-empty-text">The Binary Search Tree is currently empty.</p>
                    <span class="tree-empty-sub">Insert a book or run Demo Mode to visualize tree structure.</span>
                </div>
            `;
            return;
        }

        const width = Math.max(this.container.clientWidth || 900, 900);
        const height = Math.max((bst.getHeight() + 1) * this.verticalSpacing + 60, 420);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height.toString());
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.classList.add('bst-svg-canvas');

        // Defs for gradients and glow filters
        svg.innerHTML = `
            <defs>
                <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#4338ca" />
                </linearGradient>
                <linearGradient id="nodeGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#059669" />
                </linearGradient>
                <linearGradient id="nodeGradSearching" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#d97706" />
                </linearGradient>
                <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <g id="bst-links-layer"></g>
            <g id="bst-nodes-layer"></g>
        `;

        this.container.appendChild(svg);
        this.svg = svg;

        const linksLayer = svg.querySelector('#bst-links-layer');
        const nodesLayer = svg.querySelector('#bst-nodes-layer');

        // Calculate positions
        this.calculatePositions(bst.root, 0, width, 50, width / 4);

        // Draw Links and Nodes
        this.drawTree(bst.root, linksLayer, nodesLayer);
    }

    calculatePositions(node, left, right, y, offset) {
        if (!node) return;
        node.x = (left + right) / 2;
        node.y = y;

        if (node.left) {
            this.calculatePositions(node.left, left, node.x, y + this.verticalSpacing, offset / 2);
        }
        if (node.right) {
            this.calculatePositions(node.right, node.x, right, y + this.verticalSpacing, offset / 2);
        }
    }

    drawTree(node, linksLayer, nodesLayer) {
        if (!node) return;

        // Draw left link
        if (node.left) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y);
            line.setAttribute('x2', node.left.x);
            line.setAttribute('y2', node.left.y);
            line.setAttribute('class', 'bst-link-line');
            line.setAttribute('id', `bst-link-${node.key}-${node.left.key}`);
            linksLayer.appendChild(line);

            this.drawTree(node.left, linksLayer, nodesLayer);
        }

        // Draw right link
        if (node.right) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y);
            line.setAttribute('x2', node.right.x);
            line.setAttribute('y2', node.right.y);
            line.setAttribute('class', 'bst-link-line');
            line.setAttribute('id', `bst-link-${node.key}-${node.right.key}`);
            linksLayer.appendChild(line);

            this.drawTree(node.right, linksLayer, nodesLayer);
        }

        // Draw Node Group
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'bst-node-group');
        group.setAttribute('id', `bst-node-${node.key}`);
        group.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.nodeRadius.toString());
        circle.setAttribute('class', 'bst-node-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'bst-node-text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', '5');
        text.textContent = node.key;

        // Subtitle tag for author/copies
        const subtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subtext.setAttribute('class', 'bst-node-subtext');
        subtext.setAttribute('text-anchor', 'middle');
        subtext.setAttribute('dy', '36');
        const shortTitle = node.data?.title ? (node.data.title.length > 14 ? node.data.title.slice(0, 12) + '..' : node.data.title) : '';
        subtext.textContent = shortTitle;

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(subtext);

        // Click handler
        group.addEventListener('click', () => {
            if (this.onNodeClick && node.data) {
                this.onNodeClick(node.data, node.key);
            }
        });

        nodesLayer.appendChild(group);
    }

    /**
     * Animate Path Traversal for Search
     */
    async animateSearch(key, bst, logElement = null) {
        if (!bst || !bst.root || !this.svg) return null;
        this.clearHighlights();

        const searchResult = bst.search(key);
        const path = searchResult.path;

        if (logElement) {
            logElement.innerHTML = `<span>Searching for Book ID <strong>${key}</strong>: Traversing BST root to target...</span>`;
        }

        for (let i = 0; i < path.length; i++) {
            const currentKey = path[i];
            const isLast = i === path.length - 1;
            const nodeEl = this.svg.querySelector(`#bst-node-${currentKey}`);

            if (nodeEl) {
                nodeEl.classList.remove('bst-node-searching', 'bst-node-found', 'bst-node-traversed');
                if (isLast && searchResult.found) {
                    nodeEl.classList.add('bst-node-found');
                } else if (isLast && !searchResult.found) {
                    nodeEl.classList.add('bst-node-notfound');
                } else {
                    nodeEl.classList.add('bst-node-searching');
                }
            }

            if (i > 0) {
                const parentKey = path[i - 1];
                const linkEl = this.svg.querySelector(`#bst-link-${parentKey}-${currentKey}`) ||
                               this.svg.querySelector(`#bst-link-${currentKey}-${parentKey}`);
                if (linkEl) linkEl.classList.add('bst-link-active');
            }

            await new Promise(r => setTimeout(r, 600));
        }

        if (logElement) {
            if (searchResult.found) {
                logElement.innerHTML = `<span class="text-success">✓ Found Book ID <strong>${key}</strong> (${searchResult.data?.title}) in ${searchResult.steps} step(s)! Path: ${path.join(' → ')}</span>`;
            } else {
                logElement.innerHTML = `<span class="text-danger">✕ Book ID <strong>${key}</strong> not found in BST. Path searched: ${path.join(' → ')}</span>`;
            }
        }

        return searchResult;
    }

    /**
     * Animate Tree Traversal (Inorder, Preorder, Postorder)
     */
    async animateTraversal(type = 'inorder', bst, resultContainer = null) {
        if (!bst || !bst.root || !this.svg) return;
        this.clearHighlights();

        let nodesList = [];
        let traversalName = "In-Order (Left, Root, Right)";
        if (type === 'inorder') {
            nodesList = bst.inorder();
            traversalName = "In-Order (Ascending Order: Left → Root → Right)";
        } else if (type === 'preorder') {
            nodesList = bst.preorder();
            traversalName = "Pre-Order (Root → Left → Right)";
        } else if (type === 'postorder') {
            nodesList = bst.postorder();
            traversalName = "Post-Order (Left → Right → Root)";
        }

        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="traversal-info">
                    <span class="traversal-title">${traversalName}</span>
                    <div class="traversal-chips" id="traversal-chips-container"></div>
                </div>
            `;
        }

        const chipsContainer = resultContainer?.querySelector('#traversal-chips-container');

        for (let i = 0; i < nodesList.length; i++) {
            const item = nodesList[i];
            const nodeEl = this.svg.querySelector(`#bst-node-${item.key}`);

            if (nodeEl) {
                nodeEl.classList.add('bst-node-traversed');
            }

            if (chipsContainer) {
                const chip = document.createElement('span');
                chip.className = 'traversal-chip animate-pop';
                chip.innerHTML = `<strong>${item.key}</strong> <small>(${item.data?.title?.slice(0, 10) || ''}..)</small>`;
                chipsContainer.appendChild(chip);
            }

            await new Promise(r => setTimeout(r, 450));
        }
    }

    clearHighlights() {
        if (!this.svg) return;
        this.svg.querySelectorAll('.bst-node-group').forEach(el => {
            el.classList.remove('bst-node-searching', 'bst-node-found', 'bst-node-notfound', 'bst-node-traversed');
        });
        this.svg.querySelectorAll('.bst-link-line').forEach(el => {
            el.classList.remove('bst-link-active');
        });
    }
}
