import * as d3 from 'd3';
import { select } from 'd3';

export class Sidebar {
    constructor(selector, entries, [width, height]) {
        this.width = width;
        this.height = height;
        this.entries = entries;
        this.selector = selector;

        const buttonHeight = height / entries.length

        const sidebarSelector = d3.select(selector)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('width', width)
            .attr('height', height)
            .selectAll('g')
            .data(entries)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(0, ${i * buttonHeight})`)
            .on('click', d => d.onClick())

        sidebarSelector.append('rect')
            .attr('width', width)
            .attr('height', buttonHeight)
            .style('fill', d => d.color)

        sidebarSelector.append('text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('x', width / 2)
            .attr('y', buttonHeight / 2)
            .text(d => d.text)
    }
}