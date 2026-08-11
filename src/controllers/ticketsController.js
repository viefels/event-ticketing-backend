import models from '../models/index.js';

export async function getMyTickets(req, res) {
  try {
    const { userId } = req.query; 
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const tickets = await models.Ticket.findAll({
      where: { userId },
      include: [{ model: models.Event, attributes: ['title', 'date'] }]
    });

    return res.status(200).json({ 
      success: true, 
      tickets 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to fetch tickets request' 
    });
  }
}

export async function getTicketById(req, res) {
  try {
    const { ticketId } = req.params;
    const ticket = await models.Ticket.findByPk(ticketId, {
      include: [
        { model: models.Event, attributes: ['title', 'date', 'price'] },
        { model: models.User, attributes: ['name', 'email'] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ticket not found' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      ticket 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to fetch ticket metadata request' 
    });
  }
}

export async function validateTicket(req, res) {
  try {
    const { ticketId, qrCode } = req.body;
    
    const ticket = await models.Ticket.findOne({ where: { id: ticketId, qrCode } });

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ticket not found or invalid QR code' 
      });
    }

    if (ticket.isValidated) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ticket has already been used' 
      });
    }

    await ticket.update({ isValidated: true });
    return res.status(200).json({ 
      success: true, 
      message: 'Ticket validated successfully', 
      ticket 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to validate ticket request' 
    });
  }
}
