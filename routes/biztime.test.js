process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple', 'Maker of the iPhone') RETURNING code, name, description`);
    testCompany = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [testCompany]});
    });
});

describe("GET /companies/:code", () => {
    test("Get a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: testCompany});
    });

    test("Respond with 404 for invalid code", async () => {
        const res = await request(app).get(`/companies/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Create a new company", async () => {
        const res = await request(app).post("/companies").send({code: "google", name: "Google", description: "Search engine"});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: {code: "google", name: "Google", description: "Search engine"}});
    });
});

describe("PUT /companies/:code", () => {
    test("Update a company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({code: "apple", name: "Apple Inc.", description: "Maker of the iPhone"});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code: "apple", name: "Apple Inc.", description: "Maker of the iPhone"}});
    });

    test("Respond with 404 for invalid code", async () => {
        const res = await request(app).put(`/companies/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /companies/:code", () => {
    test("Delete a company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "deleted"});
    });

    test("Respond with 404 for invalid code", async () => {
        const res = await request(app).delete(`/companies/0`);
        expect(res.statusCode).toBe(404);
    });
});

