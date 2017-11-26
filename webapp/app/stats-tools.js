import * as _ from 'lodash';

const stopwords = ['.', ',', '?', '!', '\'', '"', ':', ';', '...', '-', '@',
    'the', 'to', 'is', 'a', 'and', 'in', 'you', 'of', 'i', 'for', 'at', 'on',
    'be', 'amp', 'your', 'my', 'it', 'will', 'our', 'us', 'we', 'cont', 'are',
    'from', 'has', 'that', 'this', 'she', 'her', 'have', 'with', 'he',
    'new', 'just', 'from', 'now', 'as', 'he', 'its', 'by', 'they', 'was',
    'not', 'so', 'more', 'about', 'what', 'all', 'get', 'but', 'one',
    'over', 'their', 'why', 'when', 'what', 'them', 'who', 'said', 'out',
    'would', 'had', 'can', 'should', 'would', 'do', 'been', 'an', 'cont', 'dont',
    '1','2','3','4','5','6','7','8','9', 'http', 'https', 'how', 'ing', 'gre'];

function breakText(text) {
    const noPunct = stopwords.reduce((acc, mark) => acc.replace(mark, ' '), _.lowerCase(text));
    return _.filter(noPunct.split(' '), word => word.length > 2);
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

    return _.sortBy(_.toPairs(res), p => -p[1]);
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
        const d = new Date(year, month, 1, 0, 0, 0, 0);
        return [d/* .toDateString() */, val];
    });
    return _.unzip(cleanStrings);
}
