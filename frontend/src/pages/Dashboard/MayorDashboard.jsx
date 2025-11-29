import React, { useState, useEffect, useMemo } from "react";

import ApplicationTable from "../components/application/ApplicationTable.jsx";
import WorkflowModal from "../components/modals/WorkflowModal.jsx";
import CalendarPage from "../components/CalendarPage.jsx";

import { useAuth } from '../../context/AuthContext';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function MayorDashboard() {
  const role = "mayoradmin";
  const { logout } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  // --- State ---
  const [currentPage, setCurrentPage] = useState("overview");
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  const mayorRegex = /\bmayor\b|\bendorse(ment|ed|)\b|\bmayor permit\b|\bendorse(ed)? by mayor\b/;


  function isHandledByMayor(app) {
  return (app.workflowHistory || []).some(h => {
    const comments = (h.comments || "").toLowerCase();
    return (
      h.role === "mayoradmin" ||
      h.actorRole === "mayoradmin" ||
      comments.includes("mayor") ||
      comments.includes("endorse")
    );
  });
}


  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, eventsRes] = await Promise.all([
        axiosPrivate.get("/api/applications/all"),
        axiosPrivate.get("/api/events"),
      ]);

      const allApps = appsRes.data?.applications || [];


      // FILTER MAYOR RELATED APPLICATIONS
      const mayorApps = allApps.filter(app => {
      const status = app.status;
      const inMayorQueue = status === "Pending Mayor";

      const hasMayorAction =
        (app.workflowHistory || []).some(h =>
          (h.role === "mayoradmin") ||
          (h.actorRole === "mayoradmin") ||
          (h.comments || "").toLowerCase().includes("mayor") ||
          (h.comments || "").toLowerCase().includes("endorse")
        );

      const forwardedToOtherOffices =
        ["Pending MEO", "Approved", "Permit Issued", "Rejected"].includes(status);

      const forwardedButHandled = forwardedToOtherOffices && hasMayorAction;

      return inMayorQueue || forwardedButHandled;
    });


      setApplications(mayorApps);
      setEvents(eventsRes.data?.events || []);
      setError(null);
    } catch (err) {
      console.error("Error loading mayor dashboard data:", err);
      setError("Unable to load mayor dashboard data");
      setApplications([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Stats ---
  const stats = useMemo(() => {
    if (!Array.isArray(applications)) return { toApprove: 0, endorsed: 0, completed: 0, total: 0 };

    const toApprove = applications.filter(a => a.status === "Pending Mayor").length;

    const endorsed = applications.filter(a =>
      a.status === "Pending MEO" && isHandledByMayor(a)
    ).length;

    const completed = applications.filter(a =>
      (["Approved", "Permit Issued"].includes(a.status)) && isHandledByMayor(a)
    ).length;

    const total = applications.length;

    return { toApprove, endorsed, completed, total };
  }, [applications]);


  // --- Filtered list by search ---
  const filteredApplications = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    const q = (searchQuery || "").toLowerCase().trim();
    if (!q) return applications;

    return applications.filter((app) => {
      const owner = `${app.applicant?.first_name || ""} ${app.applicant?.last_name || ""}`.toLowerCase();
      const ref = (app.referenceNo || "").toLowerCase();
      return owner.includes(q) || ref.includes(q);
    });
  }, [applications, searchQuery]);



  // --- Recent activities ---
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
      .filter(e => {
        if (e.role === "mayoradmin" || e.actorRole === "mayoradmin") return true;
        return (e.comments || "").toLowerCase().match(mayorRegex);
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  }, [applications]);

  // --- Handlers ---
  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setIsWorkflowModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsWorkflowModalOpen(false);
    setSelectedApp(null);
  };

  const handleUpdateApplication = async (appId, status, payload = {}) => {
    try {
      await axiosPrivate.put(`/api/applications/${appId}/status`, {
        status,
        ...payload,
      });
      await fetchData();

      if (selectedApp?._id === appId) {
        setSelectedApp(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error("Failed to update application:", err);
      alert("Failed to update application status.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // --- Renderers ---
  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Welcome Mayor</h2>
          <h1 className="text-5xl font-extrabold text-gray-900">Mayor Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <DashboardCard label="For Approval" count={stats.toApprove} />
          <DashboardCard label="Endorsed to MEO" count={stats.endorsed} />
          <DashboardCard label="Completed" count={stats.completed} />
        </div>

        {/* Search & Table */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">

            <div className="relative w-72">
            </div>
          </div>

          <ApplicationTable
            role={role}
            applications={filteredApplications}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onManageClick={handleOpenModal}
          />
        </div>
      </div>

      {/* Right column: Recent activity */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[420px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Mayor Activity</h3>

        <div className="space-y-4 relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

          {recentActivities.length > 0 ? (
            recentActivities.map((act, idx) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute left-0 top-2 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white"></div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {act.timestamp.toLocaleDateString()} • {act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm font-bold text-gray-800">{act.referenceNo}</p>
                <p className="text-xs text-gray-500 mt-1">{act.status} - {act.comments || "Updated"}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No recent mayor activity.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 shadow"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => <CalendarPage role={role} onEventsUpdated={fetchData} />;

  const renderApplicationsPage = () => (
    <ApplicationTable
      role={role}
      applications={filteredApplications}
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onManageClick={handleOpenModal}
    />
  );

  const renderPage = () => {
    if (currentPage === "calendar") return renderCalendar();
    if (currentPage === "applications") return renderApplicationsPage();
    return renderOverview();
  };

  return (
    <div className="flex h-screen antialiased bg-gray-50">

      <div className="flex-1 overflow-y-auto p-6 md:p-10">

        {renderPage()}
      </div>

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


function DashboardCard({ label, count }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 transition hover:shadow-md">
      <h4 className="text-sm font-semibold text-gray-500">{label}</h4>
      <p className="text-4xl font-bold text-gray-900">{count}</p>
    </div>
  );
}
