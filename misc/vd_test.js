if (typeof require === 'function') {
	var SchemaInspector = require('../');
}

(function (SchemaInspector, $) {

	var display = typeof alert === 'function' ? alert : console.log;

	function format(json) {
		return JSON.stringify(json, null, 2)
		.replace(/\n/g, '<br>')
		.replace(/ /g, '&nbsp;&nbsp;')
		.replace(/("[^"]*"):/g, '<font color="blue">$1</font>:')
		.replace(/:(&nbsp;)+("[^"]*")(,?)/g, ':$1<font color="green">$2</font>$3')
		.replace(/:(&nbsp;)+(\d+)(,?)/g, ':$1<font color="violet">$2</font>$3')
		.replace(/:(&nbsp;)+(true|false|null)(,?)/g, ':$1<font color="red">$2</font>$3')
		.replace(/:(&nbsp;)+(undefined)(,?)/g, ':$1<font color="grey">$2</font>$3');
	}

var schema = {
	type: 'array',
	minLength: 1,
	items: [{
		type: [ 'string', 'object' ],
		properties: {
			merchantId: {
				type: [ 'integer', 'string' ],
				optional: true,
				alias: 'merchant Id'
			},
			id: {
				type: [ 'integer', 'string'],
				optional: true,
				alias: 'id'
			},
			mktpAlias: {
				type: 'string',
				optional: true,
				alias: 'marketplace alias'
			}
		}
	}]
};

var obj = [ '50ffc1baad86e22212000007' ];

	// ---------------------------------------------------------------------------
	var vdr = SchemaInspector.newValidation(schema);

	vdr.validate(obj, function (err, r) {
		console.log(r);
		console.log(r.format());
	});

return setTimeout(function () {}, 2000);
	var r = SchemaInspector.validate(obj);

	var done = function () {
		var html = '<p>'
			+ 'Validation = '
			+ format(r)
			+ '</p>';
		$('div.resultValidation').html(html);
	};

	if ($ !== null) {
		$(done);
	}
	else {
		console.log(r);
		console.log(r.format());
	}
}).call(this, SchemaInspector, typeof jQuery !== 'undefined' ? jQuery : null);