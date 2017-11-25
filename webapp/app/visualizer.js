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
/*             .attr('width', '100%')
            .attr('height', '25%')

 */        bb.generate({
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
/*             .attr('width', '40%')
            .attr('height', '25%')

 */        const [words, counts] = _.unzip(this.wordData.slice(0, 50));

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
/*             .attr('width', '40%')
            .attr('height', '25%')

 */        const [linkLabels, linkValues] = _.unzip(this.linkData);
        bb.generate({
            data: {
                columns: [
                    ['Link', ...linkValues]
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


    }

    hide() {
        d3.select('#' + this.selector)
            .select('.stats')
            .remove();
        this.divExists = false;
    }
}