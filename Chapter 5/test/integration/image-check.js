const chai  = require("chai");
const http  = require("chai-http");
const tools = require("../tools");

chai.use(http);

describe("Checking image", () => {
	beforeEach((done) => {
		chai
		.request(tools.service)
		.delete("/uploads/test_image_check.png")
		.end(() => {
			return done();
		});
	});

	it("should return 404 if it doesn't exist", (done) => {
		chai
		.request(tools.service)
		.head("/uploads/test_image_check.png")
		.end((err, res) => {
			chai.expect(res).to.have.status(404);

			return done();
		});
	});

	it("should return 200 if it exists", (done) => {
		chai
		.request(tools.service)
		.post("/uploads/test_image_check.png")
		.set("Content-Type", "image/png")
		.send(tools.sample)
		.end((err, res) => {
			chai.expect(res).to.have.status(200);
			chai.expect(res.body).to.have.status("ok");

			chai
			.request(tools.service)
			.head("/uploads/test_image_check.png")
			.end((err, res) => {
				chai.expect(res).to.have.status(200);

				return done();
			});
		});
	});
});
