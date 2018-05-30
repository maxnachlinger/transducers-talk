## Transducers

### Let's build up some ideas before we talk about transducers

### filter, map, and reduce
Array filter, map, and reduce have different signatures:
```javascript
// filter: (value, index, array) => bool
const filtered = employees
  .filter(({ salary }) => salary > 100000);

// map: (value, index, array) => Any
const mapped = employees
  .map((employee) => ({ ...employee, over100k: employee.salary > 100000 }));

// reduce is the outlier: (accumulator, value, index, array) => Any
const { under100k, over100k } = employees
  .reduce(({ under100k, over100k }, employee) => {
    if (employee.salary > 100000) {
      over100k.push(employee);
      return { under100k, over100k };
    }

    under100k.push(employee);
    return { under100k, over100k };
  }, { under100k: [], over100k: [] });
```
(As an aside, does anyone ever user the final `array` arg?)

### Making the interfaces identical
We can implement filter and map via reduce:
```javascript
// We can implement filter and map via reduce easily
// Note: I'm using push() here since I'd rather not create a new array on each iteration via concat()

const filtered = employees
  .reduce((accum, employee) => {
    if (employee.salary > 100000) {
      accum.push(employee);
    }
    return accum
  }, []);

const mapped = employees
  .reduce((accum, employee) => {
    accum.push({ ...employee, over100k: employee.salary > 100000 });
    return accum;
  }, []);
```

Now that map and filter have been implemented in terms of reduce we can give them a common 
interface, it looks like this:

`(someFunction) => (accumulatedValue, input) => accumulatedValue`
```javascript
// so with filter and map implemented in terms of reduce, we now have a common interface. Let's
// extract more common things. Here are 2 common functions

const filterer = (filteringFn) => (accumulatedValue, input) => {
  if (filteringFn(input)) {
    accumulatedValue.push(input);
  }
  return accumulatedValue;
};

const mapper = (mappingFn) => (accumulatedValue, input) => {
  accumulatedValue.push(mappingFn(input));
  return accumulatedValue;
};
```
Here's how we can use our new functions:
```javascript
// now let's use them to get the above results
const filtered = employees.reduce(filterer((employee) => employee.salary > 100000), []);
// here's what's happening
// filterer((employee) => ....) returns (accumulatedValue, input) => {}
// (accumulatedValue, input) => {} is the signature for Array.reduce's callback

const mapped = employees.reduce(mapper((employee) => ({
  ...employee,
  over100k: employee.salary > 100000
})), []);
// same thing here:
// mapper((employee) => ....) returns (accumulatedValue, input) => {}
// (accumulatedValue, input) => {} is the signature for Array.reduce's callback
```

Now we have a common interface for filtering and mapping.

### Reducing functions
There's something else common here too, the function we use to fold our mapped or filtered value 
into a provided intialValue. Let's pull that out, here's what it looks like:

```javascript
const reducingFn = (accumulatedValue, input) => {
  accumulatedValue.push(input);
  return accumulatedValue;
};
```
`reducingFn` takes in an initial value and an input, and reduces them to a single value and 
returns it (a pretty fancy way of describing `Array.push`).

A _reducing function_ is a function, well, like you'd pass to `reduce` :) It takes an accumulated 
result and a new input and returns a new accumulated result: 
- `(accumulatedValue, input) => accumulatedValue`

We want our transformations to work independently from the context of their input and output, so they 
can specify only the essence of the transformation. The `Array.push` bit is really a leak of the output
context into our transform.

### Passing in a reducing function
Now let's refactor our `filterer` and `mapper` to accept a reducing function.

```javascript
const filterer = (filteringFn) => (reducingFn) => (accumulatedValue, input) => {
  return filteringFn(input) ? reducingFn(accumulatedValue, input) : accumulatedValue;
};

const mapper = (mappingFn) => (reducingFn) => (accumulatedValue, input) => {
  return reducingFn(accumulatedValue, mappingFn(input));
};
```
We're letting the passed `reducingFn` take care of adding our mapped or filtered value into the 
initial value.

Here's how we can use our new `filterer` and `mapper`:
```javascript
const filtered = employees.reduce(
  filterer((employee) => employee.salary > 100000)(reducerFn),
  []
);

const mapped = employees.reduce(
  mapper((employee) => ({ ...employee, over100k: employee.salary > 100000 }))(reducerFn),
  []
);
```

Our new `filterer` and `mapper` now have the same signature which means we can compose them! 
```javascript
// Note absurd whitespace to show the flow

const transformFn = (reducingFn) => mapper(
  (employee) => ({ ...employee, over100k: employee.salary > 100000 })
)(
  filterer((employee) => employee.salary > 100000)(reducingFn)
);

// using lodash/fp we can make this look nicer

const transformFn2 = _.flow(
  mapper((employee) => ({ ...employee, over100k: employee.salary > 100000 })),
  filterer((employee) => employee.salary > 100000)
);

```

Here's how we can use our new `transformFn`:
```javascript
employees.reduce(transformFn(reducingFn), []);
```

Remember the _reducing function_ ? You know, it takes an accumulated result and a new input and 
returns a new accumulated result: 
- `(accumulatedValue, input) => accumulatedValue`

Let's look at our `filterer` and `mapper` once more:
```javascript
const filterer = (filteringFn) => (reducingFn) => (accumulatedValue, input) => {
  return filteringFn(input) ? reducingFn(accumulatedValue, input) : accumulatedValue;
};

const mapper = (mappingFn) => (reducingFn) => (accumulatedValue, input) => {
  return reducingFn(accumulatedValue, mappingFn(input));
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
