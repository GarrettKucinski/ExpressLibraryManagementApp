'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let detail;
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
    }).then(books => {
        const book = books[0].dataValues;
        const columns = Object.keys(book);
        const bookData = books.map(book => {
            return Object.assign({}, {
                id: book.dataValues.id,
                title: book.dataValues.Title,
                author: book.dataValues.Author,
                genre: book.dataValues.Genre,
                firstPublished: book.dataValues['First Published']
            });
        });
        res.render('all', { bookData, columns, title, content });
    }).catch(err => {
        console.log(err);
    });
});

router.get('/new', (req, res, next) => {
    title = 'New Book';
    res.render('new', { title, content });
});

router.get('/return', (req, res, next) => {
    res.render('return_book');
});

router.get('/:title', (req, res, next) => {
    const bookData = Book.findAll({
        where: {
            title: req.params.title.replace(/_/g, ' ')
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
                [Patron.sequelize.literal('first_name || " " || last_name'), 'fullName'],
            ]
        }, {
            model: Book,
            where: {
                title: req.params.title.replace(/_/g, ' ')
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
            title: data[0][0].dataValues.title,
            genre: data[0][0].dataValues.genre,
            author: data[0][0].dataValues.author,
            firstPublished: data[0][0].dataValues.first_published
        });

        const loanedBooks = data[1].map(loan => {
            return Object.assign({}, {
                bookName: data[0][0].dataValues.title,
                patronName: loan.Patron.dataValues.fullName,
                loanedOn: loan.dataValues.loaned_on,
                returnBy: loan.dataValues.return_by,
                returnedOn: loan.dataValues.returned_on
            });
        });

        title = `Book: ${req.params.title.replace(/_/g, ' ')}`;

        res.render('detail', { content, detail, title, book, columns, loanedBooks });
    }).catch(err => {
        console.log(err);
    });
});


module.exports = router;