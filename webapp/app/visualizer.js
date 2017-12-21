import * as d3 from 'd3';
import * as _ from 'lodash';
import { bb } from 'billboard.js';

export class Visualizer {
    constructor(selector, animTime = 500) {
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

        let divs = ['timeseries', 'word-usage', 'link-bar', 'bubbles'].map(id => bigBox.append('div').attr('id', id));
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
                enabled: false
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
                enabled: false
            },
            bindto: "#link-bar"
        });

        const h = d3.select(this.selector).select('#bubbles').node().clientHeight;
        const w = d3.select(this.selector).select('#bubbles').node().clientWidth;

        const bubbleData = [{
            value: this.retweets,
            x: w / 2 - h,
            img: serverUrl + 'retweet.svg'
        }, {
            value: this.likes,
            x: w / 2 + h,
            img: serverUrl + 'twit_heart.png'
        }];

        const startSelector = d3.select(this.selector)
            .select('#bubbles')
            .append('svg')
            .attr('height', '100%')
            .attr('width', '100%')
            .selectAll('g')
            .data(bubbleData)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x}, 0)`)

        startSelector.append('image')
            .attr('width', h)
            .attr('height', h)
            .attr('xlink:href', d => d.img)

        startSelector.append('text')
            .attr('y', h / 2)
            .attr('x', h / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(b => b.value);
    }

    hide() {
        d3.select('.stats')
            .remove();

        this.divExists = false;
    }
}
