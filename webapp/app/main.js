import { dashboard } from './dashboard';

require('./main.scss'); // will build CSS from SASS 3 file

fetch(dataUrl)
  .then(el => el.json())
  .then(dashboard);
