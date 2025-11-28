import express from 'express';
import {
    submitBuildingApplication,
    submitOccupancyApplication,
    getMyApplications,
    getApplicationByReferenceNo,
    getAllApplications,
    updateApplicationStatus,
    uploadPaymentProof,
} from '../controllers/applicationController.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';
import { imageUpload, documentUpload } from "../middleware/uploadMiddleware.js";
import { uploadRevision } from "../controllers/documentController.js";



const router = express.Router();

// --- User Routes ---
router.post('/building', verifyToken, submitBuildingApplication);
router.post('/occupancy', verifyToken, submitOccupancyApplication);
router.get('/my-applications', verifyToken, getMyApplications);
router.get('/track/:referenceNo', getApplicationByReferenceNo);

// --- Admin Routes ---
router.get(
    '/all', 
    verifyToken, 
    verifyRole(['meoadmin', 'bfpadmin', 'mayoradmin']), 
    getAllApplications
);

router.put(
    '/:id/status',
    verifyToken,
    // ALL admins can update a status
    verifyRole(['meoadmin', 'bfpadmin', 'mayoradmin']), 
    updateApplicationStatus
);


// FILE UPLOAD ROUTES (Payment / Revisions)

// Upload proof of payment (accepts JPG/JPEG/PNG)
router.post(
    '/:id/upload-payment',
    verifyToken,
    imageUpload.single("file"), 
    uploadPaymentProof
);

// Upload revision documents
router.post(
    '/:id/upload-revision',
    verifyToken,
    //allow multiple uploads
    documentUpload.array("files", 10),  
    uploadRevision
);


export default router;