import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AnalystDashboard({ token }) {
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analyst Queue</h1>
        <p className="text-slate-500 text-sm mt-1">Verify documents, prepare CAMs, and structure underwriting models.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Assigned Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Constitution</th>
                <th className="pb-3 font-medium">Stage</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-100">
                    {lead.companyName}
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">{lead.constitution}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                      {lead.stage.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link to={`/lead/${lead._id}`} className="btn-primary py-1.5 px-4 text-sm">
                      Process Lead
                    </Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">You have no assigned leads.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
