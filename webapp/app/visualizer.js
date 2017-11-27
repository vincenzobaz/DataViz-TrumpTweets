import * as d3 from 'd3';
import * as _ from 'lodash';
import { bb } from 'billboard.js';
let i = 0;
export class Visualizer {
    constructor(selector, animTime = 500) {
        console.log(selector)
        this.selector = '#' + selector;
        this.animTime = animTime;
        this.createDivs();
        this.divExists = true;

    }

    createDivs() {
        const bigBox = d3.select(this.selector)
            .append('div')
            .attr('class', 'stats')
            .style('opacity', 0);

        let divs = ['timeseries', 'word-usage', 'link-bar'].map(id => bigBox.append('div').attr('id', id))
        divs = [bigBox, ...divs];
        divs.forEach(div => div.transition().style('opacity', 1).delay(this.animTime).duration(this.animTime));
        this.divExists = true;
    }

    draw() {
        if (!this.divExists) {
            this.createDivs();
        }
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
        if (this.divExists) {
            d3.select(this.selector)
                .select('.stats')
                //.transition()
                //.style('opacity', 0) // Crashes :()
                //.duration(0)
                .remove();
            this.divExists = false;
        }
    }
}