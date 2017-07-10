'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

let currentPage;
let filter;

const content = 'loans';

const today = moment().format('YYYY[-]MM[-]DD');
const aWeekFromNow = moment().add(7, 'days').format('YYYY[-]MM[-]DD');

router.get('/', (req, res, next) => {

    if (req.query.page === undefined && req.query.filter === undefined) {
        res.redirect('/loans?page=1');
    }

    let loanQuery = Loan.findAndCountAll({
        where: [{
            loaned_on: {
                $not: null
            },
        }],
        order: [
            ['patron_id', 'ASC'],
            ['returned_on', 'ASC']
        ],
        limit: 10,
        offset: (req.query.page * 10) - 10,
        include: [{
            model: Book,
            attributes: [
                ['id', 'id'],
                ['title', 'title']
            ]
        }, {
            model: Patron,
            attributes: [
                ['id', 'id'],
                ['first_name', 'first_name'],
                ['last_name', 'last_name'],
            ]
        }]
    });

    if (req.query.filter === 'overdue') {
        loanQuery = Loan.findAndCountAll({
            where: [{
                loaned_on: {
                    $not: null
                },
                returned_on: null,
                return_by: {
                    $lt: today
                }
            }],
            order: [
                ['patron_id', 'ASC'],
                ['returned_on', 'ASC']
            ],
            limit: 10,
            offset: (req.query.page * 10) - 10,
            include: [{
                model: Book,
                attributes: [
                    ['id', 'id'],
                    ['title', 'title']
                ]
            }, {
                model: Patron,
                attributes: [
                    ['id', 'id'],
                    ['first_name', 'first_name'],
                    ['last_name', 'last_name'],
                ]
            }]
        });
    }

    if (req.query.filter === 'checked_out') {
        loanQuery = Loan.findAndCountAll({
            where: [{
                loaned_on: {
                    $not: null
                },
                returned_on: null
            }],
            order: [
                ['patron_id', 'ASC'],
                ['returned_on', 'ASC']
            ],
            limit: 10,
            offset: (req.query.page * 10) - 10,
            include: [{
                model: Book,
                attributes: [
                    ['id', 'id'],
                    ['title', 'title']
                ]
            }, {
                model: Patron,
                attributes: [
                    ['id', 'id'],
                    ['first_name', 'first_name'],
                    ['last_name', 'last_name'],
                ]
            }]
        });
    }

    loanQuery.then(loans => {
        const columns = [
            "Book",
            "Patron",
            "Loaned On",
            "Return By",
            "Return On"
        ];

        const count = Math.ceil(loans.count / 10);

        currentPage = req.query.page;
        filter = req.query.filter;

        let loanedBooks = loans.rows.map(loan => {
            return loan.get({
                plain: true
            });
        });

        const title = "Loans";

        res.render('all', { loanedBooks, count, filter, currentPage, columns, title, content });
    });
});

router.get('/new', (req, res, next) => {

    const books = Book.findAll({
        attributes: [
            ['id', 'id'],
            ['title', 'title']
        ]
    });

    const patrons = Patron.findAll({
        attributes: [
            ['id', 'id'],
            [Patron.sequelize.literal('first_name || " " || last_name'), 'name'],
        ]
    });

    Promise.all([books, patrons]).then(data => {
        const books = data[0].map(book => {
            return Object.assign({}, {
                id: book.dataValues.id,
                title: book.dataValues.title
            });
        });

        const patrons = data[1].map(patron => {
            return Object.assign({}, {
                id: patron.dataValues.id,
                fullName: patron.dataValues.name
            });
        });

        const loanedOn = today;
        const returnBy = aWeekFromNow;

        res.render('new', { content, books, patrons, loanedOn, returnBy });
    });
});

router.post('/new', (req, res, next) => {
    Loan.create(req.body).then(() => {
        res.redirect('/loans');
    }).catch(error => {
        if (error.name === "SequelizeValidationError") {
            const books = Book.findAll({
                attributes: [
                    ['id', 'id'],
                    ['title', 'title']
                ]
            });

            const patrons = Patron.findAll({
                attributes: [
                    ['id', 'id'],
                    [Patron.sequelize.literal('first_name || " " || last_name'), 'name'],
                ]
            });

            Promise.all([books, patrons]).then(data => {
                const books = data[0].map(book => {
                    return Object.assign({}, {
                        id: book.dataValues.id,
                        title: book.dataValues.title
                    });
                });

                const patrons = data[1].map(patron => {
                    return Object.assign({}, {
                        id: patron.dataValues.id,
                        fullName: patron.dataValues.name
                    });
                });
                const loanedOn = today;
                const returnBy = aWeekFromNow;

                res.render('new', { loanedOn, returnBy, books, patrons, errors: error.errors, title: 'New Loan', content });
            });
        } else {
            throw error;
        }
    }).catch(error => {
        res.status(500).send(error);
    });
});

module.exports = router;