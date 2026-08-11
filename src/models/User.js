import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('User', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    email: { 
      type: DataTypes.STRING, 
      unique: true, 
      allowNull: false 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    name: { 
      type: DataTypes.STRING,
      allowNull: false 
    },
    role: {
      type: DataTypes.ENUM('attendee', 'organizer'),
      defaultValue: 'attendee',
      allowNull: false
    }
  });
};
