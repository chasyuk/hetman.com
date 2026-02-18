import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios';

export function Registration() {

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLogin, setIsLogin] = useState(false);

    const registerUser = async (userData, endpoint) => {
        if (endpoint.includes("login")) {
            try {
            await axios.post(endpoint, {
                email: userData.email,
                password: userData.password,
            });
            setIsLoggedIn(true);
            } catch (error) {
                alert(error.response?.data?.detail);
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
            alert(error.response?.data?.detail);
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
            alert("Please Fill Out All The Fields!")
        } else {
            const newUser = {
                codename: userData.codename,
                name: userData.name,
                email: userData.email,
                password: userData.password
            };
            registerUser(newUser, endpoint);
        }

    }

  if (isLoggedIn) {
    return (
    <div>
        <h1>Succesfully Logged In!</h1>
    </div>
    )
  } else {
    return (
        <div>
            <h3>Register Your Account</h3>
            <form onSubmit={submitUser}>
                {!isLogin && (
                    <div>
                        <input name="codename" type="text" onChange={changeData} placeholder='Your codename...' value={userData.codename}></input><br />
                        <input name="name" type="text" onChange={changeData} placeholder='Your Name...' value={userData.name}></input><br />
                    </div>
                )}
                <input name="email" type="email" onChange={changeData} placeholder='Your Email...' value={userData.email} required></input><br />
                <input name="password" type="password" onChange={changeData} placeholder='Your Password...' value={userData.password}></input><br />

            <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>


        <p style={{ marginTop: '20px' }}>
            {isLogin ? "No account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
            {isLogin ? "Register here" : "Login here"}
            </button>
        </p>
        </div>
    );
    };
}
