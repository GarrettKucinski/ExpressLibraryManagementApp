'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;

const title = 'Patrons';

router.get('/', (req, res, next) => {
    Patron.findAll().then((patrons) => {
        const patron = patrons[0].dataValues;
        const columns = Object.keys(patron).filter((column) => {
            return column !== 'id';
        });
        res.render('all', { items: patrons, columns, title });
    });
});

module.exports = router;