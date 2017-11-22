import * as _ from 'lodash';
import * as d3 from 'd3';

import { Bubbles } from './bubbles';

const server_url = 'http://localhost:8000/';

require('./main.scss'); // will build CSS from SASS 3 file

const vizDiv = document.getElementById('viz');
const chartWidth = vizDiv.clientWidth;
const chartHeight = vizDiv.clientHeight;

const svg = d3.select('#viz')
              .append('svg')
              .attr('preserveAspectRatio', 'xMinYMin meet')
              .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
              .classed('svg-content-responsive', true);

// Create topic bubble chart
fetch(server_url + 'topics.json')
  .then(el => el.json())
  .then(data => {
    const bubbles = data.map(tuple => ({text: tuple[0], size: tuple[1].length, callback: () => console.log('Clicked on ' + tuple[0])}));
    const bubblePlot = new Bubbles(svg, bubbles, [1280, 720]);
  })
