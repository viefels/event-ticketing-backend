import models from '../models/index.js';
import { getIO } from '../services/socket.js';
import { Op } from 'sequelize';

export async function lockSeat(req, res) {
  try {
    const { seatNumbers, eventId } = req.body;
    const userId = req.user.uid;
    
    await models.SeatLock.destroy({ 
      where: { expiresAt: { [Op.lte]: new Date() } } 
    });

    const event = await models.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "The specified eventId does not exist."
      });
    }
    
    const existingLocks = await models.SeatLock.findAll({
      where: { 
        seatNumber: seatNumbers, 
        eventId,
        lockedBy: { [Op.ne]: userId } 
      }
    });

    if (existingLocks.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: "One or more requested seats are currently locked by other users." 
      });
    }

    await models.SeatLock.destroy({
      where: { seatNumber: seatNumbers, eventId, lockedBy: userId }
    });
    
    const activeLockCount = await models.SeatLock.count({
      where: { lockedBy: userId }
    });

    if (activeLockCount + seatNumbers.length > 5) {
      return res.status(403).json({
        success: false,
        error: "You cannot lock more than 5 seats without paying. Please complete your checkout for existing seats."
      });
    }

    const existingTickets = await models.Ticket.findAll({ 
      where: { seatNumber: seatNumbers, eventId } 
    });

    if (existingTickets.length > 0) {
        return res.status(409).json({ 
          success: false, 
          error: "One or more requested seats are already booked."
        });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const lockData = seatNumbers.map(seatNumber => ({
      seatNumber,
      eventId,
      lockedBy: userId,
      lockedAt: new Date(),
      expiresAt
    }));

    await models.SeatLock.bulkCreate(lockData);

    const io = getIO();
    io.emit('seats-locked', { seatNumbers, eventId, userId });
    
    return res.status(200).json({ 
      success: true, 
      message: "Seats locked temporarily"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: "Server failed to respond to lock seat request" 
    });
  }
}
