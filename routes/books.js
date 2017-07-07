'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let detail;
const content = 'books';

router.get('/', (req, res, next) => {

    let query = Book.findAll({
        attributes: [
            ['id', 'id'],
            ['title', 'Title'],
            ['author', 'Author'],
            ['genre', 'Genre'],
            ['first_published', 'First Published']
        ],
        include: Loan
    });

    query.then(books => {

        const columns = [
            "Title",
            "Author",
            "Genre",
            "First Published"
        ];

        let bookData = books.map(book => {
            return Object.assign({}, {
                id: book.dataValues.id,
                title: book.dataValues.Title,
                author: book.dataValues.Author,
                genre: book.dataValues.Genre,
                firstPublished: book.dataValues['First Published'],
                loans: book.dataValues.Loans.map(loan => {
                    return loan;
                })
            });
        });

        if (req.query.filter === 'overdue') {
            const today = new Date(Date.now()).toISOString().slice(0, 10);
            bookData = bookData.filter(book => {
                if (book.loans.length > 0) {
                    for (let loan of book.loans) {
                        if (loan.dataValues.returned_on === null && loan.dataValues.return_by < today) {
                            return book;
                        }
                    }
                }
            });
        }

        if (req.query.filter === 'checked_out') {
            bookData = bookData.filter(book => {
                if (book.loans.length > 0) {
                    for (let loan of book.loans) {
                        return loan.dataValues.returned_on !== null;
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

router.get('/return', (req, res, next) => {
    res.render('return_book');
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

router.get('/:id/:name', (req, res, next) => {
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
                ['id', 'id'],
                [Patron.sequelize.literal('first_name || " " || last_name'), 'fullName'],
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

        const book = Object.assign({}, {
            id: data[0][0].dataValues.id,
            title: data[0][0].dataValues.title,
            genre: data[0][0].dataValues.genre,
            author: data[0][0].dataValues.author,
            firstPublished: data[0][0].dataValues.first_published
        });

        const loanedBooks = data[1].map(loan => {
            return Object.assign({}, {
                bookName: data[0][0].dataValues.title,
                bookId: data[0][0].dataValues.id,
                patronName: loan.Patron.dataValues.fullName,
                patronId: loan.Patron.dataValues.id,
                loanedOn: loan.dataValues.loaned_on,
                returnBy: loan.dataValues.return_by,
                returnedOn: loan.dataValues.returned_on
            });
        });

        const title = `Book: ${ book.title }`;

        res.render('detail', { content, detail, title, book, columns, loanedBooks });

    }).catch(err => {
        console.log(err);
    });
});

module.exports = router;