import { Visualizer } from './visualizer';

export class SentimentVisualizer extends Visualizer {

    constructor(selector, tweets) {
        super(selector);
        this.tweets = tweets;
    }
}
