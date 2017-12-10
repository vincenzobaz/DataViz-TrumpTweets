import * as d3 from 'd3';
import { Bubbles } from './bubbles';
import { VisualizerStacker } from './visualizer-stacker';


export class Manager {
    constructor(selector, id) {
        this.focusedOn = null;
        this.selector = selector;
        this.id = id;

        d3.select(selector)
            .append('div')
            .attr('id', id)

        this.divExists = true;
    }

    draw() {
        const contentWidth = document.getElementById('content-pane').clientWidth;
        const contentHeight = document.getElementById('content-pane').clientHeight;
        const flattenedBubblesWidth = document.getElementById('flattened-bubbles').clientWidth;
        if (!this.divExists) {
            d3.select(this.selector)
                .append('div')
                .attr('id', this.id);
        }
        const bubblePlot = new Bubbles('#' + this.id, this.bubbles, [contentWidth, contentHeight], [flattenedBubblesWidth, contentHeight], this.compareMultiple.bind(this))
        bubblePlot.draw();
    }

    compareMultiple(names) {
        if (this.comparingMultiple) {
            this.visualizer.hide();
            this.comparingMultiple = false;
        } else {
            const visualizers = names.map(n => this.getVisualizer(n));
            this.visualizer = new VisualizerStacker(visualizers);
            this.focusedOn = 'multiple';
            this.visualizer.draw();
            this.compareMultiple = true;
        }
    }

    hide() {
        d3.select(this.selector)
            .select('#' + this.id)
            .remove();

        this.divExists = false;
    }

    focusOn(newFocus) {
        // Nothing is selected, create viz
        if (this.focusedOn == newFocus) {
            this.visualizer.hide();
            this.visualizer = null;
            this.focusedOn = null;
        } else {
            if (this.focusedOn) this.visualizer.hide();
            this.visualizer = this.getVisualizer(newFocus);
            this.visualizer.draw();
            this.focusedOn = newFocus;
        }
    }

}
