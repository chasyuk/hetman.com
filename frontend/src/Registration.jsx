import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios';

export function Registration() {

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLogin, setIsLogin] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    const handleRegistrationPage = async (userData, endpoint) => {
        if (endpoint.includes("login")) {
            try {
            await axios.post(endpoint, {
                email: userData.email,
                password: userData.password,
            });
            setIsLoggedIn(true);
            } catch (error) {
                setErrorMessage(error.response?.data?.detail);
            }

        } else{
            try {
            await axios.post(endpoint, {
                codename: userData.codename,
                name: userData.name,
                email: userData.email,
                password: userData.password,
            });
        } catch (error) {
            setErrorMessage(error.response?.data?.detail);
        }

        }
    };



    const [userData, setUserData] = useState({
        codename: "",
        name: "",
        email: "",
        password: ""
    })

    function changeData(e) {
        const { name, value } = e.target
        setUserData({
            ...userData,
            [name]: value
        });
    }

    const submitUser = async(e) =>{
        e.preventDefault()

        const endpoint = isLogin ? '/api/login' : '/api/register';

        let isFormEmpty = false
        if (!isLogin) {
        isFormEmpty = !userData.codename?.trim() || !userData.name?.trim() || !userData.email?.trim() || !userData.password?.trim();
        } else {
            isFormEmpty = !userData.email?.trim() || !userData.password?.trim();

        }

        if (isFormEmpty) {
            setErrorMessage("Please Fill Out All The Fields!")
        } else {
            const newUser = {
                codename: userData.codename,
                name: userData.name,
                email: userData.email,
                password: userData.password
            };
            handleRegistrationPage(newUser, endpoint);
        }

    }

  if (isLoggedIn) {
    return (
            <div>
                <h1>Successfully Logged In!</h1>
                {/* Add a logout button to test the flow */}
                <button onClick={() => setIsLoggedIn(false)}>Logout</button>
            </div>
        );
  } else {
    return (
        <div>
            <h3>Register Your Account</h3>
            <form onSubmit={submitUser}>
                {!isLogin && (
                    <div>
                        <input style={{border: "1px solid black"}} name="codename" type="text" onChange={changeData} placeholder='Your codename...' value={userData.codename}></input><br />
                        <input style={{border: "1px solid black"}} name="name" type="text" onChange={changeData} placeholder='Your Name...' value={userData.name}></input><br />
                    </div>
                )}
                <input style={{border: "1px solid black"}} name="email" type="email" onChange={changeData} placeholder='Your Email...' value={userData.email} required></input><br />
                <input style={{border: "1px solid black"}} name="password" type="password" onChange={changeData} placeholder='Your Password...' value={userData.password}></input><br />

            <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        {errorMessage && <p style={{color : "red"}}>{errorMessage}</p>}

        <p>
            {isLogin ? "No account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
            {isLogin ? "Register here" : "Login here"}
            </button>
        </p>
        </div>
    );
    };
}
