'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;

let title = 'Patrons';
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
        const patronData = patrons.map(patron => {
            return Object.assign({}, {
                fullName: patron.dataValues.Name,
                address: patron.dataValues.Address,
                email: patron.dataValues.Email,
                libraryId: patron.dataValues['Library ID'],
                zip: patron.dataValues.Zip
            });
        })
        res.render('all', { patronData, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

module.exports = router;