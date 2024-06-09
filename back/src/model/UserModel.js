import db from "../config/Database.js";
import {DataTypes} from "sequelize";

const User = db.define('User', {
    user: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tempPassword: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tempPasswordCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    surname: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    birthday: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    cellphone: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    secondCellphone: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    direction: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    zip: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    profilePhoto: {
        type: DataTypes.STRING,
        defaultValue: 'uploads/DefaultProfilePhoto.jpeg'
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
    },
}, {
    freezeTableName: true,
    timestamps: false,
});

(async () => {
    await db.sync();
})();

export default User;