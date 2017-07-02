'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

const title = "Books";
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
        res.render('all', { items: books, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

router.get('/return', (req, res, next) => {
    res.render('return_book');
});

module.exports = router;