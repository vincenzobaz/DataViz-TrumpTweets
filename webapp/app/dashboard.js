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
        const panes = [{
            text: 'Topics',
            color: ' #FFC300',
            onClick: () => this.displayTopics(data)
        }, {
            text: 'Sentiments',
            color: '#FF5733',
            onClick: () => console.log('SENTIMENTS')
        }];
        this.displayed = null;
        const sidebar = new Sidebar('#sidebar', panes, [sidebarWidth, sidebarHeight]);
    }

    displayTopics(topicData) {
        // already displayed => do nothing, otherwise draw.
        if (this.displayed == 'topics') return;
        this.displayed = 'topics'
        const bubbles = topicData.map(tuple => ({
            text: tuple[0],
            size: tuple[1].length,
            callback: () => { }//focusOnTopic(tuple[0], tuple[1], topicBubbleSVG)
        }));
        const bubblePlot = new Bubbles('#content-pane', bubbles, [contentWidth, contentHeight], [contentWidth / 10, contentHeight]);
        bubblePlot.drawFull()
        d3.select('#content-pane')
          .append('div')
          .html('lol')
    }

    displaySentiments(sentimentData) {
        if (this.displayed == 'sentiments') return;
        this.displayed = 'sentiments';
    }
}


export function dashboard(data) {
    const dashboard = new Dashboard(data)
    // TODO: separate sentiment and topic dataj
}
