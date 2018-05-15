'use strict';

const employees = require('./data/employees');
const { employeesToString } = require('./util/employees-to-string');

// filter: (value, index, array) => bool
const filtered = employees
  .filter(({ id }) => id % 2 === 0);

// map: (value, index, array) => Any
const mapped = employees
  .map((employee) => ({ ...employee, fun: employee.id % 2 === 0 }));

// reduce is the outlier: (accumulator, value, index, array) => Any
const { red, blue } = employees
  .reduce(({ red, blue }, employee) => {
    if (employee.id % 2 === 0) {
      blue.push(employee);
      return { red, blue };
    }

    red.push(employee);
    return { red, blue };
  }, { red: [], blue: [] });

console.log(`filtered:\t(${filtered.length}) ${employeesToString(filtered)}`);
console.log(`mapped:\t\t(${mapped.length}) ${employeesToString(mapped)}`);
console.log(`red:\t\t(${red.length}) ${employeesToString(red)}`);
console.log(`blue:\t\t(${blue.length}) ${employeesToString(blue)}`);
