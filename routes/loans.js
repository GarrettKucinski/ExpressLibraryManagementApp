'use strict';

const express = require('express');
const router = express.Router();
const Loan = require('../models').Loan;

const title = "Loans";
const content = 'loans';

router.get('/', (req, res, next) => {
    Loan.findAll({
        attributes: [
            ['book_id', 'Book'],
            ['patron_id', 'Patron'],
            ['loaned_on', 'Loaned On'],
            ['return_by', 'Return By'],
            ['returned_on', 'Returned On']
        ]
    }).then((loans) => {
        const loan = loans[0].dataValues;
        const columns = Object.keys(loan);
        res.render('all', { items: loans, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

module.exports = router;