import * as d3 from 'd3';
import * as _ from 'lodash';
import { textToImage } from './imagemap';

export class Bubbles {
    constructor(selector, bubbles, dimensionsFull, dimensionsCollapsed, compareMultiple, animTime = 500) {
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
        this.compareMultiple = compareMultiple;
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

        this.drawnButtons = false;
    }

    startDragging() {
        this.dragging = false;
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    }

    duringDragging() {
        this.dragging = true;
        if (this.collapsed) return;

        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
    }

    endDraggin() {
        if (!this.dragging) this.callback(d3.event.subject);
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;

        // Multiple selection through drag and drop
        if (this.dragging && !this.collapsed && d3.event.subject.x < this.dimensionsCollapsed[0]) {
            // Disable forces if in selection area
            this.removeForcesFromBubble(d3.event.subject);
            // Add bubble to list of selected
            this.selectedBubbles = [..._.get(this, 'selectedBubbles', []), d3.event.subject];
            this.selectedBubbles.forEach(b => {
                b.r = this.dimensionsCollapsed[0] / 2;
                b.x = this.dimensionsCollapsed[0] / 2
            });
            this.draw();
            this.addMultipleSelectionButtons();
            this.collapse(this.selectedBubbles);
        }

        this.dragging = false;
    }

    removeForcesFromBubble(b) {
        this.simulation.nodes(this.simulation.nodes().filter(b1 => b1.data.text != b.data.text));
    }

    startSimulation() {
        if (this.simulationRunning) return;
        this.bubbles.forEach(b => b.r = b.packedR);//this.reset();
        this.simulation.force('collide', d3.forceCollide(b => b.r + 5).iterations(5))
            .force('xf', d3.forceX(b => b.packedX).strength(1))
            .force('yf', d3.forceY(b => b.packedY).strength(1))
            .on('tick', this.draw.bind(this));

        // Enable drag&drop
        this.canvas.call(d3.drag()
            .subject(() => this.simulation.find(d3.event.x, d3.event.y))
            .on('start', this.startDragging.bind(this))
            .on('drag', this.duringDragging.bind(this))
            .on('end', this.endDraggin.bind(this))
        );
        this.simulationRunning = true;
    }

    activateColllapseForces() {
        this.bubbles.forEach(b => {
            b.simulation = d3.forceSimulation([b])
                .force('cx', d3.forceX(b.cx))
                .force('cy', d3.forceY(b.cy))
                .on('tick', () => {
                    b.r = d3.interpolate(b.cr, b.packedR)(b.simulation.alpha());
                    this.draw.bind(this)
                });
        });
    }

    deleteColllapseForces() {
        this.bubbles.forEach(b => {
            if (!b.simulation) return;

            b.simulation.force('cx', null).force('cy', null)
            b.simulation.on('tick', null);
            b.simulation.stop();
        });
    }

    stopSimulation() {
        // Remove forces from simulation
        this.simulation.force('xf', null)
            .force('yf', null)
            .force('collide', null);
        this.simulationRunning = false;
    }

    reset() {
        this.bubbles.forEach(b => {
            b.x = b.packedX;
            b.y = b.packedY;
            b.r = b.packedR;
        });
        this.selectedBubbles = [];
    }

    resetView() {
        this.collapsed = false;
        this.selectedBubble = null;
        this.bubbles.forEach(b => b.r = b.packedR);//this.reset();
        this.deleteColllapseForces();
        this.simulation.nodes(this.bubbles);
        this.startSimulation();
    }

    callback(layout_bubble) {
        // Click on already selected => reset
        if (this.selectedBubble && layout_bubble.data.text === this.selectedBubble) {
            this.resetView();
        } else { // Otherwise select new bubble and redraw
            this.collapsed = true;
            this.selectedBubble = layout_bubble.data.text;
            this.stopSimulation();
            this.collapse(this.bubbles, [this.selectedBubble]);
            this.activateColllapseForces();
        }
        // Execute bubble callback if one was provided
        if (_.has(layout_bubble.data, 'callback')) layout_bubble.data.callback();
    }

    collapse(bubbles, selected = null) {
        const specialSize = this.dimensionsCollapsed[0];
        const normalSize = (this.dimensionsCollapsed[1] - this.dimensionsCollapsed[0]) / (bubbles.length - 1);

        const newSizes = selected != null ? bubbles.map(b => selected.includes(b.data.text) ? specialSize : normalSize)
            : Array(bubbles.length).fill(this.dimensionsCollapsed[1] / bubbles.length);

        for (let i = 1; i < newSizes.length; ++i) {
            newSizes[i] += newSizes[i - 1];
        }
        const startToEnd = _.zip([0, ...newSizes.slice(0, -1)], newSizes);
        const nameToPos = _.fromPairs(_.zip(bubbles.map(b => b.data.text), startToEnd));

        const x = this.dimensionsCollapsed[0] / 2;

        bubbles.forEach((b, idx) => {
            const [start, end] = nameToPos[b.data.text];
            const r = (end - start) / 2;
            const y = start + r;

            b.cx = x;
            b.cy = y;
            b.cr = _.clamp(r, 0, this.dimensionsCollapsed[0] / 2);
        });
    }

    addMultipleSelectionButtons() {
        if (this.drawnButtons) return;
        const div = d3.select(this.selector)
            .append('div')
            .attr('id', 'selection-buttons');

        div.append('button')
            .attr('type', 'button')
            .attr('class', 'btn btn-success btn-block')
            .html('Compare')
            .on('click', () => {
                const selectedNames = this.selectedBubbles.map(b => b.data.text);
                this.notDrawing = new Set(this.bubbles.filter(b => !selectedNames.includes(b.data.text)).map(b => b.data.text));
                this.collapsed = true;
                this.stopSimulation();
                this.compareMultiple(selectedNames);
            });

        const emptySelection = () => {
            this.simulation.nodes([...this.simulation.nodes(), ...this.selectedBubbles]);
            this.selectedBubbles = [];
            this.notDrawing = null;
            this.compareMultiple([]);
            this.resetView()
        };

        div.append('button')
            .attr('type', 'button')
            .attr('class', 'btn btn-danger btn-block')
            .html('Reset')
            .on('click', emptySelection);
        this.drawnButtons = true;
    }

    removeMultipleSelectionButtons() {
        d3.select(this.selector).select('#selection-buttons').remove();
        this.drawnButtons = false;
    }

    draw() {
        const [width, height] = this.dimensionsFull;
        const ctx = this.context;

        ctx.clearRect(0, 0, width, height);

        if (!this.selectedBubbles || !this.selectedBubbles.length) this.removeMultipleSelectionButtons();

        if (this.dragging || (this.selectedBubbles && this.selectedBubbles.length)) {
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, this.dimensionsCollapsed[0], this.dimensionsCollapsed[1]);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Drag here to compare', this.dimensionsCollapsed[0] / 2, 10, this.dimensionsCollapsed[0]);
            ctx.closePath();
        }

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        this.bubbles.forEach(b => {
            if (this.notDrawing && this.notDrawing.has(b.data.text)) return;
            //ctx.globalCompositeOperation = 'destination-in';
            ctx.beginPath();
            ctx.moveTo(b.x + b.r, b.y);
            ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
            ctx.fillStyle = color(b.data.size);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            // ctx.drawImage(textToImage(b.prettyText), b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
            ctx.drawImage(textToImage(b.prettyText), b.x - b.r, b.y - b.r, b.r*2, b.r*2);
            ctx.fillText(b.prettyText, b.x, b.y);
            ctx.globalCompositeOperation = 'source-over';
            ctx.closePath();
        });
    }
}
