'use strict';

const employeesToString = (input) => input.map(({ id, name }) => `(${id}) ${name}`).join(',');

module.exports = { employeesToString };
