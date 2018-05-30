'use strict';

const employees = require('../data/employees');
const { printEmployees } = require('../util/print-employees');

// We can implement filter and map via reduce easily
// Note: I'm using push() here since I'd rather not create a new array on each iteration via concat()

const filtered = employees
  .reduce((accum, employee) => {
    if (employee.salary > 100000) {
      accum.push(employee);
    }
    return accum
  }, []);

const mapped = employees
  .reduce((accum, employee) => {
    accum.push({ ...employee, over100k: employee.salary > 100000 });
    return accum;
  }, []);

printEmployees('filtered:', filtered);
printEmployees('mapped:', mapped);
