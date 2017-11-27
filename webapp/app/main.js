import { dashboard } from './dashboard';
import * as d3 from 'd3';

require('./main.scss'); // will build CSS from SASS 3 file

const createDivs = () => {
  const container = d3.select('body')
    .append('div')
    .attr('id', 'container');
  container.append('div')
    .attr('id', 'sidebar');
  container.append('div')
    .attr('id', 'content-pane')
    .append('div')
    .attr('id', 'flattened-bubbles');
};

const start = () => {
  d3.select('#start-button').node().disabled = true;
  d3.select('#intro').append('p').html('Loading data...');
  fetch(dataUrl).then(el => el.json()).then(data => {
    d3.select('#intro').select('p').remove();
    createDivs();
    scrollTo(0, document.getElementById('container').offsetTop);
    dashboard(data);
  });
};

document.getElementById('start-button').addEventListener('click', start);
