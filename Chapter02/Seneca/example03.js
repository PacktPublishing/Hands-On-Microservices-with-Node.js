const async   = require("async");
const seneca  = require("seneca");
const service = seneca();

service.use("basic");
service.use("entity");
service.use("jsonfile-store", { folder : "data" });

const stack   = service.make$("stack");

stack.load$((err) => {
	if (err) throw err;

	service.add("stack:push,value:*", (msg, next) => {
		stack.make$().save$({ value: msg.value }, (err) => {
			return next(err, { value: msg.value });
		});
	});

	service.add("stack:pop,value:*", (msg, next) => {
		stack.list$({ value: msg.value }, (err, items) => {
			async.each(items, (item, next) => {
				item.remove$(next);
			}, (err) => {
				if (err) return next(err);

				return next(err, { remove: items.length });
			});
		});
	});

	service.add("stack:get", (msg, next) => {
		stack.list$((err, items) => {
			if (err) return next(err);

			return next(null, items.map((item) => (item.value)));
		});
	});

	service.listen(3000);
});
