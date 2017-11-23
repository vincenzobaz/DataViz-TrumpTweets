import * as d3 from 'd3';
import * as _ from 'lodash';

class Bubbles {
    constructor(anchor, bubbles, dimensions, animTime = 1000) {
        this.anchor = anchor;
        const layout = d3.pack()
                         .size(dimensions)
                         .padding(5);

        const root = d3.hierarchy({ children: bubbles })
                       .sum(bubble => bubble.size)
                       .sort((a, b) => b.size - a.size);

        layout(root);
        this.bubbles = root.children;
        this.selectedBubble = null;
        this.dimensions = dimensions;
        this.animTime = animTime;

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const bubbleGroup = this.anchor.append('g')
                                       .classed('bubbles', true);
        const start = bubbleGroup.selectAll('g')
                                 .data(this.bubbles)
                                 .enter()
                                 .append('g')
                                 .attr('transform', layout_bubble => `translate(${layout_bubble.x}, ${layout_bubble.y})`);

        start.append('circle')
             .attr('fill', b => color(b.data.size))
             .attr('r', b => b.r)
             .on('click', this.callback.bind(this));

        start.append('text')
             .attr('text-anchor', 'middle')
             .attr('alignment-baseline', 'middle')
             .text(b => _.capitalize(b.data.text.replace('_', ' ')));
    }

    callback(layout_bubble) {
        if (!this.selectedBubble) {
            this.flattenBubbles();
            this.selectedBubble = layout_bubble.data.text;
            layout_bubble.data.callback();
        } else {
            if (layout_bubble.data.text === this.selectedBubble) {
                this.selectedBubble = null;
                this.spreadBubbles();
            } else {
                this.selectedBubble = layout_bubble.data.text;
            }
        }
    }

    spreadBubbles() {
        this.anchor.select('.bubbles')
            .selectAll('g')
            .transition()
            .attr('transform', layout_bubble => `translate(${layout_bubble.x}, ${layout_bubble.y})`)
            .selectAll('circle')
            .attr('r', b => b.r)
            .duration(this.animTime);
        return this;
    }

    flattenBubbles() {
        const padding = 10;
        const padCount = this.bubbles.length - 1;
        const totLength = this.bubbles.reduce((acc, n) => acc + n.data.size, 0); + padding * padCount;
        const scale = len => (this.dimensions[0] * len) / totLength;
        const newSizes = this.bubbles.map(b => scale(b.data.size)); //[new_size]
        for (let i = 1; i < newSizes.length; ++i) {
            newSizes[i] += newSizes[i - 1];
        }

        const startToEnd = _.zip([0, ...newSizes.slice(0, -1)], newSizes);
        const nameToPos = _.fromPairs(_.zip(this.bubbles.map(b => b.data.text), startToEnd));
        const y = _.max(startToEnd.map(t => (t[1] - t[0]) / 2));

        const translate = (node, index) => {
            const [start, end] = nameToPos[node.data.text];
            let x = start + (end - start) / 2;
            x = index > 0 ? x + padding : x;
            return `translate(${x}, ${y})`;
        };

        this.anchor.select('.bubbles')
                   .selectAll('g')
                   .transition()
                   .attr('transform', (n, i) => translate(n, i))
                   .selectAll('circle')
                   .attr('r', n => {
                       const [start, end] = nameToPos[n.data.text];
                       return (end - start) / 2
                   })
                   .duration(this.animTime);
        return this;
    }
}   

export function generateBubblePlot(anchor, bubbles, dimensions, animTime = 1000) {
    const bubble = new Bubbles(anchor, bubbles, dimensions, animTime = 1000);
    return anchor.select('.bubbles')
}