const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        last_login: {
            type: DataTypes.DATE
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        role: {
            type: DataTypes.STRING(20),
            defaultValue: 'user'
        }
    }, {
        sequelize,
        modelName: 'User',
        timestamps: false
    });

    return User;
};
