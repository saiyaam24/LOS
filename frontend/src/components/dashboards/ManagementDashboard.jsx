import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ManagementDashboard({ token }) {
  const [leads, setLeads] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [assignment, setAssignment] = useState({});

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

  const fetchAnalysts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/analysts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchAnalysts();
  }, [token]);

  const handleAssign = async (leadId) => {
    try {
      await axios.put(`http://localhost:5000/api/leads/${leadId}/assign`,
        { analystId: assignment[leadId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
    } catch (err) {
      console.error('Failed to assign analyst', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Management Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Assign leads to Credit Analysts and oversee operations.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Lead Queue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Constitution</th>
                <th className="pb-3 font-medium">Quantum</th>
                <th className="pb-3 font-medium">Assignment</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-100">
                    <Link to={`/lead/${lead._id}`} className="hover:underline">{lead.companyName}</Link>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">{lead.constitution}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">₹{lead.expectedQuantum?.toLocaleString()}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="input-field py-1"
                        value={assignment[lead._id] || lead.assignedAnalyst?._id || ''}
                        onChange={(e) => setAssignment({ ...assignment, [lead._id]: e.target.value })}
                      >
                        <option value="">-- Unassigned --</option>
                        {analysts.map(ans => (
                          <option key={ans._id} value={ans._id}>{ans.email}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(lead._id)}
                        disabled={!assignment[lead._id] || assignment[lead._id] === lead.assignedAnalyst?._id}
                        className="btn-primary py-1.5 px-3 text-xs disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                      {lead.stage.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No leads in the pipeline.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
