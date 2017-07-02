'use strict';

const express = require('express');
const router = express.Router();
const Loan = require('../models').Loan;

const title = "Loans";

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
        const columns = Object.keys(loan).filter((column) => {
            return column !== 'id';
        });
        res.render('all', { items: loans, columns, title });
    });
});

module.exports = router;