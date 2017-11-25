import * as d3 from 'd3';
import * as _ from 'lodash';
import { bb } from 'billboard.js';

export class Visualizer {
    constructor(selector) {
        this.selector = selector;
        d3.select('#' + selector)
            .append('div')
            .attr('class', 'stats');
        this.divExists = true;
    }

    draw() {
        if (!this.divExists) {
            d3.select('#' + this.selector)
                .append('div')
                .attr('class', 'stats');
            this.divExists = true;
        }

        d3.select('#' + this.selector)
            .select('.stats')
            .append('div')
            .attr('id', 'timeseries')

        bb.generate({
            data: {
                x: "x",
                columns: [
                    ["x", ...this.timeSeriesData[0]],
                    this.timeSeriesData[1]
                ]
            },
            axis: {
                x: {
                    type: "timeseries",
                    tick: {
                        "format": "%Y-%m"
                    }
                }
            },
            zoom: {
                enabled: true
            },
            subchart: {
                show: true
            },
            bindto: "#timeseries"
        });

        d3.select('#' + this.selector)
            .select('.stats')
            .append('div')
            .attr('id', 'word-usage')
        const [words, counts] = _.unzip(this.wordData.slice(0, 30));

        bb.generate({
            data: {
                columns: [
                    ['Word usage', ...counts]
                ],
                type: "bar"
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            axis: {
                x: {
                    type: "category",
                    categories: words
                }
            },
            zoom: {
                enabled: true
            },
            bindto: "#word-usage"
        });

        d3.select('#' + this.selector)
            .select('.stats')
            .append('div')
            .attr('id', 'link-bar')

        const [linkLabels, linkValues] = this.linkData;
        bb.generate({
            data: {
                columns: [
                    linkValues
                ],
                type: "bar"
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            axis: {
                x: {
                    type: "category",
                    categories: linkLabels
                }
            },
            zoom: {
                enabled: true
            },
            bindto: "#link-bar"
        });

        /* TODO: Implement bubbles, see bubbles.js for an idea
        const bubbleData = [['Retweets', this.retweets], ['Stars', this.likes]];
        const startSelector = d3.select('#' + this.selector)
            .select('.stats')
            .append('div')
            .id('stats-bubbles')
            .append('svg')
            .selectAll('g')
            .data(bubbleData)
            .enter()
            .append('g')
            .attr('transform', )
        */
    }

    hide() {
        d3.select('#' + this.selector)
            .select('.stats')
            .remove();
        this.divExists = false;
    }
}