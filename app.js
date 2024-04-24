/** BizTime express application. */


const express = require("express");

const db = require("./db");
const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

const cRoutes = require("./routes/companies.js");
app.use("/companies", cRoutes);
const iRoutes = require("./routes/invoices.js");
app.use("/invoices", iRoutes);

app.post("/industries", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
    return res.status(201).json({industry: results.rows[0]});
  } catch (e) {
    return next(e);
  }
});

app.post("/companies_industries", async (req, res, next) => {
  try {
    const { company_id, industry_id } = req.body;
    const results = await db.query(`INSERT INTO companies_industries (id, company_id, industry_id) VALUES ($1, $2, $3) RETURNING id, company_id, industry_id`, [Math.round(Math.random()  * Math.random()),  company_id, industry_id]);
    return res.status(201).json({company_industry: results.rows[0]});
  } catch (e) {
    return next(e);
  }
});

app.get("/industries", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.json({industries: results.rows});
  } catch (e) {
    return next(e);
  }
});

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
