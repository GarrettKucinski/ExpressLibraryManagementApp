'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

const title = "Books";

router.get('/', (req, res, next) => {
    Book.findAll({
        attributes: [
            ['title', 'Title'],
            ['author', 'Author'],
            ['genre', 'Genre']
        ]
    }).then((books) => {
        const book = books[0].dataValues;
        const columns = Object.keys(book).filter((column) => {
            return column !== 'id' && column !== 'first_published';
        });
        res.render('all', { items: books, columns, title });
    });
});

module.exports = router;