const chai  = require("chai");
const sinon = require("sinon");
const http  = require("chai-http");
const tools = require("../tools");

chai.use(http);

describe("Deleting older images", () => {
	let clock = sinon.useFakeTimers({ shouldAdvanceTime : true });

	it("should run every hour", (done) => {
		chai
		.request(tools.service)
		.get("/stats")
		.end((err, res) => {
			chai.expect(res).to.have.status(200);

			clock.tick(3600 * 1000);

			clock.restore();

			return done();
		});
	});
});
