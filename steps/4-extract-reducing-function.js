'use strict';

const employees = require('./data/employees');
const { employeesToString } = require('./util/employees-to-string');

// refresher - 2 common mapper and filterer functions
const oldFilterer = (filteringFn) => (initialValue, input) => {
  if (filteringFn(input)) {
    initialValue.push(input);
  }
  return initialValue;
};

const oldMapper = (mappingFn) => (initialValue, input) => {
  initialValue.push(mappingFn(input));
  return initialValue;
};

// refresher - 2 common functions used to get the known results
const oldFiltered = employees.reduce(oldFilterer((employee) => employee.id % 2 === 0), []);

const oldMapped = employees.reduce(oldMapper((employee) => ({
  ...employee,
  fun: employee.id % 2 === 0
})), []);

// now we have a common interface for filtering and mapping

// but there's something else common here too, the function we use to fold our mapped or filtered
// initialValue into the accumulated value. Let's pull that out, here's what it looks like:

const reducerFn = (initialValue, input) => {
  initialValue.push(input);
  return initialValue;
};

// it takes in an initial value and an input, and reduces them to a single value
// Now let's refactor our filterer and mapper to pass in a reducing function

const filterer = (filteringFn) => (reducingFn) => (initialValue, input) => {
  return filteringFn(input) ? reducingFn(initialValue, input) : initialValue;
};

const mapper = (mappingFn) => (reducingFn) => (initialValue, input) => {
  return reducingFn(initialValue, mappingFn(input));
};

const filtered = employees.reduce(
  filterer((employee) => employee.id % 2 === 0)(reducerFn),
  []
);

const mapped = employees.reduce(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 }))(reducerFn),
  []
);

console.log(`old filtered:\t(${oldFiltered.length}) ${employeesToString(oldFiltered)}`);
console.log(`filtered:\t\t(${filtered.length}) ${employeesToString(filtered)}`);
console.log(`old mapped:\t\t(${oldMapped.length}) ${employeesToString(oldMapped)}`);
console.log(`mapped:\t\t\t(${mapped.length}) ${employeesToString(mapped)}`);