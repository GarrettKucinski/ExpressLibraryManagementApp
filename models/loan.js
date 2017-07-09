'use strict';
module.exports = function(sequelize, DataTypes) {
    var Loan = sequelize.define('Loan', {
        book_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: 'You must specify a valid book id.'
                }
            }
        },
        patron_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: 'You must specify a valid patron id.'
                }
            }
        },
        loaned_on: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: {
                    msg: 'The you must specify the loaned on date.'
                },
                is: {
                    args: /[0-9]\-/gim,
                    msg: 'The loaned on date must be in the correct format. ex. 2017-07-08'
                },
                isDate: {
                    msg: 'The loaned on field must contain a valid date. ex. 2017-07-08'
                }
            }
        },
        return_by: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: {
                    msg: 'You must specify a return by date.'
                },
                is: {
                    args: /[0-9]\-/gim,
                    msg: 'The return by date must be in the correct format. ex. 2017-07-08'
                },
                isDate: {
                    msg: 'The return by date field must contain a valid date. ex. 2017-07-08'
                }
            }
        },
        returned_on: {
            type: DataTypes.DATEONLY
        }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Loan.belongsTo(models.Book, { foreignKey: "book_id" });
                Loan.belongsTo(models.Patron, { foreignKey: "patron_id" });
            }
        }
    });
    return Loan;
};