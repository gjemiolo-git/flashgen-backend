const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class FlashcardSet extends Model {
        static associate(models) {
            // Define associations here
            FlashcardSet.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
            FlashcardSet.hasMany(models.Flashcard, { foreignKey: 'setId', as: 'flashcards' });
            FlashcardSet.belongsToMany(models.Topic, { through: 'FlashcardSetTopics', as: 'topics' });
        }
    }

    FlashcardSet.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
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
        modelName: 'FlashcardSet',
        tableName: 'flashcard_sets',
        timestamps: true
    });

    return FlashcardSet;
};
