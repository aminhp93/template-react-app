import base from './base';
import staging from './staging';
import production from './production';

console.log(process.env);

let config = {};

if (process.env.ENV === 'production') {
  config = production;
} else if (process.env.ENV === 'staging') {
  config = staging;
} else {
  config = base
}

export default config;
