import { DataTypes } from 'sequelize';
import db from '../config/Database.js';
import User from './UserModel.js';

const InvoiceModel = db.define('Invoice', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: false,
});

// Establecer la relación entre User e Invoice
User.hasMany(InvoiceModel, { foreignKey: 'userId' });
InvoiceModel.belongsTo(User, { foreignKey: 'userId' });

(async () => {
    await db.sync();
})();

export default InvoiceModel;
