// lib hookDate
var _getTimezoneOffset = Date.prototype.getTimezoneOffset

var hook = function (store, playBack, cb) {
  if (Date.__hook) {
    throw new Error('Date already hooked, should not hook again')
  }

  var oldDate = Date
  store = Array.isArray(store) ? store : []

  lib.oldDate = oldDate
  lib.dateStore = store
  lib.playBack = !!playBack

  if (typeof lib.timezoneOffset === 'number') {
    oldDate.prototype.getTimezoneOffset = function() {
      return lib.timezoneOffset
    }
  }

  var hookDate = function (y, m, d, h, M, s, ms) {
    // called with new
    var pause = lib.pause
    var playBack = lib.playBack
    var dateStore = lib.dateStore
    var calledWithNew = this instanceof hookDate
    var args = [].slice.call(arguments)
    var emptyArgs = !args.length
    if (!pause && emptyArgs && playBack) {
      args = dateStore.splice(0, 1)
      cb && cb(playBack, args[0])
    }

    // call new Date
    var instance = new (oldDate.bind.apply(oldDate, [null].concat(args)))()
    // mock constructor
    instance.constructor = oldDate
    instance.__proto__ = oldDate.prototype

    if (!pause && emptyArgs && !playBack) {
      var val = instance.getTime()
      dateStore.push(val)
      cb && cb(playBack, val)
    }
    // save the value
    return calledWithNew ? instance : instance.toString()
  }

  // special props

  if ('defineProperty' in Object) {
    Object.defineProperty(hookDate, '__hook', {
      value: lib
    })
  } else {
    hookDate.__hook = lib
  }

  // mock static methods
  // "parse", "UTC", "now", "name", "prototype", "length"
  Object.getOwnPropertyNames(oldDate).forEach(function (k) {
    if (['length', 'name'].indexOf(k) > -1) return
    hookDate[k] = oldDate[k]
  })

  // hook Date.now
  hookDate.now = function () {
    var pause = lib.pause
    var playBack = lib.playBack
    var dateStore = lib.dateStore
    var val = oldDate.now()
    if (!pause) {
      if (playBack) {
        val = dateStore.shift()
      } else {
        dateStore.push(val)
      }
      cb && cb(playBack, val)
    }
    return val
  }

  Date = hookDate
}

var unhook = function () {
  var handle = Date.__hook
  if (!handle) return
  if (!handle.oldDate) throw new Error('hookDate: cannot get old Date')
  Date = handle.oldDate
  Date.prototype.getTimezoneOffset = _getTimezoneOffset
  lib.timezoneOffset = null
  return handle
}

var lib = {
  oldDate: null,
  dateStore: [],
  playBack: false,
  start: hook,
  stop: unhook,
  pause: false,
  timezoneOffset: null
}

export default lib
