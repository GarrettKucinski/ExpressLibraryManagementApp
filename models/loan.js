'use strict';
module.exports = function(sequelize, DataTypes) {
    var Loan = sequelize.define('Loan', {
        book_id: DataTypes.INTEGER,
        patron_id: DataTypes.INTEGER,
        loaned_on: {
            type: DataTypes.DATEONLY,
            defaultValue: null
        },
        return_by: {
            type: DataTypes.DATEONLY,
            defaultValue: null
        },
        returned_on: {
            type: DataTypes.DATEONLY,
            defaultValue: null
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