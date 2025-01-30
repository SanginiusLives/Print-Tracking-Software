import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    function handleSubmit (e) {
        e.preventDefault();
        setUsername(username);
        localStorage.setItem("userId", username);
        navigate("/machines");
    }

    return (
        <>
            <h1>Welcome</h1>
            <p>Enter your username</p>
            <form
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    value={username}
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="submit"
                />
            </form>
        </>
    )
}

export default Login;