# hookdate
Hook javascript Date object to save date and time for each call, and playback(mock) the saved data to get same result again. Useful for testing.

[![CircleCI](https://circleci.com/gh/futurist/hookdate.svg?style=svg)](https://circleci.com/gh/futurist/hookdate)

## Install

``` bash
npm install hookdate
```

## Usage

 - For record and playback `new Date` calls:

``` javascript
var lib = require('hookdate')

var d = [
  new Date(),
  Date(),
  Date.now(),
  new Date(2016, 10, 1)  // this will not record
]

console.log(lib.dateStore)
// [1478515156899, 1478515156000, 1478515156899]

lib.playBack = true

+new Date
// 1478515156899

new Date()
// 1478515156000

Date.now()
// 1478515156899

lib.unhook()
```

 - For only playback `new Date` in lib:

``` javascript
var lib = require('hookdate')

lib.hook([1298937600000, 1478514684440], true)

/* hook first date */
new Date().toISOString()
// "2011-03-01T00:00:00.000Z"

/* hook second date */
new Date().toISOString()
// "2016-11-07T10:31:24.440Z"

/* drained */
new Date()
// return system time

// restore old Date object
lib.unhook()
```

## API

### **lib.hook : fn(dateStore: number[], isPlayBack: boolean) => void**

Hook global Date object

Optional pass dateStore as time array (milliseconds elapsed since the UNIX epoch), will used for record/playback, **default: []**

Optional pass whether to playback or record, **default: false**

### **lib.unhook : fn() => void**

Restore old global Date object.

### **lib.dateStore : number[]**

Time array (milliseconds elapsed since the UNIX epoch) used for any call to `new Date()`, `Date()`, `Date.now`.

If **isPlayBack** is **true**, will **shift** first value into the Date result, else **push** new time value into it.

### **lib.playBack : boolean**

Whether the mode is record(**false**), or a playback(**true**).

### **lib.oldDate : Date**

The reference of old global Date object.

### **lib.pause : boolean**

When set to true, will pause record/playback, set to false to continue.



