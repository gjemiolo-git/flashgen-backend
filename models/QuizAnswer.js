const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class QuizAnswer extends Model {
        static associate(models) {
            // define associations here
            QuizAnswer.belongsTo(models.QuizQuestion, { foreignKey: 'question_id' });
        }
    }

    QuizAnswer.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        answer_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'QuizAnswer',
        timestamps: false
    });

    return QuizAnswer;
};
