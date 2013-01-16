var should = require('should');
var si = require('../lib/schema-inspector');

exports.validation = function () {
	suite('schema #1 (Several types of test in the same inspection)', function () {
		var schema = {
			type: 'object',
			properties: {
				name: { type: 'string', minLength: 4, maxLength: 12 },
				age: { type: 'number', gt: 0, lt: 100 },
				id: { type: 'string', exactLength: 8, pattern: /^A.{6}Z$/ },
				stuff: {
					type: 'array',
					minLength: 2,
					maxLength: 8,
					items: {
						type: ['string', 'null', 'number'],
						minLength: 1
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				name: 'NikitaJS',
				age: 20,
				id: 'AbcdefgZ',
				stuff: ['JavaScript', null, 1234]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				name: 'Nik',
				age: 20,
				id: 'Abcdefgb',
				stuff: ['', null, 1234]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.error[0].property.should.equal('@.name');
			result.error[1].property.should.equal('@.id');
			result.error[2].property.should.equal('@.stuff[0]');
		});

		test('candidate #3', function () {
			var candidate = {
				name: 'NikitaJS',
				age: 101,
				id: new Date(),
				stuff: []
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.error[0].property.should.equal('@.age');
			result.error[1].property.should.equal('@.id');
			result.error[2].property.should.equal('@.stuff');
		});

		test('candidate #4', function () {
			var candidate = {
				name: 'NikitaJS loves JavaScript but this string is too long',
				age: 20,
				id: 'aeeeeeeZ',
				stuff: ['JavaScript', {}, []]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(5);
			result.error[0].property.should.equal('@.name');
			result.error[1].property.should.equal('@.id');
			result.error[2].property.should.equal('@.stuff[1]');
			// @.stuff[2] appears twice because it infringes 2 rules
			// 1 - Bad type (array)
			// 2 - Too short length
			result.error[3].property.should.equal('@.stuff[2]');
			result.error[4].property.should.equal('@.stuff[2]');
		});
	}); // suite "schema #1"

	suite('schema #2 (deeply nested object inspection)', function () {
		var schema = {
			type: 'object',
			properties: {
				lorem: {
					type: 'object',
					properties: {
						ipsum: {
							type: 'object',
							properties: {
								dolor: {
									type: 'object',
									properties: {
										sit: {
											type: 'object',
											properties: {
												amet: { type: 'any' }
											}
										}
									}
								}
							}
						}
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: { ipsum: { dolor: { sit: { amet: 'truc' } } } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				lorem: { ipsum: { dolor: { sit: { amet: new Date() } } } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = {
				lorem: { ipsum: { dolor:  {sit: { amet: 1234 } } } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #4', function () {
			var candidate = {
				lorem: { ipsum: { dolor: {sit: { amet: /^regexp$/}}}}
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #5', function () {
			var candidate = {
				lorem: { ipsum: { dolor: { sit: { amet: ['this', 'is', 'an', 'array'] } } } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #5', function () {
			var candidate = {
				lorem: { ipsum: { dolor: { sit: { amet: ['this', 'is', 'an', 'array'] } } } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #6', function () {
			var candidate = {
				lorem: { ipsum: { dolor: { sit: 0 } } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.lorem.ipsum.dolor.sit');
		});

		test('candidate #7', function () {
			var candidate = {
				lorem: { ipsum: { dolor: 0 } }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.lorem.ipsum.dolor');
		});

		test('candidate #8', function () {
			var candidate = {
				lorem: { ipsum: 0 }
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.lorem.ipsum');
		});

	}); // suite "schema #2"

	suite('schema #3 (array inspection with an array of schema)', function () {
		var schema = {
			type: 'object',
			properties: {
				array: {
					type: 'array',
					items: [{
						type: 'object',
						properties: {
							thisIs: { type: 'string' }
						}
					},{
						type: 'number'
					},{
						type: 'object',
						optional: true,
						properties: {
							thisIs: { type: 'date' }
						}
					}]
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				array: [
					{ thisIs: 'aString' },
					1234,
					{ thisIs: new Date()}
				]
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				array: [
					{ thisIs: 'aString' },
					1234,
					{ thisIs: new Date()},
					'This is another key'
				]
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = {
				array: [
					{ thisIs: 'aString' },
					'aString',
					{ thisIs: 1234 }
				]
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@.array[1]');
			result.error[1].property.should.equal('@.array[2].thisIs');
		});

		test('candidate #4', function () {
			var candidate = {
				array: [{}, 1234]
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.array[0].thisIs');
		});

		test('candidate #5', function () {
			var candidate = {
				array: [{ thisIs: 'anotherString' }]
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.array[1]');
		});

	}); // suite "schema #3"

	suite('schema #4 (array inspection with a hash of schema)', function () {
		var schema = {
			type: 'object',
			properties: {
				array: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							thisIs: { type: 'string', minLength: 4, maxLength: 10 }
						}
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				array: [
					{ thisIs: 'first' },
					{ thisIs: 'second' },
					{ thisIs: 'third' }
				]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				array: [
					{ thisIs: 'aString' },
					1234,
					{ thisIs: new Date()}
				]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@.array[1]');
			result.error[1].property.should.equal('@.array[2].thisIs');
		});

		test('candidate #3', function () {
			var candidate = {
				array: [
					{ thisIs: 'first' },
					{},
					{ thisIs: 'third' },
					{},
					{ thisIs: 'fifth' }
				]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@.array[1].thisIs');
			result.error[1].property.should.equal('@.array[3].thisIs');
		});

		test('candidate #4', function () {
			var candidate = {
				array: [
					{ thisIs: 'first but tooooooo long' },
					{ thisIs: 'second' },
					{ thisIs: 'ooh' }
				]
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@.array[0].thisIs');
			result.error[1].property.should.equal('@.array[2].thisIs');
		});

		test('candidate #5', function () {
			var candidate = {
				array: []
			};
			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

	}); // suite "schema #4"

	suite('schema #5 (formats and regular expressions)', function () {
		var schema = {
			type: 'array',
			items: [
				{ type: 'string', pattern: /^\d+$/ },
				{ type: 'string', pattern: /^[a-z]+$/i },
				{ type: 'string', pattern: /^_[a-zA-Z]+_$/ },
				{ type: 'string', pattern: 'email' },
				{ type: 'string', pattern: 'date-time'} ,
				{ type: 'string', pattern: 'decimal' },
				{ type: 'string', pattern: 'color' },
			]
		};

		test('candidate #1', function () {
			var candidate = [
				'1234',
				'abcd',
				'_qwerty_',
				'nikitaJS@pantera.com',
				new Date().toISOString(),
				'3.1459',
				'#123456789ABCDEF0'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = [
				'1234',
				'abcdE',
				'_QWErty_',
				'n@p.fr',
				'2012-01-26T17:00:00Z',
				'.1459',
				'#123456789abcdef0'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = [
				'1234e',
				'abcdE3',
				'_QWErty',
				'n@pfr',
				'2012-01-26T17:00:00',
				'0.1459.',
				'#123456789abcdef0q'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(6);
			result.error[0].property.should.equal('@[0]');
			result.error[1].property.should.equal('@[1]');
			result.error[2].property.should.equal('@[2]');
			result.error[3].property.should.equal('@[3]');
			result.error[4].property.should.equal('@[5]');
			result.error[5].property.should.equal('@[6]');
		});

		test('candidate #4', function () {
			var candidate = [
				'e1234',
				'3abcdE',
				'QWErty_',
				'n@.fr',
				'2012-01-26 17:00:00Z',
				'.0.1459',
				'12'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(7);
			result.error[0].property.should.equal('@[0]');
			result.error[1].property.should.equal('@[1]');
			result.error[2].property.should.equal('@[2]');
			result.error[3].property.should.equal('@[3]');
			result.error[4].property.should.equal('@[4]');
			result.error[5].property.should.equal('@[5]');
		});

		test('candidate #5', function () {
			var candidate = [
				'12e34',
				'abc3dE',
				'_QWE_rty_',
				'ne.fr',
				'2012-01-26Z17:00:00ZT',
				'0,1459',
				'123#123'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(7);
			result.error[0].property.should.equal('@[0]');
			result.error[1].property.should.equal('@[1]');
			result.error[2].property.should.equal('@[2]');
			result.error[3].property.should.equal('@[3]');
			result.error[4].property.should.equal('@[4]');
			result.error[5].property.should.equal('@[5]');
		});

	}); // suite "schema #5"

	suite('schema #5.1 (formats date-time)', function () {
		var schema = {
			type: 'array',
			items: {
				type: 'string',
				pattern: 'date-time'
			}
		};

		test('candidate #1', function () {
			var candidate = [
				'2012-08-08T14:30:09.032+02:00',
				'2012-08-08T14:30:09+02:00',
				'2012-08-08T14:30:09.032Z',
				'2012-08-08T14:30:09Z',
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = [
				'2012-08-08T14:30:09.32+02:00',
	      '2012-08-08T14:30:09+2:00',
        '2012-08-08T14:30:09.032',
        '2012-08-08 14:30:09',
      ];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.error[0].property.should.equal('@[0]');
			result.error[1].property.should.equal('@[1]');
			result.error[2].property.should.equal('@[3]');
		});

	}); // suite "schema #5.1"

	suite('schema #5.2 (array of formats)', function () {
		var schema = {
			type: 'array',
			items: {
				type: 'string',
				pattern: ['date-time', 'color', 'alpha', /^OK / ]
			}
		};

		test('candidat #1', function () {
			var candidate = [
				'2012-08-08T14:30:09.032+02:00',
				'#0f0bcd',
				'NikitaJS',
				'OK something'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);		});

		test('candidat #2', function () {
			var candidate = [
				'2012-08-08T14:30:09.02+02:00',
				'OK#something'
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@[0]');
			result.error[1].property.should.equal('@[1]');
		});

	}); // suite "schema #5.2"

	suite('schema #6 (numbers inspection #1)', function () {
		var schema = {
				type: 'array',
				items: { type: 'integer', gte: 100, lte: 200, ne: 150 }
			};

		test('candidate #1', function () {
			var candidate = [
				100, 200, 125, 175
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = [
				100, 200, 99, 201, 150, 103.3
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(4);
			result.error[0].property.should.equal('@[2]');
			result.error[1].property.should.equal('@[3]');
			result.error[2].property.should.equal('@[4]');
			result.error[3].property.should.equal('@[5]');
		});

	}); // suite "schema #6"

	suite('schema #7 (numbers inspection #2)', function () {
		var schema = {
			type: 'array',
			items: { type: 'integer', gt: 100, lt: 200, ne: [125, 150, 175] }
		};

		test('candidate #1', function () {
			var candidate = [
				101, 199
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = [
				101, 199, 100, 200, 125, 150, 175
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(5);
			result.error[0].property.should.equal('@[2]');
			result.error[1].property.should.equal('@[3]');
			result.error[2].property.should.equal('@[4]');
			result.error[3].property.should.equal('@[5]');
			result.error[4].property.should.equal('@[6]');
		});

	}); // suite "schema #7"

	suite('schema #8 (numbers inspection #3)', function () {
		var schema = {
			type: 'array',
			items: { type: 'number', eq: [100, 125, 150, 200] }
		};

		test('candidate #1', function () {
			var candidate = [100, 125, 150, 200];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = [100, 125, 150, 200, 0, 25, 50];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.error[0].property.should.equal('@[4]');
			result.error[1].property.should.equal('@[5]');
			result.error[2].property.should.equal('@[6]');
		});

	}); // suite "schema #8"

	suite('schema #9 (uniqueness checking [uniquess === true])', function () {
		var schema = {
			type: 'array',
			items: {type: 'any'},
			uniqueness: true
		};

		test('candidate #1', function () {
			var candidate = [123, 234, 345, 456, 567];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = ['123', 123, '256', 256, false, 0, ''];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = [123, 234, 345, 456, 567, 123, 345];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@');
			result.error[1].property.should.equal('@');
		});

		test('candidate #4', function () {
			var candidate = ['123', null, '1234', '12', '123'];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@');
		});

	}); // suite "schema #9"

	suite('schema #10 (uniqueness checking [uniquess === false])', function () {
		var schema = {
			type: 'array',
			items: {type: 'any'},
			uniqueness: false
		};

		test('candidate #1', function () {
			var candidate = [123, 234, 345, 456, 567];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = ['123', 123, '256', 256, false, 0, ''];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = [123, 234, 345, 456, 567, 123, 345];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #4', function () {
			var candidate = ['123', null, '1234', '12', '123'];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

	}); // suite "schema #10"


	suite('schema #11 (uniqueness checking [uniquess is not given])', function () {
		var schema = {
			type: 'array',
			items: {type: 'any'}
		};

		test('candidate #1', function () {
			var candidate = [123, 234, 345, 456, 567];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = ['123', 123, '256', 256, false, 0, ''];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = [123, 234, 345, 456, 567, 123, 345];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #4', function () {
			var candidate = ['123', null, '1234', '12', '123'];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

	}); // suite "schema #11"

	suite('schema #12 (optionnal attribut testing)', function () {
		var schema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				nickname: { type: 'string', optional: false },
				age: { type: 'number', optional: true }
			}
		};

		test('candidate #1', function () {
			var candidate = {
				id: 1111,
				nickname: 'NikitaJS',
				age: 20
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				id: 1111,
				nickname: 'NikitaJS'
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = {
				age: 20
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@.id');
			result.error[1].property.should.equal('@.nickname');
		});

	}); // suite "schema #12"

	suite('schema #13 (field "error" testing)', function () {
		var schema = {
			type: 'object',
			properties: {
				id: {
					type: 'integer',
					gte: 10,
					lte: 20,
					error: 'Property id must be an integer between 10 and 20'
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				id: 15
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				id: 25
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.id');
			result.error[0].message.should.equal(schema.properties.id.error);
		});

		test('candidate #3', function () {
			var candidate = {
				id: 'NikitaJS'
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.id');
			result.error[0].message.should.equal(schema.properties.id.error);
		});

	}); // suite "schema #13"

	suite('schema #14 (field "alias" testing)', function () {
		var schema = {
			type: 'object',
			properties: {
				id: {
					type: 'integer',
					gte: 10,
					lte: 20,
					alias: 'ObjectId'
				},
				array: {
					optional: true,
					type: 'array',
					items: {
						type: 'string',
						alias: 'MyArray'
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				id: 25
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal(schema.properties.id.alias + ' (@.id)');
		});

		test('candidate #2', function () {
			var candidate = {
				id: 0,
				array: ['NikitaJS', 'Atinux', 1234]
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal(schema.properties.id.alias + ' (@.id)');
			result.error[1].property.should.equal(schema.properties.array.items.alias + ' (@.array[2])');
		});

	}); // suite "schema #14"

	suite('schema #15 (globing testing)', function () {
		var schema = {
			type: 'object',
			properties: {
				globString: {
					type: 'object',
					properties: {
						'*': { type: 'string' }
					}
				},
				globInteger: {
					type: 'object',
					properties: {
						'*': { type: 'integer' }
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				globString: {
					lorem: 'ipsum',
					dolor: 'sit amet'
				},
				globInteger: {
					seven: 7,
					seventy: 70,
					sevenHundredSeventySeven: 777
				}
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				globString: {
				},
				globInteger: {
				}
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #3', function () {
			var candidate = {
				globString: {
					lorem: 'ipsum',
					dolor: 77
				},
				globInteger: {
					seven: 7,
					seventy: 'sit amet',
					sevenHundredSeventySeven: 777
				}
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@.globString.dolor');
			result.error[1].property.should.equal('@.globInteger.seventy');
		});

	}); // suite "schema #15"

	suite('schema #16 ("exec" field testing)', function () {
		var schema = {
			type: 'object',
			properties: {
				lorem: {
					type: 'object',
					properties: {
						ipsum: {
							type: 'array',
							items: {
								type: ['string', 'number'],
								exec: function (schema, candidate, report) {
									if (typeof candidate === 'string') {
										if (candidate[0] === '_') {
											report('should not begin with a "_"');
										}
									}
								}
							}
						}
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: {
					ipsum: [
						1234,
						'thisIsAString'
					]
				}
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				lorem: {
					ipsum: [
						1234,
						'thisIsAString',
						'_thisIsAnInvalidString',
						'thisIsAString'
					]
				}
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@.lorem.ipsum[2]');
		});
	}); // suite "schema #16"

	suite('schema #16.1 ("exec" field with an array of function testing)', function () {
		var schema = {
			type: 'array',
			items: {
				type: ['string', 'number', 'date'],
				exec: [
					function (schema, candidat, report) {
						if (typeof candidat === 'number') {
							report('This is a number');
						}
					},
					function (schema, candidat, report) {
						if (typeof candidat === 'string') {
							report('This is a string');
						}
					}
				]
			}
		};

		test('candidate #1', function () {
			var candidate = [
			 	'thisIsAString',
			 	1234,
			 	new Date()
			];

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.error[0].property.should.equal('@[0]');
			result.error[1].property.should.equal('@[1]');
		});

	}); // suite "schema #16.1"

	suite('schema #17 ("someKeys" field)', function () {
		var schema = {
			type: 'object',
			someKeys: ['lorem', 'ipsum', 'dolor', 'sit_amet'],
			properties: {
				'*': { type: 'any' }
			}
		};

		test('candidat #1', function () {
			var candidate = {
				lorem: 12,
				ipsum: 34,
				thisIs: 'anotherKey'
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidat #2', function () {
			var candidate = {
				thisIs: 'anotherKey'
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.error[0].property.should.equal('@');
		});
	}); // suite "schema #17"

	suite('schema #18 ("strict" field)', function () {
		var schema = {
			type: 'object',
			strict: true,
			properties: {
				lorem: { type: 'number '},
				ipsum: { type: 'number '},
				dolor: { type: 'string '}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: 12,
				ipsum: 23,
				dolor: 'sit amet'
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});

		test('candidate #2', function () {
			var candidate = {
				lorem: 12,
				ipsum: 23,
				dolor: 'sit amet',
				'these': false,
				'keys': false,
				'must': false,
				'not': false,
				'be': false,
				'here': false
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			var keys = ['these', 'keys', 'must', 'not', 'be', 'here'].map(function (i) {
				return '"' + i + '"';
			}).join(', ');
			result.format().indexOf(keys).should.not.equal(-1);
		});

		test('candidate #3', function () {
			var candidate = {
				lorem: 12,
				ipsum: 23,
				dolor: 'sit amet',
				'extra': false
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(false);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			var keys = ['extra'].map(function (i) {
				return '"' + i + '"';
			}).join(', ');
			result.format().indexOf(keys).should.not.equal(-1);
		});
	}); // suite "schema #18"

	suite('schema #18.1 ("strict" field, strict=false)', function () {
		var schema = {
			type: 'object',
			strict: false,
			properties: {
				lorem: { type: 'number '},
				ipsum: { type: 'number '},
				dolor: { type: 'string '}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: 12,
				ipsum: 23,
				dolor: 'sit amet',
				extra: true
			};

			var result = si.validate(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('valid').with.equal(true);
			result.should.have.property('error').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
		});
	});
};