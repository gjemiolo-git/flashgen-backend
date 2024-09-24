const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Topic extends Model {
        static associate(models) {
            Topic.belongsTo(models.Topic, { as: 'parent', foreignKey: 'parent_id' });
            Topic.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by' });
        }
    }

    Topic.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Topic',
        timestamps: false
    });

    return Topic;
};
