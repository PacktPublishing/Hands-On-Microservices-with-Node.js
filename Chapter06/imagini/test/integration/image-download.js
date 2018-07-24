const sharp = require("sharp");
const chai  = require("chai");
const http  = require("chai-http");
const tools = require("../tools");

chai.use(http);

describe("Downloading image", () => {
	beforeEach((done) => {
		chai
		.request(tools.service)
		.delete("/uploads/test_image_download.png")
		.end(() => {
			chai
			.request(tools.service)
			.post("/uploads/test_image_download.png")
			.set("Content-Type", "image/png")
			.send(tools.sample)
			.end((err, res) => {
				chai.expect(res).to.have.status(200);
				chai.expect(res.body).to.have.status("ok");

				return done();
			});
		});
	});

	it("should return the original image size if no parameters given", (done) => {
		chai
		.request(tools.service)
		.get("/uploads/test_image_download.png")
		.end((err, res) => {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.have.length(tools.sample.length);

			return done();
		});
	});

	it("should be able to resize the image as we request", (done) => {
		chai
		.request(tools.service)
		.get("/uploads/test_image_download.png?width=200&height=100")
		.end((err, res) => {
			chai.expect(res).to.have.status(200);

			let image = sharp(res.body);

			image
			.metadata()
			.then((metadata) => {
				chai.expect(metadata).to.have.property("width", 200);
				chai.expect(metadata).to.have.property("height", 100);

				return done();
			});
		});
	});

	it("should be able to resize the image width as we request", (done) => {
		chai
		.request(tools.service)
		.get("/uploads/test_image_download.png?width=200")
		.end((err, res) => {
			chai.expect(res).to.have.status(200);

			let image = sharp(res.body);

			image
			.metadata()
			.then((metadata) => {
				chai.expect(metadata).to.have.property("width", 200);

				return done();
			});
		});
	});

	it("should be able to resize the image height as we request", (done) => {
		chai
		.request(tools.service)
		.get("/uploads/test_image_download.png?height=100")
		.end((err, res) => {
			chai.expect(res).to.have.status(200);

			let image = sharp(res.body);

			image
			.metadata()
			.then((metadata) => {
				chai.expect(metadata).to.have.property("height", 100);

				return done();
			});
		});
	});

	it("should be able to add image effects as we request", (done) => {
		chai
		.request(tools.service)
		.get("/uploads/test_image_download.png?flip=y&flop=y&greyscale=y&blur=10&sharpen=10")
		.end((err, res) => {
			chai.expect(res).to.have.status(200);

			let image = sharp(res.body);

			return done();
		});
	});
});
