'use strict'

// based on http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
/* eslint-disable no-proto, new-parens, no-array-constructor */

function List (scryfallObject) {
  var arr = []

  arr.push.apply(arr, scryfallObject.data)
  arr.__proto__ = List.prototype

  Object.keys(scryfallObject).forEach(function (key) {
    if (key === 'data' || arr[key]) {
      return
    }

    arr[key] = scryfallObject[key]
  })

  return arr
}

List.prototype = new Array

module.exports = List
