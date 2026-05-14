import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// కాన్ఫిగరేషన్ సరిగ్గా లోడ్ అయిందో లేదో ఇక్కడ చెక్ చేయండి
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary, // ఇక్కడ నేరుగా పైన కాన్ఫిగర్ చేసిన cloudinary వెళ్తుంది
    params: async (req, file) => {
        return {
            folder: 'Someswari_Pickles_Products',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // డూప్లికేట్ ఫైల్స్ రాకుండా
        };
    },
});

export const upload = multer({ storage });