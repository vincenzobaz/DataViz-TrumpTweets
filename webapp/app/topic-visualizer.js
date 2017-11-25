import { Visualizer } from './visualizer';

export class TopicVisualizer extends Visualizer {

    constructor(selector, tweets) {
        super(selector);
        this.tweets = tweets;
    }
}
