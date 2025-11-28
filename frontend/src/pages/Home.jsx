import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import axios from "axios";

const getStatusBadge = (status) => {
  switch (status) {
    case 'Submitted':
    case 'Pending MEO':
    case 'Pending BFP':
    case 'Pending Mayor':
      return "bg-yellow-100 text-yellow-800";
    case 'Approved':
    case 'Permit Issued':
      return "bg-green-100 text-green-800";
    case 'Rejected':
      return "bg-red-100 text-red-800";
    case 'For Revision':
      return "bg-blue-100 text-blue-800";
    case 'Payment Pending':
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};


const getActionLink = (status, id, referenceNo) => {
  let text = "View Details";
  let to = `/track/${referenceNo}`; 

  switch (status) {
    case 'Approved':
    case 'Permit Issued':
      text = "View Issued Permit"; 
      to = `/track/${referenceNo}`;
      break;
    case 'For Revision':
      text = "Upload Files";
      to = `/application/edit/${id}`; 
      break;
    case 'Payment Pending':
       text = "View Details";
       to = `/track/${referenceNo}`;
       break;
  }
  
 return <Link to={to} className="text-blue-600 hover:text-blue-900">{text}</Link>;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};






const Home = () => {

  const { auth } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [applications, setApplications] = useState([]);
  const [trackLoading, setTrackLoading] = useState(true);

  useEffect(() => {
    if (!auth?.accessToken) {
      setTrackLoading(false);
      return;
    }

    const fetchData = async () => {
      setTrackLoading(true);
      try {
        const [profileRes, appsRes] = await Promise.all([
          axios.get("/api/users/me", {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            withCredentials: true,
          }),
          axios.get("/api/applications/my-applications", {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            withCredentials: true,
          })
        ]);
        
        setProfile(profileRes.data);
        setApplications(appsRes.data.applications);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      } finally {
        setTrackLoading(false); 
      }
    };
    
    fetchData();
  }, [auth]); 


  const scrollToApplication = () => {
    const section = document.getElementById("application");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
        <div className="flex justify-center md:justify-start">
         <img src="/illustration.jpg" alt="Homepage illustration" className="w-full max-w-lg object-contain"/>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight">
            San Vicente MEO
            <br />
            <span className="text-blue-600">Online Services System</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-md max-w-lg">
            Welcome to the Municipal Engineering Office (MEO) Online Services Portal. We provide a convenient and efficient way to apply for and
            track your building and occupancy permits from anywhere. Our goal is
            to make the process as simple and transparent as possible.
          </p>
          <div>
            <button
              onClick={scrollToApplication}
              className="cursor-pointer rounded-full bg-blue-400 text-white font-semibold px-8 py-3 text-sm sm:text-base transition hover:bg-blue-500">
              Start your application
            </button>
          </div>
        </div>
      </div>


      {/* APPLICATION SECTION */}
      <section id="application" className="text-center mt-40">
        <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-3">
         Apply For A New Permit
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-sm md:text-base">
         Choose the type of permit you need to begin your application process.
         You can download the checklist of requirements and upload documents
         digitally.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">



          {/* Building Permit */}
          <div className="rounded-2xl shadow-md p-8 flex flex-col items-center justify-between hover:shadow-xl transition">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <img
                  src="/skyscraper.png"
                  alt="Building Icon"
                  className="h-10 w-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-blue-700">Apply for</h3>
              <h2 className="text-2xl font-bold text-blue-900">
                Building Permit
              </h2>
              <p className="text-sm text-gray-500 text-center">
                Required for new construction, renovations, and major repairs.
              </p>
            </div>
            <div className="mt-6 flex flex-col items-center space-y-3">
              <Link to="/building-application" className="cursor-pointer rounded-full bg-blue-400 text-white font-semibold px-8 py-3 text-sm sm:text-base hover:bg-blue-500 transition">
                Apply now
              </Link>
              <Link to="/checklist" className="text-blue-600 text-sm hover:underline">
                Download Checklist
              </Link>
            </div>
          </div>



          {/* Occupancy Permit */}
          <div className="rounded-2xl shadow-md p-8 flex flex-col items-center justify-between hover:shadow-xl transition">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <img
                  src="/apartments.png"
                  alt="Occupancy Icon"
                  className="h-10 w-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-blue-700">Apply for</h3>
              <h2 className="text-2xl font-bold text-blue-900">
                Occupancy Permit
              </h2>
              <p className="text-sm text-gray-500 text-center">
                Required for new buildings or structures before they can be
                occupied.
              </p>
            </div>
            <div className="mt-6 flex flex-col items-center space-y-3">
              <Link to="/occupancy-application" className="cursor-pointer rounded-full bg-blue-400 text-white font-semibold px-8 py-3 text-sm sm:text-base hover:bg-blue-500 transition">
                Apply now
              </Link>
              <Link to="/checklist" className="text-blue-600 text-sm hover:underline">
                Download Checklist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRACK APPLICATION SECTION */}
      <section id="track" className="mt-40 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-3">
            Track Your Application Status
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-sm md:text-base">
            View the current status of your submitted permits and print official
            documents once approved.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                
                {trackLoading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Loading applications...
                    </td>
                  </tr>
                )}

                {!trackLoading && !auth && (
                    <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to view your applications.
                    </td>
                  </tr>
                )}

                {!trackLoading && auth && applications.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      You have not submitted any applications yet.
                    </td>
                  </tr>
                )}

                {!trackLoading && auth && applications.length > 0 && (
                  applications.map((app) => (
                    <tr key={app._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.applicationType} Permit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.referenceNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowGrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-light rounded-full ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {getActionLink(app.status, app._id, app.referenceNo)}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-center">
            <Link 
              to="/track"
              className="rounded-full bg-blue-400 text-white font-semibold px-8 py-3 text-sm sm:text-base hover:bg-blue-500 transition">
              Show more
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;