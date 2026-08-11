import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Booking', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    status: { 
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'), 
      defaultValue: 'pending' 
    },
    expiresAt: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
  });
};
