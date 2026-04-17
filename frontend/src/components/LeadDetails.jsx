import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function LeadDetails({ token, role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [chat, setChat] = useState({ messages: [] });

  // Upload State
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('gst_report');
  const [uploading, setUploading] = useState(false);

  // Analyst Data Gate State
  const [financialData, setFinancialData] = useState({ turnover: '', profit: '', industry: '', dateOfIncorporation: '' });
  const [rcmData, setRcmData] = useState({ recommendedAmount: '', recommendedTenure: '', internalNotes: '' });

  // Chat/Action State
  const [chatMsg, setChatMsg] = useState('');
  const stageContext = role === 'rcm' || lead?.stage === 'rcm_review' ? 'rcm_credit' : 'credit_sales';

  const fetchData = async () => {
    try {
      const [leadRes, docRes, chatRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/chats/${id}/${stageContext}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLead(leadRes.data);
      setDocuments(docRes.data);
      setChat(chatRes.data);
      if (leadRes.data) {
        setFinancialData({
          turnover: leadRes.data.turnover || '', profit: leadRes.data.profit || '',
          industry: leadRes.data.industry || '', dateOfIncorporation: leadRes.data.dateOfIncorporation ? leadRes.data.dateOfIncorporation.split('T')[0] : ''
        });
        setRcmData({
          recommendedAmount: leadRes.data.recommendedAmount || '',
          recommendedTenure: leadRes.data.recommendedTenure || '',
          internalNotes: leadRes.data.internalNotes || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [id, token]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadId', id);
    formData.append('type', docType);

    try {
      await axios.post('http://localhost:5000/api/documents', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      fetchData();
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const verifyDoc = async (docId, status, reason = '') => {
    try {
      await axios.put(`http://localhost:5000/api/documents/${docId}`, { status, rejectionReason: reason }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const updateLead = async (updates) => {
    try {
      await axios.put(`http://localhost:5000/api/leads/${id}`, updates, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      if (updates.stage === 'closed_lost' || updates.stage === 'closed_won') navigate('/dashboard');
    } catch (err) { console.error(err); }
  };

  const sendQuery = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/chats/${id}/${stageContext}`, { text: chatMsg }, { headers: { Authorization: `Bearer ${token}` } });
      setChatMsg('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (!lead) return <div className="p-12 text-center">Loading Lead Data...</div>;

  const isSales = role === 'sales';
  const isAnalyst = role === 'analyst';
  const isRcm = role === 'rcm';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{lead.companyName}</h1>
          <p className="text-sm text-slate-500">GSTIN: {lead.gstin} | Stage: <span className="font-semibold text-violet-600 dark:text-violet-400">{lead.stage.replace('_', ' ').toUpperCase()}</span></p>
        </div>

        {/* Action Controls based on Stage and Role */}
        <div className="flex gap-2">
          {isAnalyst && lead.stage === 'pre_screening' && (
            <button onClick={() => {
              if (!financialData.turnover || !financialData.profit || !financialData.industry || !financialData.dateOfIncorporation) {
                alert('Please fill out all Financial Analyst Inputs before approving pre-screening.');
                return;
              }
              updateLead({ ...financialData, stage: 'underwriting' });
            }} className="btn-primary py-2 px-4 shadow-none text-sm">Approve Pre-Screening</button>
          )}
          {isAnalyst && lead.stage === 'underwriting' && (
            <button onClick={() => updateLead({ stage: 'cam_assessment' })} className="btn-primary py-2 px-4 shadow-none text-sm">Move to CAM</button>
          )}
          {isAnalyst && lead.stage === 'cam_assessment' && (
            <button onClick={() => {
              if (!rcmData.recommendedAmount || !rcmData.recommendedTenure || !rcmData.internalNotes) {
                alert('Please fill out the recommended amount, tenure, and internal notes before sending to RCM.');
                return;
              }
              updateLead({ ...rcmData, stage: 'rcm_review' });
            }} className="btn-primary py-2 px-4 shadow-none text-sm">Send to RCM</button>
          )}
          {isRcm && lead.stage === 'rcm_review' && (
            <>
              <button onClick={() => updateLead({ stage: 'closed_won' })} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg text-sm transition-colors">Sanction Lead</button>
              <button onClick={() => updateLead({ stage: 'closed_lost', rejectionReason: 'RCM Rejected' })} className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg text-sm transition-colors">Reject Case</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Docs & Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Documents</h2>

            {/* Upload Area */}
            {(isSales || (isAnalyst && lead.stage === 'cam_assessment')) && (
              <form onSubmit={handleFileUpload} className="mb-6 flex flex-col sm:flex-row gap-3 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium mb-1">Document Type</label>
                  <select className="input-field py-1.5 text-sm" value={docType} onChange={e => setDocType(e.target.value)}>
                    <option value="gst_report">GST Report</option>
                    <option value="bank_statements">Bank Statements</option>
                    <option value="loan_schedule">Loan Schedule</option>
                    <option value="mca_report">MCA Report</option>
                    <option value="itr">ITR</option>
                    <option value="customer_ledgers">Customer Ledgers</option>
                    <option value="cam_excel">CAM Excel</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium mb-1">Select File</label>
                  <input type="file" required onChange={e => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                </div>
                <button type="submit" disabled={uploading} className="btn-primary py-1.5 px-6 text-sm">{uploading ? '...' : 'Upload'}</button>
              </form>
            )}

            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  No documents found. {role === 'sales' ? 'Use the form above to upload documents.' : 'Waiting for documents to be uploaded.'}
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc._id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">📄</div>
                      <div>
                        <p className="font-medium text-sm text-slate-800 dark:text-white capitalize">{doc.type.replace('_', ' ')}</p>
                        <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">{doc.originalName}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${doc.status === 'verified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : doc.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                      {isAnalyst && doc.status === 'pending_verification' && (
                        <div className="flex gap-1.5 ml-2">
                          <button onClick={() => verifyDoc(doc._id, 'verified')} className="p-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-md shadow-sm transition-colors" title="Verify Document">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => verifyDoc(doc._id, 'rejected', 'Invalid Document')} className="p-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-md shadow-sm transition-colors" title="Reject Document">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analyst Forms */}
          {isAnalyst && lead.stage === 'pre_screening' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Financial Analyst Inputs</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Turnover" className="input-field" value={financialData.turnover} onChange={e => setFinancialData({ ...financialData, turnover: e.target.value })} />
                <input type="number" placeholder="Profit" className="input-field" value={financialData.profit} onChange={e => setFinancialData({ ...financialData, profit: e.target.value })} />
                <input type="text" placeholder="Industry" className="input-field" value={financialData.industry} onChange={e => setFinancialData({ ...financialData, industry: e.target.value })} />
                <input type="date" className="input-field" value={financialData.dateOfIncorporation} onChange={e => setFinancialData({ ...financialData, dateOfIncorporation: e.target.value })} />
              </div>
            </div>
          )}

          {isAnalyst && lead.stage === 'cam_assessment' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Risk & CAM Summary</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="number" placeholder="Recommended Amount" className="input-field" value={rcmData.recommendedAmount} onChange={e => setRcmData({ ...rcmData, recommendedAmount: e.target.value })} />
                <input type="number" placeholder="Recommended Tenure (Months)" className="input-field" value={rcmData.recommendedTenure} onChange={e => setRcmData({ ...rcmData, recommendedTenure: e.target.value })} />
              </div>
              <textarea placeholder="Internal Risk Notes..." rows="3" className="input-field w-full" value={rcmData.internalNotes} onChange={e => setRcmData({ ...rcmData, internalNotes: e.target.value })} />
            </div>
          )}

          {isRcm && lead.stage === 'rcm_review' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Analyst Risk Notes</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm">{lead.internalNotes || 'No notes provided.'}</p>
              <div className="mt-4 flex gap-4 text-sm font-medium">
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-100 dark:border-violet-800">Amt: ₹{lead.recommendedAmount}</div>
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-100 dark:border-violet-800">Tenure: {lead.recommendedTenure}m</div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Chat Interface */}
        <div className="glass-card p-0 flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <h2 className="font-bold text-slate-800 dark:text-white">Query Board</h2>
            <p className="text-xs text-slate-500">Channel: {stageContext.replace('_', ' ')}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat?.messages?.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender?.role === role ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-1 px-1 uppercase">{msg.sender?.role}</span>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender?.role === role ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {(!chat?.messages || chat.messages.length === 0) && (
              <p className="text-center text-slate-400 text-sm mt-10">No queries yet</p>
            )}
          </div>

          <form onSubmit={sendQuery} className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              className="input-field rounded-full py-2"
              placeholder="Ask for clarification..."
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
            />
            <button type="submit" className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              ➔
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
