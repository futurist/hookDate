if(Date.hooked) console.warn('Date already hooked, should not hook again')
var oldDate = Date

hookDate.hooked = true
hookDate.playBack = hookDate.playBack || true
hookDate.dateStore = hookDate.dateStore || [1478486532502]

var playBack = hookDate.playBack
var hookDateStore = hookDate.dateStore

hookDate = function () {
  // called with new
  var value
  var calledWithNew = this instanceof hookDate
  var args = [].slice.call(arguments)
  var emptyArgs = !args.length
  if(emptyArgs && playBack) args = hookDateStore.splice(0,1)

  // call new Date
  var val = new (oldDate.bind.apply(oldDate, [null].concat(args)))()
  // mock constructor
  val.constructor = oldDate

  if(emptyArgs && !playBack) hookDateStore.push(val.getTime())
  // save the value
  return calledWithNew ? val : val.toString()
}

// mock prototypes
hookDate.prototype = oldDate.prototype
Object.getOwnPropertyNames(oldDate).forEach(function(k) {
  hookDate[k] = oldDate[k]
})

// hook Date.now
hookDate.now = function () {
  var val = oldDate.now()
  hookDateStore.push(val)
  return val
}

Date = hookDate
