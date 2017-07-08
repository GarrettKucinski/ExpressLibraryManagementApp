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
    res.render('new', { title, content });
});

router.post('/new', (req, res, next) => {
    Book.create({
        title: req.body.title,
        author: req.body.author,
        first_published: req.body.first_published,
        genre: req.body.genre
    }).then(() => {
        res.redirect('/books');
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
                [Patron.sequelize.literal('first_name || " " || last_name'), 'name'],
            ]
        }]
    }).then(loan => {
        const loaner = loan.get({
            plain: true
        });
        const loanedBook = Object.assign({}, {
            bookTitle: loan.Book.dataValues.title,
            patronName: loan.Patron.dataValues.name,
            loanedOn: loan.dataValues.loaned_on,
            returnBy: loan.dataValues.return_by
        });
        res.render('return_book', { today, loanedBook });
    });
});

router.post('/:id/return', (req, res, next) => {
    Loan.update({
        returned_on: req.body.returned_on
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/loans');
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
                // ['id', 'id'],
                [Patron.sequelize.literal('first_name || " " || last_name'), 'fullName']
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