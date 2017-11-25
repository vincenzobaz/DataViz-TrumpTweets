import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';
import { Manager } from './manager';
import { TopicVisualizer } from './topic-visualizer';

export class TopicsManager extends Manager {
    constructor(selector, tweets) {
        super(selector, 'topics-content')
        this.tweetsByTopic = _.groupBy(_.filter(tweets, tweet => tweet['topic'] != null), 'topic');
        this.bubbles = _.toPairs(this.tweetsByTopic).map(tuple => ({
            text: tuple[0],
            size: tuple[1].length,
            callback: () => this.focusOn(tuple[0])
        }));
    }

    getVisualizer(topic) {
        return new TopicVisualizer('topics-content', this.tweetsByTopic[topic])
    }

}
