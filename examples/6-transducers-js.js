'use strict';

const transducers = require('transducers-js');
const employees = require('./data/employees');
const { employeesToString } = require('./util/employees-to-string');

const { map, filter, comp, into } = transducers;

const mapperFn = (employee) => ({ ...employee, fun: employee.id % 2 === 0 });
const filtererFn = (employee) => employee.id % 2 === 0;

const transformFn = comp(map(mapperFn), filter(filtererFn));

const filteredAndMapped = into([], transformFn, employees);

console.log(`filtered and mapped:\t(${filteredAndMapped.length}) ${employeesToString(filteredAndMapped)}`);
