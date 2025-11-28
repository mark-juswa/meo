// ApplicationTable.jsx
import React from 'react';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';

export default function ApplicationTable({
  role,
  applications = [],
  loading = false,
  error = null,
  searchQuery,
  setSearchQuery,
  onManageClick,
}) {
  return (
    <div id="applications-page" className="page-content">
      <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">All Applications</h2>
          <SearchBar value={searchQuery} onChange={(v) => setSearchQuery(v)} />
        </div>

        <div className="overflow-x-auto">
          {loading && <p className="text-center text-gray-500">Loading applications...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Reference No</Th>
                  <Th>Owner</Th>
                  <Th>Type</Th>
                  <Th>Submitted</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-blue-50 transition duration-150">
                      <Td medium>{app.referenceNo || 'N/A'}</Td>
                      <Td>
                        {app.applicant
                          ? `${app.applicant.first_name || ''} ${app.applicant.last_name || ''}`
                          : 'N/A'}
                      </Td>
                      <Td>{app.applicationType || app.type || 'N/A'}</Td>
                      <Td>{new Date(app.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <StatusBadge status={app.status} />
                      </Td>
                      <Td center>
                        <button
                          onClick={() => onManageClick(app)}
                          className="text-blue-600 hover:text-blue-900 font-semibold transition duration-150"
                        >
                          Manage
                        </button>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// small helpers
const Th = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);
const Td = ({ children, medium, center }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm ${
      medium ? 'font-medium text-gray-900' : 'text-gray-500'
    } ${center ? 'text-center' : ''}`}
  >
    {children}
  </td>
);
