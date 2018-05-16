## Transducers

### Let's build up some ideas before we talk about transducers

Array filter, map, and reduce have different signatures:
```javascript
// filter: (value, index, array) => bool
const filtered = employees
  .filter(({ id }) => id % 2 === 0);

// map: (value, index, array) => Any
employees
  .map((employee) => ({ ...employee, fun: employee.id % 2 === 0 }));

// reduce: (accumulator, value, index, array) => Any
employees
  .reduce(({ red, blue }, employee) => {
    if (employee.id % 2 === 0) {
      blue.push(employee);
      return { red, blue };
    }

    red.push(employee);
    return { red, blue };
  }, { red: [], blue: [] });
```
(As an aside, does anyone ever user the final `array` arg?)

We can implement filter and map via reduce:
```javascript
// Note: I'm using push() here since I'd rather not create a new array on each 
// iteration via concat()

// filter
employees
  .reduce((accum, employee) => {
    if (employee.id % 2 === 0) {
      accum.push(employee);
    }
    return accum
  }, []);

// map
employees
  .reduce((accum, employee) => {
    accum.push({ ...employee, fun: employee.id % 2 === 0 });
    return accum;
  }, []);
```

Now that map and filter have been implemented in terms of reduce we can give them a common 
interface, it looks like this:

`(someFunction) => (initialValue, input) => stuff`
```javascript
const filterer = (filteringFn) => (initialValue, input) => {
  if (filteringFn(input)) {
    initialValue.push(input);
  }
  return initialValue;
};

const mapper = (mappingFn) => (initialValue, input) => {
  initialValue.push(mappingFn(input));
  return initialValue;
};
```
Here's how we can use our new functions:
```javascript
// filter
employees.reduce(filterer((employee) => employee.id % 2 === 0), []);
// here's what's happening
// filterer((employee) => ....) returns (initialValue, input) => {}
// (initialValue, input) => {} is the signature for Array.reduce's callback

// map
employees.reduce(mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 })), []);
// same thing here:
// mapper((employee) => ....) returns (initialValue, input) => {}
// (initialValue, input) => {} is the signature for Array.reduce's callback
```

Now we have a common interface for filtering and mapping.

There's something else common here too, the function we use to fold our mapped or filtered value 
into a provided intialValue. Let's pull that out, here's what it looks like:

```javascript
const reducerFn = (initialValue, input) => {
  initialValue.push(input);
  return initialValue;
};
```
`reducerFn` takes in an initial value and an input, and reduces them to a single value and 
returns it (a pretty fancy way of describing `Array.push`).

Now let's refactor our `filterer` and `mapper` to accept a reducing function.

```javascript
const filterer = (filteringFn) => (reducingFn) => (initialValue, input) => {
  return filteringFn(input) ? reducingFn(initialValue, input) : initialValue;
};

const mapper = (mappingFn) => (reducingFn) => (initialValue, input) => {
  return reducingFn(initialValue, mappingFn(input));
};
```
We're letting the passed `reducingFn` take care of adding our mapped or filtered value into the 
initial value.

Here's how we can use our new `filterer` and `mapper`:
```javascript
employees.reduce(
  filterer((employee) => employee.id % 2 === 0)(reducerFn), [] );

employees.reduce(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 }))(reducerFn), [] );
```

OK here are our new `filterer` and `mapper` again:
```javascript
const filterer = (filteringFn) => (reducingFn) => (initialValue, input) => {
  return filteringFn(input) ? reducingFn(initialValue, input) : initialValue;
};

const mapper = (mappingFn) => (reducingFn) => (initialValue, input) => {
  return reducingFn(initialValue, mappingFn(input));
};
```
They now have the same signature which means we can compose them! 
```javascript
// Note absurd whitespace to highlight the composition
const transformFn = (reducingFn) => mapper(
  (employee) => ({ ...employee, fun: employee.id % 2 === 0 })
)(
  filterer((employee) => employee.id % 2 === 0)(reducingFn)
);

// that hurts to read, we can use one-of-many libraries to help, here's lodash/fp
const transformFn = _.flow(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 })),
  filterer((employee) => employee.fun) // we can filter on the prop we added when mappping
);
```

Here's how we can use our new `transformFn`:
```javascript
employees.reduce(transformFn(reducerFn), []);
```

Now consider this little helper:
```javascript
const transduce = (transformFn, reducingFn, initialValue, input) => {
  return input.reduce(transformFn(reducingFn), initialValue);
};
```

Here's how we might use that with our `transformFn` and our `reducerFn`:
```javascript
transduce(transformFn, reducerFn, [], employees);
```
