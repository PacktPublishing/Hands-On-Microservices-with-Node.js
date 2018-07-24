const bodyparser = require("body-parser");
const path       = require("path");
const fs         = require("fs");
const express    = require("express");
const sharp      = require("sharp");
const app        = express();

app.param("image", (req, res, next, image) => {
	if (!image.match(/\.(png|jpg)$/i)) {
		return res.status(req.method == "POST" ? 403 : 404).end();
	}

	req.image     = image;
	req.localpath = path.join(__dirname, "uploads", req.image);

	return next();
});

app.post("/uploads/:image", bodyparser.raw({
	limit : "10mb",
	type  : "image/*"
}), (req, res) => {
	let fd  = fs.createWriteStream(req.localpath, {
		flags    : "w+",
		encoding : "binary"
	});

	fd.end(req.body);

	fd.on("close", () => {
		res.send({ status : "ok", size: req.body.length });
	});
});

app.head("/uploads/:image", (req, res) => {
	fs.access(req.localpath, fs.constants.R_OK , (err) => {
		res.status(err ? 404 : 200).end();
	});
});

app.get("/uploads/:image", (req, res) => {
	fs.access(req.localpath, fs.constants.R_OK , (err) => {
		if (err) return res.status(404).end();

		let image     = sharp(req.localpath);
		let width     = +req.query.width;
		let height    = +req.query.height;
		let blur      = +req.query.blur;
		let sharpen   = +req.query.sharpen;
		let greyscale = [ "y", "yes", "true", "1", "on"].includes(req.query.greyscale);
		let flip      = [ "y", "yes", "true", "1", "on"].includes(req.query.flip);
		let flop      = [ "y", "yes", "true", "1", "on"].includes(req.query.flop);

		if (width > 0 && height > 0) {
			image.ignoreAspectRatio();
		}
		if (width > 0 || height > 0) {
			image.resize(width || null, height || null);
		}
		if (flip)        image.flip();
		if (flop)        image.flop();
		if (blur > 0)    image.blur(blur);
		if (sharpen > 0) image.sharpen(sharpen);
		if (greyscale)   image.greyscale();

		res.setHeader("Content-Type", "image/" + path.extname(req.image).substr(1));

		image.pipe(res);
	});
});

app.listen(3000, () => {
	console.log("ready");
});
