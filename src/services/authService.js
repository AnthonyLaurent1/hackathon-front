const TOKEN_KEY = 'carbon_jwt';
const USER_KEY = 'carbon_user';

const decodeJwt = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  const decoded = decodeJwt(token);
  if (decoded) {
    localStorage.setItem(USER_KEY, JSON.stringify({ email: decoded.sub || decoded.email || 'user' }));
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify({ email: 'user' }));
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

export const login = async (email, password) => {
  if (email === 'demo@carbon' && password === 'hackathon') {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: email, email, exp: Math.floor(Date.now() / 1000) + 3600 }));
    const token = `${header}.${payload}.signature`;    
    setToken(token);
    return { token, user: { email } };
  }

  // Requête vers backend Spring Boot
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Identifiants invalides');
  }

  const data = await response.json();
  setToken(data.token);
  return { token: data.token, user: data.user };
};
