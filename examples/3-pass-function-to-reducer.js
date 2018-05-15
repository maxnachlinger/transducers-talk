'use strict';

const employees = require('./data/employees');
const { employeesToString } = require('./util/employees-to-string');

// refresher - filter and map implemented via reduce
const oldFiltered = employees
  .reduce((accum, employee) => {
    if (employee.id % 2 === 0) {
      accum.push(employee);
    }
    return accum
  }, []);

const oldMapped = employees
  .reduce((accum, employee) => {
    accum.push({ ...employee, fun: employee.id % 2 === 0 });
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
const filtered = employees.reduce(filterer((employee) => employee.id % 2 === 0), []);

const mapped = employees.reduce(mapper((employee) => ({
  ...employee,
  fun: employee.id % 2 === 0
})), []);

console.log(`old filtered:\t(${oldFiltered.length}) ${employeesToString(oldFiltered)}`);
console.log(`filtered:\t\t(${filtered.length}) ${employeesToString(filtered)}`);
console.log(`old mapped:\t\t(${oldMapped.length}) ${employeesToString(oldMapped)}`);
console.log(`mapped:\t\t\t(${mapped.length}) ${employeesToString(mapped)}`);

// now we have a common interface for filtering and mapping
