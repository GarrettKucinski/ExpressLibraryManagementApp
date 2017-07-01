'use strict';

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

router.get('/', (req, res) => {
    Book.findAll(Book.id).then((books) => {
        res.render('main');
    });
});

module.exports = router;