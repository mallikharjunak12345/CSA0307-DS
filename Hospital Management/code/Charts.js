/**
 * Lightweight SVG Chart Engine for Library Analytics
 * Renders high-fidelity responsive Donut, Bar, and Progress charts without external libraries.
 */

export class Charts {
    /**
     * Render Books by Category Donut Chart
     */
    static renderCategoryDonut(containerId, categories) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (!categories || categories.length === 0) {
            container.innerHTML = '<div class="chart-empty">No category data available</div>';
            return;
        }

        const total = categories.reduce((sum, item) => sum + item.count, 0);
        const colors = [
            '#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
            '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#64748b'
        ];

        const size = 260;
        const radius = 90;
        const strokeWidth = 32;
        const circumference = 2 * Math.PI * radius;
        let cumulativePercent = 0;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.setAttribute('class', 'chart-donut-svg');

        // Background track
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', (size / 2).toString());
        bgCircle.setAttribute('cy', (size / 2).toString());
        bgCircle.setAttribute('r', radius.toString());
        bgCircle.setAttribute('class', 'chart-donut-bg');
        bgCircle.setAttribute('stroke-width', strokeWidth.toString());
        svg.appendChild(bgCircle);

        // Segments
        categories.forEach((item, index) => {
            const percent = item.count / total;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = (-circumference * cumulativePercent).toString();
            cumulativePercent += percent;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', (size / 2).toString());
            circle.setAttribute('cy', (size / 2).toString());
            circle.setAttribute('r', radius.toString());
            circle.setAttribute('fill', 'transparent');
            circle.setAttribute('stroke', colors[index % colors.length]);
            circle.setAttribute('stroke-width', strokeWidth.toString());
            circle.setAttribute('stroke-dasharray', strokeDasharray);
            circle.setAttribute('stroke-dashoffset', strokeDashoffset);
            circle.setAttribute('class', 'chart-donut-segment');
            svg.appendChild(circle);
        });

        // Center label
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', '50%');
        centerText.setAttribute('y', '48%');
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('class', 'chart-center-val');
        centerText.textContent = total.toString();

        const centerSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerSub.setAttribute('x', '50%');
        centerSub.setAttribute('y', '60%');
        centerSub.setAttribute('text-anchor', 'middle');
        centerSub.setAttribute('class', 'chart-center-lbl');
        centerSub.textContent = 'Titles';

        svg.appendChild(centerText);
        svg.appendChild(centerSub);

        // Legend
        const legend = document.createElement('div');
        legend.className = 'chart-donut-legend';
        categories.forEach((item, index) => {
            const percent = ((item.count / total) * 100).toFixed(0);
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-color-dot" style="background-color: ${colors[index % colors.length]}"></span>
                <span class="legend-label">${item.category}</span>
                <span class="legend-val"><strong>${item.count}</strong> (${percent}%)</span>
            `;
            legend.appendChild(legendItem);
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'chart-donut-layout';
        wrapper.appendChild(svg);
        wrapper.appendChild(legend);

        container.appendChild(wrapper);
    }

    /**
     * Render Popular Books Horizontal Bar Chart
     */
    static renderPopularBooks(containerId, books) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (!books || books.length === 0) {
            container.innerHTML = '<div class="chart-empty">No borrowing history available</div>';
            return;
        }

        const maxBorrow = Math.max(...books.map(b => b.borrowCount), 1);

        const list = document.createElement('div');
        list.className = 'popular-books-chart-list';

        books.forEach((book, i) => {
            const percentage = ((book.borrowCount / maxBorrow) * 100).toFixed(1);
            const row = document.createElement('div');
            row.className = 'popular-bar-row';
            row.innerHTML = `
                <div class="popular-bar-header">
                    <span class="popular-book-rank">#${i + 1}</span>
                    <span class="popular-book-name" title="${book.title}">${book.title}</span>
                    <span class="popular-book-count"><strong>${book.borrowCount}</strong> borrows</span>
                </div>
                <div class="popular-bar-track">
                    <div class="popular-bar-fill" style="width: ${percentage}%"></div>
                </div>
            `;
            list.appendChild(row);
        });

        container.appendChild(list);
    }

    /**
     * Render Monthly Borrowing Activity Bar Chart
     */
    static renderMonthlyActivity(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
        const values = [18, 29, 41, 35, 52, 64];
        const maxVal = Math.max(...values);

        const barChart = document.createElement('div');
        barChart.className = 'monthly-bar-chart';

        months.forEach((month, idx) => {
            const val = values[idx];
            const heightPercent = ((val / maxVal) * 100).toFixed(0);

            const col = document.createElement('div');
            col.className = 'bar-col';
            col.innerHTML = `
                <div class="bar-val">${val}</div>
                <div class="bar-track">
                    <div class="bar-fill" style="height: ${heightPercent}%"></div>
                </div>
                <div class="bar-label">${month}</div>
            `;
            barChart.appendChild(col);
        });

        container.appendChild(barChart);
    }
}
