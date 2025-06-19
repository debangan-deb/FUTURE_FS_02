import { useEffect, useState } from "react";
import { useApp } from "./Context";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Field = ({ label, field, data, setData, edit, setEdit, updateField, original, setOriginal, type = "text", extra }) => (
  <div className="mb-3">
    <label>{label}</label>
    <div className="input-group">
      <input
        type={type}
        disabled={!edit[field]}
        value={data[field]}
        className="form-control"
        onChange={e => setData(prev => ({ ...prev, [field]: e.target.value }))}
        onFocus={() => setOriginal(o => ({ ...o, [field]: data[field] }))}
      />
      {extra}
      <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => {
        setEdit(e => ({ ...e, [field]: true }));
        setOriginal(o => ({ ...o, [field]: data[field] }));
      }}>✏️</span>
    </div>
    {edit[field] && (
      <div className="fade-in mt-2 d-flex gap-2">
        <button className="btn btn-warning" onClick={() => updateField(field)}>Update</button>
        <button className="btn btn-secondary" onClick={() => {
          setEdit(e => ({ ...e, [field]: false }));
          setData(d => ({ ...d, [field]: original[field] }));
        }}>Cancel</button>
      </div>
    )}
  </div>
);

export default function Profile() {
  const { token, logout } = useApp();
  const isAdmin = token?.includes("admin@");
  const navigate = useNavigate();

  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [edit, setEdit] = useState({ name: false, email: false, password: false });
  const [original, setOriginal] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/${isAdmin ? "admin" : "user"}/info`, {
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(info => setData(info));
  }, [token, isAdmin]);

  const updateField = async (field) => {
    const value = data[field];
    if (!value) return toast.error("Field cannot be empty");

    if (field === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
      if (!passwordRegex.test(value)) {
        return toast.error("Password must be 6+ chars with uppercase, lowercase, number, symbol");
      }
    }

    const res = await fetch(`http://localhost:5000/${isAdmin ? "admin" : "user"}/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ field, value }),
    });

    if (res.ok) {
      toast.success("Updated successfully");
      setEdit(e => ({ ...e, [field]: false }));
      if (field === "password") {
        setShowPassword(false);
        setData(d => ({ ...d, password: "*****" }));
      }
    } else {
      toast.error("Update failed");
    }
  };

  const confirmDelete = async () => {
    const res = await fetch("http://localhost:5000/user/delete", {
      method: "DELETE",
      headers: { Authorization: token },
    });

    if (res.ok) {
      toast.success("Account successfully deleted");
      logout();
      navigate("/login?refresh=" + Date.now());
    } else {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="container mt-5 pt-5" style={{ maxWidth: 500 }}>
      <h3 className="mb-4 text-center">Profile</h3>

      {!isAdmin && (
        <Field
          label="Name"
          field="name"
          data={data}
          setData={setData}
          edit={edit}
          setEdit={setEdit}
          updateField={updateField}
          original={original}
          setOriginal={setOriginal}

        />
      )}

      <Field
        label="Email"
        field="email"
        data={data}
        setData={setData}
        edit={edit}
        setEdit={setEdit}
        updateField={updateField}
        original={original}
        setOriginal={setOriginal}
      />

      <Field
        label="Password"
        field="password"
        type={showPassword ? "text" : "password"}
        data={data}
        setData={setData}
        edit={edit}
        setEdit={setEdit}
        updateField={updateField}
        original={original}
        setOriginal={setOriginal}
        extra={
          <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => setShowPassword(p => !p)}>👁️</span>
        }
      />

      {!isAdmin && (
        <>
          <button className="btn btn-danger w-100 mt-3" onClick={() => setShowModal(true)}>
            Delete Account
          </button>

          {showModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-danger">Confirm Deletion</h5>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to delete this account? The task can't be undone.</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>No</button>
                    <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
