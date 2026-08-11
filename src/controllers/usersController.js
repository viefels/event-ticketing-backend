import models from '../models/index.js';
import bcrypt from 'bcryptjs';

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already in use' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await models.User.create({ 
        email, 
        password: hashedPassword, 
        name 
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      userId: user.id 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond register new user request' 
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await models.User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
       return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const token = `token-${user.id}`; 
    return res.status(200).json({ 
      success: true, 
      message: 'Logged In successfully', 
      token, 
      profile: { 
        email: user.email, 
        name: user.name, 
        id: user.id 
      } 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server failed to respond to login request' 
    });
  }
}
