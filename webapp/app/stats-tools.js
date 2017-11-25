import * as _ from 'lodash';

const punctuation = ['.', ',', '?', '!', '\'', '"', ':', ';', '...', '-', '@']

function breakText(text) {
    const noPunct = punctuation.reduce((acc, mark) => acc.replace(mark, ' '), _.lowerCase(text));
    return noPunct.split(' ');
}

export function getRetweetCounts(tweets) {
    return _.sumBy(tweets, 'retweet_count');
}

export function getLikeCounts(tweets) {
    return _.sumBy(tweets, 'favorite_count');
}

export function getWordUsage(tweets, getCoefficient = t => 1) {
    const wordToCoef = _.flatMap(tweets, tweet => _.map(breakText(tweet.text), w => [w, getCoefficient(tweet)]));
    const res = {};

    for (let tup of wordToCoef) {
        const [word, coef] = tup;
        res[word] = _.get(res, word, 0) + coef;
    }

    return res;
}
