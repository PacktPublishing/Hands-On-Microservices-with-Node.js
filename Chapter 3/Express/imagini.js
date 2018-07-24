const bodyparser = require("body-parser");
const path       = require("path");
const fs         = require("fs");
const express    = require("express");
const sharp      = require("sharp");
const app        = express();

app.param("image", (req, res, next, image) => {
	if (!image.match(/\.(png|jpg)$/i)) return res.status(req.method == "POST" ? 403 : 404).end();

	req.image     = image;
	req.localpath = path.join(__dirname, "uploads", req.image);

	return next();
});

app.param("width", (req, res, next, width) => {
	req.width = +width;

	return next();
});

app.param("height", (req, res, next, height) => {
	req.height = +height;

	return next();
});

app.post("/uploads/:image", bodyparser.raw({ limit: "10mb", type: "image/*" }), (req, res) => {
	let fd  = fs.createWriteStream(req.localpath, { flags: "w+", encoding: "binary" });

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

app.get("/uploads/:width(\\d+)x:height(\\d+)-:image", download_image);
app.get("/uploads/_x:height(\\d+)-:image", download_image);
app.get("/uploads/:width(\\d+)x_-:image", download_image);
app.get("/uploads/:image", download_image);

function download_image(req, res) {
	fs.access(req.localpath, fs.constants.R_OK , (err) => {
		if (err) return res.status(404).end();

		let image = sharp(req.localpath);

		if (req.width && req.height) {
			image.ignoreAspectRatio();
		}
		if (req.width || req.height) {
			image.resize(req.width, req.height);
		}

		res.setHeader("Content-Type", "image/" + path.extname(req.image).substr(1));

		image.pipe(res);
	});
}

app.get(/\/thumbnail\.(jpg|png)/, (req, res, next) => {
	let format    = (req.params[0] == "png" ? "png" : "jpeg");
	let width     = +req.query.width || 300;
	let height    = +req.query.height || 200;
	let border    = +req.query.border || 5;
	let bgcolor   = req.query.bgcolor || "#fcfcfc";
	let fgcolor   = req.query.fgcolor || "#ddd";
	let textcolor = req.query.textcolor || "#aaa";
	let textsize  = +req.query.textsize || 24;
	let image     = sharp({
		create : {
			width      : width,
			height     : height,
			channels   : 4,
			background : { r: 0, g: 0, b: 0 },
		}
	});
	const thumbnail = new Buffer(
`<svg width="${width}" height="${height}">
	<rect
		x="0" y="0"
		width="${width}" height="${height}"
		fill="${fgcolor}" />
	<rect
		x="${border}" y="${border}"
		width="${width - border * 2}" height="${height - border * 2}"
		fill="${bgcolor}" />
	<line
		x1="${border * 2}" y1="${border * 2}"
		x2="${width - border * 2}" y2="${height - border * 2}"
		stroke-width="${border}" stroke="${fgcolor}" />
	<line
		x1="${width - border * 2}" y1="${border * 2}"
		x2="${border * 2}" y2="${height - border * 2}"
		stroke-width="${border}" stroke="${fgcolor}" />
	<rect
		x="${border}" y="${(height - textsize) / 2}"
		width="${width - border * 2}" height="${textsize}"
		fill="${bgcolor}" />
	<text
		x="${width / 2}" y="${height / 2}" dy="8"
		font-family="Helvetica" font-size="${textsize}"
		fill="${textcolor}" text-anchor="middle">${width} x ${height}</text>
 </svg>`
	);

	image.overlayWith(thumbnail)[format]().pipe(res);
});

app.listen(3000, () => {
	console.log("ready");
});
