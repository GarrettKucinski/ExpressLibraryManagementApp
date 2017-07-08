'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;
const Loan = require('../models').Loan;
const Book = require('../models').Book;

const content = 'patrons';

router.get('/', (req, res, next) => {

    Patron.findAll().then(patrons => {

        const columns = [
            "Name",
            "Address",
            "Email",
            "Library ID",
            "Zip"
        ];

        const patronData = patrons.map(patron => {
            return patron.get({
                plain: true
            });
        });

        const title = 'Patrons';

        res.render('all', { patronData, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {
    res.render('new', { content });
});

router.post('/new', (req, res, next) => {
    Patron.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        email: req.body.email,
        library_id: req.body.library_id,
        zip_code: req.body.zip_code
    }).then(() => {
        res.redirect('/patrons');
    });
});

router.get('/:id', (req, res, next) => {
    Patron.findById(req.params.id).then(patron => {

        const patronData = patron.get({
            plain: true
        });

        const patronName = patronData.full_name.split(' ').join('_');

        res.redirect(`/patrons/${ req.params.id }/${ patronName }`);
    });
});

router.get('/:id/:name', (req, res, next) => {
    Patron.findAll({
        where: [{
            id: req.params.id
        }],
        include: [{
            model: Loan,
            include: Book
        }]
    }).then(patron => {
        const patronDetails = patron[0].get({
            plain: true
        });

        for (let loan of patronDetails.Loans) {
            loan.Patron = {};
            loan.Patron.full_name = patronDetails.full_name;
        }

        const detail = true;

        const columns = [
            "Book",
            "Patron",
            "Loaned On",
            "Return By",
            "Return On"
        ];

        const title = `Patron: ${ patronDetails.full_name }`;

        res.render('detail', {
            detail,
            patronDetails,
            content,
            title,
            columns,
            loanedBooks: patronDetails.Loans
        });

    }).catch(err => {
        console.log(err);
    });
});

router.post('/:id/:name', (req, res, next) => {
    Patron.update({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        email: req.body.email,
        libary_id: req.body.libary_id,
        zip_code: req.body.zip_code
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/patrons');
    });
});

module.exports = router;