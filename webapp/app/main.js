import * as _ from 'lodash';
import * as d3 from 'd3';
import * as c3 from 'c3';

import { generateBubblePlot } from './bubbles';

const server_url = 'http://localhost:8000/';

require('./main.scss'); // will build CSS from SASS 3 file

const vizDiv = document.getElementById('viz');
const chartWidth = vizDiv.clientWidth;
const chartHeight = vizDiv.clientHeight;

const bigSVG = d3.select('#viz')
                 .append('svg')
                 .attr('id', 'global-container')
                 .attr('preserveAspectRatio', 'xMinYMin meet')
                 .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
                 .classed('svg-content-responsive', true)

function splitWords(text) {
  return text.split(' ');
}

function focusOnTopic(topicName, tweets, anchor) {
  console.log(_.upperCase(topicName));
  const words = _.flatMap(tweets, tweet => splitWords(tweet.text))
  const sortedCounts = _.sortBy(_.toPairs(_.countBy(words)), tup => -tup[1])
  const [topWords, topCounts] = _.unzip(sortedCounts.slice(0, 50))

  anchor.append('svg')
        .attr('id', 'hists')
  c3.generate({
    bindto: '#hists',
    data: {
      columns: ['counts', ...topCounts],
      axes: {
        counts: 'c'
      },
      types: {
        counts: 'bar'
    },
   }
  })
}

function topicsViz(topics) {
  const topicBubbleSVG = bigSVG.append('svg')
                               .attr('id', 'topic-bubbles-container')
                               .attr('width', '50%')
                               .attr('preserveAspectRatio', 'xMinYMin meet')
                               .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}` )

  const bubbles = topics.map(tuple => ({
    text: tuple[0],
    size: tuple[1].length,
    callback: () => focusOnTopic(tuple[0], tuple[1], topicBubbleSVG)
  }));

  const bubblePlot = generateBubblePlot(topicBubbleSVG, bubbles, [chartWidth, chartHeight]);

}

// Create topic bubble chart
fetch(server_url + 'topics.json')
  .then(el => el.json())
  .then(topicsViz);
