'use strict';

const express = require('express');
const router = express.Router();
const Loan = require('../models').Loan;

const title = "Loans";

router.get('/', (req, res, next) => {
    Loan.findAll().then((loans) => {
        const loan = loans[0].dataValues;
        const columns = Object.keys(loan).filter((column) => {
            return column !== 'id';
        });
        res.render('all', { items: loans, columns, title });
    });
});

module.exports = router;