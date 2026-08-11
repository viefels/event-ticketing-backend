import models from '../models/index.js';

export async function createEvent(req, res) {
  try {
    const { title, description, date, totalSeats, price } = req.body;
    const event = await models.Event.create({
      title,
      description,
      date,
      totalSeats,
      availableSeats: totalSeats,
      price,
      organizerId: req.user.uid
    });
    return res.status(201).json({ 
      success: true, 
      message: 'Event created successfully', 
      event 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to create event request' 
    });
  }
}

export async function getEvents(req, res) {
  try {
    const events = await models.Event.findAll({
      order: [['date', 'ASC']]
    });
    return res.status(200).json({ 
      success: true, 
      events 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to fetch events request' 
    });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, date, totalSeats, availableSeats, price } = req.body;
    
    const event = await models.Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }

    if (event.organizerId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only modify events you created."
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (totalSeats !== undefined) updates.totalSeats = totalSeats;
    if (availableSeats !== undefined) updates.availableSeats = availableSeats;
    if (price !== undefined) updates.price = price;

    
    if(!updates){
      return res.status(400).json({ 
        success: false, 
        message: 'No updates provided' 
      });
    }
    const updatedEvent = await event.update(updates);

    return res.status(200).json({ 
      success: true, 
      message: `Event ${id} updated`, 
      event: updatedEvent 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to update event request' 
    });
  }
}
