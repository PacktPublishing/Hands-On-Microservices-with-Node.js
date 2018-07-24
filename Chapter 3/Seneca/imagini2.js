const sharp   = require("sharp");
const path    = require("path");
const fs      = require("fs");

module.exports = function (settings = { path: "uploads" }) {
	const localpath = (image) => (path.join(settings.path, image));
	const access    = (filename, next) => {
		fs.access(filename, fs.constants.R_OK , (err) => {
			return next(!err, filename);
		});
	};

	this.add("role:check,image:*", (msg, next) => {
		access(localpath(msg.image), (exists) => (next(null, { exists })));
	});

	this.add("role:upload,image:*,data:*", (msg, next) => {
		let data = Buffer.from(msg.data, "base64");

		fs.writeFile(localpath(msg.image), data, (err) => {
			return next(err, { size : data.length });
		});
	});

	this.add("role:download,image:*", (msg, next) => {
		access(localpath(msg.image), (exists, filename) => {
			if (!exists) return next(new Error("image not found"));

			let image     = sharp(filename);
			let width     = +msg.width || null;
			let height    = +msg.height || null;

			if (width && height) image.ignoreAspectRatio();
			if (width || height) image.resize(width, height);
			if (msg.flip)        image.flip();
			if (msg.flop)        image.flop();
			if (msg.blur > 0)    image.blur(blur);
			if (msg.sharpen > 0) image.sharpen(sharpen);
			if (msg.greyscale)   image.greyscale();

			image.toBuffer().then((data) => {
				return next(null, { data: data.toString("base64") });
			});
		});
	});
};
