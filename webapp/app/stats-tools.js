import * as _ from 'lodash';

const punctuation = ['.', ',', '?', '!', '\'', '"', ':', ';', '...', '-', '@']

function breakText(text) {
    const noPunct = punctuation.reduce((acc, mark) => acc.replace(mark, ' '), _.lowerCase(text));
    return noPunct.split(' ');
}

export function getRetweetCount(tweets) {
    return _.sumBy(tweets, 'retweet_count');
}

export function getLikeCount(tweets) {
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

export function createTimeSeries(tweets, getCoefficient = t => 1) {
    const monthYearVal = _.map(tweets, tweet => {
        const date = new Date(tweet['created_at']);
        return {
            yearMonth: date.getFullYear() + ' ' + date.getMonth(),
            value: getCoefficient(tweet)
        }
    });

    const yearMonthSum = {};
    for (let tup of monthYearVal) {
        yearMonthSum[tup.yearMonth] = _.get(yearMonthSum, tup.yearMonth, 0) + tup.value;
    }

    const cleanStrings = _.map(_.toPairs(yearMonthSum), yearMonthVal => {
        const [yearMonth, val] = yearMonthVal;
        const [year, month] = yearMonth.split(' ');
        const d = Date(year, month, 1, 0, 0, 0, 0);
        return [d, val];
    });
    return _.unzip(cleanStrings);
}
