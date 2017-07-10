'use strict';
module.exports = function(sequelize, DataTypes) {
    var Book = sequelize.define('Book', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'You must provide a book title.'
                },
            }
        },
        genre: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'You must provide a genre.'
                },
            }
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'You must provide an author'
                },
            }
        },
        first_published: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            validate: {
                not: {
                    args: /[a-zA-Z!@#$%\^&*()_+=[\]{}:;'".,/\\?`~\-<>]/gim,
                    msg: 'The year first published can only contain numbers in the format: ex. 1999'
                }
            }
        }
    });
    Book.associate = function(models) {
        // associations can be defined here
        Book.hasMany(models.Loan, { foreignKey: "book_id" });
    };
    return Book;
};