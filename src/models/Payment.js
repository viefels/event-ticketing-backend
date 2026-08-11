import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
    transactionId: { type: DataTypes.STRING, unique: true },
  });
};
