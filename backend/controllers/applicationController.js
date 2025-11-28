import BuildingApplication from '../models/BuildingApplication.js';
import OccupancyApplication from '../models/OccupancyApplication.js';
import User from '../models/User.js';

// LOGIC FOR SUBMITTING APPLICATIONS
export const submitBuildingApplication = async (req, res) => {
    try {
        const applicantId = req.user.userId;
        const { box1, box2, box3, box4 } = req.body;

        if (!box1 || !box2 || !box3 || !box4) {
            return res.status(400).json({ message: 'Missing required form sections' });
        }

        const newApplication = new BuildingApplication({
            applicant: applicantId,
            status: 'Submitted',
            workflowHistory: [
                {
                    status: 'Submitted',
                    comments: 'Application submitted by user.',
                    updatedBy: applicantId,
                },
            ],
            box1,
            box2,
            box3,
            box4,
        });

        const savedApplication = await newApplication.save();

        res.status(201).json({
            message: 'Building application submitted successfully',
            applicationId: savedApplication._id,
            referenceNo: savedApplication.referenceNo, 
        });
    } catch (error) {
        console.error('Error submitting building application:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// LOGIC FOR SUBMITTING OCCUPANCY APPLICATION
export const submitOccupancyApplication = async (req, res) => {
    try {
        const applicantId = req.user.userId;
        // We expect 'buildingPermitIdentifier' which can be an ID OR a Reference No string
        const {
            buildingPermitIdentifier, 
            permitInfo,
            ownerDetails,
            requirementsSubmitted,
            otherDocs,
            projectDetails,
            signatures,
        } = req.body;

        if (!buildingPermitIdentifier || !permitInfo || !projectDetails || !signatures) {
            return res.status(400).json({ message: 'Missing required form fields' });
        }

        // 1. Find the Parent Building Application
        // We construct a query to search by _id (if valid) OR referenceNo
        const query = {
            $or: [
                { referenceNo: buildingPermitIdentifier }
            ]
        };

        // Only add the _id check if the string is a valid MongoDB ObjectId format
        // otherwise Mongoose throws a CastError
        if (mongoose.Types.ObjectId.isValid(buildingPermitIdentifier)) {
            query.$or.push({ _id: buildingPermitIdentifier });
        }

        const parentBuildingApp = await BuildingApplication.findOne(query);

        if (!parentBuildingApp) {
            return res.status(404).json({ 
                message: `Building Permit not found with Reference or ID: ${buildingPermitIdentifier}` 
            });
        }

        // 2. Create the Occupancy Application using the found parent ID
        const newApplication = new OccupancyApplication({
            applicant: applicantId,
            buildingPermit: parentBuildingApp._id, // Link using the actual database _id
            status: 'Submitted',
            workflowHistory: [
                {
                    status: 'Submitted',
                    comments: 'Application submitted by user.',
                    updatedBy: applicantId,
                },
            ],
            permitInfo,
            ownerDetails,
            requirementsSubmitted,
            otherDocs,
            projectDetails,
            signatures,
        });

        const savedApplication = await newApplication.save();

        res.status(201).json({
            message: 'Occupancy application submitted successfully',
            applicationId: savedApplication._id,
            referenceNo: savedApplication.referenceNo, 
        });
    } catch (error) {
        console.error('Error submitting occupancy application:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// LOGIC FOR GETTING USER'S APPLICATIONS
export const getMyApplications = async (req, res) => {
    try {
        const applicantId = req.user.userId;

        const buildingApps = await BuildingApplication.find({ applicant: applicantId })
            .sort({ createdAt: -1 })
            .select('applicationType referenceNo createdAt status'); 

        const occupancyApps = await OccupancyApplication.find({ applicant: applicantId })
            .sort({ createdAt: -1 })
            .select('applicationType referenceNo createdAt status');

        const applications = [...buildingApps, ...occupancyApps].sort(
            (a, b) => b.createdAt - a.createdAt
        );

        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// LOGIC FOR GETTING APPLICATION BY REFERENCE NUMBER
export const getApplicationByReferenceNo = async (req, res) => {
    try {
        const { referenceNo } = req.params;

        const query = { referenceNo: { $regex: new RegExp(`^${referenceNo}$`, 'i') } };

        
        let application = await BuildingApplication.findOne(query)
            .select('applicationType referenceNo createdAt status workflowHistory box1 box2 box3 box4 box5 box6 rejectionDetails documents permit'); 

        if (!application) {
            
            application = await OccupancyApplication.findOne(query)
                .select('applicationType referenceNo createdAt status workflowHistory permitInfo ownerDetails projectDetails signatures assessmentDetails feesDetails rejectionDetails documents');
        }

        if (!application) {
            return res.status(404).json({ message: 'Application not found. Please check your tracking number.' });
        }

        res.status(200).json({ application });
    } catch (error) {
        console.error('Error fetching application by reference number:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// LOGIC FOR GETTING ALL APPLICATIONS (ADMIN ONLY)
export const getAllApplications = async (req, res) => {
    try {
        const buildingApps = await BuildingApplication.find()
            .populate('applicant', 'first_name last_name')
            .sort({ createdAt: -1 });

        const occupancyApps = await OccupancyApplication.find()
            .populate('applicant', 'first_name last_name')
            .sort({ createdAt: -1 });

        const applications = [...buildingApps, ...occupancyApps].sort(
            (a, b) => b.createdAt - a.createdAt
        );

        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// LOGIC FOR UPDATING APPLICATION STATUS (ADMIN ONLY)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { status, comments, missingDocuments, box5, box6 } = req.body;
        const adminUserId = req.user.userId;

  
        let application = await BuildingApplication.findById(id);
        if (!application) {
            application = await OccupancyApplication.findById(id);
        }
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (status) {
            application.status = status;
        }
        
  
        // If status is 'For Correction' or 'Rejected', update rejection details
        if (status === 'For Correction' || status === 'Rejected') {
            application.rejectionDetails = {
                comments: comments || 'No comments provided.',
                missingDocuments: missingDocuments || [],
                isResolved: false, // Mark as unresolved
            };
        }
        // If the application is being resubmitted, clear the rejection
        if (status === 'Submitted' || status === 'Pending MEO') {
             application.rejectionDetails = {
                comments: '',
                missingDocuments: [],
                isResolved: true,
            };
        }

        
        // Update Box 5 or Box 6 if provided (for MEO assessment)
        if (box5) application.box5 = box5;
        if (box6) application.box6 = box6;

        // Add to workflow history
        if (status) {
             application.workflowHistory.push({
                status: status,
       
                comments: comments || `Status updated to ${status} by admin.`,
                updatedBy: adminUserId,
                timestamp: new Date(),
            });
        }

        const updatedApplication = await application.save();
        

        const populatedApp = await updatedApplication.populate('applicant', 'first_name last_name');

        res.status(200).json({ 
            message: 'Application updated successfully',
            application: populatedApp
        });

    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const submitPaymentProof = async (req, res) => {
    try {
        const { id } = req.params;
        const { method, referenceNumber } = req.body;
        
        if (!req.file && method === 'Online') {
            return res.status(400).json({ message: 'Proof of payment image is required for online transactions.' });
        }

        let application = await BuildingApplication.findById(id);
        if (!application) {
            application = await OccupancyApplication.findById(id);
        }

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.paymentDetails = {
            method: method, 
            status: 'Pending', 
            dateSubmitted: new Date(),
            proofOfPaymentFile: req.file ? `/uploads/${req.file.filename}` : null,
            referenceNumber: referenceNumber || null
        };

        application.status = 'Payment Submitted'; 

        application.workflowHistory.push({
            status: 'Payment Submitted',
            comments: `User submitted ${method} payment proof.`,
            updatedBy: req.user.userId,
            timestamp: new Date()
        });

        await application.save();

        res.status(200).json({ message: 'Payment proof submitted successfully', application });

    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const uploadPaymentProof = async (req, res) => {
    try {
        const { appId, applicationType } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded." });
        }

        const Model = applicationType === "Building" ? BuildingApplication : OccupancyApplication;
        const application = await Model.findById(appId);
        
        if (!application) return res.status(404).json({ success: false, message: "Application not found." });

        application.paymentDetails.proofOfPaymentFile = `/uploads/payments/${req.file.filename}`;
        application.paymentDetails.status = "Pending"; // MEO needs to verify this
        application.paymentDetails.dateSubmitted = new Date();

        application.status = "Payment Submitted"; 

        await application.save();

        return res.json({
            success: true,
            message: "Payment proof uploaded successfully.",
            proof: application.paymentDetails.proofOfPaymentFile
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
