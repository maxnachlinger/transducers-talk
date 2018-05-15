'use strict';

const employees = require('./data/employees');

const stats = {
  entires: employees.length,
  filter: 0,
  map: 0
};

// for example only, please don't ever alter data outside a function, that's what we call a
// side-effect!

employees
  .filter(({ id, salary }) => {
    stats.filter++;
    return salary > 150000
  })
  .map((e) => {
    stats.map++;
    e.spiffy = true;
    return e;
  });

console.log(stats);
