'use strict';
module.exports = function(sequelize, DataTypes) {
    var Book = sequelize.define('Book', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        genre: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        first_published: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            validate: {
                not: /[a-zA-Z!@#$%\^&*()_+=[\]{}:;'".,/\\?`~\-<>]/gim
            }
        }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Book.hasMany(models.Loan, { foreignKey: "book_id" });
            }
        }
    });
    return Book;
};