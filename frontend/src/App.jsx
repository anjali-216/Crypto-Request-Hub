import { useState } from 'react';
import AuthPage from './components/AuthPage.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(loadUser);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Crypto Request Hub</h1>
        {user && (
          <div className="header-user">
            <span>
              {user.email} <span className="badge">{user.role}</span>
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="container">
        {!user && <AuthPage onLogin={handleLogin} />}
        {user?.role === 'USER' && <UserDashboard onAuthError={handleLogout} />}
        {user?.role === 'ADMIN' && <AdminDashboard onAuthError={handleLogout} />}
      </main>
    </div>
  );
}
