'use strict';

const employees = require('./data/employees');
const { printEmployees } = require('./util/print-employees');

// filter: (value, index, array) => bool
const filtered = employees
  .filter(({ salary }) => salary > 100000);

// map: (value, index, array) => Any
const mapped = employees
  .map((employee) => ({ ...employee, over100k: employee.salary > 100000 }));

// reduce is the outlier: (accumulator, value, index, array) => Any
const { under100k, over100k } = employees
  .reduce(({ under100k, over100k }, employee) => {
    if (employee.salary > 100000) {
      over100k.push(employee);
      return { under100k, over100k };
    }

    under100k.push(employee);
    return { under100k, over100k };
  }, { under100k: [], over100k: [] });

printEmployees('filtered:', filtered);
printEmployees('mapped:', mapped);
printEmployees('under100k:', under100k);
printEmployees('over100k:', over100k);
