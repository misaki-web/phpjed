/* PHPjed v1.0-all | (c) 2021 Misaki F. (c) 2007-2016 Kevin van Zonneveld and Contributors | https://github.com/phpjed */
var phpjed = phpjed || {};
phpjed._php_cast_string = function(value) {
	// original by: Rafał Kukawski
	//   example 1: _php_cast_string(true)
	//   returns 1: '1'
	//   example 2: _php_cast_string(false)
	//   returns 2: ''
	//   example 3: _php_cast_string('foo')
	//   returns 3: 'foo'
	//   example 4: _php_cast_string(0/0)
	//   returns 4: 'NAN'
	//   example 5: _php_cast_string(1/0)
	//   returns 5: 'INF'
	//   example 6: _php_cast_string(-1/0)
	//   returns 6: '-INF'
	//   example 7: _php_cast_string(null)
	//   returns 7: ''
	//   example 8: _php_cast_string(undefined)
	//   returns 8: ''
	//   example 9: _php_cast_string([])
	//   returns 9: 'Array'
	//   example 10: _php_cast_string({})
	//   returns 10: 'Object'
	//   example 11: _php_cast_string(0)
	//   returns 11: '0'
	//   example 12: _php_cast_string(1)
	//   returns 12: '1'
	//   example 13: _php_cast_string(3.14)
	//   returns 13: '3.14'
	const type = typeof value
	switch (type) {
		case 'boolean':
			return value ? '1' : ''
		case 'string':
			return value
		case 'number':
			if (isNaN(value)) {
				return 'NAN'
			}
			if (!isFinite(value)) {
				return (value < 0 ? '-' : '') + 'INF'
			}
			return value + ''
		case 'undefined':
			return ''
		case 'object':
			if (Array.isArray(value)) {
				return 'Array'
			}
			if (value !== null) {
				return 'Object'
			}
			return ''
		case 'function':
			// fall through
		default:
			throw new Error('Unsupported value type')
	}
}
phpjed._php_cast_float = function(value) { // eslint-disable-line camelcase
	// original by: Rafał Kukawski
	//   example 1: _php_cast_float(false)
	//   returns 1: 0
	//   example 2: _php_cast_float(true)
	//   returns 2: 1
	//   example 3: _php_cast_float(0)
	//   returns 3: 0
	//   example 4: _php_cast_float(1)
	//   returns 4: 1
	//   example 5: _php_cast_float(3.14)
	//   returns 5: 3.14
	//   example 6: _php_cast_float('')
	//   returns 6: 0
	//   example 7: _php_cast_float('0')
	//   returns 7: 0
	//   example 8: _php_cast_float('abc')
	//   returns 8: 0
	//   example 9: _php_cast_float(null)
	//   returns 9: 0
	//  example 10: _php_cast_float(undefined)
	//  returns 10: 0
	//  example 11: _php_cast_float('123abc')
	//  returns 11: 123
	//  example 12: _php_cast_float('123e4')
	//  returns 12: 1230000
	//  example 13: _php_cast_float(0x200000001)
	//  returns 13: 8589934593
	//  example 14: _php_cast_float('3.14abc')
	//  returns 14: 3.14
	const type = typeof value
	switch (type) {
		case 'number':
			return value
		case 'string':
			return parseFloat(value) || 0
		case 'boolean':
			// fall through
		default:
			// PHP docs state, that for types other than string
			// conversion is {input type}->int->float
			return phpjed._php_cast_int(value)
	}
}
phpjed._php_cast_int = function(value) { // eslint-disable-line camelcase
	// original by: Rafał Kukawski
	//   example 1: _php_cast_int(false)
	//   returns 1: 0
	//   example 2: _php_cast_int(true)
	//   returns 2: 1
	//   example 3: _php_cast_int(0)
	//   returns 3: 0
	//   example 4: _php_cast_int(1)
	//   returns 4: 1
	//   example 5: _php_cast_int(3.14)
	//   returns 5: 3
	//   example 6: _php_cast_int('')
	//   returns 6: 0
	//   example 7: _php_cast_int('0')
	//   returns 7: 0
	//   example 8: _php_cast_int('abc')
	//   returns 8: 0
	//   example 9: _php_cast_int(null)
	//   returns 9: 0
	//  example 10: _php_cast_int(undefined)
	//  returns 10: 0
	//  example 11: _php_cast_int('123abc')
	//  returns 11: 123
	//  example 12: _php_cast_int('123e4')
	//  returns 12: 123
	//  example 13: _php_cast_int(0x200000001)
	//  returns 13: 8589934593
	const type = typeof value
	switch (type) {
		case 'number':
			if (isNaN(value) || !isFinite(value)) {
				// from PHP 7, NaN and Infinity are casted to 0
				return 0
			}
			return value < 0 ? Math.ceil(value) : Math.floor(value)
		case 'string':
			return parseInt(value, 10) || 0
		case 'boolean':
			// fall through
		default:
			// Behaviour for types other than float, string, boolean
			// is undefined and can change any time.
			// To not invent complex logic
			// that mimics PHP 7.0 behaviour
			// casting value->bool->number is used
			return +!!value
	}
}
phpjed.array_change_key_case = function(array, cs) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_change_key_case/
	// original by: Ates Goral (https://magnetiq.com)
	// improved by: marrtins
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_change_key_case(42)
	//   returns 1: false
	//   example 2: array_change_key_case([ 3, 5 ])
	//   returns 2: [3, 5]
	//   example 3: array_change_key_case({ FuBaR: 42 })
	//   returns 3: {"fubar": 42}
	//   example 4: array_change_key_case({ FuBaR: 42 }, 'CASE_LOWER')
	//   returns 4: {"fubar": 42}
	//   example 5: array_change_key_case({ FuBaR: 42 }, 'CASE_UPPER')
	//   returns 5: {"FUBAR": 42}
	//   example 6: array_change_key_case({ FuBaR: 42 }, 2)
	//   returns 6: {"FUBAR": 42}
	let caseFnc
	let key
	const tmpArr = {}
	if (Object.prototype.toString.call(array) === '[object Array]') {
		return array
	}
	if (array && typeof array === 'object') {
		caseFnc = (!cs || cs === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase'
		for (key in array) {
			tmpArr[key[caseFnc]()] = array[key]
		}
		return tmpArr
	}
	return false
}
phpjed.array_chunk = function(input, size, preserveKeys) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_chunk/
	// original by: Carlos R. L. Rodrigues (https://www.jsfromhell.com)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Important note: Per the ECMAScript specification,
	//      note 1: objects may not always iterate in a predictable order
	//   example 1: array_chunk(['Kevin', 'van', 'Zonneveld'], 2)
	//   returns 1: [['Kevin', 'van'], ['Zonneveld']]
	//   example 2: array_chunk(['Kevin', 'van', 'Zonneveld'], 2, true)
	//   returns 2: [{0:'Kevin', 1:'van'}, {2: 'Zonneveld'}]
	//   example 3: array_chunk({1:'Kevin', 2:'van', 3:'Zonneveld'}, 2)
	//   returns 3: [['Kevin', 'van'], ['Zonneveld']]
	//   example 4: array_chunk({1:'Kevin', 2:'van', 3:'Zonneveld'}, 2, true)
	//   returns 4: [{1: 'Kevin', 2: 'van'}, {3: 'Zonneveld'}]
	let x
	let p = ''
	let i = 0
	let c = -1
	const l = input.length || 0
	const n = []
	if (size < 1) {
		return null
	}
	if (Object.prototype.toString.call(input) === '[object Array]') {
		if (preserveKeys) {
			while (i < l) {
				(x = i % size) ? n[c][i] = input[i]: n[++c] = {};
				n[c][i] = input[i]
				i++
			}
		} else {
			while (i < l) {
				(x = i % size) ? n[c][x] = input[i]: n[++c] = [input[i]]
				i++
			}
		}
	} else {
		if (preserveKeys) {
			for (p in input) {
				if (input.hasOwnProperty(p)) {
					(x = i % size) ? n[c][p] = input[p]: n[++c] = {};
					n[c][p] = input[p]
					i++
				}
			}
		} else {
			for (p in input) {
				if (input.hasOwnProperty(p)) {
					(x = i % size) ? n[c][x] = input[p]: n[++c] = [input[p]]
					i++
				}
			}
		}
	}
	return n
}
phpjed.array_column = function(input, ColumnKey, IndexKey = null) { // eslint-disable-line camelcase
	//   discuss at: https://locutus.io/php/array_column/
	//   original by: Enzo Dañobeytía
	//   example 1: array_column([{name: 'Alex', value: 1}, {name: 'Elvis', value: 2}, {name: 'Michael', value: 3}], 'name')
	//   returns 1: {0: "Alex", 1: "Elvis", 2: "Michael"}
	//   example 2: array_column({0: {name: 'Alex', value: 1}, 1: {name: 'Elvis', value: 2}, 2: {name: 'Michael', value: 3}}, 'name')
	//   returns 2: {0: "Alex", 1: "Elvis", 2: "Michael"}
	//   example 3: array_column([{name: 'Alex', value: 1}, {name: 'Elvis', value: 2}, {name: 'Michael', value: 3}], 'name', 'value')
	//   returns 3: {1: "Alex", 2: "Elvis", 3: "Michael"}
	//   example 4: array_column([{name: 'Alex', value: 1}, {name: 'Elvis', value: 2}, {name: 'Michael', value: 3}], null, 'value')
	//   returns 4: {1: {name: 'Alex', value: 1}, 2: {name: 'Elvis', value: 2}, 3: {name: 'Michael', value: 3}}
	if (input !== null && (typeof input === 'object' || Array.isArray(input))) {
		const newarray = []
		if (typeof input === 'object') {
			const temparray = []
			for (const key of Object.keys(input)) {
				temparray.push(input[key])
			}
			input = temparray
		}
		if (Array.isArray(input)) {
			for (const key of input.keys()) {
				if (IndexKey && input[key][IndexKey]) {
					if (ColumnKey) {
						newarray[input[key][IndexKey]] = input[key][ColumnKey]
					} else {
						newarray[input[key][IndexKey]] = input[key]
					}
				} else {
					if (ColumnKey) {
						newarray.push(input[key][ColumnKey])
					} else {
						newarray.push(input[key])
					}
				}
			}
		}
		return Object.assign({}, newarray)
	}
}
phpjed.array_combine = function(keys, values) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_combine/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_combine([0,1,2], ['kevin','van','zonneveld'])
	//   returns 1: {0: 'kevin', 1: 'van', 2: 'zonneveld'}
	const newArray = {}
	let i = 0
	// input sanitation
	// Only accept arrays or array-like objects
	// Require arrays to have a count
	if (typeof keys !== 'object') {
		return false
	}
	if (typeof values !== 'object') {
		return false
	}
	if (typeof keys.length !== 'number') {
		return false
	}
	if (typeof values.length !== 'number') {
		return false
	}
	if (!keys.length) {
		return false
	}
	// number of elements does not match
	if (keys.length !== values.length) {
		return false
	}
	for (i = 0; i < keys.length; i++) {
		newArray[keys[i]] = values[i]
	}
	return newArray
}
phpjed.array_count_values = function(array) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_count_values/
	// original by: Ates Goral (https://magnetiq.com)
	// improved by: Michael White (https://getsprink.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: sankai
	//    input by: Shingo
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_count_values([ 3, 5, 3, "foo", "bar", "foo" ])
	//   returns 1: {3:2, 5:1, "foo":2, "bar":1}
	//   example 2: array_count_values({ p1: 3, p2: 5, p3: 3, p4: "foo", p5: "bar", p6: "foo" })
	//   returns 2: {3:2, 5:1, "foo":2, "bar":1}
	//   example 3: array_count_values([ true, 4.2, 42, "fubar" ])
	//   returns 3: {42:1, "fubar":1}
	const tmpArr = {}
	let key = ''
	let t = ''
	const _getType = function(obj) {
		// Objects are php associative arrays.
		let t = typeof obj
		t = t.toLowerCase()
		if (t === 'object') {
			t = 'array'
		}
		return t
	}
	const _countValue = function(tmpArr, value) {
		if (typeof value === 'number') {
			if (Math.floor(value) !== value) {
				return
			}
		} else if (typeof value !== 'string') {
			return
		}
		if (value in tmpArr && tmpArr.hasOwnProperty(value)) {
			++tmpArr[value]
		} else {
			tmpArr[value] = 1
		}
	}
	t = _getType(array)
	if (t === 'array') {
		for (key in array) {
			if (array.hasOwnProperty(key)) {
				_countValue.call(this, tmpArr, array[key])
			}
		}
	}
	return tmpArr
}
phpjed.array_diff = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_diff/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Sanjoy Roy
	//  revised by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld'])
	//   returns 1: {0:'Kevin'}
	const retArr = {}
	const argl = arguments.length
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < argl; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (arr[k] === arr1[k1]) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_diff_assoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_diff_assoc/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: 0m3r
	//  revised by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_diff_assoc({0: 'Kevin', 1: 'van', 2: 'Zonneveld'}, {0: 'Kevin', 4: 'van', 5: 'Zonneveld'})
	//   returns 1: {1: 'van', 2: 'Zonneveld'}
	const retArr = {}
	const argl = arguments.length
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < argl; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (arr[k] === arr1[k1] && k === k1) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_diff_key = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_diff_key/
	// original by: Ates Goral (https://magnetiq.com)
	//  revised by: Brett Zamir (https://brett-zamir.me)
	//    input by: Everlasto
	//   example 1: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5})
	//   returns 1: {"green":2, "blue":3, "white":4}
	//   example 2: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5}, {red: 5})
	//   returns 2: {"green":2, "blue":3, "white":4}
	const argl = arguments.length
	const retArr = {}
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < argl; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (k === k1) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_diff_uassoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_diff_uassoc/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
	//   example 1: array_diff_uassoc($array1, $array2, function (key1, key2) { return (key1 === key2 ? 0 : (key1 > key2 ? 1 : -1)) })
	//   returns 1: {b: 'brown', c: 'blue', 0: 'red'}
	//        test: skip-1
	const retArr = {}
	const arglm1 = arguments.length - 1
	let cb = arguments[arglm1]
	let arr = {}
	let i = 1
	let k1 = ''
	let k = ''
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < arglm1; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (arr[k] === arr1[k1] && cb(k, k1) === 0) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_diff_ukey = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_diff_ukey/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {blue: 1, red: 2, green: 3, purple: 4}
	//   example 1: var $array2 = {green: 5, blue: 6, yellow: 7, cyan: 8}
	//   example 1: array_diff_ukey($array1, $array2, function (key1, key2){ return (key1 === key2 ? 0 : (key1 > key2 ? 1 : -1)); })
	//   returns 1: {red: 2, purple: 4}
	const retArr = {}
	const arglm1 = arguments.length - 1
	// var arglm2 = arglm1 - 1
	let cb = arguments[arglm1]
	let k1 = ''
	let i = 1
	let arr = {}
	let k = ''
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < arglm1; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (cb(k, k1) === 0) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_fill = function(startIndex, num, mixedVal) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_fill/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Waldo Malqui Silva (https://waldo.malqui.info)
	//   example 1: array_fill(5, 6, 'banana')
	//   returns 1: { 5: 'banana', 6: 'banana', 7: 'banana', 8: 'banana', 9: 'banana', 10: 'banana' }
	let key
	const tmpArr = {}
	if (!isNaN(startIndex) && !isNaN(num)) {
		for (key = 0; key < num; key++) {
			tmpArr[(key + startIndex)] = mixedVal
		}
	}
	return tmpArr
}
phpjed.array_fill_keys = function(keys, value) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_fill_keys/
	// original by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $keys = {'a': 'foo', 2: 5, 3: 10, 4: 'bar'}
	//   example 1: array_fill_keys($keys, 'banana')
	//   returns 1: {"foo": "banana", 5: "banana", 10: "banana", "bar": "banana"}
	const retObj = {}
	let key = ''
	for (key in keys) {
		retObj[keys[key]] = value
	}
	return retObj
}
phpjed.array_filter = function(arr, func) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_filter/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: max4ever
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Takes a function as an argument, not a function's name
	//   example 1: var odd = function (num) {return (num & 1);}
	//   example 1: array_filter({"a": 1, "b": 2, "c": 3, "d": 4, "e": 5}, odd)
	//   returns 1: {"a": 1, "c": 3, "e": 5}
	//   example 2: var even = function (num) {return (!(num & 1));}
	//   example 2: array_filter([6, 7, 8, 9, 10, 11, 12], even)
	//   returns 2: [ 6, , 8, , 10, , 12 ]
	//   example 3: array_filter({"a": 1, "b": false, "c": -1, "d": 0, "e": null, "f":'', "g":undefined})
	//   returns 3: {"a":1, "c":-1}
	let retObj = {}
	let k
	func = func || function(v) {
		return v
	}
	// @todo: Issue #73
	if (Object.prototype.toString.call(arr) === '[object Array]') {
		retObj = []
	}
	for (k in arr) {
		if (func(arr[k])) {
			retObj[k] = arr[k]
		}
	}
	return retObj
}
phpjed.array_flip = function(trans) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_flip/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Pier Paolo Ramon (https://www.mastersoup.com/)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_flip( {a: 1, b: 1, c: 2} )
	//   returns 1: {1: 'b', 2: 'c'}
	let key
	const tmpArr = {}
	for (key in trans) {
		if (!trans.hasOwnProperty(key)) {
			continue
		}
		tmpArr[trans[key]] = key
	}
	return tmpArr
}
phpjed.array_intersect = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_intersect/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: These only output associative arrays (would need to be
	//      note 1: all numeric and counting from zero to be numeric)
	//   example 1: var $array1 = {'a' : 'green', 0:'red', 1: 'blue'}
	//   example 1: var $array2 = {'b' : 'green', 0:'yellow', 1:'red'}
	//   example 1: var $array3 = ['green', 'red']
	//   example 1: var $result = array_intersect($array1, $array2, $array3)
	//   returns 1: {0: 'red', a: 'green'}
	const retArr = {}
	const argl = arguments.length
	const arglm1 = argl - 1
	let k1 = ''
	let arr = {}
	let i = 0
	let k = ''
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		arrs: for (i = 1; i < argl; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (arr[k] === arr1[k1]) {
					if (i === arglm1) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_intersect_assoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_intersect_assoc/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: These only output associative arrays (would need to be
	//      note 1: all numeric and counting from zero to be numeric)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'green', 0: 'yellow', 1: 'red'}
	//   example 1: array_intersect_assoc($array1, $array2)
	//   returns 1: {a: 'green'}
	const retArr = {}
	const argl = arguments.length
	const arglm1 = argl - 1
	let k1 = ''
	let arr = {}
	let i = 0
	let k = ''
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		arrs: for (i = 1; i < argl; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (arr[k] === arr1[k1] && k === k1) {
					if (i === arglm1) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_intersect_key = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_intersect_key/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: These only output associative arrays (would need to be
	//      note 1: all numeric and counting from zero to be numeric)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'green', 0: 'yellow', 1: 'red'}
	//   example 1: array_intersect_key($array1, $array2)
	//   returns 1: {0: 'red', a: 'green'}
	const retArr = {}
	const argl = arguments.length
	const arglm1 = argl - 1
	let k1 = ''
	let arr = {}
	let i = 0
	let k = ''
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		if (!arr1.hasOwnProperty(k1)) {
			continue
		}
		arrs: for (i = 1; i < argl; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (!arr.hasOwnProperty(k)) {
					continue
				}
				if (k === k1) {
					if (i === arglm1) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_intersect_uassoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_intersect_uassoc/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
	//   example 1: array_intersect_uassoc($array1, $array2, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;})
	//   returns 1: {b: 'brown'}
	const retArr = {}
	const arglm1 = arguments.length - 1
	const arglm2 = arglm1 - 1
	let cb = arguments[arglm1]
	// var cb0 = arguments[arglm2]
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	// cb0 = (typeof cb0 === 'string')
	//   ? $global[cb0]
	//   : (Object.prototype.toString.call(cb0) === '[object Array]')
	//     ? $global[cb0[0]][cb0[1]]
	//     : cb0
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		arrs: for (i = 1; i < arglm1; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (arr[k] === arr1[k1] && cb(k, k1) === 0) {
					if (i === arglm2) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_intersect_ukey = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_intersect_ukey/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {blue: 1, red: 2, green: 3, purple: 4}
	//   example 1: var $array2 = {green: 5, blue: 6, yellow: 7, cyan: 8}
	//   example 1: array_intersect_ukey ($array1, $array2, function (key1, key2){ return (key1 === key2 ? 0 : (key1 > key2 ? 1 : -1)); })
	//   returns 1: {blue: 1, green: 3}
	const retArr = {}
	const arglm1 = arguments.length - 1
	const arglm2 = arglm1 - 1
	let cb = arguments[arglm1]
	// var cb0 = arguments[arglm2]
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	// cb0 = (typeof cb0 === 'string')
	//   ? $global[cb0]
	//   : (Object.prototype.toString.call(cb0) === '[object Array]')
	//     ? $global[cb0[0]][cb0[1]]
	//     : cb0
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		arrs: for (i = 1; i < arglm1; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (cb(k, k1) === 0) {
					if (i === arglm2) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_keys = function(input, searchValue, argStrict) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_keys/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//    input by: P
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// improved by: jd
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} )
	//   returns 1: [ 'firstname', 'surname' ]
	const search = typeof searchValue !== 'undefined'
	const tmpArr = []
	const strict = !!argStrict
	let include = true
	let key = ''
	for (key in input) {
		if (input.hasOwnProperty(key)) {
			include = true
			if (search) {
				if (strict && input[key] !== searchValue) {
					include = false
				} else if (input[key] !== searchValue) {
					include = false
				}
			}
			if (include) {
				tmpArr[tmpArr.length] = key
			}
		}
	}
	return tmpArr
}
phpjed.array_map = function(callback) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_map/
	// original by: Andrea Giammarchi (https://webreflection.blogspot.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: thekid
	//      note 1: If the callback is a string (or object, if an array is supplied),
	//      note 1: it can only work if the function name is in the global context
	//   example 1: array_map( function (a){return (a * a * a)}, [1, 2, 3, 4, 5] )
	//   returns 1: [ 1, 8, 27, 64, 125 ]
	const argc = arguments.length
	const argv = arguments
	let obj = null
	let cb = callback
	const j = argv[1].length
	let i = 0
	let k = 1
	let m = 0
	let tmp = []
	const tmpArr = []
	const $global = (typeof window !== 'undefined' ? window : global)
	while (i < j) {
		while (k < argc) {
			tmp[m++] = argv[k++][i]
		}
		m = 0
		k = 1
		if (callback) {
			if (typeof callback === 'string') {
				cb = $global[callback]
			} else if (typeof callback === 'object' && callback.length) {
				obj = typeof callback[0] === 'string' ? $global[callback[0]] : callback[0]
				if (typeof obj === 'undefined') {
					throw new Error('Object not found: ' + callback[0])
				}
				cb = typeof callback[1] === 'string' ? obj[callback[1]] : callback[1]
			}
			tmpArr[i++] = cb.apply(obj, tmp)
		} else {
			tmpArr[i++] = tmp
		}
		tmp = []
	}
	return tmpArr
}
phpjed.array_merge = function() { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_merge/
	// original by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Nate
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//    input by: josh
	//   example 1: var $arr1 = {"color": "red", 0: 2, 1: 4}
	//   example 1: var $arr2 = {0: "a", 1: "b", "color": "green", "shape": "trapezoid", 2: 4}
	//   example 1: array_merge($arr1, $arr2)
	//   returns 1: {"color": "green", 0: 2, 1: 4, 2: "a", 3: "b", "shape": "trapezoid", 4: 4}
	//   example 2: var $arr1 = []
	//   example 2: var $arr2 = {1: "data"}
	//   example 2: array_merge($arr1, $arr2)
	//   returns 2: {0: "data"}
	const args = Array.prototype.slice.call(arguments)
	const argl = args.length
	let arg
	const retObj = {}
	let k = ''
	let argil = 0
	let j = 0
	let i = 0
	let ct = 0
	const toStr = Object.prototype.toString
	let retArr = true
	for (i = 0; i < argl; i++) {
		if (toStr.call(args[i]) !== '[object Array]') {
			retArr = false
			break
		}
	}
	if (retArr) {
		retArr = []
		for (i = 0; i < argl; i++) {
			retArr = retArr.concat(args[i])
		}
		return retArr
	}
	for (i = 0, ct = 0; i < argl; i++) {
		arg = args[i]
		if (toStr.call(arg) === '[object Array]') {
			for (j = 0, argil = arg.length; j < argil; j++) {
				retObj[ct++] = arg[j]
			}
		} else {
			for (k in arg) {
				if (arg.hasOwnProperty(k)) {
					if (parseInt(k, 10) + '' === k) {
						retObj[ct++] = arg[k]
					} else {
						retObj[k] = arg[k]
					}
				}
			}
		}
	}
	return retObj
}
phpjed.array_merge_recursive = function(arr1, arr2) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_merge_recursive/
	// original by: Subhasis Deb
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: var $arr1 = {'color': {'favorite': 'red'}, 0: 5}
	//   example 1: var $arr2 = {0: 10, 'color': {'favorite': 'green', 0: 'blue'}}
	//   example 1: array_merge_recursive($arr1, $arr2)
	//   returns 1: {'color': {'favorite': {0: 'red', 1: 'green'}, 0: 'blue'}, 1: 5, 1: 10}
	//        test: skip-1
	const arrayMerge = phpjed.array_merge
	let idx = ''
	if (arr1 && Object.prototype.toString.call(arr1) === '[object Array]' && arr2 && Object
		.prototype.toString.call(arr2) === '[object Array]') {
		for (idx in arr2) {
			arr1.push(arr2[idx])
		}
	} else if ((arr1 && (arr1 instanceof Object)) && (arr2 && (arr2 instanceof Object))) {
		for (idx in arr2) {
			if (idx in arr1) {
				if (typeof arr1[idx] === 'object' && typeof arr2 === 'object') {
					arr1[idx] = arrayMerge(arr1[idx], arr2[idx])
				} else {
					arr1[idx] = arr2[idx]
				}
			} else {
				arr1[idx] = arr2[idx]
			}
		}
	}
	return arr1
}
phpjed.array_multisort = function(arr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_multisort/
	// original by: Theriault (https://github.com/Theriault)
	// improved by: Oleg Andreyev (https://github.com/oleg-andreyev)
	//   example 1: array_multisort([1, 2, 1, 2, 1, 2], [1, 2, 3, 4, 5, 6])
	//   returns 1: true
	//   example 2: var $characters = {A: 'Edward', B: 'Locke', C: 'Sabin', D: 'Terra', E: 'Edward'}
	//   example 2: var $jobs = {A: 'Warrior', B: 'Thief', C: 'Monk', D: 'Mage', E: 'Knight'}
	//   example 2: array_multisort($characters, 'SORT_DESC', 'SORT_STRING', $jobs, 'SORT_ASC', 'SORT_STRING')
	//   returns 2: true
	//   example 3: var $lastnames = [ 'Carter','Adams','Monroe','Tyler','Madison','Kennedy','Adams']
	//   example 3: var $firstnames = ['James', 'John' ,'James', 'John', 'James',  'John',   'John']
	//   example 3: var $president = [ 39, 6, 5, 10, 4, 35, 2 ]
	//   example 3: array_multisort($firstnames, 'SORT_DESC', 'SORT_STRING', $lastnames, 'SORT_ASC', 'SORT_STRING', $president, 'SORT_NUMERIC')
	//   returns 3: true
	//      note 1: flags: Translation table for sort arguments.
	//      note 1: Each argument turns on certain bits in the flag byte through addition.
	//      note 1: bits: HGFE DCBA
	//      note 1: args: Holds pointer to arguments for reassignment
	let g
	let i
	let j
	let k
	let l
	let sal
	let vkey
	let elIndex
	let lastSorts
	let tmpArray
	let zlast
	const sortFlag = [0]
	const thingsToSort = []
	let nLastSort = []
	let lastSort = []
	// possibly redundant
	const args = arguments
	const flags = {
		SORT_REGULAR: 16,
		SORT_NUMERIC: 17,
		SORT_STRING: 18,
		SORT_ASC: 32,
		SORT_DESC: 40
	}
	const sortDuplicator = function(a, b) {
		return nLastSort.shift()
	}
	const sortFunctions = [
		[
			function(a, b) {
				lastSort.push(a > b ? 1 : (a < b ? -1 : 0))
				return a > b ? 1 : (a < b ? -1 : 0)
			},
			function(a, b) {
				lastSort.push(b > a ? 1 : (b < a ? -1 : 0))
				return b > a ? 1 : (b < a ? -1 : 0)
			}
		],
		[
			function(a, b) {
				lastSort.push(a - b)
				return a - b
			},
			function(a, b) {
				lastSort.push(b - a)
				return b - a
			}
		],
		[
			function(a, b) {
				lastSort.push((a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0))
				return (a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0)
			},
			function(a, b) {
				lastSort.push((b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0))
				return (b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0)
			}
		]
	]
	const sortArrs = [
		[]
	]
	const sortKeys = [
		[]
	]
	// Store first argument into sortArrs and sortKeys if an Object.
	// First Argument should be either a Javascript Array or an Object,
	// otherwise function would return FALSE like in PHP
	if (Object.prototype.toString.call(arr) === '[object Array]') {
		sortArrs[0] = arr
	} else if (arr && typeof arr === 'object') {
		for (i in arr) {
			if (arr.hasOwnProperty(i)) {
				sortKeys[0].push(i)
				sortArrs[0].push(arr[i])
			}
		}
	} else {
		return false
	}
	// arrMainLength: Holds the length of the first array.
	// All other arrays must be of equal length, otherwise function would return FALSE like in PHP
	// sortComponents: Holds 2 indexes per every section of the array
	// that can be sorted. As this is the start, the whole array can be sorted.
	const arrMainLength = sortArrs[0].length
	let sortComponents = [0, arrMainLength]
	// Loop through all other arguments, checking lengths and sort flags
	// of arrays and adding them to the above variables.
	const argl = arguments.length
	for (j = 1; j < argl; j++) {
		if (Object.prototype.toString.call(arguments[j]) === '[object Array]') {
			sortArrs[j] = arguments[j]
			sortFlag[j] = 0
			if (arguments[j].length !== arrMainLength) {
				return false
			}
		} else if (arguments[j] && typeof arguments[j] === 'object') {
			sortKeys[j] = []
			sortArrs[j] = []
			sortFlag[j] = 0
			for (i in arguments[j]) {
				if (arguments[j].hasOwnProperty(i)) {
					sortKeys[j].push(i)
					sortArrs[j].push(arguments[j][i])
				}
			}
			if (sortArrs[j].length !== arrMainLength) {
				return false
			}
		} else if (typeof arguments[j] === 'string') {
			const lFlag = sortFlag.pop()
			// Keep extra parentheses around latter flags check
			// to avoid minimization leading to CDATA closer
			if (typeof flags[arguments[j]] === 'undefined' || ((((flags[arguments[j]]) >>> 4) &
					(lFlag >>> 4)) > 0)) {
				return false
			}
			sortFlag.push(lFlag + flags[arguments[j]])
		} else {
			return false
		}
	}
	for (i = 0; i !== arrMainLength; i++) {
		thingsToSort.push(true)
	}
	// Sort all the arrays....
	for (i in sortArrs) {
		if (sortArrs.hasOwnProperty(i)) {
			lastSorts = []
			tmpArray = []
			elIndex = 0
			nLastSort = []
			lastSort = []
			// If there are no sortComponents, then no more sorting is neeeded.
			// Copy the array back to the argument.
			if (sortComponents.length === 0) {
				if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
					args[i] = sortArrs[i]
				} else {
					for (k in arguments[i]) {
						if (arguments[i].hasOwnProperty(k)) {
							delete arguments[i][k]
						}
					}
					sal = sortArrs[i].length
					for (j = 0, vkey = 0; j < sal; j++) {
						vkey = sortKeys[i][j]
						args[i][vkey] = sortArrs[i][j]
					}
				}
				sortArrs.splice(i, 1)
				sortKeys.splice(i, 1)
				continue
			}
			// Sort function for sorting. Either sorts asc or desc, regular/string or numeric.
			let sFunction = sortFunctions[(sortFlag[i] & 3)][((sortFlag[i] & 8) > 0) ? 1 : 0]
			// Sort current array.
			for (l = 0; l !== sortComponents.length; l += 2) {
				tmpArray = sortArrs[i].slice(sortComponents[l], sortComponents[l + 1] + 1)
				tmpArray.sort(sFunction)
				// Is there a better way to copy an array in Javascript?
				lastSorts[l] = [].concat(lastSort)
				elIndex = sortComponents[l]
				for (g in tmpArray) {
					if (tmpArray.hasOwnProperty(g)) {
						sortArrs[i][elIndex] = tmpArray[g]
						elIndex++
					}
				}
			}
			// Duplicate the sorting of the current array on future arrays.
			sFunction = sortDuplicator
			for (j in sortArrs) {
				if (sortArrs.hasOwnProperty(j)) {
					if (sortArrs[j] === sortArrs[i]) {
						continue
					}
					for (l = 0; l !== sortComponents.length; l += 2) {
						tmpArray = sortArrs[j].slice(sortComponents[l], sortComponents[l + 1] +
							1)
						// alert(l + ':' + nLastSort);
						nLastSort = [].concat(lastSorts[l])
						tmpArray.sort(sFunction)
						elIndex = sortComponents[l]
						for (g in tmpArray) {
							if (tmpArray.hasOwnProperty(g)) {
								sortArrs[j][elIndex] = tmpArray[g]
								elIndex++
							}
						}
					}
				}
			}
			// Duplicate the sorting of the current array on array keys
			for (j in sortKeys) {
				if (sortKeys.hasOwnProperty(j)) {
					for (l = 0; l !== sortComponents.length; l += 2) {
						tmpArray = sortKeys[j].slice(sortComponents[l], sortComponents[l + 1] +
							1)
						nLastSort = [].concat(lastSorts[l])
						tmpArray.sort(sFunction)
						elIndex = sortComponents[l]
						for (g in tmpArray) {
							if (tmpArray.hasOwnProperty(g)) {
								sortKeys[j][elIndex] = tmpArray[g]
								elIndex++
							}
						}
					}
				}
			}
			// Generate the next sortComponents
			zlast = null
			sortComponents = []
			for (j in sortArrs[i]) {
				if (sortArrs[i].hasOwnProperty(j)) {
					if (!thingsToSort[j]) {
						if ((sortComponents.length & 1)) {
							sortComponents.push(j - 1)
						}
						zlast = null
						continue
					}
					if (!(sortComponents.length & 1)) {
						if (zlast !== null) {
							if (sortArrs[i][j] === zlast) {
								sortComponents.push(j - 1)
							} else {
								thingsToSort[j] = false
							}
						}
						zlast = sortArrs[i][j]
					} else {
						if (sortArrs[i][j] !== zlast) {
							sortComponents.push(j - 1)
							zlast = sortArrs[i][j]
						}
					}
				}
			}
			if (sortComponents.length & 1) {
				sortComponents.push(j)
			}
			if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
				args[i] = sortArrs[i]
			} else {
				for (j in arguments[i]) {
					if (arguments[i].hasOwnProperty(j)) {
						delete arguments[i][j]
					}
				}
				sal = sortArrs[i].length
				for (j = 0, vkey = 0; j < sal; j++) {
					vkey = sortKeys[i][j]
					args[i][vkey] = sortArrs[i][j]
				}
			}
			sortArrs.splice(i, 1)
			sortKeys.splice(i, 1)
		}
	}
	return true
}
phpjed.array_pad = function(input, padSize, padValue) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_pad/
	// original by: Waldo Malqui Silva (https://waldo.malqui.info)
	//   example 1: array_pad([ 7, 8, 9 ], 2, 'a')
	//   returns 1: [ 7, 8, 9]
	//   example 2: array_pad([ 7, 8, 9 ], 5, 'a')
	//   returns 2: [ 7, 8, 9, 'a', 'a']
	//   example 3: array_pad([ 7, 8, 9 ], 5, 2)
	//   returns 3: [ 7, 8, 9, 2, 2]
	//   example 4: array_pad([ 7, 8, 9 ], -5, 'a')
	//   returns 4: [ 'a', 'a', 7, 8, 9 ]
	let pad = []
	const newArray = []
	let newLength
	let diff = 0
	let i = 0
	if (Object.prototype.toString.call(input) === '[object Array]' && !isNaN(padSize)) {
		newLength = ((padSize < 0) ? (padSize * -1) : padSize)
		diff = newLength - input.length
		if (diff > 0) {
			for (i = 0; i < diff; i++) {
				newArray[i] = padValue
			}
			pad = ((padSize < 0) ? newArray.concat(input) : input.concat(newArray))
		} else {
			pad = input
		}
	}
	return pad
}
phpjed.array_pop = function(inputArr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_pop/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//    input by: Theriault (https://github.com/Theriault)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      note 1: While IE (and other browsers) support iterating an object's
	//      note 1: own properties in order, if one attempts to add back properties
	//      note 1: in IE, they may end up in their former position due to their position
	//      note 1: being retained. So use of this function with "associative arrays"
	//      note 1: (objects) may lead to unexpected behavior in an IE environment if
	//      note 1: you add back properties with the same keys that you removed
	//   example 1: array_pop([0,1,2])
	//   returns 1: 2
	//   example 2: var $data = {firstName: 'Kevin', surName: 'van Zonneveld'}
	//   example 2: var $lastElem = array_pop($data)
	//   example 2: var $result = $data
	//   returns 2: {firstName: 'Kevin'}
	let key = ''
	let lastKey = ''
	if (inputArr.hasOwnProperty('length')) {
		// Indexed
		if (!inputArr.length) {
			// Done popping, are we?
			return null
		}
		return inputArr.pop()
	} else {
		// Associative
		for (key in inputArr) {
			if (inputArr.hasOwnProperty(key)) {
				lastKey = key
			}
		}
		if (lastKey) {
			const tmp = inputArr[lastKey]
			delete(inputArr[lastKey])
			return tmp
		} else {
			return null
		}
	}
}
phpjed.array_product = function(input) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_product/
	// original by: Waldo Malqui Silva (https://waldo.malqui.info)
	//   example 1: array_product([ 2, 4, 6, 8 ])
	//   returns 1: 384
	let idx = 0
	let product = 1
	let il = 0
	if (Object.prototype.toString.call(input) !== '[object Array]') {
		return null
	}
	il = input.length
	while (idx < il) {
		product *= (!isNaN(input[idx]) ? input[idx] : 0)
		idx++
	}
	return product
}
phpjed.array_push = function(inputArr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_push/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Note also that IE retains information about property position even
	//      note 1: after being supposedly deleted, so if you delete properties and then
	//      note 1: add back properties with the same keys (including numeric) that had
	//      note 1: been deleted, the order will be as before; thus, this function is not
	//      note 1: really recommended with associative arrays (objects) in IE environments
	//   example 1: array_push(['kevin','van'], 'zonneveld')
	//   returns 1: 3
	let i = 0
	let pr = ''
	const argv = arguments
	const argc = argv.length
	const allDigits = /^\d$/
	let size = 0
	let highestIdx = 0
	let len = 0
	if (inputArr.hasOwnProperty('length')) {
		for (i = 1; i < argc; i++) {
			inputArr[inputArr.length] = argv[i]
		}
		return inputArr.length
	}
	// Associative (object)
	for (pr in inputArr) {
		if (inputArr.hasOwnProperty(pr)) {
			++len
			if (pr.search(allDigits) !== -1) {
				size = parseInt(pr, 10)
				highestIdx = size > highestIdx ? size : highestIdx
			}
		}
	}
	for (i = 1; i < argc; i++) {
		inputArr[++highestIdx] = argv[i]
	}
	return len + i - 1
}
phpjed.array_rand = function(array, num) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/array_rand/
	//      original by: Waldo Malqui Silva (https://waldo.malqui.info)
	// reimplemented by: Rafał Kukawski
	//        example 1: array_rand( ['Kevin'], 1 )
	//        returns 1: '0'
	// By using Object.keys we support both, arrays and objects
	// which phpjs wants to support
	const keys = Object.keys(array)
	if (typeof num === 'undefined' || num === null) {
		num = 1
	} else {
		num = +num
	}
	if (isNaN(num) || num < 1 || num > keys.length) {
		return null
	}
	// shuffle the array of keys
	for (let i = keys.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)) // 0 ≤ j ≤ i
		const tmp = keys[j]
		keys[j] = keys[i]
		keys[i] = tmp
	}
	return num === 1 ? keys[0] : keys.slice(0, num)
}
phpjed.array_reduce = function(aInput, callback) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_reduce/
	// original by: Alfonso Jimenez (https://www.alfonsojimenez.com)
	//      note 1: Takes a function as an argument, not a function's name
	//   example 1: array_reduce([1, 2, 3, 4, 5], function (v, w){v += w;return v;})
	//   returns 1: 15
	const lon = aInput.length
	let res = 0
	let i = 0
	let tmp = []
	for (i = 0; i < lon; i += 2) {
		tmp[0] = aInput[i]
		if (aInput[(i + 1)]) {
			tmp[1] = aInput[(i + 1)]
		} else {
			tmp[1] = 0
		}
		res += callback.apply(null, tmp)
		tmp = []
	}
	return res
}
phpjed.array_replace = function(arr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_replace/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_replace(["orange", "banana", "apple", "raspberry"], {0 : "pineapple", 4 : "cherry"}, {0:"grape"})
	//   returns 1: {0: 'grape', 1: 'banana', 2: 'apple', 3: 'raspberry', 4: 'cherry'}
	const retObj = {}
	let i = 0
	let p = ''
	const argl = arguments.length
	if (argl < 2) {
		throw new Error('There should be at least 2 arguments passed to array_replace()')
	}
	// Although docs state that the arguments are passed in by reference,
	// it seems they are not altered, but rather the copy that is returned
	// (just guessing), so we make a copy here, instead of acting on arr itself
	for (p in arr) {
		retObj[p] = arr[p]
	}
	for (i = 1; i < argl; i++) {
		for (p in arguments[i]) {
			retObj[p] = arguments[i][p]
		}
	}
	return retObj
}
phpjed.array_replace_recursive = function(arr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_replace_recursive/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_replace_recursive({'citrus' : ['orange'], 'berries' : ['blackberry', 'raspberry']}, {'citrus' : ['pineapple'], 'berries' : ['blueberry']})
	//   returns 1: {citrus : ['pineapple'], berries : ['blueberry', 'raspberry']}
	let i = 0
	let p = ''
	const argl = arguments.length
	let retObj
	if (argl < 2) {
		throw new Error(
			'There should be at least 2 arguments passed to array_replace_recursive()')
	}
	// Although docs state that the arguments are passed in by reference,
	// it seems they are not altered, but rather the copy that is returned
	// So we make a copy here, instead of acting on arr itself
	if (Object.prototype.toString.call(arr) === '[object Array]') {
		retObj = []
		for (p in arr) {
			retObj.push(arr[p])
		}
	} else {
		retObj = {}
		for (p in arr) {
			retObj[p] = arr[p]
		}
	}
	for (i = 1; i < argl; i++) {
		for (p in arguments[i]) {
			if (retObj[p] && typeof retObj[p] === 'object') {
				retObj[p] = array_replace_recursive(retObj[p], arguments[i][p])
			} else {
				retObj[p] = arguments[i][p]
			}
		}
	}
	return retObj
}
phpjed.array_reverse = function(array, preserveKeys) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_reverse/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Karol Kowalski
	//   example 1: array_reverse( [ 'php', '4.0', ['green', 'red'] ], true)
	//   returns 1: { 2: ['green', 'red'], 1: '4.0', 0: 'php'}
	const isArray = Object.prototype.toString.call(array) === '[object Array]'
	const tmpArr = preserveKeys ? {} : []
	let key
	if (isArray && !preserveKeys) {
		return array.slice(0).reverse()
	}
	if (preserveKeys) {
		const keys = []
		for (key in array) {
			keys.push(key)
		}
		let i = keys.length
		while (i--) {
			key = keys[i]
			// @todo: don't rely on browsers keeping keys in insertion order
			// it's implementation specific
			// eg. the result will differ from expected in Google Chrome
			tmpArr[key] = array[key]
		}
	} else {
		for (key in array) {
			tmpArr.unshift(array[key])
		}
	}
	return tmpArr
}
phpjed.array_search = function(needle, haystack, argStrict) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_search/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Reynier de la Rosa (https://scriptinside.blogspot.com.es/)
	//        test: skip-all
	//   example 1: array_search('zonneveld', {firstname: 'kevin', middle: 'van', surname: 'zonneveld'})
	//   returns 1: 'surname'
	//   example 2: array_search('3', {a: 3, b: 5, c: 7})
	//   returns 2: 'a'
	const strict = !!argStrict
	let key = ''
	if (typeof needle === 'object' && needle.exec) {
		// Duck-type for RegExp
		if (!strict) {
			// Let's consider case sensitive searches as strict
			const flags = 'i' + (needle.global ? 'g' : '') + (needle.multiline ? 'm' : '') +
				// sticky is FF only
				(needle.sticky ? 'y' : '')
			needle = new RegExp(needle.source, flags)
		}
		for (key in haystack) {
			if (haystack.hasOwnProperty(key)) {
				if (needle.test(haystack[key])) {
					return key
				}
			}
		}
		return false
	}
	for (key in haystack) {
		if (haystack.hasOwnProperty(key)) {
			if ((strict && haystack[key] === needle) || (!strict && haystack[key] ==
				needle)) { // eslint-disable-line eqeqeq
				return key
			}
		}
	}
	return false
}
phpjed.array_shift = function(inputArr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_shift/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Martijn Wieringa
	//      note 1: Currently does not handle objects
	//   example 1: array_shift(['Kevin', 'van', 'Zonneveld'])
	//   returns 1: 'Kevin'
	if (inputArr.length === 0) {
		return null
	}
	if (inputArr.length > 0) {
		return inputArr.shift()
	}
}
phpjed.array_slice = function(arr, offst, lgth, preserveKeys) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_slice/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      note 1: Relies on is_int because !isNaN accepts floats
	//   example 1: array_slice(["a", "b", "c", "d", "e"], 2, -1)
	//   returns 1: [ 'c', 'd' ]
	//   example 2: array_slice(["a", "b", "c", "d", "e"], 2, -1, true)
	//   returns 2: {2: 'c', 3: 'd'}
	const isInt = phpjed.is_int
	/*
	  if ('callee' in arr && 'length' in arr) {
	    arr = Array.prototype.slice.call(arr);
	  }
	*/
	let key = ''
	if (Object.prototype.toString.call(arr) !== '[object Array]' || (preserveKeys && offst !==
			0)) {
		// Assoc. array as input or if required as output
		let lgt = 0
		const newAssoc = {}
		for (key in arr) {
			lgt += 1
			newAssoc[key] = arr[key]
		}
		arr = newAssoc
		offst = (offst < 0) ? lgt + offst : offst
		lgth = lgth === undefined ? lgt : (lgth < 0) ? lgt + lgth - offst : lgth
		const assoc = {}
		let start = false
		let it = -1
		let arrlgth = 0
		let noPkIdx = 0
		for (key in arr) {
			++it
			if (arrlgth >= lgth) {
				break
			}
			if (it === offst) {
				start = true
			}
			if (!start) {
				continue
			}++arrlgth
			if (isInt(key) && !preserveKeys) {
				assoc[noPkIdx++] = arr[key]
			} else {
				assoc[key] = arr[key]
			}
		}
		// Make as array-like object (though length will not be dynamic)
		// assoc.length = arrlgth;
		return assoc
	}
	if (lgth === undefined) {
		return arr.slice(offst)
	} else if (lgth >= 0) {
		return arr.slice(offst, offst + lgth)
	} else {
		return arr.slice(offst, lgth)
	}
}
phpjed.array_splice = function(arr, offst, lgth, replacement) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_splice/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: Theriault (https://github.com/Theriault)
	//      note 1: Order does get shifted in associative array input with numeric indices,
	//      note 1: since PHP behavior doesn't preserve keys, but I understand order is
	//      note 1: not reliable anyways
	//      note 1: Note also that IE retains information about property position even
	//      note 1: after being supposedly deleted, so use of this function may produce
	//      note 1: unexpected results in IE if you later attempt to add back properties
	//      note 1: with the same keys that had been deleted
	//   example 1: var $input = {4: "red", 'abc': "green", 2: "blue", 'dud': "yellow"}
	//   example 1: array_splice($input, 2)
	//   returns 1: {4: "red", 'abc': "green"}
	//   example 2: var $input = ["red", "green", "blue", "yellow"]
	//   example 2: array_splice($input, 3, 0, "purple")
	//   returns 2: []
	//   example 3: var $input = ["red", "green", "blue", "yellow"]
	//   example 3: array_splice($input, -1, 1, ["black", "maroon"])
	//   returns 3: ["yellow"]
	//        test: skip-1
	const isInt = phpjed.is_int
	var _checkToUpIndices = function(arr, ct, key) {
		// Deal with situation, e.g., if encounter index 4 and try
		// to set it to 0, but 0 exists later in loop (need to
		// increment all subsequent (skipping current key,
		// since we need its value below) until find unused)
		if (arr[ct] !== undefined) {
			const tmp = ct
			ct += 1
			if (ct === key) {
				ct += 1
			}
			ct = _checkToUpIndices(arr, ct, key)
			arr[ct] = arr[tmp]
			delete arr[tmp]
		}
		return ct
	}
	if (replacement && typeof replacement !== 'object') {
		replacement = [replacement]
	}
	if (lgth === undefined) {
		lgth = offst >= 0 ? arr.length - offst : -offst
	} else if (lgth < 0) {
		lgth = (offst >= 0 ? arr.length - offst : -offst) + lgth
	}
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		/* if (arr.length !== undefined) {
		 // Deal with array-like objects as input
		delete arr.length;
		} */
		let lgt = 0
		let ct = -1
		const rmvd = []
		const rmvdObj = {}
		let replCt = -1
		let intCt = -1
		let returnArr = true
		let rmvdCt = 0
		// var rmvdLngth = 0
		let key = ''
		// rmvdObj.length = 0;
		for (key in arr) {
			// Can do arr.__count__ in some browsers
			lgt += 1
		}
		offst = (offst >= 0) ? offst : lgt + offst
		for (key in arr) {
			ct += 1
			if (ct < offst) {
				if (isInt(key)) {
					intCt += 1
					if (parseInt(key, 10) === intCt) {
						// Key is already numbered ok, so don't need to change key for value
						continue
					}
					// Deal with situation, e.g.,
					_checkToUpIndices(arr, intCt, key)
					// if encounter index 4 and try to set it to 0, but 0 exists later in loop
					arr[intCt] = arr[key]
					delete arr[key]
				}
				continue
			}
			if (returnArr && isInt(key)) {
				rmvd.push(arr[key])
				// PHP starts over here too
				rmvdObj[rmvdCt++] = arr[key]
			} else {
				rmvdObj[key] = arr[key]
				returnArr = false
			}
			// rmvdLngth += 1
			// rmvdObj.length += 1;
			if (replacement && replacement[++replCt]) {
				arr[key] = replacement[replCt]
			} else {
				delete arr[key]
			}
		}
		// Make (back) into an array-like object
		// arr.length = lgt - rmvdLngth + (replacement ? replacement.length : 0);
		return returnArr ? rmvd : rmvdObj
	}
	if (replacement) {
		replacement.unshift(offst, lgth)
		return Array.prototype.splice.apply(arr, replacement)
	}
	return arr.splice(offst, lgth)
}
phpjed.array_sum = function(array) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_sum/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Nate
	// bugfixed by: Gilbert
	// improved by: David Pilia (https://www.beteck.it/)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_sum([4, 9, 182.6])
	//   returns 1: 195.6
	//   example 2: var $total = []
	//   example 2: var $index = 0.1
	//   example 2: for (var $y = 0; $y < 12; $y++){ $total[$y] = $y + $index }
	//   example 2: array_sum($total)
	//   returns 2: 67.2
	let key
	let sum = 0
	// input sanitation
	if (typeof array !== 'object') {
		return null
	}
	for (key in array) {
		if (!isNaN(parseFloat(array[key]))) {
			sum += parseFloat(array[key])
		}
	}
	return sum
}
phpjed.array_udiff = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_udiff/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
	//   example 1: array_udiff($array1, $array2, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;})
	//   returns 1: {c: 'blue'}
	const retArr = {}
	const arglm1 = arguments.length - 1
	let cb = arguments[arglm1]
	let arr = ''
	let i = 1
	let k1 = ''
	let k = ''
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < arglm1; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (cb(arr[k], arr1[k1]) === 0) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_udiff_assoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_udiff_assoc/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_udiff_assoc({0: 'kevin', 1: 'van', 2: 'Zonneveld'}, {0: 'Kevin', 4: 'van', 5: 'Zonneveld'}, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;})
	//   returns 1: {1: 'van', 2: 'Zonneveld'}
	const retArr = {}
	const arglm1 = arguments.length - 1
	let cb = arguments[arglm1]
	let arr = {}
	let i = 1
	let k1 = ''
	let k = ''
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < arglm1; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (cb(arr[k], arr1[k1]) === 0 && k === k1) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_udiff_uassoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_udiff_uassoc/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
	//   example 1: array_udiff_uassoc($array1, $array2, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;}, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;})
	//   returns 1: {0: 'red', c: 'blue'}
	const retArr = {}
	const arglm1 = arguments.length - 1
	const arglm2 = arglm1 - 1
	let cb = arguments[arglm1]
	let cb0 = arguments[arglm2]
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	cb0 = (typeof cb0 === 'string') ? $global[cb0] : (Object.prototype.toString.call(cb0) ===
		'[object Array]') ? $global[cb0[0]][cb0[1]] : cb0
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		for (i = 1; i < arglm2; i++) {
			arr = arguments[i]
			for (k in arr) {
				if (cb0(arr[k], arr1[k1]) === 0 && cb(k, k1) === 0) {
					// If it reaches here, it was found in at least one array, so try next value
					continue arr1keys // eslint-disable-line no-labels
				}
			}
			retArr[k1] = arr1[k1]
		}
	}
	return retArr
}
phpjed.array_uintersect = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_uintersect/
	// original by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Demosthenes Koptsis
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
	//   example 1: array_uintersect($array1, $array2, function( f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;})
	//   returns 1: {a: 'green', b: 'brown', 0: 'red'}
	const retArr = {}
	const arglm1 = arguments.length - 1
	const arglm2 = arglm1 - 1
	let cb = arguments[arglm1]
	let k1 = ''
	let i = 1
	let arr = {}
	let k = ''
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		arrs: for (i = 1; i < arglm1; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (cb(arr[k], arr1[k1]) === 0) {
					if (i === arglm2) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_uintersect_uassoc = function(arr1) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_uintersect_uassoc/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
	//   example 1: var $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
	//   example 1: array_uintersect_uassoc($array1, $array2, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;}, function (f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if (string1 > string2) return 1; if (string1 === string2) return 0; return -1;})
	//   returns 1: {a: 'green', b: 'brown'}
	const retArr = {}
	const arglm1 = arguments.length - 1
	const arglm2 = arglm1 - 1
	let cb = arguments[arglm1]
	let cb0 = arguments[arglm2]
	let k1 = ''
	let i = 1
	let k = ''
	let arr = {}
	const $global = (typeof window !== 'undefined' ? window : global)
	cb = (typeof cb === 'string') ? $global[cb] : (Object.prototype.toString.call(cb) ===
		'[object Array]') ? $global[cb[0]][cb[1]] : cb
	cb0 = (typeof cb0 === 'string') ? $global[cb0] : (Object.prototype.toString.call(cb0) ===
		'[object Array]') ? $global[cb0[0]][cb0[1]] : cb0
	arr1keys: for (k1 in arr1) { // eslint-disable-line no-labels
		arrs: for (i = 1; i < arglm2; i++) { // eslint-disable-line no-labels
			arr = arguments[i]
			for (k in arr) {
				if (cb0(arr[k], arr1[k1]) === 0 && cb(k, k1) === 0) {
					if (i === arguments.length - 3) {
						retArr[k1] = arr1[k1]
					}
					// If the innermost loop always leads at least once to an equal value,
					// continue the loop until done
					continue arrs // eslint-disable-line no-labels
				}
			}
			// If it reaches here, it wasn't found in at least one array, so try next value
			continue arr1keys // eslint-disable-line no-labels
		}
	}
	return retArr
}
phpjed.array_unique = function(inputArr) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_unique/
	// original by: Carlos R. L. Rodrigues (https://www.jsfromhell.com)
	//    input by: duncan
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Nate
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// improved by: Michael Grier
	//      note 1: The second argument, sort_flags is not implemented;
	//      note 1: also should be sorted (asort?) first according to docs
	//   example 1: array_unique(['Kevin','Kevin','van','Zonneveld','Kevin'])
	//   returns 1: {0: 'Kevin', 2: 'van', 3: 'Zonneveld'}
	//   example 2: array_unique({'a': 'green', 0: 'red', 'b': 'green', 1: 'blue', 2: 'red'})
	//   returns 2: {a: 'green', 0: 'red', 1: 'blue'}
	let key = ''
	const tmpArr2 = {}
	let val = ''
	const _arraySearch = function(needle, haystack) {
		let fkey = ''
		for (fkey in haystack) {
			if (haystack.hasOwnProperty(fkey)) {
				if ((haystack[fkey] + '') === (needle + '')) {
					return fkey
				}
			}
		}
		return false
	}
	for (key in inputArr) {
		if (inputArr.hasOwnProperty(key)) {
			val = inputArr[key]
			if (_arraySearch(val, tmpArr2) === false) {
				tmpArr2[key] = val
			}
		}
	}
	return tmpArr2
}
phpjed.array_unshift = function(array) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_unshift/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Martijn Wieringa
	// improved by: jmweb
	//      note 1: Currently does not handle objects
	//   example 1: array_unshift(['van', 'Zonneveld'], 'Kevin')
	//   returns 1: 3
	let i = arguments.length
	while (--i !== 0) {
		arguments[0].unshift(arguments[i])
	}
	return arguments[0].length
}
phpjed.array_values = function(input) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_values/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: array_values( {firstname: 'Kevin', surname: 'van Zonneveld'} )
	//   returns 1: [ 'Kevin', 'van Zonneveld' ]
	const tmpArr = []
	let key = ''
	for (key in input) {
		tmpArr[tmpArr.length] = input[key]
	}
	return tmpArr
}
phpjed.array_walk = function(array, funcname, userdata) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/array_walk/
	// original by: Johnny Mast (https://www.phpvrouwen.nl)
	// bugfixed by: David
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Only works with user-defined functions, not built-in functions like void()
	//   example 1: array_walk ([3, 4], function () {}, 'userdata')
	//   returns 1: true
	//   example 2: array_walk ('mystring', function () {})
	//   returns 2: false
	//   example 3: array_walk ({"title":"my title"}, function () {})
	//   returns 3: true
	if (!array || typeof array !== 'object') {
		return false
	}
	try {
		if (typeof funcname === 'function') {
			for (const key in array) {
				if (arguments.length > 2) {
					funcname(array[key], key, userdata)
				} else {
					funcname(array[key], key)
				}
			}
		} else {
			return false
		}
	} catch (e) {
		return false
	}
	return true
}
phpjed.array_walk_recursive = function(array, funcname, userdata) { // eslint-disable-line camelcase
	// original by: Hugues Peccatte
	//      note 1: Only works with user-defined functions, not built-in functions like void()
	//   example 1: array_walk_recursive([3, 4], function () {}, 'userdata')
	//   returns 1: true
	//   example 2: array_walk_recursive([3, [4]], function () {}, 'userdata')
	//   returns 2: true
	//   example 3: array_walk_recursive([3, []], function () {}, 'userdata')
	//   returns 3: true
	if (!array || typeof array !== 'object') {
		return false
	}
	if (typeof funcname !== 'function') {
		return false
	}
	for (const key in array) {
		// apply "funcname" recursively only on arrays
		if (Object.prototype.toString.call(array[key]) === '[object Array]') {
			const funcArgs = [array[key], funcname]
			if (arguments.length > 2) {
				funcArgs.push(userdata)
			}
			if (array_walk_recursive.apply(null, funcArgs) === false) {
				return false
			}
			continue
		}
		try {
			if (arguments.length > 2) {
				funcname(array[key], key, userdata)
			} else {
				funcname(array[key], key)
			}
		} catch (e) {
			return false
		}
	}
	return true
}
phpjed.count = function(mixedVar, mode) {
	//  discuss at: https://locutus.io/php/count/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Waldo Malqui Silva (https://waldo.malqui.info)
	//    input by: merabi
	// bugfixed by: Soren Hansen
	// bugfixed by: Olivier Louvignes (https://mg-crea.com/)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: count([[0,0],[0,-4]], 'COUNT_RECURSIVE')
	//   returns 1: 6
	//   example 2: count({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE')
	//   returns 2: 6
	let key
	let cnt = 0
	if (mixedVar === null || typeof mixedVar === 'undefined') {
		return 0
	} else if (mixedVar.constructor !== Array && mixedVar.constructor !== Object) {
		return 1
	}
	if (mode === 'COUNT_RECURSIVE') {
		mode = 1
	}
	if (mode !== 1) {
		mode = 0
	}
	for (key in mixedVar) {
		if (mixedVar.hasOwnProperty(key)) {
			cnt++
			if (mode === 1 && mixedVar[key] && (mixedVar[key].constructor === Array || mixedVar[
					key].constructor === Object)) {
				cnt += count(mixedVar[key], 1)
			}
		}
	}
	return cnt
}
phpjed.current = function(arr) {
	//  discuss at: https://locutus.io/php/current/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: var $transport = ['foot', 'bike', 'car', 'plane']
	//   example 1: current($transport)
	//   returns 1: 'foot'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.pointers = $locutus.php.pointers || []
	const pointers = $locutus.php.pointers
	const indexOf = function(value) {
		for (let i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf
	}
	if (pointers.indexOf(arr) === -1) {
		pointers.push(arr, 0)
	}
	const arrpos = pointers.indexOf(arr)
	const cursor = pointers[arrpos + 1]
	if (Object.prototype.toString.call(arr) === '[object Array]') {
		return arr[cursor] || false
	}
	let ct = 0
	for (const k in arr) {
		if (ct === cursor) {
			return arr[k]
		}
		ct++
	}
	// Empty
	return false
}
phpjed.end = function(arr) {
	//  discuss at: https://locutus.io/php/end/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Legaev Andrey
	//  revised by: J A R
	//  revised by: Brett Zamir (https://brett-zamir.me)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: end({0: 'Kevin', 1: 'van', 2: 'Zonneveld'})
	//   returns 1: 'Zonneveld'
	//   example 2: end(['Kevin', 'van', 'Zonneveld'])
	//   returns 2: 'Zonneveld'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.pointers = $locutus.php.pointers || []
	const pointers = $locutus.php.pointers
	const indexOf = function(value) {
		for (let i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf
	}
	if (pointers.indexOf(arr) === -1) {
		pointers.push(arr, 0)
	}
	const arrpos = pointers.indexOf(arr)
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		let ct = 0
		let val
		for (const k in arr) {
			ct++
			val = arr[k]
		}
		if (ct === 0) {
			// Empty
			return false
		}
		pointers[arrpos + 1] = ct - 1
		return val
	}
	if (arr.length === 0) {
		return false
	}
	pointers[arrpos + 1] = arr.length - 1
	return arr[pointers[arrpos + 1]]
}
phpjed.in_array = function(needle, haystack, argStrict) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/in_array/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: vlado houba
	// improved by: Jonas Sciangula Street (Joni2Back)
	//    input by: Billy
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: in_array('van', ['Kevin', 'van', 'Zonneveld'])
	//   returns 1: true
	//   example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'})
	//   returns 2: false
	//   example 3: in_array(1, ['1', '2', '3'])
	//   example 3: in_array(1, ['1', '2', '3'], false)
	//   returns 3: true
	//   returns 3: true
	//   example 4: in_array(1, ['1', '2', '3'], true)
	//   returns 4: false
	let key = ''
	const strict = !!argStrict
	// we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] === ndl)
	// in just one for, in order to improve the performance
	// deciding wich type of comparation will do before walk array
	if (strict) {
		for (key in haystack) {
			if (haystack[key] === needle) {
				return true
			}
		}
	} else {
		for (key in haystack) {
			if (haystack[key] == needle) { // eslint-disable-line eqeqeq
				return true
			}
		}
	}
	return false
}
phpjed.key = function(arr) {
	//  discuss at: https://locutus.io/php/key/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: Riddler (https://www.frontierwebdev.com/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: var $array = {fruit1: 'apple', 'fruit2': 'orange'}
	//   example 1: key($array)
	//   returns 1: 'fruit1'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.pointers = $locutus.php.pointers || []
	const pointers = $locutus.php.pointers
	const indexOf = function(value) {
		for (let i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf
	}
	if (pointers.indexOf(arr) === -1) {
		pointers.push(arr, 0)
	}
	const cursor = pointers[pointers.indexOf(arr) + 1]
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		let ct = 0
		for (const k in arr) {
			if (ct === cursor) {
				return k
			}
			ct++
		}
		// Empty
		return false
	}
	if (arr.length === 0) {
		return false
	}
	return cursor
}
phpjed.krsort = function(inputArr, sortFlags) {
	//  discuss at: https://locutus.io/php/krsort/
	// original by: GeekFG (https://geekfg.blogspot.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: pseudaria (https://github.com/pseudaria)
	//      note 1: The examples are correct, this is a new way
	//      note 1: This function deviates from PHP in returning a copy of the array instead
	//      note 1: of acting by reference and returning true; this was necessary because
	//      note 1: IE does not allow deleting and re-adding of properties without caching
	//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
	//      note 1: get the PHP behavior, but use this only if you are in an environment
	//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
	//      note 1: property deletion is supported. Note that we intend to implement the PHP
	//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
	//      note 1: is by reference in PHP anyways
	//      note 1: Since JS objects' keys are always strings, and (the
	//      note 1: default) SORT_REGULAR flag distinguishes by key type,
	//      note 1: if the content is a numeric string, we treat the
	//      note 1: "original type" as numeric.
	//   example 1: var $data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'}
	//   example 1: krsort($data)
	//   example 1: var $result = $data
	//   returns 1: {d: 'lemon', c: 'apple', b: 'banana', a: 'orange'}
	//   example 2: ini_set('locutus.sortByReference', true)
	//   example 2: var $data = {2: 'van', 3: 'Zonneveld', 1: 'Kevin'}
	//   example 2: krsort($data)
	//   example 2: var $result = $data
	//   returns 2: {3: 'Zonneveld', 2: 'van', 1: 'Kevin'}
	const i18nlgd = phpjed.i18n_loc_get_default
	const strnatcmp = phpjed.strnatcmp
	const tmpArr = {}
	const keys = []
	let sorter
	let i
	let k
	let sortByReference = false
	let populateArr = {}
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.locales = $locutus.php.locales || {}
	switch (sortFlags) {
		case 'SORT_STRING':
			// compare items as strings
			sorter = function(a, b) {
				return strnatcmp(b, a)
			}
			break
		case 'SORT_LOCALE_STRING':
			// compare items as strings, based on the current locale
			// (set with i18n_loc_set_default() as of PHP6)
			var loc = i18nlgd()
			sorter = $locutus.locales[loc].sorting
			break
		case 'SORT_NUMERIC':
			// compare items numerically
			sorter = function(a, b) {
				return (b - a)
			}
			break
		case 'SORT_REGULAR':
		default:
			// compare items normally (don't change types)
			sorter = function(b, a) {
				const aFloat = parseFloat(a)
				const bFloat = parseFloat(b)
				const aNumeric = aFloat + '' === a
				const bNumeric = bFloat + '' === b
				if (aNumeric && bNumeric) {
					return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0
				} else if (aNumeric && !bNumeric) {
					return 1
				} else if (!aNumeric && bNumeric) {
					return -1
				}
				return a > b ? 1 : a < b ? -1 : 0
			}
			break
	}
	// Make a list of key names
	for (k in inputArr) {
		if (inputArr.hasOwnProperty(k)) {
			keys.push(k)
		}
	}
	keys.sort(sorter)
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	// Rebuild array with sorted key names
	for (i = 0; i < keys.length; i++) {
		k = keys[i]
		tmpArr[k] = inputArr[k]
		if (sortByReference) {
			delete inputArr[k]
		}
	}
	for (i in tmpArr) {
		if (tmpArr.hasOwnProperty(i)) {
			populateArr[i] = tmpArr[i]
		}
	}
	return sortByReference || populateArr
}
phpjed.natcasesort = function(inputArr) {
	//  discuss at: https://locutus.io/php/natcasesort/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	//      note 1: This function deviates from PHP in returning a copy of the array instead
	//      note 1: of acting by reference and returning true; this was necessary because
	//      note 1: IE does not allow deleting and re-adding of properties without caching
	//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
	//      note 1: get the PHP behavior, but use this only if you are in an environment
	//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
	//      note 1: property deletion is supported. Note that we intend to implement the PHP
	//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
	//      note 1: is by reference in PHP anyways
	//      note 1: We cannot use numbers as keys and have them be reordered since they
	//      note 1: adhere to numerical order in some implementations
	//   example 1: var $array1 = {a:'IMG0.png', b:'img12.png', c:'img10.png', d:'img2.png', e:'img1.png', f:'IMG3.png'}
	//   example 1: natcasesort($array1)
	//   example 1: var $result = $array1
	//   returns 1: {a: 'IMG0.png', e: 'img1.png', d: 'img2.png', f: 'IMG3.png', c: 'img10.png', b: 'img12.png'}
	const strnatcasecmp = phpjed.strnatcasecmp
	const valArr = []
	let k
	let i
	let sortByReference = false
	let populateArr = {}
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	// Get key and value arrays
	for (k in inputArr) {
		if (inputArr.hasOwnProperty(k)) {
			valArr.push([k, inputArr[k]])
			if (sortByReference) {
				delete inputArr[k]
			}
		}
	}
	valArr.sort(function(a, b) {
		return strnatcasecmp(a[1], b[1])
	})
	// Repopulate the old array
	for (i = 0; i < valArr.length; i++) {
		populateArr[valArr[i][0]] = valArr[i][1]
	}
	return sortByReference || populateArr
}
phpjed.natsort = function(inputArr) {
	//  discuss at: https://locutus.io/php/natsort/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	//      note 1: This function deviates from PHP in returning a copy of the array instead
	//      note 1: of acting by reference and returning true; this was necessary because
	//      note 1: IE does not allow deleting and re-adding of properties without caching
	//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
	//      note 1: get the PHP behavior, but use this only if you are in an environment
	//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
	//      note 1: property deletion is supported. Note that we intend to implement the PHP
	//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
	//      note 1: is by reference in PHP anyways
	//   example 1: var $array1 = {a:"img12.png", b:"img10.png", c:"img2.png", d:"img1.png"}
	//   example 1: natsort($array1)
	//   example 1: var $result = $array1
	//   returns 1: {d: 'img1.png', c: 'img2.png', b: 'img10.png', a: 'img12.png'}
	const strnatcmp = phpjed.strnatcmp
	const valArr = []
	let k
	let i
	let sortByReference = false
	let populateArr = {}
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	// Get key and value arrays
	for (k in inputArr) {
		if (inputArr.hasOwnProperty(k)) {
			valArr.push([k, inputArr[k]])
			if (sortByReference) {
				delete inputArr[k]
			}
		}
	}
	valArr.sort(function(a, b) {
		return strnatcmp(a[1], b[1])
	})
	// Repopulate the old array
	for (i = 0; i < valArr.length; i++) {
		populateArr[valArr[i][0]] = valArr[i][1]
	}
	return sortByReference || populateArr
}
phpjed.next = function(arr) {
	//  discuss at: https://locutus.io/php/next/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: var $transport = ['foot', 'bike', 'car', 'plane']
	//   example 1: next($transport)
	//   example 1: next($transport)
	//   returns 1: 'car'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.pointers = $locutus.php.pointers || []
	const pointers = $locutus.php.pointers
	const indexOf = function(value) {
		for (let i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf
	}
	if (pointers.indexOf(arr) === -1) {
		pointers.push(arr, 0)
	}
	const arrpos = pointers.indexOf(arr)
	const cursor = pointers[arrpos + 1]
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		let ct = 0
		for (const k in arr) {
			if (ct === cursor + 1) {
				pointers[arrpos + 1] += 1
				return arr[k]
			}
			ct++
		}
		// End
		return false
	}
	if (arr.length === 0 || cursor === (arr.length - 1)) {
		return false
	}
	pointers[arrpos + 1] += 1
	return arr[pointers[arrpos + 1]]
}
phpjed.pos = function(arr) {
	//  discuss at: https://locutus.io/php/pos/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: var $transport = ['foot', 'bike', 'car', 'plane']
	//   example 1: pos($transport)
	//   returns 1: 'foot'
	const current = phpjed.current
	return current(arr)
}
phpjed.prev = function(arr) {
	//  discuss at: https://locutus.io/php/prev/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: var $transport = ['foot', 'bike', 'car', 'plane']
	//   example 1: prev($transport)
	//   returns 1: false
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.pointers = $locutus.php.pointers || []
	const pointers = $locutus.php.pointers
	const indexOf = function(value) {
		for (let i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf
	}
	const arrpos = pointers.indexOf(arr)
	const cursor = pointers[arrpos + 1]
	if (pointers.indexOf(arr) === -1 || cursor === 0) {
		return false
	}
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		let ct = 0
		for (const k in arr) {
			if (ct === cursor - 1) {
				pointers[arrpos + 1] -= 1
				return arr[k]
			}
			ct++
		}
		// Shouldn't reach here
	}
	if (arr.length === 0) {
		return false
	}
	pointers[arrpos + 1] -= 1
	return arr[pointers[arrpos + 1]]
}
phpjed.range = function(low, high, step) {
	//  discuss at: https://locutus.io/php/range/
	// original by: Waldo Malqui Silva (https://waldo.malqui.info)
	//   example 1: range ( 0, 12 )
	//   returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	//   example 2: range( 0, 100, 10 )
	//   returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
	//   example 3: range( 'a', 'i' )
	//   returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
	//   example 4: range( 'c', 'a' )
	//   returns 4: ['c', 'b', 'a']
	const matrix = []
	let iVal
	let endval
	let plus
	const walker = step || 1
	let chars = false
	if (!isNaN(low) && !isNaN(high)) {
		iVal = low
		endval = high
	} else if (isNaN(low) && isNaN(high)) {
		chars = true
		iVal = low.charCodeAt(0)
		endval = high.charCodeAt(0)
	} else {
		iVal = (isNaN(low) ? 0 : low)
		endval = (isNaN(high) ? 0 : high)
	}
	plus = !(iVal > endval)
	if (plus) {
		while (iVal <= endval) {
			matrix.push(((chars) ? String.fromCharCode(iVal) : iVal))
			iVal += walker
		}
	} else {
		while (iVal >= endval) {
			matrix.push(((chars) ? String.fromCharCode(iVal) : iVal))
			iVal -= walker
		}
	}
	return matrix
}
phpjed.reset = function(arr) {
	//  discuss at: https://locutus.io/php/reset/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Legaev Andrey
	//  revised by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Uses global: locutus to store the array pointer
	//   example 1: reset({0: 'Kevin', 1: 'van', 2: 'Zonneveld'})
	//   returns 1: 'Kevin'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.pointers = $locutus.php.pointers || []
	const pointers = $locutus.php.pointers
	const indexOf = function(value) {
		for (let i = 0, length = this.length; i < length; i++) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
	if (!pointers.indexOf) {
		pointers.indexOf = indexOf
	}
	if (pointers.indexOf(arr) === -1) {
		pointers.push(arr, 0)
	}
	const arrpos = pointers.indexOf(arr)
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		for (const k in arr) {
			if (pointers.indexOf(arr) === -1) {
				pointers.push(arr, 0)
			} else {
				pointers[arrpos + 1] = 0
			}
			return arr[k]
		}
		// Empty
		return false
	}
	if (arr.length === 0) {
		return false
	}
	pointers[arrpos + 1] = 0
	return arr[pointers[arrpos + 1]]
}
phpjed.shuffle = function(inputArr) {
	//  discuss at: https://locutus.io/php/shuffle/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	//  revised by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $data = {5:'a', 2:'3', 3:'c', 4:5, 'q':5}
	//   example 1: ini_set('locutus.sortByReference', true)
	//   example 1: shuffle($data)
	//   example 1: var $result = $data.q
	//   returns 1: 5
	const valArr = []
	let k = ''
	let i = 0
	let sortByReference = false
	let populateArr = []
	for (k in inputArr) {
		// Get key and value arrays
		if (inputArr.hasOwnProperty(k)) {
			valArr.push(inputArr[k])
			if (sortByReference) {
				delete inputArr[k]
			}
		}
	}
	valArr.sort(function() {
		return 0.5 - Math.random()
	})
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	for (i = 0; i < valArr.length; i++) {
		// Repopulate the old array
		populateArr[i] = valArr[i]
	}
	return sortByReference || populateArr
}
phpjed.sizeof = function(mixedVar, mode) {
	//  discuss at: https://locutus.io/php/sizeof/
	// original by: Philip Peterson
	//   example 1: sizeof([[0,0],[0,-4]], 'COUNT_RECURSIVE')
	//   returns 1: 6
	//   example 2: sizeof({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE')
	//   returns 2: 6
	const count = phpjed.count
	return count(mixedVar, mode)
}
phpjed.uasort = function(inputArr, sorter) {
	//  discuss at: https://locutus.io/php/uasort/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	//      note 1: This function deviates from PHP in returning a copy of the array instead
	//      note 1: of acting by reference and returning true; this was necessary because
	//      note 1: IE does not allow deleting and re-adding of properties without caching
	//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
	//      note 1: get the PHP behavior, but use this only if you are in an environment
	//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
	//      note 1: property deletion is supported. Note that we intend to implement the PHP
	//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
	//      note 1: is by reference in PHP anyways
	//   example 1: var $sorter = function (a, b) { if (a > b) {return 1;}if (a < b) {return -1;} return 0;}
	//   example 1: var $fruits = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'}
	//   example 1: uasort($fruits, $sorter)
	//   example 1: var $result = $fruits
	//   returns 1: {c: 'apple', b: 'banana', d: 'lemon', a: 'orange'}
	const valArr = []
	let k = ''
	let i = 0
	let sortByReference = false
	let populateArr = {}
	if (typeof sorter === 'string') {
		sorter = this[sorter]
	} else if (Object.prototype.toString.call(sorter) === '[object Array]') {
		sorter = this[sorter[0]][sorter[1]]
	}
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	for (k in inputArr) {
		// Get key and value arrays
		if (inputArr.hasOwnProperty(k)) {
			valArr.push([k, inputArr[k]])
			if (sortByReference) {
				delete inputArr[k]
			}
		}
	}
	valArr.sort(function(a, b) {
		return sorter(a[1], b[1])
	})
	for (i = 0; i < valArr.length; i++) {
		// Repopulate the old array
		populateArr[valArr[i][0]] = valArr[i][1]
	}
	return sortByReference || populateArr
}
phpjed.uksort = function(inputArr, sorter) {
	//  discuss at: https://locutus.io/php/uksort/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: The examples are correct, this is a new way
	//      note 1: This function deviates from PHP in returning a copy of the array instead
	//      note 1: of acting by reference and returning true; this was necessary because
	//      note 1: IE does not allow deleting and re-adding of properties without caching
	//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
	//      note 1: get the PHP behavior, but use this only if you are in an environment
	//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
	//      note 1: property deletion is supported. Note that we intend to implement the PHP
	//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
	//      note 1: is by reference in PHP anyways
	//   example 1: var $data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'}
	//   example 1: uksort($data, function (key1, key2){ return (key1 === key2 ? 0 : (key1 > key2 ? 1 : -1)); })
	//   example 1: var $result = $data
	//   returns 1: {a: 'orange', b: 'banana', c: 'apple', d: 'lemon'}
	const tmpArr = {}
	const keys = []
	let i = 0
	let k = ''
	let sortByReference = false
	let populateArr = {}
	if (typeof sorter === 'string') {
		sorter = this.window[sorter]
	}
	// Make a list of key names
	for (k in inputArr) {
		if (inputArr.hasOwnProperty(k)) {
			keys.push(k)
		}
	}
	// Sort key names
	try {
		if (sorter) {
			keys.sort(sorter)
		} else {
			keys.sort()
		}
	} catch (e) {
		return false
	}
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	// Rebuild array with sorted key names
	for (i = 0; i < keys.length; i++) {
		k = keys[i]
		tmpArr[k] = inputArr[k]
		if (sortByReference) {
			delete inputArr[k]
		}
	}
	for (i in tmpArr) {
		if (tmpArr.hasOwnProperty(i)) {
			populateArr[i] = tmpArr[i]
		}
	}
	return sortByReference || populateArr
}
phpjed.usort = function(inputArr, sorter) {
	//  discuss at: https://locutus.io/php/usort/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: This function deviates from PHP in returning a copy of the array instead
	//      note 1: of acting by reference and returning true; this was necessary because
	//      note 1: IE does not allow deleting and re-adding of properties without caching
	//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
	//      note 1: get the PHP behavior, but use this only if you are in an environment
	//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
	//      note 1: property deletion is supported. Note that we intend to implement the PHP
	//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
	//      note 1: is by reference in PHP anyways
	//   example 1: var $stuff = {d: '3', a: '1', b: '11', c: '4'}
	//   example 1: usort($stuff, function (a, b) { return (a - b) })
	//   example 1: var $result = $stuff
	//   returns 1: {0: '1', 1: '3', 2: '4', 3: '11'}
	const valArr = []
	let k = ''
	let i = 0
	let sortByReference = false
	let populateArr = {}
	if (typeof sorter === 'string') {
		sorter = this[sorter]
	} else if (Object.prototype.toString.call(sorter) === '[object Array]') {
		sorter = this[sorter[0]][sorter[1]]
	}
	const iniVal = phpjed.ini_get('locutus.sortByReference') || 'on'
	sortByReference = iniVal === 'on'
	populateArr = sortByReference ? inputArr : populateArr
	for (k in inputArr) {
		// Get key and value arrays
		if (inputArr.hasOwnProperty(k)) {
			valArr.push(inputArr[k])
			if (sortByReference) {
				delete inputArr[k]
			}
		}
	}
	try {
		valArr.sort(sorter)
	} catch (e) {
		return false
	}
	for (i = 0; i < valArr.length; i++) {
		// Repopulate the old array
		populateArr[i] = valArr[i]
	}
	return sortByReference || populateArr
}
phpjed.ctype_alnum = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_alnum/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_alnum('AbC12')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.an) !== -1
}
phpjed.ctype_alpha = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_alpha/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_alpha('Az')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.al) !== -1
}
phpjed.ctype_cntrl = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_cntrl/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_cntrl('\u0020')
	//   returns 1: false
	//   example 2: ctype_cntrl('\u001F')
	//   returns 2: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.ct) !== -1
}
phpjed.ctype_digit = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_digit/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_digit('150')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.dg) !== -1
}
phpjed.ctype_graph = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_graph/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_graph('!%')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.gr) !== -1
}
phpjed.ctype_lower = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_lower/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_lower('abc')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.lw) !== -1
}
phpjed.ctype_print = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_print/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_print('AbC!#12')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.pr) !== -1
}
phpjed.ctype_punct = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_punct/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_punct('!?')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.pu) !== -1
}
phpjed.ctype_space = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_space/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_space('\t\n')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.sp) !== -1
}
phpjed.ctype_upper = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_upper/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_upper('AZ')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.up) !== -1
}
phpjed.ctype_xdigit = function(text) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ctype_xdigit/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ctype_xdigit('01dF')
	//   returns 1: true
	const setlocale = phpjed.setlocale
	if (typeof text !== 'string') {
		return false
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const p = $locutus.php
	return text.search(p.locales[p.localeCategories.LC_CTYPE].LC_CTYPE.xd) !== -1
}
phpjed.checkdate = function(m, d, y) {
	//  discuss at: https://locutus.io/php/checkdate/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Pyerre
	// improved by: Theriault (https://github.com/Theriault)
	//   example 1: checkdate(12, 31, 2000)
	//   returns 1: true
	//   example 2: checkdate(2, 29, 2001)
	//   returns 2: false
	//   example 3: checkdate(3, 31, 2008)
	//   returns 3: true
	//   example 4: checkdate(1, 390, 2000)
	//   returns 4: false
	return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate()
}
phpjed.date = function(format, timestamp) {
	//  discuss at: https://locutus.io/php/date/
	// original by: Carlos R. L. Rodrigues (https://www.jsfromhell.com)
	// original by: gettimeofday
	//    parts by: Peter-Paul Koch (https://www.quirksmode.org/js/beat.html)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: MeEtc (https://yass.meetcweb.com)
	// improved by: Brad Touesnard
	// improved by: Tim Wiel
	// improved by: Bryan Elliott
	// improved by: David Randall
	// improved by: Theriault (https://github.com/Theriault)
	// improved by: Theriault (https://github.com/Theriault)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	// improved by: Thomas Beaucourt (https://www.webapp.fr)
	// improved by: JT
	// improved by: Theriault (https://github.com/Theriault)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	// improved by: Theriault (https://github.com/Theriault)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//    input by: majak
	//    input by: Alex
	//    input by: Martin
	//    input by: Alex Wilson
	//    input by: Haravikk
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: majak
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: omid (https://locutus.io/php/380:380#comment_137122)
	// bugfixed by: Chris (https://www.devotis.nl/)
	//      note 1: Uses global: locutus to store the default timezone
	//      note 1: Although the function potentially allows timezone info
	//      note 1: (see notes), it currently does not set
	//      note 1: per a timezone specified by date_default_timezone_set(). Implementers might use
	//      note 1: $locutus.currentTimezoneOffset and
	//      note 1: $locutus.currentTimezoneDST set by that function
	//      note 1: in order to adjust the dates in this function
	//      note 1: (or our other date functions!) accordingly
	//   example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400)
	//   returns 1: '07:09:40 m is month'
	//   example 2: date('F j, Y, g:i a', 1062462400)
	//   returns 2: 'September 2, 2003, 12:26 am'
	//   example 3: date('Y W o', 1062462400)
	//   returns 3: '2003 36 2003'
	//   example 4: var $x = date('Y m d', (new Date()).getTime() / 1000)
	//   example 4: $x = $x + ''
	//   example 4: var $result = $x.length // 2009 01 09
	//   returns 4: 10
	//   example 5: date('W', 1104534000)
	//   returns 5: '52'
	//   example 6: date('B t', 1104534000)
	//   returns 6: '999 31'
	//   example 7: date('W U', 1293750000.82); // 2010-12-31
	//   returns 7: '52 1293750000'
	//   example 8: date('W', 1293836400); // 2011-01-01
	//   returns 8: '52'
	//   example 9: date('W Y-m-d', 1293974054); // 2011-01-02
	//   returns 9: '52 2011-01-02'
	//        test: skip-1 skip-2 skip-5
	let jsdate, f
	// Keep this here (works, but for code commented-out below for file size reasons)
	// var tal= [];
	const txtWords = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur', 'January',
		'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
		'October', 'November', 'December'
	]
	// trailing backslash -> (dropped)
	// a backslash followed by any character (including backslash) -> the character
	// empty string -> empty string
	const formatChr = /\\?(.?)/gi
	const formatChrCb = function(t, s) {
		return f[t] ? f[t]() : s
	}
	const _pad = function(n, c) {
		n = String(n)
		while (n.length < c) {
			n = '0' + n
		}
		return n
	}
	f = {
		// Day
		d: function() {
			// Day of month w/leading 0; 01..31
			return _pad(f.j(), 2)
		},
		D: function() {
			// Shorthand day name; Mon...Sun
			return f.l().slice(0, 3)
		},
		j: function() {
			// Day of month; 1..31
			return jsdate.getDate()
		},
		l: function() {
			// Full day name; Monday...Sunday
			return txtWords[f.w()] + 'day'
		},
		N: function() {
			// ISO-8601 day of week; 1[Mon]..7[Sun]
			return f.w() || 7
		},
		S: function() {
			// Ordinal suffix for day of month; st, nd, rd, th
			const j = f.j()
			let i = j % 10
			if (i <= 3 && parseInt((j % 100) / 10, 10) === 1) {
				i = 0
			}
			return ['st', 'nd', 'rd'][i - 1] || 'th'
		},
		w: function() {
			// Day of week; 0[Sun]..6[Sat]
			return jsdate.getDay()
		},
		z: function() {
			// Day of year; 0..365
			const a = new Date(f.Y(), f.n() - 1, f.j())
			const b = new Date(f.Y(), 0, 1)
			return Math.round((a - b) / 864e5)
		},
		// Week
		W: function() {
			// ISO-8601 week number
			const a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3)
			const b = new Date(a.getFullYear(), 0, 4)
			return _pad(1 + Math.round((a - b) / 864e5 / 7), 2)
		},
		// Month
		F: function() {
			// Full month name; January...December
			return txtWords[6 + f.n()]
		},
		m: function() {
			// Month w/leading 0; 01...12
			return _pad(f.n(), 2)
		},
		M: function() {
			// Shorthand month name; Jan...Dec
			return f.F().slice(0, 3)
		},
		n: function() {
			// Month; 1...12
			return jsdate.getMonth() + 1
		},
		t: function() {
			// Days in month; 28...31
			return (new Date(f.Y(), f.n(), 0)).getDate()
		},
		// Year
		L: function() {
			// Is leap year?; 0 or 1
			const j = f.Y()
			return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0
		},
		o: function() {
			// ISO-8601 year
			const n = f.n()
			const W = f.W()
			const Y = f.Y()
			return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0)
		},
		Y: function() {
			// Full year; e.g. 1980...2010
			return jsdate.getFullYear()
		},
		y: function() {
			// Last two digits of year; 00...99
			return f.Y().toString().slice(-2)
		},
		// Time
		a: function() {
			// am or pm
			return jsdate.getHours() > 11 ? 'pm' : 'am'
		},
		A: function() {
			// AM or PM
			return f.a().toUpperCase()
		},
		B: function() {
			// Swatch Internet time; 000..999
			const H = jsdate.getUTCHours() * 36e2
			// Hours
			const i = jsdate.getUTCMinutes() * 60
			// Minutes
			// Seconds
			const s = jsdate.getUTCSeconds()
			return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3)
		},
		g: function() {
			// 12-Hours; 1..12
			return f.G() % 12 || 12
		},
		G: function() {
			// 24-Hours; 0..23
			return jsdate.getHours()
		},
		h: function() {
			// 12-Hours w/leading 0; 01..12
			return _pad(f.g(), 2)
		},
		H: function() {
			// 24-Hours w/leading 0; 00..23
			return _pad(f.G(), 2)
		},
		i: function() {
			// Minutes w/leading 0; 00..59
			return _pad(jsdate.getMinutes(), 2)
		},
		s: function() {
			// Seconds w/leading 0; 00..59
			return _pad(jsdate.getSeconds(), 2)
		},
		u: function() {
			// Microseconds; 000000-999000
			return _pad(jsdate.getMilliseconds() * 1000, 6)
		},
		// Timezone
		e: function() {
			// Timezone identifier; e.g. Atlantic/Azores, ...
			// The following works, but requires inclusion of the very large
			// timezone_abbreviations_list() function.
			/*              return that.date_default_timezone_get();
			 */
			const msg =
				'Not supported (see source code of date() for timezone on how to add support)'
			throw new Error(msg)
		},
		I: function() {
			// DST observed?; 0 or 1
			// Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
			// If they are not equal, then DST is observed.
			const a = new Date(f.Y(), 0)
			// Jan 1
			const c = Date.UTC(f.Y(), 0)
			// Jan 1 UTC
			const b = new Date(f.Y(), 6)
			// Jul 1
			// Jul 1 UTC
			const d = Date.UTC(f.Y(), 6)
			return ((a - c) !== (b - d)) ? 1 : 0
		},
		O: function() {
			// Difference to GMT in hour format; e.g. +0200
			const tzo = jsdate.getTimezoneOffset()
			const a = Math.abs(tzo)
			return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4)
		},
		P: function() {
			// Difference to GMT w/colon; e.g. +02:00
			const O = f.O()
			return (O.substr(0, 3) + ':' + O.substr(3, 2))
		},
		T: function() {
			// The following works, but requires inclusion of the very
			// large timezone_abbreviations_list() function.
			/*              var abbr, i, os, _default;
			if (!tal.length) {
			  tal = that.timezone_abbreviations_list();
			}
			if ($locutus && $locutus.default_timezone) {
			  _default = $locutus.default_timezone;
			  for (abbr in tal) {
			    for (i = 0; i < tal[abbr].length; i++) {
			      if (tal[abbr][i].timezone_id === _default) {
			        return abbr.toUpperCase();
			      }
			    }
			  }
			}
			for (abbr in tal) {
			  for (i = 0; i < tal[abbr].length; i++) {
			    os = -jsdate.getTimezoneOffset() * 60;
			    if (tal[abbr][i].offset === os) {
			      return abbr.toUpperCase();
			    }
			  }
			}
			*/
			return 'UTC'
		},
		Z: function() {
			// Timezone offset in seconds (-43200...50400)
			return -jsdate.getTimezoneOffset() * 60
		},
		// Full Date/Time
		c: function() {
			// ISO-8601 date.
			return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb)
		},
		r: function() {
			// RFC 2822
			return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb)
		},
		U: function() {
			// Seconds since UNIX epoch
			return jsdate / 1000 | 0
		}
	}
	const _date = function(format, timestamp) {
		jsdate = (timestamp === undefined ? new Date() // Not provided
			: (timestamp instanceof Date) ? new Date(timestamp) // JS Date()
			: new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
		)
		return format.replace(formatChr, formatChrCb)
	}
	return _date(format, timestamp)
}
phpjed.date_parse = function(date) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/date_parse/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: date_parse('2006-12-12 10:00:00')
	//   returns 1: {year : 2006, month: 12, day: 12, hour: 10, minute: 0, second: 0, fraction: 0, is_localtime: false}
	const strtotime = phpjed.strtotime
	let ts
	try {
		ts = strtotime(date)
	} catch (e) {
		ts = false
	}
	if (!ts) {
		return false
	}
	const dt = new Date(ts * 1000)
	const retObj = {}
	retObj.year = dt.getFullYear()
	retObj.month = dt.getMonth() + 1
	retObj.day = dt.getDate()
	retObj.hour = dt.getHours()
	retObj.minute = dt.getMinutes()
	retObj.second = dt.getSeconds()
	retObj.fraction = parseFloat('0.' + dt.getMilliseconds())
	retObj.is_localtime = dt.getTimezoneOffset() !== 0
	return retObj
}
phpjed.getdate = function(timestamp) {
	//  discuss at: https://locutus.io/php/getdate/
	// original by: Paulo Freitas
	//    input by: Alex
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: getdate(1055901520)
	//   returns 1: {'seconds': 40, 'minutes': 58, 'hours': 1, 'mday': 18, 'wday': 3, 'mon': 6, 'year': 2003, 'yday': 168, 'weekday': 'Wednesday', 'month': 'June', '0': 1055901520}
	const _w = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur']
	const _m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
		'September', 'October', 'November', 'December'
	]
	const d = ((typeof timestamp === 'undefined') ? new Date() : (timestamp instanceof Date) ?
		new Date(timestamp) // Not provided
		: new Date(timestamp *
		1000) // Javascript Date() // UNIX timestamp (auto-convert to int)
	)
	const w = d.getDay()
	const m = d.getMonth()
	const y = d.getFullYear()
	const r = {}
	r.seconds = d.getSeconds()
	r.minutes = d.getMinutes()
	r.hours = d.getHours()
	r.mday = d.getDate()
	r.wday = w
	r.mon = m + 1
	r.year = y
	r.yday = Math.floor((d - (new Date(y, 0, 1))) / 86400000)
	r.weekday = _w[w] + 'day'
	r.month = _m[m]
	r['0'] = parseInt(d.getTime() / 1000, 10)
	return r
}
phpjed.gettimeofday = function(returnFloat) {
	//  discuss at: https://locutus.io/php/gettimeofday/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: Josh Fraser (https://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/)
	//    parts by: Breaking Par Consulting Inc (https://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7)
	//  revised by: Theriault (https://github.com/Theriault)
	//   example 1: var $obj = gettimeofday()
	//   example 1: var $result = ('sec' in $obj && 'usec' in $obj && 'minuteswest' in $obj &&80, 'dsttime' in $obj)
	//   returns 1: true
	//   example 2: var $timeStamp = gettimeofday(true)
	//   example 2: var $result = $timeStamp > 1000000000 && $timeStamp < 2000000000
	//   returns 2: true
	const t = new Date()
	let y = 0
	if (returnFloat) {
		return t.getTime() / 1000
	}
	// Store current year.
	y = t.getFullYear()
	return {
		sec: t.getUTCSeconds(),
		usec: t.getUTCMilliseconds() * 1000,
		minuteswest: t.getTimezoneOffset(),
		// Compare Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC to see if DST is observed.
		dsttime: 0 + (((new Date(y, 0)) - Date.UTC(y, 0)) !== ((new Date(y, 6)) - Date.UTC(y,
			6)))
	}
}
phpjed.gmdate = function(format, timestamp) {
	//  discuss at: https://locutus.io/php/gmdate/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: Alex
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: gmdate('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400); // Return will depend on your timezone
	//   returns 1: '07:09:40 m is month'
	const date = phpjed.date
	const dt = typeof timestamp === 'undefined' ? new Date() // Not provided
		: timestamp instanceof Date ? new Date(timestamp) // Javascript Date()
		: new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
	timestamp = Date.parse(dt.toUTCString().slice(0, -4)) / 1000
	return date(format, timestamp)
}
phpjed.gmmktime = function() {
	//  discuss at: https://locutus.io/php/gmmktime/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: mktime
	//   example 1: gmmktime(14, 10, 2, 2, 1, 2008)
	//   returns 1: 1201875002
	//   example 2: gmmktime(0, 0, -1, 1, 1, 1970)
	//   returns 2: -1
	const d = new Date()
	const r = arguments
	let i = 0
	const e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear']
	for (i = 0; i < e.length; i++) {
		if (typeof r[i] === 'undefined') {
			r[i] = d['getUTC' + e[i]]()
			// +1 to fix JS months.
			r[i] += (i === 3)
		} else {
			r[i] = parseInt(r[i], 10)
			if (isNaN(r[i])) {
				return false
			}
		}
	}
	// Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
	r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0)
	// Set year, month (-1 to fix JS months), and date.
	// !This must come before the call to setHours!
	d.setUTCFullYear(r[5], r[3] - 1, r[4])
	// Set hours, minutes, and seconds.
	d.setUTCHours(r[0], r[1], r[2])
	const time = d.getTime()
	// Divide milliseconds by 1000 to return seconds and drop decimal.
	// Add 1 second if negative or it'll be off from PHP by 1 second.
	return (time / 1e3 >> 0) - (time < 0)
}
phpjed.gmstrftime = function(format, timestamp) {
	//  discuss at: https://locutus.io/php/gmstrftime/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: Alex
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: gmstrftime("%A", 1062462400)
	//   returns 1: 'Tuesday'
	const strftime = phpjed.strftime
	const _date = (typeof timestamp === 'undefined') ? new Date() : (
		timestamp instanceof Date) ? new Date(timestamp) : new Date(timestamp * 1000)
	timestamp = Date.parse(_date.toUTCString().slice(0, -4)) / 1000
	return strftime(format, timestamp)
}
phpjed.idate = function(format, timestamp) {
	//  discuss at: https://locutus.io/php/idate/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: date
	// original by: gettimeofday
	//    input by: Alex
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	//   example 1: idate('y', 1255633200)
	//   returns 1: 9
	if (format === undefined) {
		throw new Error('idate() expects at least 1 parameter, 0 given')
	}
	if (!format.length || format.length > 1) {
		throw new Error('idate format is one char')
	}
	// @todo: Need to allow date_default_timezone_set() (check for $locutus.default_timezone and use)
	const _date = (typeof timestamp === 'undefined') ? new Date() : (
		timestamp instanceof Date) ? new Date(timestamp) : new Date(timestamp * 1000)
	let a
	switch (format) {
		case 'B':
			return Math.floor((
				(_date.getUTCHours() * 36e2) + (_date.getUTCMinutes() * 60) + _date
				.getUTCSeconds() + 36e2) / 86.4) % 1e3
		case 'd':
			return _date.getDate()
		case 'h':
			return _date.getHours() % 12 || 12
		case 'H':
			return _date.getHours()
		case 'i':
			return _date.getMinutes()
		case 'I':
			// capital 'i'
			// Logic original by getimeofday().
			// Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
			// If they are not equal, then DST is observed.
			a = _date.getFullYear()
			return 0 + (((new Date(a, 0)) - Date.UTC(a, 0)) !== ((new Date(a, 6)) - Date.UTC(a,
				6)))
		case 'L':
			a = _date.getFullYear()
			return (!(a & 3) && (a % 1e2 || !(a % 4e2))) ? 1 : 0
		case 'm':
			return _date.getMonth() + 1
		case 's':
			return _date.getSeconds()
		case 't':
			return (new Date(_date.getFullYear(), _date.getMonth() + 1, 0)).getDate()
		case 'U':
			return Math.round(_date.getTime() / 1000)
		case 'w':
			return _date.getDay()
		case 'W':
			a = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() - (_date
			.getDay() || 7) + 3)
			return 1 + Math.round((a - (new Date(a.getFullYear(), 0, 4))) / 864e5 / 7)
		case 'y':
			return parseInt((_date.getFullYear() + '').slice(2),
				10) // This function returns an integer, unlike _date()
		case 'Y':
			return _date.getFullYear()
		case 'z':
			return Math.floor((_date - new Date(_date.getFullYear(), 0, 1)) / 864e5)
		case 'Z':
			return -_date.getTimezoneOffset() * 60
		default:
			throw new Error('Unrecognized _date format token')
	}
}
phpjed.microtime = function(getAsFloat) {
	//  discuss at: https://locutus.io/php/microtime/
	// original by: Paulo Freitas
	// improved by: Dumitru Uzun (https://duzun.me)
	//   example 1: var $timeStamp = microtime(true)
	//   example 1: $timeStamp > 1000000000 && $timeStamp < 2000000000
	//   returns 1: true
	//   example 2: /^0\.[0-9]{1,6} [0-9]{10,10}$/.test(microtime())
	//   returns 2: true
	let s
	let now
	if (typeof performance !== 'undefined' && performance.now) {
		now = (performance.now() + performance.timing.navigationStart) / 1e3
		if (getAsFloat) {
			return now
		}
		// Math.round(now)
		s = now | 0
		return (Math.round((now - s) * 1e6) / 1e6) + ' ' + s
	} else {
		now = (Date.now ? Date.now() : new Date().getTime()) / 1e3
		if (getAsFloat) {
			return now
		}
		// Math.round(now)
		s = now | 0
		return (Math.round((now - s) * 1e3) / 1e3) + ' ' + s
	}
}
phpjed.mktime = function() {
	//  discuss at: https://locutus.io/php/mktime/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: baris ozdil
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: FGFEmperor
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: gabriel paderni
	//    input by: Yannoo
	//    input by: jakes
	//    input by: 3D-GRAF
	//    input by: Chris
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Marc Palau
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Theriault (https://github.com/Theriault)
	//      note 1: The return values of the following examples are
	//      note 1: received only if your system's timezone is UTC.
	//   example 1: mktime(14, 10, 2, 2, 1, 2008)
	//   returns 1: 1201875002
	//   example 2: mktime(0, 0, 0, 0, 1, 2008)
	//   returns 2: 1196467200
	//   example 3: var $make = mktime()
	//   example 3: var $td = new Date()
	//   example 3: var $real = Math.floor($td.getTime() / 1000)
	//   example 3: var $diff = ($real - $make)
	//   example 3: $diff < 5
	//   returns 3: true
	//   example 4: mktime(0, 0, 0, 13, 1, 1997)
	//   returns 4: 883612800
	//   example 5: mktime(0, 0, 0, 1, 1, 1998)
	//   returns 5: 883612800
	//   example 6: mktime(0, 0, 0, 1, 1, 98)
	//   returns 6: 883612800
	//   example 7: mktime(23, 59, 59, 13, 0, 2010)
	//   returns 7: 1293839999
	//   example 8: mktime(0, 0, -1, 1, 1, 1970)
	//   returns 8: -1
	const d = new Date()
	const r = arguments
	let i = 0
	const e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear']
	for (i = 0; i < e.length; i++) {
		if (typeof r[i] === 'undefined') {
			r[i] = d['get' + e[i]]()
			// +1 to fix JS months.
			r[i] += (i === 3)
		} else {
			r[i] = parseInt(r[i], 10)
			if (isNaN(r[i])) {
				return false
			}
		}
	}
	// Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
	r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0)
	// Set year, month (-1 to fix JS months), and date.
	// !This must come before the call to setHours!
	d.setFullYear(r[5], r[3] - 1, r[4])
	// Set hours, minutes, and seconds.
	d.setHours(r[0], r[1], r[2])
	const time = d.getTime()
	// Divide milliseconds by 1000 to return seconds and drop decimal.
	// Add 1 second if negative or it'll be off from PHP by 1 second.
	return (time / 1e3 >> 0) - (time < 0)
}
phpjed.strftime = function(fmt, timestamp) {
	//       discuss at: https://locutus.io/php/strftime/
	//      original by: Blues (https://tech.bluesmoon.info/)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//         input by: Alex
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//           note 1: Uses global: locutus to store locale info
	//        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
	//        returns 1: 'Tuesday'
	const setlocale = phpjed.setlocale
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const _xPad = function(x, pad, r) {
		if (typeof r === 'undefined') {
			r = 10
		}
		for (; parseInt(x, 10) < r && r > 1; r /= 10) {
			x = pad.toString() + x
		}
		return x.toString()
	}
	const locale = $locutus.php.localeCategories.LC_TIME
	const lcTime = $locutus.php.locales[locale].LC_TIME
	var _formats = {
		a: function(d) {
			return lcTime.a[d.getDay()]
		},
		A: function(d) {
			return lcTime.A[d.getDay()]
		},
		b: function(d) {
			return lcTime.b[d.getMonth()]
		},
		B: function(d) {
			return lcTime.B[d.getMonth()]
		},
		C: function(d) {
			return _xPad(parseInt(d.getFullYear() / 100, 10), 0)
		},
		d: ['getDate', '0'],
		e: ['getDate', ' '],
		g: function(d) {
			return _xPad(parseInt(this.G(d) / 100, 10), 0)
		},
		G: function(d) {
			let y = d.getFullYear()
			const V = parseInt(_formats.V(d), 10)
			const W = parseInt(_formats.W(d), 10)
			if (W > V) {
				y++
			} else if (W === 0 && V >= 52) {
				y--
			}
			return y
		},
		H: ['getHours', '0'],
		I: function(d) {
			const I = d.getHours() % 12
			return _xPad(I === 0 ? 12 : I, 0)
		},
		j: function(d) {
			let ms = d - new Date('' + d.getFullYear() + '/1/1 GMT')
			// Line differs from Yahoo implementation which would be
			// equivalent to replacing it here with:
			ms += d.getTimezoneOffset() * 60000
			const doy = parseInt(ms / 60000 / 60 / 24, 10) + 1
			return _xPad(doy, 0, 100)
		},
		k: ['getHours', '0'],
		// not in PHP, but implemented here (as in Yahoo)
		l: function(d) {
			const l = d.getHours() % 12
			return _xPad(l === 0 ? 12 : l, ' ')
		},
		m: function(d) {
			return _xPad(d.getMonth() + 1, 0)
		},
		M: ['getMinutes', '0'],
		p: function(d) {
			return lcTime.p[d.getHours() >= 12 ? 1 : 0]
		},
		P: function(d) {
			return lcTime.P[d.getHours() >= 12 ? 1 : 0]
		},
		s: function(d) {
			// Yahoo uses return parseInt(d.getTime()/1000, 10);
			return Date.parse(d) / 1000
		},
		S: ['getSeconds', '0'],
		u: function(d) {
			const dow = d.getDay()
			return ((dow === 0) ? 7 : dow)
		},
		U: function(d) {
			const doy = parseInt(_formats.j(d), 10)
			const rdow = 6 - d.getDay()
			const woy = parseInt((doy + rdow) / 7, 10)
			return _xPad(woy, 0)
		},
		V: function(d) {
			const woy = parseInt(_formats.W(d), 10)
			const dow11 = (new Date('' + d.getFullYear() + '/1/1')).getDay()
			// First week is 01 and not 00 as in the case of %U and %W,
			// so we add 1 to the final result except if day 1 of the year
			// is a Monday (then %W returns 01).
			// We also need to subtract 1 if the day 1 of the year is
			// Friday-Sunday, so the resulting equation becomes:
			let idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1)
			if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() <
				4) {
				idow = 1
			} else if (idow === 0) {
				idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'))
			}
			return _xPad(idow, 0)
		},
		w: 'getDay',
		W: function(d) {
			const doy = parseInt(_formats.j(d), 10)
			const rdow = 7 - _formats.u(d)
			const woy = parseInt((doy + rdow) / 7, 10)
			return _xPad(woy, 0, 10)
		},
		y: function(d) {
			return _xPad(d.getFullYear() % 100, 0)
		},
		Y: 'getFullYear',
		z: function(d) {
			const o = d.getTimezoneOffset()
			const H = _xPad(parseInt(Math.abs(o / 60), 10), 0)
			const M = _xPad(o % 60, 0)
			return (o > 0 ? '-' : '+') + H + M
		},
		Z: function(d) {
			return d.toString().replace(/^.*\(([^)]+)\)$/, '$1')
		},
		'%': function(d) {
			return '%'
		}
	}
	const _date = (typeof timestamp === 'undefined') ? new Date() : (
		timestamp instanceof Date) ? new Date(timestamp) : new Date(timestamp * 1000)
	const _aggregates = {
		c: 'locale',
		D: '%m/%d/%y',
		F: '%y-%m-%d',
		h: '%b',
		n: '\n',
		r: 'locale',
		R: '%H:%M',
		t: '\t',
		T: '%H:%M:%S',
		x: 'locale',
		X: 'locale'
	}
	// First replace aggregates (run in a loop because an agg may be made up of other aggs)
	while (fmt.match(/%[cDFhnrRtTxX]/)) {
		fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function(m0, m1) {
			const f = _aggregates[m1]
			return (f === 'locale' ? lcTime[m1] : f)
		})
	}
	// Now replace formats - we need a closure so that the date object gets passed through
	const str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function(m0, m1) {
		const f = _formats[m1]
		if (typeof f === 'string') {
			return _date[f]()
		} else if (typeof f === 'function') {
			return f(_date)
		} else if (typeof f === 'object' && typeof f[0] === 'string') {
			return _xPad(_date[f[0]](), f[1])
		} else {
			// Shouldn't reach here
			return m1
		}
	})
	return str
}
phpjed.strptime = function(dateStr, format) {
	//  discuss at: https://locutus.io/php/strptime/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: strftime
	//   example 1: strptime('20091112222135', '%Y%m%d%H%M%S') // Return value will depend on date and locale
	//   returns 1: {tm_sec: 35, tm_min: 21, tm_hour: 22, tm_mday: 12, tm_mon: 10, tm_year: 109, tm_wday: 4, tm_yday: 315, unparsed: ''}
	//   example 2: strptime('2009extra', '%Y')
	//   returns 2: {tm_sec:0, tm_min:0, tm_hour:0, tm_mday:0, tm_mon:0, tm_year:109, tm_wday:3, tm_yday: -1, unparsed: 'extra'}
	const setlocale = phpjed.setlocale
	const arrayMap = phpjed.array_map
	const retObj = {
		tm_sec: 0,
		tm_min: 0,
		tm_hour: 0,
		tm_mday: 0,
		tm_mon: 0,
		tm_year: 0,
		tm_wday: 0,
		tm_yday: 0,
		unparsed: ''
	}
	let i = 0
	let j = 0
	let amPmOffset = 0
	let prevHour = false
	const _reset = function(dateObj, realMday) {
		// realMday is to allow for a value of 0 in return results (but without
		// messing up the Date() object)
		let jan1
		const o = retObj
		const d = dateObj
		o.tm_sec = d.getUTCSeconds()
		o.tm_min = d.getUTCMinutes()
		o.tm_hour = d.getUTCHours()
		o.tm_mday = realMday === 0 ? realMday : d.getUTCDate()
		o.tm_mon = d.getUTCMonth()
		o.tm_year = d.getUTCFullYear() - 1900
		o.tm_wday = realMday === 0 ? (d.getUTCDay() > 0 ? d.getUTCDay() - 1 : 6) : d
			.getUTCDay()
		jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
		o.tm_yday = Math.ceil((d - jan1) / (1000 * 60 * 60 * 24))
	}
	const _date = function() {
		const o = retObj
		// We set date to at least 1 to ensure year or month doesn't go backwards
		return _reset(new Date(Date.UTC(o.tm_year + 1900, o.tm_mon, o.tm_mday || 1, o
			.tm_hour, o.tm_min, o.tm_sec)), o.tm_mday)
	}
	const _NWS = /\S/
	const _WS = /\s/
	const _aggregates = {
		c: 'locale',
		D: '%m/%d/%y',
		F: '%y-%m-%d',
		r: 'locale',
		R: '%H:%M',
		T: '%H:%M:%S',
		x: 'locale',
		X: 'locale'
	}
	/* Fix: Locale alternatives are supported though not documented in PHP; see https://linux.die.net/man/3/strptime
	  Ec
	  EC
	  Ex
	  EX
	  Ey
	  EY
	  Od or Oe
	  OH
	  OI
	  Om
	  OM
	  OS
	  OU
	  Ow
	  OW
	  Oy
	*/
	const _pregQuote = function(str) {
		return (str + '').replace(/([\\.+*?[^\]$(){}=!<>|:])/g, '\\$1')
	}
	// ensure setup of localization variables takes place
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	const locale = $locutus.php.localeCategories.LC_TIME
	const lcTime = $locutus.php.locales[locale].LC_TIME
	// First replace aggregates (run in a loop because an agg may be made up of other aggs)
	while (format.match(/%[cDFhnrRtTxX]/)) {
		format = format.replace(/%([cDFhnrRtTxX])/g, function(m0, m1) {
			const f = _aggregates[m1]
			return (f === 'locale' ? lcTime[m1] : f)
		})
	}
	const _addNext = function(j, regex, cb) {
		if (typeof regex === 'string') {
			regex = new RegExp('^' + regex, 'i')
		}
		const check = dateStr.slice(j)
		const match = regex.exec(check)
		// Even if the callback returns null after assigning to the
		// return object, the object won't be saved anyways
		const testNull = match ? cb.apply(null, match) : null
		if (testNull === null) {
			throw new Error('No match in string')
		}
		return j + match[0].length
	}
	const _addLocalized = function(j, formatChar, category) {
		// Could make each parenthesized instead and pass index to callback:
		return _addNext(j, arrayMap(_pregQuote, lcTime[formatChar]).join('|'), function(m) {
			const match = lcTime[formatChar].search(new RegExp('^' + _pregQuote(m) +
				'$', 'i'))
			if (match) {
				retObj[category] = match[0]
			}
		})
	}
	// BEGIN PROCESSING CHARACTERS
	for (i = 0, j = 0; i < format.length; i++) {
		if (format.charAt(i) === '%') {
			const literalPos = ['%', 'n', 't'].indexOf(format.charAt(i + 1))
			if (literalPos !== -1) {
				if (['%', '\n', '\t'].indexOf(dateStr.charAt(j)) === literalPos) {
					// a matched literal
					++i
					// skip beyond
					++j
					continue
				}
				// Format indicated a percent literal, but not actually present
				return false
			}
			var formatChar = format.charAt(i + 1)
			try {
				switch (formatChar) {
					case 'a':
					case 'A':
						// Sunday-Saturday
						// Changes nothing else
						j = _addLocalized(j, formatChar, 'tm_wday')
						break
					case 'h':
					case 'b':
						// Jan-Dec
						j = _addLocalized(j, 'b', 'tm_mon')
						// Also changes wday, yday
						_date()
						break
					case 'B':
						// January-December
						j = _addLocalized(j, formatChar, 'tm_mon')
						// Also changes wday, yday
						_date()
						break
					case 'C':
						// 0+; century (19 for 20th)
						// PHP docs say two-digit, but accepts one-digit (two-digit max):
						j = _addNext(j, /^\d?\d/, function(d) {
							const year = (parseInt(d, 10) - 19) * 100
							retObj.tm_year = year
							_date()
							if (!retObj.tm_yday) {
								retObj.tm_yday = -1
							}
							// Also changes wday; and sets yday to -1 (always?)
						})
						break
					case 'd':
					case 'e':
						// 1-31 day
						j = _addNext(j, formatChar === 'd' ? /^(0[1-9]|[1-2]\d|3[0-1])/ :
							/^([1-2]\d|3[0-1]|[1-9])/,
							function(d) {
								const dayMonth = parseInt(d, 10)
								retObj.tm_mday = dayMonth
								// Also changes w_day, y_day
								_date()
							})
						break
					case 'g':
						// No apparent effect; 2-digit year (see 'V')
						break
					case 'G':
						// No apparent effect; 4-digit year (see 'V')'
						break
					case 'H':
						// 00-23 hours
						j = _addNext(j, /^([0-1]\d|2[0-3])/, function(d) {
							const hour = parseInt(d, 10)
							retObj.tm_hour = hour
							// Changes nothing else
						})
						break
					case 'l':
					case 'I':
						// 01-12 hours
						j = _addNext(j, formatChar === 'l' ? /^([1-9]|1[0-2])/ :
							/^(0[1-9]|1[0-2])/,
							function(d) {
								const hour = parseInt(d, 10) - 1 + amPmOffset
								retObj.tm_hour = hour
								// Used for coordinating with am-pm
								prevHour = true
								// Changes nothing else, but affected by prior 'p/P'
							})
						break
					case 'j':
						// 001-366 day of year
						j = _addNext(j, /^(00[1-9]|0[1-9]\d|[1-2]\d\d|3[0-6][0-6])/, function(
						d) {
							const dayYear = parseInt(d, 10) - 1
							retObj.tm_yday = dayYear
							// Changes nothing else
							// (oddly, since if original by a given year, could calculate other fields)
						})
						break
					case 'm':
						// 01-12 month
						j = _addNext(j, /^(0[1-9]|1[0-2])/, function(d) {
							const month = parseInt(d, 10) - 1
							retObj.tm_mon = month
							// Also sets wday and yday
							_date()
						})
						break
					case 'M':
						// 00-59 minutes
						j = _addNext(j, /^[0-5]\d/, function(d) {
							const minute = parseInt(d, 10)
							retObj.tm_min = minute
							// Changes nothing else
						})
						break
					case 'P':
						// Seems not to work; AM-PM
						// Could make fall-through instead since supposed to be a synonym despite PHP docs
						return false
					case 'p':
						// am-pm
						j = _addNext(j, /^(am|pm)/i, function(d) {
							// No effect on 'H' since already 24 hours but
							//   works before or after setting of l/I hour
							amPmOffset = /a/.test(d) ? 0 : 12
							if (prevHour) {
								retObj.tm_hour += amPmOffset
							}
						})
						break
					case 's':
						// Unix timestamp (in seconds)
						j = _addNext(j, /^\d+/, function(d) {
							const timestamp = parseInt(d, 10)
							const date = new Date(Date.UTC(timestamp * 1000))
							_reset(date)
							// Affects all fields, but can't be negative (and initial + not allowed)
						})
						break
					case 'S':
						// 00-59 seconds
						j = _addNext(j,
							/^[0-5]\d/, // strptime also accepts 60-61 for some reason
							function(d) {
								const second = parseInt(d, 10)
								retObj.tm_sec = second
								// Changes nothing else
							})
						break
					case 'u':
					case 'w':
						// 0 (Sunday)-6(Saturday)
						j = _addNext(j, /^\d/, function(d) {
							retObj.tm_wday = d - (formatChar === 'u')
							// Changes nothing else apparently
						})
						break
					case 'U':
					case 'V':
					case 'W':
						// Apparently ignored (week of year, from 1st Monday)
						break
					case 'y':
						// 69 (or higher) for 1969+, 68 (or lower) for 2068-
						// PHP docs say two-digit, but accepts one-digit (two-digit max):
						j = _addNext(j, /^\d?\d/, function(d) {
							d = parseInt(d, 10)
							const year = d >= 69 ? d : d + 100
							retObj.tm_year = year
							_date()
							if (!retObj.tm_yday) {
								retObj.tm_yday = -1
							}
							// Also changes wday; and sets yday to -1 (always?)
						})
						break
					case 'Y':
						// 2010 (4-digit year)
						// PHP docs say four-digit, but accepts one-digit (four-digit max):
						j = _addNext(j, /^\d{1,4}/, function(d) {
							const year = (parseInt(d, 10)) - 1900
							retObj.tm_year = year
							_date()
							if (!retObj.tm_yday) {
								retObj.tm_yday = -1
							}
							// Also changes wday; and sets yday to -1 (always?)
						})
						break
					case 'z':
						// Timezone; on my system, strftime gives -0800,
						// but strptime seems not to alter hour setting
						break
					case 'Z':
						// Timezone; on my system, strftime gives PST, but strptime treats text as unparsed
						break
					default:
						throw new Error('Unrecognized formatting character in strptime()')
				}
			} catch (e) {
				if (e === 'No match in string') {
					// Allow us to exit
					// There was supposed to be a matching format but there wasn't
					return false
				}
				// Calculate skipping beyond initial percent too
			}
			++i
		} else if (format.charAt(i) !== dateStr.charAt(j)) {
			// If extra whitespace at beginning or end of either, or between formats, no problem
			// (just a problem when between % and format specifier)
			// If the string has white-space, it is ok to ignore
			if (dateStr.charAt(j).search(_WS) !== -1) {
				j++
				// Let the next iteration try again with the same format character
				i--
			} else if (format.charAt(i).search(_NWS) !== -1) {
				// Any extra formatting characters besides white-space causes
				// problems (do check after WS though, as may just be WS in string before next character)
				return false
			}
			// Extra WS in format
			// Adjust strings when encounter non-matching whitespace, so they align in future checks above
			// Will check on next iteration (against same (non-WS) string character)
		} else {
			j++
		}
	}
	// POST-PROCESSING
	// Will also get extra whitespace; empty string if none
	retObj.unparsed = dateStr.slice(j)
	return retObj
}
const reSpace = '[ \\t]+'
const reSpaceOpt = '[ \\t]*'
const reMeridian = '(?:([ap])\\.?m\\.?([\\t ]|$))'
const reHour24 = '(2[0-4]|[01]?[0-9])'
const reHour24lz = '([01][0-9]|2[0-4])'
const reHour12 = '(0?[1-9]|1[0-2])'
const reMinute = '([0-5]?[0-9])'
const reMinutelz = '([0-5][0-9])'
const reSecond = '(60|[0-5]?[0-9])'
const reSecondlz = '(60|[0-5][0-9])'
const reFrac = '(?:\\.([0-9]+))'
const reDayfull = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday'
const reDayabbr = 'sun|mon|tue|wed|thu|fri|sat'
const reDaytext = reDayfull + '|' + reDayabbr + '|weekdays?'
const reReltextnumber =
	'first|second|third|fourth|fifth|sixth|seventh|eighth?|ninth|tenth|eleventh|twelfth'
const reReltexttext = 'next|last|previous|this'
const reReltextunit =
	'(?:second|sec|minute|min|hour|day|fortnight|forthnight|month|year)s?|weeks|' + reDaytext
const reYear = '([0-9]{1,4})'
const reYear2 = '([0-9]{2})'
const reYear4 = '([0-9]{4})'
const reYear4withSign = '([+-]?[0-9]{4})'
const reMonth = '(1[0-2]|0?[0-9])'
const reMonthlz = '(0[0-9]|1[0-2])'
const reDay = '(?:(3[01]|[0-2]?[0-9])(?:st|nd|rd|th)?)'
const reDaylz = '(0[0-9]|[1-2][0-9]|3[01])'
const reMonthFull =
	'january|february|march|april|may|june|july|august|september|october|november|december'
const reMonthAbbr = 'jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec'
const reMonthroman = 'i[vx]|vi{0,3}|xi{0,2}|i{1,3}'
const reMonthText = '(' + reMonthFull + '|' + reMonthAbbr + '|' + reMonthroman + ')'
const reTzCorrection = '((?:GMT)?([+-])' + reHour24 + ':?' + reMinute + '?)'
const reTzAbbr = '\\(?([a-zA-Z]{1,6})\\)?'
const reDayOfYear = '(00[1-9]|0[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6])'
const reWeekOfYear = '(0[1-9]|[1-4][0-9]|5[0-3])'
const reDateNoYear = reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]*'
phpjed.processMeridian = function(hour, meridian) {
	meridian = meridian && meridian.toLowerCase()
	switch (meridian) {
		case 'a':
			hour += hour === 12 ? -12 : 0
			break
		case 'p':
			hour += hour !== 12 ? 12 : 0
			break
	}
	return hour
}
phpjed.processYear = function(yearStr) {
	let year = +yearStr
	if (yearStr.length < 4 && year < 100) {
		year += year < 70 ? 2000 : 1900
	}
	return year
}
phpjed.lookupMonth = function(monthStr) {
	return {
		jan: 0,
		january: 0,
		i: 0,
		feb: 1,
		february: 1,
		ii: 1,
		mar: 2,
		march: 2,
		iii: 2,
		apr: 3,
		april: 3,
		iv: 3,
		may: 4,
		v: 4,
		jun: 5,
		june: 5,
		vi: 5,
		jul: 6,
		july: 6,
		vii: 6,
		aug: 7,
		august: 7,
		viii: 7,
		sep: 8,
		sept: 8,
		september: 8,
		ix: 8,
		oct: 9,
		october: 9,
		x: 9,
		nov: 10,
		november: 10,
		xi: 10,
		dec: 11,
		december: 11,
		xii: 11
	} [monthStr.toLowerCase()]
}
phpjed.lookupWeekday = function(dayStr, desiredSundayNumber = 0) {
	const dayNumbers = {
		mon: 1,
		monday: 1,
		tue: 2,
		tuesday: 2,
		wed: 3,
		wednesday: 3,
		thu: 4,
		thursday: 4,
		fri: 5,
		friday: 5,
		sat: 6,
		saturday: 6,
		sun: 0,
		sunday: 0
	}
	return dayNumbers[dayStr.toLowerCase()] || desiredSundayNumber
}
phpjed.lookupRelative = function(relText) {
	const relativeNumbers = {
		last: -1,
		previous: -1,
		this: 0,
		first: 1,
		next: 1,
		second: 2,
		third: 3,
		fourth: 4,
		fifth: 5,
		sixth: 6,
		seventh: 7,
		eight: 8,
		eighth: 8,
		ninth: 9,
		tenth: 10,
		eleventh: 11,
		twelfth: 12
	}
	const relativeBehavior = {
		this: 1
	}
	const relTextLower = relText.toLowerCase()
	return {
		amount: relativeNumbers[relTextLower],
		behavior: relativeBehavior[relTextLower] || 0
	}
}
phpjed.processTzCorrection = function(tzOffset, oldValue) {
	const reTzCorrectionLoose = /(?:GMT)?([+-])(\d+)(:?)(\d{0,2})/i
	tzOffset = tzOffset && tzOffset.match(reTzCorrectionLoose)
	if (!tzOffset) {
		return oldValue
	}
	const sign = tzOffset[1] === '-' ? -1 : 1
	let hours = +tzOffset[2]
	let minutes = +tzOffset[4]
	if (!tzOffset[4] && !tzOffset[3]) {
		minutes = Math.floor(hours % 100)
		hours = Math.floor(hours / 100)
	}
	// timezone offset in seconds
	return sign * (hours * 60 + minutes) * 60
}
// tz abbrevation : tz offset in seconds
const tzAbbrOffsets = {
	acdt: 37800,
	acst: 34200,
	addt: -7200,
	adt: -10800,
	aedt: 39600,
	aest: 36000,
	ahdt: -32400,
	ahst: -36000,
	akdt: -28800,
	akst: -32400,
	amt: -13840,
	apt: -10800,
	ast: -14400,
	awdt: 32400,
	awst: 28800,
	awt: -10800,
	bdst: 7200,
	bdt: -36000,
	bmt: -14309,
	bst: 3600,
	cast: 34200,
	cat: 7200,
	cddt: -14400,
	cdt: -18000,
	cemt: 10800,
	cest: 7200,
	cet: 3600,
	cmt: -15408,
	cpt: -18000,
	cst: -21600,
	cwt: -18000,
	chst: 36000,
	dmt: -1521,
	eat: 10800,
	eddt: -10800,
	edt: -14400,
	eest: 10800,
	eet: 7200,
	emt: -26248,
	ept: -14400,
	est: -18000,
	ewt: -14400,
	ffmt: -14660,
	fmt: -4056,
	gdt: 39600,
	gmt: 0,
	gst: 36000,
	hdt: -34200,
	hkst: 32400,
	hkt: 28800,
	hmt: -19776,
	hpt: -34200,
	hst: -36000,
	hwt: -34200,
	iddt: 14400,
	idt: 10800,
	imt: 25025,
	ist: 7200,
	jdt: 36000,
	jmt: 8440,
	jst: 32400,
	kdt: 36000,
	kmt: 5736,
	kst: 30600,
	lst: 9394,
	mddt: -18000,
	mdst: 16279,
	mdt: -21600,
	mest: 7200,
	met: 3600,
	mmt: 9017,
	mpt: -21600,
	msd: 14400,
	msk: 10800,
	mst: -25200,
	mwt: -21600,
	nddt: -5400,
	ndt: -9052,
	npt: -9000,
	nst: -12600,
	nwt: -9000,
	nzdt: 46800,
	nzmt: 41400,
	nzst: 43200,
	pddt: -21600,
	pdt: -25200,
	pkst: 21600,
	pkt: 18000,
	plmt: 25590,
	pmt: -13236,
	ppmt: -17340,
	ppt: -25200,
	pst: -28800,
	pwt: -25200,
	qmt: -18840,
	rmt: 5794,
	sast: 7200,
	sdmt: -16800,
	sjmt: -20173,
	smt: -13884,
	sst: -39600,
	tbmt: 10751,
	tmt: 12344,
	uct: 0,
	utc: 0,
	wast: 7200,
	wat: 3600,
	wemt: 7200,
	west: 3600,
	wet: 0,
	wib: 25200,
	wita: 28800,
	wit: 32400,
	wmt: 5040,
	yddt: -25200,
	ydt: -28800,
	ypt: -28800,
	yst: -32400,
	ywt: -28800,
	a: 3600,
	b: 7200,
	c: 10800,
	d: 14400,
	e: 18000,
	f: 21600,
	g: 25200,
	h: 28800,
	i: 32400,
	k: 36000,
	l: 39600,
	m: 43200,
	n: -3600,
	o: -7200,
	p: -10800,
	q: -14400,
	r: -18000,
	s: -21600,
	t: -25200,
	u: -28800,
	v: -32400,
	w: -36000,
	x: -39600,
	y: -43200,
	z: 0
}
const formats = {
	yesterday: {
		regex: /^yesterday/i,
		name: 'yesterday',
		callback() {
			this.rd -= 1
			return this.resetTime()
		}
	},
	now: {
		regex: /^now/i,
		name: 'now'
		// do nothing
	},
	noon: {
		regex: /^noon/i,
		name: 'noon',
		callback() {
			return this.resetTime() && this.time(12, 0, 0, 0)
		}
	},
	midnightOrToday: {
		regex: /^(midnight|today)/i,
		name: 'midnight | today',
		callback() {
			return this.resetTime()
		}
	},
	tomorrow: {
		regex: /^tomorrow/i,
		name: 'tomorrow',
		callback() {
			this.rd += 1
			return this.resetTime()
		}
	},
	timestamp: {
		regex: /^@(-?\d+)/i,
		name: 'timestamp',
		callback(match, timestamp) {
			this.rs += +timestamp
			this.y = 1970
			this.m = 0
			this.d = 1
			this.dates = 0
			return this.resetTime() && this.zone(0)
		}
	},
	firstOrLastDay: {
		regex: /^(first|last) day of/i,
		name: 'firstdayof | lastdayof',
		callback(match, day) {
			if (day.toLowerCase() === 'first') {
				this.firstOrLastDayOfMonth = 1
			} else {
				this.firstOrLastDayOfMonth = -1
			}
		}
	},
	backOrFrontOf: {
		regex: RegExp('^(back|front) of ' + reHour24 + reSpaceOpt + reMeridian + '?', 'i'),
		name: 'backof | frontof',
		callback(match, side, hours, meridian) {
			const back = side.toLowerCase() === 'back'
			let hour = +hours
			let minute = 15
			if (!back) {
				hour -= 1
				minute = 45
			}
			hour = phpjed.processMeridian(hour, meridian)
			return this.resetTime() && this.time(hour, minute, 0, 0)
		}
	},
	weekdayOf: {
		regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' +
			reDayfull + '|' + reDayabbr + ')' + reSpace + 'of', 'i'),
		name: 'weekdayof'
		// todo
	},
	mssqltime: {
		regex: RegExp('^' + reHour12 + ':' + reMinutelz + ':' + reSecondlz + '[:.]([0-9]+)' +
			reMeridian, 'i'),
		name: 'mssqltime',
		callback(match, hour, minute, second, frac, meridian) {
			return this.time(phpjed.processMeridian(+hour, meridian), +minute, +second, +frac
				.substr(0, 3))
		}
	},
	timeLong12: {
		regex: RegExp('^' + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt +
			reMeridian, 'i'),
		name: 'timelong12',
		callback(match, hour, minute, second, meridian) {
			return this.time(phpjed.processMeridian(+hour, meridian), +minute, +second, 0)
		}
	},
	timeShort12: {
		regex: RegExp('^' + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
		name: 'timeshort12',
		callback(match, hour, minute, meridian) {
			return this.time(phpjed.processMeridian(+hour, meridian), +minute, 0, 0)
		}
	},
	timeTiny12: {
		regex: RegExp('^' + reHour12 + reSpaceOpt + reMeridian, 'i'),
		name: 'timetiny12',
		callback(match, hour, meridian) {
			return this.time(phpjed.processMeridian(+hour, meridian), 0, 0, 0)
		}
	},
	soap: {
		regex: RegExp('^' + reYear4 + '-' + reMonthlz + '-' + reDaylz + 'T' + reHour24lz + ':' +
			reMinutelz + ':' + reSecondlz + reFrac + reTzCorrection + '?', 'i'),
		name: 'soap',
		callback(match, year, month, day, hour, minute, second, frac, tzCorrection) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, +frac
				.substr(0, 3)) && this.zone(phpjed.processTzCorrection(tzCorrection))
		}
	},
	wddx: {
		regex: RegExp('^' + reYear4 + '-' + reMonth + '-' + reDay + 'T' + reHour24 + ':' +
			reMinute + ':' + reSecond),
		name: 'wddx',
		callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
		}
	},
	exif: {
		regex: RegExp('^' + reYear4 + ':' + reMonthlz + ':' + reDaylz + ' ' + reHour24lz + ':' +
			reMinutelz + ':' + reSecondlz, 'i'),
		name: 'exif',
		callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
		}
	},
	xmlRpc: {
		regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + 'T' + reHour24 + ':' + reMinutelz +
			':' + reSecondlz),
		name: 'xmlrpc',
		callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
		}
	},
	xmlRpcNoColon: {
		regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + '[Tt]' + reHour24 + reMinutelz +
			reSecondlz),
		name: 'xmlrpcnocolon',
		callback(match, year, month, day, hour, minute, second) {
			return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
		}
	},
	clf: {
		regex: RegExp('^' + reDay + '/(' + reMonthAbbr + ')/' + reYear4 + ':' + reHour24lz +
			':' + reMinutelz + ':' + reSecondlz + reSpace + reTzCorrection, 'i'),
		name: 'clf',
		callback(match, day, month, year, hour, minute, second, tzCorrection) {
			return this.ymd(+year, phpjed.lookupMonth(month), +day) && this.time(+hour, +minute,
				+second, 0) && this.zone(phpjed.processTzCorrection(tzCorrection))
		}
	},
	iso8601long: {
		regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond + reFrac, 'i'),
		name: 'iso8601long',
		callback(match, hour, minute, second, frac) {
			return this.time(+hour, +minute, +second, +frac.substr(0, 3))
		}
	},
	dateTextual: {
		regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]+' + reYear,
			'i'),
		name: 'datetextual',
		callback(match, month, day, year) {
			return this.ymd(phpjed.processYear(year), phpjed.lookupMonth(month), +day)
		}
	},
	pointedDate4: {
		regex: RegExp('^' + reDay + '[.\\t-]' + reMonth + '[.-]' + reYear4),
		name: 'pointeddate4',
		callback(match, day, month, year) {
			return this.ymd(+year, month - 1, +day)
		}
	},
	pointedDate2: {
		regex: RegExp('^' + reDay + '[.\\t]' + reMonth + '\\.' + reYear2),
		name: 'pointeddate2',
		callback(match, day, month, year) {
			return this.ymd(phpjed.processYear(year), month - 1, +day)
		}
	},
	timeLong24: {
		regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond),
		name: 'timelong24',
		callback(match, hour, minute, second) {
			return this.time(+hour, +minute, +second, 0)
		}
	},
	dateNoColon: {
		regex: RegExp('^' + reYear4 + reMonthlz + reDaylz),
		name: 'datenocolon',
		callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day)
		}
	},
	pgydotd: {
		regex: RegExp('^' + reYear4 + '\\.?' + reDayOfYear),
		name: 'pgydotd',
		callback(match, year, day) {
			return this.ymd(+year, 0, +day)
		}
	},
	timeShort24: {
		regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute, 'i'),
		name: 'timeshort24',
		callback(match, hour, minute) {
			return this.time(+hour, +minute, 0, 0)
		}
	},
	iso8601noColon: {
		regex: RegExp('^t?' + reHour24lz + reMinutelz + reSecondlz, 'i'),
		name: 'iso8601nocolon',
		callback(match, hour, minute, second) {
			return this.time(+hour, +minute, +second, 0)
		}
	},
	iso8601dateSlash: {
		// eventhough the trailing slash is optional in PHP
		// here it's mandatory and inputs without the slash
		// are handled by dateslash
		regex: RegExp('^' + reYear4 + '/' + reMonthlz + '/' + reDaylz + '/'),
		name: 'iso8601dateslash',
		callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day)
		}
	},
	dateSlash: {
		regex: RegExp('^' + reYear4 + '/' + reMonth + '/' + reDay),
		name: 'dateslash',
		callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day)
		}
	},
	american: {
		regex: RegExp('^' + reMonth + '/' + reDay + '/' + reYear),
		name: 'american',
		callback(match, month, day, year) {
			return this.ymd(phpjed.processYear(year), month - 1, +day)
		}
	},
	americanShort: {
		regex: RegExp('^' + reMonth + '/' + reDay),
		name: 'americanshort',
		callback(match, month, day) {
			return this.ymd(this.y, month - 1, +day)
		}
	},
	gnuDateShortOrIso8601date2: {
		// iso8601date2 is complete subset of gnudateshort
		regex: RegExp('^' + reYear + '-' + reMonth + '-' + reDay),
		name: 'gnudateshort | iso8601date2',
		callback(match, year, month, day) {
			return this.ymd(phpjed.processYear(year), month - 1, +day)
		}
	},
	iso8601date4: {
		regex: RegExp('^' + reYear4withSign + '-' + reMonthlz + '-' + reDaylz),
		name: 'iso8601date4',
		callback(match, year, month, day) {
			return this.ymd(+year, month - 1, +day)
		}
	},
	gnuNoColon: {
		regex: RegExp('^t?' + reHour24lz + reMinutelz, 'i'),
		name: 'gnunocolon',
		callback(match, hour, minute) {
			// this rule is a special case
			// if time was already set once by any preceding rule, it sets the captured value as year
			switch (this.times) {
				case 0:
					return this.time(+hour, +minute, 0, this.f)
				case 1:
					this.y = hour * 100 + +minute
					this.times++
					return true
				default:
					return false
			}
		}
	},
	gnuDateShorter: {
		regex: RegExp('^' + reYear4 + '-' + reMonth),
		name: 'gnudateshorter',
		callback(match, year, month) {
			return this.ymd(+year, month - 1, 1)
		}
	},
	pgTextReverse: {
		// note: allowed years are from 32-9999
		// years below 32 should be treated as days in datefull
		regex: RegExp('^' + '(\\d{3,4}|[4-9]\\d|3[2-9])-(' + reMonthAbbr + ')-' + reDaylz, 'i'),
		name: 'pgtextreverse',
		callback(match, year, month, day) {
			return this.ymd(phpjed.processYear(year), phpjed.lookupMonth(month), +day)
		}
	},
	dateFull: {
		regex: RegExp('^' + reDay + '[ \\t.-]*' + reMonthText + '[ \\t.-]*' + reYear, 'i'),
		name: 'datefull',
		callback(match, day, month, year) {
			return this.ymd(phpjed.processYear(year), phpjed.lookupMonth(month), +day)
		}
	},
	dateNoDay: {
		regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reYear4, 'i'),
		name: 'datenoday',
		callback(match, month, year) {
			return this.ymd(+year, phpjed.lookupMonth(month), 1)
		}
	},
	dateNoDayRev: {
		regex: RegExp('^' + reYear4 + '[ .\\t-]*' + reMonthText, 'i'),
		name: 'datenodayrev',
		callback(match, year, month) {
			return this.ymd(+year, phpjed.lookupMonth(month), 1)
		}
	},
	pgTextShort: {
		regex: RegExp('^(' + reMonthAbbr + ')-' + reDaylz + '-' + reYear, 'i'),
		name: 'pgtextshort',
		callback(match, month, day, year) {
			return this.ymd(phpjed.processYear(year), phpjed.lookupMonth(month), +day)
		}
	},
	dateNoYear: {
		regex: RegExp('^' + reDateNoYear, 'i'),
		name: 'datenoyear',
		callback(match, month, day) {
			return this.ymd(this.y, phpjed.lookupMonth(month), +day)
		}
	},
	dateNoYearRev: {
		regex: RegExp('^' + reDay + '[ .\\t-]*' + reMonthText, 'i'),
		name: 'datenoyearrev',
		callback(match, day, month) {
			return this.ymd(this.y, phpjed.lookupMonth(month), +day)
		}
	},
	isoWeekDay: {
		regex: RegExp('^' + reYear4 + '-?W' + reWeekOfYear + '(?:-?([0-7]))?'),
		name: 'isoweekday | isoweek',
		callback(match, year, week, day) {
			day = day ? +day : 1
			if (!this.ymd(+year, 0, 1)) {
				return false
			}
			// get day of week for Jan 1st
			let dayOfWeek = new Date(this.y, this.m, this.d).getDay()
			// and use the day to figure out the offset for day 1 of week 1
			dayOfWeek = 0 - (dayOfWeek > 4 ? dayOfWeek - 7 : dayOfWeek)
			this.rd += dayOfWeek + ((week - 1) * 7) + day
		}
	},
	relativeText: {
		regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' +
			reReltextunit + ')', 'i'),
		name: 'relativetext',
		callback(match, relValue, relUnit) {
			// todo: implement handling of 'this time-unit'
			// eslint-disable-next-line no-unused-vars
			const {
				amount,
				behavior
			} = phpjed.lookupRelative(relValue)
			switch (relUnit.toLowerCase()) {
				case 'sec':
				case 'secs':
				case 'second':
				case 'seconds':
					this.rs += amount
					break
				case 'min':
				case 'mins':
				case 'minute':
				case 'minutes':
					this.ri += amount
					break
				case 'hour':
				case 'hours':
					this.rh += amount
					break
				case 'day':
				case 'days':
					this.rd += amount
					break
				case 'fortnight':
				case 'fortnights':
				case 'forthnight':
				case 'forthnights':
					this.rd += amount * 14
					break
				case 'week':
				case 'weeks':
					this.rd += amount * 7
					break
				case 'month':
				case 'months':
					this.rm += amount
					break
				case 'year':
				case 'years':
					this.ry += amount
					break
				case 'mon':
				case 'monday':
				case 'tue':
				case 'tuesday':
				case 'wed':
				case 'wednesday':
				case 'thu':
				case 'thursday':
				case 'fri':
				case 'friday':
				case 'sat':
				case 'saturday':
				case 'sun':
				case 'sunday':
					this.resetTime()
					this.weekday = phpjed.lookupWeekday(relUnit, 7)
					this.weekdayBehavior = 1
					this.rd += (amount > 0 ? amount - 1 : amount) * 7
					break
				case 'weekday':
				case 'weekdays':
					// todo
					break
			}
		}
	},
	relative: {
		regex: RegExp('^([+-]*)[ \\t]*(\\d+)' + reSpaceOpt + '(' + reReltextunit + '|week)',
			'i'),
		name: 'relative',
		callback(match, signs, relValue, relUnit) {
			const minuses = signs.replace(/[^-]/g, '').length
			const amount = +relValue * Math.pow(-1, minuses)
			switch (relUnit.toLowerCase()) {
				case 'sec':
				case 'secs':
				case 'second':
				case 'seconds':
					this.rs += amount
					break
				case 'min':
				case 'mins':
				case 'minute':
				case 'minutes':
					this.ri += amount
					break
				case 'hour':
				case 'hours':
					this.rh += amount
					break
				case 'day':
				case 'days':
					this.rd += amount
					break
				case 'fortnight':
				case 'fortnights':
				case 'forthnight':
				case 'forthnights':
					this.rd += amount * 14
					break
				case 'week':
				case 'weeks':
					this.rd += amount * 7
					break
				case 'month':
				case 'months':
					this.rm += amount
					break
				case 'year':
				case 'years':
					this.ry += amount
					break
				case 'mon':
				case 'monday':
				case 'tue':
				case 'tuesday':
				case 'wed':
				case 'wednesday':
				case 'thu':
				case 'thursday':
				case 'fri':
				case 'friday':
				case 'sat':
				case 'saturday':
				case 'sun':
				case 'sunday':
					this.resetTime()
					this.weekday = phpjed.lookupWeekday(relUnit, 7)
					this.weekdayBehavior = 1
					this.rd += (amount > 0 ? amount - 1 : amount) * 7
					break
				case 'weekday':
				case 'weekdays':
					// todo
					break
			}
		}
	},
	dayText: {
		regex: RegExp('^(' + reDaytext + ')', 'i'),
		name: 'daytext',
		callback(match, dayText) {
			this.resetTime()
			this.weekday = phpjed.lookupWeekday(dayText, 0)
			if (this.weekdayBehavior !== 2) {
				this.weekdayBehavior = 1
			}
		}
	},
	relativeTextWeek: {
		regex: RegExp('^(' + reReltexttext + ')' + reSpace + 'week', 'i'),
		name: 'relativetextweek',
		callback(match, relText) {
			this.weekdayBehavior = 2
			switch (relText.toLowerCase()) {
				case 'this':
					this.rd += 0
					break
				case 'next':
					this.rd += 7
					break
				case 'last':
				case 'previous':
					this.rd -= 7
					break
			}
			if (isNaN(this.weekday)) {
				this.weekday = 1
			}
		}
	},
	monthFullOrMonthAbbr: {
		regex: RegExp('^(' + reMonthFull + '|' + reMonthAbbr + ')', 'i'),
		name: 'monthfull | monthabbr',
		callback(match, month) {
			return this.ymd(this.y, phpjed.lookupMonth(month), this.d)
		}
	},
	tzCorrection: {
		regex: RegExp('^' + reTzCorrection, 'i'),
		name: 'tzcorrection',
		callback(tzCorrection) {
			return this.zone(phpjed.processTzCorrection(tzCorrection))
		}
	},
	tzAbbr: {
		regex: RegExp('^' + reTzAbbr),
		name: 'tzabbr',
		callback(match, abbr) {
			const offset = tzAbbrOffsets[abbr.toLowerCase()]
			if (isNaN(offset)) {
				return false
			}
			return this.zone(offset)
		}
	},
	ago: {
		regex: /^ago/i,
		name: 'ago',
		callback() {
			this.ry = -this.ry
			this.rm = -this.rm
			this.rd = -this.rd
			this.rh = -this.rh
			this.ri = -this.ri
			this.rs = -this.rs
			this.rf = -this.rf
		}
	},
	year4: {
		regex: RegExp('^' + reYear4),
		name: 'year4',
		callback(match, year) {
			this.y = +year
			return true
		}
	},
	whitespace: {
		regex: /^[ .,\t]+/,
		name: 'whitespace'
		// do nothing
	},
	dateShortWithTimeLong: {
		regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute + '[:.]' +
			reSecond, 'i'),
		name: 'dateshortwithtimelong',
		callback(match, month, day, hour, minute, second) {
			return this.ymd(this.y, phpjed.lookupMonth(month), +day) && this.time(+hour, +
				minute, +second, 0)
		}
	},
	dateShortWithTimeLong12: {
		regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz +
			reSpaceOpt + reMeridian, 'i'),
		name: 'dateshortwithtimelong12',
		callback(match, month, day, hour, minute, second, meridian) {
			return this.ymd(this.y, phpjed.lookupMonth(month), +day) && this.time(phpjed
				.processMeridian(+hour, meridian), +minute, +second, 0)
		}
	},
	dateShortWithTimeShort: {
		regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute, 'i'),
		name: 'dateshortwithtimeshort',
		callback(match, month, day, hour, minute) {
			return this.ymd(this.y, phpjed.lookupMonth(month), +day) && this.time(+hour, +
				minute, 0, 0)
		}
	},
	dateShortWithTimeShort12: {
		regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinutelz + reSpaceOpt +
			reMeridian, 'i'),
		name: 'dateshortwithtimeshort12',
		callback(match, month, day, hour, minute, meridian) {
			return this.ymd(this.y, phpjed.lookupMonth(month), +day) && this.time(phpjed
				.processMeridian(+hour, meridian), +minute, 0, 0)
		}
	}
}
const resultProto = {
	// date
	y: NaN,
	m: NaN,
	d: NaN,
	// time
	h: NaN,
	i: NaN,
	s: NaN,
	f: NaN,
	// relative shifts
	ry: 0,
	rm: 0,
	rd: 0,
	rh: 0,
	ri: 0,
	rs: 0,
	rf: 0,
	// weekday related shifts
	weekday: NaN,
	weekdayBehavior: 0,
	// first or last day of month
	// 0 none, 1 first, -1 last
	firstOrLastDayOfMonth: 0,
	// timezone correction in minutes
	z: NaN,
	// counters
	dates: 0,
	times: 0,
	zones: 0,
	// helper functions
	ymd(y, m, d) {
		if (this.dates > 0) {
			return false
		}
		this.dates++
		this.y = y
		this.m = m
		this.d = d
		return true
	},
	time(h, i, s, f) {
		if (this.times > 0) {
			return false
		}
		this.times++
		this.h = h
		this.i = i
		this.s = s
		this.f = f
		return true
	},
	resetTime() {
		this.h = 0
		this.i = 0
		this.s = 0
		this.f = 0
		this.times = 0
		return true
	},
	zone(minutes) {
		if (this.zones <= 1) {
			this.zones++
			this.z = minutes
			return true
		}
		return false
	},
	toDate(relativeTo) {
		if (this.dates && !this.times) {
			this.h = this.i = this.s = this.f = 0
		}
		// fill holes
		if (isNaN(this.y)) {
			this.y = relativeTo.getFullYear()
		}
		if (isNaN(this.m)) {
			this.m = relativeTo.getMonth()
		}
		if (isNaN(this.d)) {
			this.d = relativeTo.getDate()
		}
		if (isNaN(this.h)) {
			this.h = relativeTo.getHours()
		}
		if (isNaN(this.i)) {
			this.i = relativeTo.getMinutes()
		}
		if (isNaN(this.s)) {
			this.s = relativeTo.getSeconds()
		}
		if (isNaN(this.f)) {
			this.f = relativeTo.getMilliseconds()
		}
		// adjust special early
		switch (this.firstOrLastDayOfMonth) {
			case 1:
				this.d = 1
				break
			case -1:
				this.d = 0
				this.m += 1
				break
		}
		if (!isNaN(this.weekday)) {
			const date = new Date(relativeTo.getTime())
			date.setFullYear(this.y, this.m, this.d)
			date.setHours(this.h, this.i, this.s, this.f)
			const dow = date.getDay()
			if (this.weekdayBehavior === 2) {
				// To make "this week" work, where the current day of week is a "sunday"
				if (dow === 0 && this.weekday !== 0) {
					this.weekday = -6
				}
				// To make "sunday this week" work, where the current day of week is not a "sunday"
				if (this.weekday === 0 && dow !== 0) {
					this.weekday = 7
				}
				this.d -= dow
				this.d += this.weekday
			} else {
				let diff = this.weekday - dow
				// some PHP magic
				if ((this.rd < 0 && diff < 0) || (this.rd >= 0 && diff <= -this
					.weekdayBehavior)) {
					diff += 7
				}
				if (this.weekday >= 0) {
					this.d += diff
				} else {
					this.d -= (7 - (Math.abs(this.weekday) - dow))
				}
				this.weekday = NaN
			}
		}
		// adjust relative
		this.y += this.ry
		this.m += this.rm
		this.d += this.rd
		this.h += this.rh
		this.i += this.ri
		this.s += this.rs
		this.f += this.rf
		this.ry = this.rm = this.rd = 0
		this.rh = this.ri = this.rs = this.rf = 0
		const result = new Date(relativeTo.getTime())
		// since Date constructor treats years <= 99 as 1900+
		// it can't be used, thus this weird way
		result.setFullYear(this.y, this.m, this.d)
		result.setHours(this.h, this.i, this.s, this.f)
		// note: this is done twice in PHP
		// early when processing special relatives
		// and late
		// todo: check if the logic can be reduced
		// to just one time action
		switch (this.firstOrLastDayOfMonth) {
			case 1:
				result.setDate(1)
				break
			case -1:
				result.setMonth(result.getMonth() + 1, 0)
				break
		}
		// adjust timezone
		if (!isNaN(this.z) && result.getTimezoneOffset() !== this.z) {
			result.setUTCFullYear(result.getFullYear(), result.getMonth(), result.getDate())
			result.setUTCHours(result.getHours(), result.getMinutes(), result.getSeconds() -
				this.z, result.getMilliseconds())
		}
		return result
	}
}
phpjed.strtotime = function(str, now) {
	//       discuss at: https://locutus.io/php/strtotime/
	//      original by: Caio Ariede (https://caioariede.com)
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Caio Ariede (https://caioariede.com)
	//      improved by: A. Matías Quezada (https://amatiasq.com)
	//      improved by: preuter
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Mirko Faber
	//         input by: David
	//      bugfixed by: Wagner B. Soares
	//      bugfixed by: Artur Tchernychev
	//      bugfixed by: Stephan Bösch-Plepelits (https://github.com/plepe)
	// reimplemented by: Rafał Kukawski
	//           note 1: Examples all have a fixed timestamp to prevent
	//           note 1: tests to fail because of variable time(zones)
	//        example 1: strtotime('+1 day', 1129633200)
	//        returns 1: 1129719600
	//        example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200)
	//        returns 2: 1130425202
	//        example 3: strtotime('last month', 1129633200)
	//        returns 3: 1127041200
	//        example 4: strtotime('2009-05-04 08:30:00+00')
	//        returns 4: 1241425800
	//        example 5: strtotime('2009-05-04 08:30:00+02:00')
	//        returns 5: 1241418600
	//        example 6: strtotime('2009-05-04 08:30:00 YWT')
	//        returns 6: 1241454600
	if (now == null) {
		now = Math.floor(Date.now() / 1000)
	}
	// the rule order is important
	// if multiple rules match, the longest match wins
	// if multiple rules match the same string, the first match wins
	const rules = [
		formats.yesterday,
		formats.now,
		formats.noon,
		formats.midnightOrToday,
		formats.tomorrow,
		formats.timestamp,
		formats.firstOrLastDay,
		formats.backOrFrontOf,
		// formats.weekdayOf, // not yet implemented
		formats.timeTiny12,
		formats.timeShort12,
		formats.timeLong12,
		formats.mssqltime,
		formats.timeShort24,
		formats.timeLong24,
		formats.iso8601long,
		formats.gnuNoColon,
		formats.iso8601noColon,
		formats.americanShort,
		formats.american,
		formats.iso8601date4,
		formats.iso8601dateSlash,
		formats.dateSlash,
		formats.gnuDateShortOrIso8601date2,
		formats.gnuDateShorter,
		formats.dateFull,
		formats.pointedDate4,
		formats.pointedDate2,
		formats.dateNoDay,
		formats.dateNoDayRev,
		formats.dateTextual,
		formats.dateNoYear,
		formats.dateNoYearRev,
		formats.dateNoColon,
		formats.xmlRpc,
		formats.xmlRpcNoColon,
		formats.soap,
		formats.wddx,
		formats.exif,
		formats.pgydotd,
		formats.isoWeekDay,
		formats.pgTextShort,
		formats.pgTextReverse,
		formats.clf,
		formats.year4,
		formats.ago,
		formats.dayText,
		formats.relativeTextWeek,
		formats.relativeText,
		formats.monthFullOrMonthAbbr,
		formats.tzCorrection,
		formats.tzAbbr,
		formats.dateShortWithTimeShort12,
		formats.dateShortWithTimeLong12,
		formats.dateShortWithTimeShort,
		formats.dateShortWithTimeLong,
		formats.relative,
		formats.whitespace
	]
	const result = Object.create(resultProto)
	while (str.length) {
		let longestMatch = null
		let finalRule = null
		for (let i = 0, l = rules.length; i < l; i++) {
			const format = rules[i]
			const match = str.match(format.regex)
			if (match) {
				if (!longestMatch || match[0].length > longestMatch[0].length) {
					longestMatch = match
					finalRule = format
				}
			}
		}
		if (!finalRule || (finalRule.callback && finalRule.callback.apply(result,
				longestMatch) === false)) {
			return false
		}
		str = str.substr(longestMatch[0].length)
		finalRule = null
		longestMatch = null
	}
	return Math.floor(result.toDate(new Date(now * 1000)) / 1000)
}
phpjed.time = function() {
	//  discuss at: https://locutus.io/php/time/
	// original by: GeekFG (https://geekfg.blogspot.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: metjay
	// improved by: HKM
	//   example 1: var $timeStamp = time()
	//   example 1: var $result = $timeStamp > 1000000000 && $timeStamp < 2000000000
	//   returns 1: true
	return Math.floor(new Date().getTime() / 1000)
}
phpjed.escapeshellarg = function(arg) {
	//  discuss at: https://locutus.io/php/escapeshellarg/
	// Warning: this function emulates escapeshellarg() for php-running-on-linux
	// the function behaves differently when running on Windows, which is not covered by this code.
	//
	// original by: Felix Geisendoerfer (https://www.debuggable.com/felix)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: divinity76 (https://github.com/divinity76)
	//   example 1: escapeshellarg("kevin's birthday")
	//   returns 1: "'kevin'\\''s birthday'"
	//   example 2: escapeshellarg("/home'; whoami;''")
	//   returns 2: "'/home'\\''; whoami;'\\'''\\'''"
	if (arg.indexOf('\x00') !== -1) {
		throw new Error('escapeshellarg(): Argument #1 ($arg) must not contain any null bytes')
	}
	let ret = ''
	ret = arg.replace(/'/g, '\'\\\'\'')
	return "'" + ret + "'"
}
phpjed.basename = function(path, suffix) {
	//  discuss at: https://locutus.io/php/basename/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Ash Searle (https://hexmen.com/blog/)
	// improved by: Lincoln Ramsay
	// improved by: djmix
	// improved by: Dmitry Gorelenkov
	//   example 1: basename('/www/site/home.htm', '.htm')
	//   returns 1: 'home'
	//   example 2: basename('ecra.php?p=1')
	//   returns 2: 'ecra.php?p=1'
	//   example 3: basename('/some/path/')
	//   returns 3: 'path'
	//   example 4: basename('/some/path_ext.ext/','.ext')
	//   returns 4: 'path_ext'
	let b = path
	const lastChar = b.charAt(b.length - 1)
	if (lastChar === '/' || lastChar === '\\') {
		b = b.slice(0, -1)
	}
	b = b.replace(/^.*[/\\]/g, '')
	if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
		b = b.substr(0, b.length - suffix.length)
	}
	return b
}
phpjed.dirname = function(path) {
	//  discuss at: https://locutus.io/php/dirname/
	// original by: Ozh
	// improved by: XoraX (https://www.xorax.info)
	//   example 1: dirname('/etc/passwd')
	//   returns 1: '/etc'
	//   example 2: dirname('c:/Temp/x')
	//   returns 2: 'c:/Temp'
	//   example 3: dirname('/dir/test/')
	//   returns 3: '/dir'
	return path.replace(/\\/g, '/').replace(/\/[^/]*\/?$/, '')
}
phpjed.pathinfo = function(path, options) {
	//  discuss at: https://locutus.io/php/pathinfo/
	// original by: Nate
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Dmitry Gorelenkov
	//    input by: Timo
	//      note 1: Inspired by actual PHP source: php5-5.2.6/ext/standard/string.c line #1559
	//      note 1: The way the bitwise arguments are handled allows for greater flexibility
	//      note 1: & compatability. We might even standardize this
	//      note 1: code and use a similar approach for
	//      note 1: other bitwise PHP functions
	//      note 1: Locutus tries very hard to stay away from a core.js
	//      note 1: file with global dependencies, because we like
	//      note 1: that you can just take a couple of functions and be on your way.
	//      note 1: But by way we implemented this function,
	//      note 1: if you want you can still declare the PATHINFO_*
	//      note 1: yourself, and then you can use:
	//      note 1: pathinfo('/www/index.html', PATHINFO_BASENAME | PATHINFO_EXTENSION);
	//      note 1: which makes it fully compliant with PHP syntax.
	//   example 1: pathinfo('/www/htdocs/index.html', 1)
	//   returns 1: '/www/htdocs'
	//   example 2: pathinfo('/www/htdocs/index.html', 'PATHINFO_BASENAME')
	//   returns 2: 'index.html'
	//   example 3: pathinfo('/www/htdocs/index.html', 'PATHINFO_EXTENSION')
	//   returns 3: 'html'
	//   example 4: pathinfo('/www/htdocs/index.html', 'PATHINFO_FILENAME')
	//   returns 4: 'index'
	//   example 5: pathinfo('/www/htdocs/index.html', 2 | 4)
	//   returns 5: {basename: 'index.html', extension: 'html'}
	//   example 6: pathinfo('/www/htdocs/index.html', 'PATHINFO_ALL')
	//   returns 6: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
	//   example 7: pathinfo('/www/htdocs/index.html')
	//   returns 7: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
	const basename = phpjed.basename
	let opt = ''
	let realOpt = ''
	let optName = ''
	let optTemp = 0
	const tmpArr = {}
	let cnt = 0
	let i = 0
	let haveBasename = false
	let haveExtension = false
	let haveFilename = false
	// Input defaulting & sanitation
	if (!path) {
		return false
	}
	if (!options) {
		options = 'PATHINFO_ALL'
	}
	// Initialize binary arguments. Both the string & integer (constant) input is
	// allowed
	const OPTS = {
		PATHINFO_DIRNAME: 1,
		PATHINFO_BASENAME: 2,
		PATHINFO_EXTENSION: 4,
		PATHINFO_FILENAME: 8,
		PATHINFO_ALL: 0
	}
	// PATHINFO_ALL sums up all previously defined PATHINFOs (could just pre-calculate)
	for (optName in OPTS) {
		if (OPTS.hasOwnProperty(optName)) {
			OPTS.PATHINFO_ALL = OPTS.PATHINFO_ALL | OPTS[optName]
		}
	}
	if (typeof options !== 'number') {
		// Allow for a single string or an array of string flags
		options = [].concat(options)
		for (i = 0; i < options.length; i++) {
			// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
			if (OPTS[options[i]]) {
				optTemp = optTemp | OPTS[options[i]]
			}
		}
		options = optTemp
	}
	// Internal Functions
	const _getExt = function(path) {
		const str = path + ''
		const dotP = str.lastIndexOf('.') + 1
		return !dotP ? false : dotP !== str.length ? str.substr(dotP) : ''
	}
	// Gather path infos
	if (options & OPTS.PATHINFO_DIRNAME) {
		const dirName = path.replace(/\\/g, '/').replace(/\/[^/]*\/?$/, '') // dirname
		tmpArr.dirname = dirName === path ? '.' : dirName
	}
	if (options & OPTS.PATHINFO_BASENAME) {
		if (haveBasename === false) {
			haveBasename = basename(path)
		}
		tmpArr.basename = haveBasename
	}
	if (options & OPTS.PATHINFO_EXTENSION) {
		if (haveBasename === false) {
			haveBasename = basename(path)
		}
		if (haveExtension === false) {
			haveExtension = _getExt(haveBasename)
		}
		if (haveExtension !== false) {
			tmpArr.extension = haveExtension
		}
	}
	if (options & OPTS.PATHINFO_FILENAME) {
		if (haveBasename === false) {
			haveBasename = basename(path)
		}
		if (haveExtension === false) {
			haveExtension = _getExt(haveBasename)
		}
		if (haveFilename === false) {
			haveFilename = haveBasename.slice(0, haveBasename.length - (haveExtension ?
				haveExtension.length + 1 : haveExtension === false ? 0 : 1))
		}
		tmpArr.filename = haveFilename
	}
	// If array contains only 1 element: return string
	cnt = 0
	for (opt in tmpArr) {
		if (tmpArr.hasOwnProperty(opt)) {
			cnt++
			realOpt = opt
		}
	}
	if (cnt === 1) {
		return tmpArr[realOpt]
	}
	// Return full-blown array
	return tmpArr
}
phpjed.function_exists = function(funcName) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/function_exists/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Steve Clay
	// improved by: Legaev Andrey
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: function_exists('isFinite')
	//   returns 1: true
	//        test: skip-1
	const $global = (typeof window !== 'undefined' ? window : global)
	if (typeof funcName === 'string') {
		funcName = $global[funcName]
	}
	return typeof funcName === 'function'
}
phpjed.get_defined_functions = function() { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/get_defined_functions/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Test case 1: If get_defined_functions can find
	//      note 1: itself in the defined functions, it worked :)
	//   example 1: function test_in_array (array, p_val) {for(var i = 0, l = array.length; i < l; i++) {if (array[i] === p_val) return true} return false}
	//   example 1: var $funcs = get_defined_functions()
	//   example 1: var $found = test_in_array($funcs, 'get_defined_functions')
	//   example 1: var $result = $found
	//   returns 1: true
	//        test: skip-1
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	let i = ''
	const arr = []
	const already = {}
	for (i in $global) {
		try {
			if (typeof $global[i] === 'function') {
				if (!already[i]) {
					already[i] = 1
					arr.push(i)
				}
			} else if (typeof $global[i] === 'object') {
				for (const j in $global[i]) {
					if (typeof $global[j] === 'function' && $global[j] && !already[j]) {
						already[j] = 1
						arr.push(j)
					}
				}
			}
		} catch (e) {
			// Some objects in Firefox throw exceptions when their
			// properties are accessed (e.g., sessionStorage)
		}
	}
	return arr
}
phpjed.assert_options = function(what, value) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/assert_options/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: assert_options('ASSERT_CALLBACK')
	//   returns 1: null
	let iniKey, defaultVal
	switch (what) {
		case 'ASSERT_ACTIVE':
			iniKey = 'assert.active'
			defaultVal = 1
			break
		case 'ASSERT_WARNING':
			iniKey = 'assert.warning'
			defaultVal = 1
			var msg = 'We have not yet implemented warnings for us to throw '
			msg += 'in JavaScript (assert_options())'
			throw new Error(msg)
		case 'ASSERT_BAIL':
			iniKey = 'assert.bail'
			defaultVal = 0
			break
		case 'ASSERT_QUIET_EVAL':
			iniKey = 'assert.quiet_eval'
			defaultVal = 0
			break
		case 'ASSERT_CALLBACK':
			iniKey = 'assert.callback'
			defaultVal = null
			break
		default:
			throw new Error('Improper type for assert_options()')
	}
	// I presume this is to be the most recent value, instead of the default value
	const iniVal = phpjed.ini_get(iniKey) || defaultVal
	return iniVal
}
phpjed.getenv = function(varname) {
	//  discuss at: https://locutus.io/php/getenv/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: getenv('LC_ALL')
	//   returns 1: false
	if (typeof process !== 'undefined' || !process.env || !process.env[varname]) {
		return false
	}
	return process.env[varname]
}
phpjed.ini_get = function(varname) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ini_get/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: The ini values must be set by ini_set or manually within an ini file
	//   example 1: ini_set('date.timezone', 'Asia/Hong_Kong')
	//   example 1: ini_get('date.timezone')
	//   returns 1: 'Asia/Hong_Kong'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.ini = $locutus.php.ini || {}
	if ($locutus.php.ini[varname] && $locutus.php.ini[varname].local_value !== undefined) {
		if ($locutus.php.ini[varname].local_value === null) {
			return ''
		}
		return $locutus.php.ini[varname].local_value
	}
	return ''
}
phpjed.ini_set = function(varname, newvalue) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/ini_set/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: This will not set a global_value or access level for the ini item
	//   example 1: ini_set('date.timezone', 'Asia/Hong_Kong')
	//   example 1: ini_set('date.timezone', 'America/Chicago')
	//   returns 1: 'Asia/Hong_Kong'
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	$locutus.php.ini = $locutus.php.ini || {}
	$locutus.php.ini = $locutus.php.ini || {}
	$locutus.php.ini[varname] = $locutus.php.ini[varname] || {}
	const oldval = $locutus.php.ini[varname].local_value
	const lowerStr = (newvalue + '').toLowerCase().trim()
	if (newvalue === true || lowerStr === 'on' || lowerStr === '1') {
		newvalue = 'on'
	}
	if (newvalue === false || lowerStr === 'off' || lowerStr === '0') {
		newvalue = 'off'
	}
	const _setArr = function(oldval) {
		// Although these are set individually, they are all accumulated
		if (typeof oldval === 'undefined') {
			$locutus.ini[varname].local_value = []
		}
		$locutus.ini[varname].local_value.push(newvalue)
	}
	switch (varname) {
		case 'extension':
			_setArr(oldval, newvalue)
			break
		default:
			$locutus.php.ini[varname].local_value = newvalue
			break
	}
	return oldval
}
phpjed.set_time_limit = function(seconds) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/set_time_limit/
	// original by: Brett Zamir (https://brett-zamir.me)
	//        test: skip-all
	//   example 1: set_time_limit(4)
	//   returns 1: undefined
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	setTimeout(function() {
		if (!$locutus.php.timeoutStatus) {
			$locutus.php.timeoutStatus = true
		}
		throw new Error('Maximum execution time exceeded')
	}, seconds * 1000)
}
phpjed.version_compare = function(v1, v2, operator) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/version_compare/
	//      original by: Philippe Jausions (https://pear.php.net/user/jausions)
	//      original by: Aidan Lister (https://aidanlister.com/)
	// reimplemented by: Kankrelune (https://www.webfaktory.info/)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Scott Baker
	//      improved by: Theriault (https://github.com/Theriault)
	//        example 1: version_compare('8.2.5rc', '8.2.5a')
	//        returns 1: 1
	//        example 2: version_compare('8.2.50', '8.2.52', '<')
	//        returns 2: true
	//        example 3: version_compare('5.3.0-dev', '5.3.0')
	//        returns 3: -1
	//        example 4: version_compare('4.1.0.52','4.01.0.51')
	//        returns 4: 1
	// Important: compare must be initialized at 0.
	let i
	let x
	let compare = 0
	// vm maps textual PHP versions to negatives so they're less than 0.
	// PHP currently defines these as CASE-SENSITIVE. It is important to
	// leave these as negatives so that they can come before numerical versions
	// and as if no letters were there to begin with.
	// (1alpha is < 1 and < 1.1 but > 1dev1)
	// If a non-numerical value can't be mapped to this table, it receives
	// -7 as its value.
	const vm = {
		dev: -6,
		alpha: -5,
		a: -5,
		beta: -4,
		b: -4,
		RC: -3,
		rc: -3,
		'#': -2,
		p: 1,
		pl: 1
	}
	// This function will be called to prepare each version argument.
	// It replaces every _, -, and + with a dot.
	// It surrounds any nonsequence of numbers/dots with dots.
	// It replaces sequences of dots with a single dot.
	//    version_compare('4..0', '4.0') === 0
	// Important: A string of 0 length needs to be converted into a value
	// even less than an unexisting value in vm (-7), hence [-8].
	// It's also important to not strip spaces because of this.
	//   version_compare('', ' ') === 1
	const _prepVersion = function(v) {
		v = ('' + v).replace(/[_\-+]/g, '.')
		v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.')
		return (!v.length ? [-8] : v.split('.'))
	}
	// This converts a version component to a number.
	// Empty component becomes 0.
	// Non-numerical component becomes a negative number.
	// Numerical component becomes itself as an integer.
	const _numVersion = function(v) {
		return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10))
	}
	v1 = _prepVersion(v1)
	v2 = _prepVersion(v2)
	x = Math.max(v1.length, v2.length)
	for (i = 0; i < x; i++) {
		if (v1[i] === v2[i]) {
			continue
		}
		v1[i] = _numVersion(v1[i])
		v2[i] = _numVersion(v2[i])
		if (v1[i] < v2[i]) {
			compare = -1
			break
		} else if (v1[i] > v2[i]) {
			compare = 1
			break
		}
	}
	if (!operator) {
		return compare
	}
	// Important: operator is CASE-SENSITIVE.
	// "No operator" seems to be treated as "<."
	// Any other values seem to make the function return null.
	switch (operator) {
		case '>':
		case 'gt':
			return (compare > 0)
		case '>=':
		case 'ge':
			return (compare >= 0)
		case '<=':
		case 'le':
			return (compare <= 0)
		case '===':
		case '=':
		case 'eq':
			return (compare === 0)
		case '<>':
		case '!==':
		case 'ne':
			return (compare !== 0)
		case '':
		case '<':
		case 'lt':
			return (compare < 0)
		default:
			return null
	}
}
phpjed.json_encode = function(mixedVal) { // eslint-disable-line camelcase
	//       discuss at: https://phpjs.org/functions/json_encode/
	//      original by: Public Domain (https://www.json.org/json2.js)
	// reimplemented by: Kevin van Zonneveld (https://kevin.vanzonneveld.net)
	//      improved by: Michael White
	//         input by: felix
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//        example 1: json_encode('Kevin')
	//        returns 1: '"Kevin"'
	/*
	  https://www.JSON.org/json2.js
	  2008-11-19
	  Public Domain.
	  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	  See https://www.JSON.org/js.html
	*/
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	const json = $global.JSON
	let retVal
	try {
		if (typeof json === 'object' && typeof json.stringify === 'function') {
			// Errors will not be caught here if our own equivalent to resource
			retVal = json.stringify(mixedVal)
			if (retVal === undefined) {
				throw new SyntaxError('json_encode')
			}
			return retVal
		}
		const value = mixedVal
		const quote = function(string) {
			const escapeChars = ['\u0000-\u001f', '\u007f-\u009f', '\u00ad',
				'\u0600-\u0604', '\u070f', '\u17b4', '\u17b5', '\u200c-\u200f',
				'\u2028-\u202f', '\u2060-\u206f', '\ufeff', '\ufff0-\uffff'
			].join('')
			const escapable = new RegExp('[\\"' + escapeChars + ']', 'g')
			const meta = {
				// table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"': '\\"',
				'\\': '\\\\'
			}
			escapable.lastIndex = 0
			return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
				const c = meta[a]
				return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0)
					.toString(16)).slice(-4)
			}) + '"' : '"' + string + '"'
		}
		var _str = function(key, holder) {
			let gap = ''
			const indent = '    '
			// The loop counter.
			let i = 0
			// The member key.
			let k = ''
			// The member value.
			let v = ''
			let length = 0
			const mind = gap
			let partial = []
			let value = holder[key]
			// If the value has a toJSON method, call it to obtain a replacement value.
			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key)
			}
			// What happens next depends on the value's type.
			switch (typeof value) {
				case 'string':
					return quote(value)
				case 'number':
					// JSON numbers must be finite. Encode non-finite numbers as null.
					return isFinite(value) ? String(value) : 'null'
				case 'boolean':
					// If the value is a boolean or null, convert it to a string.
					return String(value)
				case 'object':
					// If the type is 'object', we might be dealing with an object or an array or
					// null.
					// Due to a specification blunder in ECMAScript, typeof null is 'object',
					// so watch out for that case.
					if (!value) {
						return 'null'
					}
					// Make an array to hold the partial results of stringifying this object value.
					gap += indent
					partial = []
					// Is the value an array?
					if (Object.prototype.toString.apply(value) === '[object Array]') {
						// The value is an array. Stringify every element. Use null as a placeholder
						// for non-JSON values.
						length = value.length
						for (i = 0; i < length; i += 1) {
							partial[i] = _str(i, value) || 'null'
						}
						// Join all of the elements together, separated with commas, and wrap them in
						// brackets.
						v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(
								',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') +
							']'
						// gap = mind // not used
						return v
					}
					// Iterate through all of the keys in the object.
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = _str(k, value)
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v)
							}
						}
					}
					// Join all of the member texts together, separated with commas,
					// and wrap them in braces.
					v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(
						',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}'
					// gap = mind // Not used
					return v
				case 'undefined':
				case 'function':
				default:
					throw new SyntaxError('json_encode')
			}
		}
		// Make a fake root object containing our value under the key of ''.
		// Return the result of stringifying the value.
		return _str('', {
			'': value
		})
	} catch (err) {
		// @todo: ensure error handling above throws a SyntaxError in all cases where it could
		// (i.e., when the JSON global is not available and there is an error)
		if (!(err instanceof SyntaxError)) {
			throw new Error('Unexpected error type in json_encode()')
		}
		// usable by json_last_error()
		$locutus.php.last_error_json = 4
		return null
	}
}
phpjed.json_last_error = function() { // eslint-disable-line camelcase
	//  discuss at: https://phpjs.org/functions/json_last_error/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: json_last_error()
	//   returns 1: 0
	// JSON_ERROR_NONE = 0
	// max depth limit to be removed per PHP comments in json.c (not possible in JS?):
	// JSON_ERROR_DEPTH = 1
	// internal use? also not documented:
	// JSON_ERROR_STATE_MISMATCH = 2
	// [\u0000-\u0008\u000B-\u000C\u000E-\u001F] if used directly within json_decode():
	// JSON_ERROR_CTRL_CHAR = 3
	// but JSON functions auto-escape these, so error not possible in JavaScript
	// JSON_ERROR_SYNTAX = 4
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	return $locutus.php && $locutus.php.last_error_json ? $locutus.php.last_error_json : 0
}
phpjed.abs = function(mixedNumber) {
	//  discuss at: https://locutus.io/php/abs/
	// original by: Waldo Malqui Silva (https://waldo.malqui.info)
	// improved by: Karol Kowalski
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	//   example 1: abs(4.2)
	//   returns 1: 4.2
	//   example 2: abs(-4.2)
	//   returns 2: 4.2
	//   example 3: abs(-5)
	//   returns 3: 5
	//   example 4: abs('_argos')
	//   returns 4: 0
	return Math.abs(mixedNumber) || 0
}
phpjed.acos = function(arg) {
	//  discuss at: https://locutus.io/php/acos/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//      note 1: Sorry about the crippled test. Needed because precision differs accross platforms.
	//   example 1: (acos(0.3) + '').substr(0, 17)
	//   returns 1: "1.266103672779499"
	return Math.acos(arg)
}
phpjed.acosh = function(arg) {
	//  discuss at: https://locutus.io/php/acosh/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: acosh(8723321.4)
	//   returns 1: 16.674657798418625
	return Math.log(arg + Math.sqrt(arg * arg - 1))
}
phpjed.asin = function(arg) {
	//  discuss at: https://locutus.io/php/asin/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//      note 1: Sorry about the crippled test. Needed because precision differs accross platforms.
	//   example 1: (asin(0.3) + '').substr(0, 17)
	//   returns 1: "0.304692654015397"
	return Math.asin(arg)
}
phpjed.asinh = function(arg) {
	//  discuss at: https://locutus.io/php/asinh/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: asinh(8723321.4)
	//   returns 1: 16.67465779841863
	return Math.log(arg + Math.sqrt(arg * arg + 1))
}
phpjed.atan = function(arg) {
	//  discuss at: https://locutus.io/php/atan/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: atan(8723321.4)
	//   returns 1: 1.5707962121596615
	return Math.atan(arg)
}
phpjed.atan2 = function(y, x) {
	//  discuss at: https://locutus.io/php/atan2/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: atan2(1, 1)
	//   returns 1: 0.7853981633974483
	return Math.atan2(y, x)
}
phpjed.atanh = function(arg) {
	//  discuss at: https://locutus.io/php/atanh/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: atanh(0.3)
	//   returns 1: 0.3095196042031118
	return 0.5 * Math.log((1 + arg) / (1 - arg))
}
phpjed.base_convert = function(number, frombase, tobase) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/base_convert/
	// original by: Philippe Baumann
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	//   example 1: base_convert('A37334', 16, 2)
	//   returns 1: '101000110111001100110100'
	return parseInt(number + '', frombase | 0).toString(tobase | 0)
}
phpjed.bindec = function(binaryString) {
	//  discuss at: https://locutus.io/php/bindec/
	// original by: Philippe Baumann
	//   example 1: bindec('110011')
	//   returns 1: 51
	//   example 2: bindec('000110011')
	//   returns 2: 51
	//   example 3: bindec('111')
	//   returns 3: 7
	binaryString = (binaryString + '').replace(/[^01]/gi, '')
	return parseInt(binaryString, 2)
}
phpjed.ceil = function(value) {
	//  discuss at: https://locutus.io/php/ceil/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: ceil(8723321.4)
	//   returns 1: 8723322
	return Math.ceil(value)
}
phpjed.cos = function(arg) {
	//  discuss at: https://locutus.io/php/cos/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: Math.ceil(cos(8723321.4) * 10000000)
	//   returns 1: -1812718
	return Math.cos(arg)
}
phpjed.cosh = function(arg) {
	//  discuss at: https://locutus.io/php/cosh/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: cosh(-0.18127180117607017)
	//   returns 1: 1.0164747716114113
	return (Math.exp(arg) + Math.exp(-arg)) / 2
}
phpjed.decbin = function(number) {
	//  discuss at: https://locutus.io/php/decbin/
	// original by: Enrique Gonzalez
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
	//    input by: pilus
	//    input by: nord_ua
	//   example 1: decbin(12)
	//   returns 1: '1100'
	//   example 2: decbin(26)
	//   returns 2: '11010'
	//   example 3: decbin('26')
	//   returns 3: '11010'
	if (number < 0) {
		number = 0xFFFFFFFF + number + 1
	}
	return parseInt(number, 10).toString(2)
}
phpjed.dechex = function(number) {
	//  discuss at: https://locutus.io/php/dechex/
	// original by: Philippe Baumann
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
	//    input by: pilus
	//   example 1: dechex(10)
	//   returns 1: 'a'
	//   example 2: dechex(47)
	//   returns 2: '2f'
	//   example 3: dechex(-1415723993)
	//   returns 3: 'ab9dc427'
	if (number < 0) {
		number = 0xFFFFFFFF + number + 1
	}
	return parseInt(number, 10).toString(16)
}
phpjed.decoct = function(number) {
	//  discuss at: https://locutus.io/php/decoct/
	// original by: Enrique Gonzalez
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
	//    input by: pilus
	//   example 1: decoct(15)
	//   returns 1: '17'
	//   example 2: decoct(264)
	//   returns 2: '410'
	if (number < 0) {
		number = 0xFFFFFFFF + number + 1
	}
	return parseInt(number, 10).toString(8)
}
phpjed.deg2rad = function(angle) {
	//  discuss at: https://locutus.io/php/deg2rad/
	// original by: Enrique Gonzalez
	// improved by: Thomas Grainger (https://graingert.co.uk)
	//   example 1: deg2rad(45)
	//   returns 1: 0.7853981633974483
	return angle * 0.017453292519943295 // (angle / 180) * Math.PI;
}
phpjed.exp = function(arg) {
	//  discuss at: https://locutus.io/php/exp/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: exp(0.3)
	//   returns 1: 1.3498588075760032
	return Math.exp(arg)
}
phpjed.expm1 = function(x) {
	//  discuss at: https://locutus.io/php/expm1/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Robert Eisele (https://www.xarg.org/)
	//      note 1: Precision 'n' can be adjusted as desired
	//   example 1: expm1(1e-15)
	//   returns 1: 1.0000000000000007e-15
	return (x < 1e-5 && x > -1e-5) ? x + 0.5 * x * x : Math.exp(x) - 1
}
phpjed.floor = function(value) {
	//  discuss at: https://locutus.io/php/floor/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: floor(8723321.4)
	//   returns 1: 8723321
	return Math.floor(value)
}
phpjed.fmod = function(x, y) {
	//  discuss at: https://locutus.io/php/fmod/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: fmod(5.7, 1.3)
	//   returns 1: 0.5
	let tmp
	let tmp2
	let p = 0
	let pY = 0
	let l = 0.0
	let l2 = 0.0
	tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/)
	p = parseInt(tmp[2], 10) - (tmp[1] + '').length
	tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/)
	pY = parseInt(tmp[2], 10) - (tmp[1] + '').length
	if (pY > p) {
		p = pY
	}
	tmp2 = (x % y)
	if (p < -100 || p > 20) {
		// toFixed will give an out of bound error so we fix it like this:
		l = Math.round(Math.log(tmp2) / Math.log(10))
		l2 = Math.pow(10, l)
		return (tmp2 / l2).toFixed(l - p) * l2
	} else {
		return parseFloat(tmp2.toFixed(-p))
	}
}
phpjed.getrandmax = function() {
	//  discuss at: https://locutus.io/php/getrandmax/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: getrandmax()
	//   returns 1: 2147483647
	return 2147483647
}
phpjed.hexdec = function(hexString) {
	//  discuss at: https://locutus.io/php/hexdec/
	// original by: Philippe Baumann
	//   example 1: hexdec('that')
	//   returns 1: 10
	//   example 2: hexdec('a0')
	//   returns 2: 160
	hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
	return parseInt(hexString, 16)
}
phpjed.hypot = function(x, y) {
	//  discuss at: https://locutus.io/php/hypot/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// imprived by: Robert Eisele (https://www.xarg.org/)
	//   example 1: hypot(3, 4)
	//   returns 1: 5
	//   example 2: hypot([], 'a')
	//   returns 2: null
	x = Math.abs(x)
	y = Math.abs(y)
	let t = Math.min(x, y)
	x = Math.max(x, y)
	t = t / x
	return x * Math.sqrt(1 + t * t) || null
}
phpjed.is_finite = function(val) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_finite/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: is_finite(Infinity)
	//   returns 1: false
	//   example 2: is_finite(-Infinity)
	//   returns 2: false
	//   example 3: is_finite(0)
	//   returns 3: true
	let warningType = ''
	if (val === Infinity || val === -Infinity) {
		return false
	}
	// Some warnings for maximum PHP compatibility
	if (typeof val === 'object') {
		warningType = (Object.prototype.toString.call(val) === '[object Array]' ? 'array' :
			'object')
	} else if (typeof val === 'string' && !val.match(/^[+-]?\d/)) {
		// simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
		warningType = 'string'
	}
	if (warningType) {
		const msg = 'Warning: is_finite() expects parameter 1 to be double, ' + warningType +
			' given'
		throw new Error(msg)
	}
	return true
}
phpjed.is_infinite = function(val) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_infinite/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: is_infinite(Infinity)
	//   returns 1: true
	//   example 2: is_infinite(-Infinity)
	//   returns 2: true
	//   example 3: is_infinite(0)
	//   returns 3: false
	let warningType = ''
	if (val === Infinity || val === -Infinity) {
		return true
	}
	// Some warnings for maximum PHP compatibility
	if (typeof val === 'object') {
		warningType = (Object.prototype.toString.call(val) === '[object Array]' ? 'array' :
			'object')
	} else if (typeof val === 'string' && !val.match(/^[+-]?\d/)) {
		// simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
		warningType = 'string'
	}
	if (warningType) {
		const msg = 'Warning: is_infinite() expects parameter 1 to be double, ' + warningType +
			' given'
		throw new Error(msg)
	}
	return false
}
phpjed.is_nan = function(val) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_nan/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//    input by: Robin
	//   example 1: is_nan(NaN)
	//   returns 1: true
	//   example 2: is_nan(0)
	//   returns 2: false
	let warningType = ''
	if (typeof val === 'number' && isNaN(val)) {
		return true
	}
	// Some errors for maximum PHP compatibility
	if (typeof val === 'object') {
		warningType = (Object.prototype.toString.call(val) === '[object Array]' ? 'array' :
			'object')
	} else if (typeof val === 'string' && !val.match(/^[+-]?\d/)) {
		// simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
		warningType = 'string'
	}
	if (warningType) {
		throw new Error('Warning: is_nan() expects parameter 1 to be double, ' + warningType +
			' given')
	}
	return false
}
phpjed.lcg_value = function() { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/lcg_value/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: var $rnd = lcg_value()
	//   example 1: var $result = $rnd >= 0 && $rnd <= 1
	//   returns 1: true
	return Math.random()
}
phpjed.log = function(arg, base) {
	//  discuss at: https://locutus.io/php/log/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: log(8723321.4, 7)
	//   returns 1: 8.212871815082147
	return (typeof base === 'undefined') ? Math.log(arg) : Math.log(arg) / Math.log(base)
}
phpjed.log10 = function(arg) {
	//  discuss at: https://locutus.io/php/log10/
	// original by: Philip Peterson
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Tod Gentille
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: log10(10)
	//   returns 1: 1
	//   example 2: log10(1)
	//   returns 2: 0
	return Math.log(arg) / 2.302585092994046 // Math.LN10
}
phpjed.log1p = function(x) {
	//  discuss at: https://locutus.io/php/log1p/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Robert Eisele (https://www.xarg.org/)
	//      note 1: Precision 'n' can be adjusted as desired
	//   example 1: log1p(1e-15)
	//   returns 1: 9.999999999999995e-16
	let ret = 0
	// degree of precision
	const n = 50
	if (x <= -1) {
		// JavaScript style would be to return Number.NEGATIVE_INFINITY
		return '-INF'
	}
	if (x < 0 || x > 1) {
		return Math.log(1 + x)
	}
	for (let i = 1; i < n; i++) {
		ret += Math.pow(-x, i) / i
	}
	return -ret
}
phpjed.max = function() {
	//  discuss at: https://locutus.io/php/max/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Jack
	//      note 1: Long code cause we're aiming for maximum PHP compatibility
	//   example 1: max(1, 3, 5, 6, 7)
	//   returns 1: 7
	//   example 2: max([2, 4, 5])
	//   returns 2: 5
	//   example 3: max(0, 'hello')
	//   returns 3: 0
	//   example 4: max('hello', 0)
	//   returns 4: 'hello'
	//   example 5: max(-1, 'hello')
	//   returns 5: 'hello'
	//   example 6: max([2, 4, 8], [2, 5, 7])
	//   returns 6: [2, 5, 7]
	let ar
	let retVal
	let i = 0
	let n = 0
	const argv = arguments
	const argc = argv.length
	const _obj2Array = function(obj) {
		if (Object.prototype.toString.call(obj) === '[object Array]') {
			return obj
		} else {
			const ar = []
			for (const i in obj) {
				if (obj.hasOwnProperty(i)) {
					ar.push(obj[i])
				}
			}
			return ar
		}
	}
	var _compare = function(current, next) {
		let i = 0
		let n = 0
		let tmp = 0
		let nl = 0
		let cl = 0
		if (current === next) {
			return 0
		} else if (typeof current === 'object') {
			if (typeof next === 'object') {
				current = _obj2Array(current)
				next = _obj2Array(next)
				cl = current.length
				nl = next.length
				if (nl > cl) {
					return 1
				} else if (nl < cl) {
					return -1
				}
				for (i = 0, n = cl; i < n; ++i) {
					tmp = _compare(current[i], next[i])
					if (tmp === 1) {
						return 1
					} else if (tmp === -1) {
						return -1
					}
				}
				return 0
			}
			return -1
		} else if (typeof next === 'object') {
			return 1
		} else if (isNaN(next) && !isNaN(current)) {
			if (current === 0) {
				return 0
			}
			return (current < 0 ? 1 : -1)
		} else if (isNaN(current) && !isNaN(next)) {
			if (next === 0) {
				return 0
			}
			return (next > 0 ? 1 : -1)
		}
		if (next === current) {
			return 0
		}
		return (next > current ? 1 : -1)
	}
	if (argc === 0) {
		throw new Error('At least one value should be passed to max()')
	} else if (argc === 1) {
		if (typeof argv[0] === 'object') {
			ar = _obj2Array(argv[0])
		} else {
			throw new Error('Wrong parameter count for max()')
		}
		if (ar.length === 0) {
			throw new Error('Array must contain at least one element for max()')
		}
	} else {
		ar = argv
	}
	retVal = ar[0]
	for (i = 1, n = ar.length; i < n; ++i) {
		if (_compare(retVal, ar[i]) === 1) {
			retVal = ar[i]
		}
	}
	return retVal
}
phpjed.min = function() {
	//  discuss at: https://locutus.io/php/min/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Jack
	//      note 1: Long code cause we're aiming for maximum PHP compatibility
	//   example 1: min(1, 3, 5, 6, 7)
	//   returns 1: 1
	//   example 2: min([2, 4, 5])
	//   returns 2: 2
	//   example 3: min(0, 'hello')
	//   returns 3: 0
	//   example 4: min('hello', 0)
	//   returns 4: 'hello'
	//   example 5: min(-1, 'hello')
	//   returns 5: -1
	//   example 6: min([2, 4, 8], [2, 5, 7])
	//   returns 6: [2, 4, 8]
	let ar
	let retVal
	let i = 0
	let n = 0
	const argv = arguments
	const argc = argv.length
	const _obj2Array = function(obj) {
		if (Object.prototype.toString.call(obj) === '[object Array]') {
			return obj
		}
		const ar = []
		for (const i in obj) {
			if (obj.hasOwnProperty(i)) {
				ar.push(obj[i])
			}
		}
		return ar
	}
	var _compare = function(current, next) {
		let i = 0
		let n = 0
		let tmp = 0
		let nl = 0
		let cl = 0
		if (current === next) {
			return 0
		} else if (typeof current === 'object') {
			if (typeof next === 'object') {
				current = _obj2Array(current)
				next = _obj2Array(next)
				cl = current.length
				nl = next.length
				if (nl > cl) {
					return 1
				} else if (nl < cl) {
					return -1
				}
				for (i = 0, n = cl; i < n; ++i) {
					tmp = _compare(current[i], next[i])
					if (tmp === 1) {
						return 1
					} else if (tmp === -1) {
						return -1
					}
				}
				return 0
			}
			return -1
		} else if (typeof next === 'object') {
			return 1
		} else if (isNaN(next) && !isNaN(current)) {
			if (current === 0) {
				return 0
			}
			return (current < 0 ? 1 : -1)
		} else if (isNaN(current) && !isNaN(next)) {
			if (next === 0) {
				return 0
			}
			return (next > 0 ? 1 : -1)
		}
		if (next === current) {
			return 0
		}
		return (next > current ? 1 : -1)
	}
	if (argc === 0) {
		throw new Error('At least one value should be passed to min()')
	} else if (argc === 1) {
		if (typeof argv[0] === 'object') {
			ar = _obj2Array(argv[0])
		} else {
			throw new Error('Wrong parameter count for min()')
		}
		if (ar.length === 0) {
			throw new Error('Array must contain at least one element for min()')
		}
	} else {
		ar = argv
	}
	retVal = ar[0]
	for (i = 1, n = ar.length; i < n; ++i) {
		if (_compare(retVal, ar[i]) === -1) {
			retVal = ar[i]
		}
	}
	return retVal
}
phpjed.mt_getrandmax = function() { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/mt_getrandmax/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: mt_getrandmax()
	//   returns 1: 2147483647
	return 2147483647
}
phpjed.mt_rand = function(min, max) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/mt_rand/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: Kongo
	//   example 1: mt_rand(1, 1)
	//   returns 1: 1
	const argc = arguments.length
	if (argc === 0) {
		min = 0
		max = 2147483647
	} else if (argc === 1) {
		throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given')
	} else {
		min = parseInt(min, 10)
		max = parseInt(max, 10)
	}
	return Math.floor(Math.random() * (max - min + 1)) + min
}
phpjed.octdec = function(octString) {
	//  discuss at: https://locutus.io/php/octdec/
	// original by: Philippe Baumann
	//   example 1: octdec('77')
	//   returns 1: 63
	octString = (octString + '').replace(/[^0-7]/gi, '')
	return parseInt(octString, 8)
}
phpjed.pi = function() {
	//  discuss at: https://locutus.io/php/pi/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: dude
	//   example 1: pi(8723321.4)
	//   returns 1: 3.141592653589793
	return 3.141592653589793 // Math.PI
}
phpjed.pow = function(base, exp) {
	//  discuss at: https://locutus.io/php/pow/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Waldo Malqui Silva (https://fayr.us/waldo/)
	//   example 1: pow(8723321.4, 7)
	//   returns 1: 3.8439091680779e+48
	return Number(Math.pow(base, exp).toPrecision(15))
}
phpjed.rad2deg = function(angle) {
	//  discuss at: https://locutus.io/php/rad2deg/
	// original by: Enrique Gonzalez
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: rad2deg(3.141592653589793)
	//   returns 1: 180
	return angle * 57.29577951308232 // angle / Math.PI * 180
}
phpjed.rand = function(min, max) {
	//  discuss at: https://locutus.io/php/rand/
	// original by: Leslie Hoare
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//      note 1: See the commented out code below for a version which
	//      note 1: will work with our experimental (though probably unnecessary)
	//      note 1: srand() function)
	//   example 1: rand(1, 1)
	//   returns 1: 1
	const argc = arguments.length
	if (argc === 0) {
		min = 0
		max = 2147483647
	} else if (argc === 1) {
		throw new Error('Warning: rand() expects exactly 2 parameters, 1 given')
	}
	return Math.floor(Math.random() * (max - min + 1)) + min
}
phpjed.roundToInt = function(value, mode) {
	let tmp = Math.floor(Math.abs(value) + 0.5)
	if (
		(mode === 'PHP_ROUND_HALF_DOWN' && value === (tmp - 0.5)) || (mode ===
			'PHP_ROUND_HALF_EVEN' && value === (0.5 + 2 * Math.floor(tmp / 2))) || (mode ===
			'PHP_ROUND_HALF_ODD' && value === (0.5 + 2 * Math.floor(tmp / 2) - 1))) {
		tmp -= 1
	}
	return value < 0 ? -tmp : tmp
}
phpjed.round = function(value, precision = 0, mode = 'PHP_ROUND_HALF_UP') {
	//  discuss at: https://locutus.io/php/round/
	// original by: Philip Peterson
	//  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	//  revised by: T.Wild
	//  revised by: Rafał Kukawski (https://blog.kukawski.pl)
	//    input by: Greenseed
	//    input by: meo
	//    input by: William
	//    input by: Josep Sanz (https://www.ws3.es/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Rafał Kukawski
	//   example 1: round(1241757, -3)
	//   returns 1: 1242000
	//   example 2: round(3.6)
	//   returns 2: 4
	//   example 3: round(2.835, 2)
	//   returns 3: 2.84
	//   example 4: round(1.1749999999999, 2)
	//   returns 4: 1.17
	//   example 5: round(58551.799999999996, 2)
	//   returns 5: 58551.8
	//   example 6: round(4096.485, 2)
	//   returns 6: 4096.49
	const floatCast = phpjed._php_cast_float
	const intCast = phpjed._php_cast_int
	let p
	// the code is heavily based on the native PHP implementation
	// https://github.com/php/php-src/blob/PHP-7.4/ext/standard/math.c#L355
	value = floatCast(value)
	precision = intCast(precision)
	p = Math.pow(10, precision)
	if (isNaN(value) || !isFinite(value)) {
		return value
	}
	// if value already integer and positive precision
	// then nothing to do, return early
	if (Math.trunc(value) === value && precision >= 0) {
		return value
	}
	// PHP does a pre-rounding before rounding to desired precision
	// https://wiki.php.net/rfc/rounding#pre-rounding_to_the_value_s_precision_if_possible
	const preRoundPrecision = 14 - Math.floor(Math.log10(Math.abs(value)))
	if (preRoundPrecision > precision && preRoundPrecision - 15 < precision) {
		value = phpjed.roundToInt(value * Math.pow(10, preRoundPrecision), mode)
		value /= Math.pow(10, Math.abs(precision - preRoundPrecision))
	} else {
		value *= p
	}
	value = phpjed.roundToInt(value, mode)
	return value / p
}
phpjed.sin = function(arg) {
	//  discuss at: https://locutus.io/php/sin/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: Math.ceil(sin(8723321.4) * 10000000)
	//   returns 1: -9834330
	return Math.sin(arg)
}
phpjed.sinh = function(arg) {
	//  discuss at: https://locutus.io/php/sinh/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: sinh(-0.9834330348825909)
	//   returns 1: -1.1497971402636502
	return (Math.exp(arg) - Math.exp(-arg)) / 2
}
phpjed.sqrt = function(arg) {
	//  discuss at: https://locutus.io/php/sqrt/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: sqrt(8723321.4)
	//   returns 1: 2953.5269424875746
	return Math.sqrt(arg)
}
phpjed.tan = function(arg) {
	//  discuss at: https://locutus.io/php/tan/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: Math.ceil(tan(8723321.4) * 10000000)
	//   returns 1: 54251849
	return Math.tan(arg)
}
phpjed.tanh = function(arg) {
	//  discuss at: https://locutus.io/php/tanh/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// imprived by: Robert Eisele (https://www.xarg.org/)
	//   example 1: tanh(5.4251848798444815)
	//   returns 1: 0.9999612058841574
	return 1 - 2 / (Math.exp(2 * arg) + 1)
}
phpjed.pack = function(format) {
	//  discuss at: https://locutus.io/php/pack/
	// original by: Tim de Koning (https://www.kingsquare.nl)
	//    parts by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// bugfixed by: Tim de Koning (https://www.kingsquare.nl)
	//      note 1: Float encoding by: Jonas Raoni Soares Silva
	//      note 1: Home: https://www.kingsquare.nl/blog/12-12-2009/13507444
	//      note 1: Feedback: phpjs-pack@kingsquare.nl
	//      note 1: "machine dependent byte order and size" aren't
	//      note 1: applicable for JavaScript; pack works as on a 32bit,
	//      note 1: little endian machine.
	//   example 1: pack('nvc*', 0x1234, 0x5678, 65, 66)
	//   returns 1: '\u00124xVAB'
	//   example 2: pack('H4', '2345')
	//   returns 2: '#E'
	//   example 3: pack('H*', 'D5')
	//   returns 3: 'Õ'
	//   example 4: pack('d', -100.876)
	//   returns 4: "\u0000\u0000\u0000\u0000\u00008YÀ"
	//        test: skip-1
	let formatPointer = 0
	let argumentPointer = 1
	let result = ''
	let argument = ''
	let i = 0
	let r = []
	let instruction, quantifier, word, precisionBits, exponentBits, extraNullCount
	// vars used by float encoding
	let bias
	let minExp
	let maxExp
	let minUnnormExp
	let status
	let exp
	let len
	let bin
	let signal
	let n
	let intPart
	let floatPart
	let lastBit
	let rounded
	let j
	let k
	let tmpResult
	while (formatPointer < format.length) {
		instruction = format.charAt(formatPointer)
		quantifier = ''
		formatPointer++
		while ((formatPointer < format.length) && (format.charAt(formatPointer).match(
				/[\d*]/) !== null)) {
			quantifier += format.charAt(formatPointer)
			formatPointer++
		}
		if (quantifier === '') {
			quantifier = '1'
		}
		// Now pack variables: 'quantifier' times 'instruction'
		switch (instruction) {
			case 'a':
			case 'A':
				// NUL-padded string
				// SPACE-padded string
				if (typeof arguments[argumentPointer] === 'undefined') {
					throw new Error('Warning:  pack() Type ' + instruction +
						': not enough arguments')
				} else {
					argument = String(arguments[argumentPointer])
				}
				if (quantifier === '*') {
					quantifier = argument.length
				}
				for (i = 0; i < quantifier; i++) {
					if (typeof argument[i] === 'undefined') {
						if (instruction === 'a') {
							result += String.fromCharCode(0)
						} else {
							result += ' '
						}
					} else {
						result += argument[i]
					}
				}
				argumentPointer++
				break
			case 'h':
			case 'H':
				// Hex string, low nibble first
				// Hex string, high nibble first
				if (typeof arguments[argumentPointer] === 'undefined') {
					throw new Error('Warning: pack() Type ' + instruction +
						': not enough arguments')
				} else {
					argument = arguments[argumentPointer]
				}
				if (quantifier === '*') {
					quantifier = argument.length
				}
				if (quantifier > argument.length) {
					const msg = 'Warning: pack() Type ' + instruction +
						': not enough characters in string'
					throw new Error(msg)
				}
				for (i = 0; i < quantifier; i += 2) {
					// Always get per 2 bytes...
					word = argument[i]
					if (((i + 1) >= quantifier) || typeof argument[i + 1] === 'undefined') {
						word += '0'
					} else {
						word += argument[i + 1]
					}
					// The fastest way to reverse?
					if (instruction === 'h') {
						word = word[1] + word[0]
					}
					result += String.fromCharCode(parseInt(word, 16))
				}
				argumentPointer++
				break
			case 'c':
			case 'C':
				// signed char
				// unsigned char
				// c and C is the same in pack
				if (quantifier === '*') {
					quantifier = arguments.length - argumentPointer
				}
				if (quantifier > (arguments.length - argumentPointer)) {
					throw new Error('Warning:  pack() Type ' + instruction +
						': too few arguments')
				}
				for (i = 0; i < quantifier; i++) {
					result += String.fromCharCode(arguments[argumentPointer])
					argumentPointer++
				}
				break
			case 's':
			case 'S':
			case 'v':
				// signed short (always 16 bit, machine byte order)
				// unsigned short (always 16 bit, machine byte order)
				// s and S is the same in pack
				if (quantifier === '*') {
					quantifier = arguments.length - argumentPointer
				}
				if (quantifier > (arguments.length - argumentPointer)) {
					throw new Error('Warning:  pack() Type ' + instruction +
						': too few arguments')
				}
				for (i = 0; i < quantifier; i++) {
					result += String.fromCharCode(arguments[argumentPointer] & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF)
					argumentPointer++
				}
				break
			case 'n':
				// unsigned short (always 16 bit, big endian byte order)
				if (quantifier === '*') {
					quantifier = arguments.length - argumentPointer
				}
				if (quantifier > (arguments.length - argumentPointer)) {
					throw new Error('Warning: pack() Type ' + instruction +
						': too few arguments')
				}
				for (i = 0; i < quantifier; i++) {
					result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] & 0xFF)
					argumentPointer++
				}
				break
			case 'i':
			case 'I':
			case 'l':
			case 'L':
			case 'V':
				// signed integer (machine dependent size and byte order)
				// unsigned integer (machine dependent size and byte order)
				// signed long (always 32 bit, machine byte order)
				// unsigned long (always 32 bit, machine byte order)
				// unsigned long (always 32 bit, little endian byte order)
				if (quantifier === '*') {
					quantifier = arguments.length - argumentPointer
				}
				if (quantifier > (arguments.length - argumentPointer)) {
					throw new Error('Warning:  pack() Type ' + instruction +
						': too few arguments')
				}
				for (i = 0; i < quantifier; i++) {
					result += String.fromCharCode(arguments[argumentPointer] & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF)
					argumentPointer++
				}
				break
			case 'N':
				// unsigned long (always 32 bit, big endian byte order)
				if (quantifier === '*') {
					quantifier = arguments.length - argumentPointer
				}
				if (quantifier > (arguments.length - argumentPointer)) {
					throw new Error('Warning:  pack() Type ' + instruction +
						': too few arguments')
				}
				for (i = 0; i < quantifier; i++) {
					result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF)
					result += String.fromCharCode(arguments[argumentPointer] & 0xFF)
					argumentPointer++
				}
				break
			case 'f':
			case 'd':
				// float (machine dependent size and representation)
				// double (machine dependent size and representation)
				// version based on IEEE754
				precisionBits = 23
				exponentBits = 8
				if (instruction === 'd') {
					precisionBits = 52
					exponentBits = 11
				}
				if (quantifier === '*') {
					quantifier = arguments.length - argumentPointer
				}
				if (quantifier > (arguments.length - argumentPointer)) {
					throw new Error('Warning:  pack() Type ' + instruction +
						': too few arguments')
				}
				for (i = 0; i < quantifier; i++) {
					argument = arguments[argumentPointer]
					bias = Math.pow(2, exponentBits - 1) - 1
					minExp = -bias + 1
					maxExp = bias
					minUnnormExp = minExp - precisionBits
					status = isNaN(n = parseFloat(argument)) || n === -Infinity || n === +
						Infinity ? n : 0
					exp = 0
					len = 2 * bias + 1 + precisionBits + 3
					bin = new Array(len)
					signal = (n = status !== 0 ? 0 : n) < 0
					n = Math.abs(n)
					intPart = Math.floor(n)
					floatPart = n - intPart
					for (k = len; k;) {
						bin[--k] = 0
					}
					for (k = bias + 2; intPart && k;) {
						bin[--k] = intPart % 2
						intPart = Math.floor(intPart / 2)
					}
					for (k = bias + 1; floatPart > 0 && k; --floatPart) {
						(bin[++k] = ((floatPart *= 2) >= 1) - 0)
					}
					for (k = -1; ++k < len && !bin[k];) {}
					// @todo: Make this more readable:
					const key = (lastBit = precisionBits - 1 + (k = (exp = bias + 1 - k) >=
							minExp && exp <= maxExp ? k + 1 : bias + 1 - (exp = minExp - 1)
							)) + 1
					if (bin[key]) {
						if (!(rounded = bin[lastBit])) {
							for (j = lastBit + 2; !rounded && j < len; rounded = bin[j++]) {}
						}
						for (j = lastBit + 1; rounded && --j >= 0;
							(bin[j] = !bin[j] - 0) && (rounded = 0)) {}
					}
					for (k = k - 2 < 0 ? -1 : k - 3; ++k < len && !bin[k];) {}
					if ((exp = bias + 1 - k) >= minExp && exp <= maxExp) {
						++k
					} else {
						if (exp < minExp) {
							if (exp !== bias + 1 - len && exp < minUnnormExp) {
								// "encodeFloat::float underflow"
							}
							k = bias + 1 - (exp = minExp - 1)
						}
					}
					if (intPart || status !== 0) {
						exp = maxExp + 1
						k = bias + 2
						if (status === -Infinity) {
							signal = 1
						} else if (isNaN(status)) {
							bin[k] = 1
						}
					}
					n = Math.abs(exp + bias)
					tmpResult = ''
					for (j = exponentBits + 1; --j;) {
						tmpResult = (n % 2) + tmpResult
						n = n >>= 1
					}
					n = 0
					j = 0
					k = (tmpResult = (signal ? '1' : '0') + tmpResult + (bin.slice(k, k +
						precisionBits).join(''))).length
					r = []
					for (; k;) {
						n += (1 << j) * tmpResult.charAt(--k)
						if (j === 7) {
							r[r.length] = String.fromCharCode(n)
							n = 0
						}
						j = (j + 1) % 8
					}
					r[r.length] = n ? String.fromCharCode(n) : ''
					result += r.join('')
					argumentPointer++
				}
				break
			case 'x':
				// NUL byte
				if (quantifier === '*') {
					throw new Error('Warning: pack(): Type x: \'*\' ignored')
				}
				for (i = 0; i < quantifier; i++) {
					result += String.fromCharCode(0)
				}
				break
			case 'X':
				// Back up one byte
				if (quantifier === '*') {
					throw new Error('Warning: pack(): Type X: \'*\' ignored')
				}
				for (i = 0; i < quantifier; i++) {
					if (result.length === 0) {
						throw new Error('Warning: pack(): Type X:' + ' outside of string')
					} else {
						result = result.substring(0, result.length - 1)
					}
				}
				break
			case '@':
				// NUL-fill to absolute position
				if (quantifier === '*') {
					throw new Error('Warning: pack(): Type X: \'*\' ignored')
				}
				if (quantifier > result.length) {
					extraNullCount = quantifier - result.length
					for (i = 0; i < extraNullCount; i++) {
						result += String.fromCharCode(0)
					}
				}
				if (quantifier < result.length) {
					result = result.substring(0, quantifier)
				}
				break
			default:
				throw new Error('Warning: pack() Type ' + instruction + ': unknown format code')
		}
	}
	if (argumentPointer < arguments.length) {
		const msg2 = 'Warning: pack(): ' + (arguments.length - argumentPointer) +
			' arguments unused'
		throw new Error(msg2)
	}
	return result
}
phpjed.uniqid = function(prefix, moreEntropy) {
	//  discuss at: https://locutus.io/php/uniqid/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//  revised by: Kankrelune (https://www.webfaktory.info/)
	//      note 1: Uses an internal counter (in locutus global) to avoid collision
	//   example 1: var $id = uniqid()
	//   example 1: var $result = $id.length === 13
	//   returns 1: true
	//   example 2: var $id = uniqid('foo')
	//   example 2: var $result = $id.length === (13 + 'foo'.length)
	//   returns 2: true
	//   example 3: var $id = uniqid('bar', true)
	//   example 3: var $result = $id.length === (23 + 'bar'.length)
	//   returns 3: true
	if (typeof prefix === 'undefined') {
		prefix = ''
	}
	let retId
	const _formatSeed = function(seed, reqWidth) {
		seed = parseInt(seed, 10).toString(16) // to hex str
		if (reqWidth < seed.length) {
			// so long we split
			return seed.slice(seed.length - reqWidth)
		}
		if (reqWidth > seed.length) {
			// so short we pad
			return Array(1 + (reqWidth - seed.length)).join('0') + seed
		}
		return seed
	}
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	if (!$locutus.php.uniqidSeed) {
		// init seed with big random int
		$locutus.php.uniqidSeed = Math.floor(Math.random() * 0x75bcd15)
	}
	$locutus.php.uniqidSeed++
	// start with prefix, add current milliseconds hex string
	retId = prefix
	retId += _formatSeed(parseInt(new Date().getTime() / 1000, 10), 8)
	// add seed hex string
	retId += _formatSeed($locutus.php.uniqidSeed, 5)
	if (moreEntropy) {
		// for more entropy we add a float lower to 10
		retId += (Math.random() * 10).toFixed(8).toString()
	}
	return retId
}
phpjed.inet_ntop = function(a) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/inet_ntop/
	// original by: Theriault (https://github.com/Theriault)
	//   example 1: inet_ntop('\x7F\x00\x00\x01')
	//   returns 1: '127.0.0.1'
	//   _example 2: inet_ntop('\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\1')
	//   _returns 2: '::1'
	let i = 0
	let m = ''
	const c = []
	a += ''
	if (a.length === 4) {
		// IPv4
		return [
			a.charCodeAt(0),
			a.charCodeAt(1),
			a.charCodeAt(2),
			a.charCodeAt(3)
		].join('.')
	} else if (a.length === 16) {
		// IPv6
		for (i = 0; i < 16; i++) {
			c.push(((a.charCodeAt(i++) << 8) + a.charCodeAt(i)).toString(16))
		}
		return c.join(':').replace(/((^|:)0(?=:|$))+:?/g, function(t) {
			m = (t.length > m.length) ? t : m
			return t
		}).replace(m || ' ', '::')
	} else {
		// Invalid length
		return false
	}
}
phpjed.inet_pton = function(a) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/inet_pton/
	// original by: Theriault (https://github.com/Theriault)
	// improved by: alromh87 and JamieSlome
	//   example 1: inet_pton('::')
	//   returns 1: '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'
	//   example 2: inet_pton('127.0.0.1')
	//   returns 2: '\x7F\x00\x00\x01'
	let m
	let i
	let j
	const f = String.fromCharCode
	// IPv4
	m = a.match(/^(?:\d{1,3}(?:\.|$)){4}/)
	if (m) {
		m = m[0].split('.')
		m = f(m[0], m[1], m[2], m[3])
		// Return if 4 bytes, otherwise false.
		return m.length === 4 ? m : false
	}
	// IPv6
	if (a.length > 39) {
		return false
	}
	m = a.split('::')
	if (m.length > 2) {
		return false
	} // :: can't be used more than once in IPv6.
	const reHexDigits = /^[\da-f]{1,4}$/i
	for (j = 0; j < m.length; j++) {
		if (m[j].length === 0) { // Skip if empty.
			continue
		}
		m[j] = m[j].split(':')
		for (i = 0; i < m[j].length; i++) {
			let hextet = m[j][i]
			// check if valid hex string up to 4 chars
			if (!reHexDigits.test(hextet)) {
				return false
			}
			hextet = parseInt(hextet, 16)
			// Would be NaN if it was blank, return false.
			if (isNaN(hextet)) {
				// Invalid IP.
				return false
			}
			m[j][i] = f(hextet >> 8, hextet & 0xFF)
		}
		m[j] = m[j].join('')
	}
	return m.join('\x00'.repeat(16 - m.reduce((tl, m) => tl + m.length, 0)))
}
phpjed.ip2long = function(argIP) {
	//  discuss at: https://locutus.io/php/ip2long/
	// original by: Waldo Malqui Silva (https://waldo.malqui.info)
	// improved by: Victor
	//  revised by: fearphage (https://my.opera.com/fearphage/)
	//  revised by: Theriault (https://github.com/Theriault)
	//    estarget: es2015
	//   example 1: ip2long('192.0.34.166')
	//   returns 1: 3221234342
	//   example 2: ip2long('0.0xABCDEF')
	//   returns 2: 11259375
	//   example 3: ip2long('255.255.255.256')
	//   returns 3: false
	let i = 0
	// PHP allows decimal, octal, and hexadecimal IP components.
	// PHP allows between 1 (e.g. 127) to 4 (e.g 127.0.0.1) components.
	const pattern = new RegExp(['^([1-9]\\d*|0[0-7]*|0x[\\da-f]+)',
		'(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
		'(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
		'(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?$'
	].join(''), 'i')
	argIP = argIP.match(pattern) // Verify argIP format.
	if (!argIP) {
		// Invalid format.
		return false
	}
	// Reuse argIP variable for component counter.
	argIP[0] = 0
	for (i = 1; i < 5; i += 1) {
		argIP[0] += !!((argIP[i] || '').length)
		argIP[i] = parseInt(argIP[i]) || 0
	}
	// Continue to use argIP for overflow values.
	// PHP does not allow any component to overflow.
	argIP.push(256, 256, 256, 256)
	// Recalculate overflow of last component supplied to make up for missing components.
	argIP[4 + argIP[0]] *= Math.pow(256, 4 - argIP[0])
	if (argIP[1] >= argIP[5] || argIP[2] >= argIP[6] || argIP[3] >= argIP[7] || argIP[4] >=
		argIP[8]) {
		return false
	}
	return argIP[1] * (argIP[0] === 1 || 16777216) + argIP[2] * (argIP[0] <= 2 || 65536) +
		argIP[3] * (argIP[0] <= 3 || 256) + argIP[4] * 1
}
phpjed.long2ip = function(ip) {
	//  discuss at: https://locutus.io/php/long2ip/
	// original by: Waldo Malqui Silva (https://fayr.us/waldo/)
	//   example 1: long2ip( 3221234342 )
	//   returns 1: '192.0.34.166'
	if (!isFinite(ip)) {
		return false
	}
	return [ip >>> 24 & 0xFF, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.')
}
phpjed.setcookie = function(name, value, expires, path, domain, secure) {
	//  discuss at: https://locutus.io/php/setcookie/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// bugfixed by: Andreas
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: setcookie('author_name', 'Kevin van Zonneveld')
	//   returns 1: true
	const setrawcookie = phpjed.setrawcookie
	return setrawcookie(name, encodeURIComponent(value), expires, path, domain, secure)
}
phpjed.setrawcookie = function(name, value, expires, path, domain, secure) {
	//  discuss at: https://locutus.io/php/setrawcookie/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: setcookie
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Michael
	//      note 1: This function requires access to the `window` global and is Browser-only
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: setrawcookie('author_name', 'Kevin van Zonneveld')
	//   returns 1: true
	if (typeof window === 'undefined') {
		return true
	}
	if (typeof expires === 'string' && (/^\d+$/).test(expires)) {
		expires = parseInt(expires, 10)
	}
	if (expires instanceof Date) {
		expires = expires.toUTCString()
	} else if (typeof expires === 'number') {
		expires = (new Date(expires * 1e3)).toUTCString()
	}
	const r = [name + '=' + value]
	let i = ''
	const s = {
		expires: expires,
		path: path,
		domain: domain
	}
	for (i in s) {
		if (s.hasOwnProperty(i)) {
			// Exclude items on Object.prototype
			s[i] && r.push(i + '=' + s[i])
		}
	}
	if (secure) {
		r.push('secure')
	}
	window.document.cookie = r.join(';')
	return true
}
phpjed.preg_match = function(regex, str) { // eslint-disable-line camelcase
	//   original by: Muhammad Humayun (https://github.com/ronypt)
	//   example 1: preg_match("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$", "rony@pharaohtools.com")
	//   returns 1: true
	//   example 2: preg_match("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$", "ronypharaohtools.com")
	//   returns 2: false
	return (new RegExp(regex).test(str))
}
phpjed.preg_quote = function(str, delimiter) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/preg_quote/
	// original by: booeyOH
	// improved by: Ates Goral (https://magnetiq.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: preg_quote("$40")
	//   returns 1: '\\$40'
	//   example 2: preg_quote("*RRRING* Hello?")
	//   returns 2: '\\*RRRING\\* Hello\\?'
	//   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:")
	//   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'
	return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') +
		'-]', 'g'), '\\$&')
}
phpjed.preg_replace = function(pattern, replacement, string) { // eslint-disable-line camelcase
	//   original by: rony2k6 (https://github.com/rony2k6)
	//   example 1: preg_replace('/xmas/i', 'Christmas', 'It was the night before Xmas.')
	//   returns 1: "It was the night before Christmas."
	//   example 2: preg_replace('/xmas/ig', 'Christmas', 'xMas: It was the night before Xmas.')
	//   returns 2: "Christmas: It was the night before Christmas."
	//   example 3: preg_replace('\/(\\w+) (\\d+), (\\d+)\/i', '$11,$3', 'April 15, 2003')
	//   returns 3: "April1,2003"
	//   example 4: preg_replace('/[^a-zA-Z0-9]+/', '', 'The Development of code . http://www.')
	//   returns 4: "TheDevelopmentofcodehttpwww"
	//   example 5: preg_replace('/[^A-Za-z0-9_\\s]/', '', 'D"usseldorfer H"auptstrasse')
	//   returns 5: "Dusseldorfer Hauptstrasse"
	let _flag = pattern.substr(pattern.lastIndexOf(pattern[0]) + 1)
	_flag = (_flag !== '') ? _flag : 'g'
	const _pattern = pattern.substr(1, pattern.lastIndexOf(pattern[0]) - 1)
	const regex = new RegExp(_pattern, _flag)
	const result = string.replace(regex, replacement)
	return result
}
phpjed.addcslashes = function(str, charlist) {
	//  discuss at: https://locutus.io/php/addcslashes/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: We show double backslashes in the return value example
	//      note 1: code below because a JavaScript string will not
	//      note 1: render them as backslashes otherwise
	//   example 1: addcslashes('foo[ ]', 'A..z'); // Escape all ASCII within capital A to lower z range, including square brackets
	//   returns 1: "\\f\\o\\o\\[ \\]"
	//   example 2: addcslashes("zoo['.']", 'z..A'); // Only escape z, period, and A here since not a lower-to-higher range
	//   returns 2: "\\zoo['\\.']"
	//   _example 3: addcslashes("@a\u0000\u0010\u00A9", "\0..\37!@\177..\377"); // Escape as octals those specified and less than 32 (0x20) or greater than 126 (0x7E), but not otherwise
	//   _returns 3: '\\@a\\000\\020\\302\\251'
	//   _example 4: addcslashes("\u0020\u007E", "\40..\175"); // Those between 32 (0x20 or 040) and 126 (0x7E or 0176) decimal value will be backslashed if specified (not octalized)
	//   _returns 4: '\\ ~'
	//   _example 5: addcslashes("\r\u0007\n", '\0..\37'); // Recognize C escape sequences if specified
	//   _returns 5: "\\r\\a\\n"
	//   _example 6: addcslashes("\r\u0007\n", '\0'); // Do not recognize C escape sequences if not specified
	//   _returns 6: "\r\u0007\n"
	let target = ''
	const chrs = []
	let i = 0
	let j = 0
	let c = ''
	let next = ''
	let rangeBegin = ''
	let rangeEnd = ''
	let chr = ''
	let begin = 0
	let end = 0
	let octalLength = 0
	let postOctalPos = 0
	let cca = 0
	let escHexGrp = []
	let encoded = ''
	const percentHex = /%([\dA-Fa-f]+)/g
	const _pad = function(n, c) {
		if ((n = n + '').length < c) {
			return new Array(++c - n.length).join('0') + n
		}
		return n
	}
	for (i = 0; i < charlist.length; i++) {
		c = charlist.charAt(i)
		next = charlist.charAt(i + 1)
		if (c === '\\' && next && (/\d/).test(next)) {
			// Octal
			rangeBegin = charlist.slice(i + 1).match(/^\d+/)[0]
			octalLength = rangeBegin.length
			postOctalPos = i + octalLength + 1
			if (charlist.charAt(postOctalPos) + charlist.charAt(postOctalPos + 1) === '..') {
				// Octal begins range
				begin = rangeBegin.charCodeAt(0)
				if ((/\\\d/).test(charlist.charAt(postOctalPos + 2) + charlist.charAt(
						postOctalPos + 3))) {
					// Range ends with octal
					rangeEnd = charlist.slice(postOctalPos + 3).match(/^\d+/)[0]
					// Skip range end backslash
					i += 1
				} else if (charlist.charAt(postOctalPos + 2)) {
					// Range ends with character
					rangeEnd = charlist.charAt(postOctalPos + 2)
				} else {
					throw new Error('Range with no end point')
				}
				end = rangeEnd.charCodeAt(0)
				if (end > begin) {
					// Treat as a range
					for (j = begin; j <= end; j++) {
						chrs.push(String.fromCharCode(j))
					}
				} else {
					// Supposed to treat period, begin and end as individual characters only, not a range
					chrs.push('.', rangeBegin, rangeEnd)
				}
				// Skip dots and range end (already skipped range end backslash if present)
				i += rangeEnd.length + 2
			} else {
				// Octal is by itself
				chr = String.fromCharCode(parseInt(rangeBegin, 8))
				chrs.push(chr)
			}
			// Skip range begin
			i += octalLength
		} else if (next + charlist.charAt(i + 2) === '..') {
			// Character begins range
			rangeBegin = c
			begin = rangeBegin.charCodeAt(0)
			if ((/\\\d/).test(charlist.charAt(i + 3) + charlist.charAt(i + 4))) {
				// Range ends with octal
				rangeEnd = charlist.slice(i + 4).match(/^\d+/)[0]
				// Skip range end backslash
				i += 1
			} else if (charlist.charAt(i + 3)) {
				// Range ends with character
				rangeEnd = charlist.charAt(i + 3)
			} else {
				throw new Error('Range with no end point')
			}
			end = rangeEnd.charCodeAt(0)
			if (end > begin) {
				// Treat as a range
				for (j = begin; j <= end; j++) {
					chrs.push(String.fromCharCode(j))
				}
			} else {
				// Supposed to treat period, begin and end as individual characters only, not a range
				chrs.push('.', rangeBegin, rangeEnd)
			}
			// Skip dots and range end (already skipped range end backslash if present)
			i += rangeEnd.length + 2
		} else {
			// Character is by itself
			chrs.push(c)
		}
	}
	for (i = 0; i < str.length; i++) {
		c = str.charAt(i)
		if (chrs.indexOf(c) !== -1) {
			target += '\\'
			cca = c.charCodeAt(0)
			if (cca < 32 || cca > 126) {
				// Needs special escaping
				switch (c) {
					case '\n':
						target += 'n'
						break
					case '\t':
						target += 't'
						break
					case '\u000D':
						target += 'r'
						break
					case '\u0007':
						target += 'a'
						break
					case '\v':
						target += 'v'
						break
					case '\b':
						target += 'b'
						break
					case '\f':
						target += 'f'
						break
					default:
						// target += _pad(cca.toString(8), 3);break; // Sufficient for UTF-16
						encoded = encodeURIComponent(c)
						// 3-length-padded UTF-8 octets
						if ((escHexGrp = percentHex.exec(encoded)) !== null) {
							// already added a slash above:
							target += _pad(parseInt(escHexGrp[1], 16).toString(8), 3)
						}
						while ((escHexGrp = percentHex.exec(encoded)) !== null) {
							target += '\\' + _pad(parseInt(escHexGrp[1], 16).toString(8), 3)
						}
						break
				}
			} else {
				// Perform regular backslashed escaping
				target += c
			}
		} else {
			// Just add the character unescaped
			target += c
		}
	}
	return target
}
phpjed.addslashes = function(str) {
	//  discuss at: https://locutus.io/php/addslashes/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Ates Goral (https://magnetiq.com)
	// improved by: marrtins
	// improved by: Nate
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Oskar Larsson Högfeldt (https://oskar-lh.name/)
	//    input by: Denny Wardhana
	//   example 1: addslashes("kevin's birthday")
	//   returns 1: "kevin\\'s birthday"
	return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
}
phpjed.bin2hex = function(s) {
	//  discuss at: https://locutus.io/php/bin2hex/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Linuxworld
	// improved by: ntoniazzi (https://locutus.io/php/bin2hex:361#comment_177616)
	//   example 1: bin2hex('Kev')
	//   returns 1: '4b6576'
	//   example 2: bin2hex(String.fromCharCode(0x00))
	//   returns 2: '00'
	let i
	let l
	let o = ''
	let n
	s += ''
	for (i = 0, l = s.length; i < l; i++) {
		n = s.charCodeAt(i).toString(16)
		o += n.length < 2 ? '0' + n : n
	}
	return o
}
phpjed.chop = function(str, charlist) {
	//  discuss at: https://locutus.io/php/chop/
	// original by: Paulo Freitas
	//   example 1: chop('    Kevin van Zonneveld    ')
	//   returns 1: '    Kevin van Zonneveld'
	const rtrim = phpjed.rtrim
	return rtrim(str, charlist)
}
phpjed.chr = function(codePt) {
	//  discuss at: https://locutus.io/php/chr/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: chr(75) === 'K'
	//   example 1: chr(65536) === '\uD800\uDC00'
	//   returns 1: true
	//   returns 1: true
	if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
		//   enough for the UTF-16 encoding (JavaScript internal use), to
		//   require representation with two surrogates (reserved non-characters
		//   used for building other characters; the first is "high" and the next "low")
		codePt -= 0x10000
		return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF))
	}
	return String.fromCharCode(codePt)
}
phpjed.chunk_split = function(body, chunklen, end) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/chunk_split/
	// original by: Paulo Freitas
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Theriault (https://github.com/Theriault)
	//   example 1: chunk_split('Hello world!', 1, '*')
	//   returns 1: 'H*e*l*l*o* *w*o*r*l*d*!*'
	//   example 2: chunk_split('Hello world!', 10, '*')
	//   returns 2: 'Hello worl*d!*'
	chunklen = parseInt(chunklen, 10) || 76
	end = end || '\r\n'
	if (chunklen < 1) {
		return false
	}
	return body.match(new RegExp('.{0,' + chunklen + '}', 'g')).join(end)
}
phpjed.convert_uuencode = function(str) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/convert_uuencode/
	//      original by: Ole Vrijenhoek
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	// reimplemented by: Ole Vrijenhoek
	//        example 1: convert_uuencode("test\ntext text\r\n")
	//        returns 1: "0=&5S=`IT97AT('1E>'0-\"@\n`\n"
	const isScalar = phpjed.is_scalar
	const chr = function(c) {
		return String.fromCharCode(c)
	}
	if (!str || str === '') {
		return chr(0)
	} else if (!isScalar(str)) {
		return false
	}
	let c = 0
	let u = 0
	let i = 0
	let a = 0
	let encoded = ''
	let tmp1 = ''
	let tmp2 = ''
	let bytes = {}
	// divide string into chunks of 45 characters
	const chunk = function() {
		bytes = str.substr(u, 45).split('')
		for (i in bytes) {
			bytes[i] = bytes[i].charCodeAt(0)
		}
		return bytes.length || 0
	}
	while ((c = chunk()) !== 0) {
		u += 45
		// New line encoded data starts with number of bytes encoded.
		encoded += chr(c + 32)
		// Convert each char in bytes[] to a byte
		for (i in bytes) {
			tmp1 = bytes[i].toString(2)
			while (tmp1.length < 8) {
				tmp1 = '0' + tmp1
			}
			tmp2 += tmp1
		}
		while (tmp2.length % 6) {
			tmp2 = tmp2 + '0'
		}
		for (i = 0; i <= (tmp2.length / 6) - 1; i++) {
			tmp1 = tmp2.substr(a, 6)
			if (tmp1 === '000000') {
				encoded += chr(96)
			} else {
				encoded += chr(parseInt(tmp1, 2) + 32)
			}
			a += 6
		}
		a = 0
		tmp2 = ''
		encoded += '\n'
	}
	// Add termination characters
	encoded += chr(96) + '\n'
	return encoded
}
phpjed.count_chars = function(str, mode) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/count_chars/
	// original by: Ates Goral (https://magnetiq.com)
	// improved by: Jack
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Theriault (https://github.com/Theriault)
	//   example 1: count_chars("Hello World!", 3)
	//   returns 1: " !HWdelor"
	//   example 2: count_chars("Hello World!", 1)
	//   returns 2: {32:1,33:1,72:1,87:1,100:1,101:1,108:3,111:2,114:1}
	const result = {}
	const resultArr = []
	let i
	str = ('' + str).split('').sort().join('').match(/(.)\1*/g)
	if ((mode & 1) === 0) {
		for (i = 0; i !== 256; i++) {
			result[i] = 0
		}
	}
	if (mode === 2 || mode === 4) {
		for (i = 0; i !== str.length; i += 1) {
			delete result[str[i].charCodeAt(0)]
		}
		for (i in result) {
			result[i] = (mode === 4) ? String.fromCharCode(i) : 0
		}
	} else if (mode === 3) {
		for (i = 0; i !== str.length; i += 1) {
			result[i] = str[i].slice(0, 1)
		}
	} else {
		for (i = 0; i !== str.length; i += 1) {
			result[str[i].charCodeAt(0)] = str[i].length
		}
	}
	if (mode < 3) {
		return result
	}
	for (i in result) {
		resultArr.push(result[i])
	}
	return resultArr.join('')
}
phpjed.crc32 = function(str) {
	//  discuss at: https://locutus.io/php/crc32/
	// original by: Webtoolkit.info (https://www.webtoolkit.info/)
	// improved by: T0bsn
	//   example 1: crc32('Kevin van Zonneveld')
	//   returns 1: 1249991249
	const utf8Encode = phpjed.utf8_encode
	str = utf8Encode(str)
	const table = ['00000000', '77073096', 'EE0E612C', '990951BA', '076DC419', '706AF48F',
		'E963A535', '9E6495A3', '0EDB8832', '79DCB8A4', 'E0D5E91E', '97D2D988', '09B64C2B',
		'7EB17CBD', 'E7B82D07', '90BF1D91', '1DB71064', '6AB020F2', 'F3B97148', '84BE41DE',
		'1ADAD47D', '6DDDE4EB', 'F4D4B551', '83D385C7', '136C9856', '646BA8C0', 'FD62F97A',
		'8A65C9EC', '14015C4F', '63066CD9', 'FA0F3D63', '8D080DF5', '3B6E20C8', '4C69105E',
		'D56041E4', 'A2677172', '3C03E4D1', '4B04D447', 'D20D85FD', 'A50AB56B', '35B5A8FA',
		'42B2986C', 'DBBBC9D6', 'ACBCF940', '32D86CE3', '45DF5C75', 'DCD60DCF', 'ABD13D59',
		'26D930AC', '51DE003A', 'C8D75180', 'BFD06116', '21B4F4B5', '56B3C423', 'CFBA9599',
		'B8BDA50F', '2802B89E', '5F058808', 'C60CD9B2', 'B10BE924', '2F6F7C87', '58684C11',
		'C1611DAB', 'B6662D3D', '76DC4190', '01DB7106', '98D220BC', 'EFD5102A', '71B18589',
		'06B6B51F', '9FBFE4A5', 'E8B8D433', '7807C9A2', '0F00F934', '9609A88E', 'E10E9818',
		'7F6A0DBB', '086D3D2D', '91646C97', 'E6635C01', '6B6B51F4', '1C6C6162', '856530D8',
		'F262004E', '6C0695ED', '1B01A57B', '8208F4C1', 'F50FC457', '65B0D9C6', '12B7E950',
		'8BBEB8EA', 'FCB9887C', '62DD1DDF', '15DA2D49', '8CD37CF3', 'FBD44C65', '4DB26158',
		'3AB551CE', 'A3BC0074', 'D4BB30E2', '4ADFA541', '3DD895D7', 'A4D1C46D', 'D3D6F4FB',
		'4369E96A', '346ED9FC', 'AD678846', 'DA60B8D0', '44042D73', '33031DE5', 'AA0A4C5F',
		'DD0D7CC9', '5005713C', '270241AA', 'BE0B1010', 'C90C2086', '5768B525', '206F85B3',
		'B966D409', 'CE61E49F', '5EDEF90E', '29D9C998', 'B0D09822', 'C7D7A8B4', '59B33D17',
		'2EB40D81', 'B7BD5C3B', 'C0BA6CAD', 'EDB88320', '9ABFB3B6', '03B6E20C', '74B1D29A',
		'EAD54739', '9DD277AF', '04DB2615', '73DC1683', 'E3630B12', '94643B84', '0D6D6A3E',
		'7A6A5AA8', 'E40ECF0B', '9309FF9D', '0A00AE27', '7D079EB1', 'F00F9344', '8708A3D2',
		'1E01F268', '6906C2FE', 'F762575D', '806567CB', '196C3671', '6E6B06E7', 'FED41B76',
		'89D32BE0', '10DA7A5A', '67DD4ACC', 'F9B9DF6F', '8EBEEFF9', '17B7BE43', '60B08ED5',
		'D6D6A3E8', 'A1D1937E', '38D8C2C4', '4FDFF252', 'D1BB67F1', 'A6BC5767', '3FB506DD',
		'48B2364B', 'D80D2BDA', 'AF0A1B4C', '36034AF6', '41047A60', 'DF60EFC3', 'A867DF55',
		'316E8EEF', '4669BE79', 'CB61B38C', 'BC66831A', '256FD2A0', '5268E236', 'CC0C7795',
		'BB0B4703', '220216B9', '5505262F', 'C5BA3BBE', 'B2BD0B28', '2BB45A92', '5CB36A04',
		'C2D7FFA7', 'B5D0CF31', '2CD99E8B', '5BDEAE1D', '9B64C2B0', 'EC63F226', '756AA39C',
		'026D930A', '9C0906A9', 'EB0E363F', '72076785', '05005713', '95BF4A82', 'E2B87A14',
		'7BB12BAE', '0CB61B38', '92D28E9B', 'E5D5BE0D', '7CDCEFB7', '0BDBDF21', '86D3D2D4',
		'F1D4E242', '68DDB3F8', '1FDA836E', '81BE16CD', 'F6B9265B', '6FB077E1', '18B74777',
		'88085AE6', 'FF0F6A70', '66063BCA', '11010B5C', '8F659EFF', 'F862AE69', '616BFFD3',
		'166CCF45', 'A00AE278', 'D70DD2EE', '4E048354', '3903B3C2', 'A7672661', 'D06016F7',
		'4969474D', '3E6E77DB', 'AED16A4A', 'D9D65ADC', '40DF0B66', '37D83BF0', 'A9BCAE53',
		'DEBB9EC5', '47B2CF7F', '30B5FFE9', 'BDBDF21C', 'CABAC28A', '53B39330', '24B4A3A6',
		'BAD03605', 'CDD70693', '54DE5729', '23D967BF', 'B3667A2E', 'C4614AB8', '5D681B02',
		'2A6F2B94', 'B40BBE37', 'C30C8EA1', '5A05DF1B', '2D02EF8D'
	].join(' ')
	// @todo: ^-- Now that `table` is an array, maybe we can use that directly using slices,
	// instead of converting it to a string and substringing
	let crc = 0
	let x = 0
	let y = 0
	crc = crc ^ (-1)
	for (let i = 0, iTop = str.length; i < iTop; i++) {
		y = (crc ^ str.charCodeAt(i)) & 0xFF
		x = '0x' + table.substr(y * 9, 8)
		crc = (crc >>> 8) ^ x
	}
	return crc ^ (-1)
}
phpjed.echo = function() {
	//  discuss at: https://locutus.io/php/echo/
	// original by: Philip Peterson
	// improved by: echo is bad
	// improved by: Nate
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Der Simon (https://innerdom.sourceforge.net/)
	// bugfixed by: Eugene Bulkin (https://doubleaw.com/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: EdorFaus
	//      note 1: In 1.3.2 and earlier, this function wrote to the body of the document when it
	//      note 1: was called in webbrowsers, in addition to supporting XUL.
	//      note 1: This involved >100 lines of boilerplate to do this in a safe way.
	//      note 1: Since I can't imageine a complelling use-case for this, and XUL is deprecated
	//      note 1: I have removed this behavior in favor of just calling `console.log`
	//      note 2: You'll see functions depends on `echo` instead of `console.log` as we'll want
	//      note 2: to have 1 contact point to interface with the outside world, so that it's easy
	//      note 2: to support other ways of printing output.
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	//    input by: JB
	//   example 1: echo('Hello world')
	//   returns 1: undefined
	const args = Array.prototype.slice.call(arguments)
	return console.log(args.join(' '))
}
phpjed.explode = function(delimiter, string, limit) {
	//  discuss at: https://locutus.io/php/explode/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: explode(' ', 'Kevin van Zonneveld')
	//   returns 1: [ 'Kevin', 'van', 'Zonneveld' ]
	if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string ===
		'undefined') {
		return null
	}
	if (delimiter === '' || delimiter === false || delimiter === null) {
		return false
	}
	if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string ===
		'function' || typeof string === 'object') {
		return {
			0: ''
		}
	}
	if (delimiter === true) {
		delimiter = '1'
	}
	// Here we go...
	delimiter += ''
	string += ''
	const s = string.split(delimiter)
	if (typeof limit === 'undefined') return s
	// Support for limit
	if (limit === 0) limit = 1
	// Positive limit
	if (limit > 0) {
		if (limit >= s.length) {
			return s
		}
		return s.slice(0, limit - 1).concat([s.slice(limit - 1).join(delimiter)])
	}
	// Negative limit
	if (-limit >= s.length) {
		return []
	}
	s.splice(s.length + limit)
	return s
}
phpjed.get_html_translation_table = function(table, quoteStyle) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/get_html_translation_table/
	// original by: Philip Peterson
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: noname
	// bugfixed by: Alex
	// bugfixed by: Marco
	// bugfixed by: madipta
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: T.Wild
	// improved by: KELAN
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: Frank Forte
	//    input by: Ratheous
	//      note 1: It has been decided that we're not going to add global
	//      note 1: dependencies to Locutus, meaning the constants are not
	//      note 1: real constants, but strings instead. Integers are also supported if someone
	//      note 1: chooses to create the constants themselves.
	//   example 1: get_html_translation_table('HTML_SPECIALCHARS')
	//   returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
	const entities = {}
	const hashMap = {}
	let decimal
	const constMappingTable = {}
	const constMappingQuoteStyle = {}
	let useTable = {}
	let useQuoteStyle = {}
	// Translate arguments
	constMappingTable[0] = 'HTML_SPECIALCHARS'
	constMappingTable[1] = 'HTML_ENTITIES'
	constMappingQuoteStyle[0] = 'ENT_NOQUOTES'
	constMappingQuoteStyle[2] = 'ENT_COMPAT'
	constMappingQuoteStyle[3] = 'ENT_QUOTES'
	useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() :
		'HTML_SPECIALCHARS'
	useQuoteStyle = !isNaN(quoteStyle) ? constMappingQuoteStyle[quoteStyle] : quoteStyle ?
		quoteStyle.toUpperCase() : 'ENT_COMPAT'
	if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
		throw new Error('Table: ' + useTable + ' not supported')
	}
	entities['38'] = '&amp;'
	if (useTable === 'HTML_ENTITIES') {
		entities['160'] = '&nbsp;'
		entities['161'] = '&iexcl;'
		entities['162'] = '&cent;'
		entities['163'] = '&pound;'
		entities['164'] = '&curren;'
		entities['165'] = '&yen;'
		entities['166'] = '&brvbar;'
		entities['167'] = '&sect;'
		entities['168'] = '&uml;'
		entities['169'] = '&copy;'
		entities['170'] = '&ordf;'
		entities['171'] = '&laquo;'
		entities['172'] = '&not;'
		entities['173'] = '&shy;'
		entities['174'] = '&reg;'
		entities['175'] = '&macr;'
		entities['176'] = '&deg;'
		entities['177'] = '&plusmn;'
		entities['178'] = '&sup2;'
		entities['179'] = '&sup3;'
		entities['180'] = '&acute;'
		entities['181'] = '&micro;'
		entities['182'] = '&para;'
		entities['183'] = '&middot;'
		entities['184'] = '&cedil;'
		entities['185'] = '&sup1;'
		entities['186'] = '&ordm;'
		entities['187'] = '&raquo;'
		entities['188'] = '&frac14;'
		entities['189'] = '&frac12;'
		entities['190'] = '&frac34;'
		entities['191'] = '&iquest;'
		entities['192'] = '&Agrave;'
		entities['193'] = '&Aacute;'
		entities['194'] = '&Acirc;'
		entities['195'] = '&Atilde;'
		entities['196'] = '&Auml;'
		entities['197'] = '&Aring;'
		entities['198'] = '&AElig;'
		entities['199'] = '&Ccedil;'
		entities['200'] = '&Egrave;'
		entities['201'] = '&Eacute;'
		entities['202'] = '&Ecirc;'
		entities['203'] = '&Euml;'
		entities['204'] = '&Igrave;'
		entities['205'] = '&Iacute;'
		entities['206'] = '&Icirc;'
		entities['207'] = '&Iuml;'
		entities['208'] = '&ETH;'
		entities['209'] = '&Ntilde;'
		entities['210'] = '&Ograve;'
		entities['211'] = '&Oacute;'
		entities['212'] = '&Ocirc;'
		entities['213'] = '&Otilde;'
		entities['214'] = '&Ouml;'
		entities['215'] = '&times;'
		entities['216'] = '&Oslash;'
		entities['217'] = '&Ugrave;'
		entities['218'] = '&Uacute;'
		entities['219'] = '&Ucirc;'
		entities['220'] = '&Uuml;'
		entities['221'] = '&Yacute;'
		entities['222'] = '&THORN;'
		entities['223'] = '&szlig;'
		entities['224'] = '&agrave;'
		entities['225'] = '&aacute;'
		entities['226'] = '&acirc;'
		entities['227'] = '&atilde;'
		entities['228'] = '&auml;'
		entities['229'] = '&aring;'
		entities['230'] = '&aelig;'
		entities['231'] = '&ccedil;'
		entities['232'] = '&egrave;'
		entities['233'] = '&eacute;'
		entities['234'] = '&ecirc;'
		entities['235'] = '&euml;'
		entities['236'] = '&igrave;'
		entities['237'] = '&iacute;'
		entities['238'] = '&icirc;'
		entities['239'] = '&iuml;'
		entities['240'] = '&eth;'
		entities['241'] = '&ntilde;'
		entities['242'] = '&ograve;'
		entities['243'] = '&oacute;'
		entities['244'] = '&ocirc;'
		entities['245'] = '&otilde;'
		entities['246'] = '&ouml;'
		entities['247'] = '&divide;'
		entities['248'] = '&oslash;'
		entities['249'] = '&ugrave;'
		entities['250'] = '&uacute;'
		entities['251'] = '&ucirc;'
		entities['252'] = '&uuml;'
		entities['253'] = '&yacute;'
		entities['254'] = '&thorn;'
		entities['255'] = '&yuml;'
	}
	if (useQuoteStyle !== 'ENT_NOQUOTES') {
		entities['34'] = '&quot;'
	}
	if (useQuoteStyle === 'ENT_QUOTES') {
		entities['39'] = '&#39;'
	}
	entities['60'] = '&lt;'
	entities['62'] = '&gt;'
	// ascii decimals to real symbols
	for (decimal in entities) {
		if (entities.hasOwnProperty(decimal)) {
			hashMap[String.fromCharCode(decimal)] = entities[decimal]
		}
	}
	return hashMap
}
phpjed.hex2bin = function(s) {
	//  discuss at: https://locutus.io/php/hex2bin/
	// original by: Dumitru Uzun (https://duzun.me)
	//   example 1: hex2bin('44696d61')
	//   returns 1: 'Dima'
	//   example 2: hex2bin('00')
	//   returns 2: '\x00'
	//   example 3: hex2bin('2f1q')
	//   returns 3: false
	const ret = []
	let i = 0
	let l
	s += ''
	for (l = s.length; i < l; i += 2) {
		const c = parseInt(s.substr(i, 1), 16)
		const k = parseInt(s.substr(i + 1, 1), 16)
		if (isNaN(c) || isNaN(k)) return false
		ret.push((c << 4) | k)
	}
	return String.fromCharCode.apply(String, ret)
}
phpjed.html_entity_decode = function(string, quoteStyle) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/html_entity_decode/
	// original by: john (https://www.jd-tech.net)
	//    input by: ger
	//    input by: Ratheous
	//    input by: Nick Kolosov (https://sammy.ru)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: marc andreu
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Fox
	//   example 1: html_entity_decode('Kevin &amp; van Zonneveld')
	//   returns 1: 'Kevin & van Zonneveld'
	//   example 2: html_entity_decode('&amp;lt;')
	//   returns 2: '&lt;'
	const getHtmlTranslationTable = phpjed.get_html_translation_table
	let tmpStr = ''
	let entity = ''
	let symbol = ''
	tmpStr = string.toString()
	const hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
	if (hashMap === false) {
		return false
	}
	// @todo: &amp; problem
	// https://locutus.io/php/get_html_translation_table:416#comment_97660
	delete(hashMap['&'])
	hashMap['&'] = '&amp;'
	for (symbol in hashMap) {
		entity = hashMap[symbol]
		tmpStr = tmpStr.split(entity).join(symbol)
	}
	tmpStr = tmpStr.split('&#039;').join("'")
	return tmpStr
}
phpjed.htmlentities = function(string, quoteStyle, charset, doubleEncode) {
	//  discuss at: https://locutus.io/php/htmlentities/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	//  revised by: Kevin van Zonneveld (https://kvz.io)
	// improved by: nobbler
	// improved by: Jack
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	// improved by: Dj (https://locutus.io/php/htmlentities:425#comment_134018)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//    input by: Ratheous
	//      note 1: function is compatible with PHP 5.2 and older
	//   example 1: htmlentities('Kevin & van Zonneveld')
	//   returns 1: 'Kevin &amp; van Zonneveld'
	//   example 2: htmlentities("foo'bar","ENT_QUOTES")
	//   returns 2: 'foo&#039;bar'
	const getHtmlTranslationTable = phpjed.get_html_translation_table
	const hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
	string = string === null ? '' : string + ''
	if (!hashMap) {
		return false
	}
	if (quoteStyle && quoteStyle === 'ENT_QUOTES') {
		hashMap["'"] = '&#039;'
	}
	doubleEncode = doubleEncode === null || !!doubleEncode
	const regex = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' + Object.keys(
			hashMap).join('')
		// replace regexp special chars
		.replace(/([()[\]{}\-.*+?^$|/\\])/g, '\\$1') + ']', 'g')
	return string.replace(regex, function(ent) {
		if (ent.length > 1) {
			return doubleEncode ? hashMap['&'] + ent.substr(1) : ent
		}
		return hashMap[ent]
	})
}
phpjed.htmlspecialchars = function(string, quoteStyle, charset, doubleEncode) {
	//       discuss at: https://locutus.io/php/htmlspecialchars/
	//      original by: Mirek Slugen
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Nathan
	//      bugfixed by: Arno
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//       revised by: Kevin van Zonneveld (https://kvz.io)
	//         input by: Ratheous
	//         input by: Mailfaker (https://www.weedem.fr/)
	//         input by: felix
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//           note 1: charset argument not supported
	//        example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES')
	//        returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
	//        example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES'])
	//        returns 2: 'ab"c&#039;d'
	//        example 3: htmlspecialchars('my "&entity;" is still here', null, null, false)
	//        returns 3: 'my &quot;&entity;&quot; is still here'
	let optTemp = 0
	let i = 0
	let noquotes = false
	if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
		quoteStyle = 2
	}
	string = string || ''
	string = string.toString()
	if (doubleEncode !== false) {
		// Put this first to avoid double-encoding
		string = string.replace(/&/g, '&amp;')
	}
	string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
	const OPTS = {
		ENT_NOQUOTES: 0,
		ENT_HTML_QUOTE_SINGLE: 1,
		ENT_HTML_QUOTE_DOUBLE: 2,
		ENT_COMPAT: 2,
		ENT_QUOTES: 3,
		ENT_IGNORE: 4
	}
	if (quoteStyle === 0) {
		noquotes = true
	}
	if (typeof quoteStyle !== 'number') {
		// Allow for a single string or an array of string flags
		quoteStyle = [].concat(quoteStyle)
		for (i = 0; i < quoteStyle.length; i++) {
			// Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
			if (OPTS[quoteStyle[i]] === 0) {
				noquotes = true
			} else if (OPTS[quoteStyle[i]]) {
				optTemp = optTemp | OPTS[quoteStyle[i]]
			}
		}
		quoteStyle = optTemp
	}
	if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
		string = string.replace(/'/g, '&#039;')
	}
	if (!noquotes) {
		string = string.replace(/"/g, '&quot;')
	}
	return string
}
phpjed.htmlspecialchars_decode = function(string, quoteStyle) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/htmlspecialchars_decode/
	//      original by: Mirek Slugen
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Mateusz "loonquawl" Zalega
	//      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//         input by: ReverseSyntax
	//         input by: Slawomir Kaniecki
	//         input by: Scott Cariss
	//         input by: Francois
	//         input by: Ratheous
	//         input by: Mailfaker (https://www.weedem.fr/)
	//       revised by: Kevin van Zonneveld (https://kvz.io)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES')
	//        returns 1: '<p>this -> &quot;</p>'
	//        example 2: htmlspecialchars_decode("&amp;quot;")
	//        returns 2: '&quot;'
	let optTemp = 0
	let i = 0
	let noquotes = false
	if (typeof quoteStyle === 'undefined') {
		quoteStyle = 2
	}
	string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>')
	const OPTS = {
		ENT_NOQUOTES: 0,
		ENT_HTML_QUOTE_SINGLE: 1,
		ENT_HTML_QUOTE_DOUBLE: 2,
		ENT_COMPAT: 2,
		ENT_QUOTES: 3,
		ENT_IGNORE: 4
	}
	if (quoteStyle === 0) {
		noquotes = true
	}
	if (typeof quoteStyle !== 'number') {
		// Allow for a single string or an array of string flags
		quoteStyle = [].concat(quoteStyle)
		for (i = 0; i < quoteStyle.length; i++) {
			// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
			if (OPTS[quoteStyle[i]] === 0) {
				noquotes = true
			} else if (OPTS[quoteStyle[i]]) {
				optTemp = optTemp | OPTS[quoteStyle[i]]
			}
		}
		quoteStyle = optTemp
	}
	if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
		// PHP doesn't currently escape if more than one 0, but it should:
		string = string.replace(/&#0*39;/g, "'")
		// This would also be useful here, but not a part of PHP:
		// string = string.replace(/&apos;|&#x0*27;/g, "'");
	}
	if (!noquotes) {
		string = string.replace(/&quot;/g, '"')
	}
	// Put this in last place to avoid escape being double-decoded
	string = string.replace(/&amp;/g, '&')
	return string
}
phpjed.implode = function(glue, pieces) {
	//  discuss at: https://locutus.io/php/implode/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Waldo Malqui Silva (https://waldo.malqui.info)
	// improved by: Itsacon (https://www.itsacon.net/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: implode(' ', ['Kevin', 'van', 'Zonneveld'])
	//   returns 1: 'Kevin van Zonneveld'
	//   example 2: implode(' ', {first:'Kevin', last: 'van Zonneveld'})
	//   returns 2: 'Kevin van Zonneveld'
	let i = ''
	let retVal = ''
	let tGlue = ''
	if (arguments.length === 1) {
		pieces = glue
		glue = ''
	}
	if (typeof pieces === 'object') {
		if (Object.prototype.toString.call(pieces) === '[object Array]') {
			return pieces.join(glue)
		}
		for (i in pieces) {
			retVal += tGlue + pieces[i]
			tGlue = glue
		}
		return retVal
	}
	return pieces
}
phpjed.join = function(glue, pieces) {
	//  discuss at: https://locutus.io/php/join/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: join(' ', ['Kevin', 'van', 'Zonneveld'])
	//   returns 1: 'Kevin van Zonneveld'
	const implode = phpjed.implode
	return implode(glue, pieces)
}
phpjed.lcfirst = function(str) {
	//  discuss at: https://locutus.io/php/lcfirst/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: lcfirst('Kevin Van Zonneveld')
	//   returns 1: 'kevin Van Zonneveld'
	str += ''
	const f = str.charAt(0).toLowerCase()
	return f + str.substr(1)
}
phpjed.levenshtein = function(s1, s2, costIns, costRep, costDel) {
	//       discuss at: https://locutus.io/php/levenshtein/
	//      original by: Carlos R. L. Rodrigues (https://www.jsfromhell.com)
	//      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//       revised by: Andrea Giammarchi (https://webreflection.blogspot.com)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	// reimplemented by: Alexander M Beedie
	// reimplemented by: Rafał Kukawski (https://blog.kukawski.pl)
	//        example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld')
	//        returns 1: 3
	//        example 2: levenshtein("carrrot", "carrots")
	//        returns 2: 2
	//        example 3: levenshtein("carrrot", "carrots", 2, 3, 4)
	//        returns 3: 6
	// var LEVENSHTEIN_MAX_LENGTH = 255 // PHP limits the function to max 255 character-long strings
	costIns = costIns == null ? 1 : +costIns
	costRep = costRep == null ? 1 : +costRep
	costDel = costDel == null ? 1 : +costDel
	if (s1 === s2) {
		return 0
	}
	const l1 = s1.length
	const l2 = s2.length
	if (l1 === 0) {
		return l2 * costIns
	}
	if (l2 === 0) {
		return l1 * costDel
	}
	// Enable the 3 lines below to set the same limits on string length as PHP does
	// if (l1 > LEVENSHTEIN_MAX_LENGTH || l2 > LEVENSHTEIN_MAX_LENGTH) {
	//   return -1;
	// }
	let split = false
	try {
		split = !('0')[0]
	} catch (e) {
		// Earlier IE may not support access by string index
		split = true
	}
	if (split) {
		s1 = s1.split('')
		s2 = s2.split('')
	}
	let p1 = new Array(l2 + 1)
	let p2 = new Array(l2 + 1)
	let i1, i2, c0, c1, c2, tmp
	for (i2 = 0; i2 <= l2; i2++) {
		p1[i2] = i2 * costIns
	}
	for (i1 = 0; i1 < l1; i1++) {
		p2[0] = p1[0] + costDel
		for (i2 = 0; i2 < l2; i2++) {
			c0 = p1[i2] + ((s1[i1] === s2[i2]) ? 0 : costRep)
			c1 = p1[i2 + 1] + costDel
			if (c1 < c0) {
				c0 = c1
			}
			c2 = p2[i2] + costIns
			if (c2 < c0) {
				c0 = c2
			}
			p2[i2 + 1] = c0
		}
		tmp = p1
		p1 = p2
		p2 = tmp
	}
	c0 = p1[l2]
	return c0
}
phpjed.localeconv = function() {
	//  discuss at: https://locutus.io/php/localeconv/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: setlocale('LC_ALL', 'en_US')
	//   example 1: localeconv()
	//   returns 1: {decimal_point: '.', thousands_sep: '', positive_sign: '', negative_sign: '-', int_frac_digits: 2, frac_digits: 2, p_cs_precedes: 1, p_sep_by_space: 0, n_cs_precedes: 1, n_sep_by_space: 0, p_sign_posn: 1, n_sign_posn: 1, grouping: [], int_curr_symbol: 'USD ', currency_symbol: '$', mon_decimal_point: '.', mon_thousands_sep: ',', mon_grouping: [3, 3]}
	const setlocale = phpjed.setlocale
	const arr = {}
	let prop = ''
	// ensure setup of localization variables takes place, if not already
	setlocale('LC_ALL', 0)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	// Make copies
	for (prop in $locutus.php.locales[$locutus.php.localeCategories.LC_NUMERIC].LC_NUMERIC) {
		arr[prop] = $locutus.php.locales[$locutus.php.localeCategories.LC_NUMERIC].LC_NUMERIC[
			prop]
	}
	for (prop in $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY].LC_MONETARY) {
		arr[prop] = $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY].LC_MONETARY[
			prop]
	}
	return arr
}
phpjed.ltrim = function(str, charlist) {
	//  discuss at: https://locutus.io/php/ltrim/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Erkekjetter
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: ltrim('    Kevin van Zonneveld    ')
	//   returns 1: 'Kevin van Zonneveld    '
	charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
	const re = new RegExp('^[' + charlist + ']+', 'g')
	return (str + '').replace(re, '')
}
phpjed.metaphone = function(word, maxPhonemes) {
	//  discuss at: https://locutus.io/php/metaphone/
	// original by: Greg Frazier
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	//   example 1: metaphone('Gnu')
	//   returns 1: 'N'
	//   example 2: metaphone('bigger')
	//   returns 2: 'BKR'
	//   example 3: metaphone('accuracy')
	//   returns 3: 'AKKRS'
	//   example 4: metaphone('batch batcher')
	//   returns 4: 'BXBXR'
	const type = typeof word
	if (type === 'undefined' || type === 'object' && word !== null) {
		// weird!
		return null
	}
	// infinity and NaN values are treated as strings
	if (type === 'number') {
		if (isNaN(word)) {
			word = 'NAN'
		} else if (!isFinite(word)) {
			word = 'INF'
		}
	}
	if (maxPhonemes < 0) {
		return false
	}
	maxPhonemes = Math.floor(+maxPhonemes) || 0
	// alpha depends on locale, so this var might need an update
	// or should be turned into a regex
	// for now assuming pure a-z
	const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const vowel = 'AEIOU'
	const soft = 'EIY'
	const leadingNonAlpha = new RegExp('^[^' + alpha + ']+')
	word = typeof word === 'string' ? word : ''
	word = word.toUpperCase().replace(leadingNonAlpha, '')
	if (!word) {
		return ''
	}
	const is = function(p, c) {
		return c !== '' && p.indexOf(c) !== -1
	}
	let i = 0
	let cc = word.charAt(0) // current char. Short name because it's used all over the function
	let nc = word.charAt(1) // next char
	let nnc // after next char
	let pc // previous char
	const l = word.length
	let meta = ''
	// traditional is an internal param that could be exposed for now let it be a local var
	const traditional = true
	switch (cc) {
		case 'A':
			meta += nc === 'E' ? nc : cc
			i += 1
			break
		case 'G':
		case 'K':
		case 'P':
			if (nc === 'N') {
				meta += nc
				i += 2
			}
			break
		case 'W':
			if (nc === 'R') {
				meta += nc
				i += 2
			} else if (nc === 'H' || is(vowel, nc)) {
				meta += 'W'
				i += 2
			}
			break
		case 'X':
			meta += 'S'
			i += 1
			break
		case 'E':
		case 'I':
		case 'O':
		case 'U':
			meta += cc
			i++
			break
	}
	for (; i < l && (maxPhonemes === 0 || meta.length < maxPhonemes); i +=
		1) { // eslint-disable-line no-unmodified-loop-condition,max-len
		cc = word.charAt(i)
		nc = word.charAt(i + 1)
		pc = word.charAt(i - 1)
		nnc = word.charAt(i + 2)
		if (cc === pc && cc !== 'C') {
			continue
		}
		switch (cc) {
			case 'B':
				if (pc !== 'M') {
					meta += cc
				}
				break
			case 'C':
				if (is(soft, nc)) {
					if (nc === 'I' && nnc === 'A') {
						meta += 'X'
					} else if (pc !== 'S') {
						meta += 'S'
					}
				} else if (nc === 'H') {
					meta += !traditional && (nnc === 'R' || pc === 'S') ? 'K' : 'X'
					i += 1
				} else {
					meta += 'K'
				}
				break
			case 'D':
				if (nc === 'G' && is(soft, nnc)) {
					meta += 'J'
					i += 1
				} else {
					meta += 'T'
				}
				break
			case 'G':
				if (nc === 'H') {
					if (!(is('BDH', word.charAt(i - 3)) || word.charAt(i - 4) === 'H')) {
						meta += 'F'
						i += 1
					}
				} else if (nc === 'N') {
					if (is(alpha, nnc) && word.substr(i + 1, 3) !== 'NED') {
						meta += 'K'
					}
				} else if (is(soft, nc) && pc !== 'G') {
					meta += 'J'
				} else {
					meta += 'K'
				}
				break
			case 'H':
				if (is(vowel, nc) && !is('CGPST', pc)) {
					meta += cc
				}
				break
			case 'K':
				if (pc !== 'C') {
					meta += 'K'
				}
				break
			case 'P':
				meta += nc === 'H' ? 'F' : cc
				break
			case 'Q':
				meta += 'K'
				break
			case 'S':
				if (nc === 'I' && is('AO', nnc)) {
					meta += 'X'
				} else if (nc === 'H') {
					meta += 'X'
					i += 1
				} else if (!traditional && word.substr(i + 1, 3) === 'CHW') {
					meta += 'X'
					i += 2
				} else {
					meta += 'S'
				}
				break
			case 'T':
				if (nc === 'I' && is('AO', nnc)) {
					meta += 'X'
				} else if (nc === 'H') {
					meta += '0'
					i += 1
				} else if (word.substr(i + 1, 2) !== 'CH') {
					meta += 'T'
				}
				break
			case 'V':
				meta += 'F'
				break
			case 'W':
			case 'Y':
				if (is(vowel, nc)) {
					meta += cc
				}
				break
			case 'X':
				meta += 'KS'
				break
			case 'Z':
				meta += 'S'
				break
			case 'F':
			case 'J':
			case 'L':
			case 'M':
			case 'N':
			case 'R':
				meta += cc
				break
		}
	}
	return meta
}
phpjed.nl2br = function(str, isXhtml) {
	//  discuss at: https://locutus.io/php/nl2br/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Philip Peterson
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Atli Þór
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Maximusya
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Reynier de la Rosa (https://scriptinside.blogspot.com.es/)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//   example 1: nl2br('Kevin\nvan\nZonneveld')
	//   returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
	//   example 2: nl2br("\nOne\nTwo\n\nThree\n", false)
	//   returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
	//   example 3: nl2br("\nOne\nTwo\n\nThree\n", true)
	//   returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
	//   example 4: nl2br(null)
	//   returns 4: ''
	// Some latest browsers when str is null return and unexpected null value
	if (typeof str === 'undefined' || str === null) {
		return ''
	}
	// Adjust comment to avoid issue on locutus.io display
	const breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br ' + '/>' : '<br>'
	return (str + '').replace(/(\r\n|\n\r|\r|\n)/g, breakTag + '$1')
}
phpjed.nl_langinfo = function(item) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/nl_langinfo/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: nl_langinfo('DAY_1')
	//   returns 1: 'Sunday'
	const setlocale = phpjed.setlocale
	setlocale('LC_ALL', 0) // Ensure locale data is available
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	let loc = $locutus.php.locales[$locutus.php.localeCategories.LC_TIME]
	if (item.indexOf('ABDAY_') === 0) {
		return loc.LC_TIME.a[parseInt(item.replace(/^ABDAY_/, ''), 10) - 1]
	} else if (item.indexOf('DAY_') === 0) {
		return loc.LC_TIME.A[parseInt(item.replace(/^DAY_/, ''), 10) - 1]
	} else if (item.indexOf('ABMON_') === 0) {
		return loc.LC_TIME.b[parseInt(item.replace(/^ABMON_/, ''), 10) - 1]
	} else if (item.indexOf('MON_') === 0) {
		return loc.LC_TIME.B[parseInt(item.replace(/^MON_/, ''), 10) - 1]
	} else {
		switch (item) {
			// More LC_TIME
			case 'AM_STR':
				return loc.LC_TIME.p[0]
			case 'PM_STR':
				return loc.LC_TIME.p[1]
			case 'D_T_FMT':
				return loc.LC_TIME.c
			case 'D_FMT':
				return loc.LC_TIME.x
			case 'T_FMT':
				return loc.LC_TIME.X
			case 'T_FMT_AMPM':
				return loc.LC_TIME.r
			case 'ERA':
			case 'ERA_YEAR':
			case 'ERA_D_T_FMT':
			case 'ERA_D_FMT':
			case 'ERA_T_FMT':
				// all fall-throughs
				return loc.LC_TIME[item]
		}
		loc = $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY]
		if (item === 'CRNCYSTR') {
			// alias
			item = 'CURRENCY_SYMBOL'
		}
		switch (item) {
			case 'INT_CURR_SYMBOL':
			case 'CURRENCY_SYMBOL':
			case 'MON_DECIMAL_POINT':
			case 'MON_THOUSANDS_SEP':
			case 'POSITIVE_SIGN':
			case 'NEGATIVE_SIGN':
			case 'INT_FRAC_DIGITS':
			case 'FRAC_DIGITS':
			case 'P_CS_PRECEDES':
			case 'P_SEP_BY_SPACE':
			case 'N_CS_PRECEDES':
			case 'N_SEP_BY_SPACE':
			case 'P_SIGN_POSN':
			case 'N_SIGN_POSN':
				// all fall-throughs
				return loc.LC_MONETARY[item.toLowerCase()]
			case 'MON_GROUPING':
				// Same as above, or return something different since this returns an array?
				return loc.LC_MONETARY[item.toLowerCase()]
		}
		loc = $locutus.php.locales[$locutus.php.localeCategories.LC_NUMERIC]
		switch (item) {
			case 'RADIXCHAR':
			case 'DECIMAL_POINT':
				// Fall-through
				return loc.LC_NUMERIC[item.toLowerCase()]
			case 'THOUSEP':
			case 'THOUSANDS_SEP':
				// Fall-through
				return loc.LC_NUMERIC[item.toLowerCase()]
			case 'GROUPING':
				// Same as above, or return something different since this returns an array?
				return loc.LC_NUMERIC[item.toLowerCase()]
		}
		loc = $locutus.php.locales[$locutus.php.localeCategories.LC_MESSAGES]
		switch (item) {
			case 'YESEXPR':
			case 'NOEXPR':
			case 'YESSTR':
			case 'NOSTR':
				// all fall-throughs
				return loc.LC_MESSAGES[item]
		}
		loc = $locutus.php.locales[$locutus.php.localeCategories.LC_CTYPE]
		if (item === 'CODESET') {
			return loc.LC_CTYPE[item]
		}
		return false
	}
}
phpjed.number_format = function(number, decimals, decPoint,
thousandsSep) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/number_format/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: davook
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Michael White (https://getsprink.com)
	// bugfixed by: Benjamin Lupton
	// bugfixed by: Allan Jensen (https://www.winternet.no)
	// bugfixed by: Howard Yeend
	// bugfixed by: Diogo Resende
	// bugfixed by: Rival
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	//  revised by: Luke Smith (https://lucassmith.name)
	//    input by: Kheang Hok Chin (https://www.distantia.ca/)
	//    input by: Jay Klehr
	//    input by: Amir Habibi (https://www.residence-mixte.com/)
	//    input by: Amirouche
	//   example 1: number_format(1234.56)
	//   returns 1: '1,235'
	//   example 2: number_format(1234.56, 2, ',', ' ')
	//   returns 2: '1 234,56'
	//   example 3: number_format(1234.5678, 2, '.', '')
	//   returns 3: '1234.57'
	//   example 4: number_format(67, 2, ',', '.')
	//   returns 4: '67,00'
	//   example 5: number_format(1000)
	//   returns 5: '1,000'
	//   example 6: number_format(67.311, 2)
	//   returns 6: '67.31'
	//   example 7: number_format(1000.55, 1)
	//   returns 7: '1,000.6'
	//   example 8: number_format(67000, 5, ',', '.')
	//   returns 8: '67.000,00000'
	//   example 9: number_format(0.9, 0)
	//   returns 9: '1'
	//  example 10: number_format('1.20', 2)
	//  returns 10: '1.20'
	//  example 11: number_format('1.20', 4)
	//  returns 11: '1.2000'
	//  example 12: number_format('1.2000', 3)
	//  returns 12: '1.200'
	//  example 13: number_format('1 000,50', 2, '.', ' ')
	//  returns 13: '100 050.00'
	//  example 14: number_format(1e-8, 8, '.', '')
	//  returns 14: '0.00000001'
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
	const n = !isFinite(+number) ? 0 : +number
	const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
	const sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
	const dec = (typeof decPoint === 'undefined') ? '.' : decPoint
	let s = ''
	const toFixedFix = function(n, prec) {
		if (('' + n).indexOf('e') === -1) {
			return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
		} else {
			const arr = ('' + n).split('e')
			let sig = ''
			if (+arr[1] + prec > 0) {
				sig = '+'
			}
			return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec))
				.toFixed(prec)
		}
	}
	// @todo: for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || ''
		s[1] += new Array(prec - s[1].length + 1).join('0')
	}
	return s.join(dec)
}
phpjed.ord = function(string) {
	//  discuss at: https://locutus.io/php/ord/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: incidence
	//   example 1: ord('K')
	//   returns 1: 75
	//   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
	//   returns 2: 65536
	const str = string + ''
	const code = str.charCodeAt(0)
	if (code >= 0xD800 && code <= 0xDBFF) {
		// High surrogate (could change last hex to 0xDB7F to treat
		// high private surrogates as single characters)
		const hi = code
		if (str.length === 1) {
			// This is just a high surrogate with no following low surrogate,
			// so we return its value;
			return code
			// we could also throw an error as it is not a complete character,
			// but someone may want to know
		}
		const low = str.charCodeAt(1)
		return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
	}
	if (code >= 0xDC00 && code <= 0xDFFF) {
		// Low surrogate
		// This is just a low surrogate with no preceding high surrogate,
		// so we return its value;
		return code
		// we could also throw an error as it is not a complete character,
		// but someone may want to know
	}
	return code
}
phpjed.parse_str = function(str, array) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/parse_str/
	//      original by: Cagri Ekin
	//      improved by: Michael White (https://getsprink.com)
	//      improved by: Jack
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: stag019
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: MIO_KODUKI (https://mio-koduki.blogspot.com/)
	// reimplemented by: stag019
	//         input by: Dreamer
	//         input by: Zaide (https://zaidesthings.com/)
	//         input by: David Pesta (https://davidpesta.com/)
	//         input by: jeicquest
	//      bugfixed by: Rafał Kukawski
	//           note 1: When no argument is specified, will put variables in global scope.
	//           note 1: When a particular argument has been passed, and the
	//           note 1: returned value is different parse_str of PHP.
	//           note 1: For example, a=b=c&d====c
	//        example 1: var $arr = {}
	//        example 1: parse_str('first=foo&second=bar', $arr)
	//        example 1: var $result = $arr
	//        returns 1: { first: 'foo', second: 'bar' }
	//        example 2: var $arr = {}
	//        example 2: parse_str('str_a=Jack+and+Jill+didn%27t+see+the+well.', $arr)
	//        example 2: var $result = $arr
	//        returns 2: { str_a: "Jack and Jill didn't see the well." }
	//        example 3: var $abc = {3:'a'}
	//        example 3: parse_str('a[b]["c"]=def&a[q]=t+5', $abc)
	//        example 3: var $result = $abc
	//        returns 3: {"3":"a","a":{"b":{"c":"def"},"q":"t 5"}}
	//        example 4: var $arr = {}
	//        example 4: parse_str('a[][]=value', $arr)
	//        example 4: var $result = $arr
	//        returns 4: {"a":{"0":{"0":"value"}}}
	//        example 5: var $arr = {}
	//        example 5: parse_str('a=1&a[]=2', $arr)
	//        example 5: var $result = $arr
	//        returns 5: {"a":{"0":"2"}}
	const strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&')
	const sal = strArr.length
	let i
	let j
	let ct
	let p
	let lastObj
	let obj
	let chr
	let tmp
	let key
	let value
	let postLeftBracketPos
	let keys
	let keysLen
	const _fixStr = function(str) {
		return decodeURIComponent(str.replace(/\+/g, '%20'))
	}
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	if (!array) {
		array = $global
	}
	for (i = 0; i < sal; i++) {
		tmp = strArr[i].split('=')
		key = _fixStr(tmp[0])
		value = (tmp.length < 2) ? '' : _fixStr(tmp[1])
		if (key.includes('__proto__') || key.includes('constructor') || key.includes(
				'prototype')) {
			break
		}
		while (key.charAt(0) === ' ') {
			key = key.slice(1)
		}
		if (key.indexOf('\x00') > -1) {
			key = key.slice(0, key.indexOf('\x00'))
		}
		if (key && key.charAt(0) !== '[') {
			keys = []
			postLeftBracketPos = 0
			for (j = 0; j < key.length; j++) {
				if (key.charAt(j) === '[' && !postLeftBracketPos) {
					postLeftBracketPos = j + 1
				} else if (key.charAt(j) === ']') {
					if (postLeftBracketPos) {
						if (!keys.length) {
							keys.push(key.slice(0, postLeftBracketPos - 1))
						}
						keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos))
						postLeftBracketPos = 0
						if (key.charAt(j + 1) !== '[') {
							break
						}
					}
				}
			}
			if (!keys.length) {
				keys = [key]
			}
			for (j = 0; j < keys[0].length; j++) {
				chr = keys[0].charAt(j)
				if (chr === ' ' || chr === '.' || chr === '[') {
					keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1)
				}
				if (chr === '[') {
					break
				}
			}
			obj = array
			for (j = 0, keysLen = keys.length; j < keysLen; j++) {
				key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '')
				lastObj = obj
				if ((key === '' || key === ' ') && j !== 0) {
					// Insert new dimension
					ct = -1
					for (p in obj) {
						if (obj.hasOwnProperty(p)) {
							if (+p > ct && p.match(/^\d+$/g)) {
								ct = +p
							}
						}
					}
					key = ct + 1
				}
				// if primitive value, replace with object
				if (Object(obj[key]) !== obj[key]) {
					obj[key] = {}
				}
				obj = obj[key]
			}
			lastObj[key] = value
		}
	}
}
phpjed.printf = function() {
	//  discuss at: https://locutus.io/php/printf/
	// original by: Ash Searle (https://hexmen.com/blog/)
	// improved by: Michael White (https://getsprink.com)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: printf("%01.2f", 123.1)
	//   returns 1: 6
	const sprintf = phpjed.sprintf
	const echo = phpjed.echo
	const ret = sprintf.apply(this, arguments)
	echo(ret)
	return ret.length
}
phpjed.quoted_printable_decode = function(str) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/quoted_printable_decode/
	//      original by: Ole Vrijenhoek
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: Theriault (https://github.com/Theriault)
	// reimplemented by: Theriault (https://github.com/Theriault)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//        example 1: quoted_printable_decode('a=3Db=3Dc')
	//        returns 1: 'a=b=c'
	//        example 2: quoted_printable_decode('abc  =20\r\n123  =20\r\n')
	//        returns 2: 'abc   \r\n123   \r\n'
	//        example 3: quoted_printable_decode('012345678901234567890123456789012345678901234567890123456789012345678901234=\r\n56789')
	//        returns 3: '01234567890123456789012345678901234567890123456789012345678901234567890123456789'
	//        example 4: quoted_printable_decode("Lorem ipsum dolor sit amet=23, consectetur adipisicing elit")
	//        returns 4: 'Lorem ipsum dolor sit amet#, consectetur adipisicing elit'
	// Decodes all equal signs followed by two hex digits
	const RFC2045Decode1 = /=\r\n/gm
	// the RFC states against decoding lower case encodings, but following apparent PHP behavior
	const RFC2045Decode2IN = /=([0-9A-F]{2})/gim
	// RFC2045Decode2IN = /=([0-9A-F]{2})/gm,
	const RFC2045Decode2OUT = function(sMatch, sHex) {
		return String.fromCharCode(parseInt(sHex, 16))
	}
	return str.replace(RFC2045Decode1, '').replace(RFC2045Decode2IN, RFC2045Decode2OUT)
}
phpjed.quoted_printable_encode = function(str) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/quoted_printable_encode/
	// original by: Theriault (https://github.com/Theriault)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Theriault (https://github.com/Theriault)
	//   example 1: quoted_printable_encode('a=b=c')
	//   returns 1: 'a=3Db=3Dc'
	//   example 2: quoted_printable_encode('abc   \r\n123   \r\n')
	//   returns 2: 'abc  =20\r\n123  =20\r\n'
	//   example 3: quoted_printable_encode('0123456789012345678901234567890123456789012345678901234567890123456789012345')
	//   returns 3: '012345678901234567890123456789012345678901234567890123456789012345678901234=\r\n5'
	//        test: skip-2
	const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E',
		'F'
	]
	const RFC2045Encode1IN = / \r\n|\r\n|[^!-<>-~ ]/gm
	const RFC2045Encode1OUT = function(sMatch) {
		// Encode space before CRLF sequence to prevent spaces from being stripped
		// Keep hard line breaks intact; CRLF sequences
		if (sMatch.length > 1) {
			return sMatch.replace(' ', '=20')
		}
		// Encode matching character
		const chr = sMatch.charCodeAt(0)
		return '=' + hexChars[((chr >>> 4) & 15)] + hexChars[(chr & 15)]
	}
	// Split lines to 75 characters; the reason it's 75 and not 76 is because softline breaks are
	// preceeded by an equal sign; which would be the 76th character. However, if the last line/string
	// was exactly 76 characters, then a softline would not be needed. PHP currently softbreaks
	// anyway; so this function replicates PHP.
	const RFC2045Encode2IN = /.{1,72}(?!\r\n)[^=]{0,3}/g
	const RFC2045Encode2OUT = function(sMatch) {
		if (sMatch.substr(sMatch.length - 2) === '\r\n') {
			return sMatch
		}
		return sMatch + '=\r\n'
	}
	str = str.replace(RFC2045Encode1IN, RFC2045Encode1OUT).replace(RFC2045Encode2IN,
		RFC2045Encode2OUT)
	// Strip last softline break
	return str.substr(0, str.length - 3)
}
phpjed.quotemeta = function(str) {
	//  discuss at: https://locutus.io/php/quotemeta/
	// original by: Paulo Freitas
	//   example 1: quotemeta(". + * ? ^ ( $ )")
	//   returns 1: '\\. \\+ \\* \\? \\^ \\( \\$ \\)'
	return (str + '').replace(/([.\\+*?[^\]$()])/g, '\\$1')
}
phpjed.rtrim = function(str, charlist) {
	//  discuss at: https://locutus.io/php/rtrim/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Erkekjetter
	//    input by: rem
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: rtrim('    Kevin van Zonneveld    ')
	//   returns 1: '    Kevin van Zonneveld'
	charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([[\]().?/*{}+$^:])/g,
		'\\$1')
	const re = new RegExp('[' + charlist + ']+$', 'g')
	return (str + '').replace(re, '')
}
phpjed.setlocale = function(category, locale) {
	//  discuss at: https://locutus.io/php/setlocale/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: Blues (https://hacks.bluesmoon.info/strftime/strftime.js)
	// original by: YUI Library (https://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html)
	//      note 1: Is extensible, but currently only implements locales en,
	//      note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
	//      note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
	//      note 1: Uses global: locutus to store locale info
	//      note 1: Consider using https://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
	//      note 2: This function tries to establish the locale via the `window` global.
	//      note 2: This feature will not work in Node and hence is Browser-only
	//   example 1: setlocale('LC_ALL', 'en_US')
	//   returns 1: 'en_US'
	const getenv = phpjed.getenv
	let categ = ''
	const cats = []
	let i = 0
	const _copy = function _copy(orig) {
		if (orig instanceof RegExp) {
			return new RegExp(orig)
		} else if (orig instanceof Date) {
			return new Date(orig)
		}
		const newObj = {}
		for (const i in orig) {
			if (typeof orig[i] === 'object') {
				newObj[i] = _copy(orig[i])
			} else {
				newObj[i] = orig[i]
			}
		}
		return newObj
	}
	// Function usable by a ngettext implementation (apparently not an accessible part of setlocale(),
	// but locale-specific) See https://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms
	// though amended with others from https://developer.mozilla.org/En/Localization_and_Plurals (new
	// categories noted with "MDC" below, though not sure of whether there is a convention for the
	// relative order of these newer groups as far as ngettext) The function name indicates the number
	// of plural forms (nplural) Need to look into https://cldr.unicode.org/ (maybe future JavaScript);
	// Dojo has some functions (under new BSD), including JSON conversions of LDML XML from CLDR:
	// https://bugs.dojotoolkit.org/browser/dojo/trunk/cldr and docs at
	// https://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
	// var _nplurals1 = function (n) {
	//   // e.g., Japanese
	//   return 0
	// }
	const _nplurals2a = function(n) {
		// e.g., English
		return n !== 1 ? 1 : 0
	}
	const _nplurals2b = function(n) {
		// e.g., French
		return n > 1 ? 1 : 0
	}
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	// Reconcile Windows vs. *nix locale names?
	// Allow different priority orders of languages, esp. if implement gettext as in
	// LANGUAGE env. var.? (e.g., show German if French is not available)
	if (!$locutus.php.locales || !$locutus.php.locales.fr_CA || !$locutus.php.locales.fr_CA
		.LC_TIME || !$locutus.php.locales.fr_CA.LC_TIME.x) {
		// Can add to the locales
		$locutus.php.locales = {}
		$locutus.php.locales.en = {
			LC_COLLATE: function(str1, str2) {
				// @todo: This one taken from strcmp, but need for other locales; we don't use localeCompare
				// since its locale is not settable
				return (str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1)
			},
			LC_CTYPE: {
				// Need to change any of these for English as opposed to C?
				an: /^[A-Za-z\d]+$/g,
				al: /^[A-Za-z]+$/g,
				ct: /^[\u0000-\u001F\u007F]+$/g,
				dg: /^[\d]+$/g,
				gr: /^[\u0021-\u007E]+$/g,
				lw: /^[a-z]+$/g,
				pr: /^[\u0020-\u007E]+$/g,
				pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
				sp: /^[\f\n\r\t\v ]+$/g,
				up: /^[A-Z]+$/g,
				xd: /^[A-Fa-f\d]+$/g,
				CODESET: 'UTF-8',
				// Used by sql_regcase
				lower: 'abcdefghijklmnopqrstuvwxyz',
				upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
			},
			LC_TIME: {
				// Comments include nl_langinfo() constant equivalents and any
				// changes from Blues' implementation
				a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				// ABDAY_
				A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
					'Saturday'
				],
				// DAY_
				b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
					'Nov', 'Dec'
				],
				// ABMON_
				B: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
					'August', 'September', 'October', 'November', 'December'
				],
				// MON_
				c: '%a %d %b %Y %r %Z',
				// D_T_FMT // changed %T to %r per results
				p: ['AM', 'PM'],
				// AM_STR/PM_STR
				P: ['am', 'pm'],
				// Not available in nl_langinfo()
				r: '%I:%M:%S %p',
				// T_FMT_AMPM (Fixed for all locales)
				x: '%m/%d/%Y',
				// D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
				X: '%r',
				// T_FMT // changed from %T to %r  (%T is default for C, not English US)
				// Following are from nl_langinfo() or https://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
				alt_digits: '',
				// e.g., ordinal
				ERA: '',
				ERA_YEAR: '',
				ERA_D_T_FMT: '',
				ERA_D_FMT: '',
				ERA_T_FMT: ''
			},
			// Assuming distinction between numeric and monetary is thus:
			// See below for C locale
			LC_MONETARY: {
				// based on Windows "english" (English_United States.1252) locale
				int_curr_symbol: 'USD',
				currency_symbol: '$',
				mon_decimal_point: '.',
				mon_thousands_sep: ',',
				mon_grouping: [3],
				// use mon_thousands_sep; "" for no grouping; additional array members
				// indicate successive group lengths after first group
				// (e.g., if to be 1,23,456, could be [3, 2])
				positive_sign: '',
				negative_sign: '-',
				int_frac_digits: 2,
				// Fractional digits only for money defaults?
				frac_digits: 2,
				p_cs_precedes: 1,
				// positive currency symbol follows value = 0; precedes value = 1
				p_sep_by_space: 0,
				// 0: no space between curr. symbol and value; 1: space sep. them unless symb.
				// and sign are adjacent then space sep. them from value; 2: space sep. sign
				// and value unless symb. and sign are adjacent then space separates
				n_cs_precedes: 1,
				// see p_cs_precedes
				n_sep_by_space: 0,
				// see p_sep_by_space
				p_sign_posn: 3,
				// 0: parentheses surround quantity and curr. symbol; 1: sign precedes them;
				// 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed.
				// succeeds curr. symbol
				n_sign_posn: 0 // see p_sign_posn
			},
			LC_NUMERIC: {
				// based on Windows "english" (English_United States.1252) locale
				decimal_point: '.',
				thousands_sep: ',',
				grouping: [
					3] // see mon_grouping, but for non-monetary values (use thousands_sep)
			},
			LC_MESSAGES: {
				YESEXPR: '^[yY].*',
				NOEXPR: '^[nN].*',
				YESSTR: '',
				NOSTR: ''
			},
			nplurals: _nplurals2a
		}
		$locutus.php.locales.en_US = _copy($locutus.php.locales.en)
		$locutus.php.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z'
		$locutus.php.locales.en_US.LC_TIME.x = '%D'
		$locutus.php.locales.en_US.LC_TIME.X = '%r'
		// The following are based on *nix settings
		$locutus.php.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD '
		$locutus.php.locales.en_US.LC_MONETARY.p_sign_posn = 1
		$locutus.php.locales.en_US.LC_MONETARY.n_sign_posn = 1
		$locutus.php.locales.en_US.LC_MONETARY.mon_grouping = [3, 3]
		$locutus.php.locales.en_US.LC_NUMERIC.thousands_sep = ''
		$locutus.php.locales.en_US.LC_NUMERIC.grouping = []
		$locutus.php.locales.en_GB = _copy($locutus.php.locales.en)
		$locutus.php.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z'
		$locutus.php.locales.en_AU = _copy($locutus.php.locales.en_GB)
		// Assume C locale is like English (?) (We need C locale for LC_CTYPE)
		$locutus.php.locales.C = _copy($locutus.php.locales.en)
		$locutus.php.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968'
		$locutus.php.locales.C.LC_MONETARY = {
			int_curr_symbol: '',
			currency_symbol: '',
			mon_decimal_point: '',
			mon_thousands_sep: '',
			mon_grouping: [],
			p_cs_precedes: 127,
			p_sep_by_space: 127,
			n_cs_precedes: 127,
			n_sep_by_space: 127,
			p_sign_posn: 127,
			n_sign_posn: 127,
			positive_sign: '',
			negative_sign: '',
			int_frac_digits: 127,
			frac_digits: 127
		}
		$locutus.php.locales.C.LC_NUMERIC = {
			decimal_point: '.',
			thousands_sep: '',
			grouping: []
		}
		// D_T_FMT
		$locutus.php.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'
		// D_FMT
		$locutus.php.locales.C.LC_TIME.x = '%m/%d/%y'
		// T_FMT
		$locutus.php.locales.C.LC_TIME.X = '%H:%M:%S'
		$locutus.php.locales.C.LC_MESSAGES.YESEXPR = '^[yY]'
		$locutus.php.locales.C.LC_MESSAGES.NOEXPR = '^[nN]'
		$locutus.php.locales.fr = _copy($locutus.php.locales.en)
		$locutus.php.locales.fr.nplurals = _nplurals2b
		$locutus.php.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
		$locutus.php.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi',
			'vendredi', 'samedi'
		]
		$locutus.php.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun',
			'jui', 'ao\u00FB', 'sep', 'oct', 'nov', 'd\u00E9c'
		]
		$locutus.php.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai',
			'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre',
			'd\u00E9cembre'
		]
		$locutus.php.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z'
		$locutus.php.locales.fr.LC_TIME.p = ['', '']
		$locutus.php.locales.fr.LC_TIME.P = ['', '']
		$locutus.php.locales.fr.LC_TIME.x = '%d.%m.%Y'
		$locutus.php.locales.fr.LC_TIME.X = '%T'
		$locutus.php.locales.fr_CA = _copy($locutus.php.locales.fr)
		$locutus.php.locales.fr_CA.LC_TIME.x = '%Y-%m-%d'
	}
	if (!$locutus.php.locale) {
		$locutus.php.locale = 'en_US'
		// Try to establish the locale via the `window` global
		if (typeof window !== 'undefined' && window.document) {
			const d = window.document
			const NS_XHTML = 'https://www.w3.org/1999/xhtml'
			const NS_XML = 'https://www.w3.org/XML/1998/namespace'
			if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
				if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d
					.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')
					) {
					$locutus.php.locale = d.getElementsByTagName(NS_XHTML, 'html')[0]
						.getAttributeNS(NS_XML, 'lang')
				} else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) {
					// XHTML 1.0 only
					$locutus.php.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang
				}
			} else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0]
				.lang) {
				$locutus.php.locale = d.getElementsByTagName('html')[0].lang
			}
		}
	}
	// PHP-style
	$locutus.php.locale = $locutus.php.locale.replace('-', '_')
	// @todo: locale if declared locale hasn't been defined
	if (!($locutus.php.locale in $locutus.php.locales)) {
		if ($locutus.php.locale.replace(/_[a-zA-Z]+$/, '') in $locutus.php.locales) {
			$locutus.php.locale = $locutus.php.locale.replace(/_[a-zA-Z]+$/, '')
		}
	}
	if (!$locutus.php.localeCategories) {
		$locutus.php.localeCategories = {
			LC_COLLATE: $locutus.php.locale,
			// for string comparison, see strcoll()
			LC_CTYPE: $locutus.php.locale,
			// for character classification and conversion, for example strtoupper()
			LC_MONETARY: $locutus.php.locale,
			// for localeconv()
			LC_NUMERIC: $locutus.php.locale,
			// for decimal separator (See also localeconv())
			LC_TIME: $locutus.php.locale,
			// for date and time formatting with strftime()
			// for system responses (available if PHP was compiled with libintl):
			LC_MESSAGES: $locutus.php.locale
		}
	}
	if (locale === null || locale === '') {
		locale = getenv(category) || getenv('LANG')
	} else if (Object.prototype.toString.call(locale) === '[object Array]') {
		for (i = 0; i < locale.length; i++) {
			if (!(locale[i] in $locutus.php.locales)) {
				if (i === locale.length - 1) {
					// none found
					return false
				}
				continue
			}
			locale = locale[i]
			break
		}
	}
	// Just get the locale
	if (locale === '0' || locale === 0) {
		if (category === 'LC_ALL') {
			for (categ in $locutus.php.localeCategories) {
				// Add ".UTF-8" or allow ".@latint", etc. to the end?
				cats.push(categ + '=' + $locutus.php.localeCategories[categ])
			}
			return cats.join(';')
		}
		return $locutus.php.localeCategories[category]
	}
	if (!(locale in $locutus.php.locales)) {
		// Locale not found
		return false
	}
	// Set and get locale
	if (category === 'LC_ALL') {
		for (categ in $locutus.php.localeCategories) {
			$locutus.php.localeCategories[categ] = locale
		}
	} else {
		$locutus.php.localeCategories[category] = locale
	}
	return locale
}
phpjed.similar_text = function(first, second, percent) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/similar_text/
	// original by: Rafał Kukawski (https://blog.kukawski.pl)
	// bugfixed by: Chris McMacken
	// bugfixed by: Jarkko Rantavuori original by findings in stackoverflow (https://stackoverflow.com/questions/14136349/how-does-similar-text-work)
	// improved by: Markus Padourek (taken from https://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
	//   example 1: similar_text('Hello World!', 'Hello locutus!')
	//   returns 1: 8
	//   example 2: similar_text('Hello World!', null)
	//   returns 2: 0
	if (first === null || second === null || typeof first === 'undefined' || typeof second ===
		'undefined') {
		return 0
	}
	first += ''
	second += ''
	let pos1 = 0
	let pos2 = 0
	let max = 0
	const firstLength = first.length
	const secondLength = second.length
	let p
	let q
	let l
	let sum
	for (p = 0; p < firstLength; p++) {
		for (q = 0; q < secondLength; q++) {
			for (l = 0;
				(p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) ===
					second.charAt(q + l)); l++) { // eslint-disable-line max-len
				// @todo: ^-- break up this crazy for loop and put the logic in its body
			}
			if (l > max) {
				max = l
				pos1 = p
				pos2 = q
			}
		}
	}
	sum = max
	if (sum) {
		if (pos1 && pos2) {
			sum += similar_text(first.substr(0, pos1), second.substr(0, pos2))
		}
		if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
			sum += similar_text(first.substr(pos1 + max, firstLength - pos1 - max), second
				.substr(pos2 + max, secondLength - pos2 - max))
		}
	}
	if (!percent) {
		return sum
	}
	return (sum * 200) / (firstLength + secondLength)
}
phpjed.soundex = function(str) {
	//  discuss at: https://locutus.io/php/soundex/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// original by: Arnout Kazemier (https://www.3rd-Eden.com)
	// improved by: Jack
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Rafał Kukawski (https://blog.kukawski.pl)
	//   example 1: soundex('Kevin')
	//   returns 1: 'K150'
	//   example 2: soundex('Ellery')
	//   returns 2: 'E460'
	//   example 3: soundex('Euler')
	//   returns 3: 'E460'
	str = (str + '').toUpperCase()
	if (!str) {
		return ''
	}
	const sdx = [0, 0, 0, 0]
	const m = {
		B: 1,
		F: 1,
		P: 1,
		V: 1,
		C: 2,
		G: 2,
		J: 2,
		K: 2,
		Q: 2,
		S: 2,
		X: 2,
		Z: 2,
		D: 3,
		T: 3,
		L: 4,
		M: 5,
		N: 5,
		R: 6
	}
	let i = 0
	let j
	let s = 0
	let c
	let p
	while ((c = str.charAt(i++)) && s < 4) {
		if ((j = m[c])) {
			if (j !== p) {
				sdx[s++] = p = j
			}
		} else {
			s += i === 1
			p = 0
		}
	}
	sdx[0] = str.charAt(0)
	return sdx.join('')
}
phpjed.sprintf = function() {
	//  discuss at: https://locutus.io/php/sprintf/
	// original by: Ash Searle (https://hexmen.com/blog/)
	// improved by: Michael White (https://getsprink.com)
	// improved by: Jack
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Dj
	// improved by: Allidylls
	//    input by: Paulo Freitas
	//    input by: Brett Zamir (https://brett-zamir.me)
	// improved by: Rafał Kukawski (https://kukawski.pl)
	//   example 1: sprintf("%01.2f", 123.1)
	//   returns 1: '123.10'
	//   example 2: sprintf("[%10s]", 'monkey')
	//   returns 2: '[    monkey]'
	//   example 3: sprintf("[%'#10s]", 'monkey')
	//   returns 3: '[####monkey]'
	//   example 4: sprintf("%d", 123456789012345)
	//   returns 4: '123456789012345'
	//   example 5: sprintf('%-03s', 'E')
	//   returns 5: 'E00'
	//   example 6: sprintf('%+010d', 9)
	//   returns 6: '+000000009'
	//   example 7: sprintf('%+0\'@10d', 9)
	//   returns 7: '@@@@@@@@+9'
	//   example 8: sprintf('%.f', 3.14)
	//   returns 8: '3.140000'
	//   example 9: sprintf('%% %2$d', 1, 2)
	//   returns 9: '% 2'
	const regex = /%%|%(?:(\d+)\$)?((?:[-+#0 ]|'[\s\S])*)(\d+)?(?:\.(\d*))?([\s\S])/g
	const args = arguments
	let i = 0
	const format = args[i++]
	const _pad = function(str, len, chr, leftJustify) {
		if (!chr) {
			chr = ' '
		}
		const padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
			.join(chr)
		return leftJustify ? str + padding : padding + str
	}
	const justify = function(value, prefix, leftJustify, minWidth, padChar) {
		const diff = minWidth - value.length
		if (diff > 0) {
			// when padding with zeros
			// on the left side
			// keep sign (+ or -) in front
			if (!leftJustify && padChar === '0') {
				value = [
					value.slice(0, prefix.length),
					_pad('', diff, '0', true),
					value.slice(prefix.length)
				].join('')
			} else {
				value = _pad(value, minWidth, padChar, leftJustify)
			}
		}
		return value
	}
	const _formatBaseX = function(value, base, leftJustify, minWidth, precision, padChar) {
		// Note: casts negative numbers to positive ones
		const number = value >>> 0
		value = _pad(number.toString(base), precision || 0, '0', false)
		return justify(value, '', leftJustify, minWidth, padChar)
	}
	// _formatString()
	const _formatString = function(value, leftJustify, minWidth, precision, customPadChar) {
		if (precision !== null && precision !== undefined) {
			value = value.slice(0, precision)
		}
		return justify(value, '', leftJustify, minWidth, customPadChar)
	}
	// doFormat()
	const doFormat = function(substring, argIndex, modifiers, minWidth, precision, specifier) {
		let number, prefix, method, textTransform, value
		if (substring === '%%') {
			return '%'
		}
		// parse modifiers
		let padChar = ' ' // pad with spaces by default
		let leftJustify = false
		let positiveNumberPrefix = ''
		let j, l
		for (j = 0, l = modifiers.length; j < l; j++) {
			switch (modifiers.charAt(j)) {
				case ' ':
				case '0':
					padChar = modifiers.charAt(j)
					break
				case '+':
					positiveNumberPrefix = '+'
					break
				case '-':
					leftJustify = true
					break
				case "'":
					if (j + 1 < l) {
						padChar = modifiers.charAt(j + 1)
						j++
					}
					break
			}
		}
		if (!minWidth) {
			minWidth = 0
		} else {
			minWidth = +minWidth
		}
		if (!isFinite(minWidth)) {
			throw new Error('Width must be finite')
		}
		if (!precision) {
			precision = (specifier === 'd') ? 0 : 'fFeE'.indexOf(specifier) > -1 ? 6 :
				undefined
		} else {
			precision = +precision
		}
		if (argIndex && +argIndex === 0) {
			throw new Error('Argument number must be greater than zero')
		}
		if (argIndex && +argIndex >= args.length) {
			throw new Error('Too few arguments')
		}
		value = argIndex ? args[+argIndex] : args[i++]
		switch (specifier) {
			case '%':
				return '%'
			case 's':
				return _formatString(value + '', leftJustify, minWidth, precision, padChar)
			case 'c':
				return _formatString(String.fromCharCode(+value), leftJustify, minWidth,
					precision, padChar)
			case 'b':
				return _formatBaseX(value, 2, leftJustify, minWidth, precision, padChar)
			case 'o':
				return _formatBaseX(value, 8, leftJustify, minWidth, precision, padChar)
			case 'x':
				return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
			case 'X':
				return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
					.toUpperCase()
			case 'u':
				return _formatBaseX(value, 10, leftJustify, minWidth, precision, padChar)
			case 'i':
			case 'd':
				number = +value || 0
				// Plain Math.round doesn't just truncate
				number = Math.round(number - number % 1)
				prefix = number < 0 ? '-' : positiveNumberPrefix
				value = prefix + _pad(String(Math.abs(number)), precision, '0', false)
				if (leftJustify && padChar === '0') {
					// can't right-pad 0s on integers
					padChar = ' '
				}
				return justify(value, prefix, leftJustify, minWidth, padChar)
			case 'e':
			case 'E':
			case 'f': // @todo: Should handle locales (as per setlocale)
			case 'F':
			case 'g':
			case 'G':
				number = +value
				prefix = number < 0 ? '-' : positiveNumberPrefix
				method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(specifier
					.toLowerCase())]
				textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(specifier) % 2]
				value = prefix + Math.abs(number)[method](precision)
				return justify(value, prefix, leftJustify, minWidth, padChar)[textTransform]
					()
			default:
				// unknown specifier, consume that char and return empty
				return ''
		}
	}
	try {
		return format.replace(regex, doFormat)
	} catch (err) {
		return false
	}
}
phpjed.sscanf = function(str, format) {
	//  discuss at: https://locutus.io/php/sscanf/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: sscanf('SN/2350001', 'SN/%d')
	//   returns 1: [2350001]
	//   example 2: var myVar = {}
	//   example 2: sscanf('SN/2350001', 'SN/%d', myVar)
	//   example 2: var $result = myVar.value
	//   returns 2: 2350001
	//   example 3: sscanf("10--20", "%2$d--%1$d") // Must escape '$' in PHP, but not JS
	//   returns 3: [20, 10]
	const retArr = []
	const _NWS = /\S/
	const args = arguments
	let digit
	const _setExtraConversionSpecs = function(offset) {
		// Since a mismatched character sets us off track from future
		// legitimate finds, we just scan
		// to the end for any other conversion specifications (besides a percent literal),
		// setting them to null
		// sscanf seems to disallow all conversion specification components (of sprintf)
		// except for type specifiers
		// Do not allow % in last char. class
		// var matches = format.match(/%[+-]?([ 0]|'.)?-?\d*(\.\d+)?[bcdeufFosxX]/g);
		// Do not allow % in last char. class:
		const matches = format.slice(offset).match(/%[cdeEufgosxX]/g)
		// b, F,G give errors in PHP, but 'g', though also disallowed, doesn't
		if (matches) {
			let lgth = matches.length
			while (lgth--) {
				retArr.push(null)
			}
		}
		return _finish()
	}
	var _finish = function() {
		if (args.length === 2) {
			return retArr
		}
		for (var i = 0; i < retArr.length; ++i) {
			args[i + 2].value = retArr[i]
		}
		return i
	}
	const _addNext = function(j, regex, cb) {
		if (assign) {
			const remaining = str.slice(j)
			const check = width ? remaining.substr(0, width) : remaining
			const match = regex.exec(check)
			// @todo: Make this more readable
			const key = digit !== undefined ? digit : retArr.length
			const testNull = retArr[key] = match ? (cb ? cb.apply(null, match) : match[0]) :
				null
			if (testNull === null) {
				throw new Error('No match in string')
			}
			return j + match[0].length
		}
		return j
	}
	if (arguments.length < 2) {
		throw new Error('Not enough arguments passed to sscanf')
	}
	// PROCESS
	for (let i = 0, j = 0; i < format.length; i++) {
		var width = 0
		var assign = true
		if (format.charAt(i) === '%') {
			if (format.charAt(i + 1) === '%') {
				if (str.charAt(j) === '%') {
					// a matched percent literal
					// skip beyond duplicated percent
					++i
					++j
					continue
				}
				// Format indicated a percent literal, but not actually present
				return _setExtraConversionSpecs(i + 2)
			}
			// CHARACTER FOLLOWING PERCENT IS NOT A PERCENT
			// We need 'g' set to get lastIndex
			const prePattern = /^(?:(\d+)\$)?(\*)?(\d*)([hlL]?)/g
			const preConvs = prePattern.exec(format.slice(i + 1))
			const tmpDigit = digit
			if (tmpDigit && preConvs[1] === undefined) {
				let msg = 'All groups in sscanf() must be expressed as numeric if '
				msg += 'any have already been used'
				throw new Error(msg)
			}
			digit = preConvs[1] ? parseInt(preConvs[1], 10) - 1 : undefined
			assign = !preConvs[2]
			width = parseInt(preConvs[3], 10)
			const sizeCode = preConvs[4]
			i += prePattern.lastIndex
			// @todo: Does PHP do anything with these? Seems not to matter
			if (sizeCode) {
				// This would need to be processed later
				switch (sizeCode) {
					case 'h':
					case 'l':
					case 'L':
						// Treats subsequent as short int (for d,i,n) or unsigned short int (for o,u,x)
						// Treats subsequent as long int (for d,i,n), or unsigned long int (for o,u,x);
						//    or as double (for e,f,g) instead of float or wchar_t instead of char
						// Treats subsequent as long double (for e,f,g)
						break
					default:
						throw new Error('Unexpected size specifier in sscanf()!')
				}
			}
			// PROCESS CHARACTER
			try {
				// For detailed explanations, see https://web.archive.org/web/20031128125047/https://www.uwm.edu/cgi-bin/IMT/wwwman?topic=scanf%283%29&msection=
				// Also https://www.mathworks.com/access/helpdesk/help/techdoc/ref/sscanf.html
				// p, S, C arguments in C function not available
				// DOCUMENTED UNDER SSCANF
				switch (format.charAt(i + 1)) {
					case 'F':
						// Not supported in PHP sscanf; the argument is treated as a float, and
						//  presented as a floating-point number (non-locale aware)
						// sscanf doesn't support locales, so no need for two (see %f)
						break
					case 'g':
						// Not supported in PHP sscanf; shorter of %e and %f
						// Irrelevant to input conversion
						break
					case 'G':
						// Not supported in PHP sscanf; shorter of %E and %f
						// Irrelevant to input conversion
						break
					case 'b':
						// Not supported in PHP sscanf; the argument is treated as an integer,
						// and presented as a binary number
						// Not supported - couldn't distinguish from other integers
						break
					case 'i':
						// Integer with base detection (Equivalent of 'd', but base 0 instead of 10)
						var pattern = /([+-])?(?:(?:0x([\da-fA-F]+))|(?:0([0-7]+))|(\d+))/
						j = _addNext(j, pattern, function(num, sign, hex, oct, dec) {
							return hex ? parseInt(num, 16) : oct ? parseInt(num, 8) :
								parseInt(num, 10)
						})
						break
					case 'n':
						// Number of characters processed so far
						retArr[digit !== undefined ? digit : retArr.length - 1] = j
						break
						// DOCUMENTED UNDER SPRINTF
					case 'c':
						// Get character; suppresses skipping over whitespace!
						// (but shouldn't be whitespace in format anyways, so no difference here)
						// Non-greedy match
						j = _addNext(j, new RegExp('.{1,' + (width || 1) + '}'))
						break
					case 'D':
					case 'd':
						// sscanf documented decimal number; equivalent of 'd';
						// Optionally signed decimal integer
						j = _addNext(j, /([+-])?(?:0*)(\d+)/, function(num, sign, dec) {
							// Ignores initial zeroes, unlike %i and parseInt()
							const decInt = parseInt((sign || '') + dec, 10)
							if (decInt < 0) {
								// PHP also won't allow less than -2147483648
								// integer overflow with negative
								return decInt < -2147483648 ? -2147483648 : decInt
							} else {
								// PHP also won't allow greater than -2147483647
								return decInt < 2147483647 ? decInt : 2147483647
							}
						})
						break
					case 'f':
					case 'E':
					case 'e':
						// Although sscanf doesn't support locales,
						// this is used instead of '%F'; seems to be same as %e
						// These don't discriminate here as both allow exponential float of either case
						j = _addNext(j, /([+-])?(?:0*)(\d*\.?\d*(?:[eE]?\d+)?)/, function(num,
							sign, dec) {
							if (dec === '.') {
								return null
							}
							// Ignores initial zeroes, unlike %i and parseFloat()
							return parseFloat((sign || '') + dec)
						})
						break
					case 'u':
						// unsigned decimal integer
						// We won't deal with integer overflows due to signs
						j = _addNext(j, /([+-])?(?:0*)(\d+)/, function(num, sign, dec) {
							// Ignores initial zeroes, unlike %i and parseInt()
							const decInt = parseInt(dec, 10)
							if (sign === '-') {
								// PHP also won't allow greater than 4294967295
								// integer overflow with negative
								return 4294967296 - decInt
							} else {
								return decInt < 4294967295 ? decInt : 4294967295
							}
						})
						break
					case 'o':
						// Octal integer // @todo: add overflows as above?
						j = _addNext(j, /([+-])?(?:0([0-7]+))/, function(num, sign, oct) {
							return parseInt(num, 8)
						})
						break
					case 's':
						// Greedy match
						j = _addNext(j, /\S+/)
						break
					case 'X':
					case 'x':
						// Same as 'x'?
						// @todo: add overflows as above?
						// Initial 0x not necessary here
						j = _addNext(j, /([+-])?(?:(?:0x)?([\da-fA-F]+))/, function(num, sign,
							hex) {
							return parseInt(num, 16)
						})
						break
					case '':
						// If no character left in expression
						throw new Error(
							'Missing character after percent mark in sscanf() format argument'
							)
					default:
						throw new Error(
							'Unrecognized character after percent mark in sscanf() format argument'
							)
				}
			} catch (e) {
				if (e === 'No match in string') {
					// Allow us to exit
					return _setExtraConversionSpecs(i + 2)
				}
				// Calculate skipping beyond initial percent too
			}
			++i
		} else if (format.charAt(i) !== str.charAt(j)) {
			// @todo: Double-check i whitespace ignored in string and/or formats
			_NWS.lastIndex = 0
			if ((_NWS).test(str.charAt(j)) || str.charAt(j) === '') {
				// Whitespace doesn't need to be an exact match)
				return _setExtraConversionSpecs(i + 1)
			} else {
				// Adjust strings when encounter non-matching whitespace,
				// so they align in future checks above
				// Ok to replace with j++;?
				str = str.slice(0, j) + str.slice(j + 1)
				i--
			}
		} else {
			j++
		}
	}
	// POST-PROCESSING
	return _finish()
}
phpjed.str_getcsv = function(input, delimiter, enclosure, escape) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_getcsv/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: str_getcsv('"abc","def","ghi"')
	//   returns 1: ['abc', 'def', 'ghi']
	//   example 2: str_getcsv('"row2""cell1","row2cell2","row2cell3"', null, null, '"')
	//   returns 2: ['row2"cell1', 'row2cell2', 'row2cell3']
	/*
	// These test cases allowing for missing delimiters are not currently supported
	  str_getcsv('"row2""cell1",row2cell2,row2cell3', null, null, '"');
	  ['row2"cell1', 'row2cell2', 'row2cell3']

	  str_getcsv('row1cell1,"row1,cell2",row1cell3', null, null, '"');
	  ['row1cell1', 'row1,cell2', 'row1cell3']

	  str_getcsv('"row2""cell1",row2cell2,"row2""""cell3"');
	  ['row2"cell1', 'row2cell2', 'row2""cell3']

	  str_getcsv('row1cell1,"row1,cell2","row1"",""cell3"', null, null, '"');
	  ['row1cell1', 'row1,cell2', 'row1","cell3'];

	  Should also test newlines within
	*/
	let i
	let inpLen
	const output = []
	const _backwards = function(str) {
		// We need to go backwards to simulate negative look-behind (don't split on
		// an escaped enclosure even if followed by the delimiter and another enclosure mark)
		return str.split('').reverse().join('')
	}
	const _pq = function(str) {
		// preg_quote()
		return String(str).replace(/([\\.+*?[^\]$(){}=!<>|:])/g, '\\$1')
	}
	delimiter = delimiter || ','
	enclosure = enclosure || '"'
	escape = escape || '\\'
	const pqEnc = _pq(enclosure)
	const pqEsc = _pq(escape)
	input = input.replace(new RegExp('^\\s*' + pqEnc), '').replace(new RegExp(pqEnc + '\\s*$'),
		'')
	// PHP behavior may differ by including whitespace even outside of the enclosure
	input = _backwards(input).split(new RegExp(pqEnc + '\\s*' + _pq(delimiter) + '\\s*' +
		pqEnc + '(?!' + pqEsc + ')', 'g')).reverse()
	for (i = 0, inpLen = input.length; i < inpLen; i++) {
		output.push(_backwards(input[i]).replace(new RegExp(pqEsc + pqEnc, 'g'), enclosure))
	}
	return output
}
phpjed.str_ireplace = function(search, replace, subject,
countObj) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_ireplace/
	// original by: Glen Arason (https://CanadianDomainRegistry.ca)
	// bugfixed by: Mahmoud Saeed
	//      note 1: Case-insensitive version of str_replace()
	//      note 1: Compliant with PHP 5.0 str_ireplace() Full details at:
	//      note 1: https://ca3.php.net/manual/en/function.str-ireplace.php
	//      note 2: The countObj parameter (optional) if used must be passed in as a
	//      note 2: object. The count will then be written by reference into it's `value` property
	//   example 1: str_ireplace('M', 'e', 'name')
	//   returns 1: 'naee'
	//   example 2: var $countObj = {}
	//   example 2: str_ireplace('M', 'e', 'name', $countObj)
	//   example 2: var $result = $countObj.value
	//   returns 2: 1
	//   example 3: str_ireplace('', '.', 'aaa')
	//   returns 3: 'aaa'
	let i = 0
	let j = 0
	let temp = ''
	let repl = ''
	let sl = 0
	let fl = 0
	let f = ''
	let r = ''
	let s = ''
	let ra = ''
	let otemp = ''
	let oi = ''
	let ofjl = ''
	let os = subject
	const osa = Object.prototype.toString.call(os) === '[object Array]'
	// var sa = ''
	if (typeof(search) === 'object') {
		temp = search
		search = []
		for (i = 0; i < temp.length; i += 1) {
			search[i] = temp[i].toLowerCase()
		}
	} else {
		search = search.toLowerCase()
	}
	if (typeof(subject) === 'object') {
		temp = subject
		subject = []
		for (i = 0; i < temp.length; i += 1) {
			subject[i] = temp[i].toLowerCase()
		}
	} else {
		subject = subject.toLowerCase()
	}
	if (typeof(search) === 'object' && typeof(replace) === 'string') {
		temp = replace
		replace = []
		for (i = 0; i < search.length; i += 1) {
			replace[i] = temp
		}
	}
	temp = ''
	f = [].concat(search)
	r = [].concat(replace)
	ra = Object.prototype.toString.call(r) === '[object Array]'
	s = subject
	// sa = Object.prototype.toString.call(s) === '[object Array]'
	s = [].concat(s)
	os = [].concat(os)
	if (countObj) {
		countObj.value = 0
	}
	for (i = 0, sl = s.length; i < sl; i++) {
		if (s[i] === '') {
			continue
		}
		for (j = 0, fl = f.length; j < fl; j++) {
			if (f[j] === '') {
				continue
			}
			temp = s[i] + ''
			repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0]
			s[i] = (temp).split(f[j]).join(repl)
			otemp = os[i] + ''
			oi = temp.indexOf(f[j])
			ofjl = f[j].length
			if (oi >= 0) {
				os[i] = (otemp).split(otemp.substr(oi, ofjl)).join(repl)
			}
			if (countObj) {
				countObj.value += ((temp.split(f[j])).length - 1)
			}
		}
	}
	return osa ? os : os[0]
}
phpjed.str_pad = function(input, padLength, padString, padType) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_pad/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Michael White (https://getsprink.com)
	//    input by: Marco van Oort
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT')
	//   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
	//   example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH')
	//   returns 2: '------Kevin van Zonneveld-----'
	let half = ''
	let padToGo
	const _strPadRepeater = function(s, len) {
		let collect = ''
		while (collect.length < len) {
			collect += s
		}
		collect = collect.substr(0, len)
		return collect
	}
	input += ''
	padString = padString !== undefined ? padString : ' '
	if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !==
		'STR_PAD_BOTH') {
		padType = 'STR_PAD_RIGHT'
	}
	if ((padToGo = padLength - input.length) > 0) {
		if (padType === 'STR_PAD_LEFT') {
			input = _strPadRepeater(padString, padToGo) + input
		} else if (padType === 'STR_PAD_RIGHT') {
			input = input + _strPadRepeater(padString, padToGo)
		} else if (padType === 'STR_PAD_BOTH') {
			half = _strPadRepeater(padString, Math.ceil(padToGo / 2))
			input = half + input + half
			input = input.substr(0, padLength)
		}
	}
	return input
}
phpjed.str_repeat = function(input, multiplier) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_repeat/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// improved by: Ian Carter (https://euona.com/)
	//   example 1: str_repeat('-=', 10)
	//   returns 1: '-=-=-=-=-=-=-=-=-=-='
	let y = ''
	while (true) {
		if (multiplier & 1) {
			y += input
		}
		multiplier >>= 1
		if (multiplier) {
			input += input
		} else {
			break
		}
	}
	return y
}
phpjed.str_replace = function(search, replace, subject, countObj) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_replace/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Gabriel Paderni
	// improved by: Philip Peterson
	// improved by: Simon Willison (https://simonwillison.net)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// bugfixed by: Anton Ongson
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Oleg Eremeev
	// bugfixed by: Glen Arason (https://CanadianDomainRegistry.ca)
	// bugfixed by: Glen Arason (https://CanadianDomainRegistry.ca)
	// bugfixed by: Mahmoud Saeed
	//    input by: Onno Marsman (https://twitter.com/onnomarsman)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//    input by: Oleg Eremeev
	//      note 1: The countObj parameter (optional) if used must be passed in as a
	//      note 1: object. The count will then be written by reference into it's `value` property
	//   example 1: str_replace(' ', '.', 'Kevin van Zonneveld')
	//   returns 1: 'Kevin.van.Zonneveld'
	//   example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars')
	//   returns 2: 'hemmo, mars'
	//   example 3: str_replace(Array('S','F'),'x','ASDFASDF')
	//   returns 3: 'AxDxAxDx'
	//   example 4: var countObj = {}
	//   example 4: str_replace(['A','D'], ['x','y'] , 'ASDFASDF' , countObj)
	//   example 4: var $result = countObj.value
	//   returns 4: 4
	//   example 5: str_replace('', '.', 'aaa')
	//   returns 5: 'aaa'
	let i = 0
	let j = 0
	let temp = ''
	let repl = ''
	let sl = 0
	let fl = 0
	const f = [].concat(search)
	let r = [].concat(replace)
	let s = subject
	let ra = Object.prototype.toString.call(r) === '[object Array]'
	const sa = Object.prototype.toString.call(s) === '[object Array]'
	s = [].concat(s)
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	if (typeof(search) === 'object' && typeof(replace) === 'string') {
		temp = replace
		replace = []
		for (i = 0; i < search.length; i += 1) {
			replace[i] = temp
		}
		temp = ''
		r = [].concat(replace)
		ra = Object.prototype.toString.call(r) === '[object Array]'
	}
	if (typeof countObj !== 'undefined') {
		countObj.value = 0
	}
	for (i = 0, sl = s.length; i < sl; i++) {
		if (s[i] === '') {
			continue
		}
		for (j = 0, fl = f.length; j < fl; j++) {
			if (f[j] === '') {
				continue
			}
			temp = s[i] + ''
			repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0]
			s[i] = (temp).split(f[j]).join(repl)
			if (typeof countObj !== 'undefined') {
				countObj.value += ((temp.split(f[j])).length - 1)
			}
		}
	}
	return sa ? s : s[0]
}
phpjed.str_rot13 = function(str) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_rot13/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// improved by: Ates Goral (https://magnetiq.com)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: str_rot13('Kevin van Zonneveld')
	//   returns 1: 'Xriva ina Mbaariryq'
	//   example 2: str_rot13('Xriva ina Mbaariryq')
	//   returns 2: 'Kevin van Zonneveld'
	//   example 3: str_rot13(33)
	//   returns 3: '33'
	return (str + '').replace(/[a-z]/gi, function(s) {
		return String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13))
	})
}
phpjed.str_shuffle = function(str) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_shuffle/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $shuffled = str_shuffle("abcdef")
	//   example 1: var $result = $shuffled.length
	//   returns 1: 6
	if (arguments.length === 0) {
		throw new Error('Wrong parameter count for str_shuffle()')
	}
	if (str === null) {
		return ''
	}
	str += ''
	let newStr = ''
	let rand
	let i = str.length
	while (i) {
		rand = Math.floor(Math.random() * i)
		newStr += str.charAt(rand)
		str = str.substring(0, rand) + str.substr(rand + 1)
		i--
	}
	return newStr
}
phpjed.str_split = function(string, splitLength) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_split/
	// original by: Martijn Wieringa
	// improved by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//  revised by: Theriault (https://github.com/Theriault)
	//  revised by: Rafał Kukawski (https://blog.kukawski.pl)
	//    input by: Bjorn Roesbeke (https://www.bjornroesbeke.be/)
	//   example 1: str_split('Hello Friend', 3)
	//   returns 1: ['Hel', 'lo ', 'Fri', 'end']
	if (splitLength === null) {
		splitLength = 1
	}
	if (string === null || splitLength < 1) {
		return false
	}
	string += ''
	const chunks = []
	let pos = 0
	const len = string.length
	while (pos < len) {
		chunks.push(string.slice(pos, pos += splitLength))
	}
	return chunks
}
phpjed.str_word_count = function(str, format, charlist) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/str_word_count/
	// original by: Ole Vrijenhoek
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//    input by: Bug?
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: str_word_count("Hello fri3nd, you're\r\n       looking          good today!", 1)
	//   returns 1: ['Hello', 'fri', 'nd', "you're", 'looking', 'good', 'today']
	//   example 2: str_word_count("Hello fri3nd, you're\r\n       looking          good today!", 2)
	//   returns 2: {0: 'Hello', 6: 'fri', 10: 'nd', 14: "you're", 29: 'looking', 46: 'good', 51: 'today'}
	//   example 3: str_word_count("Hello fri3nd, you're\r\n       looking          good today!", 1, '\u00e0\u00e1\u00e3\u00e73')
	//   returns 3: ['Hello', 'fri3nd', "you're", 'looking', 'good', 'today']
	//   example 4: str_word_count('hey', 2)
	//   returns 4: {0: 'hey'}
	const ctypeAlpha = phpjed.ctype_alpha
	const len = str.length
	const cl = charlist && charlist.length
	let chr = ''
	let tmpStr = ''
	let i = 0
	let c = ''
	const wArr = []
	let wC = 0
	const assoc = {}
	let aC = 0
	let reg = ''
	let match = false
	const _pregQuote = function(str) {
		return (str + '').replace(/([\\.+*?[^\]$(){}=!<>|:])/g, '\\$1')
	}
	const _getWholeChar = function(str, i) {
		// Use for rare cases of non-BMP characters
		const code = str.charCodeAt(i)
		if (code < 0xD800 || code > 0xDFFF) {
			return str.charAt(i)
		}
		if (code >= 0xD800 && code <= 0xDBFF) {
			// High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single
			// characters)
			if (str.length <= (i + 1)) {
				throw new Error('High surrogate without following low surrogate')
			}
			const next = str.charCodeAt(i + 1)
			if (next < 0xDC00 || next > 0xDFFF) {
				throw new Error('High surrogate without following low surrogate')
			}
			return str.charAt(i) + str.charAt(i + 1)
		}
		// Low surrogate (0xDC00 <= code && code <= 0xDFFF)
		if (i === 0) {
			throw new Error('Low surrogate without preceding high surrogate')
		}
		const prev = str.charCodeAt(i - 1)
		if (prev < 0xD800 || prev > 0xDBFF) {
			// (could change last hex to 0xDB7F to treat high private surrogates as single characters)
			throw new Error('Low surrogate without preceding high surrogate')
		}
		// We can pass over low surrogates now as the second component in a pair which we have already
		// processed
		return false
	}
	if (cl) {
		reg = '^(' + _pregQuote(_getWholeChar(charlist, 0))
		for (i = 1; i < cl; i++) {
			if ((chr = _getWholeChar(charlist, i)) === false) {
				continue
			}
			reg += '|' + _pregQuote(chr)
		}
		reg += ')$'
		reg = new RegExp(reg)
	}
	for (i = 0; i < len; i++) {
		if ((c = _getWholeChar(str, i)) === false) {
			continue
		}
		// No hyphen at beginning or end unless allowed in charlist (or locale)
		// No apostrophe at beginning unless allowed in charlist (or locale)
		// @todo: Make this more readable
		match = ctypeAlpha(c) || (reg && c.search(reg) !== -1) || ((i !== 0 && i !== len - 1) &&
			c === '-') || (i !== 0 && c === "'")
		if (match) {
			if (tmpStr === '' && format === 2) {
				aC = i
			}
			tmpStr = tmpStr + c
		}
		if (i === len - 1 || !match && tmpStr !== '') {
			if (format !== 2) {
				wArr[wArr.length] = tmpStr
			} else {
				assoc[aC] = tmpStr
			}
			tmpStr = ''
			wC++
		}
	}
	if (!format) {
		return wC
	} else if (format === 1) {
		return wArr
	} else if (format === 2) {
		return assoc
	}
	throw new Error('You have supplied an incorrect format')
}
phpjed.strcasecmp = function(fString1, fString2) {
	//  discuss at: https://locutus.io/php/strcasecmp/
	// original by: Martijn Wieringa
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: strcasecmp('Hello', 'hello')
	//   returns 1: 0
	const string1 = (fString1 + '').toLowerCase()
	const string2 = (fString2 + '').toLowerCase()
	if (string1 > string2) {
		return 1
	} else if (string1 === string2) {
		return 0
	}
	return -1
}
phpjed.strchr = function(haystack, needle, bool) {
	//  discuss at: https://locutus.io/php/strchr/
	// original by: Philip Peterson
	//   example 1: strchr('Kevin van Zonneveld', 'van')
	//   returns 1: 'van Zonneveld'
	//   example 2: strchr('Kevin van Zonneveld', 'van', true)
	//   returns 2: 'Kevin '
	const strstr = phpjed.strstr
	return strstr(haystack, needle, bool)
}
phpjed.strcmp = function(str1, str2) {
	//  discuss at: https://locutus.io/php/strcmp/
	// original by: Waldo Malqui Silva (https://waldo.malqui.info)
	//    input by: Steve Hilder
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//  revised by: gorthaur
	//   example 1: strcmp( 'waldo', 'owald' )
	//   returns 1: 1
	//   example 2: strcmp( 'owald', 'waldo' )
	//   returns 2: -1
	return ((str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1))
}
phpjed.strcoll = function(str1, str2) {
	//  discuss at: https://locutus.io/php/strcoll/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: strcoll('a', 'b')
	//   returns 1: -1
	const setlocale = phpjed.setlocale
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	setlocale('LC_ALL', 0) // ensure setup of localization variables takes place
	const cmp = $locutus.php.locales[$locutus.php.localeCategories.LC_COLLATE].LC_COLLATE
	return cmp(str1, str2)
}
phpjed.strcspn = function(str, mask, start, length) {
	//  discuss at: https://locutus.io/php/strcspn/
	// original by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Theriault
	//   example 1: strcspn('abcdefg123', '1234567890')
	//   returns 1: 7
	//   example 2: strcspn('123abc', '1234567890')
	//   returns 2: 0
	//   example 3: strcspn('abcdefg123', '1234567890', 1)
	//   returns 3: 6
	//   example 4: strcspn('abcdefg123', '1234567890', -6, -5)
	//   returns 4: 1
	start = start || 0
	length = typeof length === 'undefined' ? str.length : (length || 0)
	if (start < 0) start = str.length + start
	if (length < 0) length = str.length - start + length
	if (start < 0 || start >= str.length || length <= 0 || e >= str.length) return 0
	var e = Math.min(str.length, start + length)
	for (var i = start, lgth = 0; i < e; i++) {
		if (mask.indexOf(str.charAt(i)) !== -1) {
			break
		}
		++lgth
	}
	return lgth
}
phpjed.strip_tags = function(input, allowed) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/strip_tags/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Luke Godfrey
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Pul
	//    input by: Alex
	//    input by: Marc Palau
	//    input by: Brett Zamir (https://brett-zamir.me)
	//    input by: Bobby Drake
	//    input by: Evertjan Garretsen
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Eric Nagel
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Tomasz Wesolowski
	// bugfixed by: Tymon Sturgeon (https://scryptonite.com)
	// bugfixed by: Tim de Koning (https://www.kingsquare.nl)
	//  revised by: Rafał Kukawski (https://blog.kukawski.pl)
	//   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
	//   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
	//   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
	//   returns 2: '<p>Kevin van Zonneveld</p>'
	//   example 3: strip_tags("<a href='https://kvz.io'>Kevin van Zonneveld</a>", "<a>")
	//   returns 3: "<a href='https://kvz.io'>Kevin van Zonneveld</a>"
	//   example 4: strip_tags('1 < 5 5 > 1')
	//   returns 4: '1 < 5 5 > 1'
	//   example 5: strip_tags('1 <br/> 1')
	//   returns 5: '1  1'
	//   example 6: strip_tags('1 <br/> 1', '<br>')
	//   returns 6: '1 <br/> 1'
	//   example 7: strip_tags('1 <br/> 1', '<br><br/>')
	//   returns 7: '1 <br/> 1'
	//   example 8: strip_tags('<i>hello</i> <<foo>script>world<</foo>/script>')
	//   returns 8: 'hello world'
	//   example 9: strip_tags(4)
	//   returns 9: '4'
	const _phpCastString = phpjed._phpCastString
	// making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
	const tags = /<\/?([a-z0-9]*)\b[^>]*>?/gi
	const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
	let after = _phpCastString(input)
	// removes tha '<' char at the end of the string to replicate PHP's behaviour
	after = (after.substring(after.length - 1) === '<') ? after.substring(0, after.length - 1) :
		after
	// recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
	while (true) {
		const before = after
		after = before.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
		})
		// return once no more tags are removed
		if (before === after) {
			return after
		}
	}
}
phpjed.stripos = function(fHaystack, fNeedle, fOffset) {
	//  discuss at: https://locutus.io/php/stripos/
	// original by: Martijn Wieringa
	//  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: stripos('ABC', 'a')
	//   returns 1: 0
	const haystack = (fHaystack + '').toLowerCase()
	const needle = (fNeedle + '').toLowerCase()
	let index = 0
	if ((index = haystack.indexOf(needle, fOffset)) !== -1) {
		return index
	}
	return false
}
phpjed.stripslashes = function(str) {
	//       discuss at: https://locutus.io/php/stripslashes/
	//      original by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Ates Goral (https://magnetiq.com)
	//      improved by: marrtins
	//      improved by: rezna
	//         fixed by: Mick@el
	//      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//         input by: Rick Waldron
	//         input by: Brant Messenger (https://www.brantmessenger.com/)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//        example 1: stripslashes('Kevin\'s code')
	//        returns 1: "Kevin's code"
	//        example 2: stripslashes('Kevin\\\'s code')
	//        returns 2: "Kevin\'s code"
	return (str + '').replace(/\\(.?)/g, function(s, n1) {
		switch (n1) {
			case '\\':
				return '\\'
			case '0':
				return '\u0000'
			case '':
				return ''
			default:
				return n1
		}
	})
}
phpjed.stristr = function(haystack, needle, bool) {
	//  discuss at: https://locutus.io/php/stristr/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: stristr('Kevin van Zonneveld', 'Van')
	//   returns 1: 'van Zonneveld'
	//   example 2: stristr('Kevin van Zonneveld', 'VAN', true)
	//   returns 2: 'Kevin '
	let pos = 0
	haystack += ''
	pos = haystack.toLowerCase().indexOf((needle + '').toLowerCase())
	if (pos === -1) {
		return false
	} else {
		if (bool) {
			return haystack.substr(0, pos)
		} else {
			return haystack.slice(pos)
		}
	}
}
phpjed.strlen = function(string) {
	//  discuss at: https://locutus.io/php/strlen/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Sakimori
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Kirk Strobeck
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//  revised by: Brett Zamir (https://brett-zamir.me)
	//      note 1: May look like overkill, but in order to be truly faithful to handling all Unicode
	//      note 1: characters and to this function in PHP which does not count the number of bytes
	//      note 1: but counts the number of characters, something like this is really necessary.
	//   example 1: strlen('Kevin van Zonneveld')
	//   returns 1: 19
	//   example 2: ini_set('unicode.semantics', 'on')
	//   example 2: strlen('A\ud87e\udc04Z')
	//   returns 2: 3
	const str = string + ''
	const iniVal = phpjed.ini_get('unicode.semantics') || 'off'
	if (iniVal === 'off') {
		return str.length
	}
	let i = 0
	let lgth = 0
	const getWholeChar = function(str, i) {
		const code = str.charCodeAt(i)
		let next = ''
		let prev = ''
		if (code >= 0xD800 && code <= 0xDBFF) {
			// High surrogate (could change last hex to 0xDB7F to
			// treat high private surrogates as single characters)
			if (str.length <= (i + 1)) {
				throw new Error('High surrogate without following low surrogate')
			}
			next = str.charCodeAt(i + 1)
			if (next < 0xDC00 || next > 0xDFFF) {
				throw new Error('High surrogate without following low surrogate')
			}
			return str.charAt(i) + str.charAt(i + 1)
		} else if (code >= 0xDC00 && code <= 0xDFFF) {
			// Low surrogate
			if (i === 0) {
				throw new Error('Low surrogate without preceding high surrogate')
			}
			prev = str.charCodeAt(i - 1)
			if (prev < 0xD800 || prev > 0xDBFF) {
				// (could change last hex to 0xDB7F to treat high private surrogates
				// as single characters)
				throw new Error('Low surrogate without preceding high surrogate')
			}
			// We can pass over low surrogates now as the second
			// component in a pair which we have already processed
			return false
		}
		return str.charAt(i)
	}
	for (i = 0, lgth = 0; i < str.length; i++) {
		if ((getWholeChar(str, i)) === false) {
			continue
		}
		// Adapt this line at the top of any loop, passing in the whole string and
		// the current iteration and returning a variable to represent the individual character;
		// purpose is to treat the first part of a surrogate pair as the whole character and then
		// ignore the second part
		lgth++
	}
	return lgth
}
phpjed.strnatcasecmp = function(a, b) {
	//       discuss at: https://locutus.io/php/strnatcasecmp/
	//      original by: Martin Pool
	// reimplemented by: Pierre-Luc Paour
	// reimplemented by: Kristof Coomans (SCK-CEN (Belgian Nucleair Research Centre))
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//         input by: Devan Penner-Woelk
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	// reimplemented by: Rafał Kukawski
	//        example 1: strnatcasecmp(10, 1)
	//        returns 1: 1
	//        example 2: strnatcasecmp('1', '10')
	//        returns 2: -1
	const strnatcmp = phpjed.strnatcmp
	const _phpCastString = phpjed._phpCastString
	if (arguments.length !== 2) {
		return null
	}
	return strnatcmp(_phpCastString(a).toLowerCase(), _phpCastString(b).toLowerCase())
}
phpjed.strnatcmp = function(a, b) {
	//       discuss at: https://locutus.io/php/strnatcmp/
	//      original by: Martijn Wieringa
	//      improved by: Michael White (https://getsprink.com)
	//      improved by: Jack
	//      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// reimplemented by: Rafał Kukawski
	//        example 1: strnatcmp('abc', 'abc')
	//        returns 1: 0
	//        example 2: strnatcmp('a', 'b')
	//        returns 2: -1
	//        example 3: strnatcmp('10', '1')
	//        returns 3: 1
	//        example 4: strnatcmp('0000abc', '0abc')
	//        returns 4: 0
	//        example 5: strnatcmp('1239', '12345')
	//        returns 5: -1
	//        example 6: strnatcmp('t01239', 't012345')
	//        returns 6: 1
	//        example 7: strnatcmp('0A', '5N')
	//        returns 7: -1
	const _phpCastString = phpjed._phpCastString
	const leadingZeros = /^0+(?=\d)/
	const whitespace = /^\s/
	const digit = /^\d/
	if (arguments.length !== 2) {
		return null
	}
	a = _phpCastString(a)
	b = _phpCastString(b)
	if (!a.length || !b.length) {
		return a.length - b.length
	}
	let i = 0
	let j = 0
	a = a.replace(leadingZeros, '')
	b = b.replace(leadingZeros, '')
	while (i < a.length && j < b.length) {
		// skip consecutive whitespace
		while (whitespace.test(a.charAt(i))) i++
		while (whitespace.test(b.charAt(j))) j++
		let ac = a.charAt(i)
		let bc = b.charAt(j)
		let aIsDigit = digit.test(ac)
		let bIsDigit = digit.test(bc)
		if (aIsDigit && bIsDigit) {
			let bias = 0
			const fractional = ac === '0' || bc === '0'
			do {
				if (!aIsDigit) {
					return -1
				} else if (!bIsDigit) {
					return 1
				} else if (ac < bc) {
					if (!bias) {
						bias = -1
					}
					if (fractional) {
						return -1
					}
				} else if (ac > bc) {
					if (!bias) {
						bias = 1
					}
					if (fractional) {
						return 1
					}
				}
				ac = a.charAt(++i)
				bc = b.charAt(++j)
				aIsDigit = digit.test(ac)
				bIsDigit = digit.test(bc)
			} while (aIsDigit || bIsDigit)
			if (!fractional && bias) {
				return bias
			}
			continue
		}
		if (!ac || !bc) {
			continue
		} else if (ac < bc) {
			return -1
		} else if (ac > bc) {
			return 1
		}
		i++
		j++
	}
	const iBeforeStrEnd = i < a.length
	const jBeforeStrEnd = j < b.length
	// Check which string ended first
	// return -1 if a, 1 if b, 0 otherwise
	return (iBeforeStrEnd > jBeforeStrEnd) - (iBeforeStrEnd < jBeforeStrEnd)
}
phpjed.strncasecmp = function(argStr1, argStr2, len) {
	//  discuss at: https://locutus.io/php/strncasecmp/
	// original by: Saulo Vallory
	//    input by: Nate
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//      note 1: Returns < 0 if str1 is less than str2 ; > 0
	//      note 1: if str1 is greater than str2, and 0 if they are equal.
	//   example 1: strncasecmp('Price 12.9', 'Price 12.15', 2)
	//   returns 1: 0
	//   example 2: strncasecmp('Price 12.09', 'Price 12.15', 10)
	//   returns 2: -1
	//   example 3: strncasecmp('Price 12.90', 'Price 12.15', 30)
	//   returns 3: 8
	//   example 4: strncasecmp('Version 12.9', 'Version 12.15', 20)
	//   returns 4: 8
	//   example 5: strncasecmp('Version 12.15', 'Version 12.9', 20)
	//   returns 5: -8
	let diff
	let i = 0
	const str1 = (argStr1 + '').toLowerCase().substr(0, len)
	const str2 = (argStr2 + '').toLowerCase().substr(0, len)
	if (str1.length !== str2.length) {
		if (str1.length < str2.length) {
			len = str1.length
			if (str2.substr(0, str1.length) === str1) {
				// return the difference of chars
				return str1.length - str2.length
			}
		} else {
			len = str2.length
			// str1 is longer than str2
			if (str1.substr(0, str2.length) === str2) {
				// return the difference of chars
				return str1.length - str2.length
			}
		}
	} else {
		// Avoids trying to get a char that does not exist
		len = str1.length
	}
	for (diff = 0, i = 0; i < len; i++) {
		diff = str1.charCodeAt(i) - str2.charCodeAt(i)
		if (diff !== 0) {
			return diff
		}
	}
	return 0
}
phpjed.strncmp = function(str1, str2, lgth) {
	//       discuss at: https://locutus.io/php/strncmp/
	//      original by: Waldo Malqui Silva (https://waldo.malqui.info)
	//         input by: Steve Hilder
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//       revised by: gorthaur
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//        example 1: strncmp('aaa', 'aab', 2)
	//        returns 1: 0
	//        example 2: strncmp('aaa', 'aab', 3 )
	//        returns 2: -1
	const s1 = (str1 + '').substr(0, lgth)
	const s2 = (str2 + '').substr(0, lgth)
	return ((s1 === s2) ? 0 : ((s1 > s2) ? 1 : -1))
}
phpjed.strpbrk = function(haystack, charList) {
	//  discuss at: https://locutus.io/php/strpbrk/
	// original by: Alfonso Jimenez (https://www.alfonsojimenez.com)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//  revised by: Christoph
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: strpbrk('This is a Simple text.', 'is')
	//   returns 1: 'is is a Simple text.'
	for (let i = 0, len = haystack.length; i < len; ++i) {
		if (charList.indexOf(haystack.charAt(i)) >= 0) {
			return haystack.slice(i)
		}
	}
	return false
}
phpjed.strpos = function(haystack, needle, offset) {
	//  discuss at: https://locutus.io/php/strpos/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Daniel Esteban
	//   example 1: strpos('Kevin van Zonneveld', 'e', 5)
	//   returns 1: 14
	const i = (haystack + '').indexOf(needle, (offset || 0))
	return i === -1 ? false : i
}
phpjed.strrchr = function(haystack, needle) {
	//  discuss at: https://locutus.io/php/strrchr/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: Jason Wong (https://carrot.org/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: strrchr("Line 1\nLine 2\nLine 3", 10).substr(1)
	//   returns 1: 'Line 3'
	let pos = 0
	if (typeof needle !== 'string') {
		needle = String.fromCharCode(parseInt(needle, 10))
	}
	needle = needle.charAt(0)
	pos = haystack.lastIndexOf(needle)
	if (pos === -1) {
		return false
	}
	return haystack.substr(pos)
}
phpjed.strrev = function(string) {
	//       discuss at: https://locutus.io/php/strrev/
	//      original by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//        example 1: strrev('Kevin van Zonneveld')
	//        returns 1: 'dlevennoZ nav niveK'
	//        example 2: strrev('a\u0301haB')
	//        returns 2: 'Baha\u0301' // combining
	//        example 3: strrev('A\uD87E\uDC04Z')
	//        returns 3: 'Z\uD87E\uDC04A' // surrogates
	//             test: 'skip-3'
	string = string + ''
	// Performance will be enhanced with the next two lines of code commented
	// out if you don't care about combining characters
	// Keep Unicode combining characters together with the character preceding
	// them and which they are modifying (as in PHP 6)
	// See https://unicode.org/reports/tr44/#Property_Table (Me+Mn)
	// We also add the low surrogate range at the beginning here so it will be
	// maintained with its preceding high surrogate
	const chars = ['\uDC00-\uDFFF', '\u0300-\u036F', '\u0483-\u0489', '\u0591-\u05BD', '\u05BF',
		'\u05C1', '\u05C2', '\u05C4', '\u05C5', '\u05C7', '\u0610-\u061A', '\u064B-\u065E',
		'\u0670', '\u06D6-\u06DC', '\u06DE-\u06E4', '\u06E7\u06E8', '\u06EA-\u06ED',
		'\u0711', '\u0730-\u074A', '\u07A6-\u07B0', '\u07EB-\u07F3', '\u0901-\u0903',
		'\u093C', '\u093E-\u094D', '\u0951-\u0954', '\u0962', '\u0963', '\u0981-\u0983',
		'\u09BC', '\u09BE-\u09C4', '\u09C7', '\u09C8', '\u09CB-\u09CD', '\u09D7', '\u09E2',
		'\u09E3', '\u0A01-\u0A03', '\u0A3C', '\u0A3E-\u0A42', '\u0A47', '\u0A48',
		'\u0A4B-\u0A4D', '\u0A51', '\u0A70', '\u0A71', '\u0A75', '\u0A81-\u0A83', '\u0ABC',
		'\u0ABE-\u0AC5', '\u0AC7-\u0AC9', '\u0ACB-\u0ACD', '\u0AE2', '\u0AE3',
		'\u0B01-\u0B03', '\u0B3C', '\u0B3E-\u0B44', '\u0B47', '\u0B48', '\u0B4B-\u0B4D',
		'\u0B56', '\u0B57', '\u0B62', '\u0B63', '\u0B82', '\u0BBE-\u0BC2', '\u0BC6-\u0BC8',
		'\u0BCA-\u0BCD', '\u0BD7', '\u0C01-\u0C03', '\u0C3E-\u0C44', '\u0C46-\u0C48',
		'\u0C4A-\u0C4D', '\u0C55', '\u0C56', '\u0C62', '\u0C63', '\u0C82', '\u0C83',
		'\u0CBC', '\u0CBE-\u0CC4', '\u0CC6-\u0CC8', '\u0CCA-\u0CCD', '\u0CD5', '\u0CD6',
		'\u0CE2', '\u0CE3', '\u0D02', '\u0D03', '\u0D3E-\u0D44', '\u0D46-\u0D48',
		'\u0D4A-\u0D4D', '\u0D57', '\u0D62', '\u0D63', '\u0D82', '\u0D83', '\u0DCA',
		'\u0DCF-\u0DD4', '\u0DD6', '\u0DD8-\u0DDF', '\u0DF2', '\u0DF3', '\u0E31',
		'\u0E34-\u0E3A', '\u0E47-\u0E4E', '\u0EB1', '\u0EB4-\u0EB9', '\u0EBB', '\u0EBC',
		'\u0EC8-\u0ECD', '\u0F18', '\u0F19', '\u0F35', '\u0F37', '\u0F39', '\u0F3E',
		'\u0F3F', '\u0F71-\u0F84', '\u0F86', '\u0F87', '\u0F90-\u0F97', '\u0F99-\u0FBC',
		'\u0FC6', '\u102B-\u103E', '\u1056-\u1059', '\u105E-\u1060', '\u1062-\u1064',
		'\u1067-\u106D', '\u1071-\u1074', '\u1082-\u108D', '\u108F', '\u135F',
		'\u1712-\u1714', '\u1732-\u1734', '\u1752', '\u1753', '\u1772', '\u1773',
		'\u17B6-\u17D3', '\u17DD', '\u180B-\u180D', '\u18A9', '\u1920-\u192B',
		'\u1930-\u193B', '\u19B0-\u19C0', '\u19C8', '\u19C9', '\u1A17-\u1A1B',
		'\u1B00-\u1B04', '\u1B34-\u1B44', '\u1B6B-\u1B73', '\u1B80-\u1B82', '\u1BA1-\u1BAA',
		'\u1C24-\u1C37', '\u1DC0-\u1DE6', '\u1DFE', '\u1DFF', '\u20D0-\u20F0',
		'\u2DE0-\u2DFF', '\u302A-\u302F', '\u3099', '\u309A', '\uA66F-\uA672', '\uA67C',
		'\uA67D', '\uA802', '\uA806', '\uA80B', '\uA823-\uA827', '\uA880', '\uA881',
		'\uA8B4-\uA8C4', '\uA926-\uA92D', '\uA947-\uA953', '\uAA29-\uAA36', '\uAA43',
		'\uAA4C', '\uAA4D', '\uFB1E', '\uFE00-\uFE0F', '\uFE20-\uFE26'
	]
	const graphemeExtend = new RegExp('(.)([' + chars.join('') + ']+)', 'g')
	// Temporarily reverse
	string = string.replace(graphemeExtend, '$2$1')
	return string.split('').reverse().join('')
}
phpjed.strripos = function(haystack, needle, offset) {
	//  discuss at: https://locutus.io/php/strripos/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//    input by: saulius
	//   example 1: strripos('Kevin van Zonneveld', 'E')
	//   returns 1: 16
	haystack = (haystack + '').toLowerCase()
	needle = (needle + '').toLowerCase()
	let i = -1
	if (offset) {
		i = (haystack + '').slice(offset).lastIndexOf(
			needle) // strrpos' offset indicates starting point of range till end,
		// while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
		if (i !== -1) {
			i += offset
		}
	} else {
		i = (haystack + '').lastIndexOf(needle)
	}
	return i >= 0 ? i : false
}
phpjed.strrpos = function(haystack, needle, offset) {
	//  discuss at: https://locutus.io/php/strrpos/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//    input by: saulius
	//   example 1: strrpos('Kevin van Zonneveld', 'e')
	//   returns 1: 16
	//   example 2: strrpos('somepage.com', '.', false)
	//   returns 2: 8
	//   example 3: strrpos('baa', 'a', 3)
	//   returns 3: false
	//   example 4: strrpos('baa', 'a', 2)
	//   returns 4: 2
	let i = -1
	if (offset) {
		i = (haystack + '').slice(offset).lastIndexOf(
			needle) // strrpos' offset indicates starting point of range till end,
		// while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
		if (i !== -1) {
			i += offset
		}
	} else {
		i = (haystack + '').lastIndexOf(needle)
	}
	return i >= 0 ? i : false
}
phpjed.strspn = function(str1, str2, start, lgth) {
	//  discuss at: https://locutus.io/php/strspn/
	// original by: Valentina De Rosa
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: strspn('42 is the answer, what is the question ...', '1234567890')
	//   returns 1: 2
	//   example 2: strspn('foo', 'o', 1, 2)
	//   returns 2: 2
	let found
	let stri
	let strj
	let j = 0
	let i = 0
	start = start ? (start < 0 ? (str1.length + start) : start) : 0
	lgth = lgth ? ((lgth < 0) ? (str1.length + lgth - start) : lgth) : str1.length - start
	str1 = str1.substr(start, lgth)
	for (i = 0; i < str1.length; i++) {
		found = 0
		stri = str1.substring(i, i + 1)
		for (j = 0; j <= str2.length; j++) {
			strj = str2.substring(j, j + 1)
			if (stri === strj) {
				found = 1
				break
			}
		}
		if (found !== 1) {
			return i
		}
	}
	return i
}
phpjed.strstr = function(haystack, needle, bool) {
	//  discuss at: https://locutus.io/php/strstr/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: strstr('Kevin van Zonneveld', 'van')
	//   returns 1: 'van Zonneveld'
	//   example 2: strstr('Kevin van Zonneveld', 'van', true)
	//   returns 2: 'Kevin '
	//   example 3: strstr('name@example.com', '@')
	//   returns 3: '@example.com'
	//   example 4: strstr('name@example.com', '@', true)
	//   returns 4: 'name'
	let pos = 0
	haystack += ''
	pos = haystack.indexOf(needle)
	if (pos === -1) {
		return false
	} else {
		if (bool) {
			return haystack.substr(0, pos)
		} else {
			return haystack.slice(pos)
		}
	}
}
phpjed.strtok = function(str, tokens) {
	//  discuss at: https://locutus.io/php/strtok/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: Use tab and newline as tokenizing characters as well
	//   example 1: var $string = "\t\t\t\nThis is\tan example\nstring\n"
	//   example 1: var $tok = strtok($string, " \n\t")
	//   example 1: var $b = ''
	//   example 1: while ($tok !== false) {$b += "Word="+$tok+"\n"; $tok = strtok(" \n\t");}
	//   example 1: var $result = $b
	//   returns 1: "Word=This\nWord=is\nWord=an\nWord=example\nWord=string\n"
	const $global = (typeof window !== 'undefined' ? window : global)
	$global.$locutus = $global.$locutus || {}
	const $locutus = $global.$locutus
	$locutus.php = $locutus.php || {}
	if (tokens === undefined) {
		tokens = str
		str = $locutus.php.strtokleftOver
	}
	if (str.length === 0) {
		return false
	}
	if (tokens.indexOf(str.charAt(0)) !== -1) {
		return strtok(str.substr(1), tokens)
	}
	for (var i = 0; i < str.length; i++) {
		if (tokens.indexOf(str.charAt(i)) !== -1) {
			break
		}
	}
	$locutus.php.strtokleftOver = str.substr(i + 1)
	return str.substring(0, i)
}
phpjed.strtolower = function(str) {
	//  discuss at: https://locutus.io/php/strtolower/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: strtolower('Kevin van Zonneveld')
	//   returns 1: 'kevin van zonneveld'
	return (str + '').toLowerCase()
}
phpjed.strtoupper = function(str) {
	//  discuss at: https://locutus.io/php/strtoupper/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: strtoupper('Kevin van Zonneveld')
	//   returns 1: 'KEVIN VAN ZONNEVELD'
	return (str + '').toUpperCase()
}
phpjed.strtr = function(str, trFrom, trTo) {
	//  discuss at: https://locutus.io/php/strtr/
	// original by: Brett Zamir (https://brett-zamir.me)
	//    input by: uestla
	//    input by: Alan C
	//    input by: Taras Bogach
	//    input by: jpfle
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: var $trans = {'hello' : 'hi', 'hi' : 'hello'}
	//   example 1: strtr('hi all, I said hello', $trans)
	//   returns 1: 'hello all, I said hi'
	//   example 2: strtr('äaabaåccasdeöoo', 'äåö','aao')
	//   returns 2: 'aaabaaccasdeooo'
	//   example 3: strtr('ääääääää', 'ä', 'a')
	//   returns 3: 'aaaaaaaa'
	//   example 4: strtr('http', 'pthxyz','xyzpth')
	//   returns 4: 'zyyx'
	//   example 5: strtr('zyyx', 'pthxyz','xyzpth')
	//   returns 5: 'http'
	//   example 6: strtr('aa', {'a':1,'aa':2})
	//   returns 6: '2'
	const krsort = phpjed.krsort
	const iniSet = phpjed.ini_set
	let fr = ''
	let i = 0
	let j = 0
	let lenStr = 0
	let lenFrom = 0
	let sortByReference = false
	let fromTypeStr = ''
	let toTypeStr = ''
	let istr = ''
	const tmpFrom = []
	const tmpTo = []
	let ret = ''
	let match = false
	// Received replace_pairs?
	// Convert to normal trFrom->trTo chars
	if (typeof trFrom === 'object') {
		// Not thread-safe; temporarily set to true
		// @todo: Don't rely on ini here, use internal krsort instead
		sortByReference = iniSet('locutus.sortByReference', false)
		trFrom = krsort(trFrom)
		iniSet('locutus.sortByReference', sortByReference)
		for (fr in trFrom) {
			if (trFrom.hasOwnProperty(fr)) {
				tmpFrom.push(fr)
				tmpTo.push(trFrom[fr])
			}
		}
		trFrom = tmpFrom
		trTo = tmpTo
	}
	// Walk through subject and replace chars when needed
	lenStr = str.length
	lenFrom = trFrom.length
	fromTypeStr = typeof trFrom === 'string'
	toTypeStr = typeof trTo === 'string'
	for (i = 0; i < lenStr; i++) {
		match = false
		if (fromTypeStr) {
			istr = str.charAt(i)
			for (j = 0; j < lenFrom; j++) {
				if (istr === trFrom.charAt(j)) {
					match = true
					break
				}
			}
		} else {
			for (j = 0; j < lenFrom; j++) {
				if (str.substr(i, trFrom[j].length) === trFrom[j]) {
					match = true
					// Fast forward
					i = (i + trFrom[j].length) - 1
					break
				}
			}
		}
		if (match) {
			ret += toTypeStr ? trTo.charAt(j) : trTo[j]
		} else {
			ret += str.charAt(i)
		}
	}
	return ret
}
phpjed.substr = function(input, start, len) {
	//  discuss at: https://locutus.io/php/substr/
	// original by: Martijn Wieringa
	// bugfixed by: T.Wild
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//  revised by: Theriault (https://github.com/Theriault)
	//  revised by: Rafał Kukawski
	//      note 1: Handles rare Unicode characters if 'unicode.semantics' ini (PHP6) is set to 'on'
	//   example 1: substr('abcdef', 0, -1)
	//   returns 1: 'abcde'
	//   example 2: substr(2, 0, -6)
	//   returns 2: false
	//   example 3: ini_set('unicode.semantics', 'on')
	//   example 3: substr('a\uD801\uDC00', 0, -1)
	//   returns 3: 'a'
	//   example 4: ini_set('unicode.semantics', 'on')
	//   example 4: substr('a\uD801\uDC00', 0, 2)
	//   returns 4: 'a\uD801\uDC00'
	//   example 5: ini_set('unicode.semantics', 'on')
	//   example 5: substr('a\uD801\uDC00', -1, 1)
	//   returns 5: '\uD801\uDC00'
	//   example 6: ini_set('unicode.semantics', 'on')
	//   example 6: substr('a\uD801\uDC00z\uD801\uDC00', -3, 2)
	//   returns 6: '\uD801\uDC00z'
	//   example 7: ini_set('unicode.semantics', 'on')
	//   example 7: substr('a\uD801\uDC00z\uD801\uDC00', -3, -1)
	//   returns 7: '\uD801\uDC00z'
	//        test: skip-3 skip-4 skip-5 skip-6 skip-7
	const _php_cast_string = phpjed._phpCastString
	input = _php_cast_string(input)
	const ini_get = phpjed.ini_get
	const multibyte = ini_get('unicode.semantics') === 'on'
	if (multibyte) {
		input = input.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g) || []
	}
	const inputLength = input.length
	let end = inputLength
	if (start < 0) {
		start += end
	}
	if (typeof len !== 'undefined') {
		if (len < 0) {
			end = len + end
		} else {
			end = len + start
		}
	}
	if (start > inputLength || start < 0 || start > end) {
		return false
	}
	if (multibyte) {
		return input.slice(start, end).join('')
	}
	return input.slice(start, end)
}
phpjed.substr_compare = function(mainStr, str, offset, length,
caseInsensitivity) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/substr_compare/
	// original by: Brett Zamir (https://brett-zamir.me)
	// original by: strcasecmp, strcmp
	//   example 1: substr_compare("abcde", "bc", 1, 2)
	//   returns 1: 0
	if (!offset && offset !== 0) {
		throw new Error('Missing offset for substr_compare()')
	}
	if (offset < 0) {
		offset = mainStr.length + offset
	}
	if (length && length > (mainStr.length - offset)) {
		return false
	}
	length = length || mainStr.length - offset
	mainStr = mainStr.substr(offset, length)
	// Should only compare up to the desired length
	str = str.substr(0, length)
	if (caseInsensitivity) {
		// Works as strcasecmp
		mainStr = (mainStr + '').toLowerCase()
		str = (str + '').toLowerCase()
		if (mainStr === str) {
			return 0
		}
		return (mainStr > str) ? 1 : -1
	}
	// Works as strcmp
	return ((mainStr === str) ? 0 : ((mainStr > str) ? 1 : -1))
}
phpjed.substr_count = function(haystack, needle, offset, length) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/substr_count/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Thomas
	//   example 1: substr_count('Kevin van Zonneveld', 'e')
	//   returns 1: 3
	//   example 2: substr_count('Kevin van Zonneveld', 'K', 1)
	//   returns 2: 0
	//   example 3: substr_count('Kevin van Zonneveld', 'Z', 0, 10)
	//   returns 3: false
	let cnt = 0
	haystack += ''
	needle += ''
	if (isNaN(offset)) {
		offset = 0
	}
	if (isNaN(length)) {
		length = 0
	}
	if (needle.length === 0) {
		return false
	}
	offset--
	while ((offset = haystack.indexOf(needle, offset + 1)) !== -1) {
		if (length > 0 && (offset + needle.length) > length) {
			return false
		}
		cnt++
	}
	return cnt
}
phpjed.substr_replace = function(str, replace, start, length) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/substr_replace/
	// original by: Brett Zamir (https://brett-zamir.me)
	//   example 1: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', 0)
	//   returns 1: 'bob'
	//   example 2: var $var = 'ABCDEFGH:/MNRPQR/'
	//   example 2: substr_replace($var, 'bob', 0, $var.length)
	//   returns 2: 'bob'
	//   example 3: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', 0, 0)
	//   returns 3: 'bobABCDEFGH:/MNRPQR/'
	//   example 4: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', 10, -1)
	//   returns 4: 'ABCDEFGH:/bob/'
	//   example 5: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', -7, -1)
	//   returns 5: 'ABCDEFGH:/bob/'
	//   example 6: substr_replace('ABCDEFGH:/MNRPQR/', '', 10, -1)
	//   returns 6: 'ABCDEFGH://'
	if (start < 0) {
		// start position in str
		start = start + str.length
	}
	length = length !== undefined ? length : str.length
	if (length < 0) {
		length = length + str.length - start
	}
	return [
		str.slice(0, start),
		replace.substr(0, length),
		replace.slice(length),
		str.slice(start + length)
	].join('')
}
phpjed.trim = function(str, charlist) {
	//  discuss at: https://locutus.io/php/trim/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: mdsjack (https://www.mdsjack.bo.it)
	// improved by: Alexander Ermolaev (https://snippets.dzone.com/user/AlexanderErmolaev)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Steven Levithan (https://blog.stevenlevithan.com)
	// improved by: Jack
	//    input by: Erkekjetter
	//    input by: DxGx
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	//   example 1: trim('    Kevin van Zonneveld    ')
	//   returns 1: 'Kevin van Zonneveld'
	//   example 2: trim('Hello World', 'Hdle')
	//   returns 2: 'o Wor'
	//   example 3: trim(16, 1)
	//   returns 3: '6'
	let whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002',
		'\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a',
		'\u200b', '\u2028', '\u2029', '\u3000'
	].join('')
	let l = 0
	let i = 0
	str += ''
	if (charlist) {
		whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
	}
	l = str.length
	for (i = 0; i < l; i++) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i)
			break
		}
	}
	l = str.length
	for (i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(0, i + 1)
			break
		}
	}
	return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
}
phpjed.ucfirst = function(str) {
	//  discuss at: https://locutus.io/php/ucfirst/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//   example 1: ucfirst('kevin van zonneveld')
	//   returns 1: 'Kevin van zonneveld'
	str += ''
	const f = str.charAt(0).toUpperCase()
	return f + str.substr(1)
}
phpjed.ucwords = function(str) {
	//  discuss at: https://locutus.io/php/ucwords/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// improved by: Waldo Malqui Silva (https://waldo.malqui.info)
	// improved by: Robin
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Cetvertacov Alexandr (https://github.com/cetver)
	//    input by: James (https://www.james-bell.co.uk/)
	//   example 1: ucwords('kevin van  zonneveld')
	//   returns 1: 'Kevin Van  Zonneveld'
	//   example 2: ucwords('HELLO WORLD')
	//   returns 2: 'HELLO WORLD'
	//   example 3: ucwords('у мэри был маленький ягненок и она его очень любила')
	//   returns 3: 'У Мэри Был Маленький Ягненок И Она Его Очень Любила'
	//   example 4: ucwords('τάχιστη αλώπηξ βαφής ψημένη γη, δρασκελίζει υπέρ νωθρού κυνός')
	//   returns 4: 'Τάχιστη Αλώπηξ Βαφής Ψημένη Γη, Δρασκελίζει Υπέρ Νωθρού Κυνός'
	return (str + '').replace(/^(.)|\s+(.)/g, function($1) {
		return $1.toUpperCase()
	})
}
phpjed.vprintf = function(format, args) {
	//       discuss at: https://locutus.io/php/vprintf/
	//      original by: Ash Searle (https://hexmen.com/blog/)
	//      improved by: Michael White (https://getsprink.com)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//        example 1: vprintf("%01.2f", 123.1)
	//        returns 1: 6
	const sprintf = phpjed.sprintf
	const echo = phpjed.echo
	const ret = sprintf.apply(this, [format].concat(args))
	echo(ret)
	return ret.length
}
phpjed.vsprintf = function(format, args) {
	//  discuss at: https://locutus.io/php/vsprintf/
	// original by: ejsanders
	//   example 1: vsprintf('%04d-%02d-%02d', [1988, 8, 1])
	//   returns 1: '1988-08-01'
	const sprintf = phpjed.sprintf
	return sprintf.apply(this, [format].concat(args))
}
phpjed.wordwrap = function(str, intWidth, strBreak, cut) {
	//  discuss at: https://locutus.io/php/wordwrap/
	// original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// improved by: Nick Callen
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Sakimori
	//  revised by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
	// bugfixed by: Michael Grier
	// bugfixed by: Feras ALHAEK
	// improved by: Rafał Kukawski (https://kukawski.net)
	//   example 1: wordwrap('Kevin van Zonneveld', 6, '|', true)
	//   returns 1: 'Kevin|van|Zonnev|eld'
	//   example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n')
	//   returns 2: 'The quick brown fox<br />\njumped over the lazy<br />\ndog.'
	//   example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')
	//   returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim\nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea\ncommodo consequat.'
	intWidth = arguments.length >= 2 ? +intWidth : 75
	strBreak = arguments.length >= 3 ? '' + strBreak : '\n'
	cut = arguments.length >= 4 ? !!cut : false
	let i, j, line
	str += ''
	if (intWidth < 1) {
		return str
	}
	const reLineBreaks = /\r\n|\n|\r/
	const reBeginningUntilFirstWhitespace = /^\S*/
	const reLastCharsWithOptionalTrailingWhitespace = /\S*(\s)?$/
	const lines = str.split(reLineBreaks)
	const l = lines.length
	let match
	// for each line of text
	for (i = 0; i < l; lines[i++] += line) {
		line = lines[i]
		lines[i] = ''
		while (line.length > intWidth) {
			// get slice of length one char above limit
			const slice = line.slice(0, intWidth + 1)
			// remove leading whitespace from rest of line to parse
			let ltrim = 0
			// remove trailing whitespace from new line content
			let rtrim = 0
			match = slice.match(reLastCharsWithOptionalTrailingWhitespace)
			// if the slice ends with whitespace
			if (match[1]) {
				// then perfect moment to cut the line
				j = intWidth
				ltrim = 1
			} else {
				// otherwise cut at previous whitespace
				j = slice.length - match[0].length
				if (j) {
					rtrim = 1
				}
				// but if there is no previous whitespace
				// and cut is forced
				// cut just at the defined limit
				if (!j && cut && intWidth) {
					j = intWidth
				}
				// if cut wasn't forced
				// cut at next possible whitespace after the limit
				if (!j) {
					const charsUntilNextWhitespace = (line.slice(intWidth).match(
						reBeginningUntilFirstWhitespace) || [''])[0]
					j = slice.length + charsUntilNextWhitespace.length
				}
			}
			lines[i] += line.slice(0, j - rtrim)
			line = line.slice(j + ltrim)
			lines[i] += line.length ? strBreak : ''
		}
	}
	return lines.join('\n')
}
phpjed.base64_decode = function(encodedData) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/base64_decode/
	// original by: Tyler Akins (https://rumkin.com)
	// improved by: Thunder.m
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Aman Gupta
	//    input by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Pellentesque Malesuada
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Indigo744
	//   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==')
	//   returns 1: 'Kevin van Zonneveld'
	//   example 2: base64_decode('YQ==')
	//   returns 2: 'a'
	//   example 3: base64_decode('4pyTIMOgIGxhIG1vZGU=')
	//   returns 3: '✓ à la mode'
	// decodeUTF8string()
	// Internal function to decode properly UTF8 string
	// Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	const decodeUTF8string = function(str) {
		// Going backwards: from bytestream, to percent-encoding, to original string.
		return decodeURIComponent(str.split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
		}).join(''))
	}
	if (typeof window !== 'undefined') {
		if (typeof window.atob !== 'undefined') {
			return decodeUTF8string(window.atob(encodedData))
		}
	} else {
		return new Buffer(encodedData, 'base64').toString('utf-8')
	}
	const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	let o1
	let o2
	let o3
	let h1
	let h2
	let h3
	let h4
	let bits
	let i = 0
	let ac = 0
	let dec = ''
	const tmpArr = []
	if (!encodedData) {
		return encodedData
	}
	encodedData += ''
	do {
		// unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(encodedData.charAt(i++))
		h2 = b64.indexOf(encodedData.charAt(i++))
		h3 = b64.indexOf(encodedData.charAt(i++))
		h4 = b64.indexOf(encodedData.charAt(i++))
		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4
		o1 = bits >> 16 & 0xff
		o2 = bits >> 8 & 0xff
		o3 = bits & 0xff
		if (h3 === 64) {
			tmpArr[ac++] = String.fromCharCode(o1)
		} else if (h4 === 64) {
			tmpArr[ac++] = String.fromCharCode(o1, o2)
		} else {
			tmpArr[ac++] = String.fromCharCode(o1, o2, o3)
		}
	} while (i < encodedData.length)
	dec = tmpArr.join('')
	return decodeUTF8string(dec.replace(/\0+$/, ''))
}
phpjed.base64_encode = function(stringToEncode) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/base64_encode/
	// original by: Tyler Akins (https://rumkin.com)
	// improved by: Bayron Guevara
	// improved by: Thunder.m
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	// bugfixed by: Pellentesque Malesuada
	// improved by: Indigo744
	//   example 1: base64_encode('Kevin van Zonneveld')
	//   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	//   example 2: base64_encode('a')
	//   returns 2: 'YQ=='
	//   example 3: base64_encode('✓ à la mode')
	//   returns 3: '4pyTIMOgIGxhIG1vZGU='
	// encodeUTF8string()
	// Internal function to encode properly UTF8 string
	// Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	const encodeUTF8string = function(str) {
		// first we use encodeURIComponent to get percent-encoded UTF-8,
		// then we convert the percent encodings into raw bytes which
		// can be fed into the base64 encoding algorithm.
		return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, phpjed.toSolidBytes =
			function(match, p1) {
				return String.fromCharCode('0x' + p1)
			})
	}
	if (typeof window !== 'undefined') {
		if (typeof window.btoa !== 'undefined') {
			return window.btoa(encodeUTF8string(stringToEncode))
		}
	} else {
		return new Buffer(stringToEncode).toString('base64')
	}
	const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	let o1
	let o2
	let o3
	let h1
	let h2
	let h3
	let h4
	let bits
	let i = 0
	let ac = 0
	let enc = ''
	const tmpArr = []
	if (!stringToEncode) {
		return stringToEncode
	}
	stringToEncode = encodeUTF8string(stringToEncode)
	do {
		// pack three octets into four hexets
		o1 = stringToEncode.charCodeAt(i++)
		o2 = stringToEncode.charCodeAt(i++)
		o3 = stringToEncode.charCodeAt(i++)
		bits = o1 << 16 | o2 << 8 | o3
		h1 = bits >> 18 & 0x3f
		h2 = bits >> 12 & 0x3f
		h3 = bits >> 6 & 0x3f
		h4 = bits & 0x3f
		// use hexets to index into b64, and append result to encoded string
		tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
	} while (i < stringToEncode.length)
	enc = tmpArr.join('')
	const r = stringToEncode.length % 3
	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
}
phpjed.http_build_query = function(formdata, numericPrefix, argSeparator,
encType) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/http_build_query/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Legaev Andrey
	// improved by: Michael White (https://getsprink.com)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//  revised by: stag019
	//    input by: Dreamer
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: MIO_KODUKI (https://mio-koduki.blogspot.com/)
	// improved by: Will Rowe
	//      note 1: If the value is null, key and value are skipped in the
	//      note 1: http_build_query of PHP while in locutus they are not.
	//   example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;')
	//   returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
	//   example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_')
	//   returns 2: 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&php=hypertext+processor&cow=milk'
	//   example 3: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;', 'PHP_QUERY_RFC3986')
	//   returns 3: 'foo=bar&amp;php=hypertext%20processor&amp;baz=boom&amp;cow=milk'
	let encodeFunc
	switch (encType) {
		case 'PHP_QUERY_RFC3986':
			encodeFunc = phpjed.rawurlencode
			break
		case 'PHP_QUERY_RFC1738':
		default:
			encodeFunc = phpjed.urlencode
			break
	}
	let value
	let key
	const tmp = []
	var _httpBuildQueryHelper = function(key, val, argSeparator) {
		let k
		const tmp = []
		if (val === true) {
			val = '1'
		} else if (val === false) {
			val = '0'
		}
		if (val !== null) {
			if (typeof val === 'object') {
				for (k in val) {
					if (val[k] !== null) {
						tmp.push(_httpBuildQueryHelper(key + '[' + k + ']', val[k],
							argSeparator))
					}
				}
				return tmp.join(argSeparator)
			} else if (typeof val !== 'function') {
				return encodeFunc(key) + '=' + encodeFunc(val)
			} else {
				throw new Error('There was an error processing for http_build_query().')
			}
		} else {
			return ''
		}
	}
	if (!argSeparator) {
		argSeparator = '&'
	}
	for (key in formdata) {
		value = formdata[key]
		if (numericPrefix && !isNaN(key)) {
			key = String(numericPrefix) + key
		}
		const query = _httpBuildQueryHelper(key, value, argSeparator)
		if (query !== '') {
			tmp.push(query)
		}
	}
	return tmp.join(argSeparator)
}
phpjed.parse_url = function(str, component) { // eslint-disable-line camelcase
	//       discuss at: https://locutus.io/php/parse_url/
	//      original by: Steven Levithan (https://blog.stevenlevithan.com)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//         input by: Lorenzo Pisani
	//         input by: Tony
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//           note 1: original by https://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
	//           note 1: blog post at https://blog.stevenlevithan.com/archives/parseuri
	//           note 1: demo at https://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
	//           note 1: Does not replace invalid characters with '_' as in PHP,
	//           note 1: nor does it return false with
	//           note 1: a seriously malformed URL.
	//           note 1: Besides function name, is essentially the same as parseUri as
	//           note 1: well as our allowing
	//           note 1: an extra slash after the scheme/protocol (to allow file:/// as in PHP)
	//        example 1: parse_url('https://user:pass@host/path?a=v#a')
	//        returns 1: {scheme: 'https', host: 'host', user: 'user', pass: 'pass', path: '/path', query: 'a=v', fragment: 'a'}
	//        example 2: parse_url('https://en.wikipedia.org/wiki/%22@%22_%28album%29')
	//        returns 2: {scheme: 'https', host: 'en.wikipedia.org', path: '/wiki/%22@%22_%28album%29'}
	//        example 3: parse_url('https://host.domain.tld/a@b.c/folder')
	//        returns 3: {scheme: 'https', host: 'host.domain.tld', path: '/a@b.c/folder'}
	//        example 4: parse_url('https://gooduser:secretpassword@www.example.com/a@b.c/folder?foo=bar')
	//        returns 4: { scheme: 'https', host: 'www.example.com', path: '/a@b.c/folder', query: 'foo=bar', user: 'gooduser', pass: 'secretpassword' }
	let query
	const mode = phpjed.ini_get('locutus.parse_url.mode') || 'php'
	const key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
		'relative', 'path', 'directory', 'file', 'query', 'fragment'
	]
	// For loose we added one optional slash to post-scheme to catch file:/// (should restrict this)
	let parser = {
		php: new RegExp(['(?:([^:\\/?#]+):)?',
			'(?:\\/\\/()(?:(?:()(?:([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?))?',
			'()',
			'(?:(()(?:(?:[^?#\\/]*\\/)*)()(?:[^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'
		].join('')),
		strict: new RegExp(['(?:([^:\\/?#]+):)?',
			'(?:\\/\\/((?:(([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?))?',
			'((((?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'
		].join('')),
		loose: new RegExp(['(?:(?![^:@]+:[^:@\\/]*@)([^:\\/?#.]+):)?', '(?:\\/\\/\\/?)?',
			'((?:(([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?)',
			'(((\\/(?:[^?#](?![^?#\\/]*\\.[^?#\\/.]+(?:[?#]|$)))*\\/?)?([^?#\\/]*))',
			'(?:\\?([^#]*))?(?:#(.*))?)'
		].join(''))
	}
	const m = parser[mode].exec(str)
	const uri = {}
	let i = 14
	while (i--) {
		if (m[i]) {
			uri[key[i]] = m[i]
		}
	}
	if (component) {
		return uri[component.replace('PHP_URL_', '').toLowerCase()]
	}
	if (mode !== 'php') {
		const name = phpjed.ini_get('locutus.parse_url.queryKey') || 'queryKey'
		parser = /(?:^|&)([^&=]*)=?([^&]*)/g
		uri[name] = {}
		query = uri[key[12]] || ''
		query.replace(parser, function($0, $1, $2) {
			if ($1) {
				uri[name][$1] = $2
			}
		})
	}
	delete uri.source
	return uri
}
phpjed.rawurldecode = function(str) {
	//       discuss at: https://locutus.io/php/rawurldecode/
	//      original by: Brett Zamir (https://brett-zamir.me)
	//         input by: travc
	//         input by: Brett Zamir (https://brett-zamir.me)
	//         input by: Ratheous
	//         input by: lovio
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//           note 1: Please be aware that this function expects to decode
	//           note 1: from UTF-8 encoded strings, as found on
	//           note 1: pages served as UTF-8
	//        example 1: rawurldecode('Kevin+van+Zonneveld%21')
	//        returns 1: 'Kevin+van+Zonneveld!'
	//        example 2: rawurldecode('https%3A%2F%2Fkvz.io%2F')
	//        returns 2: 'https://kvz.io/'
	//        example 3: rawurldecode('https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3D')
	//        returns 3: 'https://www.google.nl/search?q=Locutus&ie='
	return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function() {
		// PHP tolerates poorly formed escape sequences
		return '%25'
	}))
}
phpjed.rawurlencode = function(str) {
	//       discuss at: https://locutus.io/php/rawurlencode/
	//      original by: Brett Zamir (https://brett-zamir.me)
	//         input by: travc
	//         input by: Brett Zamir (https://brett-zamir.me)
	//         input by: Michael Grier
	//         input by: Ratheous
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: Joris
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//           note 1: This reflects PHP 5.3/6.0+ behavior
	//           note 1: Please be aware that this function expects \
	//           note 1: to encode into UTF-8 encoded strings, as found on
	//           note 1: pages served as UTF-8
	//        example 1: rawurlencode('Kevin van Zonneveld!')
	//        returns 1: 'Kevin%20van%20Zonneveld%21'
	//        example 2: rawurlencode('https://kvz.io/')
	//        returns 2: 'https%3A%2F%2Fkvz.io%2F'
	//        example 3: rawurlencode('https://www.google.nl/search?q=Locutus&ie=utf-8')
	//        returns 3: 'https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'
	str = (str + '')
	// Tilde should be allowed unescaped in future versions of PHP (as reflected below),
	// but if you want to reflect current
	// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
	return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g,
		'%28').replace(/\)/g, '%29').replace(/\*/g, '%2A')
}
phpjed.urldecode = function(str) {
	//       discuss at: https://locutus.io/php/urldecode/
	//      original by: Philip Peterson
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Lars Fischer
	//      improved by: Orlando
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//         input by: AJ
	//         input by: travc
	//         input by: Brett Zamir (https://brett-zamir.me)
	//         input by: Ratheous
	//         input by: e-mike
	//         input by: lovio
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Rob
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//           note 1: info on what encoding functions to use from:
	//           note 1: https://xkr.us/articles/javascript/encode-compare/
	//           note 1: Please be aware that this function expects to decode
	//           note 1: from UTF-8 encoded strings, as found on
	//           note 1: pages served as UTF-8
	//        example 1: urldecode('Kevin+van+Zonneveld%21')
	//        returns 1: 'Kevin van Zonneveld!'
	//        example 2: urldecode('https%3A%2F%2Fkvz.io%2F')
	//        returns 2: 'https://kvz.io/'
	//        example 3: urldecode('https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a')
	//        returns 3: 'https://www.google.nl/search?q=Locutus&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'
	//        example 4: urldecode('%E5%A5%BD%3_4')
	//        returns 4: '\u597d%3_4'
	return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function() {
		// PHP tolerates poorly formed escape sequences
		return '%25'
	}).replace(/\+/g, '%20'))
}
phpjed.urlencode = function(str) {
	//       discuss at: https://locutus.io/php/urlencode/
	//      original by: Philip Peterson
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Brett Zamir (https://brett-zamir.me)
	//      improved by: Lars Fischer
	//      improved by: Waldo Malqui Silva (https://fayr.us/waldo/)
	//         input by: AJ
	//         input by: travc
	//         input by: Brett Zamir (https://brett-zamir.me)
	//         input by: Ratheous
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Joris
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	// reimplemented by: Brett Zamir (https://brett-zamir.me)
	//           note 1: This reflects PHP 5.3/6.0+ behavior
	//           note 1: Please be aware that this function
	//           note 1: expects to encode into UTF-8 encoded strings, as found on
	//           note 1: pages served as UTF-8
	//        example 1: urlencode('Kevin van Zonneveld!')
	//        returns 1: 'Kevin+van+Zonneveld%21'
	//        example 2: urlencode('https://kvz.io/')
	//        returns 2: 'https%3A%2F%2Fkvz.io%2F'
	//        example 3: urlencode('https://www.google.nl/search?q=Locutus&ie=utf-8')
	//        returns 3: 'https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'
	str = (str + '')
	return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g,
		'%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/~/g, '%7E').replace(
		/%20/g, '+')
}
phpjed.boolval = function(mixedVar) {
	// original by: Will Rowe
	//   example 1: boolval(true)
	//   returns 1: true
	//   example 2: boolval(false)
	//   returns 2: false
	//   example 3: boolval(0)
	//   returns 3: false
	//   example 4: boolval(0.0)
	//   returns 4: false
	//   example 5: boolval('')
	//   returns 5: false
	//   example 6: boolval('0')
	//   returns 6: false
	//   example 7: boolval([])
	//   returns 7: false
	//   example 8: boolval('')
	//   returns 8: false
	//   example 9: boolval(null)
	//   returns 9: false
	//   example 10: boolval(undefined)
	//   returns 10: false
	//   example 11: boolval('true')
	//   returns 11: true
	if (mixedVar === false) {
		return false
	}
	if (mixedVar === 0 || mixedVar === 0.0) {
		return false
	}
	if (mixedVar === '' || mixedVar === '0') {
		return false
	}
	if (Array.isArray(mixedVar) && mixedVar.length === 0) {
		return false
	}
	if (mixedVar === null || mixedVar === undefined) {
		return false
	}
	return true
}
phpjed.doubleval = function(mixedVar) {
	//  discuss at: https://locutus.io/php/doubleval/
	// original by: Brett Zamir (https://brett-zamir.me)
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: doubleval(186)
	//   returns 1: 186.00
	const floatval = phpjed.floatval
	return floatval(mixedVar)
}
phpjed.empty = function(mixedVar) {
	//  discuss at: https://locutus.io/php/empty/
	// original by: Philippe Baumann
	//    input by: Onno Marsman (https://twitter.com/onnomarsman)
	//    input by: LH
	//    input by: Stoyan Kyosev (https://www.svest.org/)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Francesco
	// improved by: Marc Jansen
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	//   example 1: empty(null)
	//   returns 1: true
	//   example 2: empty(undefined)
	//   returns 2: true
	//   example 3: empty([])
	//   returns 3: true
	//   example 4: empty({})
	//   returns 4: true
	//   example 5: empty({'aFunc' : function () { alert('humpty'); } })
	//   returns 5: false
	let undef
	let key
	let i
	let len
	const emptyValues = [undef, null, false, 0, '', '0']
	for (i = 0, len = emptyValues.length; i < len; i++) {
		if (mixedVar === emptyValues[i]) {
			return true
		}
	}
	if (typeof mixedVar === 'object') {
		for (key in mixedVar) {
			if (mixedVar.hasOwnProperty(key)) {
				return false
			}
		}
		return true
	}
	return false
}
phpjed.floatval = function(mixedVar) {
	//  discuss at: https://locutus.io/php/floatval/
	// original by: Michael White (https://getsprink.com)
	//      note 1: The native parseFloat() method of JavaScript returns NaN
	//      note 1: when it encounters a string before an int or float value.
	//   example 1: floatval('150.03_page-section')
	//   returns 1: 150.03
	//   example 2: floatval('page: 3')
	//   example 2: floatval('-50 + 8')
	//   returns 2: 0
	//   returns 2: -50
	return (parseFloat(mixedVar) || 0)
}
phpjed.gettype = function(mixedVar) {
	//  discuss at: https://locutus.io/php/gettype/
	// original by: Paulo Freitas
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Douglas Crockford (https://javascript.crockford.com)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: KELAN
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: gettype(1)
	//   returns 1: 'integer'
	//   example 2: gettype(undefined)
	//   returns 2: 'undefined'
	//   example 3: gettype({0: 'Kevin van Zonneveld'})
	//   returns 3: 'object'
	//   example 4: gettype('foo')
	//   returns 4: 'string'
	//   example 5: gettype({0: function () {return false;}})
	//   returns 5: 'object'
	//   example 6: gettype({0: 'test', length: 1, splice: function () {}})
	//   returns 6: 'object'
	//   example 7: gettype(['test'])
	//   returns 7: 'array'
	const isFloat = phpjed.is_float
	let s = typeof mixedVar
	let name
	const _getFuncName = function(fn) {
		const name = (/\W*function\s+([\w$]+)\s*\(/).exec(fn)
		if (!name) {
			return '(Anonymous)'
		}
		return name[1]
	}
	if (s === 'object') {
		if (mixedVar !== null) {
			// From: https://javascript.crockford.com/remedial.html
			// @todo: Break up this lengthy if statement
			if (typeof mixedVar.length === 'number' && !(mixedVar.propertyIsEnumerable(
					'length')) && typeof mixedVar.splice === 'function') {
				s = 'array'
			} else if (mixedVar.constructor && _getFuncName(mixedVar.constructor)) {
				name = _getFuncName(mixedVar.constructor)
				if (name === 'Date') {
					// not in PHP
					s = 'date'
				} else if (name === 'RegExp') {
					// not in PHP
					s = 'regexp'
				} else if (name === 'LOCUTUS_Resource') {
					// Check against our own resource constructor
					s = 'resource'
				}
			}
		} else {
			s = 'null'
		}
	} else if (s === 'number') {
		s = isFloat(mixedVar) ? 'double' : 'integer'
	}
	return s
}
phpjed.intval = function(mixedVar, base) {
	//  discuss at: https://locutus.io/php/intval/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: stensi
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Rafał Kukawski (https://blog.kukawski.pl)
	//    input by: Matteo
	//   example 1: intval('Kevin van Zonneveld')
	//   returns 1: 0
	//   example 2: intval(4.2)
	//   returns 2: 4
	//   example 3: intval(42, 8)
	//   returns 3: 42
	//   example 4: intval('09')
	//   returns 4: 9
	//   example 5: intval('1e', 16)
	//   returns 5: 30
	//   example 6: intval(0x200000001)
	//   returns 6: 8589934593
	//   example 7: intval('0xff', 0)
	//   returns 7: 255
	//   example 8: intval('010', 0)
	//   returns 8: 8
	let tmp, match
	const type = typeof mixedVar
	if (type === 'boolean') {
		return +mixedVar
	} else if (type === 'string') {
		if (base === 0) {
			match = mixedVar.match(/^\s*0(x?)/i)
			base = match ? (match[1] ? 16 : 8) : 10
		}
		tmp = parseInt(mixedVar, base || 10)
		return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp
	} else if (type === 'number' && isFinite(mixedVar)) {
		return mixedVar < 0 ? Math.ceil(mixedVar) : Math.floor(mixedVar)
	} else {
		return 0
	}
}
phpjed.is_array = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_array/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Legaev Andrey
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Nathan Sepulveda
	// improved by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Cord
	// bugfixed by: Manish
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      note 1: In Locutus, javascript objects are like php associative arrays,
	//      note 1: thus JavaScript objects will also
	//      note 1: return true in this function (except for objects which inherit properties,
	//      note 1: being thus used as objects),
	//      note 1: unless you do ini_set('locutus.objectsAsArrays', 0),
	//      note 1: in which case only genuine JavaScript arrays
	//      note 1: will return true
	//   example 1: is_array(['Kevin', 'van', 'Zonneveld'])
	//   returns 1: true
	//   example 2: is_array('Kevin van Zonneveld')
	//   returns 2: false
	//   example 3: is_array({0: 'Kevin', 1: 'van', 2: 'Zonneveld'})
	//   returns 3: true
	//   example 4: ini_set('locutus.objectsAsArrays', 0)
	//   example 4: is_array({0: 'Kevin', 1: 'van', 2: 'Zonneveld'})
	//   returns 4: false
	//   example 5: is_array(function tmp_a (){ this.name = 'Kevin' })
	//   returns 5: false
	const _getFuncName = function(fn) {
		const name = (/\W*function\s+([\w$]+)\s*\(/).exec(fn)
		if (!name) {
			return '(Anonymous)'
		}
		return name[1]
	}
	const _isArray = function(mixedVar) {
		// return Object.prototype.toString.call(mixedVar) === '[object Array]';
		// The above works, but let's do the even more stringent approach:
		// (since Object.prototype.toString could be overridden)
		// Null, Not an object, no length property so couldn't be an Array (or String)
		if (!mixedVar || typeof mixedVar !== 'object' || typeof mixedVar.length !==
			'number') {
			return false
		}
		const len = mixedVar.length
		mixedVar[mixedVar.length] = 'bogus'
		// The only way I can think of to get around this (or where there would be trouble)
		// would be to have an object defined
		// with a custom "length" getter which changed behavior on each call
		// (or a setter to mess up the following below) or a custom
		// setter for numeric properties, but even that would need to listen for
		// specific indexes; but there should be no false negatives
		// and such a false positive would need to rely on later JavaScript
		// innovations like __defineSetter__
		if (len !== mixedVar.length) {
			// We know it's an array since length auto-changed with the addition of a
			// numeric property at its length end, so safely get rid of our bogus element
			mixedVar.length -= 1
			return true
		}
		// Get rid of the property we added onto a non-array object; only possible
		// side-effect is if the user adds back the property later, it will iterate
		// this property in the older order placement in IE (an order which should not
		// be depended on anyways)
		delete mixedVar[mixedVar.length]
		return false
	}
	if (!mixedVar || typeof mixedVar !== 'object') {
		return false
	}
	const isArray = _isArray(mixedVar)
	if (isArray) {
		return true
	}
	const iniVal = phpjed.ini_get('locutus.objectsAsArrays') || 'on'
	if (iniVal === 'on') {
		const asString = Object.prototype.toString.call(mixedVar)
		const asFunc = _getFuncName(mixedVar.constructor)
		if (asString === '[object Object]' && asFunc === 'Object') {
			// Most likely a literal and intended as assoc. array
			return true
		}
	}
	return false
}
phpjed.is_bool = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_bool/
	// original by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: CoursesWeb (https://www.coursesweb.net/)
	//   example 1: is_bool(false)
	//   returns 1: true
	//   example 2: is_bool(0)
	//   returns 2: false
	return (mixedVar === true || mixedVar === false) // Faster (in FF) than type checking
}
phpjed.is_double = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_double/
	// original by: Paulo Freitas
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: is_double(186.31)
	//   returns 1: true
	const _isFloat = phpjed.is_float
	return _isFloat(mixedVar)
}
phpjed.is_float = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_float/
	// original by: Paulo Freitas
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// improved by: WebDevHobo (https://webdevhobo.blogspot.com/)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: is_float(186.31)
	//   returns 1: true
	return +mixedVar === mixedVar && (!isFinite(mixedVar) || !!(mixedVar % 1))
}
phpjed.is_int = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_int/
	// original by: Alex
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: WebDevHobo (https://webdevhobo.blogspot.com/)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	//  revised by: Matt Bradley
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: is_int(23)
	//   returns 1: true
	//   example 2: is_int('23')
	//   returns 2: false
	//   example 3: is_int(23.5)
	//   returns 3: false
	//   example 4: is_int(true)
	//   returns 4: false
	return mixedVar === +mixedVar && isFinite(mixedVar) && !(mixedVar % 1)
}
phpjed.is_integer = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_integer/
	// original by: Paulo Freitas
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: is_integer(186.31)
	//   returns 1: false
	//   example 2: is_integer(12)
	//   returns 2: true
	const _isInt = phpjed.is_int
	return _isInt(mixedVar)
}
phpjed.is_long = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_long/
	// original by: Paulo Freitas
	//      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
	//      note 1: it different from the PHP implementation. We can't fix this unfortunately.
	//   example 1: is_long(186.31)
	//   returns 1: true
	const _isFloat = phpjed.is_float
	return _isFloat(mixedVar)
}
phpjed.is_null = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_null/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: is_null('23')
	//   returns 1: false
	//   example 2: is_null(null)
	//   returns 2: true
	return (mixedVar === null)
}
phpjed.is_numeric = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_numeric/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: David
	// improved by: taith
	// bugfixed by: Tim de Koning
	// bugfixed by: WebDevHobo (https://webdevhobo.blogspot.com/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Denis Chenu (https://shnoulle.net)
	//   example 1: is_numeric(186.31)
	//   returns 1: true
	//   example 2: is_numeric('Kevin van Zonneveld')
	//   returns 2: false
	//   example 3: is_numeric(' +186.31e2')
	//   returns 3: true
	//   example 4: is_numeric('')
	//   returns 4: false
	//   example 5: is_numeric([])
	//   returns 5: false
	//   example 6: is_numeric('1 ')
	//   returns 6: false
	const whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001',
		'\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009',
		'\u200a', '\u200b', '\u2028', '\u2029', '\u3000'
	].join('')
	// @todo: Break this up using many single conditions with early returns
	return (typeof mixedVar === 'number' || (typeof mixedVar === 'string' && whitespace.indexOf(
		mixedVar.slice(-1)) === -1)) && mixedVar !== '' && !isNaN(mixedVar)
}
phpjed.is_object = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_object/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Legaev Andrey
	// improved by: Michael White (https://getsprink.com)
	//   example 1: is_object('23')
	//   returns 1: false
	//   example 2: is_object({foo: 'bar'})
	//   returns 2: true
	//   example 3: is_object(null)
	//   returns 3: false
	if (Object.prototype.toString.call(mixedVar) === '[object Array]') {
		return false
	}
	return mixedVar !== null && typeof mixedVar === 'object'
}
phpjed.is_scalar = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_scalar/
	// original by: Paulo Freitas
	//   example 1: is_scalar(186.31)
	//   returns 1: true
	//   example 2: is_scalar({0: 'Kevin van Zonneveld'})
	//   returns 2: false
	return (/boolean|number|string/).test(typeof mixedVar)
}
phpjed.is_string = function(mixedVar) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/is_string/
	// original by: Kevin van Zonneveld (https://kvz.io)
	//   example 1: is_string('23')
	//   returns 1: true
	//   example 2: is_string(23.5)
	//   returns 2: false
	return (typeof mixedVar === 'string')
}
phpjed.isset = function() {
	//  discuss at: https://locutus.io/php/isset/
	// original by: Kevin van Zonneveld (https://kvz.io)
	// improved by: FremyCompany
	// improved by: Onno Marsman (https://twitter.com/onnomarsman)
	// improved by: Rafał Kukawski (https://blog.kukawski.pl)
	//   example 1: isset( undefined, true)
	//   returns 1: false
	//   example 2: isset( 'Kevin van Zonneveld' )
	//   returns 2: true
	const a = arguments
	const l = a.length
	let i = 0
	let undef
	if (l === 0) {
		throw new Error('Empty isset')
	}
	while (i !== l) {
		if (a[i] === undef || a[i] === null) {
			return false
		}
		i++
	}
	return true
}
phpjed.print_r = function(array, returnVal) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/print_r/
	// original by: Michael White (https://getsprink.com)
	// improved by: Ben Bryan
	// improved by: Brett Zamir (https://brett-zamir.me)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	//    input by: Brett Zamir (https://brett-zamir.me)
	//   example 1: print_r(1, true)
	//   returns 1: '1'
	const echo = phpjed.echo
	let output = ''
	const padChar = ' '
	const padVal = 4
	const _repeatChar = function(len, padChar) {
		let str = ''
		for (let i = 0; i < len; i++) {
			str += padChar
		}
		return str
	}
	var _formatArray = function(obj, curDepth, padVal, padChar) {
		if (curDepth > 0) {
			curDepth++
		}
		const basePad = _repeatChar(padVal * curDepth, padChar)
		const thickPad = _repeatChar(padVal * (curDepth + 1), padChar)
		let str = ''
		if (typeof obj === 'object' && obj !== null && obj.constructor) {
			str += 'Array\n' + basePad + '(\n'
			for (const key in obj) {
				if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
					str += thickPad
					str += '['
					str += key
					str += '] => '
					str += _formatArray(obj[key], curDepth + 1, padVal, padChar)
				} else {
					str += thickPad
					str += '['
					str += key
					str += '] => '
					str += obj[key]
					str += '\n'
				}
			}
			str += basePad + ')\n'
		} else if (obj === null || obj === undefined) {
			str = ''
		} else {
			// for our "resource" class
			str = obj.toString()
		}
		return str
	}
	output = _formatArray(array, 0, padVal, padChar)
	if (returnVal !== true) {
		echo(output)
		return true
	}
	return output
}
phpjed.serialize = function(mixedValue) {
	//  discuss at: https://locutus.io/php/serialize/
	// original by: Arpad Ray (mailto:arpad@php.net)
	// improved by: Dino
	// improved by: Le Torbi (https://www.letorbi.de/)
	// improved by: Kevin van Zonneveld (https://kvz.io/)
	// bugfixed by: Andrej Pavlovic
	// bugfixed by: Garagoth
	// bugfixed by: Russell Walker (https://www.nbill.co.uk/)
	// bugfixed by: Jamie Beck (https://www.terabit.ca/)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io/)
	// bugfixed by: Ben (https://benblume.co.uk/)
	// bugfixed by: Codestar (https://codestarlive.com/)
	// bugfixed by: idjem (https://github.com/idjem)
	//    input by: DtTvB (https://dt.in.th/2008-09-16.string-length-in-bytes.html)
	//    input by: Martin (https://www.erlenwiese.de/)
	//      note 1: We feel the main purpose of this function should be to ease
	//      note 1: the transport of data between php & js
	//      note 1: Aiming for PHP-compatibility, we have to translate objects to arrays
	//   example 1: serialize(['Kevin', 'van', 'Zonneveld'])
	//   returns 1: 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
	//   example 2: serialize({firstName: 'Kevin', midName: 'van'})
	//   returns 2: 'a:2:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";}'
	//   example 3: serialize( {'ü': 'ü', '四': '四', '𠜎': '𠜎'})
	//   returns 3: 'a:3:{s:2:"ü";s:2:"ü";s:3:"四";s:3:"四";s:4:"𠜎";s:4:"𠜎";}'
	let val, key, okey
	let ktype = ''
	let vals = ''
	let count = 0
	const _utf8Size = function(str) {
		return ~-encodeURI(str).split(/%..|./).length
	}
	const _getType = function(inp) {
		let match
		let key
		let cons
		let types
		let type = typeof inp
		if (type === 'object' && !inp) {
			return 'null'
		}
		if (type === 'object') {
			if (!inp.constructor) {
				return 'object'
			}
			cons = inp.constructor.toString()
			match = cons.match(/(\w+)\(/)
			if (match) {
				cons = match[1].toLowerCase()
			}
			types = ['boolean', 'number', 'string', 'array']
			for (key in types) {
				if (cons === types[key]) {
					type = types[key]
					break
				}
			}
		}
		return type
	}
	const type = _getType(mixedValue)
	switch (type) {
		case 'function':
			val = ''
			break
		case 'boolean':
			val = 'b:' + (mixedValue ? '1' : '0')
			break
		case 'number':
			val = (Math.round(mixedValue) === mixedValue ? 'i' : 'd') + ':' + mixedValue
			break
		case 'string':
			val = 's:' + _utf8Size(mixedValue) + ':"' + mixedValue + '"'
			break
		case 'array':
		case 'object':
			val = 'a'
			/*
			if (type === 'object') {
			  var objname = mixedValue.constructor.toString().match(/(\w+)\(\)/);
			  if (objname === undefined) {
			    return;
			  }
			  objname[1] = serialize(objname[1]);
			  val = 'O' + objname[1].substring(1, objname[1].length - 1);
			}
			*/
			for (key in mixedValue) {
				if (mixedValue.hasOwnProperty(key)) {
					ktype = _getType(mixedValue[key])
					if (ktype === 'function') {
						continue
					}
					okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key)
					vals += serialize(okey) + serialize(mixedValue[key])
					count++
				}
			}
			val += ':' + count + ':{' + vals + '}'
			break
		case 'undefined':
		default:
			// Fall-through
			// if the JS object has a property which contains a null value,
			// the string cannot be unserialized by PHP
			val = 'N'
			break
	}
	if (type !== 'object' && type !== 'array') {
		val += ';'
	}
	return val
}
phpjed.strval = function(str) {
	//  discuss at: https://locutus.io/php/strval/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	//   example 1: strval({red: 1, green: 2, blue: 3, white: 4})
	//   returns 1: 'Object'
	const gettype = phpjed.gettype
	let type = ''
	if (str === null) {
		return ''
	}
	type = gettype(str)
	// Comment out the entire switch if you want JS-like
	// behavior instead of PHP behavior
	switch (type) {
		case 'boolean':
			if (str === true) {
				return '1'
			}
			return ''
		case 'array':
			return 'Array'
		case 'object':
			return 'Object'
	}
	return str
}
phpjed.initCache = function() {
	const store = []
	// cache only first element, second is length to jump ahead for the parser
	const cache = function cache(value) {
		store.push(value[0])
		return value
	}
	cache.get = (index) => {
		if (index >= store.length) {
			throw RangeError(`Can't resolve reference ${index + 1}`)
		}
		return store[index]
	}
	return cache
}
phpjed.expectType = function(str, cache) {
	const types = /^(?:N(?=;)|[bidsSaOCrR](?=:)|[^:]+(?=:))/g
	const type = (types.exec(str) || [])[0]
	if (!type) {
		throw SyntaxError('Invalid input: ' + str)
	}
	switch (type) {
		case 'N':
			return cache([null, 2])
		case 'b':
			return cache(phpjed.expectBool(str))
		case 'i':
			return cache(phpjed.expectInt(str))
		case 'd':
			return cache(phpjed.expectFloat(str))
		case 's':
			return cache(phpjed.expectString(str))
		case 'S':
			return cache(phpjed.expectEscapedString(str))
		case 'a':
			return phpjed.expectArray(str, cache)
		case 'O':
			return phpjed.expectObject(str, cache)
		case 'C':
			return phpjed.expectClass(str, cache)
		case 'r':
		case 'R':
			return phpjed.expectReference(str, cache)
		default:
			throw SyntaxError(`Invalid or unsupported data type: ${type}`)
	}
}
phpjed.expectBool = function(str) {
	const reBool = /^b:([01]);/
	const [match, boolMatch] = reBool.exec(str) || []
	if (!boolMatch) {
		throw SyntaxError('Invalid bool value, expected 0 or 1')
	}
	return [boolMatch === '1', match.length]
}
phpjed.expectInt = function(str) {
	const reInt = /^i:([+-]?\d+);/
	const [match, intMatch] = reInt.exec(str) || []
	if (!intMatch) {
		throw SyntaxError('Expected an integer value')
	}
	return [parseInt(intMatch, 10), match.length]
}
phpjed.expectFloat = function(str) {
	const reFloat = /^d:(NAN|-?INF|(?:\d+\.\d*|\d*\.\d+|\d+)(?:[eE][+-]\d+)?);/
	const [match, floatMatch] = reFloat.exec(str) || []
	if (!floatMatch) {
		throw SyntaxError('Expected a float value')
	}
	let floatValue
	switch (floatMatch) {
		case 'NAN':
			floatValue = Number.NaN
			break
		case '-INF':
			floatValue = Number.NEGATIVE_INFINITY
			break
		case 'INF':
			floatValue = Number.POSITIVE_INFINITY
			break
		default:
			floatValue = parseFloat(floatMatch)
			break
	}
	return [floatValue, match.length]
}
phpjed.readBytes = function(str, len, escapedString = false) {
	let bytes = 0
	let out = ''
	let c = 0
	const strLen = str.length
	let wasHighSurrogate = false
	let escapedChars = 0
	while (bytes < len && c < strLen) {
		let chr = str.charAt(c)
		const code = chr.charCodeAt(0)
		const isHighSurrogate = code >= 0xd800 && code <= 0xdbff
		const isLowSurrogate = code >= 0xdc00 && code <= 0xdfff
		if (escapedString && chr === '\\') {
			chr = String.fromCharCode(parseInt(str.substr(c + 1, 2), 16))
			escapedChars++
			// each escaped sequence is 3 characters. Go 2 chars ahead.
			// third character will be jumped over a few lines later
			c += 2
		}
		c++
		bytes += isHighSurrogate || (isLowSurrogate && wasHighSurrogate)
			// if high surrogate, count 2 bytes, as expectation is to be followed by low surrogate
			// if low surrogate preceded by high surrogate, add 2 bytes
			? 2 : code > 0x7ff
			// otherwise low surrogate falls into this part
			? 3 : code > 0x7f ? 2 : 1
		// if high surrogate is not followed by low surrogate, add 1 more byte
		bytes += wasHighSurrogate && !isLowSurrogate ? 1 : 0
		out += chr
		wasHighSurrogate = isHighSurrogate
	}
	return [out, bytes, escapedChars]
}
phpjed.expectString = function(str) {
	// PHP strings consist of one-byte characters.
	// JS uses 2 bytes with possible surrogate pairs.
	// Serialized length of 2 is still 1 JS string character
	const reStrLength = /^s:(\d+):"/g // also match the opening " char
	const [match, byteLenMatch] = reStrLength.exec(str) || []
	if (!match) {
		throw SyntaxError('Expected a string value')
	}
	const len = parseInt(byteLenMatch, 10)
	str = str.substr(match.length)
	const [strMatch, bytes] = phpjed.readBytes(str, len)
	if (bytes !== len) {
		throw SyntaxError(`Expected string of ${len} bytes, but got ${bytes}`)
	}
	str = str.substr(strMatch.length)
	// strict parsing, match closing "; chars
	if (!str.startsWith('";')) {
		throw SyntaxError('Expected ";')
	}
	return [strMatch, match.length + strMatch.length + 2] // skip last ";
}
phpjed.expectEscapedString = function(str) {
	const reStrLength = /^S:(\d+):"/g // also match the opening " char
	const [match, strLenMatch] = reStrLength.exec(str) || []
	if (!match) {
		throw SyntaxError('Expected an escaped string value')
	}
	const len = parseInt(strLenMatch, 10)
	str = str.substr(match.length)
	const [strMatch, bytes, escapedChars] = phpjed.readBytes(str, len, true)
	if (bytes !== len) {
		throw SyntaxError(`Expected escaped string of ${len} bytes, but got ${bytes}`)
	}
	str = str.substr(strMatch.length + escapedChars * 2)
	// strict parsing, match closing "; chars
	if (!str.startsWith('";')) {
		throw SyntaxError('Expected ";')
	}
	return [strMatch, match.length + strMatch.length + 2] // skip last ";
}
phpjed.expectKeyOrIndex = function(str) {
	try {
		return phpjed.expectString(str)
	} catch (err) {}
	try {
		return phpjed.expectEscapedString(str)
	} catch (err) {}
	try {
		return phpjed.expectInt(str)
	} catch (err) {
		throw SyntaxError('Expected key or index')
	}
}
phpjed.expectObject = function(str, cache) {
	// O:<class name length>:"class name":<prop count>:{<props and values>}
	// O:8:"stdClass":2:{s:3:"foo";s:3:"bar";s:3:"bar";s:3:"baz";}
	const reObjectLiteral = /^O:(\d+):"([^"]+)":(\d+):\{/
	const [objectLiteralBeginMatch, /* classNameLengthMatch */ , className, propCountMatch] =
	reObjectLiteral.exec(str) || []
	if (!objectLiteralBeginMatch) {
		throw SyntaxError('Invalid input')
	}
	if (className !== 'stdClass') {
		throw SyntaxError(`Unsupported object type: ${className}`)
	}
	let totalOffset = objectLiteralBeginMatch.length
	const propCount = parseInt(propCountMatch, 10)
	const obj = {}
	cache([obj])
	str = str.substr(totalOffset)
	for (let i = 0; i < propCount; i++) {
		const prop = phpjed.expectKeyOrIndex(str)
		str = str.substr(prop[1])
		totalOffset += prop[1]
		const value = phpjed.expectType(str, cache)
		str = str.substr(value[1])
		totalOffset += value[1]
		obj[prop[0]] = value[0]
	}
	// strict parsing, expect } after object literal
	if (str.charAt(0) !== '}') {
		throw SyntaxError('Expected }')
	}
	return [obj, totalOffset + 1] // skip final }
}
phpjed.expectClass = function(str, cache) {
	// can't be well supported, because requires calling eval (or similar)
	// in order to call serialized constructor name
	// which is unsafe
	// or assume that constructor is defined in global scope
	// but this is too much limiting
	throw Error('Not yet implemented')
}
phpjed.expectReference = function(str, cache) {
	const reRef = /^[rR]:([1-9]\d*);/
	const [match, refIndex] = reRef.exec(str) || []
	if (!match) {
		throw SyntaxError('Expected reference value')
	}
	return [cache.get(parseInt(refIndex, 10) - 1), match.length]
}
phpjed.expectArray = function(str, cache) {
	const reArrayLength = /^a:(\d+):{/
	const [arrayLiteralBeginMatch, arrayLengthMatch] = reArrayLength.exec(str) || []
	if (!arrayLengthMatch) {
		throw SyntaxError('Expected array length annotation')
	}
	str = str.substr(arrayLiteralBeginMatch.length)
	const array = phpjed.expectArrayItems(str, parseInt(arrayLengthMatch, 10), cache)
	// strict parsing, expect closing } brace after array literal
	if (str.charAt(array[1]) !== '}') {
		throw SyntaxError('Expected }')
	}
	return [array[0], arrayLiteralBeginMatch.length + array[1] + 1] // jump over }
}
phpjed.expectArrayItems = function(str, expectedItems = 0, cache) {
	let key
	let hasStringKeys = false
	let item
	let totalOffset = 0
	let items = []
	cache([items])
	for (let i = 0; i < expectedItems; i++) {
		key = phpjed.expectKeyOrIndex(str)
		// this is for backward compatibility with previous implementation
		if (!hasStringKeys) {
			hasStringKeys = (typeof key[0] === 'string')
		}
		str = str.substr(key[1])
		totalOffset += key[1]
		// references are resolved immediately, so if duplicate key overwrites previous array index
		// the old value is anyway resolved
		// fixme: but next time the same reference should point to the new value
		item = phpjed.expectType(str, cache)
		str = str.substr(item[1])
		totalOffset += item[1]
		items[key[0]] = item[0]
	}
	// this is for backward compatibility with previous implementation
	if (hasStringKeys) {
		items = Object.assign({}, items)
	}
	return [items, totalOffset]
}
phpjed.unserialize = function(str) {
	//       discuss at: https://locutus.io/php/unserialize/
	//      original by: Arpad Ray (mailto:arpad@php.net)
	//      improved by: Pedro Tainha (https://www.pedrotainha.com)
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Kevin van Zonneveld (https://kvz.io)
	//      improved by: Chris
	//      improved by: James
	//      improved by: Le Torbi
	//      improved by: Eli Skeggs
	//      bugfixed by: dptr1988
	//      bugfixed by: Kevin van Zonneveld (https://kvz.io)
	//      bugfixed by: Brett Zamir (https://brett-zamir.me)
	//      bugfixed by: philippsimon (https://github.com/philippsimon/)
	//       revised by: d3x
	//         input by: Brett Zamir (https://brett-zamir.me)
	//         input by: Martin (https://www.erlenwiese.de/)
	//         input by: kilops
	//         input by: Jaroslaw Czarniak
	//         input by: lovasoa (https://github.com/lovasoa/)
	//      improved by: Rafał Kukawski
	// reimplemented by: Rafał Kukawski
	//           note 1: We feel the main purpose of this function should be
	//           note 1: to ease the transport of data between php & js
	//           note 1: Aiming for PHP-compatibility, we have to translate objects to arrays
	//        example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}')
	//        returns 1: ['Kevin', 'van', 'Zonneveld']
	//        example 2: unserialize('a:2:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";}')
	//        returns 2: {firstName: 'Kevin', midName: 'van'}
	//        example 3: unserialize('a:3:{s:2:"ü";s:2:"ü";s:3:"四";s:3:"四";s:4:"𠜎";s:4:"𠜎";}')
	//        returns 3: {'ü': 'ü', '四': '四', '𠜎': '𠜎'}
	//        example 4: unserialize(undefined)
	//        returns 4: false
	//        example 5: unserialize('O:8:"stdClass":1:{s:3:"foo";b:1;}')
	//        returns 5: { foo: true }
	//        example 6: unserialize('a:2:{i:0;N;i:1;s:0:"";}')
	//        returns 6: [null, ""]
	//        example 7: unserialize('S:7:"\\65\\73\\63\\61\\70\\65\\64";')
	//        returns 7: 'escaped'
	try {
		if (typeof str !== 'string') {
			return false
		}
		return phpjed.expectType(str, phpjed.initCache())[0]
	} catch (err) {
		console.error(err)
		return false
	}
}
phpjed.var_dump = function() { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/var_dump/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Zahlii
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: For returning a string, use var_export() with the second argument set to true
	//        test: skip-all
	//   example 1: var_dump(1)
	//   returns 1: 'int(1)'
	const echo = phpjed.echo
	let output = ''
	const padChar = ' '
	const padVal = 4
	let lgth = 0
	let i = 0
	const _getFuncName = function(fn) {
		const name = (/\W*function\s+([\w$]+)\s*\(/).exec(fn)
		if (!name) {
			return '(Anonymous)'
		}
		return name[1]
	}
	const _repeatChar = function(len, padChar) {
		let str = ''
		for (let i = 0; i < len; i++) {
			str += padChar
		}
		return str
	}
	const _getInnerVal = function(val, thickPad) {
		let ret = ''
		if (val === null) {
			ret = 'NULL'
		} else if (typeof val === 'boolean') {
			ret = 'bool(' + val + ')'
		} else if (typeof val === 'string') {
			ret = 'string(' + val.length + ') "' + val + '"'
		} else if (typeof val === 'number') {
			if (parseFloat(val) === parseInt(val, 10)) {
				ret = 'int(' + val + ')'
			} else {
				ret = 'float(' + val + ')'
			}
		} else if (typeof val === 'undefined') {
			// The remaining are not PHP behavior because these values
			// only exist in this exact form in JavaScript
			ret = 'undefined'
		} else if (typeof val === 'function') {
			const funcLines = val.toString().split('\n')
			ret = ''
			for (let i = 0, fll = funcLines.length; i < fll; i++) {
				ret += (i !== 0 ? '\n' + thickPad : '') + funcLines[i]
			}
		} else if (val instanceof Date) {
			ret = 'Date(' + val + ')'
		} else if (val instanceof RegExp) {
			ret = 'RegExp(' + val + ')'
		} else if (val.nodeName) {
			// Different than PHP's DOMElement
			switch (val.nodeType) {
				case 1:
					if (typeof val.namespaceURI === 'undefined' || val.namespaceURI ===
						'https://www.w3.org/1999/xhtml') {
						// Undefined namespace could be plain XML, but namespaceURI not widely supported
						ret = 'HTMLElement("' + val.nodeName + '")'
					} else {
						ret = 'XML Element("' + val.nodeName + '")'
					}
					break
				case 2:
					ret = 'ATTRIBUTE_NODE(' + val.nodeName + ')'
					break
				case 3:
					ret = 'TEXT_NODE(' + val.nodeValue + ')'
					break
				case 4:
					ret = 'CDATA_SECTION_NODE(' + val.nodeValue + ')'
					break
				case 5:
					ret = 'ENTITY_REFERENCE_NODE'
					break
				case 6:
					ret = 'ENTITY_NODE'
					break
				case 7:
					ret = 'PROCESSING_INSTRUCTION_NODE(' + val.nodeName + ':' + val
						.nodeValue + ')'
					break
				case 8:
					ret = 'COMMENT_NODE(' + val.nodeValue + ')'
					break
				case 9:
					ret = 'DOCUMENT_NODE'
					break
				case 10:
					ret = 'DOCUMENT_TYPE_NODE'
					break
				case 11:
					ret = 'DOCUMENT_FRAGMENT_NODE'
					break
				case 12:
					ret = 'NOTATION_NODE'
					break
			}
		}
		return ret
	}
	var _formatArray = function(obj, curDepth, padVal, padChar) {
		if (curDepth > 0) {
			curDepth++
		}
		const basePad = _repeatChar(padVal * (curDepth - 1), padChar)
		const thickPad = _repeatChar(padVal * (curDepth + 1), padChar)
		let str = ''
		let val = ''
		if (typeof obj === 'object' && obj !== null) {
			if (obj.constructor && _getFuncName(obj.constructor) === 'LOCUTUS_Resource') {
				return obj.var_dump()
			}
			lgth = 0
			for (const someProp in obj) {
				if (obj.hasOwnProperty(someProp)) {
					lgth++
				}
			}
			str += 'array(' + lgth + ') {\n'
			for (const key in obj) {
				const objVal = obj[key]
				if (typeof objVal === 'object' && objVal !== null && !(
						objVal instanceof Date) && !(objVal instanceof RegExp) && !objVal
					.nodeName) {
					str += thickPad
					str += '['
					str += key
					str += '] =>\n'
					str += thickPad
					str += _formatArray(objVal, curDepth + 1, padVal, padChar)
				} else {
					val = _getInnerVal(objVal, thickPad)
					str += thickPad
					str += '['
					str += key
					str += '] =>\n'
					str += thickPad
					str += val
					str += '\n'
				}
			}
			str += basePad + '}\n'
		} else {
			str = _getInnerVal(obj, thickPad)
		}
		return str
	}
	output = _formatArray(arguments[0], 0, padVal, padChar)
	for (i = 1; i < arguments.length; i++) {
		output += '\n' + _formatArray(arguments[i], 0, padVal, padChar)
	}
	echo(output)
	// Not how PHP does it, but helps us test:
	return output
}
phpjed.var_export = function(mixedExpression, boolReturn) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/var_export/
	// original by: Philip Peterson
	// improved by: johnrembo
	// improved by: Brett Zamir (https://brett-zamir.me)
	//    input by: Brian Tafoya (https://www.premasolutions.com/)
	//    input by: Hans Henrik (https://hanshenrik.tk/)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: Brett Zamir (https://brett-zamir.me)
	// bugfixed by: simivar (https://github.com/simivar)
	// bugfixed by: simivar (https://github.com/simivar)
	// bugfixed by: simivar (https://github.com/simivar)
	//   example 1: var_export(null)
	//   returns 1: null
	//   example 2: var_export({0: 'Kevin', 1: 'van', 2: 'Zonneveld'}, true)
	//   returns 2: "array (\n  0 => 'Kevin',\n  1 => 'van',\n  2 => 'Zonneveld',\n)"
	//   example 3: var data = 'Kevin'
	//   example 3: var_export(data, true)
	//   returns 3: "'Kevin'"
	//   example 4: var_export({0: 'Kevin', 1: 'van', 'lastName': 'Zonneveld'}, true)
	//   returns 4: "array (\n  0 => 'Kevin',\n  1 => 'van',\n  'lastName' => 'Zonneveld',\n)"
	//   example 5: var_export([], true)
	//   returns 5: "array (\n)"
	//   example 6: var_export({ test: [ 'a', 'b' ] }, true)
	//   returns 6: "array (\n  'test' =>\n  array (\n    0 => 'a',\n    1 => 'b',\n  ),\n)"
	const echo = phpjed.echo
	let retstr = ''
	let iret = ''
	let value
	let cnt = 0
	const x = []
	let i = 0
	let funcParts = []
	// We use the last argument (not part of PHP) to pass in
	// our indentation level
	const idtLevel = arguments[2] || 2
	let innerIndent = ''
	let outerIndent = ''
	const getFuncName = function(fn) {
		const name = (/\W*function\s+([\w$]+)\s*\(/).exec(fn)
		if (!name) {
			return '(Anonymous)'
		}
		return name[1]
	}
	const _isNormalInteger = function(string) {
		const number = Math.floor(Number(string))
		return number !== Infinity && String(number) === string && number >= 0
	}
	const _makeIndent = function(idtLevel) {
		return (new Array(idtLevel + 1)).join(' ')
	}
	const __getType = function(inp) {
		let i = 0
		let match
		let types
		let cons
		let type = typeof inp
		if (type === 'object' && (inp && inp.constructor) && getFuncName(inp
			.constructor) === 'LOCUTUS_Resource') {
			return 'resource'
		}
		if (type === 'function') {
			return 'function'
		}
		if (type === 'object' && !inp) {
			// Should this be just null?
			return 'null'
		}
		if (type === 'object') {
			if (!inp.constructor) {
				return 'object'
			}
			cons = inp.constructor.toString()
			match = cons.match(/(\w+)\(/)
			if (match) {
				cons = match[1].toLowerCase()
			}
			types = ['boolean', 'number', 'string', 'array']
			for (i = 0; i < types.length; i++) {
				if (cons === types[i]) {
					type = types[i]
					break
				}
			}
		}
		return type
	}
	const type = __getType(mixedExpression)
	if (type === null) {
		retstr = 'NULL'
	} else if (type === 'array' || type === 'object') {
		outerIndent = _makeIndent(idtLevel - 2)
		innerIndent = _makeIndent(idtLevel)
		for (i in mixedExpression) {
			value = ' '
			const subtype = __getType(mixedExpression[i])
			if (subtype === 'array' || subtype === 'object') {
				value = '\n'
			}
			value += var_export(mixedExpression[i], 1, idtLevel + 2)
			i = _isNormalInteger(i) ? i : `'${i}'`
			x[cnt++] = innerIndent + i + ' =>' + value
		}
		if (x.length > 0) {
			iret = x.join(',\n') + ',\n'
		}
		retstr = outerIndent + 'array (\n' + iret + outerIndent + ')'
	} else if (type === 'function') {
		funcParts = mixedExpression.toString().match(/function .*?\((.*?)\) \{([\s\S]*)\}/)
		// For lambda functions, var_export() outputs such as the following:
		// '\000lambda_1'. Since it will probably not be a common use to
		// expect this (unhelpful) form, we'll use another PHP-exportable
		// construct, create_function() (though dollar signs must be on the
		// variables in JavaScript); if using instead in JavaScript and you
		// are using the namespaced version, note that create_function() will
		// not be available as a global
		retstr = "create_function ('" + funcParts[1] + "', '" + funcParts[2].replace(/'/g,
			"\\'") + "')"
	} else if (type === 'resource') {
		// Resources treated as null for var_export
		retstr = 'NULL'
	} else {
		retstr = typeof mixedExpression !== 'string' ? mixedExpression : "'" + mixedExpression
			.replace(/(["'])/g, '\\$1').replace(/\0/g, '\\0') + "'"
	}
	if (!boolReturn) {
		echo(retstr)
		return null
	}
	return retstr
}
phpjed.xdiff_string_diff = function(oldData, newData, contextLines,
minimal) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/xdiff_string_diff
	// original by: Brett Zamir (https://brett-zamir.me)
	//    based on: Imgen Tata (https://www.myipdf.com/)
	// bugfixed by: Imgen Tata (https://www.myipdf.com/)
	// improved by: Brett Zamir (https://brett-zamir.me)
	//      note 1: The minimal argument is not currently supported
	//   example 1: xdiff_string_diff('', 'Hello world!')
	//   returns 1: '@@ -0,0 +1,1 @@\n+Hello world!'
	// (This code was done by Imgen Tata; I have only reformatted for use in Locutus)
	// See https://en.wikipedia.org/wiki/Diff#Unified_format
	let i = 0
	let j = 0
	let k = 0
	let oriHunkStart
	let newHunkStart
	let oriHunkEnd
	let newHunkEnd
	let oriHunkLineNo
	let newHunkLineNo
	let oriHunkSize
	let newHunkSize
	const MAX_CONTEXT_LINES = Number.POSITIVE_INFINITY // Potential configuration
	const MIN_CONTEXT_LINES = 0
	const DEFAULT_CONTEXT_LINES = 3
	const HEADER_PREFIX = '@@ ' //
	const HEADER_SUFFIX = ' @@'
	const ORIGINAL_INDICATOR = '-'
	const NEW_INDICATOR = '+'
	const RANGE_SEPARATOR = ','
	const CONTEXT_INDICATOR = ' '
	const DELETION_INDICATOR = '-'
	const ADDITION_INDICATOR = '+'
	let oriLines
	let newLines
	const NEW_LINE = '\n'
	const _trim = function(text) {
		if (typeof text !== 'string') {
			throw new Error('String parameter required')
		}
		return text.replace(/(^\s*)|(\s*$)/g, '')
	}
	const _verifyType = function(type) {
		const args = arguments
		const argsLen = arguments.length
		const basicTypes = ['number', 'boolean', 'string', 'function', 'object',
			'undefined']
		let basicType
		let i
		let j
		const typeOfType = typeof type
		if (typeOfType !== 'string' && typeOfType !== 'function') {
			throw new Error('Bad type parameter')
		}
		if (argsLen < 2) {
			throw new Error('Too few arguments')
		}
		if (typeOfType === 'string') {
			type = _trim(type)
			if (type === '') {
				throw new Error('Bad type parameter')
			}
			for (j = 0; j < basicTypes.length; j++) {
				basicType = basicTypes[j]
				if (basicType === type) {
					for (i = 1; i < argsLen; i++) {
						if (typeof args[i] !== type) {
							throw new Error('Bad type')
						}
					}
					return
				}
			}
			throw new Error('Bad type parameter')
		}
		// Not basic type. we need to use instanceof operator
		for (i = 1; i < argsLen; i++) {
			if (!(args[i] instanceof type)) {
				throw new Error('Bad type')
			}
		}
	}
	const _hasValue = function(array, value) {
		let i
		_verifyType(Array, array)
		for (i = 0; i < array.length; i++) {
			if (array[i] === value) {
				return true
			}
		}
		return false
	}
	const _areTypeOf = function(type) {
		const args = arguments
		const argsLen = arguments.length
		const basicTypes = ['number', 'boolean', 'string', 'function', 'object',
			'undefined']
		let basicType
		let i
		let j
		const typeOfType = typeof type
		if (typeOfType !== 'string' && typeOfType !== 'function') {
			throw new Error('Bad type parameter')
		}
		if (argsLen < 2) {
			throw new Error('Too few arguments')
		}
		if (typeOfType === 'string') {
			type = _trim(type)
			if (type === '') {
				return false
			}
			for (j = 0; j < basicTypes.length; j++) {
				basicType = basicTypes[j]
				if (basicType === type) {
					for (i = 1; i < argsLen; i++) {
						if (typeof args[i] !== type) {
							return false
						}
					}
					return true
				}
			}
			throw new Error('Bad type parameter')
		}
		// Not basic type. we need to use instanceof operator
		for (i = 1; i < argsLen; i++) {
			if (!(args[i] instanceof type)) {
				return false
			}
		}
		return true
	}
	const _getInitializedArray = function(arraySize, initValue) {
		const array = []
		let i
		_verifyType('number', arraySize)
		for (i = 0; i < arraySize; i++) {
			array.push(initValue)
		}
		return array
	}
	const _splitIntoLines = function(text) {
		_verifyType('string', text)
		if (text === '') {
			return []
		}
		return text.split('\n')
	}
	const _isEmptyArray = function(obj) {
		return _areTypeOf(Array, obj) && obj.length === 0
	}
	/**
	 * Finds longest common sequence between two sequences
	 * @see {@link https://wordaligned.org/articles/longest-common-subsequence}
	 */
	const _findLongestCommonSequence = function(seq1, seq2, seq1IsInLcs, seq2IsInLcs) {
		if (!_areTypeOf(Array, seq1, seq2)) {
			throw new Error('Array parameters are required')
		}
		// Deal with edge case
		if (_isEmptyArray(seq1) || _isEmptyArray(seq2)) {
			return []
		}
		// Function to calculate lcs lengths
		const lcsLens = function(xs, ys) {
			let i
			let j
			let prev
			const curr = _getInitializedArray(ys.length + 1, 0)
			for (i = 0; i < xs.length; i++) {
				prev = curr.slice(0)
				for (j = 0; j < ys.length; j++) {
					if (xs[i] === ys[j]) {
						curr[j + 1] = prev[j] + 1
					} else {
						curr[j + 1] = Math.max(curr[j], prev[j + 1])
					}
				}
			}
			return curr
		}
		// Function to find lcs and fill in the array to indicate the optimal longest common sequence
		var _findLcs = function(xs, xidx, xIsIn, ys) {
			let i
			let xb
			let xe
			let llB
			let llE
			let pivot
			let max
			let yb
			let ye
			const nx = xs.length
			const ny = ys.length
			if (nx === 0) {
				return []
			}
			if (nx === 1) {
				if (_hasValue(ys, xs[0])) {
					xIsIn[xidx] = true
					return [xs[0]]
				}
				return []
			}
			i = Math.floor(nx / 2)
			xb = xs.slice(0, i)
			xe = xs.slice(i)
			llB = lcsLens(xb, ys)
			llE = lcsLens(xe.slice(0).reverse(), ys.slice(0).reverse())
			pivot = 0
			max = 0
			for (j = 0; j <= ny; j++) {
				if (llB[j] + llE[ny - j] > max) {
					pivot = j
					max = llB[j] + llE[ny - j]
				}
			}
			yb = ys.slice(0, pivot)
			ye = ys.slice(pivot)
			return _findLcs(xb, xidx, xIsIn, yb).concat(_findLcs(xe, xidx + i, xIsIn,
				ye))
		}
		// Fill in seq1IsInLcs to find the optimal longest common subsequence of first sequence
		_findLcs(seq1, 0, seq1IsInLcs, seq2)
		// Fill in seq2IsInLcs to find the optimal longest common subsequence
		// of second sequence and return the result
		return _findLcs(seq2, 0, seq2IsInLcs, seq1)
	}
	// First, check the parameters
	if (_areTypeOf('string', oldData, newData) === false) {
		return false
	}
	if (oldData === newData) {
		return ''
	}
	if (typeof contextLines !== 'number' || contextLines > MAX_CONTEXT_LINES || contextLines <
		MIN_CONTEXT_LINES) {
		contextLines = DEFAULT_CONTEXT_LINES
	}
	oriLines = _splitIntoLines(oldData)
	newLines = _splitIntoLines(newData)
	const oriLen = oriLines.length
	const newLen = newLines.length
	const oriIsInLcs = _getInitializedArray(oriLen, false)
	const newIsInLcs = _getInitializedArray(newLen, false)
	const lcsLen = _findLongestCommonSequence(oriLines, newLines, oriIsInLcs, newIsInLcs).length
	let unidiff = ''
	if (lcsLen === 0) {
		// No common sequence
		unidiff = [
			HEADER_PREFIX,
			ORIGINAL_INDICATOR,
			(oriLen > 0 ? '1' : '0'),
			RANGE_SEPARATOR,
			oriLen, ' ',
			NEW_INDICATOR,
			(newLen > 0 ? '1' : '0'),
			RANGE_SEPARATOR,
			newLen,
			HEADER_SUFFIX
		].join('')
		for (i = 0; i < oriLen; i++) {
			unidiff += NEW_LINE + DELETION_INDICATOR + oriLines[i]
		}
		for (j = 0; j < newLen; j++) {
			unidiff += NEW_LINE + ADDITION_INDICATOR + newLines[j]
		}
		return unidiff
	}
	let leadingContext = []
	let trailingContext = []
	let actualLeadingContext = []
	let actualTrailingContext = []
	// Regularize leading context by the contextLines parameter
	const regularizeLeadingContext = function(context) {
		if (context.length === 0 || contextLines === 0) {
			return []
		}
		const contextStartPos = Math.max(context.length - contextLines, 0)
		return context.slice(contextStartPos)
	}
	// Regularize trailing context by the contextLines parameter
	const regularizeTrailingContext = function(context) {
		if (context.length === 0 || contextLines === 0) {
			return []
		}
		return context.slice(0, Math.min(contextLines, context.length))
	}
	// Skip common lines in the beginning
	while (i < oriLen && oriIsInLcs[i] === true && newIsInLcs[i] === true) {
		leadingContext.push(oriLines[i])
		i++
	}
	j = i
	// The index in the longest common sequence
	k = i
	oriHunkStart = i
	newHunkStart = j
	oriHunkEnd = i
	newHunkEnd = j
	while (i < oriLen || j < newLen) {
		while (i < oriLen && oriIsInLcs[i] === false) {
			i++
		}
		oriHunkEnd = i
		while (j < newLen && newIsInLcs[j] === false) {
			j++
		}
		newHunkEnd = j
		// Find the trailing context
		trailingContext = []
		while (i < oriLen && oriIsInLcs[i] === true && j < newLen && newIsInLcs[j] === true) {
			trailingContext.push(oriLines[i])
			k++
			i++
			j++
		}
		if (k >= lcsLen || // No more in longest common lines
			trailingContext.length >= 2 * contextLines) {
			// Context break found
			if (trailingContext.length < 2 * contextLines) {
				// It must be last block of common lines but not a context break
				trailingContext = []
				// Force break out
				i = oriLen
				j = newLen
				// Update hunk ends to force output to the end
				oriHunkEnd = oriLen
				newHunkEnd = newLen
			}
			// Output the diff hunk
			// Trim the leading and trailing context block
			actualLeadingContext = regularizeLeadingContext(leadingContext)
			actualTrailingContext = regularizeTrailingContext(trailingContext)
			oriHunkStart -= actualLeadingContext.length
			newHunkStart -= actualLeadingContext.length
			oriHunkEnd += actualTrailingContext.length
			newHunkEnd += actualTrailingContext.length
			oriHunkLineNo = oriHunkStart + 1
			newHunkLineNo = newHunkStart + 1
			oriHunkSize = oriHunkEnd - oriHunkStart
			newHunkSize = newHunkEnd - newHunkStart
			// Build header
			unidiff += [
				HEADER_PREFIX,
				ORIGINAL_INDICATOR,
				oriHunkLineNo,
				RANGE_SEPARATOR,
				oriHunkSize, ' ',
				NEW_INDICATOR,
				newHunkLineNo,
				RANGE_SEPARATOR,
				newHunkSize,
				HEADER_SUFFIX,
				NEW_LINE
			].join('')
			// Build the diff hunk content
			while (oriHunkStart < oriHunkEnd || newHunkStart < newHunkEnd) {
				if (oriHunkStart < oriHunkEnd && oriIsInLcs[oriHunkStart] === true &&
					newIsInLcs[newHunkStart] === true) {
					// The context line
					unidiff += CONTEXT_INDICATOR + oriLines[oriHunkStart] + NEW_LINE
					oriHunkStart++
					newHunkStart++
				} else if (oriHunkStart < oriHunkEnd && oriIsInLcs[oriHunkStart] === false) {
					// The deletion line
					unidiff += DELETION_INDICATOR + oriLines[oriHunkStart] + NEW_LINE
					oriHunkStart++
				} else if (newHunkStart < newHunkEnd && newIsInLcs[newHunkStart] === false) {
					// The additional line
					unidiff += ADDITION_INDICATOR + newLines[newHunkStart] + NEW_LINE
					newHunkStart++
				}
			}
			// Update hunk position and leading context
			oriHunkStart = i
			newHunkStart = j
			leadingContext = trailingContext
		}
	}
	// Trim the trailing new line if it exists
	if (unidiff.length > 0 && unidiff.charAt(unidiff.length) === NEW_LINE) {
		unidiff = unidiff.slice(0, -1)
	}
	return unidiff
}
phpjed.xdiff_string_patch = function(originalStr, patch, flags,
errorObj) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/xdiff_string_patch/
	// original by: Brett Zamir (https://brett-zamir.me)
	// improved by: Steven Levithan (stevenlevithan.com)
	//      note 1: The XDIFF_PATCH_IGNORESPACE flag and the error argument are not
	//      note 1: currently supported.
	//      note 2: This has not been tested exhaustively yet.
	//      note 3: The errorObj parameter (optional) if used must be passed in as a
	//      note 3: object. The errors will then be written by reference into it's `value` property
	//   example 1: xdiff_string_patch('', '@@ -0,0 +1,1 @@\n+Hello world!')
	//   returns 1: 'Hello world!'
	// First two functions were adapted from Steven Levithan, also under an MIT license
	// Adapted from XRegExp 1.5.0
	// (c) 2007-2010 Steven Levithan
	// MIT License
	// <https://xregexp.com>
	const _getNativeFlags = function(regex) {
		// Proposed for ES4; included in AS3
		return [
			(regex.global ? 'g' : ''),
			(regex.ignoreCase ? 'i' : ''),
			(regex.multiline ? 'm' : ''),
			(regex.extended ? 'x' : ''),
			(regex.sticky ? 'y' : '')
		].join('')
	}
	const _cbSplit = function(string, sep) {
		// If separator `s` is not a regex, use the native `split`
		if (!(sep instanceof RegExp)) {
			// Had problems to get it to work here using prototype test
			return String.prototype.split.apply(string, arguments)
		}
		const str = String(string)
		const output = []
		let lastLastIndex = 0
		let match
		let lastLength
		const limit = Infinity
		const x = sep._xregexp
		// This is required if not `s.global`, and it avoids needing to set `s.lastIndex` to zero
		// and restore it to its original value when we're done using the regex
		// Brett paring down
		const s = new RegExp(sep.source, _getNativeFlags(sep) + 'g')
		if (x) {
			s._xregexp = {
				source: x.source,
				captureNames: x.captureNames ? x.captureNames.slice(0) : null
			}
		}
		while ((match = s.exec(str))) {
			// Run the altered `exec` (required for `lastIndex` fix, etc.)
			if (s.lastIndex > lastLastIndex) {
				output.push(str.slice(lastLastIndex, match.index))
				if (match.length > 1 && match.index < str.length) {
					Array.prototype.push.apply(output, match.slice(1))
				}
				lastLength = match[0].length
				lastLastIndex = s.lastIndex
				if (output.length >= limit) {
					break
				}
			}
			if (s.lastIndex === match.index) {
				s.lastIndex++
			}
		}
		if (lastLastIndex === str.length) {
			if (!s.test('') || lastLength) {
				output.push('')
			}
		} else {
			output.push(str.slice(lastLastIndex))
		}
		return output.length > limit ? output.slice(0, limit) : output
	}
	let i = 0
	let ll = 0
	let ranges = []
	let lastLinePos = 0
	let firstChar = ''
	const rangeExp = /^@@\s+-(\d+),(\d+)\s+\+(\d+),(\d+)\s+@@$/
	const lineBreaks = /\r?\n/
	const lines = _cbSplit(patch.replace(/(\r?\n)+$/, ''), lineBreaks)
	const origLines = _cbSplit(originalStr, lineBreaks)
	const newStrArr = []
	let linePos = 0
	const errors = ''
	let optTemp = 0 // Both string & integer (constant) input is allowed
	const OPTS = {
		// Unsure of actual PHP values, so better to rely on string
		XDIFF_PATCH_NORMAL: 1,
		XDIFF_PATCH_REVERSE: 2,
		XDIFF_PATCH_IGNORESPACE: 4
	}
	// Input defaulting & sanitation
	if (typeof originalStr !== 'string' || !patch) {
		return false
	}
	if (!flags) {
		flags = 'XDIFF_PATCH_NORMAL'
	}
	if (typeof flags !== 'number') {
		// Allow for a single string or an array of string flags
		flags = [].concat(flags)
		for (i = 0; i < flags.length; i++) {
			// Resolve string input to bitwise e.g. 'XDIFF_PATCH_NORMAL' becomes 1
			if (OPTS[flags[i]]) {
				optTemp = optTemp | OPTS[flags[i]]
			}
		}
		flags = optTemp
	}
	if (flags & OPTS.XDIFF_PATCH_NORMAL) {
		for (i = 0, ll = lines.length; i < ll; i++) {
			ranges = lines[i].match(rangeExp)
			if (ranges) {
				lastLinePos = linePos
				linePos = ranges[1] - 1
				while (lastLinePos < linePos) {
					newStrArr[newStrArr.length] = origLines[lastLinePos++]
				}
				while (lines[++i] && (rangeExp.exec(lines[i])) === null) {
					firstChar = lines[i].charAt(0)
					switch (firstChar) {
						case '-':
							// Skip including that line
							++linePos
							break
						case '+':
							newStrArr[newStrArr.length] = lines[i].slice(1)
							break
						case ' ':
							newStrArr[newStrArr.length] = origLines[linePos++]
							break
						default:
							// Reconcile with returning errrors arg?
							throw new Error('Unrecognized initial character in unidiff line')
					}
				}
				if (lines[i]) {
					i--
				}
			}
		}
		while (linePos > 0 && linePos < origLines.length) {
			newStrArr[newStrArr.length] = origLines[linePos++]
		}
	} else if (flags & OPTS.XDIFF_PATCH_REVERSE) {
		// Only differs from above by a few lines
		for (i = 0, ll = lines.length; i < ll; i++) {
			ranges = lines[i].match(rangeExp)
			if (ranges) {
				lastLinePos = linePos
				linePos = ranges[3] - 1
				while (lastLinePos < linePos) {
					newStrArr[newStrArr.length] = origLines[lastLinePos++]
				}
				while (lines[++i] && (rangeExp.exec(lines[i])) === null) {
					firstChar = lines[i].charAt(0)
					switch (firstChar) {
						case '-':
							newStrArr[newStrArr.length] = lines[i].slice(1)
							break
						case '+':
							// Skip including that line
							++linePos
							break
						case ' ':
							newStrArr[newStrArr.length] = origLines[linePos++]
							break
						default:
							// Reconcile with returning errrors arg?
							throw new Error('Unrecognized initial character in unidiff line')
					}
				}
				if (lines[i]) {
					i--
				}
			}
		}
		while (linePos > 0 && linePos < origLines.length) {
			newStrArr[newStrArr.length] = origLines[linePos++]
		}
	}
	if (errorObj) {
		errorObj.value = errors
	}
	return newStrArr.join('\n')
}
phpjed.utf8_decode = function(strData) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/utf8_decode/
	// original by: Webtoolkit.info (https://www.webtoolkit.info/)
	//    input by: Aman Gupta
	//    input by: Brett Zamir (https://brett-zamir.me)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Norman "zEh" Fuchs
	// bugfixed by: hitwork
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Kevin van Zonneveld (https://kvz.io)
	// bugfixed by: kirilloid
	// bugfixed by: w35l3y (https://www.wesley.eti.br)
	//   example 1: utf8_decode('Kevin van Zonneveld')
	//   returns 1: 'Kevin van Zonneveld'
	const tmpArr = []
	let i = 0
	let c1 = 0
	let seqlen = 0
	strData += ''
	while (i < strData.length) {
		c1 = strData.charCodeAt(i) & 0xFF
		seqlen = 0
		// https://en.wikipedia.org/wiki/UTF-8#Codepage_layout
		if (c1 <= 0xBF) {
			c1 = (c1 & 0x7F)
			seqlen = 1
		} else if (c1 <= 0xDF) {
			c1 = (c1 & 0x1F)
			seqlen = 2
		} else if (c1 <= 0xEF) {
			c1 = (c1 & 0x0F)
			seqlen = 3
		} else {
			c1 = (c1 & 0x07)
			seqlen = 4
		}
		for (let ai = 1; ai < seqlen; ++ai) {
			c1 = ((c1 << 0x06) | (strData.charCodeAt(ai + i) & 0x3F))
		}
		if (seqlen === 4) {
			c1 -= 0x10000
			tmpArr.push(String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF)))
			tmpArr.push(String.fromCharCode(0xDC00 | (c1 & 0x3FF)))
		} else {
			tmpArr.push(String.fromCharCode(c1))
		}
		i += seqlen
	}
	return tmpArr.join('')
}
phpjed.utf8_encode = function(argString) { // eslint-disable-line camelcase
	//  discuss at: https://locutus.io/php/utf8_encode/
	// original by: Webtoolkit.info (https://www.webtoolkit.info/)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: sowberry
	// improved by: Jack
	// improved by: Yves Sucaet
	// improved by: kirilloid
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	// bugfixed by: Ulrich
	// bugfixed by: Rafał Kukawski (https://blog.kukawski.pl)
	// bugfixed by: kirilloid
	//   example 1: utf8_encode('Kevin van Zonneveld')
	//   returns 1: 'Kevin van Zonneveld'
	if (argString === null || typeof argString === 'undefined') {
		return ''
	}
	// .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const string = (argString + '')
	let utftext = ''
	let start
	let end
	let stringl = 0
	start = end = 0
	stringl = string.length
	for (let n = 0; n < stringl; n++) {
		let c1 = string.charCodeAt(n)
		let enc = null
		if (c1 < 128) {
			end++
		} else if (c1 > 127 && c1 < 2048) {
			enc = String.fromCharCode(
				(c1 >> 6) | 192, (c1 & 63) | 128)
		} else if ((c1 & 0xF800) !== 0xD800) {
			enc = String.fromCharCode(
				(c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128)
		} else {
			// surrogate pairs
			if ((c1 & 0xFC00) !== 0xD800) {
				throw new RangeError('Unmatched trail surrogate at ' + n)
			}
			const c2 = string.charCodeAt(++n)
			if ((c2 & 0xFC00) !== 0xDC00) {
				throw new RangeError('Unmatched lead surrogate at ' + (n - 1))
			}
			c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000
			enc = String.fromCharCode(
				(c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 &
				63) | 128)
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.slice(start, end)
			}
			utftext += enc
			start = end = n + 1
		}
	}
	if (end > start) {
		utftext += string.slice(start, stringl)
	}
	return utftext
}
