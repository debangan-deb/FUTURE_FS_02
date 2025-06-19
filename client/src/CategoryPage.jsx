import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "./Context";

export default function CategoryPage() {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const { add } = useApp();

  useEffect(() => {
    fetch(`/products?category=${name}`)
      .then(res => res.json())
      .then(data => setProducts(data[0] || []))
      .catch(err => console.error("Failed to fetch products:", err));
  }, [name]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-capitalize">{name} Products</h2>
      <div className="row">
        {products.map(p => (
          <div key={p.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img src={p.image} className="card-img-top" alt={p.title} />
              <div className="card-body">
                <h5 className="card-title">{p.title}</h5>
                <p className="fw-bold">₹{p.price}</p>
                <button className="btn btn-primary" onClick={() => add(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-12 text-muted">No products found in this category.</div>
        )}
      </div>
    </div>
  );
}
