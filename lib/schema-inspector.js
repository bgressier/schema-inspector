/*
 * This module is intended to be executed both on client side and server side.
 * No error should be thrown. (soft error handling)
 */

(function () {
	function _extend(origin, add) {
		if (!add || typeof add !== 'object') {
			return origin;
		}
		var keys = Object.keys(add);
		var i = keys.length;
		while (i--) {
			origin[keys[i]] = add[keys[i]];
		}
		return origin;
	}

	function Inspection(_custom) {
		var _stack = ['@'];

		this._custom = _custom || {};

		this._getDepth = function () {
			return _stack.length;
		};

		this._dumpStack = function () {
			return _stack.map(function (i) {return i.replace(/^\[/g, '\033\034\035\036');})
			.join('.').replace(/\.\033\034\035\036/g, '[');
		};

		this._deeperObject = function (name) {
			_stack.push((/^[a-z$_][a-z0-9$_]*$/i).test(name) ? name : '["' + name + '"]');
			return this;
		};

		this._deeperArray = function (i) {
			_stack.push('[' + i + ']');
			return this;
		};

		this._back = function () {
			_stack.pop();
			return this;
		};
	}
	// Simple types --------------------------------------------------------------
	// If the property is not defined or is not in this list:
	var _typeIs = {
		"string": function (element) {
			return typeof element === 'string';
		},
		"number": function (element) {
			return typeof element === 'number' && !isNaN(element);
		},
		"integer": function (element) {
			return typeof element === 'number' && element % 1 === 0;
		},
		"boolean": function (element) {
			return typeof element === 'boolean';
		},
		"null": function (element) {
			return element === null;
		},
		"date": function (element) {
			return element !== null && typeof element === 'object' && element.constructor === Date;
		},
		"object": function (element) {
			return element !== null && typeof element === 'object' && element.constructor === Object;
		},
		"array": function (element) {
			return element !== null && typeof element === 'object' && element.constructor === Array;
		},
		"any": function (element) {
			return true;
		}
	};

	function _simpleType(type, candidate) {
		type = type in _typeIs ? type : 'any';
		return _typeIs[type](candidate);
	};

	function _realType(candidate) {
		for (var i in _typeIs) {
			if (_simpleType(i, candidate)) {
				return i !== 'any' ? i : (typeof candidate && isNaN(candidate) ? 'NaN': typeof candidate);
			}
		}
	}

	function getIndexes(a, value) {
		var indexes = [];
		var i = a.indexOf(value);

		while (i !== -1) {
			indexes.push(i);
			i = a.indexOf(value, i + 1);
		}
		return indexes;
	}

	// Available formats ---------------------------------------------------------
	var _formats = {
		'void': /^$/,
		'url': /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/,
		'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z?|(-|\+)\d{2}:\d{2})$/,
		'date': /^\d{4}-\d{2}-\d{2}$/,
		'coolDateTime': /^\d{4}(-|\/)\d{2}(-|\/)\d{2}(T| )\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
		'time': /^\d{2}\:\d{2}\:\d{2}$/,
		'color': /^#([0-9a-f])+$/i,
		'email': /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
		'numeric': /^[0-9]+$/,
		'integer': /^\-?[0-9]+$/,
		'decimal': /^\-?[0-9]*\.?[0-9]+$/,
		'alpha': /^[a-z]+$/i,
		'alphaNumeric': /^[a-z0-9]+$/i,
		'alphaDash': /^[a-z0-9_-]+$/i,
		'javascript': /^[a-z_\$][a-z0-9_\$]*$/i
	};

// Validation ------------------------------------------------------------------
	var _validationAttribut = {
		optional: function (schema, candidate) {
			var opt = typeof schema.optional === 'boolean' ? schema.optional : false;

			if (opt === true) {
				return;
			}
			if (typeof candidate === 'undefined') {
				this.report('is missing and not optional');
			}
		},
		type: function (schema, candidate) {
			// return because optional function already handle this case
			if (typeof candidate === 'undefined') {
				return;
			}
			if (typeof schema.type !== 'string' && !(schema.type instanceof Array)) {
				return;
			}
			var typeIsValid = false;
			if (typeof schema.type === 'string') {
				typeIsValid = _simpleType(schema.type, candidate);
				if (!typeIsValid) {
					this.report('must be ' + schema.type + ', but is ' + _realType(candidate));
				}
			}
			else {
				for (var i in schema.type) {
					typeIsValid || (typeIsValid = _simpleType(schema.type[i], candidate));
					if (typeIsValid) {
						break;
					}
				}
				if (!typeIsValid) {
					this.report('must be ' + schema.type.join(' or ') + ', but is ' + _realType(candidate));
				}
			}
		},
		uniqueness: function (schema, candidate) {
			if (typeof schema.uniqueness !== 'boolean' || schema.uniqueness === false
			|| (!Array.isArray(candidate) && typeof candidate !== 'string')) {
				return;
			}
			var reported = [];
			for (var i = 0; i < candidate.length; i++) {
				if (reported.indexOf(candidate[i]) >= 0) {
					continue;
				}
				var indexes = getIndexes(candidate, candidate[i]);
				if (indexes.length > 1) {
					reported.push(candidate[i]);
					this.report('has value [' + candidate[i] + '] more than once at indexes [' + indexes.join(', ') + ']');
				}
			}
		},
		pattern: function (schema, candidate) {
			var self = this;
			var regexs = schema.pattern;
			if (typeof candidate !== 'string') {
				return;
			}
			var matches = false;
			if (!Array.isArray(regexs)) {
				regexs = [regexs];
			}
			regexs.forEach(function (regex) {
				if (typeof regex === 'string' && regex in _formats) {
					regex = _formats[regex];
				}
				if (regex instanceof RegExp) {
					if (regex.test(candidate)) {
						matches = true;
					}
				}
			});
			if (!matches) {
				self.report('must match [' + regexs.join(' or ') + '], but is equal to "' + candidate + '"');
			}
		},
		minLength: function (schema, candidate) {
			if (typeof candidate !== 'string' && !Array.isArray(candidate)) {
				return;
			}
			var minLength = schema.minLength;
			if (typeof minLength !== 'number') {
				return;
			}
			if (candidate.length < minLength) {
				this.report('must be longer than ' + minLength + ' elements, but it has ' + candidate.length);
			}
		},
		maxLength: function (schema, candidate) {
			if (typeof candidate !== 'string' && !Array.isArray(candidate)) {
				return;
			}
			var maxLength = schema.maxLength;
			if (typeof maxLength !== 'number') {
				return;
			}
			if (candidate.length > maxLength) {
				this.report('must be shorter than ' + maxLength + ' elements, but it has ' + candidate.length);
			}
		},
		exactLength: function (schema, candidate) {
			if (typeof candidate !== 'string' && !Array.isArray(candidate)) {
				return;
			}
			var exactLength = schema.exactLength;
			if (typeof exactLength !== 'number') {
				return;
			}
			if (candidate.length !== exactLength) {
				this.report('must have exactly ' + exactLength + ' elements, but it have ' + candidate.length);
			}
		},
		lt: function (schema, candidate) {
			var limit = schema.lt;
			if (typeof candidate !== 'number' || typeof limit !== 'number') {
				return;
			}
			if (candidate >= limit) {
				this.report('must be less than ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		lte: function (schema, candidate) {
			var limit = schema.lte;
			if (typeof candidate !== 'number' || typeof limit !== 'number') {
				return;
			}
			if (candidate > limit) {
				this.report('must be less than or equal to ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		gt: function (schema, candidate) {
			var limit = schema.gt;
			if (typeof candidate !== 'number' || typeof limit !== 'number') {
				return;
			}
			if (candidate <= limit) {
				this.report('must be greater than ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		gte: function (schema, candidate) {
			var limit = schema.gte;
			if (typeof candidate !== 'number' || typeof limit !== 'number') {
				return;
			}
			if (candidate < limit) {
				this.report('must be greater than or equal to ' + limit + ', but is equal to "' + candidate + '"');
			}
		},
		eq: function (schema, candidate) {
			if (typeof candidate !== 'number' && typeof candidate !== 'string') {
				return;
			}
			var limit = schema.eq;
			if (typeof limit !== 'number' && typeof limit !== 'string'
			&& !Array.isArray(limit)) {
				return;
			}
			if (Array.isArray(limit)) {
				for (var i = 0; i < limit.length; i++) {
					if (candidate === limit[i]) {
						return;
					}
				}
				this.report('must be equal to [' + limit.map(function (l) {
					return '"' + l + '"';
				}).join(' or ') + '], but is equal to "' + candidate + '"')
			}
			else {
				if (candidate !== limit) {
					this.report('must be equal to "' + limit + '", but is equal to "' + candidate + '"');
				}
			}
		},
		ne: function (schema, candidate) {
			if (typeof candidate !== 'number' && typeof candidate !== 'string') {
				return;
			}
			var limit = schema.ne;
			if (typeof limit !== 'number' && typeof limit !== 'string'
			&& !Array.isArray(limit)) {
				return;
			}
			if (Array.isArray(limit)) {
				for (var i = 0; i < limit.length; i++) {
					if (candidate === limit[i]) {
						this.report('must not be equal to "' + limit[i] + '"');
						return;
					}
				}
			}
			else {
				if (candidate === limit) {
					this.report('must not be equal to "' + limit + '"');
				}
			}
		},
		someKeys: function (schema, candidat) {
			var _keys = schema.someKeys;
			var valid = _keys.some(function (action) {
				return (action in candidat);
			});
			if (!valid) {
				this.report('must have at least key ' + _keys.map(function (i) {
					return '"' + i + '"';
				}).join(' or '));
			}
		},
		exec: function (schema, candidate) {
			var _report = this.report.bind(this);

			(Array.isArray(schema.exec) ? schema.exec : [schema.exec]).forEach(function (exec) {
				if (typeof exec === 'function') {
					exec(schema, candidate, _report);
				}
			});
		},
		strict: function (schema, candidate) {
			if (schema.strict !== true || !_typeIs.object(candidate)) {
				return;
			}
			var self = this;
			if (typeof schema.properties['*'] === 'undefined') {
				var intruder = Object.keys(candidate).filter(function (key) {
					return (typeof schema.properties[key] === 'undefined');
				});
				if (intruder.length > 0) {
					var msg = 'should not contains ' + (intruder.length > 1 ? 'properties' : 'property') +
						' [' + intruder.map(function (i) { return '"' + i + '"'; }).join(', ') + ']';
					self.report(msg);
				}
			}
		},
		properties: function (schema, candidate) {
			if (!(schema.properties instanceof Object) || !_typeIs.object(candidate)) {
				return;
			}
			var properties = schema.properties;
			if (typeof properties['*'] !== 'undefined') {
				for (var i in candidate) {
					if (i in properties) {
						continue;
					}
					this._deeperObject(i);
					this._validate(properties['*'], candidate[i]);
					this._back();
				}
			}
			for (var i in properties) {
				if (i === '*') {
					continue;
				}
				this._deeperObject(i);
				this._validate(properties[i], candidate[i]);
				this._back();
			}
		},
		items: function (schema, candidate) {
			if (!(schema.items instanceof Object) || !Array.isArray(candidate)) {
				return;
			}
			var items = schema.items;
			var i;
			// If provided schema is an array
			// then call validate for each case
			// else it is an Object
			// then call validate for each key
			if (Array.isArray(items) && Array.isArray(candidate)) {
				var minLength = items.length;
				for (i = 0; i < minLength; i++) {
					this._deeperArray(i);
					this._validate(items[i], candidate[i]);
					this._back();
				}
			}
			else {
				for (i in candidate) {
					this._deeperArray(i);
					this._validate(items, candidate[i]);
					this._back();
				}
			}
		}
	};

	// Validation Class ----------------------------------------------------------
	// inherits from Inspection class (actually we just call Inspection
	// constructor with the new context, because its prototype is empty
	function Validation(_custom) {
		var self = this;
		var _error = [];

		Inspection.prototype.constructor.call(this, _custom);

		this.report = function (message) {
			var newErr = {
					message: this.userError || message || 'is invalid',
					property: this.userAlias
						? (this.userAlias + ' (' + this._dumpStack() + ')')
						: this._dumpStack()
			};
			_error.push(newErr);
			return this;
		};

		this.getResult = function () {
			return {
				error: _error,
				valid: _error.length === 0,
				format: function () {
					if (this.valid === true) {
						return 'Candidate is valid';
					}
					return this.error.map(function (i) {
						return 'Property ' + i.property + ': ' + i.message;
					}).join('\n');
				}
			};
		};
	}

	_extend(Validation.prototype, _validationAttribut);

	// Actually this is a public method, but it is named with a starting '_' in
	// order to avoid confusion with Candidate::validate
	// We call every function in _validateAttribut then in _custom (those provided
	// by user)
	// Do not forget option attribut: We must enter this function even
	// if candidate is undefined (this function has to deal with it)
	Validation.prototype._validate = function (schema, candidate) {
		this.userError = schema.error || null;
		this.userAlias = schema.alias || null;
		for (var i in _validationAttribut) {
			if ((i in schema || i === 'optional') && typeof this[i] === 'function') {
				this[i](schema, candidate);
			}
		}
		for (var i in this._custom) {
			if (i in schema && typeof this._custom[i] === 'function') {
				this._custom[i].call(this, schema, candidate);
			}
		}
		return this;
	};

// Sanitization ----------------------------------------------------------------
	// functions called by _sanitization.type method.
	var _forceType = {
		number: function (post) {
			var n;
			if (typeof post === 'number') {
				return post;
			}
			else if (typeof post === 'string') {
				n = parseFloat(post.replace(/,/g, '.').replace(/ /g, ''));
				if (typeof n === 'number') {
					return n;
				}
			}
			return null;
		},
		integer: function (post) {
			var n;
			if (typeof post === 'number' && post % 1 === 0) {
				return post;
			}
			else if (typeof post === 'string') {
				n = parseInt(post.replace(/ /g, ''), 10);
				if (typeof n === 'number') {
					return n;
				}
			}
			else if (typeof post === 'number') {
				return parseInt(post, 10);
			}
			else if (typeof post === 'boolean') {
				if (post) { return 1; }
				return 0;
			}
			return null;
		},
		string: function (post) {
			if (typeof post === 'boolean' || typeof post === 'number'
			|| Array.isArray(post) || post instanceof Date) {
				return post.toString();
			}
			else if (post instanceof Object) {
				return JSON.stringify(post);
			}
			else if (typeof post === 'string' && post.length) {
				return post;
			}
			return null;
		},
		date: function (post) {
			if (post instanceof Date) {
				return post;
			}
			else {
				var d = new Date(post);
				if (d != 'Invalid Date') {
					return d;
				}
			}
			return null;
		},
		boolean: function (post) {
			if (typeof post === 'undefined') return null;
			if (typeof post === 'string' && post.toLowerCase() === 'false') return false;
			return !!post;
		},
		object: function (post) {
			if (typeof post !== 'string' || _typeIs['object'](post)) {
				return post;
			}
			try {
				return JSON.parse(post);
			}
			catch (e) {
				return null;
			}
		}
	};

	var _applyRules = {
		upper: function (post) {
			return post.toUpperCase();
		},
		lower: function (post) {
			return post.toLowerCase();
		},
		title: function (post) {
			// Fix by seb (replace \w\S* by \S* => exemple : coucou ça va)
			return post.replace(/\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		capitalize: function (post) {
			return post.charAt(0).toUpperCase() + post.substr(1).toLowerCase();;
		},
		trim: function (post) {
			return post.trim();
		}
	};

	// Every function return the future value of each property. Therefore you
	// have to return post even if you do not change its value
	var _sanitizationAttribut = {
			optional: function (schema, post) {
				var opt = typeof schema.optional === 'boolean' ? schema.optional : true;
				if (opt === true) {
					return post;
				}
				if (typeof post !== 'undefined') {
					return post;
				}
				this._report();
				if (schema.def === Date) {
					return new Date();
				}
				return schema.def;
			},
			type: function (schema, post) {
				if (_typeIs['object'](post) || Array.isArray(post)) {
					return post;
				}
				if (typeof schema.type !== 'string' || typeof _forceType[schema.type] !== 'function') {
					return post;
				}
				var n;
				var opt = typeof schema.optional === 'boolean' ? schema.optional : true;
				if (typeof _forceType[schema.type] === 'function') {
					n = _forceType[schema.type](post);
					if ((n === null && !opt) || (!n && isNaN(n)) || (n === null && schema.type === 'string')) {
						n = schema.def;
					}
				}
				else if (!opt) {
					n = schema.def;
				}
				if (n != null && n !== post) {
					this._report();
					return n;
				}
				return post;
			},
			rules: function (schema, post) {
				var rules = schema.rules;
				if (typeof post !== 'string' || (typeof rules !== 'string' && !Array.isArray(rules))) {
					return post;
				}
				var modified = false;
				(Array.isArray(rules) ? rules : [rules]).forEach(function (rule) {
					if (typeof _applyRules[rule] === 'function') {
						post = _applyRules[rule](post);
						modified = true;
					}
				});
				if (modified) {
					this._report();
				}
				return post;
			},
			min: function (schema, post) {
				if (typeof post !== 'number' && typeof post !== 'string') {
					return post;
				}
				if (typeof schema.min !== 'number' && typeof schema.min !== 'string') {
					return post;
				}
				if (post < schema.min) {
					this._report();
					return schema.min;
				}
				return post;
			},
			max: function (schema, post) {
				if (typeof post !== 'number' && typeof post !== 'string') {
					return post;
				}
				if (typeof schema.max !== 'number' && typeof schema.max !== 'string') {
					return post;
				}
				if (post > schema.max) {
					this._report();
					return schema.max;
				}
				return post;
			},
			minLength: function (schema, post) {
				if (typeof post !== 'string') return post;
				var limit = schema.minLength;
				if (typeof limit !== 'number' && typeof post !== 'string' || limit < 0) {
					return post;
				}
				var str = '';
				var gap = limit - post.length;
				if (gap > 0) {
					for (var i = 0; i < gap; i++) {
						str += '-';
					}
					this._report();
					return post + str;
				}
				return post;
			},
			maxLength: function (schema, post) {
				if (typeof post !== 'string') return post;
				var limit = schema.maxLength;
				if (typeof limit !== 'number' && typeof post !== 'string' || limit < 0) {
					return post;
				}
				if (post.length > limit) {
					this._report();
					return post.slice(0, limit);
				}
				return post;
			},
			properties: function (schema, post) {
				if (typeof post !== 'object') {
					return post;
				}
				var properties = schema.properties;
				var tmp;
				if (typeof properties['*'] !== 'undefined') {
					for (var i in post) {
						if (i in properties) {
							continue;
						}
						this._deeperObject(i);
						tmp = this._sanitize(schema.properties['*'], post[i]);
						if (typeof tmp !== 'undefined') {
							post[i]= tmp;
						}
						this._back();
					}
				}
				for (var i in schema.properties) {
					if (i !== '*') {
						this._deeperObject(i);
						tmp = this._sanitize(schema.properties[i], post[i]);
						if (typeof tmp !== 'undefined') {
							post[i]= tmp;
						}
						this._back();
					}
				}
				return post;
			},
			items: function (schema, post) {
				if (!(schema.items instanceof Object) || !(post instanceof Object)) {
					return post;
				}
				if (Array.isArray(schema.items) && Array.isArray(post)) {
					var minLength = schema.items.length < post.length
					? schema.items.length : post.length;
					for (var i = 0; i < minLength; i++) {
						this._deeperArray(i);
						post[i] = this._sanitize(schema.items[i], post[i]);
						this._back();
					}
				}
				else {
					for (var i in post) {
						this._deeperArray(i);
						post[i] = this._sanitize(schema.items, post[i]);
						this._back();
					}
				}
				return post;
			},
			exec: function (schema, post) {
				var self = this;

				var tmp = null;
				(Array.isArray(schema.exec) ? schema.exec : [schema.exec]).forEach(function (exec) {
					if (typeof exec === 'function') {
						tmp = exec(schema, post);
						if (tmp !== post) {
							self._report();
						}
						post = tmp;
					}
				});
				return post;
			}
	};

	// Sanitization Class --------------------------------------------------------
	// inherits from Inspection class (actually we just call Inspection
	// constructor with the new context, because its prototype is empty
	function Sanitization(_custom) {
		var self = this;
		var _reporting = [];

		Inspection.prototype.constructor.call(this);

		this._report = function (message) {
			var newNot = {
					message: message || 'was sanitized',
					property: this.userAlias
						? (this.userAlias + ' (' + this._dumpStack() + ')')
						: this._dumpStack()
			};
			if (!_reporting.some(function (e) { return e.property === newNot.property; })) {
				_reporting.push(newNot);
			}
		};

		this.getReporting = function () {
			return {
				reporting: _reporting,
				format: function () {
					return this.reporting.map(function (i) {
						return 'Property ' + i.property + ' ' + i.message;
					}).join('\n');
				}
			};
		};
	}

	_extend(Sanitization.prototype, _sanitizationAttribut);

	Sanitization.prototype._sanitize = function (schema, post) {
		this.userAlias = schema.alias || null;
		for (var i in _sanitizationAttribut) {
			if ((i in schema || i === 'optional') && typeof this[i] === 'function') {
				post = this[i](schema, post);
			}
		}
		return post;
	};

	// Candidate Class -----------------------------------------------------------
	function Candidate(obj) {
		this.obj = obj;
		this.reporting = {
				sanitization: null,
				validation: null
		};

		var _custom = {
				sanitization: {},
				validation: {},
		};

		this.getSnCustom = function () {
			return _custom.sanitization;
		};

		this.getVdCustom = function () {
			return _custom.validation;
		};

		this.attr = function (type, obj) {
			if (type in _custom) {
				for (var name in obj) {
					_custom[type]['$' + name] = obj[name];
				}
			}
			return this;
		};
	}

	Candidate.prototype.sanitize = function (schema) {
		schema = typeof schema === 'string' ? JSON.parse(schema) : schema;
		var s = new Sanitization(this.getSnCustom());
		s._sanitize(schema, this.obj);
		this.reporting.sanitization = s.getReporting();
		return this;
	};

	Candidate.prototype.validate = function (schema) {
		schema = typeof schema === 'string' ? JSON.parse(schema) : schema;
		var v = new Validation(this.getVdCustom());
		this.reporting.validation = v._validate(schema, this.obj).getResult();
		return this;
	};

/*
TODO: Handler theses fields properly
	uniqueness
	format
	pattern
*/
	// ---------------------------------------------------------------------------

	const INT_MIN = -2147483648;
	const INT_MAX = 2147483647;

	var _rand = {
		int: function (min, max) {
			return min + (0 | Math.random() * (max - min + 1));
		},
		float: function (min, max) {
			return (Math.random() * (max - min) + min);
		},
		bool: function () {
			return (Math.random() > 0.5)
		},
		char: function (min, max) {
			return String.fromCharCode(this.int(min, max));
		},
		fromList: function (list) {
			return list[this.int(0, list.length - 1)];
		}
	};

	var _formatSample = {
		'date-time': function () {
			return new Date().toISOString();
		},
		'date': function () {
			return new Date().toISOString().replace(/T.*$/, '');
		},
		'time': function () {
			return new Date().toLocaleTimeString();
		},
		'color': function (min, max) {
			var s = '#';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('0123456789abcdefABCDEF');
			}
			return s;
		},
		'numeric': function () {
			return '' + _rand.int(0, INT_MAX);
		},
		'integer': function () {
			if (_rand.bool() === true) {
				return '-' + this.numeric();
			}
			return this.numeric();
		},
		'decimal': function () {
			return this.integer() + '.' + this.numeric();
		},
		'alpha': function (min, max) {
			var s = '';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
			}
			return s;
		},
		'alphaNumeric': function (min, max) {
			var s = '';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
			}
			return s;
		},
		'alphaDash': function (min, max) {
			var s = '';
			if (min < 1) {
				min = 1;
			}
			for (var i = 0, l = _rand.int(min, max); i < l; i++) {
				s += _rand.fromList('_-abcdefghijklmnopqrstuvwxyz_-ABCDEFGHIJKLMNOPQRSTUVWXYZ_-0123456789_-');
			}
			return s;
		},
		'javascript': function (min, max) {
			var s = _rand.fromList('_$abcdefghijklmnopqrstuvwxyz_$ABCDEFGHIJKLMNOPQRSTUVWXYZ_$');
			for (var i = 0, l = _rand.int(min, max - 1); i < l; i++) {
				s += _rand.fromList('_$abcdefghijklmnopqrstuvwxyz_$ABCDEFGHIJKLMNOPQRSTUVWXYZ_$0123456789_$');
			}
			return s;
		}
	};

	function _getLimits(schema) {
		var min = INT_MIN;
		var max = INT_MAX;

		if (schema.gte != null) {
			min = schema.gte;
		}
		else if (schema.gt != null) {
			min = schema.gt + 1;
		}
		if (schema.lte != null) {
			max = schema.lte;
		}
		else if (schema.lt != null) {
			max = schema.lt - 1;
		}
		return { min: min, max: max };
	}

	var _typeGenerator = {
		string: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			var s = '';
			var minLength = schema.minLength != null ? schema.minLength : 0;
			var maxLength = schema.maxLength != null ? schema.maxLength : 32;
			if (typeof schema.pattern === 'string' && typeof _formatSample[schema.pattern] === 'function') {
				return _formatSample[schema.pattern](minLength, maxLength);
			}

			var l = schema.exactLength != null
				? schema.exactLength
				: _rand.int(minLength, maxLength);
			for (var i = 0; i < l; i++) {
				s += _rand.char(32, 126);
			}
			return s;
		},
		number: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			var limit = _getLimits(schema);
			var n = _rand.float(limit.min, limit.max);
			if (schema.ne != null) {
				var ne = Array.isArray(schema.ne) ? schema.ne : [schema.ne];
				while (ne.indexOf(n) !== -1) {
					n = _rand.float(limit.min, limit.max);
				}
			}
			return n;
		},
		integer: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			var limit = _getLimits(schema);
			var n = _rand.int(limit.min, limit.max);
			if (schema.ne != null) {
				var ne = Array.isArray(schema.ne) ? schema.ne : [schema.ne];
				while (ne.indexOf(n) !== -1) {
					n = _rand.int(limit.min, limit.max);
				}
			}
			return n;
		},
		boolean: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			return _rand.bool();
		},
		"null": function (schema) {
			return null;
		},
		date: function (schema) {
			if (schema.eq != null) {
				return schema.eq;
			}
			return new Date();
		},
		object: function (schema) {
			var o = {};
			var prop = schema.properties || {};

			for (var key in prop) {
				if (prop[key].optional === true && _rand.bool() === true) {
					continue;
				}
				if (key !== '*') {
					o[key] = this.generate(prop[key]);
				}
				else {
					var rk = '__random_key_';
					var randomKey = rk + 0;
					var n = _rand.int(1, 9);
					for (var i = 1; i <= n; i++) {
						if (!(randomKey in prop)) {
							o[randomKey] = this.generate(prop[key]);
						}
						randomKey = rk + i;
					}
				}
			}
			return o;
		},
		array: function (schema) {
			var self = this;
			var items = schema.items || {};
			var minLength = schema.minLength != null ? schema.minLength : 0;
			var maxLength = schema.maxLength != null ? schema.maxLength : 16;

			if (Array.isArray(items)) {
				var size = items.length;
				if (schema.exactLength != null) {
					size = schema.exactLength;
				}
				else if (size < minLength) {
					size = minLength;
				}
				else if (size > maxLength) {
					size = maxLength;
				}
				var candidate = new Array(size);
				var type = null;
				for (var i = 0; i < size; i++) {
					type = items[i].type || 'any';
					if (Array.isArray(type)) {
						type = type[_rand.int(0, type.length - 1)];
					}
					candidate[i] = self[type](items[i]);
				}
			}
			else {
				var size = schema.exactLength != null
					? schema.exactLength
					: _rand.int(minLength, maxLength);
				var candidate = new Array(size);
				var type = items.type || 'any';
				if (Array.isArray(type)) {
					type = type[_rand.int(0, type.length - 1)];
				}
				for (var i = 0; i < size; i++) {
					candidate[i] = self[type](items);
				}
			}
			return candidate;
		},
		any: function (schema) {
			var fields = Object.keys(_typeGenerator);
			var i = fields[_rand.int(0, fields.length - 2)];
			return this[i](schema);
		}
	};

	// CandidateGenerator Class --------------------------------------------------
	function CandidateGenerator() {
		// Maybe extends Inspection class too ?
	}

	_extend(CandidateGenerator.prototype, _typeGenerator);

	CandidateGenerator.prototype.generate = function (schema) {
		var type = schema.type || 'any';
		if (Array.isArray(type)) {
			type = type[_rand.int(0, type.length - 1)];
		}
		return this[type](schema);
	};

// Exports ---------------------------------------------------------------------
	var SchemaInspector = {};

	// if server-side (node.js) else client-side
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = SchemaInspector;
	}
	else {
		window.SchemaInspector = SchemaInspector;
	}

	SchemaInspector.newObject = function (obj) {
		return new Candidate(obj);
	};

	// These methods are shortcut
	SchemaInspector.sanitize = function (schema, post) {
		return this.newObject(post).sanitize(schema).reporting.sanitization;
	};

	SchemaInspector.validate = function (schema, candidate) {
		return this.newObject(candidate).validate(schema).reporting.validation;
	};

	SchemaInspector.generate = function (schema, n) {
		if (typeof n === 'number') {
			var r = new Array(n);
			for (var i = 0; i < n; i++) {
				r[i] = new CandidateGenerator().generate(schema);
			}
			return r;
		}
		return new CandidateGenerator().generate(schema);
	};
})();