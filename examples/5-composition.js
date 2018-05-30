'use strict';

const _ = require('lodash/fp');
const employees = require('../data/employees');
const { printEmployees } = require('../util/print-employees');

// refresher - a reducing function and a mapper and filterer
const reducerFn = (accumulatedValue, input) => {
  accumulatedValue.push(input);
  return accumulatedValue;
};

const filterer = (filteringFn) => (reducingFn) => (accumulatedValue, input) => {
  return filteringFn(input) ? reducingFn(accumulatedValue, input) : accumulatedValue;
};

const mapper = (mappingFn) => (reducingFn) => (accumulatedValue, input) => {
  return reducingFn(accumulatedValue, mappingFn(input));
};

// now notice something - look at the reducerFn signature and the final function returned by
// the filterer and mapper - notice something?
// (accumulatedValue, input) => accumulatedValue

// this means we can compose these functions together - consider this:
// Note absurd whitespace to show the flow

const transformFnSheesh = (reducingFn) => mapper(
  (employee) => ({ ...employee, over100k: employee.salary > 100000 })
)(
  filterer((employee) => employee.salary > 100000)(reducingFn)
); // (reducingFn) => (accumulatedValue, input) => ...

const filteredAndMapped = employees.reduce(transformFnSheesh(reducerFn), []);

// using lodash/fp we can make this look nicer

const transformFn = _.flow(
  mapper((employee) => ({ ...employee, over100k: employee.salary > 100000 })),
  filterer((employee) => employee.salary > 100000)
); // (reducingFn) => (accumulatedValue, input) => ...

const filteredAndMapped2 = employees.reduce(transformFn(reducerFn), []);

printEmployees('filtered and mapped:', filteredAndMapped);
printEmployees('filtered and mapped 2:', filteredAndMapped2);
