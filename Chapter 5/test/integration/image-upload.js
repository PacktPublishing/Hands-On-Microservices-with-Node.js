const chai  = require("chai");
const http  = require("chai-http");
const tools = require("../tools");

chai.use(http);

describe("Uploading image", () => {
	beforeEach((done) => {
		chai
		.request(tools.service)
		.delete("/uploads/test_image_upload.png")
		.end(() => {
			return done();
		});
	});

	it("should accept a PNG image", (done) => {
		chai
		.request(tools.service)
		.post("/uploads/test_image_upload.png")
		.set("Content-Type", "image/png")
		.send(tools.sample)
		.end((err, res) => {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.have.status("ok");

			return done();
		});
	});

	it("should deny duplicated images", (done) => {
		chai
		.request(tools.service)
		.post("/uploads/test_image_upload.png")
		.set("Content-Type", "image/png")
		.send(tools.sample)
		.end((err, res) => {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.have.status("ok");

			chai
			.request(tools.service)
			.post("/uploads/test_image_upload.png")
			.set("Content-Type", "image/png")
			.send(tools.sample)
			.end((err, res) => {
				chai.expect(res).to.have.status(200);
				chai.expect(res.body).to.have.status("error");
				chai.expect(res.body).to.have.property("code", "ER_DUP_ENTRY");

				return done();
			});
		});
	});
});
