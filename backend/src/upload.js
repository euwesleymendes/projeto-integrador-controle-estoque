const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const pastaUploads = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
fs.mkdirSync(pastaUploads, { recursive: true });

const storage = multer.diskStorage({
  destination: pastaUploads,
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extensao}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      const erro = new Error('Envie um arquivo de imagem');
      erro.code = 'IMAGEM_INVALIDA';
      return cb(erro);
    }
    cb(null, true);
  },
});

module.exports = { upload, pastaUploads };
