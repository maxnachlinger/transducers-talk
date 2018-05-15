'use strict';

const _ = require('lodash/fp');
const employees = require('./data/employees');
const { employeesToString } = require('./util/employees-to-string');

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

const transformFn = mapper(
  (employee) => ({ ...employee, fun: employee.id % 2 === 0 })
)(
  filterer((employee) => employee.id % 2 === 0)(reducerFn)
);

const filteredAndMapped = employees.reduce(transformFn, []);

// using lodash/fp we can make this look nicer
const transformFn2 = _.flow(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 })),
  filterer((employee) => employee.id % 2 === 0)
)(reducerFn);

const filteredAndMapped2 = employees.reduce(transformFn2, []);

console.log(`filtered and mapped:\t(${filteredAndMapped.length}) ${employeesToString(filteredAndMapped)}`);
console.log(`filtered and mapped 2:\t(${filteredAndMapped2.length}) ${employeesToString(filteredAndMapped2)}`);
