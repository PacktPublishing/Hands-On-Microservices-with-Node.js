const settings   = require("./settings");
const bodyparser = require("body-parser");
const express    = require("express");
const mysql      = require("mysql");
const path       = require("path");
const sharp      = require("sharp");

const app = express();
const db  = mysql.createConnection(settings.db);

app.db = db;

db.connect((err) => {
	if (err) throw err;

	db.query(
	`CREATE TABLE IF NOT EXISTS images
	(
			id           INT(11)      UNSIGNED NOT NULL AUTO_INCREMENT,
			date_created TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
			date_used    TIMESTAMP    NULL DEFAULT NULL,
			name         VARCHAR(300) NOT NULL,
			size         INT(11)      UNSIGNED NOT NULL,
			data         LONGBLOB     NOT NULL,
		PRIMARY KEY (id),
		UNIQUE KEY name (name)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8`
	);

	setInterval(() => {
		db.query("DELETE FROM images " +
		         "WHERE (date_created < UTC_TIMESTAMP - INTERVAL 1 WEEK AND date_used IS NULL) " +
		         "   OR (date_used < UTC_TIMESTAMP - INTERVAL 1 MONTH)");
	}, 3600 * 1000);

	app.param("image", (req, res, next, image) => {
		if (!image.match(/\.(png|jpg)$/i)) {
			return res.status(403).end();
		}

		db.query("SELECT * FROM images WHERE name = ?", [ image ], (err, images) => {
			if (err || !images.length) {
				return res.status(404).end();
			}

			req.image = images[0];

			return next();
		});
	});

	app.post("/uploads/:name", bodyparser.raw({
		limit : "10mb",
		type  : "image/*"
	}), (req, res) => {
		db.query("INSERT INTO images SET ?", {
			name : req.params.name,
			size : req.body.length,
			data : req.body,
		}, (err) => {
			if (err) {
				return res.send({ status : "error", code: err.code });
			}

			res.send({ status : "ok", size: req.body.length });
		});
	});

	app.head("/uploads/:image", (req, res) => {
		return res.status(200).end();
	});

	app.delete("/uploads/:image", (req, res) => {
		db.query("DELETE FROM images WHERE id = ?", [ req.image.id ], (err) => {
			return res.status(err ? 500 : 200).end();
		});
	});

	app.get("/uploads/:image", (req, res) => {
		if (Object.keys(req.query).length === 0) {
			db.query("UPDATE images SET date_used = UTC_TIMESTAMP WHERE id = ?", [ req.image.id ]);

			res.setHeader("Content-Type", "image/" + path.extname(req.image.name).substr(1));

			return res.end(req.image.data);
		}

		let image     = sharp(req.image.data);
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

		db.query("UPDATE images SET date_used = UTC_TIMESTAMP WHERE id = ?", [ req.image.id ]);

		res.setHeader("Content-Type", "image/" + path.extname(req.image.name).substr(1));

		image.pipe(res);
	});

	app.get("/stats", (req, res) => {
		db.query("SELECT COUNT(*) total" +
		         ", SUM(size) size" +
		         ", MAX(date_used) last_used " +
		         "FROM images",
		(err, rows) => {
			if (err) {
				return res.status(500).end();
			}

			rows[0].uptime = process.uptime();

			return res.send(rows[0]);
		});
	});

	app.listen(3000);
});

module.exports = app;
