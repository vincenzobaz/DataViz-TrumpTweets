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
        const bubblePlot = new Bubbles('#' + this.id, this.bubbles, [contentWidth, contentHeight], [flattenedBubblesWidth, contentHeight], this.focusOn.bind(this))
        bubblePlot.draw();
    }

    hide() {
        d3.select(this.selector)
            .select('#' + this.id)
            .remove();

        this.divExists = false;
    }

    focusOn(newFocus) {
        // Nothing is selected, create viz
        if (Array.isArray(newFocus)) {
            if (newFocus.length > 0) {
                if (this.focusedOn) this.visualizer.hide();
                this.visualizer = new VisualizerStacker(newFocus.map(n => this.getVisualizer(n)));
                this.visualizer.draw();
                this.focusedOn = 'multiple';
            } else {
                this.visualizer && this.visualizer.hide();
                this.visualizer = null;
                this.focusedOn = null;
                this.hide();
                this.draw();
            }
        } else {
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

}
