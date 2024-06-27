import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import cloudinaryService from '../services/cloudinary.js';
import { db } from '../config/database.js';
import { json } from 'express';
const uploadProfileImage = asyncHandler(async (req, res) => {
  const file = req.file;
  const id = req.params.id;
  try {
    const getUser = await db.users.findOne({ _id: new ObjectId(id) });
    if (!getUser) {
      return (
        res.status(500),
        json({
          message: 'Không tìm thấy tài khoản'
        })
      );
    }

    const uploadFile = await cloudinaryService.updateSingleFile(file.path);
    const updatePicture = { ...getUser, picture: uploadFile.url, pictureId: uploadFile.id };
    await db.users.updateOne({ _id: new ObjectId(id) }, { $set: updatePicture });
    res.status(200).json({
      message: 'Ảnh đại diện đã được cập nhật '
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

const editProfileUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber, gender, dayOfBirth, age, accountType } = req.body;
  const id = req.params.id;
  try {
    const getUser = await db.users.findOne({ _id: new ObjectId(id) });
    if (!getUser) {
      return (
        res.status(500),
        json({
          message: 'Không tìm thấy tài khoản'
        })
      );
    }
    const updatingUser = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phoneNumber && { phoneNumber }),
      ...(gender && { gender }),
      ...(dayOfBirth && { dayOfBirth }),
      ...(age && { age }),
      ...(accountType && { accountType })
    };
    await db.users.updateOne({ _id: new ObjectId(id) }, { $set: updatingUser });
    res.status(200).json({ message: 'Cập nhật dữ liệu thành công ' });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

const userProfile = { uploadProfileImage, editProfileUser };
export default userProfile;
