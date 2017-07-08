'use strict';
module.exports = function(sequelize, DataTypes) {
    var Patron = sequelize.define('Patron', {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        library_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: /[a-zA-Z!@#$%\^&*()_+=[\]{}:;'".,/\\?`~\-<>]/gim,
                notEmpty: false
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