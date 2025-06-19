import { useState } from "react";
import { useApp } from "./Context";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, token, setCart } = useApp();
  const [name, setName] = useState("");
  const [address, setAddr] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const navigate = useNavigate();

  const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);

  const loadRazorpay = () => {
    return new Promise(resolve => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeCODOrder = async () => {
    const result = await fetch("https://shopnext-wxjd.onrender.com/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        address,
        phone,
        total,
        token,
        items: cart,
        payment_id: "COD"
      })
    });

    if (result.ok) {
      setCart([]);
      toast.success("✅ Order placed successfully");
      navigate("/cart");
    } else {
      toast.error("❌ Order failed");
    }
  };

  const pay = async () => {
    if (!paymentMode) {
      toast.error("Please select a payment option");
      return;
    }

    if (paymentMode === "cod") {
      placeCODOrder();
      return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const orderData = await fetch("https://shopnext-wxjd.onrender.com/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total })
    });
    const order = await orderData.json();

    const options = {
      key: "rzp_test_MUcANm4sIHpKt9",
      amount: order.amount,
      currency: "INR",
      name: "ShopNext Order",
      description: "Order Payment",
      order_id: order.id,
      handler: async function (response) {
        const result = await fetch("https://shopnext-wxjd.onrender.com/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            address,
            phone,
            total,
            token,
            items: cart,
            payment_id: response.razorpay_payment_id
          })
        });

        if (result.ok) {
          setCart([]);
          toast.success("✅ Order placed successfully");
          navigate("/cart");
        } else {
          toast.error("❌ Order failed");
        }
      },
      prefill: {
        name,
        contact: phone,
      },
      theme: {
        color: "#0d6efd"
      },
      modal: {
        ondismiss: () => {
          toast.error("❌ Order failed or cancelled");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow bg-dark text-white border" style={{ maxWidth: 500, width: "100%" }}>
        <h4 className="text-center mb-4">
          <i className="bi bi-credit-card text-primary me-2" />
          Checkout
        </h4>

        <div className="form-floating mb-3">
          <input
            type="text"
            id="name"
            className="form-control"
            placeholder="Name"
            onChange={e => setName(e.target.value)}
          />
          <label htmlFor="name">Full Name</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="tel"
            id="phone"
            className="form-control"
            placeholder="Phone"
            onChange={e => setPhone(e.target.value)}
          />
          <label htmlFor="phone">Phone Number</label>
        </div>

        <div className="form-floating mb-3">
          <textarea
            id="address"
            className="form-control"
            placeholder="Address"
            style={{ height: "100px" }}
            onChange={e => setAddr(e.target.value)}
          />
          <label htmlFor="address">Shipping Address</label>
        </div>

        <div className="mb-3">
          <label className="form-label">Select Payment Method:</label>
          <div className="form-check">
            <input
              type="radio"
              id="online"
              name="payment"
              value="online"
              className="form-check-input"
              onChange={() => setPaymentMode("online")}
            />
            <label htmlFor="online" className="form-check-label">Online Payment</label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              id="cod"
              name="payment"
              value="cod"
              className="form-check-input"
              onChange={() => setPaymentMode("cod")}
            />
            <label htmlFor="cod" className="form-check-label">Cash on Delivery</label>
          </div>
        </div>

        <button className="btn btn-primary w-100 fw-semibold" onClick={pay}>
          Pay ₹{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
