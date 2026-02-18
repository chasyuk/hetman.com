import { useEffect, useState } from 'react'
import './App.css'

export function Registration() {
    const [userData, setUserData] = useState({
        codeName: "",
        name: "",
        email: "",
        password: ""
    })

    const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users")) || []);

    function changeData(e) {
        const { name, value } = e.target
        setUserData({
            ...userData,
            [name]: value
        });
    }

    function handleRegistrateUser(newUser) {
        setUsers([...users, newUser])
        setUserData("")
    }

    function submitUser(e){
        e.preventDefault()

        const isFormEmpty = !userData.codeName?.trim() || !userData.name?.trim() || !userData.email?.trim() || !userData.password?.trim();
        const emailExists = users.some(user => user.email === userData.email);

        if (isFormEmpty) {
            alert("Please Fill Out All The Fields!")
        }   else if (emailExists) {
            alert("This Email Is Already Used!")
        } else {
            const newUser = {
                codeName: userData.codeName,
                name: userData.name,
                email: userData.email,
                password: userData.password
            }
            handleRegistrateUser(newUser)
        }

    }

    useEffect(()=> {
        localStorage.setItem("users", JSON.stringify(users));
    },[users]);

  return (
    <div>
        <h3>Register Your Account</h3>
        <form onSubmit={submitUser}>
            <input name="codeName" type="text" onChange={changeData} placeholder='Your Codename...' value={userData.codeName}></input><br />
            <input name="name" type="text" onChange={changeData} placeholder='Your Name...' value={userData.name}></input><br />
            <input name="email" type="email" onChange={changeData} placeholder='Your Email...' value={userData.email}></input><br />
            <input name="password" type="password" onChange={changeData} placeholder='Your Password...' value={userData.password}></input><br />
            <button type="submit">Register</button>
        </form>

        <h2>Current Users:</h2>
            <ul>
                {users.map((user, index) => (
                    <li key={index}>{user.codeName}<br />{user.name}<br />{user.email}<br />{user.password}<br /><br /><br /></li>
                ))}
            </ul>

    </div>
  )
}
