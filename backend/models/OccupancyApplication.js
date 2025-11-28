import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FeeItemSchema = new Schema({
    particular: { type: String, required: true },
    amount: { type: Number, required: true }
});


const OccupancyApplicationSchema = new Schema(
    {
        applicant: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        buildingPermit: {
            type: Schema.Types.ObjectId,
            ref: 'BuildingApplication',
            required: true,
        },

        // --- ADDED THESE FIELDS TO MATCH BUILDING APPLICATION ---
        applicationType: { type: String, default: 'Occupancy' }, 
        referenceNo: { type: String, unique: true }, 
        // -------------------------------------------------------
    
        status: {
            type: String,
            enum: [
                'Submitted',
                'Pending MEO',
                'Payment Submitted',
                'Pending BFP',
                'Pending Mayor',
                'Approved',
                'Rejected',
                'Permit Issued',
            ],
            default: 'Submitted',
        },
        // Section 1: Permit Info
        permitInfo: {
            buildingPermitNo: { type: String, required: true },
            buildingPermitDate: { type: Date, required: true },
            fsecNo: { type: String, required: true },
            fsecDate: { type: Date, required: true },
        },
        // Section 2: Owner Details 
        ownerDetails: {
            lastName: { type: String },
            givenName: { type: String },
            middleInitial: { type: String },
            address: { type: String },
            zip: { type: Number },
            telNo: { type: Number },
        },
        // Section 3: Requirements
        requirementsSubmitted: {
            type: [String], 
        },
        otherDocs: { type: String },
        // Section 4: Project Details
        projectDetails: {
            projectName: { type: String, required: true },
            projectLocation: { type: String, required: true },
            occupancyUse: { type: String, required: true },
            noStoreys: { type: Number, required: true },
            noUnits: { type: Number },
            totalFloorArea: { type: Number }, 
            dateCompletion: { type: Date, required: true },
        },
        // Section 5: Signatures
        signatures: {
            ownerName: { type: String, required: true },
            inspectorName: { type: String, required: true },
            engineerName: { type: String, required: true },
        },


        assessmentDetails: {
            assessedBy: { type: String },
            reviewedBy: { type: String },
            notedBy: { type: String },
            date: { type: Date, default: Date.now },
        },

        // Fees Assessment (Equivalent to Box 6)
        feesDetails: {
            fees: [FeeItemSchema],
            totalAmountDue: { type: Number, default: 0 },
        },

        rejectionDetails: {
          comments: { type: String, default: '' },
          missingDocuments: [{ type: String }],
          isResolved: { type: Boolean, default: false }
        },

        workflowHistory: [
            {
                status: { type: String, required: true },
                comments: { type: String },
                updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
                timestamp: { type: Date, default: Date.now },
            },
        ],

        paymentDetails: {
            method: { type: String, enum: ['Walk-In', 'Online'], default: null },
            status: { type: String, enum: ['Pending', 'Verified', 'Failed'], default: 'Pending' },
            referenceNumber: { type: String }, // e.g., GCash Ref No.
            proofOfPaymentFile: { type: String }, // Path to the uploaded receipt image
            dateSubmitted: { type: Date },
            amountPaid: { type: Number }
            },
        },
    { timestamps: true }
);

// --- ADDED PRE-SAVE HOOK TO GENERATE REFERENCE NO ---
OccupancyApplicationSchema.pre('save', async function (next) {
    if (this.isNew && !this.referenceNo) {
        // Generates a unique ID starting with "O-" for Occupancy
        this.referenceNo = `O-${Date.now()}`;
    }
    next();
});
// ----------------------------------------------------

export default mongoose.model(
    'OccupancyApplication',
    OccupancyApplicationSchema
);