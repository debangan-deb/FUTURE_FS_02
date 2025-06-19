import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "./Context";
import toast from "react-hot-toast";

export default function Login() {
  const { setToken } = useApp();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [valid, setValid] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  });

  useEffect(() => {
    setValid({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      digit: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    });
  }, [newPassword]);

  useEffect(() => {
    let timer;
    if (step === 1 && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, step]);

  const location = useLocation();

  useEffect(() => {
    setEmail("");
    setPass("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetMode(false);
    setStep(0);
  }, [location.search]);



  const getIcon = (cond) => (cond ? "✅" : "❌");
  const getColor = (cond) => (cond ? "text-success" : "text-danger");

  const login = async () => {
    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.error === "Email not found") {
        toast.error("Email not registered");
      } else if (data.error === "Invalid password") {
        toast.error(`Invalid password for ${email}`);
      } else {
        toast.error("Login failed");
      }
      return;
    }

    toast.success("Logged in successfully");
    localStorage.setItem("token", data.token);
    setToken(data.token, "user");
    nav("/");
  };

  const sendOtp = async () => {
    if (!email) return toast.error("Enter your email");

    setLoading(true);
    const res = await fetch("http://localhost:5000/send-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("OTP sent to " + email);
      setStep(1);
      setResendTimer(30);
    } else {
      toast.error(await res.text());
    }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error("Enter the OTP");

    const res = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (res.ok) {
      toast.success("OTP verified");
      setStep(2);
    } else {
      toast.error("Invalid OTP");
    }
  };

  const resetPassword = async () => {
    const allValid = Object.values(valid).every(v => v);
    if (!newPassword || !confirmPassword) {
      return toast.error("All fields required");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (!allValid) {
      return toast.error("Password does not meet all criteria");
    }

    setLoading(true);
    const res = await fetch("http://localhost:5000/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password: newPassword }),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Password changed");
      setResetMode(false);
      setStep(0);
      setPass("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");

      nav(`/login?refresh=${Date.now()}`);
    } else {
      toast.error(await res.text());
    }
  };


  return (
    <div className="container mt-4 pt-4 text-center" style={{ maxWidth: 450}}>
      <h4 className="mb-4 pt-5 mt-5">{resetMode ? "Reset Password" : "User Login"}</h4>

      <input
        placeholder="Email"
        className="form-control mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {!resetMode && (
        <>
          <div className="input-group mb-2">
            <input
              type={showPassword ? "text" : "password"}

              placeholder="Password"
              className="form-control mb-3"
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
            <span className="input-group-text" style={{
              cursor: "pointer", height: "50%"
            }} onClick={() => setShowPassword(!showPassword)}>
              👁️
            </span>
          </div>
          <button className="btn btn-success w-100 mb-3" onClick={login}>
            Login
          </button>
        </>
      )}

      {!resetMode && (
        <div className="text-center">
          <button className="btn btn-link p-0 text-info" onClick={() => setResetMode(true)}>
            Reset Password
          </button>
        </div>
      )}

      {resetMode && step === 0 && (
        <button
          className="btn btn-primary w-100"
          onClick={sendOtp}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </button>
      )}

      {resetMode && step === 1 && (
        <>
          <input
            className="form-control mt-3"
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="btn btn-success w-100 mt-2" onClick={verifyOtp}>
            Submit
          </button>
          <div className="text-center mt-2">
            {resendTimer > 0 ? (
              <>Resend OTP in {resendTimer}s</>
            ) : (
              <button className="btn btn-link p-0" onClick={sendOtp}>
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {resetMode && step === 2 && (
        <>
          <div className="input-group mb-2">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              className="form-control mb-2"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer", height: "50%" }}
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              👁️
            </span>
          </div>

          <div className="input-group mb-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="form-control mb-2"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer", height: "50%" }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              👁️
            </span>
          </div>

          <div className="mb-3 small">
            <div className={getColor(valid.length)}>{getIcon(valid.length)} Min 8 characters</div>
            <div className={getColor(valid.upper)}>{getIcon(valid.upper)} One uppercase letter</div>
            <div className={getColor(valid.lower)}>{getIcon(valid.lower)} One lowercase letter</div>
            <div className={getColor(valid.digit)}>{getIcon(valid.digit)} One digit</div>
            <div className={getColor(valid.special)}>{getIcon(valid.special)} One special character</div>
          </div>

          <button className="btn btn-warning w-100" onClick={resetPassword} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </>
      )}

    </div>
  );
}
