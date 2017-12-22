import * as _ from 'lodash';
import * as d3 from 'd3';

import { Sidebar } from './sidebar';
import { Bubbles } from './bubbles';
import { TopicsManager } from './topics-manager';
import { SentimentsManager } from './sentiments-manager';

/**
 * Entrypoint of the application, receives data and handles sidebar and maanagers
 */
class Dashboard {
    constructor(tweets) {
        this.tweets = _.filter(tweets, t => !t['is_retweet']);
        this.displayed = null;
        // Create both manager, sidebar will decide which one is shown
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

        // Create sidebar
        const sidebar = new Sidebar('#sidebar', panes, [sidebarWidth, sidebarHeight]);
    }

    /**
     * Callback called upon click on a sidebar element.
     * @param {string} sidebarElement name of the element clicked
     */
    display(sidebarElement) {
        if (sidebarElement != this.displayed) { // If clicked is different from previously selected
            this.displayed = sidebarElement;
            // Instantiate appropriate manager.
            if (sidebarElement == 'topics') {
                this.sentimentsManager.hide();
                this.topicsManager.draw();
            } else if (sidebarElement == 'sentiments') {
                this.topicsManager.hide();
                this.sentimentsManager.draw();
            }
        }
    }
}


export function dashboard(data) {
    const dashboard = new Dashboard(data)
}
