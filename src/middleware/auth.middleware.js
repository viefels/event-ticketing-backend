import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET || "mr_v_new_secret_key";

export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    req.user = decoded;
    
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token."
    });
  }
};

export const isOrganizer = (req, res, next) => {
  if (req.user && req.user.role === 'organizer') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: "Access denied. Organizer permissions required."
    });
  }
};

export const isAttendee = (req, res, next) => {
  if (req.user && req.user.role === 'attendee') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: "Access denied. Attendee permissions required."
    });
  }
};

