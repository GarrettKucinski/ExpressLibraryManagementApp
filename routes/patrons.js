'use strict';

const express = require('express');
const router = express.Router();
const Patron = require('../models').Patron;
const Loan = require('../models').Loan;
const Book = require('../models').Book;

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
    }).then(patrons => {
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

router.get('/:name', (req, res, next) => {
    const firstName = req.params.name.split('_')[0];
    const lastName = req.params.name.split('_')[1];
    Patron.findAll({
        where: [{
            first_name: firstName,
            last_name: lastName
        }],
        include: [{
            model: Loan,
            include: Book
        }]
    }).then(patron => {
        const title = `Patron: ${ req.params.name.replace(/_/g, ' ') }`;
        const detail = true;
        const columns = [
            "Book",
            "Patron",
            "Loaned On",
            "Return By",
            "Return On"
        ];

        const patronDetails = Object.assign({}, {
            firstName: patron[0].dataValues.first_name,
            lastName: patron[0].dataValues.last_name,
            address: patron[0].dataValues.address,
            email: patron[0].dataValues.email,
            libraryId: patron[0].dataValues.library_id,
            zip: patron[0].dataValues.zip_code,
            loans: patron[0].Loans.map(loan => {
                return Object.assign({}, {
                    bookName: loan.Book.dataValues.title,
                    patronName: req.params.name.replace(/_/g, ' '),
                    loanedOn: loan.dataValues.loaned_on,
                    returnBy: loan.dataValues.return_by,
                    returnedOn: loan.dataValues.returned_on
                });
            })
        });

        res.render('detail', { detail, patronDetails, content, title, columns, loanedBooks: patronDetails.loans });

    }).catch(err => {
        console.log(err);
    });
});

module.exports = router;