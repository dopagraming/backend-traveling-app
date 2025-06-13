const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerOptions = () => {
  // 1) DiskStorage engine
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const ext = file.mimetype.split('/')[1];
      const filename = `user-${Date.now()}.${ext}`;
      cb(null, filename);
    },
  });

  // 2) Memory Storage engine
  // const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only Images allowed', 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);