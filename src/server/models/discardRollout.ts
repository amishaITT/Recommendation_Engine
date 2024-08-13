import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DiscardRollOutAttributes {
    id: number;
    item_id: number;
    item_name: string;
    price: number;
    date: string;
}

interface DiscardRollOutCreationAttributes extends Optional<DiscardRollOutAttributes, 'id'> {}

class DiscardRollOut extends Model<DiscardRollOutAttributes, DiscardRollOutCreationAttributes> implements DiscardRollOutAttributes {
    public date!: string;
    public id!: number;
    public item_id!: number;
    public item_name!: string;
    public price!: number;
}

DiscardRollOut.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        item_name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
    },
    {
        tableName: 'discard_roll_out',
        sequelize,
    }
);

export default DiscardRollOut;
