import db from "../config/Database.js";
import { DataTypes } from "sequelize";
import PlaceModel from "./PlaceModel.js";
import VehiclePersonModel from "./VehiclePersonModel.js";

const GroupModel = db.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    arrivalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    departureDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    route: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    placeId: {
        type: DataTypes.INTEGER,
        references: {
            model: PlaceModel,
            key: 'id'
        }
    },
    registration: {
        type: DataTypes.STRING,
        references: {
            model: VehiclePersonModel,
            key: 'registration'
        }
    }
}, {
    freezeTableName: true,
    timestamps: false
});

GroupModel.belongsTo(PlaceModel, { foreignKey: 'placeId' });
PlaceModel.hasMany(GroupModel, { foreignKey: 'placeId' });

GroupModel.belongsTo(VehiclePersonModel, { foreignKey: 'registration', targetKey: 'registration' });
VehiclePersonModel.hasMany(GroupModel, { foreignKey: 'registration', sourceKey: 'registration' });

(async () => {
    await db.sync();
})();

export default GroupModel;
