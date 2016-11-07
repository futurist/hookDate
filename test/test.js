var lib = require('../')
var assert = require('assert')

globalDate = global.Date

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
    var ret = lib.hook()
    var d = new Date
    assert.strictEqual(Date.hooked, true)
    assert.deepEqual(Date.prototype, prototype)
    assert.strictEqual(d.constructor, constructor)
    assert.strictEqual(d instanceof Date, true)
    assert.strictEqual(d instanceof globalDate, true)
    assert.strictEqual(Object.prototype.toString.call(d), '[object Date]')
    assert.strictEqual(d.__proto__, globalDate.prototype)
    ret.unhook()
  })
  it('Should record result', function () {
    var ret = lib.hook()
    // only empty args will record
    Date()
    new Date
    new Date('2016', '0', '10') // this should not record
    Date.now()
    assert.equal(ret.dateStore.length, 3)
    ret.unhook()
  })
  it('Should playback result', function () {
    var store = [1478504748011, 1378504648011, 1458504748011]
    var ret = lib.hook(store, true)
    var d = [
      Date(),
      new Date(),
      new Date('2016', '0', '10'), // this should not read from store
      Date.now(),
      new Date() // the store drain, should return system time
    ]
    assert.equal(d[0], new globalDate(1478504748011).toString())
    assert.equal(d[1].toISOString(), '2013-09-06T21:57:28.011Z')
    assert.equal(d[1].toString(), new globalDate(1378504648011).toString())
    assert.equal(d[2].toISOString(), '2016-01-09T16:00:00.000Z')
    assert.equal(d[3], 1458504748011)
    assert.equal(new globalDate() - d[4] < 10, true) // close to system time
    ret.unhook()
  })

  it('Should keep global Date methods', function () {
    var ret = lib.hook([0, 0], true)

    // Date.parse
    assert.equal('807926400000', Date.parse('Wed, 09 Aug 1995 00:00:00 GMT'))

    // new Date with value
    var date = new Date(807926400000)
    assert.equal('Wed, 09 Aug 1995 00:00:00 GMT', date.toUTCString())

    // new Date with y/m
    var locDate = new Date(1995, 7)
    var utcMs = locDate.valueOf() - locDate.getTimezoneOffset() * 60 * 1000
    var utcDate = new Date(utcMs)
    assert.equal('Tue, 01 Aug 1995 00:00:00 GMT', utcDate.toUTCString())

    // new Date with y/m/d
    var locDate = new Date(1995, 7, 9)
    var utcMs = locDate.valueOf() - locDate.getTimezoneOffset() * 60 * 1000
    var utcDate = new Date(utcMs)
    assert.equal('Wed, 09 Aug 1995 00:00:00 GMT', utcDate.toUTCString())

    assert.equal('Thu, 01 Jan 1970 00:00:00 GMT', new Date().toUTCString())
    ret.unhook()
  })

  it('Should not hook again', function() {
    var ret = lib.hook()
    assert.throws(lib.hook, Error)
    ret.unhook()
  })
})
