'use strict';
module.exports = function(sequelize, DataTypes) {
    var Loan = sequelize.define('Loan', {
        book_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: true,
            }
        },
        patron_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: true,
            }
        },
        loaned_on: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: true,
                is: /[0-9]\-/gim,
                isDate: true,
            }
        },
        return_by: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: true,
                is: /[0-9]\-/gim,
                isDate: true,
            }
        },
        returned_on: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: true,
                is: /[0-9]\-/gim,
                isDate: true,
            }
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