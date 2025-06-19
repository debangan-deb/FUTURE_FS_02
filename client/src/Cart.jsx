import { useApp } from "./Context";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, remove } = useApp();
  const total = cart.reduce((sum, p) => sum + parseFloat(p.price), 0);

  return (
    <div className="container mt-5 pt-5">
      <h3 className="mb-5 text-center">🛒 Your Cart</h3>

      {cart.length === 0 ? (
        <div className="alert alert-info">Your cart is empty.</div>
      ) : (
        <>
          {cart.map((p, i) => (
            <div key={i} className="card mb-3 shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                  />
                  <div>
                    <h6 className="mb-1">{p.title}</h6>
                    <div className="text-muted small">₹{p.price}</div>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => remove(p)}
                  title="Remove from cart"
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between mt-4 fs-5 fw-semibold">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn btn-primary mt-4 w-100">
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}
