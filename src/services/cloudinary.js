import { v2 as cloudinary } from 'cloudinary';
import { error } from 'console';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
});

const updateSingleFile = (filePath, folder = 'x19fp') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { resource_type: 'auto', folder: folder },
      (error, result) => {
        if (error) {
          reject(error);
          throw new error();
        } else {
          fs.unlinkSync(filePath);
          resolve({
            url: result.secure_url,
            id: result.public_id
          });
        }
      }
    );
  });
};

const deleteSingleFile = (publicId, folder = 'x19fp') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      {
        type: 'upload',
        resource_type: 'auto',
        folder: folder
      },
      (error, result) => {
        if (error) {
          reject(error);
          throw new error();
        } else {
          resolve({
            result: result
          });
        }
      }
    );
  });
};

const cloudinaryService = {
  updateSingleFile,
  deleteSingleFile
};
export default cloudinaryService;
