import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Event', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    description: { 
      type: DataTypes.TEXT 
    },
    date: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    totalSeats: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    availableSeats: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    price: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
  });
};
