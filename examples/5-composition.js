'use strict';

const _ = require('lodash/fp');
const employees = require('./data/employees');
const { printEmployees } = require('./util/print-employees');

// refresher - a reducing function and a mapper and filterer
const reducerFn = (initialValue, input) => {
  initialValue.push(input);
  return initialValue;
};

const filterer = (filteringFn) => (reducingFn) => (initialValue, input) => {
  return filteringFn(input) ? reducingFn(initialValue, input) : initialValue;
};

const mapper = (mappingFn) => (reducingFn) => (initialValue, input) => {
  return reducingFn(initialValue, mappingFn(input));
};

// now notice something - look at the reducerFn signature and the final function returned by
// the filterer and mapper - notice something?
// (initialValue, input) => initialValue

// this means we can compose these functions together - consider this:
// Note absurd whitespace to show the flow

const transformFn = (reducingFn) => mapper(
  (employee) => ({ ...employee, over100k: employee.salary > 100000 })
)(
  filterer((employee) => employee.salary > 100000)(reducingFn)
);

const filteredAndMapped = employees.reduce(transformFn(reducerFn), []);

// using lodash/fp we can make this look nicer

const transformFn2 = _.flow(
  mapper((employee) => ({ ...employee, over100k: employee.salary > 100000 })),
  filterer((employee) => employee.salary > 100000)
);

const filteredAndMapped2 = employees.reduce(transformFn2(reducerFn), []);

printEmployees('filtered and mapped:', filteredAndMapped);
printEmployees('filtered and mapped 2:', filteredAndMapped2);
