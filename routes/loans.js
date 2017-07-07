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
                loanId: loan.dataValues.id,
                loanedOn: loan.dataValues.loaned_on,
                returnBy: loan.dataValues.return_by,
                returnedOn: loan.dataValues.returned_on
            });
        });

        if (req.query.filter === 'overdue') {
            console.log('overdue');
            loanedBooks = loanedBooks.filter(loanedBook => {
                if (loanedBook.returnedOn === null && loanedBook.returnBy < today) {
                    return loanedBook;
                }
            });
        }

        if (req.query.filter === 'checked_out') {
            loanedBooks = loanedBooks.filter(loanedBook => {
                return loanedBook.returnedOn === null && loanedBook.loanedOn !== null;
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
        return_on: null
    }).then(() => {
        res.redirect('/loans');
    });
});

module.exports = router;