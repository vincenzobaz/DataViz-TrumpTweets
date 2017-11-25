import * as d3 from 'd3';

export class Visualizer {
    constructor(selector) {
        this.selector = selector;
        d3.select('#' + selector)
            .append('div')
            .attr('class', 'stats')
        this.divExists = true;
    }

    draw() {
        if (!this.divExists) {
            d3.select('#' + selector)
                .append('div')
                .attr('class', 'stats')
            this.divExists = true;
        }
    }

    hide() {
        d3.select('#' + this.selector)
            .select('.stats')
            .remove()
        this.divExists = false;
    }
}