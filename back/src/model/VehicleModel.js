import db from "../config/database.js";
import {DataTypes} from "sequelize";

const VehicleModel = db.define('Car', {
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        year: {
            type: DataTypes.DATE,
            allowNull: true
        },
        seats: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: true
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        freezeTableName: true,
        timestamps: false
    }
);

(async () => {
    await db.sync();
})();

export default VehicleModel;