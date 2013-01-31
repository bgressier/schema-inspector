# Schema-Inspector

Schema-Inspector is powerful tools to validation or sanitize javascript object.
It is disigned to work both client-side and server-side. Although originally
designed for use with [node.js](http://nodejs.org), it can also be used directly
in the browser.

Schema-Inspector has to be very scalable, and allow asynchronous and synchronous
calls.

## Quick Examples

```javascript
	var si = require('schema-inspector');

	var schema = {
		type: 'object',
		properties: {
			lorem: { type: 'string', eq: 'ipsum' },
			dolor: {
				type: 'array',
				items: { type: 'number' }
			}
		}
	};

	var candidate = {
		lorem: 'not_ipsum',
		dolor: [ 12, 34, 'ERROR', 45, 'INVALID' ]
	};
	var result = SchemaInspector.validate(schema, candidate); // Candidate is not valid
	console.log(result.format());
	/*
		Property @.lorem: must be equal to "ipsum", but is equal to "not_ipsum"
		Property @.dolor[2]: must be number, but is string
		Property @.dolor[4]: must be number, but is string
	*/
```

## In the browser

TODO

## Documentation

### Validation

* [optional](#optional)
* [type](#type)
* [pattern](#pattern)
* [minLength](#minLength)
* [maxLength](#maxLength)
* [exactLength](#exactLength)
* [lt](#lt)
* [lte](#lte)
* [gt](#gt)
* [gte](#gte)
* [eq](#eq)
* [ne](#ne)
* [someKeys](#someKeys)
* [strict](#strict)
* [exec](#exec)
* [properties](#properties)
* [items](#items)

### Sanitization

* [optional](#optional)
* [type](#type)
* [rules](#rules)
* [min](#min)
* [max](#max)
* [minLength](#minLength)
* [maxLength](#maxLength)
* [properties](#properties)
* [items](#items)
* [exec](#exec)

## Validation

<a name="optional" />
### optional

* type: boolean.
* usable on: any.

---------------------------------------

<a name="type" />
### type

* type: string, array of string.
* usable on: any.

__Possible values__

* "string"
* "number"
* "integer"
* "boolean"
* "null"
* "date" (constructor === Date)
* "oject" (constructor === Object)
* "array" (constructor === Array)
* "any" (it can be anything)

---------------------------------------

<a name="uniqueness" />
### uniqueness

* type: boolean.
* usable on: array, string.

---------------------------------------

<a name="pattern" />
### pattern

* type: string, RegExp object.
* usable on: string.

---------------------------------------

<a name="minLength" />
### minLength

* type: integer.
* usable on: array, string.

---------------------------------------

<a name="maxLength" />
### maxLength

* type: integer.
* usable on: array, string.


---------------------------------------

<a name="exactLength" />
### exactLength

* type: integer.
* usable on: array, string.

---------------------------------------

<a name="lt" />
### lt

* type: number.
* usable on: number.

---------------------------------------

<a name="lte" />
### lte

* type: number.
* usable on: number.

---------------------------------------

<a name="gt" />
### gt

* type: number.
* usable on: number.

---------------------------------------

<a name="gte" />
### gte

* type: number.
* usable on: number.

---------------------------------------

<a name="eq" />
### eq

* type: number.
* usable on: number.

---------------------------------------

<a name="ne" />
### ne

* type: number.
* usable on: number.

---------------------------------------

<a name="someKeys" />
### someKeys

* type: array of string.
* usable on: object.

---------------------------------------

<a name="strict" />
### strict

* type: boolean.
* usable on: object.

---------------------------------------

<a name="exec" />
### exec

* type: function, array of function.
* usable on: any.


---------------------------------------

<a name="properties" />
### properties

* type: object.
* usable on: object.

---------------------------------------

<a name="items" />
### items

* type: object, array of object.
* usable on: array.

## Sanitization

<a name="optional" />
### optional

* type: boolean.
* usable on: any.

---------------------------------------

<a name="type" />
### type

* type: string, array of string.
* usable on: any.

---------------------------------------

<a name="rules" />
### rules

* type: string, array of string.
* usable on: string.

---------------------------------------

<a name="min" />
### min

* type: string, number.
* usable on: string, number.

---------------------------------------

<a name="max" />
### max

* type: string, number.
* usable on: string, number.

---------------------------------------

<a name="minLength" />
### minLength

* type: integer.
* usable on: string.

---------------------------------------

<a name="maxLength" />
### maxLength

* type: integer.
* usable on: string.

---------------------------------------

<a name="properties" />
### properties

* type: object.
* usable on: object.

---------------------------------------

<a name="items" />
### items

* type: object, array of object.
* usable on: array.

---------------------------------------

<a name="exec" />
### exec

* type: function, array of functions.
* usable on: any.

---------------------------------------
