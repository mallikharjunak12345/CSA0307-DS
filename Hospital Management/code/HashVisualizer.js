/**
 * Interactive Hash Table Visualizer
 * Renders bucket slots, collision chains (Separate Chaining), real-time load factor, and polynomial hash math steps.
 */

export class HashVisualizer {
    constructor(containerId, onNodeClick = null) {
        this.container = document.getElementById(containerId);
        this.onNodeClick = onNodeClick;
    }

    render(hashTable) {
        if (!this.container || !hashTable) return;
        this.container.innerHTML = '';

        const metrics = hashTable.getMetrics();
        const buckets = hashTable.getBucketsForVisualizer();

        // 1. Metrics Header Bar
        const metricsBar = document.createElement('div');
        metricsBar.className = 'hash-metrics-grid';
        metricsBar.innerHTML = `
            <div class="hash-metric-card">
                <span class="hash-metric-label">Capacity (Buckets)</span>
                <span class="hash-metric-val">${metrics.capacity}</span>
            </div>
            <div class="hash-metric-card">
                <span class="hash-metric-label">Stored Keys (n)</span>
                <span class="hash-metric-val">${metrics.size}</span>
            </div>
            <div class="hash-metric-card">
                <span class="hash-metric-label">Collision Count</span>
                <span class="hash-metric-val ${metrics.collisionCount > 0 ? 'text-warning' : 'text-success'}">${metrics.collisionCount}</span>
            </div>
            <div class="hash-metric-card">
                <span class="hash-metric-label">Load Factor (&lambda; = n/k)</span>
                <span class="hash-metric-val ${metrics.loadFactor > 0.75 ? 'text-warning' : 'text-success'}">${metrics.loadFactor}</span>
            </div>
            <div class="hash-metric-card">
                <span class="hash-metric-label">Max Chain Depth</span>
                <span class="hash-metric-val">${metrics.maxChainLength}</span>
            </div>
        `;
        this.container.appendChild(metricsBar);

        // 2. Buckets Visualization Container
        const tableGrid = document.createElement('div');
        tableGrid.className = 'hash-buckets-container';

        buckets.forEach(bucket => {
            const row = document.createElement('div');
            row.className = `hash-bucket-row ${bucket.isEmpty ? 'bucket-empty' : 'bucket-filled'}`;
            row.id = `hash-bucket-${bucket.index}`;

            // Index slot header
            const indexHeader = document.createElement('div');
            indexHeader.className = 'hash-index-slot';
            indexHeader.innerHTML = `
                <span class="hash-index-num">Index [${bucket.index}]</span>
                <span class="hash-chain-badge">${bucket.chainLength} items</span>
            `;
            row.appendChild(indexHeader);

            // Chain of nodes
            const chainContainer = document.createElement('div');
            chainContainer.className = 'hash-chain-nodes';

            if (bucket.isEmpty) {
                chainContainer.innerHTML = `<span class="hash-node-empty">null (Empty Slot)</span>`;
            } else {
                bucket.nodes.forEach((node, idx) => {
                    const nodeEl = document.createElement('div');
                    nodeEl.className = 'hash-node-box';
                    nodeEl.id = `hash-node-${bucket.index}-${idx}`;
                    
                    const titleText = node.value?.title || (typeof node.value === 'string' ? node.value : node.key);
                    const isCollision = idx > 0;

                    nodeEl.innerHTML = `
                        <div class="hash-node-badge ${isCollision ? 'badge-collision' : 'badge-head'}">
                            ${isCollision ? '⚡ Collision Chain' : '★ Bucket Head'}
                        </div>
                        <div class="hash-node-key">Key: <strong>${node.key}</strong></div>
                        <div class="hash-node-val" title="${titleText}">${titleText}</div>
                    `;

                    nodeEl.addEventListener('click', () => {
                        if (this.onNodeClick && node.value) {
                            this.onNodeClick(node.value, node.key);
                        }
                    });

                    chainContainer.appendChild(nodeEl);

                    // Add Arrow between nodes
                    if (idx < bucket.nodes.length - 1) {
                        const arrow = document.createElement('div');
                        arrow.className = 'hash-chain-arrow';
                        arrow.innerHTML = '➔';
                        chainContainer.appendChild(arrow);
                    }
                });

                // Trailing null pointer
                const nullTail = document.createElement('div');
                nullTail.className = 'hash-chain-null';
                nullTail.innerHTML = '➔ null';
                chainContainer.appendChild(nullTail);
            }

            row.appendChild(chainContainer);
            tableGrid.appendChild(row);
        });

        this.container.appendChild(tableGrid);
    }

    /**
     * Animate Search in Hash Table showing Hash Math and Bucket Jump
     */
    async animateSearch(key, hashTable, mathFormulaEl = null) {
        if (!this.container || !hashTable) return;
        this.clearHighlights();

        const searchRes = hashTable.get(key);
        const { index, rawHash, steps } = searchRes.hashInfo;

        if (mathFormulaEl) {
            mathFormulaEl.innerHTML = `
                <div class="hash-math-explanation">
                    <div class="hash-math-row">
                        <strong>1. Polynomial Hash:</strong>
                        <code>Hash("${key}") = ${steps} = ${rawHash}</code>
                    </div>
                    <div class="hash-math-row">
                        <strong>2. Modulo Index:</strong>
                        <code>${rawHash} % ${hashTable.capacity} = <span class="hash-index-target">Index [${index}]</span></code>
                    </div>
                    <div class="hash-math-row">
                        <strong>3. Lookup Result:</strong>
                        ${searchRes.found 
                            ? `<span class="text-success">Found key "${key}" in Bucket [${index}] within ${searchRes.steps} chain comparison(s)! (Average O(1))</span>` 
                            : `<span class="text-danger">Key "${key}" maps to Bucket [${index}] but was not found.</span>`}
                    </div>
                </div>
            `;
        }

        const bucketRow = this.container.querySelector(`#hash-bucket-${index}`);
        if (bucketRow) {
            bucketRow.classList.add('hash-bucket-highlight');
            bucketRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Highlight target node
            if (searchRes.found) {
                const nodes = bucketRow.querySelectorAll('.hash-node-box');
                for (let i = 0; i < nodes.length; i++) {
                    await new Promise(r => setTimeout(r, 200));
                    nodes[i].classList.add('hash-node-highlight');
                }
            }
        }

        return searchRes;
    }

    clearHighlights() {
        if (!this.container) return;
        this.container.querySelectorAll('.hash-bucket-row').forEach(el => {
            el.classList.remove('hash-bucket-highlight');
        });
        this.container.querySelectorAll('.hash-node-box').forEach(el => {
            el.classList.remove('hash-node-highlight');
        });
    }
}
