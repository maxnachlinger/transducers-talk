'use strict';

const employeesToString = (input) => input.map(({ name, salary }) => `${name} [${salary}]`).join(',');

const printEmployees = (label, employees) => console.log(label, `(${employees.length}) ${employeesToString(employees)}`);

module.exports = {
  printEmployees,
};