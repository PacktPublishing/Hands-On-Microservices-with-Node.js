const seneca  = require("seneca");
const service = seneca();

service.add({ math: "sum" }, (msg, next) => {
	next(null, {
		sum : msg.values.reduce((total, value) => (total + value), 0)
	});
});

service.act({ math: "sum", values: [ 1, 2, 3 ] }, (err, msg) => {
	if (err) return console.error(err);

	console.log("sum = %s", msg.sum);
});
