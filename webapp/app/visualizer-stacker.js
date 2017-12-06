import * as _ from 'lodash';

export class VisualizerStacker {
    constructor(visualizers) {
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
            timeData = mergeConcat(timeData, prepareForMerge(v, 'timeSeriesData'))
        }

        // Format: [[word/linkword/date, [count1, count2...]]]
        wordData = unzipAndFilter(wordData);
        linkData = unzipAndFilter(linkData);
        timeData = unzipAndFilter(timeData);
        // Format: [retweetsTweet]
        let retweets = visualizers.map(v => v.retweets);
        // Format: [likesTweet]
        let likes = visualizers.map(v => v.likes);


    }

}