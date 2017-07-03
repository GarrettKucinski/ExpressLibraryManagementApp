'use strict';
module.exports = function(sequelize, DataTypes) {
    var Book = sequelize.define('Book', {
        title: DataTypes.STRING,
        genre: DataTypes.STRING,
        author: DataTypes.STRING,
        first_published: DataTypes.INTEGER
    }, {
        timestamps: false
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Book.hasMany(models.Loan, { foreignKey: 'book_id' });
            }
        }
    });
    return Book;
};