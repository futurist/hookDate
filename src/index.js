// lib hookDate

var hook = function (store, playBack) {
  var hookDate = function () {
    // called with new
    var value
    var playBack = hookDate.playBack
    var hookDateStore = hookDate.dateStore
    var calledWithNew = this instanceof hookDate
    var args = [].slice.call(arguments)
    var emptyArgs = !args.length
    if(emptyArgs && playBack) args = hookDateStore.splice(0,1)

    // call new Date
    var instance = new (oldDate.bind.apply(oldDate, [null].concat(args)))()
    // mock constructor
    instance.constructor = oldDate
    instance.__proto__  = oldDate.prototype

    if(emptyArgs && !playBack) hookDateStore.push(instance.getTime())
    // save the value
    return calledWithNew ? instance : instance.toString()
  }

  if(Date._hooked) return console.warn('Date already hooked, should not hook again')

  var oldDate = Date
  hookDate.oldDate = oldDate
  hookDate.dateStore = Array.isArray(store) ? store : []
  hookDate.playBack = hookDate.playBack || !!playBack
  hookDate.hooked = true

  // mock prototypes
  hookDate.prototype = oldDate.prototype

  // mock static methods
  if(Array.isArray(hookDate.hookMethods)){
    hookDate.hookMethods.forEach(function(k) {
      delete hookDate[k]
    })
  }
  hookDate.hookMethods = []
  Object.getOwnPropertyNames(oldDate).forEach(function(k) {
    hookDate.hookMethods.push(k)
    hookDate[k] = oldDate[k]
  })

  // hook Date.now
  hookDate.now = function () {
    var playBack = hookDate.playBack
    var hookDateStore = hookDate.dateStore
    var val = oldDate.now()
    if(playBack) val = hookDateStore.shift()
    else hookDateStore.push(val)
    return val
  }

  hookDate.unhook = function() {
    Date = oldDate
    hookDate.hooked = false
  }

  Date = hookDate
  return hookDate
}

module.exports = {hook: hook}
