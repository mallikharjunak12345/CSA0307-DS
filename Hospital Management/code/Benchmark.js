/**
 * Live Algorithm Benchmark UI Component
 * Measures and renders real-time performance comparison between Hash Table, BST, and Linear Search.
 */

export class Benchmark {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    renderResult(benchmarkData) {
        if (!this.container || !benchmarkData) return;
        this.container.innerHTML = '';

        const { key, found, book, hash, bst, linear } = benchmarkData;

        const card = document.createElement('div');
        card.className = 'benchmark-results-panel';

        card.innerHTML = `
            <div class="benchmark-header">
                <div class="benchmark-title-wrap">
                    <h4>⚡ Live Search Algorithm Complexity Benchmark</h4>
                    <span class="benchmark-sub">Executed on live dataset with 5,000 sampling iterations</span>
                </div>
                <div class="benchmark-status-badge ${found ? 'status-found' : 'status-notfound'}">
                    ${found ? `✓ Target Found: "${book?.title || key}"` : `✕ Key "${key}" Not Found`}
                </div>
            </div>

            <div class="benchmark-grid">
                <!-- 1. Hash Table Search Card -->
                <div class="algo-card algo-hash">
                    <div class="algo-card-top">
                        <div class="algo-badge badge-hash">Hash Table</div>
                        <div class="algo-complexity">${hash.complexity}</div>
                    </div>
                    <div class="algo-time-metric">
                        <span class="time-value">${hash.timeUs}</span>
                        <span class="time-unit">&mu;s / query</span>
                    </div>
                    <div class="algo-meta-list">
                        <div class="algo-meta-item">
                            <span>Steps Taken:</span>
                            <strong>${hash.steps} step (Bucket [${hash.bucketIndex}])</strong>
                        </div>
                        <div class="algo-meta-item">
                            <span>Mechanism:</span>
                            <span>Direct Bucket Indexing</span>
                        </div>
                        <div class="algo-meta-item">
                            <span>Best for:</span>
                            <span>Instant ID / ISBN Lookup</span>
                        </div>
                    </div>
                    <div class="algo-bar-wrapper">
                        <div class="algo-bar-fill fill-hash" style="width: 15%"></div>
                    </div>
                </div>

                <!-- 2. Binary Search Tree Card -->
                <div class="algo-card algo-bst">
                    <div class="algo-card-top">
                        <div class="algo-badge badge-bst">Binary Search Tree</div>
                        <div class="algo-complexity">${bst.complexity}</div>
                    </div>
                    <div class="algo-time-metric">
                        <span class="time-value">${bst.timeUs}</span>
                        <span class="time-unit">&mu;s / query</span>
                    </div>
                    <div class="algo-meta-list">
                        <div class="algo-meta-item">
                            <span>Steps Taken:</span>
                            <strong>${bst.steps} node comparison(s)</strong>
                        </div>
                        <div class="algo-meta-item">
                            <span>Path Traversed:</span>
                            <span class="algo-path-text">${bst.path.length > 0 ? bst.path.join(' → ') : 'N/A'}</span>
                        </div>
                        <div class="algo-meta-item">
                            <span>Best for:</span>
                            <span>Range Queries & Sorted Traversal</span>
                        </div>
                    </div>
                    <div class="algo-bar-wrapper">
                        <div class="algo-bar-fill fill-bst" style="width: 45%"></div>
                    </div>
                </div>

                <!-- 3. Linear Search Card -->
                <div class="algo-card algo-linear">
                    <div class="algo-card-top">
                        <div class="algo-badge badge-linear">Linear Search</div>
                        <div class="algo-complexity">${linear.complexity}</div>
                    </div>
                    <div class="algo-time-metric">
                        <span class="time-value">${linear.timeUs}</span>
                        <span class="time-unit">&mu;s / query</span>
                    </div>
                    <div class="algo-meta-list">
                        <div class="algo-meta-item">
                            <span>Steps Taken:</span>
                            <strong>${linear.steps} sequential scans</strong>
                        </div>
                        <div class="algo-meta-item">
                            <span>Mechanism:</span>
                            <span>Iterative Array Scan (0 to n)</span>
                        </div>
                        <div class="algo-meta-item">
                            <span>Best for:</span>
                            <span>Unsorted / Small Lists</span>
                        </div>
                    </div>
                    <div class="algo-bar-wrapper">
                        <div class="algo-bar-fill fill-linear" style="width: 90%"></div>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(card);
    }
}
