'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;

const title = 'Patrons';

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
        const columns = Object.keys(patron).filter((column) => {
            return column !== 'id';
        });
        res.render('all', { items: patrons, columns, title });
    });
});

module.exports = router;