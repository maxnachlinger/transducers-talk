'use strict';

const employees = require('../data/employees');
const { printEmployees } = require('../util/print-employees');

// refresher - 2 common mapper and filterer functions
const oldFilterer = (filteringFn) => (accumulatedValue, input) => {
  if (filteringFn(input)) {
    accumulatedValue.push(input);
  }
  return accumulatedValue;
};

const oldMapper = (mappingFn) => (accumulatedValue, input) => {
  accumulatedValue.push(mappingFn(input));
  return accumulatedValue;
};

// refresher - 2 common functions used to get the known results
const oldFiltered = employees.reduce(oldFilterer((employee) => employee.salary > 100000), []);

const oldMapped = employees.reduce(oldMapper((employee) => ({
  ...employee,
  over100k: employee.salary > 100000
})), []);

// now we have a common interface for filtering and mapping

// but there's something else common here too, the function we use to fold our mapped or filtered
// accumulatedValue into the accumulated value. Let's pull that out, here's what it looks like:

const reducerFn = (accumulatedValue, input) => {
  accumulatedValue.push(input);
  return accumulatedValue;
};

// it takes in an initial value and an input, and reduces them to a single value
// Now let's refactor our filterer and mapper to pass in a reducing function

const filterer = (filteringFn) => (reducingFn) => (accumulatedValue, input) => {
  return filteringFn(input) ? reducingFn(accumulatedValue, input) : accumulatedValue;
};

const mapper = (mappingFn) => (reducingFn) => (accumulatedValue, input) => {
  return reducingFn(accumulatedValue, mappingFn(input));
};

const filtered = employees.reduce(
  filterer((employee) => employee.salary > 100000)(reducerFn),
  []
);

const mapped = employees.reduce(
  mapper((employee) => ({ ...employee, over100k: employee.salary > 100000 }))(reducerFn),
  []
);

printEmployees('old filtered:', oldFiltered);
printEmployees('filtered:', filtered);
printEmployees('old mapped:', oldMapped);
printEmployees('mapped:', mapped);
