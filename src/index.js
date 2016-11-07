// lib hookDate

var hook = function (store, playBack) {
  if(Date.hooked) return console.warn('Date already hooked, should not hook again')

  var oldDate = Date
  store = Array.isArray(store) ? store : []

  var hookDate = function () {
    // called with new
    var playBack = hookDate.playBack
    var dateStore = hookDate.dateStore
    var calledWithNew = this instanceof hookDate
    var args = [].slice.call(arguments)
    var emptyArgs = !args.length
    if(emptyArgs && playBack) args = dateStore.splice(0,1)

    // call new Date
    var instance = new (oldDate.bind.apply(oldDate, [null].concat(args)))()
    // mock constructor
    instance.constructor = oldDate
    instance.__proto__  = oldDate.prototype

    if(emptyArgs && !playBack) dateStore.push(instance.getTime())
    // save the value
    return calledWithNew ? instance : instance.toString()
  }

  // special props
  hookDate.oldDate = oldDate
  hookDate.dateStore = store
  hookDate.playBack = !!playBack
  hookDate.hooked = true

  // mock prototypes
  hookDate.prototype = oldDate.prototype

  // mock static methods
  if(hookDate.hookedMethods) {
    hookDate.hookedMethods.forEach(function(k) {
      delete hookDate[k]
    })
  }
  hookDate.hookedMethods = []
  Object.getOwnPropertyNames(oldDate).forEach(function(k) {
    hookDate.hookedMethods.push(k)
    hookDate[k] = oldDate[k]
  })

  // hook Date.now
  hookDate.now = function () {
    var playBack = hookDate.playBack
    var dateStore = hookDate.dateStore
    var val = oldDate.now()
    if(playBack) val = dateStore.shift()
    else dateStore.push(val)
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
