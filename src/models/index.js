import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/event_ticketing', {
  dialect: 'postgres',
  logging: false,
});

import UserModel from './User.js';
import EventModel from './Event.js';
import BookingModel from './Booking.js';
import TicketModel from './Ticket.js';
import SeatLockModel from './SeatLock.js';
import PaymentModel from './Payment.js';
import ReviewModel from './Review.js';

const models = {
  User: UserModel(sequelize),
  Event: EventModel(sequelize),
  Booking: BookingModel(sequelize),
  Ticket: TicketModel(sequelize),
  SeatLock: SeatLockModel(sequelize),
  Payment: PaymentModel(sequelize),
  Review: ReviewModel(sequelize),
};

// Define relationships
models.User.hasMany(models.Event, { foreignKey: 'organizerId', as: 'events' });
models.Event.belongsTo(models.User, { foreignKey: 'organizerId', as: 'organizer' });

models.User.hasMany(models.Booking, { foreignKey: 'userId' });
models.Booking.belongsTo(models.User, { foreignKey: 'userId' });

models.Event.hasMany(models.Booking, { foreignKey: 'eventId' });
models.Booking.belongsTo(models.Event, { foreignKey: 'eventId' });

models.User.hasMany(models.Ticket, { foreignKey: 'userId' });
models.Ticket.belongsTo(models.User, { foreignKey: 'userId' });

models.Event.hasMany(models.Ticket, { foreignKey: 'eventId' });
models.Ticket.belongsTo(models.Event, { foreignKey: 'eventId' });

models.Event.hasMany(models.SeatLock, { foreignKey: 'eventId' });
models.SeatLock.belongsTo(models.Event, { foreignKey: 'eventId' });

models.User.hasMany(models.Payment, { foreignKey: 'userId' });
models.Payment.belongsTo(models.User, { foreignKey: 'userId' });

models.Event.hasMany(models.Payment, { foreignKey: 'eventId' });
models.Payment.belongsTo(models.Event, { foreignKey: 'eventId' });

// Booking now generated after Payment completes
models.Booking.hasOne(models.Payment, { foreignKey: 'bookingId', as: 'paymentData', constraints: false });

models.Booking.hasMany(models.Ticket, { foreignKey: 'bookingId' });
models.Ticket.belongsTo(models.Booking, { foreignKey: 'bookingId' });

models.User.hasMany(models.Review, { foreignKey: 'userId' });
models.Review.belongsTo(models.User, { foreignKey: 'userId' });

models.Event.hasMany(models.Review, { foreignKey: 'eventId' });
models.Review.belongsTo(models.Event, { foreignKey: 'eventId' });

// We sync the tables automatically for now (for development purposes)
sequelize.sync({ alter: true }).catch(err => console.error('DB Sync Error:', err));

export { sequelize };
export default models;
