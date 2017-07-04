'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let title = "Books";
const content = 'books';

router.get('/', (req, res, next) => {
    Book.findAll({
        attributes: [
            ['title', 'Title'],
            ['author', 'Author'],
            ['genre', 'Genre'],
            ['first_published', 'First Published']
        ]
    }).then((books) => {
        const book = books[0].dataValues;
        const columns = Object.keys(book);
        const bookData = books.map(book => {
            return Object.assign({}, {
                title: book.dataValues.Title,
                author: book.dataValues.Author,
                genre: book.dataValues.Genre,
                firstPublished: book.dataValues['First Published']
            });
        });
        res.render('all', { bookData, columns, title, content });
    });
});
router.get('/:title', (req, res, next) => {
    const loanData = Loan.findAll({
        include: [{
            model: Book,
            where: {
                title: req.params.title.replace(/_/g, ' ')
            },
        }, {
            model: Patron,
            attributes: [
                [Patron.sequelize.literal('first_name || " " || last_name'), 'fullName'],
            ]
        }],
        where: {
            loaned_on: {
                $not: null
            },
        }
    }).then(data => {
        console.log(data[0].Book);
        const detail = true;
        const columns = [
            "Book",
            "Patron",
            "Loaned On",
            "Return By",
            "Returned On"
        ];
        const book = Object.assign({}, {
            title: data[0].Book.dataValues.title,
            genre: data[0].Book.dataValues.genre,
            author: data[0].Book.dataValues.author,
            firstPublished: data[0].Book.dataValues.first_published,
            loans: data.map(loan => {
                return Object.assign({}, {
                    bookName: data[0].Book.dataValues.title,
                    patronName: data[0].Patron.dataValues.fullName,
                    loanedOn: loan.dataValues.loaned_on,
                    returnBy: loan.dataValues.return_by,
                    returnedOn: loan.dataValues.returned_on
                });
            })
        });

        title = `Book: ${req.params.title.replace(/_/g, ' ')}`;
        console.log(data[1]);
        const loanedBooks = {};
        res.render('detail', { content, detail, title, book, columns, loanedBooks: book.loans });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

router.get('/return', (req, res, next) => {
    res.render('return_book');
});

module.exports = router;