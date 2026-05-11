const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadService {
  static async uploadFile(file, folder = 'fms') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `fms/${folder}`,
        resource_type: 'auto',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        type: result.resource_type,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('File upload failed');
    }
  }

  static async deleteFile(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}

module.exports = UploadService;
