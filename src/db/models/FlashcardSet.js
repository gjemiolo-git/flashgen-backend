const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class FlashcardSet extends Model {
        static associate(models) {
            FlashcardSet.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
            FlashcardSet.hasMany(models.Flashcard, { foreignKey: 'setId', as: 'flashcards', onDelete: 'Cascade' });
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
        visibility: {
            type: DataTypes.ENUM('public', 'restricted', 'private'),
            allowNull: false,
            defaultValue: 'public'
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
        timestamps: true
    });

    return FlashcardSet;
};
