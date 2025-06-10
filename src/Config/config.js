// config.js

import configProd from './config.prod';
import configTest from './config.test';
import configLocal from './config.local';

let config;

switch (process.env.REACT_APP_ENV) {
  case 'prod':
    config = configProd;
    break;
  case 'test':
    config = configTest;
    break;
  case 'local':
    config = configLocal;
    break;
  default:
    config = configTest;
    break;
}
if (process.env.REACT_APP_ENV === 'prod') {
  process.env.GENERATE_SOURCEMAP = 'false';
}

if (process.env.REACT_APP_ENV === 'test') {
  process.env.GENERATE_SOURCEMAP = 'false';
}

export default config;