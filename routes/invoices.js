
const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    } catch (e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice with id of ${id} not found`, 404);
        }
        return res.json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt, paid } = req.body;

        let paid_date = null;
        
        if(paid === true) {
            paid_date = new Date();
        } else if (paid === false) {
            paid_date = null;
        }

        const results = await db.query(`UPDATE invoices SET amt=$2 paid=$3 paid_date=$4 WHERE id = $1 RETURNING id, comp_code, add_date, amt, paid, paid_date`, [id, amt, paid, paid_date]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Invoice with id of ${id} not found`, 404);
        }
        return res.json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
        if (results.rowCount === 0) {
            throw new ExpressError(`Invoice with id of ${id} not found`, 404);
        }
        return res.json({status: "deleted"});
    } catch (e) {
        return next(e);
    }
});

router.get('/companies/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Company with code of ${code} not found`, 404);
        }
        return res.json({invoices: results.rows});
    } catch (e) {
        return next(e);
    }
});

module.exports = router;