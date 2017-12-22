import * as _ from 'lodash';

/**
 * Given the name of the bubble, return the Image object containing
 * the corresponding image
 * @param {string} name the name of the bubble
 */
export const textToImage = name => {
    return getImage(name);
};

// Cache object to avoid refetching the image from server
// at each call.
const cache = {};

const getImage = name => {
    // If in cache, just return
    if (_.has(cache, name)){
        return cache[name];
    }
    // Oterwise, create Image with appropriate url
    const img = new Image();
    img.src = serverUrl + map[name];
    // Store in cache
    cache[name] = img;
    return img;
};


// bubble name -> path of image
const map = {
    'Sadness': 'sentiments/sadness.png',
    'Disgust': 'sentiments/disgust.png',
    'Joy': 'sentiments/joy.png',
    'Anger': 'sentiments/anger.png',
    'Fear': 'sentiments/fear.png',
    'Anticipation': 'sentiments/anticipation.png',
    'Trust': 'sentiments/trust.png',
    'Surprise': 'sentiments/surprise.png',
    'Internal politics': 'topics/internal politics.png',
    'Hillary': 'topics/hillary.png',
    'Obama': 'topics/obama.png',
    'China': 'topics/china.png',
    'Business': 'topics/business.png',
    'Various': 'topics/various.png',
    'Interviews debates': 'topics/interviews.png',
    'Foreign politics': 'topics/foreign politics.png',
    'Shows': 'topics/shows.png'
};