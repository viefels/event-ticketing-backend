import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('SeatLock', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    seatNumber: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    lockedBy: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }, 
    lockedAt: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    expiresAt: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
  });
};
