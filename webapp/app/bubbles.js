import * as d3 from 'd3';
import * as _ from 'lodash';

export class Bubbles {
    /**
     * 
     * @param anchor 
     * @param bubbles list of {text, size, callback}
     */
    constructor(anchor, bubbles) {
        const layout = d3.pack()
                         .size([1280, 720]) // TODO: parametrize
                         .padding(1.5)

        const hierarchic_bubbles = {children: bubbles};
        const root = d3.hierarchy(hierarchic_bubbles)
                       .sum(bubble => bubble.size)
                       .sort((a, b) => b.size - a.size)
        layout(root);

        const bubbleGroup = anchor.append('g')
                                  .classed('bubbles', true);
        const start = bubbleGroup.selectAll('g')
                                 .data(root.children)
                                 .enter()
                                 .append('g')
                                 .attr('transform', layout_bubble => `translate(${layout_bubble.x}, ${layout_bubble.y})`);

        start.append('circle')
             .attr('fill', 'green')
             .attr('r', layout_bubble => layout_bubble.r)
             .on('click', layout_bubble => layout_bubble.data.callback());

        start.append('text')
             .attr('text-anchor', 'middle')
             .attr('alignment-baseline', 'middle')
             .text(layout_bubble => layout_bubble.data.text);
   }
}   
