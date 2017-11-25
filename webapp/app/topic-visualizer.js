import * as _ from 'lodash';
import * as stats from './stats-tools';

import { Visualizer } from './visualizer';

export class TopicVisualizer extends Visualizer {

    constructor(selector, tweets) {
        super(selector);
        this.tweets = tweets;

        const emotionCounts = {};
        const emotions = _.map(_.filter(tweets, t => _.has(t, 'emotions')), 'emotions');
        for (let tweetEmotions of emotions) {
            for (let emotion of _.keys(tweetEmotions)) {
                emotionCounts[emotion] = _.get(emotionCounts, emotion, 0) + tweetEmotions[emotion];
            }
        }
        // TODO: build time series
    }
}
