const fs = require('fs');
const path = require('path');

const uploadDir =
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = uploadDir;
