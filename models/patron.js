'use strict';
module.exports = function(sequelize, DataTypes) {
    var Patron = sequelize.define('Patron', {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'You must enter a first name for this patron.'
                }
            }
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'You must enter a last name for this patron.'
                }
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'You must enter an address for this patron.'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Patron email field cannot be empty.'
                },
                isEmail: {
                    msg: 'You must enter an valid email for this patron. ex. person@website.com'
                }
            }
        },
        library_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'The library id cannot be blank.'
                }
            }
        },
        zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: /[a-zA-Z!@#$%\^&*()_+=[\]{}:;'".,/\\?`~\-<>]/gim,
                    msg: 'The zip code can only contain the numbers 0-9'
                },
                notEmpty: {
                    msg: 'You must enter a valid zip code'
                }
            }
        }
    }, {
        getterMethods: {
            full_name() {
                return `${ this.first_name } ${ this.last_name }`;
            }
        },
        setterMethods: {
            full_name(full_name) {
                var split = full_name.split('');
                this.first_name = split[0];
                this.last_name = split[1];
            }
        },
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Patron.hasMany(models.Loan, { foreignKey: 'patron_id' });
            }
        }
    });
    return Patron;
};