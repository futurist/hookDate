var lib = require('../')
var assert = require('assert')

globalDate = global.Date

function toUTC(d) {
  return new Date(d.getTime() - d.getTimezoneOffset()*60*1000)
}

describe('test Date', function () {
  // ensure it's not hooked
  beforeEach(function () {
    Date = globalDate
    assert.strictEqual(Date.hooked, undefined)
  })
  afterEach(function () {
    assert.strictEqual(Date, globalDate)
  })

  // start run
  it('Date constructor and prototype', function () {
    var constructor = globalDate
    var prototype = globalDate.prototype
    lib.hook()
    var d = new Date
    assert.strictEqual(typeof Date.__hook, 'object')
    assert.deepEqual(Date.prototype, prototype)
    assert.strictEqual(d.constructor, constructor)
    assert.strictEqual(d instanceof Date, true)
    assert.strictEqual(d instanceof globalDate, true)
    assert.strictEqual(Object.prototype.toString.call(d), '[object Date]')
    assert.strictEqual(d.__proto__, globalDate.prototype)
    lib.unhook()
  })
  it('Should record result', function () {
    lib.hook()
    // only empty args will record
    Date()
    new Date
    new Date('2016', '0', '10') // this should not record
    Date.now()
    assert.equal(lib.dateStore.length, 3)
    lib.unhook()
  })
  it('Should playback result', function () {
    'use strict'
    var store = [1478504748011, 1378504648011, 1458504748011]
    var ret = lib.hook(store, true)
    var d = [
      Date(),
      new Date(),
      toUTC(new Date(2016, 0, 10)), // this should not read from store
      Date.now(),
      new Date() // the store drain, should return system time
    ]
    assert.equal(d[0], new globalDate(1478504748011).toString())
    assert.equal(d[1].toISOString(), '2013-09-06T21:57:28.011Z')
    assert.equal(d[1].toString(), new globalDate(1378504648011).toString())
    assert.equal(d[2].toISOString(), '2016-01-10T00:00:00.000Z')
    assert.equal(d[3], 1458504748011)
    assert.equal(new globalDate() - d[4] < 10, true) // close to system time
    lib.unhook()
  })

  it('Should keep global Date methods', function () {
    lib.hook([0, 0], true)

    // Date.parse
    assert.equal('807926400000', Date.parse('Wed, 09 Aug 1995 00:00:00 GMT'))

    // new Date with value
    var date = new Date(807926400000)
    assert.equal('Wed, 09 Aug 1995 00:00:00 GMT', date.toUTCString())

    // new Date with y/m
    var utcDate = toUTC(new Date(1995, 7))
    assert.equal('Tue, 01 Aug 1995 00:00:00 GMT', utcDate.toUTCString())

    // new Date with y/m/d
    var utcDate = toUTC(new Date(1995, 7, 9))
    assert.equal('Wed, 09 Aug 1995 00:00:00 GMT', utcDate.toUTCString())

    assert.equal('Thu, 01 Jan 1970 00:00:00 GMT', new Date().toUTCString())
    lib.unhook()
  })

  it('Should not hook again', function() {
    lib.hook()
    assert.throws(lib.hook, Error)
    lib.unhook()
  })

  it('Should dynamic change dateStore and playBack', function() {
    var d = [
      +new Date(), new Date(Date.UTC(2011, 2, 1)).getTime()
    ]
    lib.hook()
    lib.dateStore = d.slice(0)
    lib.playBack = true
    assert.equal(+new Date(), d[0])
    assert.equal(new Date().toISOString(), "2011-03-01T00:00:00.000Z")
    lib.unhook()
  })

  it('Should pause right', function() {
    lib.hook()
    Date()
    Date()
    Date.now()
    Date.__hook.pause=true
    Date()
    Date.now()
    Date.__hook.pause=false
    Date()
    Date.now()
    assert.equal(lib.dateStore.length, 5)
    lib.unhook()
  })
})
