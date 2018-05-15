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

// we then composed the filterer and reducer to show, well, that we could :) Composition is a great
// way to reuse things

// using lodash/fp we can make this look nicer
const transformFn = _.flow(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 })),
  filterer((employee) => employee.id % 2 === 0)
);

const oldFilteredAndMapped = employees.reduce(transformFn(reducerFn), []);

// neat, now consider this helper

const transduce = (transformFn, reducingFn, initialValue, input) => {
  return input.reduce(transformFn(reducingFn), initialValue);
};

const filteredAndMapped = transduce(transformFn, reducerFn, [], employees);

console.log(`old filtered and mapped:\t(${oldFilteredAndMapped.length}) ${employeesToString(oldFilteredAndMapped)}`);
console.log(`filtered and mapped:\t\t(${filteredAndMapped.length}) ${employeesToString(filteredAndMapped)}`);
