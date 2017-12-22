import * as d3 from 'd3';
import { Bubbles } from './bubbles';
import { VisualizerStacker } from './visualizer-stacker';


/**
 * Super class managing bubbles and Visualizers.
 */
export class Manager {
    constructor(selector, id) {
        this.focusedOn = null;
        this.selector = selector;
        this.id = id;

        // Create div
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

    /**
     * Callback executed when a bubble is clicked on or when entering multiple bubbles comparison.
     * @param newFocus can be an array (if comparing multiple bubbles) or a string indicating
     *  the bubble being analyzed
     */
    focusOn(newFocus) {
        // Nothing is selected, create viz
        if (Array.isArray(newFocus)) {
            // If arg is array, it is the list of bubbles to compare
            if (newFocus.length > 0) { // List not empty => enter comparison
                if (this.focusedOn) this.visualizer.hide(); // Hide previous visualizer
                // Obain specialized stacked visualizer
                this.visualizer = new VisualizerStacker(newFocus.map(n => this.getVisualizer(n)));
                this.visualizer.draw();
                this.focusedOn = 'multiple';
            } else { // List empty => reset
                this.visualizer && this.visualizer.hide();
                this.visualizer = null;
                this.focusedOn = null;
                this.hide();
                this.draw();
            }
        } else {
            // Otherwise it is a bubble name
            if (this.focusedOn == newFocus) { // Same name as before => reset
                this.visualizer.hide();
                this.visualizer = null;
                this.focusedOn = null;
            } else { // New name => refocus
                if (this.focusedOn) this.visualizer.hide();
                this.visualizer = this.getVisualizer(newFocus);
                this.visualizer.draw();
                this.focusedOn = newFocus;
            }
        }
    }

}
