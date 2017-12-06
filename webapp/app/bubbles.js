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

        this.bubbles.forEach(b => {
            // Copy packed coordinates, x,y,r will be modified by simulation
            b.packedX = b.x;
            b.packedY = b.y;
            b.packedR = b.r;
            // Give pretty names
            b.prettyText = _.capitalize(b.data.text.replace('_', ' '));
        });

        // Store class attributes
        this.selectedBubble = null;
        this.dimensionsFull = dimensionsFull;
        this.dimensionsCollapsed = dimensionsCollapsed;
        this.animTime = animTime;
        this.selector = selector;
        // Prepare and store canvas
        this.canvas = d3.select(this.selector)
            .append('canvas')
            .attr('id', 'svg-bubbles')
            .attr('width', dimensionsFull[0])
            .attr('height', dimensionsFull[1]);
        // and its 2d Context
        this.context = this.canvas.node().getContext('2d');
        // Create physics simulator
        this.simulation = d3.forceSimulation(this.bubbles);
        this.startSimulation();
    }

    startSimulation() {
        if (this.simulationRunning) return;
        this.simulation.force('collide', d3.forceCollide(b => b.r + 5).iterations(5))
            .force('xf', d3.forceX(this.dimensionsFull[0] / 2))
            .force('yf', d3.forceY(this.dimensionsFull[1] / 2))
            .on('tick', this.draw.bind(this, false));

        // Enable drag&drop
        this.canvas.call(d3.drag()
            .subject(() => this.simulation.find(d3.event.x, d3.event.y))
            .on('start', () => {
                this.dragging = false;
                if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
            })
            .on('drag', () => {
                this.dragging = true;
                if (!this.collapsed) {
                    d3.event.subject.fx = d3.event.x;
                    d3.event.subject.fy = d3.event.y;
                }
            })
            .on('end', () => {
                if (!this.dragging) this.callback(d3.event.subject);
                this.dragging = false;
                if (!d3.event.active) this.simulation.alphaTarget(0);
                d3.event.subject.fx = null;
                d3.event.subject.fy = null;
            })
        );
        this.simulationRunning = true;
    }

    reset() {
        this.bubbles.forEach(b => {
            b.x = b.packedX;
            b.y = b.packedY;
            b.r = b.packedR;
        })
    }

    stopSimulation() {
        // Remove forces from simulation
        this.simulation.force('xf', null)
                       .force('yf', null)
                       .force('collide', null);
        this.simulationRunning = false;
    }

    callback(layout_bubble) {
        this.reset();
        // Click on already selected => reset
        if (this.selectedBubble && layout_bubble.data.text === this.selectedBubble) {
            this.collapsed = false;
            this.selectedBubble = null;
            this.draw();
            this.startSimulation();
        } else { // Otherwise select new bubble and redraw
            this.collapsed = true;
            this.selectedBubble = layout_bubble.data.text;
            this.stopSimulation();
            this.collapse();
            this.draw();
        }
        // Execute bubble callback if one was provided
        if (_.has(layout_bubble.data, 'callback')) layout_bubble.data.callback();
    }

    draw() {
        const [width, height] = this.dimensionsFull;
        const ctx = this.context;
        ctx.clearRect(0, 0, width, height);
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        this.bubbles.forEach(b => {
            ctx.beginPath();
            ctx.moveTo(b.x + b.r, b.y);
            ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
            ctx.fillStyle = color(b.data.size);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(b.prettyText, b.x, b.y);
            ctx.closePath();
        })

        //this.startSimulation(); // Need to be here too for first launch. Method avoids recreating if already exists.
    }

    collapse() {
        const specialSize = this.dimensionsCollapsed[0];
        const normalSize = (this.dimensionsCollapsed[1] - this.dimensionsCollapsed[0]) / (this.bubbles.length - 1);
        const newSizes = this.bubbles.map(b => b.data.text === this.selectedBubble ? specialSize : normalSize)
        for (let i = 1; i < newSizes.length; ++i) {
            newSizes[i] += newSizes[i - 1];
        }
        const startToEnd = _.zip([0, ...newSizes.slice(0, -1)], newSizes);
        const nameToPos = _.fromPairs(_.zip(this.bubbles.map(b => b.data.text), startToEnd));

        const x = _.max(startToEnd.map(t => (t[1] - t[0]) / 2));

        this.bubbles.forEach((b, idx) => {
            const [start, end] = nameToPos[b.data.text];
            const r = (end - start) / 2;
            const y = start + r;

            b.x = x;
            b.y = y;
            b.r = r;
        })
   }
}
