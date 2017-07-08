'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

const content = 'loans';

const today = moment().format('YYYY[-]MM[-]DD');
const aWeekFromNow = moment().add(7, 'days').format('YYYY[-]MM[-]DD');

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
                ['title', 'title']
            ]
        }, {
            model: Patron,
            attributes: [
                ['id', 'id'],
                ['first_name', 'first_name'],
                ['last_name', 'last_name'],
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
            return loan.get({
                plain: true
            });
        });

        if (req.query.filter === 'overdue') {
            console.log('overdue');
            loanedBooks = loanedBooks.filter(loanedBook => {
                if (loanedBook.returned_on === null && loanedBook.return_by < today) {
                    return loanedBook;
                }
            });
        }

        if (req.query.filter === 'checked_out') {
            loanedBooks = loanedBooks.filter(loanedBook => {
                return loanedBook.returned_on === null && loanedBook.loaned_on !== null;
            });
        }

        const title = "Loans";

        res.render('all', { loanedBooks, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {

    const books = Book.findAll({
        attributes: [
            ['id', 'id'],
            ['title', 'title']
        ]
    });

    const patrons = Patron.findAll({
        attributes: [
            ['id', 'id'],
            [Patron.sequelize.literal('first_name || " " || last_name'), 'name'],
        ]
    });

    Promise.all([books, patrons]).then(data => {
        const books = data[0].map(book => {
            return Object.assign({}, {
                id: book.dataValues.id,
                title: book.dataValues.title
            });
        });

        const patrons = data[1].map(patron => {
            return Object.assign({}, {
                id: patron.dataValues.id,
                fullName: patron.dataValues.name
            });
        });

        const loanedOn = today;
        const returnBy = aWeekFromNow;

        res.render('new', { content, books, patrons, loanedOn, returnBy });
    });
});

router.post('/new', (req, res, next) => {
    Loan.create({
        book_id: req.body.bookId,
        patron_id: req.body.patronId,
        loaned_on: req.body.loanedOn,
        return_by: req.body.returnBy,
        returned_on: null
    }).then(() => {
        res.redirect('/loans');
    });
});

module.exports = router;