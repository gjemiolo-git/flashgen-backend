const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class QuizQuestion extends Model {
        static associate(models) {
            QuizQuestion.belongsTo(models.Quiz, { foreignKey: 'quiz_id' });
            QuizQuestion.belongsTo(models.Concept, { foreignKey: 'concept_id' });
        }
    }

    QuizQuestion.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        concept_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        question_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        correct_answer: {
            type: DataTypes.TEXT,
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
        modelName: 'QuizQuestion',
        timestamps: false
    });

    return QuizQuestion;
};
