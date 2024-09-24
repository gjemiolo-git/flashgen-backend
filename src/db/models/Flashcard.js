const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Flashcard extends Model {
        static associate(models) {
            // Define associations here
            Flashcard.belongsTo(models.FlashcardSet, { foreignKey: 'setId', as: 'set' });
            Flashcard.belongsToMany(models.Topic, { through: 'FlashcardTopics', as: 'topics' });
        }
    }

    Flashcard.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        setId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'FlashcardSets',
                key: 'id'
            }
        },
        frontContent: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        backContent: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Flashcard',
        tableName: 'flashcards',
        timestamps: true
    });

    return Flashcard;
};
