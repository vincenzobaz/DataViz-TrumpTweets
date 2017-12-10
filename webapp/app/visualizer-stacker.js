import * as _ from 'lodash';
import { Visualizer } from './visualizer';
import { bb } from 'billboard.js';
import * as d3 from 'd3';


export class VisualizerStacker extends Visualizer {
    constructor(visualizers, animTime = 500) {
        super('multiple', animTime);
        const prepareForMerge = (vis, field) => _.fromPairs(_.zip(vis[field][0], vis[field][1].slice(1)));
        const mergeConcat = (o1, o2) => _.mergeWith(o1, o2, (a, b) => _.flatten([a, b]));
        const unzipAndFilter = ob => _.filter(_.toPairs(ob), tup => tup[1].length == visualizers.length)


        const first = visualizers[0];

        let timeData = prepareForMerge(first, 'timeSeriesData');
        let wordData = _.fromPairs(first.wordData);
        let linkData = prepareForMerge(first, 'linkData');

        for (let v of visualizers.slice(1)) {
            wordData = mergeConcat(wordData, _.fromPairs(v.wordData));
            linkData = mergeConcat(linkData, prepareForMerge(v, 'linkData'));
            timeData = mergeConcat(timeData, prepareForMerge(v, 'timeSeriesData'));
        }

        // Format: [[word/linkword/date, [count1, count2...]]]
        this.wordData = unzipAndFilter(wordData);
        this.linkData = unzipAndFilter(linkData);
        this.timeData = unzipAndFilter(timeData);
        this.timeData.forEach(dateToCounts => dateToCounts[0] = new Date(dateToCounts[0]));

        // Format: [retweetsTweet]
        this.retweets = visualizers.map(v => v.retweets);
        // Format: [likesTweet]
        this.likes = visualizers.map(v => v.likes);
    }

    draw() {
        if (!this.divExists) {
            this.createDivs();
        }

        let [dates, usage] = _.unzip(this.timeData);
        usage = usage.map(counts => counts.map(c => c != undefined ? c : 0));
        const [usageTopic1, usageTopic2] = _.unzip(usage);

        bb.generate({
            data: {
                x: "x",
                columns: [
                    ["x", ...dates],
                    ["topic1", ...usageTopic1],
                    ["topic2", ...usageTopic2]
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

        let sortedWords = _.sortBy(this.wordData, [function(o) { return -o[1][0]; }]);

        const [words, counts] = _.unzip(sortedWords.slice(0, 30));
        const [countsTopic1, countsTopic2] = _.unzip(counts);

        bb.generate({
            data: {
                columns: [
                    //TODO: capire quali sono i topic e SE SONO TOPIC E NON SENTIMENTI. STESSA COSA OVUNQUE PER NOMI COLONNE
                    ['Word usage Topic 1', ...countsTopic1],
                    ['Word usage Topic 2', ...countsTopic2]
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

        const [linkLabels, linkValues] = _.unzip(this.linkData);
        const [linkValuesTopic1, linkValuesTopic2] = _.unzip(linkValues);

        bb.generate({
            data: {
                columns: [
                    ['Topic 1', ...linkValuesTopic1],
                    ['Topic 2', ...linkValuesTopic2]
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
            .attr('transform', d => `translate(${d.x}, 0)`);

        startSelector.append('image')
            .attr('width', h)
            .attr('height', h)
            .attr('xlink:href', d => d.img);

        startSelector.append('text')
            .attr('y', h / 2)
            .attr('x', h / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(b => b.value);
    }

}