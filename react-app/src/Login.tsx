// pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

const SCOPE = "REACT_MFE";

function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Your authentication logic here
    try {
      // Assuming this is your API call
      // use "fetch", call to "localhost:3000/auth/login" with method "POST"
      // response has "token" field
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      const json = await response.json();

      if (response.status !== 200) {
        console.error("Login failed:", response.body);
        return;
      }

      // verify token must have REACT_MFE in scopes
      const decoded: any = jwtDecode(json.token);
      const scopes = decoded.scopes;
      if (!scopes.includes(SCOPE)) {
        console.error("Invalid scope");
        return;
      }

      localStorage.setItem("token", json.token);
      navigate("/app");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={(e) => handleLogin(e)}>
      <input
        type="text"
        value={credentials.email}
        onChange={(e) =>
          setCredentials({ ...credentials, email: e.target.value })
        }
        placeholder="email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
