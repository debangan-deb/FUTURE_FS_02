import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () =>
    fetch("https://shopnext-wxjd.onrender.com/admin/orders")
      .then(res => res.json())
      .then(setOrders);

  const updateStatus = async (id, status) => {
    await fetch("https://shopnext-wxjd.onrender.com/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mt-5 pt-5 text-center">
      <h4>All Orders</h4>

      {orders.length === 0 ? (
        <div className="alert alert-info mt-4">
          📭 No users placed any orders yet.
        </div>
      ) : (
        orders.map(o => (
          <div
            className="card p-3 my-5 bg-dark border text-white col-10 col-md-12 mx-auto"
            key={o.id}
          >
            <h6>
              Order {o.id} by {o.user_name} ({o.email})
            </h6>
            <p><strong>Address:</strong> {o.address}</p>
            <p><strong>Total:</strong> ₹{o.total}</p>
            <p><strong>Status:</strong> {o.status}</p>

            <select
              className="form-select w-auto bg-warning-subtle"
              value={o.status}
              onChange={e => updateStatus(o.id, e.target.value)}
            >
              <option>Pending</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>

            <ul className="mt-2">
              {(typeof o.items === "string" ? JSON.parse(o.items) : o.items).map((item, i) => (
                <li key={i}>{item.title} - ₹{item.price}</li>
              ))}
            </ul>

            <small>{new Date(o.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}
