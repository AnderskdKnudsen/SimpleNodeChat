const app = require("../app.js");

const chai = require("chai");
const assert = chai.assert;

describe("Query DB", () => {
    it("Query the DB and find the expected user", async () => {
        var expectedUser = "1234";
        var foundUser = await app.queryDb(expectedUser);
        assert.equal(foundUser, true);
    });
});