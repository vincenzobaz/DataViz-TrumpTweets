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

        let usageColumns = [];

        for (let index in usage[0]) {
            usageColumns.push(['Usage Topic ' + index.toString()])
        }

        for (let index in usage) {

            for (let index2 in usage[index]) {
                usageColumns[index2].push(usage[index][index2])
            }
        }
        bb.generate({
            data: {
                x: "x",
                columns: [
                    ["x", ...dates],
                    ...usageColumns
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
        // const [countsTopic1, countsTopic2] = _.unzip(counts);

        let wordUsageColumns = [];

        for (let index in counts[0]) {
            wordUsageColumns.push(['Word usage Topic ' + index.toString()])
        }

        for (let index in counts) {

            for (let index2 in counts[index]) {
                wordUsageColumns[index2].push(counts[index][index2])
            }
        }


        bb.generate({
            data: {
                columns: [
                    //TODO: capire quali sono i topic e SE SONO TOPIC E NON SENTIMENTI. STESSA COSA OVUNQUE PER NOMI COLONNE
                    /*['Word usage Topic 1', ...countsTopic1],
                    ['Word usage Topic 2', ...countsTopic2]*/
                    ...wordUsageColumns
                ],
                type: "bar"
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            subchart: {
                show: false
            },

            axis: {
                x: {
                    type: "category",
                    categories: words,
                    //TODO: it doesn't work, <rect> attributes all NaNs
                    // extent: [words[1], words[5]]
                    // extent: [1, 5]
                }
            },

            bindto: "#word-usage"
        });

        const [linkLabels, linkValues] = _.unzip(this.linkData);
        // const [linkValuesTopic1, linkValuesTopic2] = _.unzip(linkValues);

        let linkValuesColumns = [];

        for (let index in linkValues[0]) {
            linkValuesColumns.push(['Word usage Topic ' + index.toString()])
        }

        for (let index in linkValues) {

            for (let index2 in linkValues[index]) {
                linkValuesColumns[index2].push(linkValues[index][index2])
            }
        }

        bb.generate({
            data: {
                columns: [
                    ...linkValuesColumns
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



        let retAndFavColumns =[];
        let groups = [];
        for (let index in this.retweets) {
            retAndFavColumns.push(['Topic ' + index.toString()]);
            groups.push('Topic ' + index.toString())
        }


        for (let index in this.retweets) {
            retAndFavColumns[index].push(this.retweets[index]);
            retAndFavColumns[index].push(this.likes[index]);
        }

        bb.generate({
            data: {
                columns: [
                    ...retAndFavColumns,
                ],
                type: "bar",
                groups: [
                    [
                        ...groups

                    ]
                ]
            },
            grid: {
                y: {
                    lines: [
                        {
                            value: 0
                        }
                    ]
                }
            },
            axis: {
                rotated: true,
                x: {
                    type: "category",
                    categories: ['Retweets', "Favorite"]
                }
            },
            bindto: "#bubbles"
        });

        /*//TODO: this or super .selector?
        const h = d3.select(super.selector).select('#bubbles').node().clientHeight;
        const w = d3.select(super.selector).select('#bubbles').node().clientWidth;

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
            */
    }

}