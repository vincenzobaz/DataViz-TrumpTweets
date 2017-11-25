import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';
import { Manager } from './manager';
import { SentimentVisualizer } from './sentiment-visualizer';

const contentWidth = document.getElementById('content-pane').clientWidth;
const contentHeight = document.getElementById('content-pane').clientHeight;
const flattenedBubblesWidth = contentWidth / 10;

export class SentimentsManager extends Manager {
    constructor(selector, tweets) {
        super(selector, 'sentiments-content');
        this.tweets = _.filter(tweets, t => _.has(t, 'emotions'));
        this.bubbles = this.createBubbles();
    }

    tweetsDominatedBy(sentiment) {
        return this.tweets.filter(tweet => {
            return _.get(tweet.emotions, sentiment, 0) >= _.max(_.toArray(tweet.emotions))});
    }

    tweetsWith(sentiment) {
        return this.tweets.filter(t => _.has(t.emotions, sentiment));
    }

    createBubbles() {
        const notBinary = feeling => feeling != 'positive' && feeling != 'negative'
        const emotionToScore = _.filter(_.flatMap(this.tweets, tweet => _.toPairs(tweet['emotions'])), tup => notBinary(tup[0]));
        const scores = {}
        for (let tuple of emotionToScore) {
            const [emotion, value] = tuple;
            scores[emotion] = _.get(scores, emotion, 0) + value;
        }
        return _.map(_.toPairs(scores), pair => ({
            text: pair[0],
            size: pair[1],
            callback: () => this.focusOn(pair[0])
        }));
    }

    getVisualizer(sentiment) {
        return new SentimentVisualizer('sentiments-content',
            sentiment,
            this.tweetsDominatedBy(sentiment),
            this.tweetsWith(sentiment)
        );
    }

}
