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
		type: 'object',
		strict: false,
		properties: {
			lorem: { type: 'string', $v12: 'truc'	},
			ipsum: { type: 'number'	},
			dolor: { type: 'string'	}
		}
	};

	var custom = {
		v12: function (schema, post) {
		}
	};

	var obj = {
		lorem: 12,
		ipsum: 23,
		dolor: 'sit amet',
		// truc: false,
		lol: false
	};

	// ---------------------------------------------------------------------------

	var r = SchemaInspector.validate(schema, obj);

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