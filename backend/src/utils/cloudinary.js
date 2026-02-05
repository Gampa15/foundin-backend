const cloudinary = require('cloudinary').v2;

const hasUrl = Boolean(process.env.CLOUDINARY_URL);
const hasCreds = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const cloudinaryEnabled = hasUrl || hasCreds;

if (hasUrl) {
  try {
    const parsed = new URL(process.env.CLOUDINARY_URL);
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: parsed.password,
      secure: true
    });
  } catch (err) {
    // Fall back to SDK URL config if parsing fails
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL
    });
  }
} else if (hasCreds) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
    stream.end(buffer);
  });

module.exports = {
  cloudinary,
  cloudinaryEnabled,
  uploadBuffer
};
