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

    }
}
