'use strict';

const transducers = require('transducers-js');
const employees = require('../data/employees');
const { printEmployees } = require('../util/print-employees');

const { map, filter, comp, into } = transducers;

const mapperFn = (employee) => ({ ...employee, over100k: employee.salary > 100000 });
const filtererFn = (employee) => employee.salary > 100000;

const transformFn = comp(map(mapperFn), filter(filtererFn));

const filteredAndMapped = into([], transformFn, employees);

printEmployees('filtered and mapped:', filteredAndMapped);
