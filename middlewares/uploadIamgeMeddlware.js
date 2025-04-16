const multer = require("multer")
const { v4: uuidv4 } = require('uuid');
const apiError = require("../utils/apiError");



exports.uploadSingleImage = (fileName, storageFile) => {
    const multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `uploads/${storageFile}`)
        },
        filename: function (req, file, cb) {
            const ext = file.mimetype.split("/")[1]
            const fileName = `categroy-${uuidv4()}-${Date.now()}.${ext}`
            req.body.image = fileName;
            cb(null, fileName)
        },
    })
    const multerFilter = (req, file, cb) => {
        if (file.mimetype.startsWith("image")) {
            cb(null, true)
        } else {
            cb(new apiError("You Can Uplaode Just Images"), false)
        }
    }
    const upload = multer({ storage: multerStorage, fileFilter: multerFilter })
    return upload.single(fileName)
}
