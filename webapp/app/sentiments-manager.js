import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';
import { Manager } from './manager';

const contentWidth = document.getElementById('content-pane').clientWidth;
const contentHeight = document.getElementById('content-pane').clientHeight;
const flattenedBubblesWidth = contentWidth / 10;

export class SentimentsManager extends Manager {
    constructor(selector, tweets) {
        super(selector, 'sentiments-content');
        this.tweets = tweets;
        this.bubbles = this.createBubbles();
    }

    createBubbles() {
        const notBinary = feeling => feeling != 'positive' && feeling != 'negative'
        const emotionToScore = _.filter(_.flatMap(this.tweets, tweet => _.toPairs(tweet['emotions'])), tup => notBinary(tup[0]));
        const scores = {}
        for (let tuple of emotionToScore) {
            const [emotion, value] = tuple;
            scores[emotion] = _.get(scores, emotion, 0) + value;
        }
        return _.map(_.toPairs(scores), pair => ({ text: pair[0], size: pair[1] }));
    }

}
