import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('datesite_token') || null);
  const [loading, setLoading] = useState(true);

  // Helper to save account backup locally
  const saveLocalAccountBackup = (name, email, password) => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const accounts = JSON.parse(localStorage.getItem('datesite_accounts_backup') || '{}');
      accounts[cleanEmail] = { name: name || 'Creator', email: cleanEmail, password };
      localStorage.setItem('datesite_accounts_backup', JSON.stringify(accounts));
    } catch (e) {}
  };

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token invalid or server restarted user list
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const accounts = JSON.parse(localStorage.getItem('datesite_accounts_backup') || '{}');
    const localBackup = accounts[cleanEmail];

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          nameBackup: localBackup?.name
        })
      });
      const data = await res.json();

      if (!res.ok) {
        // Fallback: If Vercel serverless container lost the DB record, but we have local backup matching password
        if (localBackup && localBackup.password === password) {
          return await signup(localBackup.name, cleanEmail, password);
        }
        throw new Error(data.error || 'Invalid email or password');
      }

      saveLocalAccountBackup(data.user.name, cleanEmail, password);
      localStorage.setItem('datesite_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Secondary check: if network or backend 401 occurred but local credentials match
      if (localBackup && localBackup.password === password) {
        try {
          return await signup(localBackup.name, cleanEmail, password);
        } catch (signupErr) {
          throw new Error(err.message || 'Login failed');
        }
      }
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: cleanEmail, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');

    saveLocalAccountBackup(name.trim(), cleanEmail, password);
    localStorage.setItem('datesite_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('datesite_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

