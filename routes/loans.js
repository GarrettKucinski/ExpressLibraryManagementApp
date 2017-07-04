'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let title = "Loans";
const content = 'loans';

router.get('/', (req, res, next) => {
    Loan.findAll({
        where: [{
            loaned_on: {
                $not: null
            },
        }],
        include: [{
            model: Book,
            attributes: [
                ['title', 'Title']
            ]
        }, {
            model: Patron,
            attributes: [
                [Patron.sequelize.literal('first_name || " " || last_name'), 'Name'],
            ]
        }]
    }).then(loans => {
        const columns = [
            "Book",
            "Patron",
            "Loaned On",
            "Return By",
            "Return On"
        ];
        const loanedBooks = loans.map(loan => {
            return Object.assign({}, {
                bookName: loan.dataValues.Book.dataValues.Title,
                patronName: loan.dataValues.Patron.dataValues.Name,
                loanedOn: loan.dataValues.loaned_on,
                returnBy: loan.dataValues.return_by,
                returnedOn: loan.dataValues.returned_on
            });
        });
        res.render('all', { loanedBooks, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

module.exports = router;