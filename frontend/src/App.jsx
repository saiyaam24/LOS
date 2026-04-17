import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import SalesDashboard from './components/dashboards/SalesDashboard';
import ManagementDashboard from './components/dashboards/ManagementDashboard';
import AnalystDashboard from './components/dashboards/AnalystDashboard';
import RCMDashboard from './components/dashboards/RCMDashboard';
import LeadDetails from './components/LeadDetails';

// Role-based Router
function RoleBasedDashboard({ token, role }) {
  if (role === 'sales') return <SalesDashboard token={token} />;
  if (role === 'management') return <ManagementDashboard token={token} />;
  if (role === 'analyst') return <AnalystDashboard token={token} />;
  if (role === 'rcm') return <RCMDashboard token={token} />;
  return <Navigate to="/login" />;
}

function Navigation({ token, role, setToken, setRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    navigate('/login');
  };

  return (
    <nav className="glass-card sticky top-0 z-50 mb-8 mx-4 sm:mx-8 mt-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl leading-none tracking-tighter">LOS</span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Loan Origination System
            </span>
            {role && (
              <span className="ml-4 uppercase tracking-widest text-[10px] font-bold px-2 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 rounded">
                ROLE: {role}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {token ? (
              <button
                onClick={handleLogout}
                className="text-slate-600 dark:text-slate-300 hover:text-red-500 font-medium transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm hidden sm:block">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  // Validate session on load
  useEffect(() => {
    if (token) {
      axios.get('https://los-hrhx.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setRole(res.data.role);
          localStorage.setItem('role', res.data.role);
        })
        .catch(() => {
          setToken(null);
          setRole(null);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        });
    }
  }, [token]);

  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 dark:bg-violet-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <Navigation token={token} role={role} setToken={setToken} setRole={setRole} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
            <Route path="/register" element={<Register setToken={setToken} setRole={setRole} />} />
            <Route path="/dashboard" element={token ? <RoleBasedDashboard token={token} role={role} /> : <Navigate to="/login" />} />
            <Route path="/lead/:id" element={token ? <LeadDetails token={token} role={role} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
