import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function SalesDashboard({ token }) {
  const [leads, setLeads] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    constitution: 'Private Limited',
    gstin: '',
    source: '',
    expectedProduct: '',
    expectedQuantum: '',
    pocDetails: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/leads', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowWizard(false);
      setFormData({
        companyName: '', constitution: 'Private Limited', gstin: '', source: '', expectedProduct: '', expectedQuantum: '', pocDetails: ''
      });
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sales Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your created leads and documentation.</p>
        </div>
        <button onClick={() => setShowWizard(!showWizard)} className="btn-primary">
          {showWizard ? 'Cancel' : 'Create New Lead'}
        </button>
      </div>

      {showWizard && (
        <div className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">New Lead Application</h2>
          {error && <div className="mb-4 text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input required type="text" className="input-field" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Constitution</label>
              <select required className="input-field" value={formData.constitution} onChange={e => setFormData({ ...formData, constitution: e.target.value })}>
                <option value="Private Limited">Private Limited</option>
                <option value="Limited">Limited</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">LLP</option>
                <option value="Sole Prop">Sole Prop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GSTIN / PAN</label>
              <input required type="text" className="input-field" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <input required type="text" className="input-field" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Product</label>
              <input required type="text" className="input-field" value={formData.expectedProduct} onChange={e => setFormData({ ...formData, expectedProduct: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Quantum (INR)</label>
              <input required type="number" className="input-field" value={formData.expectedQuantum} onChange={e => setFormData({ ...formData, expectedQuantum: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">POC Details</label>
              <textarea required rows="2" className="input-field" value={formData.pocDetails} onChange={e => setFormData({ ...formData, pocDetails: e.target.value })} />
            </div>
            <div className="md:col-span-2 text-right">
              <button disabled={isLoading} type="submit" className="btn-primary w-full md:w-auto">
                {isLoading ? 'Submitting...' : 'Submit Lead'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Your Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                <th className="pb-3 font-medium cursor-pointer">Company</th>
                <th className="pb-3 font-medium">GSTIN</th>
                <th className="pb-3 font-medium">Stage</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-100">{lead.companyName}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">{lead.gstin}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                      {lead.stage.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link to={`/lead/${lead._id}`} className="text-violet-600 dark:text-violet-400 hover:underline text-sm font-medium">
                      View details & upload docs →
                    </Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">No leads found. Create one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
