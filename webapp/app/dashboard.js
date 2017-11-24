import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sidebar } from './sidebar';
import { Bubbles } from './bubbles';

const sidebarWidth = document.getElementById('sidebar').clientWidth;
const sidebarHeight = document.getElementById('sidebar').clientHeight;

const contentWidth = document.getElementById('content-pane').clientWidth;
const contentHeight = document.getElementById('content-pane').clientHeight;

export class Dashboard {
    constructor(data) {
        const byTopics = _.groupBy(_.filter(data, tweet => tweet['topic'] != null), tweet => tweet['topic']);
        const panes = [{
            text: 'Topics',
            color: ' #FFC300',
            onClick: () => this.displayTopics(byTopics)
        }, {
            text: 'Sentiments',
            color: '#FF5733',
            onClick: () => this.displaySentiments(data)
        }];
        this.displayed = null;
        const sidebar = new Sidebar('#sidebar', panes, [sidebarWidth, sidebarHeight]);
    }

    displayTopics(topicData) {
        // already displayed => do nothing, otherwise draw.
        if (this.displayed == 'topics') return;
        this.displayed = 'topics'
        d3.select('#content-pane').select('#svg-bubbles').remove()
        const bubbles = _.toPairs(topicData).map(tuple => ({
            text: tuple[0],
            size: tuple[1].length,
        }));
        const bubblePlot = new Bubbles('#content-pane', bubbles, [contentWidth, contentHeight], [contentWidth / 10, contentHeight]);
        bubblePlot.drawFull()
    }

    displaySentiments(tweets) {
        if (this.displayed == 'sentiments') return;
        this.displayed = 'sentiments';
        d3.select('#content-pane').select('#svg-bubbles').remove()
        const emotionToScore = _.filter(_.flatMap(tweets, tweet => _.toPairs(tweet['emotions'])), tup => tup[0] != 'positive' && tup[0] != 'negative');
        const scores = {}
        for (let tuple of emotionToScore) {
            const [emotion, value] = tuple;
            scores[emotion] = _.get(scores, emotion, 0) + value;
        }
        const bubbles = _.map(_.toPairs(scores), pair => ({text: pair[0], size: pair[1]}));
        const bubblePlot = new Bubbles('#content-pane', bubbles, [contentWidth, contentHeight], [contentWidth / 10, contentHeight]);
        bubblePlot.drawFull()
    }
}


export function dashboard(data) {
    const dashboard = new Dashboard(data)
    // TODO: separate sentiment and topic dataj
}
