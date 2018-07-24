let express = require("express");
let body    = require("body-parser");
let route   = express.Router();
let app	    = express();
let stack   = [];

app.use(body.text({ type: "*/*" }));

route.post("/", (req, res, next) => {
	stack.push(req.body);

	return next();
});

route.delete("/", (req, res, next) => {
	stack.pop();

	return next();
});

route.get("/:index", (req, res) => {
	if (req.params.index >= 0 && req.params.index < stack.length) {
		return res.end("" + stack[req.params.index]);
	}
	res.status(404).end();
});

route.use((req, res) => {
	res.send(stack);
});

app.use("/stack", route);
app.listen(3000);
