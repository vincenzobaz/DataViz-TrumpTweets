import * as d3 from 'd3';
import { select } from 'd3';

/**
 * Sidebar
 */
export class Sidebar {
    constructor(selector, entries, [width, height]) {
        // Partition vertical space
        const buttonHeight = height / entries.length

        // Create groups
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

        // Append colored rectangle
        sidebarSelector.append('rect')
            .attr('width', width)
            .attr('height', buttonHeight)
            .style('fill', d => d.color)

        // Write inside rectangle
        sidebarSelector.append('text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('x', width / 2)
            .attr('y', buttonHeight / 2)
            .text(d => d.text)
    }
}
