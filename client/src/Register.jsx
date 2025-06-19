import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const nav = useNavigate();

  const [valid, setValid] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  });

  useEffect(() => {
    setValid({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, otpSent]);

  const allValid = Object.values(valid).every(v => v);
  const getColor = (cond) => cond ? "text-success" : "text-danger";
  const getIcon = (cond) => cond ? "✅" : "❌";

  const sendOtp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!allValid) {
      toast.error("Password does not meet all requirements");
      return;
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    const res = await fetch("http://localhost:5000/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("OTP sent to " + email);
      setOtpSent(true);
      setResendTimer(30);
    } else {
      toast.error(await res.text());
    }
  };

  const register = async () => {
    if (!name || !email || !password || !enteredOtp) {
      toast.error("Please fill in all fields and enter OTP");
      return;
    }

    const otpRes = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: enteredOtp }),
    });
    if (!otpRes.ok) {
      toast.error(await otpRes.text());
      return;
    }

    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      toast.success("Registered successfully");
      nav("/login");
    } else {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="container mt-5 pt-5 text-center " style={{ maxWidth: 450 }}>
      <h4 className="mb-4">Create Account</h4>

      <input placeholder="Name" className="form-control mb-3 " onChange={e => setName(e.target.value)} />
      <input placeholder="Email" className="form-control mb-3" onChange={e => setEmail(e.target.value)} />
      <div className="input-group mb-3 ">
        <input
          type={showPassword ? "text" : "password"}
          className="form-control "
          placeholder="Password"
          onChange={e => setPass(e.target.value)}
        />
        <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
          👁️
        </span>
      </div>

      <div className="input-group mb-3">
        <input
          type={showConfirmPassword ? "text" : "password"}
          className="form-control"
          placeholder="Confirm Password"
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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

      {!otpSent && !loading && (
        <button className="btn btn-primary w-100" onClick={sendOtp}>
          Send OTP
        </button>
      )}

      {loading && (
        <button className="btn btn-secondary w-100" disabled>
          <span className="spinner-border spinner-border-sm me-2" role="status" />
          Sending OTP...
        </button>
      )}

      {otpSent && (
        <>
          <input className="form-control mb-2" placeholder="Enter OTP" onChange={e => setEnteredOtp(e.target.value)} />
          <button className="btn btn-success w-100 mb-2" onClick={register}>
            Register
          </button>
          <div className="text-center">
            {resendTimer > 0 ? (
              <>Resend OTP in {resendTimer}s</>
            ) : (
              <button className="btn btn-link p-0" onClick={sendOtp}>Resend OTP</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
