import * as _ from 'lodash';
import * as stats from './stats-tools';

import { Visualizer } from './visualizer';

export class TopicVisualizer extends Visualizer {

    constructor(selector, tweets) {
        super(selector);

        const emotionCounts = {};
        const emotions = _.map(_.filter(tweets, t => _.has(t, 'emotions')), 'emotions');
        for (let tweetEmotions of emotions) {
            for (let emotion of _.keys(tweetEmotions)) {
                emotionCounts[emotion] = _.get(emotionCounts, emotion, 0) + tweetEmotions[emotion];
            }
        }

        const topic = tweets[0].topic.replace('_', ' ');
        const [dates, values] = stats.createTimeSeries(tweets);
        this.timeSeriesData = [dates, [`Number of tweets containing topic ${topic}`, ...values]];
        this.linkData = _.sortBy(_.toPairs(emotionCounts), p => -p[1]);
        this.likes = stats.getLikeCount(tweets);
        this.retweets = stats.getRetweetCount(tweets);
        this.wordData = stats.getWordUsage(tweets);
    }
}
