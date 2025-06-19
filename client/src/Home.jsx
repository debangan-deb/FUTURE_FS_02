import { useEffect, useRef, useState } from "react";
import { useApp } from "./Context";
import { BsBoxSeam, BsSearch } from "react-icons/bs";

const categories = [
  { name: "Fashion", icon: "🧥" },
  { name: "Electronics", icon: "💻" },
  { name: "Grocery", icon: "🛒" },
  { name: "Books", icon: "📚" },
  { name: "Toys", icon: "🧸" },
  { name: "Furniture", icon: "🛋️" }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sort, setSort] = useState("");
  const { add } = useApp();

  const cardRefs = useRef({});

  useEffect(() => {
    if (category)
      fetch("https://shopnext-wxjd.onrender.com/products")
        .then(res => res.json())
        .then(data => {
          const items = data.filter(p => p.category === category);
          setProducts(items);
          setFiltered(items);
        });
  }, [category]);

  const handleSearch = val => {
    setSearch(val);
    const matches = products.filter(p =>
      p.title.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(val ? matches.slice(0, 5) : []);
    setFiltered(matches);
  };

  const handleSort = key => {
    const sorted = [...filtered].sort((a, b) =>
      key === "price-asc" ? a.price - b.price : b.price - a.price
    );
    setFiltered(sorted);
  };

  const scrollToProduct = (id) => {
    const ref = cardRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
      ref.classList.add("border", "border-warning", "shadow");
      setTimeout(() => {
        ref.classList.remove("border", "border-warning", "shadow");
      }, 2000);
      setSuggestions([]);
      setSearch("");
    }
  };

  if (!category)
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold display-5">
            Welcome to <span className="text-gradient">ShopNext</span>
          </h1>
          <p className="fs-5 fw-bold">Explore our categories</p>
        </div>
        <div className="row g-4 justify-content-center">
          {categories.map((c, i) => (
            <div key={i} className="col-5 col-md-4">
              <div
                className="card text-center border-0 shadow-lg category-card p-4"
                style={{ cursor: "pointer", transition: "0.4s" }}
                onClick={() => setCategory(c.name)}
              >
                <div className="display-3 mb-3">{c.icon}</div>
                <h4 className="fw-bold">{c.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-capitalize">
          <BsBoxSeam className="me-2" /> {category} Products
        </h3>
        <button className="btn btn-outline-secondary" onClick={() => setCategory(null)}>
          ← Back to Categories
        </button>
      </div>

      <div className="row mb-4 g-3 align-items-end position-relative">
        <div className="col-md-6 position-relative">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-light"><BsSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          {suggestions.length > 0 && (
            <div className="position-absolute bg-white border rounded w-100 mt-1" style={{ zIndex: 10 }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="d-flex align-items-center px-3 py-2 suggestion-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => scrollToProduct(s.id)}
                >
                  <img src={s.image} alt={s.title} height="40" width="40" className="me-2 rounded object-fit-cover" />
                  <span className="text-dark small">{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-md-3">
          <select className="form-select shadow-sm" onChange={e => handleSort(e.target.value)}>
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {filtered.map(p => (
          <div
            key={p.id}
            ref={el => (cardRefs.current[p.id] = el)}
            className="col-md-4"
          >
            <div className="card h-100 shadow border-0 hover-shadow transition">
              <img src={p.image} className="card-img-top" height="200" style={{ objectFit: "cover" }} />
              <div className="card-body d-flex flex-column">
                <h5 className="fw-semibold">{p.title}</h5>
                <p className="text-muted">₹{p.price}</p>
                <button className="btn btn-primary mt-auto" onClick={() => add(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
