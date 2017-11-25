import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';
import { Manager } from './manager';

export class TopicsManager extends Manager {
    constructor(selector, tweets) {
        super(selector, 'topics-content')
        this.tweetsByTopic = _.groupBy(_.filter(tweets, tweet => tweet['topic'] != null), 'topic');
        this.bubbles = _.toPairs(this.tweetsByTopic).map(tuple => ({
            text: tuple[0],
            size: tuple[1].length,
            callback: () => super.focusOn(tuple[0])
        }));

    }

    focusOn(topic) {
        // Nothing is selected, create viz
        if (!this.focusedOn) {
            // create visualizer
            return;
        }

        if (this.focusedOn == topic) return;

        if (this.focusedOn != topic) {
            // delete other visualization and create new one
            return
        }
    }
}
