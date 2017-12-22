import * as _ from 'lodash';

const stopwords = ["the", "to", "is", "a", "and", "in", "you", "of", "i", "for", "at", "on",
    "be", "amp", "your", "my", "it", "will", "our", "us", "we", "cont", "are",
    "from", "has", "that", "this", "she", "her", "have", "with", "he",
    "new", "just", "from", "now", "as", "he", "its", "by", "they", "was",
    "not", "so", "more", "about", "what", "all", "get", "but", "one",
    "over", "their", "why", "when", "what", "them", "who", "said", "out",
    "would", "had", "can", "should", "would", "do", "been", "an", "cont", "dont",
    "1","2","3","4","5","6","7","8","9", "http", "https", "how", "ing", "gre", "ald", "nks",
    "you", "much"];

/**
 * Clean text from stopwords and punctuation
 * @param {string} text 
 */
function breakText(text) {
    const noPunct = stopwords.reduce((acc, mark) => acc.replace(mark, ' '), _.lowerCase(text));
    return _.filter(noPunct.split(' '), word => word.length > 2);
}

/**
 * Computes the average number of retweets.
 * @param tweets array of tweets 
 */
export function getRetweetCount(tweets) {
    return Math.round(_.sumBy(tweets, 'retweet_count')/tweets.length);
}

/**
 * Computes the average number of star/hearts.
 * @param tweets array of tweets 
 */
export function getLikeCount(tweets) {
    return Math.round(_.sumBy(tweets, 'favorite_count')/tweets.length);
}

/**
 * Counts the usage of each word in the text of the provided tweets
 * @param tweets list of tweets.
 * @param getCoefficient function used to obtain the weight of the tweet given the tweet
 */
export function getWordUsage(tweets, getCoefficient = t => 1) {
    const wordToCoef = _.flatMap(tweets, tweet => _.map(breakText(tweet.text), w => [w, getCoefficient(tweet)]));
    const res = {};

    for (let tup of wordToCoef) {
        const [word, coef] = tup;
        res[word] = _.get(res, word, 0) + coef;
    }

    return _.sortBy(_.toPairs(res), p => -p[1]);
}

/**
 * Groups the value returned by getCoefficient for each tweet 
 * by month and year to create a timeseries
 */
export function createTimeSeries(tweets, getCoefficient = t => 1) {
    // Map value to year-month
    const monthYearVal = _.map(tweets, tweet => {
        const date = new Date(tweet['created_at']);
        return {
            yearMonth: date.getFullYear() + ' ' + date.getMonth(),
            value: getCoefficient(tweet)
        }
    });

    // Sum the values to have a single entry for each year-month
    const yearMonthSum = {};
    for (let tup of monthYearVal) {
        yearMonthSum[tup.yearMonth] = _.get(yearMonthSum, tup.yearMonth, 0) + tup.value;
    }

    // Reformat data
    const cleanStrings = _.map(_.toPairs(yearMonthSum), yearMonthVal => {
        const [yearMonth, val] = yearMonthVal;
        const [year, month] = yearMonth.split(' ');
        const d = new Date(year, month, 1, 0, 0, 0, 0);
        return [d, val];
    });
    return _.unzip(cleanStrings);
}
