'use strict';

const employees = require('./data/employees');
const { employeesToString } = require('./util/employees-to-string');

// We can implement filter and map via reduce easily
// Note: I'm using push() here since I'd rather not create a new array on each iteration via concat()

const filtered = employees
  .reduce((accum, employee) => {
    if (employee.id % 2 === 0) {
      accum.push(employee);
    }
    return accum
  }, []);

const mapped = employees
  .reduce((accum, employee) => {
    accum.push({ ...employee, fun: employee.id % 2 === 0 });
    return accum;
  }, []);

console.log(`filtered:\t(${filtered.length}) ${employeesToString(filtered)}`);
console.log(`mapped:\t\t(${mapped.length}) ${employeesToString(mapped)}`);
