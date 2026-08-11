import models from '../models/index.js';

export async function createOrder(req, res) {
  try {
    const { bookingId, amount } = req.body;
    
    const booking = await models.Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    if (booking.status !== 'pending') {
       return res.status(400).json({ 
         success: false, 
         error: 'Booking is already confirmed or cancelled' 
       });
    }

    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await models.Payment.create({
      bookingId,
      amount,
      status: 'pending',
      transactionId
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Order created successfully', 
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

    const payment = await models.Payment.findOne({ where: { transactionId }, include: [models.Booking] });
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment record not found' 
      });
    }

    if (success) {
      await payment.update({ status: 'completed' });
      await payment.Booking.update({ status: 'confirmed' });
      
      const ticket = await models.Ticket.create({
        seatNumber: payment.Booking.seatNumber,
        qrCode: `qr_${payment.Booking.id}`, 
        userId: payment.Booking.userId,
        eventId: payment.Booking.eventId,
        bookingId: payment.Booking.id
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Order verified successfully', 
        ticket 
      });
    } else {
      await payment.update({ status: 'failed' });
      await payment.Booking.update({ status: 'cancelled' });
      return res.status(400).json({ 
        success: false, 
        error: 'Payment failed, booking cancelled' 
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
