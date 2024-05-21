import db from "../config/database.js";
import {DataTypes} from "sequelize";
import User from "./UserModel.js";
import Group from "./GroupModel.js";

const GroupPersonModel = db.define('GroupPerson', {
        isUserLeader: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        userStartPoint: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userEndPoint: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        freezeTableName: true,
        timestamps: false
    }
);

User.belongsToMany(Group, {through: GroupPersonModel});
Group.belongsToMany(User, {through: GroupPersonModel});

User.hasMany(GroupPersonModel);
GroupPersonModel.belongsTo(User);

Group.hasMany(GroupPersonModel);
GroupPersonModel.belongsTo(Group);

(async () => {
    await db.sync();
})();

export default GroupPersonModel;