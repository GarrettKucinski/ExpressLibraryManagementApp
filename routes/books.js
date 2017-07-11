'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let detail;
let currentPage;
let filter;
let search;
let search_title;
let genre;
let author;
let first_published;

const content = 'books';
const today = moment().format('YYYY[-]MM[-]DD');

router.get('/', (req, res, next) => {

    if (req.query.page === undefined && req.query.filter === undefined) {
        //     res.redirect('/books?page=1');
        req.query.page = 1;
    }

    let bookQuery;
    search = req.query.search ? req.query.search : false;

    if (req.query.search === undefined) {
        bookQuery = Book.findAndCountAll({
            order: [
                ['title', 'ASC']
            ],
            limit: 10,
            offset: (req.query.page * 10) - 10,
        });
    }

    if (req.query.filter === 'overdue') {
        bookQuery = Book.findAndCountAll({
            distinct: 'title',
            order: [
                ['title', 'ASC']
            ],
            limit: 10,
            offset: (req.query.page * 10) - 10,
            include: {
                model: Loan,
                where: {
                    return_by: {
                        lt: today
                    },
                    returned_on: null
                }
            }
        });
    }

    if (req.query.filter === 'checked_out') {
        bookQuery = Book.findAndCountAll({
            distinct: 'title',
            order: [
                ['title', 'ASC']
            ],
            limit: 10,
            offset: (req.query.page * 10) - 10,
            include: {
                model: Loan,
                where: {
                    returned_on: null
                }
            }
        });
    }

    if (req.query.search) {
        bookQuery = Book.findAndCountAll({
            where: {
                title: {
                    $like: `%${ req.query.title.toLowerCase() }%`,
                },
                author: {
                    $like: `%${ req.query.author.toLowerCase() }%`,
                },
                genre: {
                    $like: `%${ req.query.genre.toLowerCase() }%`,
                },
                first_published: {
                    $like: `%${ req.query.first_published }%`,
                }
            },
            limit: 10,
            offset: (req.query.page * 10) - 10,
        });
    }

    bookQuery.then(books => {

        currentPage = req.query.page;
        filter = req.query.filter;
        search_title = req.query.title;
        author = req.query.author;
        genre = req.query.genre;
        first_published = req.query.first_published;

        const columns = [
            "Title",
            "Author",
            "Genre",
            "First Published"
        ];

        let bookData = books.rows.map(book => {
            return book.get({
                plain: true
            });
        });

        const count = Math.ceil(books.count / 10);

        const title = "Books";

        res.render('all', {
            count,
            currentPage,
            filter,
            bookData,
            columns,
            title,
            content,
            search_title,
            author,
            genre,
            first_published,
            search
        });

    }).catch(error => {
        res.status(500).send(error);
    });
});

router.post('/', (req, res, next) => {

    if (req.query.page === undefined && req.query.filter === undefined) {
        //     res.redirect('/books?page=1');
        req.query.page = 1;
    }

    Book.findAndCountAll({
        where: {
            title: {
                $like: `%${ req.body.title }%`,
            },
            author: {
                $like: `%${ req.body.author }%`,
            },
            genre: {
                $like: `%${ req.body.genre }%`,
            },
            first_published: {
                $like: `%${ req.body.first_published }%`,
            }
        },
        limit: 10,
        offset: (req.query.page * 10) - 10,
    }).then(books => {
        res.redirect(`/books?page=1&search=true&title=${ req.body.title ? req.body.title : '' }&author=${ req.body.author ? req.body.author : ''}&genre=${ req.body.genre ? req.body.genre : ''}&first_published=${ req.body.first_published ? req.body.first_published : ''}`);
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

            const errors = error.errors;

            res.render('new', { detail, book: bookData, errors, title: 'New Book', content });
        }
    }).catch(error => {
        res.status(500).send(error);
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
        const errors = [];

        if (!req.body.returned_on) {
            errors.push(new Error('Return date cannot be empty'));
        } else if (!dateMatch.test(req.body.returned_on)) {
            errors.push(new Error('You must enter a valid date. ex. 2017-07-08'));
        }

        if (errors.length) {
            res.render('return_book', { errors, title, today, loanedBook });
        } else {
            loan.update({
                returned_on: req.body.returned_on
            }).then(() => {
                res.redirect('/loans');
            });
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
    }).catch(error => {

    });
});

router.get('/:id/:title', (req, res, next) => {
    const bookData = Book.findById(req.params.id);

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

        const book = data[0].get({
            plain: true
        });

        const loanedBooks = data[1].map(loan => {
            return loan.get({
                plain: true
            });
        });

        const title = `Book: ${ book.title }`;

        res.render('detail', { content, detail, title, book, columns, loanedBooks });

    }).catch(error => {
        res.status(500).send(error);
    });
});

router.post('/:id/:name', (req, res, next) => {

    const bookData = Book.findById(req.params.id);

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

        Book.update(req.body, {
            where: {
                id: req.params.id
            }
        }).then(() => {
            res.redirect('/books');
        }).catch(error => {
            if (error.name === "SequelizeValidationError") {

                detail = true;

                const book = data[0].get({
                    plain: true
                });

                const loanedBooks = data[1].map(loan => {
                    return loan.get({
                        plain: true
                    });
                });

                const title = `Book: ${ book.title }`;

                const columns = [
                    "Book",
                    "Patron",
                    "Loaned On",
                    "Return By",
                    "Returned On"
                ];

                res.render('detail', { detail, columns, loanedBooks, book, errors: error.errors, title, content });
            } else {
                throw error;
            }
        }).catch(error => {
            res.status(500).send(error);
        });
    });
});

module.exports = router;