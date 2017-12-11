import * as _ from 'lodash';

export const textToImage = name => {
    return getImage(name);
};

const cache = {};

const getImage = name => {
    /*
    if (_.has(cache, name)){
        return cache[name];
    } */
    const img = new Image();
    img.src = serverUrl + '/' + map[name];
    cache[name] = img;
    return img;
};


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
    'Hillary': 'topics/Hllary.png',
    'Obama': 'topics/obama.png',
    'China': 'topics/china.png',
    'Business': 'topics/business.png',
    'Various': 'topics/various.png',
    'Interview debates': 'topics/various.png',
    'Foreign politics': 'topics/foreign politics.png',
    'Shows': 'topics/shows.png'
};