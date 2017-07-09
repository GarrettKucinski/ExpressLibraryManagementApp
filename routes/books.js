'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let detail;
const content = 'books';

const today = moment().format('YYYY[-]MM[-]DD');

router.get('/', (req, res, next) => {

    Book.findAll({
        include: Loan
    }).then(books => {

        const columns = [
            "Title",
            "Author",
            "Genre",
            "First Published"
        ];

        let bookData = books.map(book => {
            return book.get({
                plain: true
            });
        });

        if (req.query.filter === 'overdue') {
            bookData = bookData.filter(book => {
                if (book.Loans.length > 0) {
                    for (let loan of book.Loans) {
                        if (loan.returned_on === null && loan.return_by < today) {
                            return book;
                        }
                    }
                }
            });
        }

        if (req.query.filter === 'checked_out') {
            bookData = bookData.filter(book => {
                if (book.Loans.length > 0) {
                    for (let loan of book.Loans) {
                        if (loan.returned_on === null && loan.loaned_on !== null) {
                            return loan;
                        }
                    }
                }
            });
        }

        const title = "Books";

        res.render('all', { bookData, columns, title, content });

    }).catch(err => {
        console.log(err);
    });
});

router.get('/new', (req, res, next) => {
    const title = 'New Book';
    res.render('new', { title, book: {}, content });
});

router.post('/new', (req, res, next) => {
    Book.create(req.body).then(() => {
        res.redirect('/books');
    }).catch(error => {
        if (error.name === "SequelizeValidationError") {
            detail = false;
            const book = Book.build(req.body);

            const bookData = book.get({
                plain: true
            });

            res.render('new', { detail, book: bookData, errors: error.errors, title: 'New Book', content });
        } else {
            throw error;
        }
    }).catch(error => {
        res.send(500, error);
    });
});

router.get('/:id/return', (req, res, next) => {
    Loan.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Book,
            attributes: [
                ['title', 'title']
            ]
        }, {
            model: Patron,
            attributes: [
                ['first_name', 'first_name'],
                ['last_name', 'last_name']
            ]
        }]
    }).then(loan => {


        const loanedBook = loan.get({
            plain: true
        });

        const title = `Return ${ loanedBook.Book.title }`;

        res.render('return_book', { today, title, loanedBook });
    });
});

router.post('/:id/return', (req, res, next) => {

    Loan.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Book,
            attributes: [
                ['title', 'title']
            ]
        }, {
            model: Patron,
            attributes: [
                ['first_name', 'first_name'],
                ['last_name', 'last_name']
            ]
        }]
    }).then(loan => {

        const dateMatch = /^\d{4}-\d{2}-\d{2}$/igm;

        const loanedBook = loan.get({
            plain: true
        });

        const title = `Return ${ loanedBook.Book.title }`;

        if (req.body.returned_on) {
            if (dateMatch.test(req.body.returned_on.toString())) {
                loan.update({
                    returned_on: req.body.returned_on
                }).then(() => {
                    res.redirect('/loans');
                });
            } else {
                const validationError = new Error('You must enter a valid date. ex. 2017-07-08');
                const errors = [validationError];
                res.render('return_book', { errors, title, today, loanedBook });
            }
        } else {
            const validationError = new Error('Return date cannot be empty');
            const errors = [validationError];
            res.render('return_book', { errors, title, today, loanedBook });
        }
    });
});

router.get('/:id', (req, res, next) => {
    Book.findAll({
        where: {
            id: req.params.id
        },
    }).then(book => {
        res.redirect(`/books/${req.params.id}/${book[0].dataValues.title.replace(/ /g, '_')}`);
    });
});

router.get('/:id/:title', (req, res, next) => {
    const bookData = Book.findAll({
        where: {
            id: req.params.id
        },
    });

    const loanData = Loan.findAll({
        where: {
            loaned_on: {
                $not: null
            }
        },
        include: [{
            model: Patron,
            attributes: [
                ['first_name', 'first_name'],
                ['last_name', 'last_name']
            ]
        }, {
            model: Book,
            where: {
                id: req.params.id
            }
        }]
    });

    Promise.all([
        bookData,
        loanData
    ]).then(data => {

        detail = true;

        const columns = [
            "Book",
            "Patron",
            "Loaned On",
            "Return By",
            "Returned On"
        ];

        const book = data[0][0].get({
            plain: true
        });

        const loanedBooks = data[1].map(loan => {
            return loan.get({
                plain: true
            });
        });

        const title = `Book: ${ book.title }`;

        res.render('detail', { content, detail, title, book, columns, loanedBooks });

    }).catch(err => {
        console.log(err);
    });
});

router.post('/:id/:name', (req, res, next) => {
    Book.update({
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        first_published: req.body.first_published
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/books');
    });
});

module.exports = router;