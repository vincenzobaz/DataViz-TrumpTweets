import { dashboard } from './dashboard';

const server_url = 'http://localhost:8000/';

require('./main.scss'); // will build CSS from SASS 3 file

fetch(server_url + 'data.json')
  .then(el => el.json())
  .then(dashboard);

