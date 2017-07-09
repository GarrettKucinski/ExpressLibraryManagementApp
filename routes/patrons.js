'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;
const Loan = require('../models').Loan;
const Book = require('../models').Book;

const content = 'patrons';

router.get('/', (req, res, next) => {

    Patron.findAll({
        order: [
            ['last_name', 'ASC'],
            ['first_name', 'ASC']
        ]
    }).then(patrons => {

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
    res.render('new', { content, patronDetails: {} });
});

router.post('/new', (req, res, next) => {
    Patron.create(req.body).then(() => {
        res.redirect('/patrons');
    }).catch(error => {
        if (error.name === "SequelizeValidationError") {
            const patron = Patron.build(req.body);

            const patronData = patron.get({
                plain: true
            });

            res.render('new', { patronDetails: patronData, errors: error.errors, title: 'New Patron', content });
        } else {
            throw error;
        }
    }).catch(error => {
        res.send(500, error);
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
    Loan.findAll({
        where: {
            patron_id: req.params.id
        },
        include: {
            model: Book,
            attributes: [
                ['title', 'title']
            ]
        }
    }).then(loan => {
        Patron.update(req.body, {
            where: {
                id: req.params.id
            }
        }).then(() => {
            res.redirect('/patrons');
        }).catch(error => {

            if (error.name === "SequelizeValidationError") {

                const patronData = Patron.build(req.body);

                const patronDetails = patronData.get({
                    plain: true
                });

                const loanedBooks = loan.map(loan => {
                    return loan.get({
                        plain: true
                    });
                });

                for (let loan of loanedBooks) {
                    loan.Patron = {};
                    loan.Patron.full_name = `${ patronDetails.first_name } ${ patronDetails.last_name }`;
                }

                const detail = true;

                const columns = [
                    "Book",
                    "Patron",
                    "Loaned On",
                    "Return By",
                    "Return On"
                ];

                const title = `Patron: ${ loanedBooks[0].Patron.full_name }`;

                res.render('detail', { detail, columns, patronDetails, title, loanedBooks, errors: error.errors, content });
            } else {
                throw error;
            }
        }).catch(error => {
            res.status(500).send(error);
        });
    });
});

module.exports = router;