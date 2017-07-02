'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;

const title = 'Patrons';
const content = 'patrons';

router.get('/', (req, res, next) => {
    Patron.findAll({
        attributes: [
            [Patron.sequelize.literal('first_name || " " || last_name'), 'Name'],
            ['address', 'Address'],
            ['email', 'Email'],
            ['library_id', 'Library ID'],
            ['zip_code', 'Zip']
        ]
    }).then((patrons) => {
        const patron = patrons[0].dataValues;
        const columns = Object.keys(patron);
        res.render('all', { items: patrons, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

module.exports = router;