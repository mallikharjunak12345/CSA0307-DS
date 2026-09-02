/**
 * Interactive Priority Queue (Binary Min-Heap) Visualizer
 * Renders both the Complete Binary Heap Tree and the Linear Array & Priority Rank List.
 */

export class HeapVisualizer {
    constructor(containerId, onNodeClick = null) {
        this.container = document.getElementById(containerId);
        this.onNodeClick = onNodeClick;
        this.nodeRadius = 26;
        this.verticalSpacing = 75;
    }

    render(priorityQueue) {
        if (!this.container || !priorityQueue) return;
        this.container.innerHTML = '';

        const heapArray = priorityQueue.getHeapArray();
        const sortedQueue = priorityQueue.getSortedQueue();

        // Top Summary Bar
        const summaryBar = document.createElement('div');
        summaryBar.className = 'heap-summary-bar';
        summaryBar.innerHTML = `
            <div class="heap-metric-chip">
                <span class="chip-label">Queue Length:</span>
                <span class="chip-val"><strong>${priorityQueue.size()}</strong> pending</span>
            </div>
            <div class="heap-metric-chip">
                <span class="chip-label">Heap Root (Next Served):</span>
                <span class="chip-val text-primary"><strong>${priorityQueue.peek()?.memberName || 'None (Empty)'}</strong></span>
            </div>
            <div class="heap-metric-chip">
                <span class="chip-label">Heap Type:</span>
                <span class="chip-val">Binary Min-Heap (P1 &lt; P2 &lt; P3)</span>
            </div>
        `;
        this.container.appendChild(summaryBar);

        if (priorityQueue.isEmpty()) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'heap-empty-state';
            emptyDiv.innerHTML = `
                <div class="tree-empty-icon">⏳</div>
                <p class="tree-empty-text">No active reservations in the Priority Queue.</p>
                <span class="tree-empty-sub">Enqueue a reservation or try the Demo Mode.</span>
            `;
            this.container.appendChild(emptyDiv);
            return;
        }

        // Dual Visualizer Grid (Left: Priority Rank List, Right: Binary Tree Heap)
        const visualGrid = document.createElement('div');
        visualGrid.className = 'heap-visual-grid';

        // 1. Priority Rank List (Service Order)
        const listCard = document.createElement('div');
        listCard.className = 'heap-list-panel';
        listCard.innerHTML = `
            <div class="panel-header">
                <h4>🎯 Priority Service Order</h4>
                <small>Higher rank dequeued first</small>
            </div>
            <div class="heap-cards-list">
                ${sortedQueue.map((item, idx) => {
                    const badgeClass = item.priority === 1 ? 'badge-faculty' : (item.priority === 2 ? 'badge-scholar' : 'badge-student');
                    const priorityText = item.priority === 1 ? 'Priority 1 (Faculty)' : (item.priority === 2 ? 'Priority 2 (Researcher)' : 'Priority 3 (Student)');
                    return `
                        <div class="heap-service-card rank-${idx + 1}" id="heap-service-card-${item.reservationId}">
                            <div class="rank-badge">#${idx + 1}</div>
                            <div class="card-info">
                                <div class="member-name">${item.memberName}</div>
                                <div class="book-title">Book: ${item.bookTitle}</div>
                                <div class="queue-meta">
                                    <span class="badge ${badgeClass}">${priorityText}</span>
                                    <small class="text-muted">Req: ${new Date(item.requestTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        visualGrid.appendChild(listCard);

        // 2. Binary Heap SVG Tree Panel
        const treeCard = document.createElement('div');
        treeCard.className = 'heap-tree-panel';
        treeCard.innerHTML = `
            <div class="panel-header">
                <h4>🌳 Binary Heap Structure (Tree View)</h4>
                <small>Min-Heap: Parent priority &le; Children priority</small>
            </div>
            <div class="heap-svg-wrapper" id="heap-svg-wrapper"></div>
        `;
        visualGrid.appendChild(treeCard);

        this.container.appendChild(visualGrid);

        // Render SVG Heap Tree
        const svgWrapper = visualGrid.querySelector('#heap-svg-wrapper');
        this.renderHeapTreeSVG(svgWrapper, heapArray);

        // 3. Array-based Representation Bar
        const arrayCard = document.createElement('div');
        arrayCard.className = 'heap-array-panel';
        arrayCard.innerHTML = `
            <div class="panel-header">
                <h4>📊 Linear Heap Array Representation (Memory Layout)</h4>
                <small>Formula: Left = 2i + 1, Right = 2i + 2, Parent = &lfloor;(i-1)/2&rfloor;</small>
            </div>
            <div class="heap-array-slots">
                ${heapArray.map((node, i) => `
                    <div class="heap-array-cell" id="heap-array-cell-${i}">
                        <div class="cell-index">[${i}]</div>
                        <div class="cell-priority priority-p${node.priority}">P${node.priority}</div>
                        <div class="cell-name">${node.reservation.memberName.split(' ')[0]}</div>
                    </div>
                `).join('')}
            </div>
        `;
        this.container.appendChild(arrayCard);
    }

    renderHeapTreeSVG(wrapper, heapArray) {
        if (!wrapper || heapArray.length === 0) return;

        const width = Math.max(wrapper.clientWidth || 550, 550);
        const depth = Math.floor(Math.log2(heapArray.length)) + 1;
        const height = Math.max(depth * this.verticalSpacing + 60, 320);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height.toString());
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.classList.add('heap-svg-canvas');

        const linksG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(linksG);
        svg.appendChild(nodesG);
        wrapper.appendChild(svg);

        // Assign coordinates
        const positions = [];
        for (let i = 0; i < heapArray.length; i++) {
            const level = Math.floor(Math.log2(i + 1));
            const levelIndex = i - (Math.pow(2, level) - 1);
            const levelCapacity = Math.pow(2, level);
            const segmentWidth = width / levelCapacity;
            const x = segmentWidth * levelIndex + segmentWidth / 2;
            const y = 45 + level * this.verticalSpacing;
            positions.push({ x, y });
        }

        // Draw Links
        for (let i = 0; i < heapArray.length; i++) {
            const leftChild = 2 * i + 1;
            const rightChild = 2 * i + 2;

            if (leftChild < heapArray.length) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', positions[i].x);
                line.setAttribute('y1', positions[i].y);
                line.setAttribute('x2', positions[leftChild].x);
                line.setAttribute('y2', positions[leftChild].y);
                line.setAttribute('class', 'heap-link-line');
                line.setAttribute('id', `heap-link-${i}-${leftChild}`);
                linksG.appendChild(line);
            }

            if (rightChild < heapArray.length) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', positions[i].x);
                line.setAttribute('y1', positions[i].y);
                line.setAttribute('x2', positions[rightChild].x);
                line.setAttribute('y2', positions[rightChild].y);
                line.setAttribute('class', 'heap-link-line');
                line.setAttribute('id', `heap-link-${i}-${rightChild}`);
                linksG.appendChild(line);
            }
        }

        // Draw Nodes
        for (let i = 0; i < heapArray.length; i++) {
            const node = heapArray[i];
            const pos = positions[i];

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', `heap-node-group priority-node-p${node.priority}`);
            g.setAttribute('id', `heap-node-${i}`);
            g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', this.nodeRadius.toString());
            circle.setAttribute('class', 'heap-node-circle');

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'heap-node-text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dy', '4');
            text.textContent = `P${node.priority}`;

            const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sub.setAttribute('class', 'heap-node-subtext');
            sub.setAttribute('text-anchor', 'middle');
            sub.setAttribute('dy', '34');
            sub.textContent = node.reservation.memberName.split(' ')[0];

            g.appendChild(circle);
            g.appendChild(text);
            g.appendChild(sub);

            nodesG.appendChild(g);
        }
    }
}
