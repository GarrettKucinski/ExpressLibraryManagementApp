'use strict';
module.exports = function(sequelize, DataTypes) {
    var Patron = sequelize.define('Patron', {
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        address: DataTypes.STRING,
        email: DataTypes.STRING,
        library_id: DataTypes.STRING,
        zip_code: DataTypes.INTEGER
    }, {
        timestamps: false
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                // Patron.hasMany(models.Loan, { foreignKey: 'patron_id' });
            }
        }
    });
    return Patron;
};