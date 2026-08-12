import models from '../models/index.js';

export async function getMyTicketsByEventId(req, res) {
  try {
    const { uid:userId, role} = req.user;

    const {eventId} = req.params;
    let tickets;

    if(role === "organizer") {

      const isAuthorized = await models.Event.findOne({
        where: {
          id: eventId,
          organizerId: userId
        }
      })

      if(!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view tickets for this event"
        })
      }
      tickets = await models.Ticket.findAll({
        where: { eventId },
        attributes: { 
          exclude: ['updatedAt', 'userId']
        },
        include: [
          { model: models.Event, attributes: ['title', 'date', 'price', 'description'] },
          { model: models.User, attributes: ['name', 'email'] }
        ]
      });
    }
    else{
      const isAuthorized = await models.Booking.findOne({
        where: {
          eventId,
          userId
        }
      })

      if(!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view tickets for this event"
        })
      }

      tickets = await models.Ticket.findAll({
        where: { bookingId: isAuthorized.id },
        attributes: { 
          exclude: ['updatedAt', 'userId']
        },
        include: [
          { model: models.Event, attributes: ['title', 'date', 'price', 'description'] },
          { model: models.User, attributes: ['name', 'email'] }
        ]
      });
    }
    

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
    const { uid:userId, role} = req.user;
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

    if(role === "organizer") {
      const isAuthorized = await models.Event.findOne({
        where: {
          id: ticket.eventId,
          organizerId: userId
        }
      })

      if(!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this ticket"
        })
      }
    }
    else{
      const isAuthorized = await models.Booking.findOne({
        where: {
          eventId: ticket.eventId,
          userId
        }
      })

      if(!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this ticket"
        })
      }
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
