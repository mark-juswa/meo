import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  DocumentTextIcon, 
  CheckBadgeIcon, 
  ArrowDownTrayIcon, 
  PaperClipIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ArrowLeftIcon,
  QrCodeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'; 

// --- Step 1: Static Data for Timeline Steps ---
const stepsData = [
  {
    number: 1,
    statusText: 'Application Submitted',
    description: 'Your application has been successfully submitted and is being processed.',
    action: { 
      title: (status) => "Status: Submitted",
      buttonText: (status) => "View Details",
      isModalTrigger: true
    }
  },
  {
    number: 2,
    statusText: 'For Initial Evaluation',
    description: 'The Municipal Engineering Office is currently reviewing your documents and details.',
    action: { 
      title: (status) => `Status: ${status}`,
      buttonText: (status) => "View Documents" 
    }
  },
{
    number: 3,
    statusText: 'For Revision / Payment & Inspection',
    description: 'Your application may require revisions, or you can proceed with payment and inspection.',
    action: { 
      title: (status) => {
          if (status === 'Payment Submitted') return "Status: Payment Verification";
          return `Status: ${status}`;
      },
      buttonText: (status) => {
         if (status === 'Payment Pending') return "Pay Now";
         if (status === 'Payment Submitted') return "View Receipt"; 
         if (status === 'For Revision' || status === 'Rejected') return "Upload Revisions";
         return "Complete My Task";
      },
      getLink: (application) => {
         if (application.status === 'Payment Pending') {
             return `/application/payment/${application.referenceNo}`; 
         }
         if (application.status === 'For Revision' || application.status === 'Rejected') {
             return `/application/reupload/${application.referenceNo}`;
         }
         return "#"; 
      },
      
      isReadOnly: (status) => status === 'Payment Submitted'
    }
  },
  {
    number: 4,
    statusText: 'Permit Issued',
    description: 'Your permit has been approved and issued. You may now download or claim it.',
    action: { 
      title: (status) => `Status: ${status}`,
      buttonText: (status) => "Download Permit" 
    }
  }
];

// --- Step 2: Helper to Map Database Status to Step Number ---
const mapDbStatusToStep = (dbStatus) => {
  if (!dbStatus) return 0;
  
  switch (dbStatus) {
    case 'Submitted':
      return 1;
      
    case 'Pending MEO':
    case 'Pending BFP':
    case 'Pending Mayor':
      return 2;

    case 'Rejected':
    case 'For Revision': 
    case 'Payment Pending':
    case 'Payment Submitted':
      return 3;

    case 'Approved':
    case 'Permit Issued':
      return 4;

    default:
      return 0; 
  }
};

// --- Step Components ---
const StepItem = ({ step, currentStepNum, dbStatus, application, onOpenDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isActive = step.number === currentStepNum;
  const isCompleted = step.number < currentStepNum;
  
  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  let circleClass = 'bg-gray-400';
  if (isActive) {
    circleClass = 'bg-blue-600';
  } else if (isCompleted) {
    circleClass = 'bg-green-500';
  }
  
  let textClass = 'text-gray-500';
  if (isActive) {
    textClass = 'text-blue-600';
  } else if (isCompleted) {
    textClass = 'text-green-500';
  }

  // --- Logic to handle text and button visibility ---
  let buttonText = "View";
  let titleText = "";
  let buttonLink = "#"; 
  let buttonClass = "bg-emerald-500 hover:bg-emerald-600";
  let description = step.description;
  let showButton = true; 

  // Get Title
  if (step.action && step.action.title) {
      if (typeof step.action.title === 'function') {
        titleText = step.action.title(dbStatus);
      } else {
        titleText = step.action.title;
      }
  }

  // get  Button Text
  if (step.action && step.action.buttonText) {
      if (typeof step.action.buttonText === 'function') {
          buttonText = step.action.buttonText(dbStatus);
      } else {
          buttonText = step.action.buttonText;
      }
  }


  // 3. Get Link

  if (step.action && step.action.getLink) {
      buttonLink = step.action.getLink(application);
  }

  if (isActive && (dbStatus === 'Rejected' || dbStatus === 'For Revision')) {
    buttonClass = "bg-red-500 hover:bg-red-600";
    description = 'Your application has been returned. Please review the admin\'s comments and upload the required documents.';
  }

  if (isActive && dbStatus === 'Payment Submitted') {
      description = "You have uploaded your proof of payment. Please wait for the MEO Admin to verify your transaction.";
      buttonClass = "bg-gray-400 cursor-not-allowed"; 
  }
  
  if (isActive && (dbStatus === 'Permit Issued' || dbStatus === 'Approved')) {
     showButton = false; 
  }

  return (
    <div className={`step-item relative z-10 mb-4 ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
      {/* Header */}
      <div 
        className="step-header flex items-center space-x-4 cursor-pointer"
        onClick={toggleExpand}
      >
        <div 
          className={`step-circle w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-semibold shadow-md transition-all duration-300 ease ${circleClass}`}
        >
          {step.number}
        </div>
        <h3 className={`text-lg font-semibold ${textClass}`}>
          {step.statusText}
        </h3>
        <svg 
          className={`chevron-icon w-6 h-6 ml-auto transition-transform duration-300 transform ${textClass} ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
        </svg>
      </div>


      <div 
        className={`step-body ml-16 pl-2 pr-4 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 pt-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-gray-500">
          {description}
        </p>

        {/* Display Admin Comments & Missing Docs */}
        {isActive && (application.rejectionDetails?.comments || application.rejectionDetails?.missingDocuments?.length > 0) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-700">Admin Feedback:</h4>
            {application.rejectionDetails.comments && (
              <p className="text-sm text-red-600 italic">"{application.rejectionDetails.comments}"</p>
            )}
            {application.rejectionDetails.missingDocuments?.length > 0 && (
              <>
                <h5 className="font-semibold text-red-700 mt-2">Missing Documents:</h5>
                <ul className="list-disc list-inside pl-2 text-sm text-red-600">
                  {application.rejectionDetails.missingDocuments.map(doc => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {isActive && (
          <div className="fade-in mt-4">
            <p className="text-base font-semibold text-gray-700 mt-2">
              {titleText}
            </p>
            {/* Logic to switch between Link and Modal Button */}
            {showButton && (
                step.action?.isModalTrigger ? (
                    <button 
                      onClick={onOpenDetails}
                      className={`inline-block px-6 py-3 mt-4 text-white font-semibold rounded-full shadow-md transition-colors duration-300 bg-blue-600 hover:bg-blue-700`}
                    >
                      {buttonText}
                    </button>
                ) : (
                    <Link 
                      to={buttonLink}
                      className={`inline-block px-6 py-3 mt-4 text-white font-semibold rounded-full shadow-md transition-colors duration-300 ${buttonClass}`}
                    >
                      {buttonText}
                    </Link>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Step 4: The Permit Dashboard Component ---
// --- Step 4: The Permit Dashboard Component (Redesigned) ---
const PermitDashboard = ({ application }) => {
  
  const handleViewFile = (path) => {
     if(!path) return alert("File not found");
     const url = path.startsWith('http') ? path : `http://localhost:5000${path}`;
     window.open(url, '_blank');
  };

  return (
    <div className="mt-10 border-t-2 border-gray-200 pt-10 animate-fade-in-up">
      
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center shadow-sm">
        <div className="flex justify-center mb-2">
            <div className="p-3 bg-green-100 rounded-full">
                <CheckBadgeIcon className="w-10 h-10 text-green-600" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-green-800">Permit Issued & Ready</h2>
        <p className="text-green-700 mt-1">
          Your application has been fully approved. Your official permit is ready for pickup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Claiming Instructions (Redesigned) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-blue-900 px-6 py-4 border-b border-blue-800">
            <h3 className="text-white font-bold text-lg flex items-center">
              <BuildingLibraryIcon className="w-5 h-5 mr-2" /> 
              Claiming Instructions
            </h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
                {/* Step 1: Location */}
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mt-1">1</div>
                    <div className="ml-4">
                        <h4 className="text-md font-bold text-gray-800">Visit the MEO</h4>
                        <p className="text-sm text-gray-600">Proceed to the <span className="font-semibold text-blue-700">Municipal Engineering Office</span> during business hours (8:00 AM - 5:00 PM).</p>
                    </div>
                </div>

                {/* Step 2: Requirements */}
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mt-1">2</div>
                    <div className="ml-4">
                        <h4 className="text-md font-bold text-gray-800">Present Requirements</h4>
                        <p className="text-sm text-gray-600">Bring a valid <span className="font-semibold">Government ID</span> and show your Reference Number.</p>
                    </div>
                </div>
            </div>

            {/* Reference Number Card */}
            <div className="mt-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Your Claiming Reference</p>
                <div className="text-3xl font-mono font-black text-gray-800 tracking-widest">
                    {application.referenceNo}
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: User Submitted Requirements (Includes Proof of Payment & PDFs) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <h3 className="text-white font-bold text-lg flex items-center">
              <PaperClipIcon className="w-5 h-5 mr-2" /> 
              Your Submitted Documents
            </h3>
          </div>
          
          <div className="p-0 overflow-y-auto max-h-[400px]">
            <ul className="divide-y divide-gray-100">
              
              {/* 1. SHOW PROOF OF PAYMENT (If Exists) */}
              {application.paymentDetails?.proofOfPaymentFile && (
                 <li className="flex items-center justify-between p-4 hover:bg-blue-50 transition duration-150 group">
                    <div className="flex items-center overflow-hidden">
                      <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition">
                          <CreditCardIcon className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-gray-800">Proof of Payment</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{application.paymentDetails.method || "Online"}</p>
                      </div>
                    </div>
                    <button 
                        onClick={() => handleViewFile(application.paymentDetails.proofOfPaymentFile)} 
                        className="text-xs font-medium flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
                    >
                      <QrCodeIcon className="w-3 h-3 mr-1.5" /> View
                    </button>
                 </li>
              )}

              {/* 2. SHOW UPLOADED DOCUMENTS*/}
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between p-4 hover:bg-blue-50 transition duration-150 group">
                    <div className="flex items-center overflow-hidden">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition">
                          <DocumentTextIcon className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate pr-4" title={doc.requirementName}>
                            {doc.requirementName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                      </div>
                    </div>
                    <button 
                        onClick={() => handleViewFile(doc.filePath)} 
                        className="text-xs font-medium flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3 mr-1.5" /> View
                    </button>
                  </li>
                ))
              ) : (
                // Fallback if no documents AND no payment proof
                !application.paymentDetails?.proofOfPaymentFile && (
                    <li className="p-8 text-center text-gray-500 italic">
                        No digital documents found.
                    </li>
                )
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- Step 5: Main Exported Component ---
const TrackApplication = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault(); 
    if (!trackingInput.trim()) {
      setError('Please enter a tracking number.');
      return;
    }
    setLoading(true);
    setApplication(null); 
    setError('');
    try {
      const res = await axios.get(`/api/applications/track/${trackingInput.trim()}`);
      setApplication(res.data.application);
      navigate(`/track/${trackingInput.trim()}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchFromUrl = async (searchId) => {
      setLoading(true);
      setApplication(null);
      setError('');
      try {
        const res = await axios.get(`/api/applications/track/${searchId}`);
        setApplication(res.data.application);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      setTrackingInput(id);
      searchFromUrl(id);
    }
  }, [id]);

  const currentStepNum = mapDbStatusToStep(application?.status);
  const isPermitIssued = application?.status === 'Permit Issued' || application?.status === 'Approved';

  return (
    <div className="antialiased text-gray-800 bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className={`${isPermitIssued ? 'max-w-5xl' : 'max-w-xl'} mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all duration-500`}>
          
          <h1 id="main-title" className="text-3xl font-bold mb-2 text-center text-gray-800">
            {application 
              ? `Application Status - ${application.applicationType} Permit`
              : 'Application Status'
            }
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Track the current status of your permit application.
          </p>

          <form onSubmit={handleSearch} className="mb-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <input 
              type="text" 
              id="tracking-input" 
              placeholder="Enter tracking number (e.g., B-173...)" 
              className="flex-1 w-full sm:w-auto max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {error && (
            <div id="error-message" className="text-center text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div id="status-timeline" className="step-container relative">
            {loading && (
              <p className="text-center text-gray-500 animate-pulse">Loading application details...</p>
            )}
            {!application && !loading && !error && (
               <div className="text-center py-10">
                 <p className="text-gray-400">Enter your tracking number above to view progress.</p>
               </div>
            )}
            
            {application && (
              <div className="relative">
                <div 
                  className="timeline-line absolute left-6 top-0 bottom-0 w-0.5 bg-repeat-y"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                    backgroundSize: '2px 8px',
                    zIndex: 0
                  }}
                ></div>
                
                {stepsData.map((step) => (
                  <StepItem 
                    key={step.number}
                    step={step}
                    currentStepNum={currentStepNum}
                    dbStatus={application.status}
                    application={application} 
                    onOpenDetails={() => setShowDetailsModal(true)}
                  />
                ))}
              </div>
            )}
          </div>

          {isPermitIssued && application && (
            <PermitDashboard application={application} />
          )}

        </div>
      </div>
      {showDetailsModal && (
        <SubmittedDetailsModal 
            application={application} 
            onClose={() => setShowDetailsModal(false)} 
        />
      )}
    </div>
  );
};



const SubmittedDetailsModal = ({ application, onClose }) => {
  if (!application) return null;


  const getVal = (obj, path, fallback = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || fallback;
  };

  const isBuilding = application.applicationType === 'Building';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Application Details</h3>
            <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm mt-1">
                <p className="text-blue-600 font-medium">
                    <span className="text-gray-500">Ref No:</span> {application.referenceNo}
                </p>
                <p className="text-gray-600">
                    <span className="text-gray-500">App ID:</span> {application._id}
                </p>
                <p className="text-gray-600">
                    <span className="text-gray-500">Type:</span> {application.applicationType}
                </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          
          {/* --- BOX 1: Applicant & Project Info --- */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-300 pb-2">
                1. Owner / Applicant & Project (Box 1)
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
               {/* Owner Info */}
               <div>
                 <p className="font-semibold text-blue-700 mb-2">Owner Information</p>
                 <div className="space-y-2">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Full Name</span>
                        <span className="font-medium text-gray-800">
                            {isBuilding 
                                ? `${getVal(application, 'box1.owner.firstName')} ${getVal(application, 'box1.owner.middleInitial', '')} ${getVal(application, 'box1.owner.lastName')}`
                                : `${getVal(application, 'ownerDetails.givenName')} ${getVal(application, 'ownerDetails.middleInitial', '')} ${getVal(application, 'ownerDetails.lastName')}`
                            }
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Date Submitted</span>
                        <span className="font-medium text-gray-800">
                            {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                 </div>
               </div>

               {/* Enterprise / Address */}
               <div>
                 <p className="font-semibold text-blue-700 mb-2">Address / Enterprise</p>
                 <div className="space-y-2">
                     <div>
                        <span className="block text-xs text-gray-500 uppercase">Form of Ownership</span>
                        <span className="font-medium text-gray-800">
                            {isBuilding ? getVal(application, 'box1.enterprise.formOfOwnership') : 'N/A'}
                        </span>
                     </div>
                     <div>
                        <span className="block text-xs text-gray-500 uppercase">Address</span>
                        <span className="font-medium text-gray-800">
                            {isBuilding
                            ? `${getVal(application, 'box1.enterprise.address.no')} ${getVal(application, 'box1.enterprise.address.street')}, ${getVal(application, 'box1.enterprise.address.barangay')}, ${getVal(application, 'box1.enterprise.address.city')}`
                            : getVal(application, 'ownerDetails.address')
                            }
                        </span>
                     </div>
                     <div>
                        <span className="block text-xs text-gray-500 uppercase">Contact No.</span>
                        <span className="font-medium text-gray-800">
                            {isBuilding ? getVal(application, 'box1.enterprise.address.telNo') : getVal(application, 'ownerDetails.telNo')}
                        </span>
                     </div>
                 </div>
               </div>

               {/* Project Location & Details - Full Width */}
               <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                 <p className="font-semibold text-blue-700 mb-2">Project Details</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Project Title</span>
                        <span className="font-medium text-gray-800">
                            {isBuilding ? getVal(application, 'box1.enterprise.projectTitle') : getVal(application, 'projectDetails.projectName')}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Occupancy Group</span>
                        <span className="font-medium text-gray-800">
                            {isBuilding ? getVal(application, 'box1.occupancy.group') : getVal(application, 'projectDetails.occupancyUse')}
                        </span>
                    </div>
                     {isBuilding && (
                        <div>
                            <span className="block text-xs text-gray-500 uppercase">Total Est. Cost</span>
                            <span className="font-medium text-gray-800">
                                ₱ {Number(getVal(application, 'box1.projectDetails.totalEstimatedCost', 0)).toLocaleString()}
                            </span>
                        </div>
                     )}
                    <div className="md:col-span-3">
                         <span className="block text-xs text-gray-500 uppercase">Location of Construction</span>
                         <span className="font-medium text-gray-800">
                            {isBuilding
                                ? `${getVal(application, 'box1.location.street')}, ${getVal(application, 'box1.location.barangay')}, ${getVal(application, 'box1.location.city')}`
                                : getVal(application, 'projectDetails.projectLocation')
                            }
                         </span>
                    </div>
                    {isBuilding && (
                        <div className="md:col-span-3">
                            <span className="block text-xs text-gray-500 uppercase">Scope of Work</span>
                            <span className="font-medium text-gray-800">
                                {(application.box1?.scopeOfWork || []).join(', ').replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}
                 </div>
               </div>
             </div>
          </div>

          {/* --- BOX 2: Professionals (Building Only) --- */}
          {isBuilding && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-300 pb-2">
                    2. (Box 2)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Architect / Civil Engineer</span>
                        <span className="font-semibold text-gray-800 text-base">
                            {getVal(application, 'box2.name')}
                        </span>
                        <div className="mt-1 text-xs text-gray-600 space-y-1">
                            <p>Address: {getVal(application, 'box2.address')}</p>
                            <p>PRC No: {getVal(application, 'box2.prcNo')} (Valid: {new Date(getVal(application, 'box2.validity')).toLocaleDateString()})</p>
                            <p>PTR No: {getVal(application, 'box2.ptrNo')}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* --- BOX 3: Applicant Signature --- */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-300 pb-2">
                3. Applicant (Box 3)
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="block text-xs text-gray-500 uppercase">Applicant Name</span>
                    <span className="font-semibold text-gray-800">
                        {isBuilding ? getVal(application, 'box3.name') : getVal(application, 'signatures.ownerName')}
                    </span>
                </div>
                {isBuilding && (
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">CTC Info</span>
                        <span className="font-medium text-gray-800">
                            No: {getVal(application, 'box3.ctcNo')} | Issued: {getVal(application, 'box3.placeIssued')}
                        </span>
                    </div>
                )}
             </div>
          </div>

          {/* --- BOX 4: Lot Owner Consent (Building Only) --- */}
          {isBuilding && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-300 pb-2">
                    4. Lot Owner Consent (Box 4)
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">Lot Owner Name</span>
                        <span className="font-semibold text-gray-800">
                            {getVal(application, 'box4.name')}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase">TCT / Tax Dec No.</span>
                        <span className="font-medium text-gray-800">
                            TCT: {getVal(application, 'box4.tctNo')} | Tax Dec: {getVal(application, 'box4.taxDecNo')}
                        </span>
                    </div>
                 </div>
            </div>
          )}

           {/* Current Status Badge in Modal */}
           <div className="flex justify-end items-center pt-4 border-t border-gray-100">
              <span className="text-gray-500 mr-3 text-sm">Current Status:</span>
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase">
                {application.status}
              </span>
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end sticky bottom-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackApplication;