import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';

const contentWidth = document.getElementById('content-pane').clientWidth;
const contentHeight = document.getElementById('content-pane').clientHeight;
const flattenedBubblesWidth = contentWidth / 10;

export class TopicsManager {
    constructor(selector, tweets) {
        this.tweetsByTopic = _.groupBy(_.filter(tweets, tweet => tweet['topic'] != null), 'topic');
        this.selector = selector;
        d3.select(selector)
          .append('div')
          .attr('id', 'topics-content')
        const bubbles = _.toPairs(this.tweetsByTopic).map(tuple => ({
            text: tuple[0],
            size: tuple[1].length,
        }));
        this.bubblePlot = new Bubbles('#topics-content', bubbles, [contentWidth, contentHeight], [flattenedBubblesWidth, contentHeight]);
    }

    draw() {
        this.bubblePlot.drawFull();
    }

    hide() {
        d3.select(this.selector)
          .select('#topics-content')
          .remove()
    }
}
