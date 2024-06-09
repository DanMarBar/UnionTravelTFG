import db from "../config/Database.js";
import { DataTypes } from "sequelize";
import User from "./UserModel.js";
import CarModel from "./VehicleModel.js";

const VehiclePersonModel = db.define('VehiclePerson', {
    registration: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    year: {
        type: DataTypes.DATE,
        allowNull: true
    },
    operative: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK3dDj0u1JQ-gJt6xPVLnELkr6KhdsQNwiow2ijiC4AQ&s"
    },
}, {
    freezeTableName: true,
    timestamps: false
});

User.belongsToMany(CarModel, { through: VehiclePersonModel });
CarModel.belongsToMany(User, { through: VehiclePersonModel });

User.hasMany(VehiclePersonModel);
VehiclePersonModel.belongsTo(User);

CarModel.hasMany(VehiclePersonModel);
VehiclePersonModel.belongsTo(CarModel);

(async () => {
    await db.sync();
})();

export default VehiclePersonModel;
