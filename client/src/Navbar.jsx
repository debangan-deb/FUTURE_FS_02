import { Link, useNavigate } from "react-router-dom";
import { useApp } from "./Context";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { cart, token, logout } = useApp();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const isAdmin = token === "admin";
  const isUser = token && !isAdmin;

  useEffect(() => {
    document.body.className = "bg-dark text-white";
  }, []);

  const handleLogout = () => {
    const wasAdmin = token === "admin";
    logout();
    toast.success("Logged out successfully");
    navigate(wasAdmin ? "/admin?refresh=" + Date.now() : "/login?refresh=" + Date.now());
    setExpanded(false);
  };

  const handleCartClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/cart");
    }
    setExpanded(false);
  };

  const closeMenu = () => setExpanded(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand fs-3 fw-bold" style={{ fontFamily: "cursive" }} onClick={closeMenu}>
          ShopNext
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-controls="navbarNav"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`} id="navbarNav">
          <div className="ms-auto d-flex flex-column flex-lg-row gap-2 align-items-start align-items-lg-center pt-3 pt-lg-0">
            <button
              className="btn btn-secondary"
              onClick={() => {
                navigate("/", { replace: true });
                window.location.reload(); 
                closeMenu();
              }}
            >
              Home
            </button>

            {!token && (
              <>
                <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Register</Link>
                <button className="btn btn-success" onClick={() => { navigate("/login?refresh=" + Date.now()); closeMenu(); }}>
                  Login
                </button>
                <Link to="/admin" className="btn btn-warning" onClick={closeMenu}>Admin</Link>
                <Link to="/support" className="btn btn-light" onClick={closeMenu}>Support</Link>
                <button className="btn btn-success position-relative" onClick={handleCartClick}>
                  <i className="bi bi-cart4" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cart.length}
                  </span>
                </button>
              </>
            )}

            {isUser && (
              <>
                <button className="btn btn-success position-relative" onClick={handleCartClick}>
                  <i className="bi bi-cart4" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cart.length}
                  </span>
                </button>
                <Link to="/my-orders" className="btn btn-info" onClick={closeMenu}>My Orders</Link>
                <Link to="/profile" className="btn btn-primary" onClick={closeMenu}>Profile</Link>
                <Link to="/support" className="btn btn-light" onClick={closeMenu}>Support</Link>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin-dashboard" className="btn btn-primary" onClick={closeMenu}>Dashboard</Link>
                <Link to="/admin/orders" className="btn btn-danger" onClick={closeMenu}>Manage Orders</Link>
                <Link to="/admin/users" className="btn btn-info" onClick={closeMenu}>Registered Users</Link>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
