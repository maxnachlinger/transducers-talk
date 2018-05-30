'use strict';

const employees = require('./data/employees');
const { printEmployees } = require('./util/print-employees');

// refresher - filter and map implemented via reduce
const oldFiltered = employees
  .reduce((accum, employee) => {
    if (employee.salary > 100000) {
      accum.push(employee);
    }
    return accum
  }, []);

const oldMapped = employees
  .reduce((accum, employee) => {
    accum.push({ ...employee, over100k: employee.salary > 100000 });
    return accum;
  }, []);

// so with filter and map implemented in terms of reduce, we now have a common interface. Let's
// extract more common things. Here are 2 common functions

const filterer = (filteringFn) => (initialValue, input) => {
  if (filteringFn(input)) {
    initialValue.push(input);
  }
  return initialValue;
};

const mapper = (mappingFn) => (initialValue, input) => {
  initialValue.push(mappingFn(input));
  return initialValue;
};

// now let's use them to get the above results
const filtered = employees.reduce(filterer((employee) => employee.salary > 100000), []);

const mapped = employees.reduce(mapper((employee) => ({
  ...employee,
  over100k: employee.salary > 100000
})), []);

printEmployees('old filtered:', oldFiltered);
printEmployees('filtered:', filtered);
printEmployees('old mapped:', oldMapped);
printEmployees('mapped:', mapped);

// now we have a common interface for filtering and mapping
