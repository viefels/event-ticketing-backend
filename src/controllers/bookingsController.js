import models from '../models/index.js';
import { getIO } from '../services/socket.js';
import { Op } from 'sequelize';

export async function lockSeat(req, res) {
  try {
    const { seatNumber, eventId, userId } = req.body;
    
    const existingLock = await models.SeatLock.findOne({
      where: {
        seatNumber,
        eventId,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (existingLock) {
      return res.status(409).json({ 
        success: false, 
        error: 'Seat is currently locked' 
      });
    }

    const existingBooking = await models.Booking.findOne({ 
      where: { seatNumber, eventId, status: ['confirmed', 'pending'] } 
    });
    if (existingBooking) {
        return res.status(409).json({ 
          success: false, 
          error: 'Seat is already booked' 
        });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await models.SeatLock.create({
      seatNumber,
      eventId,
      lockedBy: userId,
      lockedAt: new Date(),
      expiresAt
    });

    const io = getIO();
    io.emit('seat-locked', { seatNumber, eventId, userId });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Seat locked temporarily' 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to lock seat request' 
    });
  }
}

export async function bookSeat(req, res) {
  try {
    const { seatNumber, eventId, userId } = req.body;
    
    const lock = await models.SeatLock.findOne({
      where: { seatNumber, eventId, lockedBy: userId }
    });

    if (!lock || lock.expiresAt < new Date()) {
       const existingBooking = await models.Booking.findOne({ 
           where: { seatNumber, eventId, status: ['confirmed', 'pending'] } 
       });
       if (existingBooking) {
           return res.status(409).json({ 
             success: false, 
             error: 'Seat is already booked' 
           });
       }
    }

    const booking = await models.Booking.create({
        status: 'pending',
        seatNumber,
        eventId,
        userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    if (lock) {
      await lock.destroy();
    }

    const io = getIO();
    io.emit('seat-booked', { seatNumber, eventId, bookingId: booking.id });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Seat booked successfully (pending payment)', 
      booking 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to book seat request' 
    });
  }
}
