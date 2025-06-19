import { useEffect, useState } from "react";

export default function AdminDashBoard() {
  const [data, setData] = useState({ products: [] });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const load = async () => {
    const res = await fetch("https://shopnext-wxjd.onrender.com/admin-dashboard");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    await fetch("https://shopnext-wxjd.onrender.com/admin/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, price, image }),
    });
    setTitle("");
    setCategory("");
    setPrice("");
    setImage("");
    load();
  };

  const del = async (id) => {
    await fetch("https://shopnext-wxjd.onrender.com/admin/product/" + id, {
      method: "DELETE",
    });
    load();
  };

  const update = async (id) => {
    await fetch("https://shopnext-wxjd.onrender.com/admin/product/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFields),
    });
    setEditingId(null);
    setEditFields({});
    load();
  };

  return (
    <div className="container mt-5 pt-5">
      <h4>Admin Dashboard</h4>

      <div className="row g-3 my-3">
        <div className="col-md-4">
          <input
            placeholder="Title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="col-md-4">
          <input
            placeholder="Category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            placeholder="Price"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            placeholder="Image URL"
            className="form-control"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div className="col-md-1">
          <button className="btn btn-success w-100" onClick={add}>
            +
          </button>
        </div>
      </div>

      <div className="row text-center ">
        <div className="mx-auto col-md-6 d-flex flex-column align-items-center">
          <h5>Products</h5>
          {data.products.map((p) => (
            <div key={p.id} className="border rounded p-2 mb-2">
              {editingId === p.id ? (
                <>
                  <input
                    className="form-control my-1"
                    value={editFields.title || ""}
                    placeholder="Title"
                    onChange={(e) =>
                      setEditFields({ ...editFields, title: e.target.value })
                    }
                  />
                 
                  <input
                    className="form-control my-1"
                    value={editFields.category || ""}
                    placeholder="Category"
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        category: e.target.value,
                      })
                    }
                  />
                  <input
                    className="form-control my-1"
                    value={editFields.price || ""}
                    placeholder="Price"
                    onChange={(e) =>
                      setEditFields({ ...editFields, price: e.target.value })
                    }
                  />
                  <input
                    className="form-control my-1"
                    value={editFields.image || ""}
                    placeholder="Image URL"
                    onChange={(e) =>
                      setEditFields({ ...editFields, image: e.target.value })
                    }
                  />
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => update(p.id)}
                    >
                      💾 Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditingId(null)}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                 
                  <div className="fw-bold mx-5 px-5 py-2">
                    <img
                    src={p.image}
                    alt={p.title}
                    style={{ maxWidth: "250px", maxHeight: "250px"}}
                    className="mx-5 px-5 mb-3"
                  />
                    {p.title} - ₹{p.price}
                  </div>
                  <div className="text-muted small">{p.category}</div>
                 
                  <div className="mt-2 d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setEditingId(p.id);
                        setEditFields({
                          title: p.title,
                          category: p.category,
                          price: p.price,
                          image: p.image,
                        });
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => del(p.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
