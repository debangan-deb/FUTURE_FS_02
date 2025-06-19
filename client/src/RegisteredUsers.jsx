import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./Context";
import { motion } from "framer-motion";

export default function RegisteredUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (token !== "admin") {
      navigate("/admin");
      return;
    }

    fetch("https://shopnext-wxjd.onrender.com/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched users:", data);
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, [token]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="container mt-5 pt-5">
      <motion.h2
        className="text-center mb-4 fw-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Registered Users
      </motion.h2>

      {loading ? (
        <div className="alert alert-info text-center">Loading users...</div>
      ) : users.length === 0 || users[0].length === 0 ? (
        <div className="alert alert-warning text-center">No users found.</div>
      ) : (
        <motion.table
          className="table table-bordered table-hover table-dark rounded shadow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <thead className="table-secondary text-dark text-center ">
            <tr>
              <th>Sl No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users[0].map((u, i) => (
              <motion.tr
                key={i}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center"
              >
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{formatDate(u.created_at)}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      )}
    </div>
  );
}
