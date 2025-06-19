import { useState, useEffect } from "react";
import { useApp } from "./Context";
import toast from "react-hot-toast";
import AdminDashBoard from "./AdminDashboard";

export default function Admin() {
  const { token, setToken } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logged, setLogged] = useState(token === "admin");

  useEffect(() => {
    if (token !== "admin") {
      setLogged(false);
    }
  }, [token]);

const login = async () => {
  const res = await fetch("http://localhost:5000/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    setToken("admin", "admin");
    toast.success("Logged in successfully");
    window.location.reload(); 
  } else {
    toast.error("Invalid credentials");
  }
};


  if (!logged) {
    return (
      <div className="container mt-5 pt-5 text-center" style={{ maxWidth: 400}}>
        <h4 >Admin Login</h4>
        <input
          placeholder="Email"
          className="form-control my-3"
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="input-group mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="form-control mb-2"
            onChange={(e) => setPass(e.target.value)}
          />
          <span
            className="input-group-text"
            style={{ cursor: "pointer", height: "50%" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            👁️
          </span>
        </div>
        <button className="btn btn-warning w-100" onClick={login}>
          Login
        </button>
      </div>
    );
  }

  return <AdminDashBoard />;
}
