import mongoose from 'mongoose';

const Schema = mongoose.Schema;


// Box 1: Owner, Enterprise, Location, Scope, Occupancy, Project Stats
const Box1Schema = new Schema({
    owner: {
        lastName: { type: String, required: true }, //
        firstName: { type: String, required: true },
        middleInitial: { type: String }
    },
    enterprise: {
        formOfOwnership: { type: String },
        projectTitle: { type: String },
        address: {
            no: { type: Number },
            street: { type: String },
            barangay: { type: String },
            city: { type: String },
            zip: { type: Number },
            telNo: { type: Number }
        }
    },
    location: {
        lotNo: { type: String, required: true }, //
        blkNo: { type: Number },
        tctNo: { type: Number, required: true },
        taxDecNo: { type: Number, required: true },
        street: { type: String, required: true },
        barangay: { type: String, required: true },
        city: { type: String, required: true }
    },
    scopeOfWork: [{ type: String }], 
    occupancy: {
        group: { type: String, required: true }, 
        classified: { type: String } 
    },
    projectDetails: {
        numberOfUnits: { type: Number },
        totalEstimatedCost: { type: Number, required: true }, 
        totalFloorArea: { type: Number },
        lotArea: { type: Number },
        proposedConstruction: { type: Date },
        expectedCompletion: { type: Date }
    }
});

// Box 2: Architect / Civil Engineer
const Box2Schema = new Schema({
    name: { type: String, required: true },
    date: { type: Date },
    address: { type: String },
    prcNo: { type: Number, required: true },
    validity: { type: Date },
    ptrNo: { type: Number, required: true },
    ptrDate: { type: Date },
    issuedAt: { type: String },
    tin: { type: Number }
});

// Box 3: Applicant (Signature)
const Box3Schema = new Schema({
    name: { type: String, required: true },
    date: { type: Date },
    address: { type: String },
    ctcNo: { type: Number },
    dateIssued: { type: Date },
    placeIssued: { type: String }
});

// Box 4: Lot Owner Consent
const Box4Schema = new Schema({
    name: { type: String },
    date: { type: Date },
    address: { type: String },
    tctNo: { type: Number },
    taxDecNo: { type: Number },
    placeIssued: { type: String }
});

// Box 5: Notary (Admin/Legal Fill)
const Box5Schema = new Schema({
    assessedBy: { type: String },
    reviewedBy: { type: String },
    notedBy: { type: String },
    date: { type: Date, default: Date.now },
    // Notary specific fields
    docNo: String,
    pageNo: String,
    bookNo: String,
    seriesOf: String,
    notaryPublicDate: Date
});

// Box 6: Assessed Fees (MEO Admin Fill)
const FeeItemSchema = new Schema({
    particular: { type: String, required: true }, // e.g., "Filing Fee"
    amount: { type: Number, required: true }
});

const Box6Schema = new Schema({
    fees: [FeeItemSchema],
    totalAmountDue: { type: Number, default: 0 },
});

// --- MAIN SCHEMA ---

const BuildingApplicationSchema = new Schema(
    {
        applicant: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Relates to User model
            required: true,
        },
  
        applicationType: { type: String, default: 'Building' },
        referenceNo: { type: String, unique: true }, 
        
        status: {
            type: String,
            enum: [
                'Submitted',
                'Pending MEO',
                'Pending BFP',
                'Pending Mayor',
                'Approved',
                'Rejected',
                'Payment Pending',
                'Payment Submitted',
                'Permit Issued',
            ],
            default: 'Submitted',
        },

        // The filled-out form sections
        box1: Box1Schema,
        box2: Box2Schema,
        box3: Box3Schema,
        box4: Box4Schema,
        box5: { type: Box5Schema, default: {} },
        box6: { type: Box6Schema, default: {} },

        // For tracking corrections/rejections
        rejectionDetails: {
          comments: { type: String, default: '' },
          missingDocuments: [{ type: String }],
          status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
          isResolved: { type: Boolean, default: false }
        },

        // Supporting Documents (Embedded)
        documents: [
            {
                requirementName: { type: String, required: true },
                fileName: { type: String, required: true },
                filePath: { type: String, required: true }, 
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        // Final Permit Details
        permit: {
            permitNumber: { type: String },
            issuedAt: { type: Date },
            issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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
            referenceNumber: { type: String },
            proofOfPaymentFile: { type: String }, 
            dateSubmitted: { type: Date },
            amountPaid: { type: Number }
        },
        },
    { timestamps: true }
);


BuildingApplicationSchema.pre('save', async function (next) {
    if (this.isNew && !this.referenceNo) {
        this.referenceNo = `B-${Date.now()}`;
    }
    next();
});

export default mongoose.model('BuildingApplication', BuildingApplicationSchema);