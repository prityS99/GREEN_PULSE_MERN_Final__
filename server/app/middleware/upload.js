const multer = require('multer');
const path = require('path');
const fs = require('fs');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp'
};

// Ensure upload directory exists so Multer never crashes
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Fallback to extension if something goes strange, or extract safely
        const extension = FILE_TYPE_MAP[file.mimetype] || path.extname(file.originalname).substring(1);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
  const isValid = FILE_TYPE_MAP[file.mimetype];

  if (isValid) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid image type! Only PNG, JPG, JPEG, GIF, BMP, WEBP allowed"),
      false
    );
  }
};

const Upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024  // 2MB limit
    }
});

module.exports = Upload;