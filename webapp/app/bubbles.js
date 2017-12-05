import * as d3 from 'd3';
import * as _ from 'lodash';

export class Bubbles {
    constructor(selector, bubbles, dimensionsFull, dimensionsCollapsed, animTime = 500) {
        // Compute coordinates for bubbles
        const layout = d3.pack()
            .size(dimensionsFull)
            .padding(5);
        const root = d3.hierarchy({ children: bubbles })
            .sum(bubble => bubble.size)
            .sort((a, b) => b.size - a.size);
        layout(root);

        // Store new bubbles objects
        this.bubbles = root.children;

        // Copy packed coordinates, x,y will be modified by simulation
        this.bubbles.forEach(b => {
            b.packed_x = b.x;
            b.packed_y = b.y;
        });

        // Store class attributes
        this.selectedBubble = null;
        this.dimensionsFull = dimensionsFull;
        this.dimensionsCollapsed = dimensionsCollapsed;
        this.animTime = animTime;
        this.selector = selector;
        // Prepare and store svg
        this.svg = d3.select(this.selector)
            .append('svg')
            .attr('id', 'svg-bubbles')
            .attr('viewBox', `0 0 ${dimensionsFull[0]} ${dimensionsFull[1]}`)
            .attr('width', dimensionsFull[0])
            .attr('height', dimensionsFull[1]);
        this.drawn = false;

    }

    startSimulation() {
        // Check if already running before instantiating new one;
        if (this.simulation) return;

        const simulation = d3.forceSimulation(this.bubbles)
            .force('collide', d3.forceCollide(b => b.r))
            .on('tick', this.drawFull.bind(this, false));

        // Enable drag&drop
        this.svg.call(d3.drag()
            .subject(() => simulation.find(d3.event.x, d3.event.y))
            .on('start', () => {
                if (!d3.event.active) simulation.alphaTarget(1).restart();
            })
            .on('drag', () => {
                d3.event.subject.fx = d3.event.x;
                d3.event.subject.fy = d3.event.y;
            })
            .on('end', () => {
                if (!d3.event.active) simulation.alphaTarget(0);
                d3.event.subject.fx = null;
                d3.event.subject.fy = null;
            })
        );

        this.simulation = simulation;
    }

    stopSimualtion() {
        this.simulation.stop();
        this.simulation = null;

        // Disable drag&drop
        this.svg.on('mousedown.drag', null);
    }

    callback(layout_bubble) {
        // Click on already selected => reset
        if (this.selectedBubble && layout_bubble.data.text === this.selectedBubble) {
            this.selectedBubble = null;
            this.drawFull(true);
            this.startSimulation();
        } else { // Otherwise select new bubble and redraw
            this.selectedBubble = layout_bubble.data.text;
            this.drawCollapsed();
            this.stopSimualtion();
        }
        // Execute bubble callback if one was provided
        if (_.has(layout_bubble.data, 'callback')) layout_bubble.data.callback();
    }

    drawFull(reset) {
        if (reset) {
            this.bubbles.forEach(b => {
                b.x = b.packed_x;
                b.y = b.packed_y;
            })
        }

        if (!this.drawn) {
            const [width, height] = this.dimensionsFull;
            const start = this.svg.selectAll('g')
                .data(this.bubbles)
                .enter()
                .append('g')
                .attr('transform', layout_bubble => `translate(${layout_bubble.x}, ${layout_bubble.y})`)
                .on('click', this.callback.bind(this));

            const color = d3.scaleOrdinal(d3.schemeCategory10);
            start.append('circle')
                .attr('fill', b => color(b.data.size))
                .attr('r', b => b.r);

            start.append('text')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .text(b => _.capitalize(b.data.text.replace('_', ' ')));
            this.drawn = true;
            this.startSimulation(); // Need to be here too for first launch. Method avoids recreating if already exists.
        } else {
            this.svg.selectAll('g')
                .transition()
                .delay(this.animTime)
                .attr('transform', d => `translate(${d.x}, ${d.y})`)
                .selectAll('circle')
                .attr('r', d => d.r)
                .duration(this.animTime);
        }
    }


    drawCollapsed() {
        const padding = 10;
        const padCount = this.bubbles.length - 1;
        const specialSize = this.dimensionsCollapsed[0];
        const normalSize = (this.dimensionsCollapsed[1] - this.dimensionsCollapsed[0]) / (this.bubbles.length - 1);
        const newSizes = this.bubbles.map(b => b.data.text === this.selectedBubble ? specialSize : normalSize)
        for (let i = 1; i < newSizes.length; ++i) {
            newSizes[i] += newSizes[i - 1];
        }
        const startToEnd = _.zip([0, ...newSizes.slice(0, -1)], newSizes);
        const nameToPos = _.fromPairs(_.zip(this.bubbles.map(b => b.data.text), startToEnd));

        const x = _.max(startToEnd.map(t => (t[1] - t[0]) / 2));

        const translate = (node, index) => {
            const [start, end] = nameToPos[node.data.text];
            let y = start + (end - start) / 2;
            y = index > 0 ? y + padding : y;
            return `translate(${x}, ${y})`;
        };

        this.svg.selectAll('g')
            .transition()
            .attr('transform', (n, i) => translate(n, i))
            .duration(this.animTime)
            .selectAll('circle')
            .attr('r', n => {
                const [start, end] = nameToPos[n.data.text];
                return (end - start) / 2
            });
    }
}
