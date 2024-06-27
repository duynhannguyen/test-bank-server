import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';
import { OAuth2Client } from 'google-auth-library';
import user from './user.controller.js';

const signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, gender, accountType } = req.body;

  // 1. Check duplicate
  const existingUser = await db.users.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email đã được sử dụng!');
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create new user
  const newUser = {
    email,
    firstName,
    lastName,
    phoneNumber,
    gender,
    accountType,
    likes: [],
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 4. Add to database
  await db.users.insertOne(newUser);

  const createdUser = await db.users.findOne(
    { email },
    {
      projection: {
        password: 0
      }
    }
  );

  // 5. Response to client
  res.status(201).json(createdUser);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  // 1. Check email
  const existingUser = await db.users.findOne({ email });
  if (!existingUser) {
    res.status(400);
    throw new Error('Tài khoản không tồn tại!');
  }

  // 2. Check password
  const isMatchedPassword = await bcrypt.compare(password, existingUser.password);

  if (!isMatchedPassword) {
    res.status(400);
    throw new Error('Email hoặc mật khẩu không chính xác!');
  }

  // 3. Phát hành 1 tấm vé (accessToken) bằng JSON Web Token
  const payload = {
    id: existingUser._id,
    email: existingUser.email,
    fullname: existingUser.firstName + existingUser.lastName
  };
  const SECRET_KEY = process.env.SECRET_KEY;

  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });

  //  4. Response
  res.json({
    message: 'Login successfully',
    accessToken: token
  });
});

const verifyGoogleAccount = asyncHandler(async (req, res) => {
  const { clientId, credential } = req.body;
  const client = new OAuth2Client();
  const verifyToken = await client.verifyIdToken({
    idToken: credential,
    audience: clientId
  });
  const googlePayload = verifyToken.getPayload();
  const { email, picture, given_name, family_name } = googlePayload;
  const existingUser = await db.users.findOne({ email });

  if (existingUser) {
  } else {
    const newUser = {
      email,
      firstName: given_name,
      lastName: family_name,
      picture: picture,
      accountType: 'Học viên',
      thirdparty: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.users.insertOne(newUser);
  }
  const user = await db.users.findOne({ email });
  const payload = {
    id: user._id,
    email: user.email,
    fullname: user.firstName + user.lastName
  };

  const SECRET_KEY = process.env.SECRET_KEY;

  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });

  res.status(200).json({
    message: 'login successfully',
    accessToken: token
  });
});

const fetchCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const currentUser = await db.users.findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        password: 0
      }
    }
  );

  if (!currentUser) {
    res.status(401);
    throw new Error('Unauthorized, please try again!');
  }

  res.json(currentUser);
});

const getUserByNameOrId = asyncHandler(async (req, res) => {
  const limit = req.query.limit;
  const user = decodeURIComponent(req.query.user);
  const checkValidId = user => {
    if (user.length === 24 && /^[a-f0-9]{24}$/) {
      return user;
    }
  };
  const idValue = checkValidId(user);
  try {
    let getuser;
    if (idValue) {
      getuser = await db.users
        .find({
          _id: new ObjectId(idValue)
        })
        .limit(+limit)
        .toArray();
    } else {
      getuser = await db.users
        .find({ lastName: { $regex: `.*${user}.*`, $options: 'i' } })
        .limit(+limit)
        .toArray();
    }

    if (!getuser) {
      return res.status(500).json({
        message: 'Không tìm thấy tài khoản'
      });
    }
    res.status(200).json({
      result: getuser
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Tìm tài khoản thất bại',
      errors: error
    });
  }
});

const AuthController = {
  signup,
  login,
  verifyGoogleAccount,
  fetchCurrentUser,
  getUserByNameOrId
};

export default AuthController;
