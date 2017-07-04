'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

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
    next();
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

router.get('/return', (req, res, next) => {
    res.render('return_book');
});

module.exports = router;