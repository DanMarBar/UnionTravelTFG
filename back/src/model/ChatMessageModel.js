import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import UserModel from './UserModel.js';
import GroupModel from './GroupModel.js';

const ChatMessageModel = db.define('ChatMessage', {
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    groupId: {
        type: DataTypes.INTEGER,
        references: {
            model: GroupModel,
            key: 'id'
        }
    }
}, {
    freezeTableName: true,
    timestamps: false
});

ChatMessageModel.belongsTo(UserModel, { foreignKey: 'userId' });
ChatMessageModel.belongsTo(GroupModel, { foreignKey: 'groupId' });

(async () => {
    await db.sync();
})();

export default ChatMessageModel;
