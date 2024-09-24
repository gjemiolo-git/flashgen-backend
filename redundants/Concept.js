const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Concept extends Model {
        static associate(models) {
            Concept.belongsTo(models.Topic, { foreignKey: 'topic_id' });
            Concept.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by' });
        }
    }

    Concept.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        topic_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        explanation: {
            type: DataTypes.TEXT
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        source_type: {
            type: DataTypes.ENUM('user-generated', 'llm-generated', 'admin-created'),
            allowNull: false
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
        modelName: 'Concept',
        timestamps: false
    });

    return Concept;
};
