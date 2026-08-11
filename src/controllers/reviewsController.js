import models from '../models/index.js';

export async function createReview(req, res) {
  try {
    const { rating, comment, eventId } = req.body;
    const userId = req.user.uid;

    const review = await models.Review.create({
      rating,
      comment,
      userId,
      eventId
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Review created successfully', 
      review 
    });
  } catch (error) {
    console.log(error);
    if (error.name === 'SequelizeValidationError') {
       return res.status(400).json({ 
         success: false, 
         error: error.errors.map(e => e.message).join(', ') 
       });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to create review request' 
    });
  }
}

export async function getReviewsByEvent(req, res) {
  try {
    const { eventId } = req.params;
    
    const reviews = await models.Review.findAll({
      where: { eventId },
      include: [{ model: models.User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ 
      success: true, 
      reviews 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to fetch reviews request' 
    });
  }
}
