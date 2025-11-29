import React, { useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Components
import DashboardSidebar from "../components/layout/DashboardSidebar.jsx";
import ApplicationTable from "../components/application/ApplicationTable.jsx";
import WorkflowModal from "../components/modals/WorkflowModal.jsx";
import CalendarPage from "../components/CalendarPage.jsx";
import { useAuth } from '../../context/AuthContext';

// Hooks
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function BfpDashboard() {
  const role = "bfpadmin"; 
  const { logout } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  // --- State ---
  const [currentPage, setCurrentPage] = useState("overview");
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // --- Fetch Data ---
  const fetchData = async () => {
  try {
    const [appsRes, eventsRes] = await Promise.all([
      axiosPrivate.get("/api/applications/all"),
      axiosPrivate.get("/api/events")
    ]);

    const all = appsRes.data?.applications || [];


    // FILTER BFP RELATED APPLICATIONS
    const bfpApps = all.filter(app => {
      const status = app.status;
      const history = app.workflowHistory || [];

      const hasBfpAction = history.some(h =>
        (h.comments || "").toLowerCase().includes("bfp")
      );

      return (
        status === "Pending BFP" ||   
        hasBfpAction             
      );
    });




    setApplications(bfpApps);
    setEvents(eventsRes.data?.events || []);
    setError(null);

  } catch (err) {
    console.error("Error loading data:", err);
    setError("Unable to load data");
    setApplications([]);
    setEvents([]);
  } finally {
    setLoading(false);
  }
};


    const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };


  useEffect(() => {
    setLoading(true);
    fetchData().then(() => setLoading(false));
  }, [axiosPrivate]);

  const stats = useMemo(() => {
    if (!Array.isArray(applications)) return { newApp: 0, cleared: 0, returns: 0 };

    const newApp = applications.filter(app => app.status === "Pending BFP").length;
    const cleared = applications.filter(app => 
        ["Pending Mayor", "Approved", "Permit Issued"].includes(app.status)
    ).length;

    const returns = applications.filter(app => app.status === "Rejected").length;

    return { newApp, cleared, returns };
  }, [applications]);


  
  // --- Search Filter ---
  const filteredApplications = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    const query = searchQuery.toLowerCase();
  
    if (!query) return applications;

    return applications.filter((app) => {
      const owner = `${app.applicant?.first_name || ""} ${app.applicant?.last_name || ""}`.toLowerCase();
      const ref = app.referenceNo?.toLowerCase() || "";
      return owner.includes(query) || ref.includes(query);
    });
  }, [applications, searchQuery]);



  // --- Activity Logs ---
  const recentActivities = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    return applications
      .flatMap((app) =>
        (app.workflowHistory || []).map((entry) => ({
          ...entry,
          referenceNo: app.referenceNo,
          timestamp: new Date(entry.timestamp),
        }))
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8); 
  }, [applications]);



  // --- Handlers ---
  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setIsWorkflowModalOpen(true);
  };

  const handleUpdateApplication = async (appId, status, payload = {}) => {
    try {
      await axiosPrivate.put(`/api/applications/${appId}/status`, {
        status,
        ...payload,
      });
      fetchData();
      
      if (selectedApp?._id === appId) {
         setSelectedApp(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Failed to update application status.");
    }
  };

  const handleCloseModal = () => {
    setIsWorkflowModalOpen(false);
    setSelectedApp(null);
  };
 
  const renderContent = () => {
    if (currentPage === "calendar") {
      return <CalendarPage role={role} onEventsUpdated={fetchData} />;
    }



    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-3 space-y-8">
          
          {/* Header Text */}
          <div>
            <div className="flex items-center gap-2 mb-1">
               {/* You can add the Logo here if you have it imported */}
               <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Welcome BFP Admin</h2>
            </div>
            <h1 className="text-6xl font-extrabold text-gray-900">
              BFP <span className="text-red-600">FSEC</span> Dashboard
            </h1>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard label="New Application" count={stats.newApp} />
            <DashboardCard label="Cleared" count={stats.cleared} />
            <DashboardCard label="Returns" count={stats.returns} />
          </div>

          {/* Search Bar (Visual Only - updates state for table) */}
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-gray-200 border-none rounded-full py-3 pl-6 pr-12 text-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="Search Applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 absolute right-4 top-3" />
          </div>

          {/* Application List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Application List</h3>
            <ApplicationTable 
               role={role}
               applications={filteredApplications}
               loading={loading}
               error={error}
               searchQuery={searchQuery} // Pass query to let table handle internal filtering logic if needed
               setSearchQuery={setSearchQuery}
               onManageClick={handleOpenModal}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity Sidebar */}
        <div className="lg:col-span-1 bg-white h-fit min-h-[500px] rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-6 relative">
             {/* Vertical Line */}
             <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

             {recentActivities.map((activity, idx) => (
               <div key={idx} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></div>
                  <p className="text-xs text-gray-400 font-semibold mb-0.5">
                    {activity.timestamp.toLocaleDateString()} • {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {activity.referenceNo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.status} - {activity.comments || "Updated"}
                  </p>
               </div>
             ))}

             {recentActivities.length === 0 && (
                <p className="text-sm text-gray-400 italic pl-6">No recent activity.</p>
             )}
          </div>
        </div>



      </div>
    );
  };

  return (
    <div className="flex h-screen antialiased bg-gray-50">



      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {renderContent()}

        <div className="flex justify-end mb-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 shadow"
          >
            Logout
          </button>
        </div>

      </div>

      {/* Workflow Modal */}
      {isWorkflowModalOpen && selectedApp && (
        <WorkflowModal
          role={role}
          app={selectedApp}
          onClose={handleCloseModal}
          onUpdate={handleUpdateApplication}
        />
      )}
    </div>
  );
}

// --- Sub-components for Cleaner Code ---

function DashboardCard({ label, count }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 transition hover:shadow-md">
      <h4 className="text-sm font-semibold text-gray-500">{label}</h4>
      <p className="text-5xl font-bold text-gray-900">{count}</p>
    </div>
  );
}