import { useEffect, useState } from "react";
import { useApp } from "./Context";

export default function MyOrders() {
    const { token } = useApp();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!token) return;
        fetch("https://shopnext-wxjd.onrender.com/my-orders", {
            headers: { Authorization: token }
        })
            .then(res => res.json())
            .then(setOrders)
            .catch(() => setOrders([]));
    }, [token]);

    return (
        <div className="pt-5 mt-5 text-center">
            <h3>My Orders</h3>
            <div className="container mt-4 alert alert-info text-center fs-5 col-10 col-md-12">

                {orders.length === 0 ? (
                    <p>No orders yet</p>
                ) : (
                    orders.map((o, i) => (
                        <div className="card my-3 p-3 bg-dark text-white border" key={i}>
                            <h6>Total: ₹{o.total}</h6>
                            <p><strong>Address:</strong> {o.address}</p>
                            <p><strong>Phone:</strong> {o.phone}</p>
                            <p><strong>Status:</strong> {o.status}</p>
                            <small>{new Date(o.created_at).toLocaleString()}</small>
                            <ul className="mt-2">
                                {(Array.isArray(o.items) ? o.items : []).map((item, j) => (
                                    <li key={j}>{item.title} - ₹{item.price}</li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

}
