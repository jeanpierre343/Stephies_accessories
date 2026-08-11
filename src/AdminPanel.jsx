import { useState, useEffect } from 'react';
import './images/logo/logo.jpg';

export default function AdminPanel() {
  const [loggedin,setLoggedin] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  if(!loggedin){
    return(
        <div class="dashboard-login-card">
            <h1 class="dashboard-header">Admin Portal</h1>
            <p class="dashboard-title">Steph's_Accessories_Dashboard</p>
            <input id="Password" class="password-input" type={showPassword? "password":"text"} placeholder="Enter Password" />
            <button class="sh" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye">
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off">
                                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                                    <path d="m2 2 20 20"></path>
                                    </svg>)}
            </button>
            <button class="dashboard-button">Enter Dashboard</button>
            <p class="auth-only">Authorized access only</p>
        </div>
    )
  }
    return(
        <div>
            <h1>A