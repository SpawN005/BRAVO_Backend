const app = require("../../app"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const Tournament = require("../models/tournament.js");

beforeAll(() => {});

afterAll(() => {
  process.exit();
});

describe("GET /tournaments", () => {
  it("should get all tournaments successfully", async () => {
    const response = await request.get("/tournaments");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
