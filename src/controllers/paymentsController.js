import models from '../models/index.js';
import { Op } from 'sequelize';

export async function createOrder(req, res) {
  try {
    const { eventId } = req.body;
    const userId = req.user.uid;

    await models.SeatLock.destroy({ 
      where: { expiresAt: { [Op.lt]: new Date() } } 
    });

    const event = await models.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const seatLocks = await models.SeatLock.findAll({ 
      where: { eventId, lockedBy: userId } 
    });
    
    const seatNumbers = seatLocks.map(lock => lock.seatNumber);

    if (seatLocks.length === 0) {
       return res.status(400).json({ 
          success: false, 
          error: 'You do not hold any active seat locks for this event' 
       });
    }

    const amount = event.price * seatNumbers.length;

    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await models.Payment.create({
      userId,
      eventId,
      seatNumbers,
      amount,
      status: 'pending',
      transactionId
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Order initiated for checkout verification', 
      payment 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to create order request' 
    });
  }
}

export async function verifyOrder(req, res) {
  try {
    const { transactionId} = req.body;

    const payment = await models.Payment.findOne({ 
      where: { transactionId } 
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }


    if (payment.status === 'completed') {
      const existingTickets = await models.Ticket.findAll({
        where: {
          eventId: payment.eventId,
          userId: payment.userId,
          seatNumber: payment.seatNumbers
        }
      });

      if (existingTickets.length > 0) {
        let booking = null;
        if (existingTickets[0].bookingId) {
          booking = await models.Booking.findByPk(existingTickets[0].bookingId);
        }
        return res.status(200).json({ 
          success: true, 
          message: 'Order already verified. Tickets were previously generated.', 
          booking,
          tickets: existingTickets 
        });
      }

      const booking = await models.Booking.create({
        status: 'confirmed',
        eventId: payment.eventId,
        userId: payment.userId,
      });

      await models.Payment.update(
        { bookingId: booking.id },
        { where: { id: payment.id } }
      );
      
      const ticketData = payment.seatNumbers.map(seatNumber => ({
        seatNumber,
        qrCode: `qr_${booking.id}_${seatNumber}`, 
        userId: payment.userId,
        eventId: payment.eventId,
        bookingId: booking.id
      }));

      const tickets = await models.Ticket.bulkCreate(ticketData);

      await models.SeatLock.update(
        { expiresAt: new Date('2099-12-31T23:59:59.999Z') }, 
        { where: { seatNumber: payment.seatNumbers, eventId: payment.eventId } }
      );

      await models.Event.decrement('availableSeats', {
        by: payment.seatNumbers.length,
        where: { id: payment.eventId }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Order verified successfully. Cart moved to Bookings.', 
        booking,
        tickets 
      });
    } else if (payment.status === 'pending') {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

      const expiredPayments = await models.Payment.findAll({
        where: {
          userId: req.user.uid,
          status: 'pending',
          createdAt: { [Op.lt]: tenMinsAgo }
        }
      });

      for (const expPayment of expiredPayments) {
        await expPayment.update({ status: 'failed' });
        await models.SeatLock.destroy({ 
          where: { seatNumber: expPayment.seatNumbers, eventId: expPayment.eventId } 
        });
      }

      if (payment.createdAt < tenMinsAgo) {
        return res.status(400).json({ 
          success: false, 
          error: 'Checkout time expired (10 minutes). Locks destroyed.' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Payment is still pending. Please complete the purchase.' 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Order has already failed or been processed.' 
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to verify order request' 
    });
  }
}
