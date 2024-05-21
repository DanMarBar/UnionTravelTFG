import db from "../config/database.js";
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
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
    },
    surname: {
        type: DataTypes.STRING,
    },
    birthday: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    cellphone: {
        type: DataTypes.STRING,
    },
    secondCellphone: {
        type: DataTypes.STRING,
    },
    direction: {
        type: DataTypes.STRING,
    },
    zip: {
        type: DataTypes.STRING,
    },
    profilePhoto: {
        type: DataTypes.STRING,
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