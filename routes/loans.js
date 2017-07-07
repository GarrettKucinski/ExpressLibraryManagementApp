'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

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
                ['id', 'id'],
                ['title', 'Title']
            ]
        }, {
            model: Patron,
            attributes: [
                ['id', 'id'],
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
        let loanedBooks = loans.map(loan => {
            return Object.assign({}, {
                bookId: loan.dataValues.Book.dataValues.id,
                patronId: loan.dataValues.Patron.dataValues.id,
                bookName: loan.dataValues.Book.dataValues.Title,
                patronName: loan.dataValues.Patron.dataValues.Name,
                loanedOn: loan.dataValues.loaned_on,
                returnBy: loan.dataValues.return_by,
                returnedOn: loan.dataValues.returned_on
            });
        });

        if (req.query.filter === 'overdue') {
            console.log('overdue');
            const today = new Date(Date.now()).toISOString().slice(0, 10);
            loanedBooks = loanedBooks.filter(loanedBook => {
                if (loanedBook.returnedOn === null && loanedBook.returnBy < today) {
                    return loanedBook;
                }
            });
        }

        if (req.query.filter === 'checked_out') {
            loanedBooks = loanedBooks.filter(loanedBook => {
                return loanedBook.returnedOn !== null;
            });
        }

        const title = "Loans";

        res.render('all', { loanedBooks, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

module.exports = router;