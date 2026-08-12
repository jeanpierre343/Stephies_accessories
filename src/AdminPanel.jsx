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
    const response = await fetch('/api/admin/login', {
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
      <div className="dashboard-login-container">
        <div className="dashboard-login-card">
          <div className="lock-logo-container">
            <div className="lock-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock text-rose-500">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            </div>
            <h1 className="dashboard-header">Admin Portal</h1>
            <p className="dashboard-title">Stephie's_Accessories_Dashboard</p>
            <div className="form-container">
              <div className="relative">
            <input id="Password" required className="password-input" type={showPassword? "password":"text"} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button className="show-password-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye">
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-off">
                                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                                    <path d="m2 2 20 20"></path>
                                    </svg>)}
            </button>
            </div>
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="dashboard-button" onClick={handleLogin}>Enter Dashboard</button>
            </div>
            <p className="auth-only">Authorized access only</p>
        </div>
      </div>
    )
  }
    return(
      <div>
        <div className="dashboard-header-container">
           <div className="dashboard-title-container">
            <div className="header-logo-container"><img className="header-logo" src={logoPath}/></div>
            <div className="header-title">
              <p style={{fontSize: ".875rem",fontWeight:600}}>Admin Dashboard</p>
              <p style={{fontSize:".75rem",opacity:.4}}>Stephie's Accessories</p>
            </div>
           </div>
           <button className="dashboard-sign-out-button" onClick={()=> {setLoggedin(false)}}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg> Sign Out</button>
        </div>
        <div className="dashboard-navbar">
          <button className="navbar-button">Gallery</button>
          <button className="navbar-button">Reviews</button>
          <button className="navbar-button">Dev Config</button>
        </div>
      </div>
    )
}