import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Storage for Documents (PDF, DOC, DOCX, Images)
const documentsDir = "uploads/documents";
ensureDir(documentsDir);

const docStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, documentsDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

// Allow PDF, Word, and Images (for scanned checklists)
export const documentUpload = multer({
    storage: docStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "image/jpeg",
            "image/png",
            "image/jpg"
        ];
        
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only PDF, Word, and Image files are allowed."));
        }
        cb(null, true);
    }
});

// Keep imageStorage for payment proofs if you want them separate, or just use the one above.
const paymentDir = "uploads/payments";
ensureDir(paymentDir);
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, paymentDir); },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

export const imageUpload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPG, JPEG, PNG images allowed."));
        }
        cb(null, true);
    }
});