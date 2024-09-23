const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Quiz extends Model {
        static associate(models) {
            // define associations here
            Quiz.belongsTo(models.Topic, { foreignKey: 'topic_id' });
            Quiz.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by' });
        }
    }

    Quiz.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        topic_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        difficulty: {
            type: DataTypes.ENUM('easy', 'medium', 'hard'),
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
        modelName: 'Quiz',
        timestamps: false
    });

    return Quiz;
};
