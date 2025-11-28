import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";

const OccupancyApplication = () => {
  // This parameter comes from the URL (e.g., /occupancy/B-173123... or /occupancy/65a...)
  // We treat 'buildingId' as a generic identifier (Ref No OR Mongo ID)
  const { buildingId } = useParams(); 
  
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    permitInfo: {
      buildingPermitNo: '',
      buildingPermitDate: '',
      fsecNo: '',
      fsecDate: '',
    },
    ownerDetails: {
      lastName: '',
      givenName: '',
      middleInitial: '',
      address: '',
      zip: '',
      telNo: '',
    },
    requirementsSubmitted: [],
    otherDocs: '',
    projectDetails: {
      projectName: '',
      projectLocation: '',
      occupancyUse: '',
      noStoreys: '',
      noUnits: '',
      totalFloorArea: '',
      dateCompletion: '',
    },
    signatures: {
      ownerName: '',
      inspectorName: '',
      engineerName: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Auto-fill owner details from context if available ---
  useEffect(() => {
    if (auth.user) {
      setFormData((prev) => ({
        ...prev,
        ownerDetails: {
          ...prev.ownerDetails,
          lastName: auth.user.last_name || '',
          givenName: auth.user.first_name || '',
          telNo: auth.user.phone_number || '',
        },
      }));
    }
  }, [auth.user]);

  // --- Change Handlers ---
  const handlePermitInfoChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      permitInfo: { ...prev.permitInfo, [e.target.name]: e.target.value },
    }));
  const handleOwnerDetailsChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      ownerDetails: { ...prev.ownerDetails, [e.target.name]: e.target.value },
    }));
  const handleProjectDetailsChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      projectDetails: {
        ...prev.projectDetails,
        [e.target.name]: e.target.value,
      },
    }));
  const handleSignatureChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      signatures: { ...prev.signatures, [e.target.name]: e.target.value },
    }));
  const handleOtherDocsChange = (e) =>
    setFormData((prev) => ({ ...prev, otherDocs: e.target.value }));

  const handleRequirementsChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newReqs = checked
        ? [...prev.requirementsSubmitted, value]
        : prev.requirementsSubmitted.filter((item) => item !== value);
      return { ...prev, requirementsSubmitted: newReqs };
    });
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildingId) {
      setError('No related building permit found. Invalid URL.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await axios.post(
        '/api/applications/occupancy',
        {
          ...formData,
          // --- FIX: Send 'buildingPermitIdentifier' to match backend controller ---
          // This allows the backend to search by Reference No OR ID
          buildingPermitIdentifier: buildingId, 
        },
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
  
      navigate('/dashboard?status=occupancy_submitted');
    } catch (err) {
      console.error('Occupancy permit submission failed:', err);
      setError(
        err.response?.data?.message ||
          'An error occurred. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="antialiased text-gray-800 bg-gray-100">
      
      <div
        id="form-container"
        className="bg-white p-6 md:p-10 max-w-5xl mx-auto my-6 shadow-2xl rounded-xl border border-gray-200"
      >
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
            Occupancy Permit
          </h1>
          <p className="text-md text-gray-500">
            Application for Certificate of Occupancy
          </p>
        </header>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Permit Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-100 pb-2">
              1. Permit Information
            </h2>
            
            {/* --- UPDATED UI TEXT --- */}
            <p className="text-sm text-gray-600">
              Applying for permit related to Building Reference No. or ID:
              <strong className="text-indigo-700 ml-2">{buildingId}</strong>
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <div>
                <label
                  htmlFor="building-permit-no"
                  className="block text-sm font-medium text-gray-700"
                >
                  Building Permit No.:
                </label>
                <input
                  type="text"
                  id="building-permit-no"
                  name="buildingPermitNo"
                  value={formData.permitInfo.buildingPermitNo}
                  onChange={handlePermitInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="building-permit-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date Issued (Building Permit):
                </label>
                <input
                  type="date"
                  id="building-permit-date"
                  name="buildingPermitDate"
                  value={formData.permitInfo.buildingPermitDate}
                  onChange={handlePermitInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="fsec-no"
                  className="block text-sm font-medium text-gray-700"
                >
                  FSEC No. (Fire Safety Evaluation Clearance):
                </label>
                <input
                  type="text"
                  id="fsec-no"
                  name="fsecNo"
                  value={formData.permitInfo.fsecNo}
                  onChange={handlePermitInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="fsec-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date Issued (FSEC):
                </label>
                <input
                  type="date"
                  id="fsec-date"
                  name="fsecDate"
                  value={formData.permitInfo.fsecDate}
                  onChange={handlePermitInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner/Permittee Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-100 pb-2 pt-4">
              2. Owner/Permittee Details (Auto-filled)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="owner-last-name" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" id="owner-last-name" name="lastName" value={formData.ownerDetails.lastName} onChange={handleOwnerDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="owner-given-name" className="block text-sm font-medium text-gray-700">Given Name</label>
                <input type="text" id="owner-given-name" name="givenName" value={formData.ownerDetails.givenName} onChange={handleOwnerDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="owner-mi" className="block text-sm font-medium text-gray-700">Middle Initial</label>
                <input type="text" id="owner-mi" name="middleInitial" value={formData.ownerDetails.middleInitial} onChange={handleOwnerDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
          </div>

          {/* Section 3: Requirements Submitted */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-100 pb-2 pt-4">
              3. Requirements Submitted (Check all that apply)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { value: 'req_permit', label: 'Issued Building Permit and Plans (1 set)' },
                { value: 'req_logbook', label: 'Construction Logbook, signed and sealed' },
                { value: 'req_photos', label: 'Photos of Site/Project showing completion' },
                { value: 'req_completion', label: '4 Sets Certificate of Completion' },
                { value: 'req_asbuilt', label: 'As-Built Plans and Specifications' },
                { value: 'req_fsec', label: 'Issued Fire Safety Evaluation Clearance (FSEC)' },
              ].map((item) => (
                <label key={item.value} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition duration-150">
                  <input type="checkbox" name="requirementsSubmitted" value={item.value} onChange={handleRequirementsChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="pt-4">
              <label htmlFor="other-docs" className="block text-sm font-medium text-gray-700">Other documents (specify):</label>
              <input type="text" id="other-docs" name="otherDocs" value={formData.otherDocs} onChange={handleOtherDocsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {/* Section 4: Project Details */}
          <div className="space-y-4">
             <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-100 pb-2 pt-4">
              4. Project Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">Name of Project:</label>
                <input type="text" id="project-name" name="projectName" value={formData.projectDetails.projectName} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label htmlFor="project-location" className="block text-sm font-medium text-gray-700">Project Location:</label>
                <input type="text" id="project-location" name="projectLocation" value={formData.projectDetails.projectLocation} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
               <div>
                <label htmlFor="occupancy-use" className="block text-sm font-medium text-gray-700">Character of Occupancy/Use:</label>
                <input type="text" id="occupancy-use" name="occupancyUse" value={formData.projectDetails.occupancyUse} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="no-storeys" className="block text-sm font-medium text-gray-700">No. of Storeys:</label>
                    <input type="number" id="no-storeys" name="noStoreys" value={formData.projectDetails.noStoreys} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                  </div>
                   <div>
                    <label htmlFor="no-units" className="block text-sm font-medium text-gray-700">No. of Units:</label>
                    <input type="number" id="no-units" name="noUnits" value={formData.projectDetails.noUnits} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                   <div>
                    <label htmlFor="total-floor-area" className="block text-sm font-medium text-gray-700">Total Floor Area:</label>
                    <input type="text" id="total-floor-area" name="totalFloorArea" value={formData.projectDetails.totalFloorArea} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
              </div>
              <div>
                <label htmlFor="date-completion" className="block text-sm font-medium text-gray-700">Date of Completion:</label>
                <input type="date" id="date-completion" name="dateCompletion" value={formData.projectDetails.dateCompletion} onChange={handleProjectDetailsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
            </div>
          </div>

          {/* Section 5: Signatures */}
          <div className="mt-12 pt-8 border-t-2 border-gray-300">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              5. Certification and Signatures
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="text-center">
                <p className="mb-2 text-gray-600">Submitted by:</p>
                <input type="text" placeholder="Type Printed Name Here" id="owner-signature-name" name="ownerName" value={formData.signatures.ownerName} onChange={handleSignatureChange} className="border-b-2 border-gray-600 w-full max-w-xs text-center p-1 focus:outline-none focus:border-indigo-500" required />
                <p className="text-sm font-medium text-gray-700 mt-2">Owner/Permittee</p>
                <p className="text-xs text-gray-500">(Signature Over Printed Name)</p>
              </div>
              <div className="text-center">
                <p className="mb-2 text-gray-600">Attested by:</p>
                <input type="text" placeholder="Type Printed Name Here" id="inspector-signature-name" name="inspectorName" value={formData.signatures.inspectorName} onChange={handleSignatureChange} className="border-b-2 border-gray-600 w-full max-w-xs text-center p-1 focus:outline-none focus:border-indigo-500" required />
                <p className="text-sm font-medium text-gray-700 mt-2">Full-Time Inspector or Supervisor of Construction</p>
                <p className="text-xs text-gray-500">(Signature Over Printed Name)</p>
              </div>
            </div>
            <div className="flex justify-center mt-12">
              <div className="text-center w-full max-w-sm">
                <p className="mb-2 text-gray-600">Prepared by:</p>
                <input type="text" placeholder="Type Printed Name Here" id="engineer-signature-name" name="engineerName" value={formData.signatures.engineerName} onChange={handleSignatureChange} className="border-b-2 border-gray-600 w-full max-w-xs text-center p-1 focus:outline-none focus:border-indigo-500" required />
                <p className="text-sm font-medium text-gray-700 mt-2">Architect or Civil Engineer</p>
                <p className="text-xs text-gray-500">(Signed and Sealed Over Printed Name)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-8 border-t border-indigo-100">
            <button type="submit" disabled={loading} className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OccupancyApplication;