import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function RCMDashboard({ token }) {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">RCM Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Review verified leads and make final sanctions.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Pending RCM Reviews</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Expected Quantum</th>
                <th className="pb-3 font-medium">Analyst</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-100">
                    {lead.companyName}
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">₹{lead.expectedQuantum?.toLocaleString()}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">
                    {lead.assignedAnalyst?.email || 'Unassigned'}
                  </td>
                  <td className="py-4 text-right">
                    <Link to={`/lead/${lead._id}`} className="btn-primary py-1.5 px-4 text-sm">
                      Review Case
                    </Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">No leads currently require RCM review.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
