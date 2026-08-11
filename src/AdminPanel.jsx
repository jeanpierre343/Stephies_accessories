import { useState, useEffect } from 'react';
import logoPath from './images/logo/logo.jpg';

export default function AdminPanel() {
  const [loggedin,setLoggedin] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [password,setPassword] = useState('');
  const [loginError,setLoginError] = useState('');

  const handleLogin = async() =>{
    setLoginError('');

    try {
    const response = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setLoggedin(true);
    } else {
      setLoginError(data.message);
    }
  } catch (error) {
    console.error(error);
    setLoginError('Unable to connect to the server.');
  }
  }

  if(!loggedin){
    return(
      <div class="dashboard-login-container">
        <div class="dashboard-login-card">
          <div class="lock-logo-container">
            <div class="lock-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock text-rose-500">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            </div>
            <h1 class="dashboard-header">Admin Portal</h1>
            <p class="dashboard-title">Stephie's_Accessories_Dashboard</p>
            <div class="form-container">
              <div class="relative">
            <input id="Password" required class="password-input" type={showPassword? "password":"text"} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button class="show-password-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye">
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off">
                                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                                    <path d="m2 2 20 20"></path>
                                    </svg>)}
            </button>
            </div>
            {loginError && <p class="login-error">{loginError}</p>}
            <button class="dashboard-button" onClick={handleLogin}>Enter Dashboard</button>
            </div>
            <p class="auth-only">Authorized access only</p>
        </div>
      </div>
    )
  }
    return(
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the Admin Dashboard!</p>
        </div>
    )
}