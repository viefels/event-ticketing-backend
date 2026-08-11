import models from '../models/index.js';

export async function createOrder(req, res) {
  try {
    const { seatNumbers, eventId, amount } = req.body;
    const userId = req.user.uid;

    const seatLocks = await models.SeatLock.findAll({ 
      where: { seatNumber: seatNumbers, eventId, lockedBy: userId } 
    });
    
    if (seatLocks.length !== seatNumbers.length || seatLocks.some(l => l.expiresAt < new Date())) {
       return res.status(400).json({ 
          success: false, 
          error: 'You do not hold active locks for all requested seats or some expired' 
       });
    }

    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await models.Payment.create({
      userId,
      eventId,
      seatNumbers,
      amount,
      status: 'pending',
      transactionId,
      trials: 0
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
    const { transactionId, success } = req.body;

    const payment = await models.Payment.findOne({ 
      where: { transactionId } 
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order has already been processed' 
      });
    }

    if (success) {
      await payment.update({ status: 'completed' });
      
      const booking = await models.Booking.create({
        status: 'confirmed',
        eventId: payment.eventId,
        userId: payment.userId,
      });
      
      const ticketData = payment.seatNumbers.map(seatNumber => ({
        seatNumber,
        qrCode: `qr_${booking.id}_${seatNumber}`, 
        userId: payment.userId,
        eventId: payment.eventId,
        bookingId: booking.id
      }));

      const tickets = await models.Ticket.bulkCreate(ticketData);

      // Erase Locks array explicitly!
      await models.SeatLock.destroy({ 
        where: { seatNumber: payment.seatNumbers, eventId: payment.eventId } 
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Order verified successfully. Cart moved to Bookings.', 
        booking,
        tickets 
      });
    } else {
      
      const updatedTrials = payment.trials + 1;
      
      const expired = new Date() > new Date(payment.createdAt.getTime() + 10 * 60 * 1000);

      if (updatedTrials >= 5 || expired) {
        await payment.update({ status: 'failed', trials: updatedTrials });
        await models.SeatLock.destroy({ 
          where: { seatNumber: payment.seatNumbers, eventId: payment.eventId } 
        });
        
        return res.status(400).json({ 
          success: false, 
          error: expired ? 'Checkout time expired (10 minutes).' : 'Maximum payment trials (5) exceeded. Locks destroyed.' 
        });
      } else {
        await payment.update({ trials: updatedTrials });
        return res.status(400).json({ 
          success: false, 
          error: `Payment failed. You have ${5 - updatedTrials} attempts remaining.` 
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to verify order request' 
    });
  }
}
