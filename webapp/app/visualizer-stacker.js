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
        this.names = visualizers.map(v => _.capitalize(v.name));
    }

    draw() {
        if (!this.divExists) {
            this.createDivs();
        }

        let [dates, usage] = _.unzip(this.timeData);
        usage = usage.map(counts => counts.map(c => c != undefined ? c : 0));

        let usageColumns = [];

        for (let index in usage[0]) {
            usageColumns.push(['Usage of ' + this.names[index]])
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
        let wordUsageColumns = [];

        for (let index in counts[0]) {
            wordUsageColumns.push(['Word usage of ' + this.names[index]])
        }

        for (let index in counts) {
            for (let index2 in counts[index]) {
                wordUsageColumns[index2].push(counts[index][index2])
            }
        }


        bb.generate({
            data: {
                columns: [
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
                }
            },

            bindto: "#word-usage"
        });

        const [linkLabels, linkValues] = _.unzip(this.linkData);

        let linkValuesColumns = [];

        for (let index in linkValues[0]) {
            linkValuesColumns.push(['Emotions levels of ' + this.names[index]])
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
            retAndFavColumns.push([this.names[index]]);
            groups.push(this.names[index])
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
    }
}
