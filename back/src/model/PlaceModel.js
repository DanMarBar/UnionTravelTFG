import db from "../config/database.js";
import {DataTypes} from "sequelize";

const Place = db.define('Place', {
    name: {
        type: DataTypes.STRING,
    },
    localization: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
}, {
    freezeTableName: true,
    timestamps: false,
});


(async () => {
    await db.sync();
})();

export default Place;