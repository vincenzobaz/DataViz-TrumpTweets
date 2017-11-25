import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';

const contentWidth = document.getElementById('content-pane').clientWidth;
const contentHeight = document.getElementById('content-pane').clientHeight;
const flattenedBubblesWidth = contentWidth / 10;

export class SentimentsManager {
    constructor(selector, tweets) {
        this.tweets = tweets;
        this.createBubbles()
        d3.select(selector)
            .append('div')
            .attr('id', 'sentiments-content')
        this.createBubbles()
    }

    createBubbles() {
        const notBinary = feeling => feeling != 'positive' && feeling != 'negative'
        const emotionToScore = _.filter(_.flatMap(this.tweets, tweet => _.toPairs(tweet['emotions'])), tup => notBinary(tup[0]));
        const scores = {}
        for (let tuple of emotionToScore) {
            const [emotion, value] = tuple;
            scores[emotion] = _.get(scores, emotion, 0) + value;
        }
        const bubbles = _.map(_.toPairs(scores), pair => ({ text: pair[0], size: pair[1] }));
        this.bubblePlot = new Bubbles('#sentiments-content', bubbles, [contentWidth, contentHeight], [contentWidth / 10, contentHeight]);
    }

    draw() {
        this.bubblePlot.drawFull();
    }

    hide() {
        d3.select(this.selector)
            .select('#sentiments-content')
            .remove()

    }
}
