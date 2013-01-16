var should = require('should');
var si = require('../lib/schema-inspector');

exports.sanitization = function () {
	suite('schema #1 (type casting [string])', function () {
		var schema = {
			type: 'array',
			items: { type: 'string' }
		};

		test('candidate #1 | boolean -> string', function () {
			var candidate = [true, false, 'true', 'false'];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			candidate.should.be.eql(['true', 'false', 'true', 'false']);
		});

		test('candidate #2 | number -> string', function () {
			var candidate = [0, 12, 3.14159, -12, -3.14159, '1234', '-1234'];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(5);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			result.reporting[2].property.should.be.equal('@[2]');
			result.reporting[3].property.should.be.equal('@[3]');
			result.reporting[4].property.should.be.equal('@[4]');
			candidate.should.eql(['0', '12', '3.14159', '-12', '-3.14159', '1234', '-1234']);
		});

		test('candidate #3 | date -> string', function () {
			var d = new Date();
			var candidate = [d, d.toString()];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@[0]');
			candidate.should.eql([d.toString(), d.toString()]);
		});

	}); // suite "schema #1"

	suite('schema #2 (type casting [integer])', function () {
		var schema = {
			type: 'array',
			items: { type: 'integer', def: 0 }
		};

		test('candidate #1 | string -> integer', function () {
			var candidate = ['foo', '4', '3', '2', '1', '1 500', '16,2'];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(7);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			result.reporting[2].property.should.be.equal('@[2]');
			result.reporting[3].property.should.be.equal('@[3]');
			result.reporting[4].property.should.be.equal('@[4]');
			result.reporting[5].property.should.be.equal('@[5]');
			result.reporting[6].property.should.be.equal('@[6]');
			candidate.should.be.eql([0, 4, 3, 2, 1, 1500, 16]);
		});

		test('candidate #2 | number -> integer', function () {
			var candidate = [12.25, -12.25, 12.75, -12.75, 0, 12];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(4);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			result.reporting[2].property.should.be.equal('@[2]');
			result.reporting[3].property.should.be.equal('@[3]');
			candidate.should.be.eql([12, -12, 12, -12, 0, 12]);
		});

	}); // suite "schema #2"

	suite('schema #3 (type casting [number])', function () {
		var schema = {
			type: 'array',
			items: { type: 'number', def: 0 }
		};

		test('candidate #1 | string -> number', function () {
			var candidate = ['foo', '-4', '-3.234', '2', '1.234', '14,45'];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(candidate.length);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			result.reporting[2].property.should.be.equal('@[2]');
			result.reporting[3].property.should.be.equal('@[3]');
			result.reporting[4].property.should.be.equal('@[4]');
			candidate.should.be.eql([0, -4, -3.234, 2, 1.234, 14.45]);
		});

	}); // suite "schema #3"

	suite('schema #4 (type casting [boolean])', function () {
		var schema = {
			type: 'array',
			items: { type: 'boolean' }
		};

		test('candidate #1 | number -> boolean', function () {
			var candidate = [0, 12, -12];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			result.reporting[2].property.should.be.equal('@[2]');
			candidate.should.eql([false, true, true]);
		});

		test('candidate #2 | string -> boolean', function () {
			var candidate = ['', '12', 'NikitaJS'];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@[0]');
			result.reporting[1].property.should.be.equal('@[1]');
			result.reporting[2].property.should.be.equal('@[2]');
			candidate.should.eql([false, true, true]);
		});

		test('candidate #3 | null -> boolean', function () {
			var candidate = [null];

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@[0]');
			candidate.should.eql([false]);
		});

	}); // suite "schema #4"

	suite('schema #5 (type casting [object])', function () {
		var schema = {
			type: 'object',
			properties: {
				json: { type: 'object' },
				objt:{ type: 'object' }
			}
		};

		test('candidate #1 | string -> object', function () {
			var obj = { lorem: { ipsum: 'dolor' } };
			var candidate = {
				json: JSON.stringify(obj),
				objt: obj
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.json');
			candidate.json.should.be.an.instanceof(Object);
			candidate.json.should.eql(obj);
			candidate.objt.should.be.an.instanceof(Object);
			candidate.objt.should.eql(obj);
		});

	}); // suite "schema #5"

	suite('schema #6 (deeply nested object sanitization', function () {
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
												amet: { type: 'number' }
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
				lorem: { ipsum: { dolor: { sit: { amet: '1234' } } } }
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.lorem.ipsum.dolor.sit.amet');
		});

		test('candidate #2', function () {
			var candidate = {
				lorem: { ipsum: { dolor: { sit: JSON.stringify({ amet: '1234' }) } } }
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.reporting[0].property.should.be.equal('@.lorem.ipsum.dolor.sit');
			result.reporting[1].property.should.be.equal('@.lorem.ipsum.dolor.sit.amet');
		});

		test('candidate #3', function () {
			var candidate = {
				lorem: { ipsum: { dolor: JSON.stringify({ sit: { amet: '1234' } }) } }
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.reporting[0].property.should.be.equal('@.lorem.ipsum.dolor');
			result.reporting[1].property.should.be.equal('@.lorem.ipsum.dolor.sit.amet');
		});

	}); // suite "schema #6"

	suite('schema #7 (array sanitization with an array of schema)', function () {
		var schema = {
			type: 'object',
			properties: {
				lorem: {
					type: 'object',
					properties: {
						ipsum: {
							type: 'array',
							items: [
								{ type: 'integer' },
								{ type: 'string' },
								{ type: 'integer' }
							]
						}
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: {
					ipsum: ['123', '234', '345']
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.reporting[0].property.should.be.equal('@.lorem.ipsum[0]');
			result.reporting[1].property.should.be.equal('@.lorem.ipsum[2]');
			candidate.should.eql({
				lorem: { ipsum: [123, '234', 345] }
			});
		});

	}); // suite "schema #7"

	suite('schema #8 (array sanitization with an hash of schema)', function () {
		var schema = {
			type: 'object',
			properties: {
				lorem: {
					type: 'object',
					properties: {
						ipsum: {
							type: 'array',
							items: { type: 'integer' }
						}
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: {
					ipsum: ['123', '234', '345']
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@.lorem.ipsum[0]');
			result.reporting[1].property.should.be.equal('@.lorem.ipsum[1]');
			result.reporting[2].property.should.be.equal('@.lorem.ipsum[2]');
			candidate.should.eql({
				lorem: { ipsum: [123, 234, 345] }
			});
		});

	}); // suite "schema #8"

	suite('schema #9 (Creation of a property if it does not exist)', function () {
		var schema = {
			type: 'object',
			properties: {
				hash: {
					type: 'object',
					properties: {
						one: { type: 'integer', optional: false, def: 1 },
						two: { type: 'integer', optional: false, def: 2 },
						three: { type: 'integer', optional: false, def: 3 },
						four: { type: 'integer', optional: false, def: 4 }
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				hash: {
					one: 11,
					two: 22,
					three: 33
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.hash.four');
			candidate.should.eql({
				hash: {
					one: 11,
					two: 22,
					three: 33,
					four: 4
				}
			});
		});

		test('candidate #2', function () {
			var candidate = {
				hash: {
					two: 22,
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@.hash.one');
			result.reporting[1].property.should.be.equal('@.hash.three');
			result.reporting[2].property.should.be.equal('@.hash.four');
			candidate.should.eql({
				hash: {
					one: 1,
					two: 22,
					three: 3,
					four: 4
				}
			});
		});

		test('candidate #3', function () {
			var candidate = {
				hash: {
					four: 44
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@.hash.one');
			result.reporting[1].property.should.be.equal('@.hash.two');
			result.reporting[2].property.should.be.equal('@.hash.three');
			candidate.should.eql({
				hash: {
					one: 1,
					two: 2,
					three: 3,
					four: 44
				}
			});
		});

	}); // suite "schema #9"

	suite('schema #10 (Creation of a property [nested object] if it does not exist)', function () {
		var schema = {
			type: 'object',
			properties: {
				one: {
					optional: false,
					def: {},
					type: 'object',
					properties: {
						two: {
							optional: false,
							def: {},
							type: 'object',
							properties: {
								three: {
									optional: false,
									def: {},
									type: 'object',
									properties: {
										four: {
											optional: false,
											def: 'value',
											type: 'string'
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
				one: {}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@.one.two');
			result.reporting[1].property.should.be.equal('@.one.two.three');
			result.reporting[2].property.should.be.equal('@.one.two.three.four');
			candidate.should.eql({
				one: {
					two: {
						three: {
							four: 'value'
						}
					}
				}
			});
		});

	}); // suite "schema #10"

	suite('schema #10.1 (test of optional: true)', function () {
		var schema = {
			type: 'object',
			properties: {
				lorem: {
					optional: true,
					def: {},
					type: 'object',
					properties: {
						ipsum: { type: 'string', def: 'Nikita', optional: true }
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: {
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.lorem.ipsum');
			candidate.should.eql({
				lorem: {
					ipsum: 'Nikita'
				}
			});
		});

		test('candidate #2', function () {
			var candidate = {
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.reporting[0].property.should.be.equal('@.lorem');
			result.reporting[1].property.should.be.equal('@.lorem.ipsum');
			candidate.should.eql({
				lorem: {
					ipsum: 'Nikita'
				}
			});
		});

	}); // suite "schema 10.1"

	suite('schema #10.2 (test of optional: true, without field type)', function () {
		var schema = {
			type: 'object',
			properties: {
				lorem: {
					optional: true,
					def: {},
					properties: {
						ipsum: { def: 'Nikita', optional: true }
					}
				}
			}
		};

		test('candidate #1', function () {
			var candidate = {
				lorem: {
				}
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
			candidate.should.eql({
				lorem: {
				}
			});
		});

		test('candidate #2', function () {
			var candidate = {
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(0);
			candidate.should.eql({
			});
		});
	}); // suite "schema 10.2"

	suite('schema #11 (hash sanitization with an hash of schema)', function () {
			var schema = {
				type: 'object',
				properties: {
					specifications: {
						type: 'object',
						items: {
							type: 'string',
							items: {
								type: 'string'
							}
						}
					}
				}
			};

			test('candidate #1', function () {
				var candidate = {
					specifications: {
						couleur: ['rouge', 15],
						taille: 180
					}
				};

				var result = si.sanitize(schema, candidate);
				result.should.be.a('object');
				result.should.have.property('reporting').with.be.an.instanceof(Array)
				.and.be.lengthOf(2);
				result.reporting[0].property.should.be.equal('@.specifications[couleur][1]');
				result.reporting[1].property.should.be.equal('@.specifications[taille]');
				candidate.should.eql({
					specifications: {
						couleur: ['rouge', '15'],
						taille: '180'
					}
				});
			});

		}); // suite "schema #11"

	suite('schema #12 (field "alias" testing)', function () {
			var schema = {
				type: 'object',
				properties: {
					id: {
						alias: 'MyID (alias)',
						type: 'integer'
					}
				}
			};

			test('candidate #1', function () {
				var candidate = {
					id: '1234'
				};

				var result = si.sanitize(schema, candidate);
				result.should.be.a('object');
				result.should.have.property('reporting').with.be.an.instanceof(Array)
				.and.be.lengthOf(1);
				result.reporting[0].property.should.be.equal(schema.properties.id.alias + ' (@.id)');
				candidate.should.eql({ id: 1234 });
			});

	}); // suite "schema #12"

	suite('schema #13 (field "rules" testing)', function () {
		var schema = {
			type: 'object',
			properties: {
				stringU: { type: 'string', rules: 'upper' },
				stringL: { type: 'string', rules: 'lower' },
				stringC: { type: 'string', rules: 'capitalize' }
			}
		};
		const STRING = 'cOucou a TouT lE moNDe';

		test('candidat #1', function () {
			var candidate = {
				stringU: STRING,
				stringL: STRING,
				stringC: STRING
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(3);
			result.reporting[0].property.should.be.equal('@.stringU');
			result.reporting[1].property.should.be.equal('@.stringL');
			result.reporting[2].property.should.be.equal('@.stringC');
			candidate.stringU.should.equal(STRING.toUpperCase());
			candidate.stringL.should.equal(STRING.toLowerCase());
			candidate.stringC.should.equal(STRING.charAt(0).toUpperCase() + STRING.substr(1).toLowerCase());
		});
	}); // suite "schema #13"

	suite('schema #14 (field "rules" with an array of string)', function () {
    var schema = {
      type: 'object',
      properties: {
        string: { type: 'string', rules: ['lower', 'upper'] },
        toTrim: { type: 'string', rules: 'trim' },
        complex: { type: 'string', rules: 'trim', minLength: 10 }
      }
    };

		test('candidat #1', function () {
			const STRING = 'cOucou a TouT lE moNDe';
			var candidate = {
				string: STRING
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.string');
			candidate.string.should.equal(STRING.toUpperCase());
		});

		test('candidat #2', function () {
			var STRING = '    Hi! I shall be trimed!    ';
			var candidate = {
				toTrim: STRING
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.toTrim');
			candidate.toTrim.should.equal(STRING.trim());
		});

		// rules have a higher proprity than minLength/maxLength
		//
		test('candidat #3', function () {
			var STRING = '   coucou  ';
			var candidate = {
				complex: STRING
			};

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(1);
			result.reporting[0].property.should.be.equal('@.complex');
			candidate.complex.should.equal(STRING.trim() + '----');
		});
  }); // suite "schema #14"

	suite('schema #15 (field "exec")', function () {
		var schema = {
			type: 'array',
			items: {
				type: 'string',
				exec: function (schema, post) {
					if ((/^nikita$/i).test(post)) {
						return 'Dieu';
					}
					return post;
				}
			}
		};

		test('candidat #1', function () {
			var candidate = 'Hello Nikita is coding! nikita'.split(' ');

			var result = si.sanitize(schema, candidate);
			result.should.be.a('object');
			result.should.have.property('reporting').with.be.an.instanceof(Array)
			.and.be.lengthOf(2);
			result.reporting[0].property.should.be.equal('@[1]');
			result.reporting[1].property.should.be.equal('@[4]');
			candidate[1].should.equal('Dieu');
			candidate[4].should.equal('Dieu');
		});
	}); // suite "schema #15"
};