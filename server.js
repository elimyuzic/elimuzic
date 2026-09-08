const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });
const IMGBB_API_KEY = '6ef3d21b5536496af9bb6de0e7063a10';

let currentAd = null;

app.post('/api/admin/upload-ad', upload.single('adFile'), async (req, res) => {
  if (req.body.adminCode !== '1059') {
    return res.status(403).json({ success: false, message: 'קוד מנהל שגוי' });
  }

  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: 'לא נבחר קובץ' });

  try {
    const formData = new FormData();
    formData.append('image', file.buffer.toString('base64'));

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData, {
      headers: formData.getHeaders()
    });

    currentAd = {
      url: response.data.data.url,
      resource_type: 'image'
    };

    res.json({ success: true, ad: currentAd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'שגיאה בהעלאה ל-ImgBB' });
  }
});

app.get('/api/ad', (req, res) => {
  res.json({ ad: currentAd });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
