## Transducers

### Let's build up some ideas before we talk about transducers

### filter, map, and reduce
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

### Making the interfaces identical
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

### Reducing functions
There's something else common here too, the function we use to fold our mapped or filtered value 
into a provided intialValue. Let's pull that out, here's what it looks like:

```javascript
const reducingFn = (initialValue, input) => {
  initialValue.push(input);
  return initialValue;
};
```
`reducingFn` takes in an initial value and an input, and reduces them to a single value and 
returns it (a pretty fancy way of describing `Array.push`).

A _reducing function_ is a function, well, like you'd pass to `reduce` :) It takes an accumulated 
result and a new input and returns a new accumulated result: 
- `(accumulated-value, some-value) => accumulated-value`

We want our transformations to work independently from the context of their input and output, so they 
can specify only the essence of the transformation. The `Array.push` bit is really a leak of the output
context into our transform.

### Passing in a reducing function
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
  filterer((employee) => employee.id % 2 === 0)(reducingFn), [] );

employees.reduce(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 }))(reducingFn), [] );
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
const transformFnSheesh= (reducingFn) => mapper(
  (employee) => ({ ...employee, fun: employee.id % 2 === 0 })
)(
  filterer((employee) => employee.id % 2 === 0)(reducingFn)
);

// that hurts to read, we can use one-of-many libraries to help, here's lodash:
const transformFn = _.flow(
  mapper((employee) => ({ ...employee, fun: employee.id % 2 === 0 })),
  filterer((employee) => employee.fun) // we can filter on the prop we added when mapping
);
```

Here's how we can use our new `transformFn`:
```javascript
employees.reduce(transformFn(reducingFn), []);
```

Remember the _reducing function_ ? You know, it takes an accumulated result and a new input and 
returns a new accumulated result: 
- `(accumulated-value, some-value) => accumulated-value`

Let's look at our `filterer` and `mapper` once more:
```javascript
const filterer = (filteringFn) => (reducingFn) => (initialValue, input) => {
  return filteringFn(input) ? reducingFn(initialValue, input) : initialValue;
};

const mapper = (mappingFn) => (reducingFn) => (initialValue, input) => {
  return reducingFn(initialValue, mappingFn(input));
};
```

First you pass in some mapping or filtering logic, then you get back a function that accepts a reducing
function. You pass in that reducing function and it's wrapped in the mapping/filtering logic. This is
a transducer. 

### Transducers
One definition: transforming one reducing function to another.

Here's a better one from [the relevant Clojure doc](https://clojure.org/reference/transducers) 
(edited slightly to be more javascripty)

> Transducers are composable transformations. They are independent from the context of their input 
and output sources and specify only the essence of the transformation in terms of an individual 
element. Because transducers are decoupled from input or output sources, they can be used in many 
different processes - collections, observables, etc. Transducers compose directly, without 
awareness of input or creation of intermediate aggregates.

### Benefits:
1. Collections are only looped through once, take that `[].filter().map()` !
2. We can compose N simple transformations which are easy to reason about and test on their own
