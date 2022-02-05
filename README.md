![banner](./docs/banner.png)

# Introduction

This is a tiny state manager for javascript. This lightweight library (~3KB) can be useful in applications to manage states within a javascript application that require a high level of refreshment.

# Usage

Get MidjetJS by dowloading a release and import in your html:

```html
<script src="[...]/midjetjs.min.js"></script>
```

or directly from [jsDelivr](https://cdn.jsdelivr.net/gh/rsz44/midjetjs/dist/midjetjs.min.js) CDN :

```html
<script src="https://cdn.jsdelivr.net/gh/rsz44/midjetjs/dist/midjetjs.min.js" integrity="sha384-iI7KfPasLvK0wizEZzVKjIMwTZYTl8Uo76KjTP5DGJu6OyYq75txJZiweYf6P7SX"></script> 
```

## Examples

MidjetJS provides a [State](#state-class) class that contains all your supervised variables. Use the [$() method](#statek-dvnull) to access your reactive variables within this state.

```javascript
var state = new State();

state.$('myvar').watch((state, value, old_value) => {
	console.log('Value has updated from ', old_value, ' to ', value);
});

state.$('myvar').watch((s, v, o) => {
	console.log('Other subscriptor.');
});

state.$('myvar').value = 1; // Set value
console.log(state.$('myvar').value); // Get value

state.update(); // Update state

state.$delete('myvar'); // Delete your var and subscriptions.
```

Console output :

```
1
Other subscriptor.
Value has updated from  null  to  1
```

__Example 2, Tiny events subscriptor :__

```javascript
const mysub = (state, sub, payload) => {
	console.log('tiny_event subscriptor 1', payload);
};
	
state.subscribe('tiny_event', mysub); // Subscribe callback
state.subscribe('tiny_event', (state, sub, payload) => {
	console.log('tiny_event subscriptor 2', payload);
});

state.emit('tiny_event', {'foo': 'bar'});
state.update();

state.unsubscribe('tiny_event', mysub); // Unsubscribe callback
```

Console output :

```
tiny_event subscriptor 2 {foo: 'bar'}
tiny_event subscriptor 1 {foo: 'bar'}
```

No more, no less.

--------

# Documentation

__Summary:__

| [State](#state-class) | [ReactiveVar](#reactivevar-class) |
|-|-|
| [$(k, dv=null)](#statek-dvnull) | [watch(cb)](#reactivevarwatchcb) |
| [$delete(k)](#statedeletek) | [unwatch(cb)](#reactivevarunwatchcb) |
| [subscribe(e, cb)](#statesubscribee-cb) |  |
| [unsubscribe(e, cb)](#stateunsubscribee-cb) |  |
| [emit(e, payload)](#stateemite-payload) | |
| [update()](#stateupdate) | |

## State class

__Synopsis:__

The `State` object is a collection of your futures reactive variables. Simply declare a new state via the constructor (no parameters) :

```javascript
var state = new State();
```

### State.$(k, dv=null)

__Synopsis:__

Get a variable stored in actual state, or create a new instance.

__Parameters:__
- `k` <__string__>, the key / variable name
- `dv` <__any__>, the default value of your variable inside the state (default is `null`).

__Return:__

This return a [ReactiveVar](#reactivevar-class) object.

__Example:__

```javascript
state.$('myvalue', 0);

console.log(state.$('myvalue').value); // 0

state.$('myvalue').value = 1;
console.log(state.$('myvalue').value); // 1
```


### State.$delete(k)

__Synopsis:__

Delete a variable stored in actual state and attached callback(s) list.

__Parameters:__
- `k` <__string__>, the key / variable name.

__Return:__ Nothing


### State.subscribe(e, cb)

__Synopsis:__

This function subscribe a callback (`cb`) to an defined event (`e`).

__Parameters:__
- `e` <__string__>: The event name.
- `cb`  <__function(state, sub, old_value)__>: The callback that will be called when the event `e` will be call. The callback is a function and takes `state` (the current state instance), `sub` (the subscription) and `payload` (the payload passed in argument of `.emit` methods) in parameter.

__Return:__ Subscription object (This class is not documented as it is useless outside the built-in)

### State.unsubscribe(e, cb)

__Synopsis:__

This will unsubscribe your callback (`cb`) to the defined event (`e`).

__Parameters:__
- `e` <__string__>: The event name.
- `cb` <__function(state, value, old_value)__>: the instance of the callback that should no longer be called.

### State.emit(e, payload)

__Synopsis:__

Emitting an event (`e`) with a given payload (`payload`).

__Parameters:__
- `e` <__string__>: The event name.
- `payload` <__any__>: The events payload.

__Return:__ Nothing

__Example:__

```javascript
state.subscribe('say_hello', (st, sb, payload) => {
	console.log('Hello ' + payload.name);
});

state.emit('say_hello', {'name': 'Bob'});
state.update(); // Console output: 'Hello Bob'
```


### State.update()

__Synopsis:__

This function __MUST__ be integrated into your application logic to properly update your state. 

On each call, it will call the necessary callbacks depending on the variables that have been changed in your state or the events that have been emitted.

__Return:__ Nothing

__Example:__

```javascript

var state = new State();

// will update your state every second.
const myLogical = setTimeout(() => {
	state.update();
}), 1000);

```

## ReactiveVar class

__Synopsis:__

The `ReactiveVar` object is one of your reactive variable stored in a `State` instance. You can get it directly via your `State` object. It represent one of your variable.

```
state.$('myvar'); // return a ReactiveVar object
```

To get access and modify its value simply use the `.value` propertie.

```javascript
console.log(state.$('myvar').value); // Get the current value
state.$('myvar').value = 1; // Set the value to 1
```

__Properties:__

- `value` : Current value of the variable.
- `hasChange` : has changed in the current state (even is the value is the same).

### ReactiveVar.watch(cb)

__Synopsis:__

Watch a state change.

__Parameters:__
- `cb` <__function(state, value, old_value)__>: The callback that will be called when the value of the variable changes. The callback is a function and takes `state` (the current state instance), `value` (the current value in state) and `old_value` (value of the variable in previous state, previous value) in parameter.

__Return:__ Nothing

### ReactiveVar.unwatch(cb)


__Synopsis:__

Unwatch a state change, remove a callback.

__Parameters:__
- `cb` <__function(state, value, old_value)__>: the instance of the callback that should no longer be called.

__Return:__ Nothing


## Changelog

- `1.0.0`, 05 feb 2022
	+ First Release