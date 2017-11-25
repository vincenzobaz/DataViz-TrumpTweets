import { Visualizer } from './visualizer';
import * as stats from './stats-tools';

export class SentimentVisualizer extends Visualizer {

    constructor(selector, sentiment, predominantTweets, presentTweets) {
        super(selector);
        
        const topicToValue = {};
        predominantTweets.forEach(tweet => {
            if (tweet.topic) {
                const previousValue = _.get(topicToValue, tweet.topic, 0);
                const increase = _.get(tweet.emotions, sentiment, 0);
                topicToValue[tweet.topic] = previousValue + increase;
            }
        });

        let [labels, values] = stats.createTimeSeries(presentTweets, t => t.emotions[sentiment]);
        this.timeSeriesData = [labels, [`Number of tweets containing emotion ${sentiment}`, ...values]];
        this.linkData = _.sortBy(_.toPairs(topicToValue), p => -p[1]);
        this.likes = stats.getLikeCount(predominantTweets);
        this.retweets = stats.getRetweetCount(predominantTweets);
        this.wordData = stats.getWordUsage(predominantTweets);
    }
}
