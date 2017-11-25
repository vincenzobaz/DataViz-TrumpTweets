import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sidebar } from './sidebar';
import { Bubbles } from './bubbles';
import { TopicsManager } from './topics-manager';
import { SentimentsManager } from './sentiments-manager';

class Dashboard {
    constructor(tweets) {
        this.tweets = _.filter(tweets, t => !t['is_retweet']);
        this.displayed = null;
        this.topicsManager = new TopicsManager('#content-pane', tweets);
        this.sentimentsManager = new SentimentsManager('#content-pane', tweets);

        const panes = [{
            text: 'Topics',
            color: ' #FFC300',
            onClick: () => this.display('topics')
        }, {
            text: 'Sentiments',
            color: '#FF5733',
            onClick: () => this.display('sentiments')
        }];
        const sidebarWidth = document.getElementById('sidebar').clientWidth;
        const sidebarHeight = document.getElementById('sidebar').clientHeight;

        const sidebar = new Sidebar('#sidebar', panes, [sidebarWidth, sidebarHeight]);
    }

    display(what) {
        if (what != this.displayed) {
            this.displayed = what;
            if (what == 'topics') {
                this.sentimentsManager.hide();
                this.topicsManager.draw();
            } else if (what == 'sentiments') {
                this.topicsManager.hide();
                this.sentimentsManager.draw();
            }
        }
    }
}


export function dashboard(data) {
    const dashboard = new Dashboard(data)
    // TODO: separate sentiment and topic dataj
}
