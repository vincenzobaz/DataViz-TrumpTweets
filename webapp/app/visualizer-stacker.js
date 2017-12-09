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
            console.log(timeData);
        }

        // Format: [[word/linkword/date, [count1, count2...]]]
        // lista di liste: ogni lista interna contiene la parola come primo elemento e il valore per ogni bubble
        this.wordData = unzipAndFilter(wordData);
        // link data: se sono in topic -> sentimenti del topic
        // sentimenti mi manda -> topic
        this.linkData = unzipAndFilter(linkData);
        // plot sovrapposti per l'usage in time
        this.timeData = unzipAndFilter(timeData);

        // Fare barchart per il momento
        // VEDI LODASH per gestire i dati/sortare ecc.

        // Format: [retweetsTweet]
        this.retweets = visualizers.map(v => v.retweets);
        // Format: [likesTweet]
        this.likes = visualizers.map(v => v.likes);
    }

    draw() {
        if (!this.divExists) {
            this.createDivs();
        }
        console.log(this.timeData);

        const [dates, usage] = _.unzip(this.timeData);

        let usageTopic1 = [];
        let usageTopic2 = [];

        for (let element in usage) {
            if (usage[element][0] != undefined) {
                usageTopic1.push(usage[element][0]);
            }
            else {
                usageTopic1.push(0);
            }

            if (usage[element][1] != undefined) {
                usageTopic2.push(usage[element][1]);
            }
            else {
                usageTopic2.push(0);
            }
        }

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

        let countsTopic1 = [];
        let countsTopic2 = [];

        for (let element in counts) {
            countsTopic1.push(counts[element][0]);
            countsTopic2.push(counts[element][1]);
        }

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
                enabled: true
            },
            bindto: "#word-usage"
        });

        const [linkLabels, linkValues] = _.unzip(this.linkData);

        let linkValuesTopic1 = [];
        let linkValuesTopic2 = [];

        for (let element in linkValues) {
            linkValuesTopic1.push(linkValues[element][0]);
            linkValuesTopic2.push(linkValues[element][1]);
        }

        console.log(linkValuesTopic1);
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
                enabled: true
            },
            bindto: "#link-bar"
        });

        const h = d3.select(this.selector).select('#bubbles').node().clientHeight;
        const w = d3.select(this.selector).select('#bubbles').node().clientWidth;

        console.log(this.retweets);
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