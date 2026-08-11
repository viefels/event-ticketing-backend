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
      price
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

    await event.update({ title, description, date, totalSeats, availableSeats, price });
    return res.status(200).json({ 
      success: true, 
      message: `Event ${id} updated`, 
      event 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to update event request' 
    });
  }
}
