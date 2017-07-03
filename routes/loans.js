'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let title = "Loans";
const content = 'loans';

router.get('/', (req, res, next) => {
    Book.hasMany(Loan, { foreignKey: 'book_id' });
    Loan.belongsTo(Book, { foreignKey: 'book_id' });
    Loan.belongsTo(Patron, { foreignKey: 'patron_id' });
    Patron.hasMany(Loan, { foreignKey: 'patron_id' });
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
        Loan.findAll({
            where: [{
                loaned_on: {
                    $not: null
                }
            }],
            include: [{
                model: Book,
            }, {
                model: Patron,
            }]
        }).then(loans => {
            console.log(loans);
            res.render('all', { loans, columns, title, content });
        });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

module.exports = router;