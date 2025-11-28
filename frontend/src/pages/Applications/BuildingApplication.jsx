import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Corrected path
import html2pdf from 'html2pdf.js';


const DownloadIcon = () => (
  <svg
    className="w-5 h-5 inline mr-2 -mt-0.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    ></path>
  </svg>
);


const SuccessIcon = () => (
  <svg
    className="w-8 h-8 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
);

const BuildingApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();


  const [box1, setBox1] = useState({
    owner: { lastName: '', firstName: '', middleInitial: '' },
    enterprise: {
      formOfOwnership: '',
      projectTitle: '',
      address: { no: '', street: '', barangay: '', city: '', zip: '', telNo: '' },
    },
    location: {
      lotNo: '',
      blkNo: '',
      tctNo: '',
      taxDecNo: '',
      street: '',
      barangay: '',
      city: '',
    },
    scopeOfWork: [],
    occupancy: { group: '', classified: '' },
    projectDetails: {
      numberOfUnits: '',
      totalEstimatedCost: '',
      totalFloorArea: '',
      lotArea: '',
      proposedConstruction: '',
      expectedCompletion: '',
    },
  });

  const [box2, setBox2] = useState({
    name: '',
    date: '',
    address: '',
    prcNo: '',
    validity: '',
    ptrNo: '',
    ptrDate: '',
    issuedAt: '',
    tin: '',
  });

  const [box3, setBox3] = useState({
    name: '',
    date: '',
    address: '',
    ctcNo: '',
    dateIssued: '',
    placeIssued: '',
  });

  const [box4, setBox4] = useState({
    name: '',
    date: '',
    address: '',
    tctNo: '',
    taxDecNo: '',
    placeIssued: '',
  });


  const handleOwnerChange = (e) =>
    setBox1((prev) => ({
      ...prev,
      owner: { ...prev.owner, [e.target.name]: e.target.value },
    }));

  const handleEnterpriseChange = (e) =>
    setBox1((prev) => ({
      ...prev,
      enterprise: { ...prev.enterprise, [e.target.name]: e.target.value },
    }));

  const handleEnterpriseAddressChange = (e) =>
    setBox1((prev) => ({
      ...prev,
      enterprise: {
        ...prev.enterprise,
        address: { ...prev.enterprise.address, [e.target.name]: e.target.value },
      },
    }));

  const handleLocationChange = (e) =>
    setBox1((prev) => ({
      ...prev,
      location: { ...prev.location, [e.target.name]: e.target.value },
    }));

  const handleProjectDetailsChange = (e) =>
    setBox1((prev) => ({
      ...prev,
      projectDetails: {
        ...prev.projectDetails,
        [e.target.name]: e.target.value,
      },
    }));

  const handleScopeChange = (e) => {
    const { value, checked } = e.target;
    setBox1((prev) => {
      const newScope = checked
        ? [...prev.scopeOfWork, value]
        : prev.scopeOfWork.filter((item) => item !== value);
      return { ...prev, scopeOfWork: newScope };
    });
  };

  const handleOccupancyChange = (e) =>
    setBox1((prev) => ({
      ...prev,
      occupancy: { ...prev.occupancy, [e.target.name]: e.target.value },
    }));
  const handleBox2Change = (e) =>
    setBox2((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleBox3Change = (e) =>
    setBox3((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleBox4Change = (e) =>
    setBox4((prev) => ({ ...prev, [e.target.name]: e.target.value }));


  const validateStep1 = () => {
    const newErrors = {};
    if (!box1.owner.lastName) newErrors.owner_last_name = 'Required';
    if (!box1.owner.firstName) newErrors.owner_first_name = 'Required';
    if (!box1.location.lotNo) newErrors.lot_no = 'Required';
    if (!box1.location.tctNo) newErrors.tct_no = 'Required';
    if (!box1.location.taxDecNo) newErrors.tax_dec_no = 'Required';
    if (!box1.location.street) newErrors.loc_street = 'Required';
    if (!box1.location.barangay) newErrors.loc_barangay = 'Required';
    if (!box1.location.city) newErrors.loc_city = 'Required';
    if (box1.scopeOfWork.length === 0) newErrors.scope = 'Select at least one';
    if (!box1.occupancy.group) newErrors.occupancy = 'Select one';
    if (!box1.projectDetails.totalEstimatedCost)
      newErrors.total_estimated_cost = 'Required';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!box2.name) newErrors.arch_eng_name = 'Required';
    if (!box2.date) newErrors.arch_eng_date = 'Required';
    if (!box2.address) newErrors.arch_eng_address = 'Required';
    if (!box2.prcNo) newErrors.prc_no = 'Required';
    if (!box2.validity) newErrors.prc_validity = 'Required';
    if (!box2.ptrNo) newErrors.ptr_no = 'Required';
    if (!box2.ptrDate) newErrors.ptr_date_issued = 'Required';
    if (!box2.issuedAt) newErrors.issued_at = 'Required';
    if (!box2.tin) newErrors.tin = 'Required';
    if (!box3.name) newErrors.applicant_name = 'Required';
    if (!box3.date) newErrors.applicant_sign_date = 'Required';
    if (!box3.address) newErrors.applicant_address = 'Required';
    if (!box3.ctcNo) newErrors.applicant_ctc_no = 'Required';
    if (!box3.dateIssued) newErrors.applicant_date_issued = 'Required';
    if (!box3.placeIssued) newErrors.applicant_place_issued = 'Required';
    if (!box4.name) newErrors.lot_owner_name = 'Required';
    if (!box4.date) newErrors.lot_owner_sign_date = 'Required';
    if (!box4.address) newErrors.lot_owner_address = 'Required';
    if (!box4.tctNo) newErrors.lot_owner_tct_no = 'Required';
    if (!box4.taxDecNo) newErrors.lot_owner_tax_dec_no = 'Required';
    if (!box4.placeIssued) newErrors.lot_owner_place_issued = 'Required';
    return newErrors;
  };

 
  const nextStep = () => {
    let newErrors = {};
    if (currentStep === 1) newErrors = validateStep1();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert(
        `Action Blocked: Please fill out ALL required fields in Step ${currentStep} to proceed.`
      );
    } else {
      setErrors({});
      if (currentStep < 2) setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateStep2();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert(
        `Action Blocked: Please fill out ALL required fields in Step ${currentStep} to submit.`
      );
      return;
    }

    setLoading(true);
    setErrors({});
    const formData = { box1, box2, box3, box4 };

    try {
      const response = await axios.post(
        '/api/applications/building',
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      setSubmissionData({
        referenceNo: response.data.referenceNo,
        applicationId: response.data.applicationId,
        ownerName: `${box1.owner.firstName} ${box1.owner.lastName}`,
        projectTitle: box1.enterprise.projectTitle || 'N/A',
        location: `${box1.location.street}, ${box1.location.barangay}, ${box1.location.city}`,
        archEngName: box2.name,
        scopeList:
          box1.scopeOfWork.length > 0
            ? box1.scopeOfWork.join(', ').replace(/_/g, ' ')
            : 'Not specified',
      });

      setShowModal(true);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrors({
        api:
          err.response?.data?.message ||
          'An error occurred during submission.',
      });
      alert(
        `Submission Error: ${
          err.response?.data?.message ||
          'An error occurred. Please try again.'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/');
  };


  const downloadFormAsPdf = () => {
    const mainContent = document.getElementById('main-form-content');
    const originalStep = currentStep;

    document.getElementById('nav-buttons').style.display = 'none';
    document.getElementById('progress-indicator').style.display = 'none';
    document.getElementById('form-subtitle').style.display = 'none';
    document.getElementById('confirmation-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    mainContent.classList.add('shadow-none', 'border-none', 'p-0', 'm-0');
    mainContent
      .querySelectorAll('input:not(.admin-input)')
      .forEach((el) => {
          el.classList.add('border-none', 'shadow-none', '!ring-0');
      });
    mainContent
      .querySelectorAll('.signature-block input')
      .forEach((el) => {
          el.classList.add('border-none', 'shadow-none', '!ring-0');
      });
    
    document.getElementById('form-section-1').style.display = 'block';
    document.getElementById('form-section-2').style.display = 'block';
    document.getElementById('form-section-3').style.display = 'block';
    document.getElementById('form-section-4').style.display = 'block';

    const opt = {
      margin: 0.5,
      filename: `Building_Permit_Application_${
        box1.owner.lastName || 'Form'
      }.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(mainContent)
      .save()
      .then(() => {
        mainContent.classList.remove('shadow-none', 'border-none', 'p-0', 'm-0');
        document.getElementById('nav-buttons').style.display = 'flex';
        document.getElementById('progress-indicator').style.display = 'flex';
        document.getElementById('form-subtitle').style.display = 'block';
        document.getElementById('confirmation-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';

        document.getElementById('form-section-1').style.display =
          originalStep === 1 ? 'block' : 'none';
        document.getElementById('form-section-2').style.display =
          originalStep === 2 ? 'block' : 'none';
        
        document.getElementById('form-section-3').style.display = 'none';
        document.getElementById('form-section-4').style.display = 'none';
      });
  };

  const errorClass = (fieldName) =>
    errors[fieldName] ? 'border-red-500 border-2' : 'border-gray-300';
  
  const feeItems = [
      'FILING FEE', 'PROCESSING FEE', 'LOCATIONAL / ZONING OF LAND USE',
      'LINE AND GRADE (Geodetic)', 'ARCHITECTURAL', 'CIVIL / STRUCTURAL',
      'ELECTRICAL', 'SANITARY', 'PLUMBING', 'FIRE CODE CONSTRUCTION TAX',
      'SURCHARGES', 'PENALTIES'
  ];

  const adminInputClass = "admin-input border-b border-dashed border-gray-600 px-1 bg-gray-100 focus:outline-none focus:ring-0 focus:border-gray-600";

  return (
    <div className="antialiased text-gray-800 bg-gray-100">
      
      <div className="container mx-auto px-4 py-8">
        <div
          id="main-form-content"
          className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        >
          <h1 className="text-2xl font-bold mb-4 text-center">
            Official Building Permit Application Form
          </h1>
          <p id="form-subtitle" className="text-gray-600 text-center mb-8">
            Please fill in all mandatory fields (Steps 1-2).
          </p>

          <div
            id="progress-indicator"
            className="flex items-center justify-between mb-8"
          >
            {/* Step 1 */}
            <div className="flex-1 text-center transition-colors duration-300 ease-in-out">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                  currentStep >= 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <p
                className={`mt-2 text-xs font-medium ${
                  currentStep >= 1 ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                Applicant & Project (Box 1)
              </p>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-1 md:mx-4 rounded-full"></div>
            {/* Step 2 */}
            <div className="flex-1 text-center transition-colors duration-300 ease-in-out">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                  currentStep >= 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <p
                className={`mt-2 text-xs font-medium ${
                  currentStep >= 2 ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                Authorization (Boxes 2-4)
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmSubmit}>
            {/* -- 1. BOX 1 (Visible on Step 1) -- */}
            <div
              id="form-section-1"
              className={currentStep === 1 ? 'mb-8' : 'hidden'}
            >
              {/* --- ALL YOUR BOX 1 FIELDS --- */}
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-600">
                1. Applicant, Project Location, and Scope (Box 1)
              </h2>
              <h3 className="font-medium text-lg text-gray-700 mt-2 mb-3">
                Owner / Applicant
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="col-span-2">
                  <label
                    htmlFor="owner_last_name"
                    className="block text-xs font-medium text-gray-700"
                  >
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    id="owner_last_name"
                    name="lastName"
                    value={box1.owner.lastName}
                    onChange={handleOwnerChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                      'owner_last_name'
                    )}`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="owner_first_name"
                    className="block text-xs font-medium text-gray-700"
                  >
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    id="owner_first_name"
                    name="firstName"
                    value={box1.owner.firstName}
                    onChange={handleOwnerChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                      'owner_first_name'
                    )}`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="owner_mi"
                    className="block text-xs font-medium text-gray-700"
                  >
                    M.I. / TIN
                  </label>
                  <input
                    type="text"
                    id="owner_mi"
                    name="middleInitial"
                    value={box1.owner.middleInitial}
                    onChange={handleOwnerChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="M.I. / TIN (Optional)"
                  />
                </div>
              </div>

              <h3 className="font-medium text-lg text-gray-700 mt-6 mb-3 border-t pt-4">
                For Construction Owned by an Enterprise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="col-span-2">
                  <label
                    htmlFor="form_of_ownership"
                    className="block text-xs font-medium text-gray-700"
                  >
                    FORM OF OWNERSHIP
                  </label>
                  <input
                    type="text"
                    id="form_of_ownership"
                    name="formOfOwnership"
                    value={box1.enterprise.formOfOwnership}
                    onChange={handleEnterpriseChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Corporation"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="project_title"
                    className="block text-xs font-medium text-gray-700"
                  >
                    PROJECT TITLE
                  </label>
                  <input
                    type="text"
                    id="project_title"
                    name="projectTitle"
                    value={box1.enterprise.projectTitle}
                    onChange={handleEnterpriseChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-4 grid grid-cols-5 gap-4">
                  <div>
                    <label
                      htmlFor="address_no"
                      className="block text-xs font-medium text-gray-700"
                    >
                      ADDRESS: NO.
                    </label>
                    <input
                      type="text"
                      id="address_no"
                      name="no"
                      value={box1.enterprise.address.no}
                      onChange={handleEnterpriseAddressChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address_street"
                      className="block text-xs font-medium text-gray-700"
                    >
                      STREET
                    </label>
                    <input
                      type="text"
                      id="address_street"
                      name="street"
                      value={box1.enterprise.address.street}
                      onChange={handleEnterpriseAddressChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address_barangay"
                      className="block text-xs font-medium text-gray-700"
                    >
                      BARANGAY
                    </label>
                    <input
                      type="text"
                      id="address_barangay"
                      name="barangay"
                      value={box1.enterprise.address.barangay}
                      onChange={handleEnterpriseAddressChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address_city"
                      className="block text-xs font-medium text-gray-700"
                    >
                      CITY / MUNICIPALTITY
                    </label>
                    <input
                      type="text"
                      id="address_city"
                      name="city"
                      value={box1.enterprise.address.city}
                      onChange={handleEnterpriseAddressChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address_zip"
                      className="block text-xs font-medium text-gray-700"
                    >
                      ZIP CODE
                    </label>
                    <input
                      type="text"
                      id="address_zip"
                      name="zip"
                      value={box1.enterprise.address.zip}
                      onChange={handleEnterpriseAddressChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="address_tel_no"
                      className="block text-xs font-medium text-gray-700"
                    >
                      TELEPHONE NO.
                    </label>
                    <input
                      type="tel"
                      id="address_tel_no"
                      name="telNo"
                      value={box1.enterprise.address.telNo}
                      onChange={handleEnterpriseAddressChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-lg text-gray-700 mt-6 mb-3 border-t pt-4">
                Location of Construction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="lot_no"
                    className="block text-xs font-medium text-gray-700"
                  >
                    LOT NO.
                  </label>
                  <input
                    type="text"
                    id="lot_no"
                    name="lotNo"
                    value={box1.location.lotNo}
                    onChange={handleLocationChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                      'lot_no'
                    )}`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="blk_no"
                    className="block text-xs font-medium text-gray-700"
                  >
                    BLK NO.
                  </label>
                  <input
                    type="text"
                    id="blk_no"
                    name="blkNo"
                    value={box1.location.blkNo}
                    onChange={handleLocationChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tct_no"
                    className="block text-xs font-medium text-gray-700"
                  >
                    TCT NO.
                  </label>
                  <input
                    type="text"
                    id="tct_no"
                    name="tctNo"
                    value={box1.location.tctNo}
                    onChange={handleLocationChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                      'tct_no'
                    )}`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="tax_dec_no"
                    className="block text-xs font-medium text-gray-700"
                  >
                    TAX DEC NO.
                  </label>
                  <input
                    type="text"
                    id="tax_dec_no"
                    name="taxDecNo"
                    value={box1.location.taxDecNo}
                    onChange={handleLocationChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                      'tax_dec_no'
                    )}`}
                    required
                  />
                </div>

                <div className="md:col-span-4 grid grid-cols-4 gap-4 mt-2">
                  <div>
                    <label
                      htmlFor="loc_street"
                      className="block text-xs font-medium text-gray-700"
                    >
                      STREET
                    </label>
                    <input
                      type="text"
                      id="loc_street"
                      name="street"
                      value={box1.location.street}
                      onChange={handleLocationChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                        'loc_street'
                      )}`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="loc_barangay"
                      className="block text-xs font-medium text-gray-700"
                    >
                      BARANGAY
                    </label>
                    <input
                      type="text"
                      id="loc_barangay"
                      name="barangay"
                      value={box1.location.barangay}
                      onChange={handleLocationChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                        'loc_barangay'
                      )}`}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="loc_city"
                      className="block text-xs font-medium text-gray-700"
                    >
                      CITY / MUNICIPALITY OF
                    </label>
                    <input
                      type="text"
                      id="loc_city"
                      name="city"
                      value={box1.location.city}
                      onChange={handleLocationChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                        'loc_city'
                      )}`}
                      required
                    />
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-lg text-gray-700 mt-6 mb-3 border-t pt-4">
                Scope of Work (Check all applicable)
              </h3>
              {errors.scope && (
                <p className="text-red-500 text-sm mb-2">{errors.scope}</p>
              )}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 text-sm">
                {[
                  'new_construction',
                  'renovation',
                  'raising',
                  'erection',
                  'conversion',
                  'accessory_building',
                  'addition',
                  'repair',
                  'others',
                  'alteration',
                  'moving',
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center p-2 rounded-md transition-colors duration-150 hover:bg-blue-50"
                  >
                    <input
                      type="checkbox"
                      name="scope[]"
                      value={item}
                      onChange={handleScopeChange}
                      checked={box1.scopeOfWork.includes(item)}
                      className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    {item.replace(/_/g, ' ').charAt(0).toUpperCase() +
                      item.replace(/_/g, ' ').slice(1)}
                  </label>
                ))}
              </div>

              <h3 className="font-medium text-lg text-gray-700 mt-6 mb-3 border-t pt-4">
                Use or Character of Occupancy (Check only one)
              </h3>
              {errors.occupancy && (
                <p className="text-red-500 text-sm mb-2">{errors.occupancy}</p>
              )}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 text-sm">
                {[
                  {
                    value: 'group_a',
                    label: 'GROUP A: Residential, Dwellings',
                  },
                  { value: 'group_f', label: 'GROUP F: Industrial' },
                  {
                    value: 'group_b',
                    label: 'GROUP B: Residential Hotel, Apartment',
                  },
                  {
                    value: 'group_g',
                    label: 'GROUP G: Industrial Storage and Hazardous',
                  },
                  {
                    value: 'group_c',
                    label: 'GROUP C: Educational, Recreational',
                  },
                  {
                    value: 'group_h_load_lt_1000',
                    label:
                      'GROUP H: Recreational, Assembly Occupant Load < 1000',
                  },
                  { value: 'group_d', label: 'GROUP D: Institutional' },
                  {
                    value: 'group_h_load_gt_1000',
                    label:
                      'GROUP H: Recreational, Assembly Occupant Load 1000+',
                  },
                  {
                    value: 'group_e',
                    label: 'GROUP E: Business and Mercantile',
                  },
                  {
                    value: 'group_j',
                    label: 'GROUP J: Agricultural, Accessory',
                  },
                  { value: 'others', label: 'OTHERS (Specify)' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center p-2 rounded-md transition-colors duration-150 hover:bg-blue-50"
                  >
                    <input
                      type="radio"
                      name="group"
                      value={item.value}
                      onChange={handleOccupancyChange}
                      checked={box1.occupancy.group === item.value}
                      className="rounded-full text-blue-600 focus:ring-blue-500 mr-2"
                      required
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="mt-6">
                <label
                  htmlFor="occupancy_classified"
                  className="block text-sm font-medium text-gray-700"
                >
                  OCCUPANCY CLASSIFIED (If "OTHERS" is selected)
                </label>
                <input
                  type="text"
                  id="occupancy_classified"
                  name="classified"
                  value={box1.occupancy.classified}
                  onChange={handleOccupancyChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Specify here if 'OTHERS' was checked"
                  disabled={box1.occupancy.group !== 'others'}
                />
              </div>

              <h3 className="font-medium text-lg text-gray-700 mt-6 mb-3 border-t pt-4">
                Project Area, Cost, and Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="number_of_units"
                    className="block text-xs font-medium text-gray-700"
                  >
                    NUMBER OF UNITS
                  </label>
                  <input
                    type="number"
                    id="number_of_units"
                    name="numberOfUnits"
                    value={box1.projectDetails.numberOfUnits}
                    onChange={handleProjectDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_estimated_cost"
                    className="block text-xs font-medium text-gray-700"
                  >
                    TOTAL ESTIMATED COST (P)
                  </label>
                  <input
                    type="number"
                    id="total_estimated_cost"
                    name="totalEstimatedCost"
                    value={box1.projectDetails.totalEstimatedCost}
                    onChange={handleProjectDetailsChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errorClass(
                      'total_estimated_cost'
                    )}`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_floor_area_sqm"
                    className="block text-xs font-medium text-gray-700"
                  >
                    TOTAL FLOOR AREA (m²)
                  </label>
                  <input
                    type="number"
                    id="total_floor_area_sqm"
                    name="totalFloorArea"
                    value={box1.projectDetails.totalFloorArea}
                    onChange={handleProjectDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lot_area_sqm"
                    className="block text-xs font-medium text-gray-700"
                  >
                    LOT AREA (m²)
                  </label>
                  <input
                    type="number"
                    id="lot_area_sqm"
                    name="lotArea"
                    value={box1.projectDetails.lotArea}
                    onChange={handleProjectDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="proposed_date_of_construction"
                    className="block text-xs font-medium text-gray-700"
                  >
                    PROPOSED DATE OF CONSTRUCTION
                  </label>
                  <input
                    type="date"
                    id="proposed_date_of_construction"
                    name="proposedConstruction"
                    value={box1.projectDetails.proposedConstruction}
                    onChange={handleProjectDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="expected_date_of_completion"
                    className="block text-xs font-medium text-gray-700"
                  >
                    EXPECTED DATE OF COMPLETION
                  </label>
                  <input
                    type="date"
                    id="expected_date_of_completion"
                    name="expectedCompletion"
                    value={box1.projectDetails.expectedCompletion}
                    onChange={handleProjectDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* -- 2. BOXES 2, 3, 4 (Visible on Step 2) -- */}
            <div
              id="form-section-2"
              className={currentStep === 2 ? 'mb-8' : 'hidden'}
            >
              {/* --- ALL YOUR BOX 2, 3, 4 FIELDS --- */}
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-600">
                2. Authorization & Signatures (Boxes 2, 3, and 4)
              </h2>
              {errors.api && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">{errors.api}</span>
                </div>
              )}

              <h3 className="font-medium text-lg text-gray-700 mt-2 mb-3 border-b pb-2">
                BOX 2: Full-Time Inspector and Supervisor of Construction Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="border-b-2 border-blue-500 text-center pb-1 mt-4 text-sm text-gray-700 signature-block">
                    <input
                      type="text"
                      placeholder="[Type Name Here]"
                      id="arch_eng_name"
                      name="name"
                      value={box2.name}
                      onChange={handleBox2Change}
                      className={`w-full text-center border-0 p-0 focus:ring-0 ${errorClass(
                        'arch_eng_name'
                      )}`}
                      required
                    />
                  </div>
                  <span className="block mt-1 text-xs italic text-gray-600">
                    (Signed and Sealed Over Printed Name)
                  </span>
                  <div className="flex mt-2">
                    <label
                      htmlFor="arch_eng_date"
                      className="block text-xs font-medium text-gray-700 pr-2 pt-1"
                    >
                      Date:
                    </label>
                    <input
                      type="date"
                      id="arch_eng_date"
                      name="date"
                      value={box2.date}
                      onChange={handleBox2Change}
                      className={`flex-grow px-3 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${errorClass(
                        'arch_eng_date'
                      )}`}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="arch_eng_address"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="arch_eng_address"
                      name="address"
                      value={box2.address}
                      onChange={handleBox2Change}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                        'arch_eng_address'
                      )}`}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="prc_no"
                        className="block text-xs font-medium text-gray-700"
                      >
                        PRC No.
                      </label>
                      <input
                        type="text"
                        id="prc_no"
                        name="prcNo"
                        value={box2.prcNo}
                        onChange={handleBox2Change}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                          'prc_no'
                        )}`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prc_validity"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Validity
                      </label>
                      <input
                        type="date"
                        id="prc_validity"
                        name="validity"
                        value={box2.validity}
                        onChange={handleBox2Change}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                          'prc_validity'
                        )}`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ptr_no"
                        className="block text-xs font-medium text-gray-700"
                      >
                        PTR No.
                      </label>
                      <input
                        type="text"
                        id="ptr_no"
                        name="ptrNo"
                        value={box2.ptrNo}
                        onChange={handleBox2Change}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                          'ptr_no'
                        )}`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ptr_date_issued"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Date Issued
                      </label>
                      <input
                        type="date"
                        id="ptr_date_issued"
                        name="ptrDate"
                        value={box2.ptrDate}
                        onChange={handleBox2Change}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                          'ptr_date_issued'
                        )}`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="issued_at"
                        className="block text-xs font-medium text-gray-700"
                      >
                        Issued at
                      </label>
                      <input
                        type="text"
                        id="issued_at"
                        name="issuedAt"
                        value={box2.issuedAt}
                        onChange={handleBox2Change}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                          'issued_at'
                        )}`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tin"
                        className="block text-xs font-medium text-gray-700"
                      >
                        TIN
                      </label>
                      <input
                        type="text"
                        id="tin"
                        name="tin"
                        value={box2.tin}
                        onChange={handleBox2Change}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                          'tin'
                        )}`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                {/* Box 3: Applicant Signature */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    BOX 3: Applicant
                  </h3>
                  <div className="border-b-2 border-blue-500 text-center pb-1 mt-4 text-sm text-gray-700 signature-block">
                    <input
                      type="text"
                      placeholder="[Type Name Here]"
                      id="applicant_name"
                      name="name"
                      value={box3.name}
                      onChange={handleBox3Change}
                      className={`w-full text-center border-0 p-0 focus:ring-0 ${errorClass(
                        'applicant_name'
                      )}`}
                      required
                    />
                  </div>
                  <span className="block mt-1 text-xs italic text-gray-600">
                    (Signature Over Printed Name)
                  </span>
                  <div className="flex mt-2">
                    <label
                      htmlFor="applicant_sign_date"
                      className="block text-xs font-medium text-gray-700 pr-2 pt-1"
                    >
                      Date:
                    </label>
                    <input
                      type="date"
                      id="applicant_sign_date"
                      name="date"
                      value={box3.date}
                      onChange={handleBox3Change}
                      className={`flex-grow px-3 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${errorClass(
                        'applicant_sign_date'
                      )}`}
                      required
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <label
                      htmlFor="applicant_address"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="applicant_address"
                      name="address"
                      value={box3.address}
                      onChange={handleBox3Change}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                        'applicant_address'
                      )}`}
                      required
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label
                          htmlFor="applicant_ctc_no"
                          className="block text-xs font-medium text-gray-700"
                        >
                          CTC No.
                        </label>
                        <input
                          type="text"
                          id="applicant_ctc_no"
                          name="ctcNo"
                          value={box3.ctcNo}
                          onChange={handleBox3Change}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                            'applicant_ctc_no'
                          )}`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="applicant_date_issued"
                          className="block text-xs font-medium text-gray-700"
                        >
                          Date Issued
                        </label>
                        <input
                          type="date"
                          id="applicant_date_issued"
                          name="dateIssued"
                          value={box3.dateIssued}
                          onChange={handleBox3Change}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                            'applicant_date_issued'
                          )}`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="applicant_place_issued"
                          className="block text-xs font-medium text-gray-700"
                        >
                          Place Issued
                        </label>
                        <input
                          type="text"
                          id="applicant_place_issued"
                          name="placeIssued"
                          value={box3.placeIssued}
                          onChange={handleBox3Change}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                            'applicant_place_issued'
                          )}`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 4: Lot Owner / Representative Consent */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    BOX 4: With My Consent: Lot Owner / Representative
                  </h3>
                  <div className="border-b-2 border-blue-500 text-center pb-1 mt-4 text-sm text-gray-700 signature-block">
                    <input
                      type="text"
                      placeholder="[Type Name Here]"
                      id="lot_owner_name"
                      name="name"
                      value={box4.name}
                      onChange={handleBox4Change}
                      className={`w-full text-center border-0 p-0 focus:ring-0 ${errorClass(
                        'lot_owner_name'
                      )}`}
                      required
                    />
                  </div>
                  <span className="block mt-1 text-xs italic text-gray-600">
                    (Signature Over Printed Name)
                  </span>
                  <div className="flex mt-2">
                    <label
                      htmlFor="lot_owner_sign_date"
                      className="block text-xs font-medium text-gray-700 pr-2 pt-1"
                    >
                      Date:
                    </label>
                    <input
                      type="date"
                      id="lot_owner_sign_date"
                      name="date"
                      value={box4.date}
                      onChange={handleBox4Change}
                      className={`flex-grow px-3 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${errorClass(
                        'lot_owner_sign_date'
                      )}`}
                      required
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <label
                      htmlFor="lot_owner_address"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="lot_owner_address"
                      name="address"
                      value={box4.address}
                      onChange={handleBox4Change}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                        'lot_owner_address'
                      )}`}
                      required
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label
                          htmlFor="lot_owner_tct_no"
                          className="block text-xs font-medium text-gray-700"
                        >
                          TCT No.
                        </label>
                        <input
                          type="text"
                          id="lot_owner_tct_no"
                          name="tctNo"
                          value={box4.tctNo}
                          onChange={handleBox4Change}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                            'lot_owner_tct_no'
                          )}`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lot_owner_tax_dec_no"
                          className="block text-xs font-medium text-gray-700"
                        >
                          Tax Dec No.
                        </label>
                        <input
                          type="text"
                          id="lot_owner_tax_dec_no"
                          name="taxDecNo"
                          value={box4.taxDecNo}
                          onChange={handleBox4Change}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                            'lot_owner_tax_dec_no'
                          )}`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lot_owner_place_issued"
                          className="block text-xs font-medium text-gray-700"
                        >
                          Place Issued
                        </label>
                        <input
                          type="text"
                          id="lot_owner_place_issued"
                          name="placeIssued"
                          value={box4.placeIssued}
                          onChange={handleBox4Change}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errorClass(
                            'lot_owner_place_issued'
                          )}`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* -- 3. BOX 5 (ALWAYS HIDDEN from user flow) -- */}
            <div id="form-section-3" className="hidden">
              <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-blue-600">
                3. Acknowledgment and Notary Public (Box 5)
              </h2>
              <p className="text-sm font-medium text-gray-700 mb-4">
                REPUBLIC OF THE PHILIPPINES, CITY/MUNICIPALITY OF{' '}
                <input
                  type="text"
                  className={`${adminInputClass} w-2/5 sm:w-1/3`}
                  placeholder="[Admin Fill: City/Municipality]"
                  disabled
                />{' '}
                S.S.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-6">
                BEFORE ME, at the City/Municipality of{' '}
                <input
                  type="text"
                  className={`${adminInputClass} w-1/4 sm:w-1/5`}
                  disabled
                />{' '}
                on{' '}
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className={`${adminInputClass} w-1/4 sm:w-1/5`}
                  disabled
                />
                , personally appeared the following:
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 items-end border-b pb-2">
                  <div className="col-span-1 text-center font-bold text-sm">
                    APPLICANT
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500">
                      C.T.C. No.
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-full mt-1`}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500">
                      Date Issued
                    </label>
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      className={`${adminInputClass} w-full mt-1`}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500">
                      Place Issued
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-full mt-1`}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 items-end border-b pb-2">
                  <div className="col-span-1 text-center font-bold text-sm">
                    LICENSED ARCHITECT OR CIVIL ENGINEER
                    <span className="block font-normal text-xs text-gray-500">
                      (Full-Time Inspector and Supervisor of Construction Works)
                    </span>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500">
                      C.T.C. No.
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-full mt-1`}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500">
                      Date Issued
                    </label>
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      className={`${adminInputClass} w-full mt-1`}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500">
                      Place Issued
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-full mt-1`}
                      disabled
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-6 mb-8 italic">
                whose signatures appear hereinabove, known to me to be the same
                persons who executed this standard prescribed form and
                acknowledged to me that the same is their free and voluntary act
                and deed.
              </p>
              <p className="font-bold text-base text-center text-blue-800 mb-8">
                WITNESS MY HAND AND SEAL on the date and place above written.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-300">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label className="w-1/4 text-sm font-medium text-gray-700">
                      Doc. No.
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-3/4`}
                      disabled
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-1/4 text-sm font-medium text-gray-700">
                      Page No.
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-3/4`}
                      disabled
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-1/4 text-sm font-medium text-gray-700">
                      Book No.
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-3/4`}
                      disabled
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-1/4 text-sm font-medium text-gray-700">
                      Series of
                    </label>
                    <input
                      type="text"
                      className={`${adminInputClass} w-3/4`}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="border-b-2 border-gray-500 w-full mb-1"></div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    NOTARY PUBLIC
                  </label>
                  <div className="text-xs text-gray-500">
                    (Until December{' '}
                    <input
                      type="text"
                      className={`${adminInputClass} w-16 text-center text-xs`}
                      placeholder="[Year]"
                      disabled
                    />
                    )
                  </div>
                </div>
              </div>
            </div>
            
            {/* -- 4. BOX 6 (ALWAYS HIDDEN from user flow) -- */}
            <div id="form-section-4" className="hidden">
              <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-blue-600">
                4. Assessed Fees (Box 6)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                This section is{' '}
                <span className="font-bold">
                  to be accomplished by the Processing and Evaluation Division
                </span>
                . The amounts below are for your reference and payment.
              </p>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 font-semibold uppercase text-xs">
                    <tr>
                      <th className="border border-gray-200 p-2 text-left w-1/4">
                        ASSESSED FEES
                      </th>
                      <th className="border border-gray-200 p-2 text-left w-1/4">
                        BASIS OF ASSESSMENT
                      </th>
                      <th className="border border-gray-200 p-2 text-left w-1/4">
                        AMOUNT DUE (P)
                      </th>
                      <th className="border border-gray-200 p-2 text-left w-1/4">
                        ASSESSED BY (MEO Staff)
                      </th>
                    </tr>
                  </thead>
                  <tbody id="fees-tbody">
                    {feeItems.map((feeName) => (
                      <tr key={feeName}>
                        <td className="border border-gray-200 p-2 h-10">
                          <input type="checkbox" readOnly className="mr-2" disabled />
                          {feeName}
                        </td>
                        <td className="border border-gray-200 p-2"></td>
                        <td className="border border-gray-200 p-2 text-right"></td>
                        <td className="border border-gray-200 p-2"></td>
                      </tr>
                    ))}
                    
                    <tr className="font-bold bg-gray-200">
                      <td
                        colSpan="2"
                        className="border border-gray-200 p-2 text-center"
                      >
                        TOTAL AMOUNT DUE
                      </td>
                      <td
                        id="total-amount"
                        className="border border-gray-200 p-2 text-right text-lg text-red-600 h-10"
                      >
                        {/* Empty */}
                      </td>
                      <td className="border border-gray-200 p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
                <p className="font-bold">NOTICE:</p>
                <p>
                  The total amount due above must be settled at the Municipal
                  Treasurer's Office. Once payment is confirmed, your permit
                  will be officially issued.
                </p>
              </div>
            </div>

            {/* -- Navigation Buttons -- */}
            <div id="nav-buttons" className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                  currentStep > 1 ? 'block' : 'hidden'
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className={`px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-auto ${
                  currentStep < 2 ? 'block' : 'hidden'
                }`}
              >
                Next
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-auto ${
                  currentStep === 2 ? 'block' : 'hidden'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* -- Confirmation Modal -- */}
      {showModal && (
        <div
          id="confirmation-modal"
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 transform transition-transform duration-300 scale-100">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <SuccessIcon />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Application Submission Confirmed!
              </h2>
              <p className="text-gray-600 text-center mt-2">
                Your application (Ref:
                <span className="font-bold">
                  {submissionData.referenceNo}
                </span>
                ) has been successfully lodged.
              </p>
            </div>

            <div
              id="review-content"
              className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              {submissionData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">
                    Application Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-500 block">
                        Applicant Name:
                      </span>
                      <span className="font-bold">
                        {submissionData.ownerName}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-500 block">
                        Scope of Work:
                      </span>
                      <span className="font-bold text-green-700">
                        {submissionData.scopeList}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={downloadFormAsPdf}
                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
              <DownloadIcon />
                Download Full Form (PDF)
              </button>
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close and Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingApplication;