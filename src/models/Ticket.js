import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Ticket', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true },
    seatNumber: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    qrCode: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    isValidated: { 
      type: DataTypes.BOOLEAN,
      defaultValue: false 
    },
  });
};
