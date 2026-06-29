import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import "./AdminPage.css";

const ADMIN_EMAIL = "admin123@gmail.com";
const DEFAULT_FORM = {
  name: "",
  brand: "",
  university: "",
  category_slug: "",
  price: "",
  color: "",
  sizes: "",
  gender: "Unisex",
  department: "",
  stock: "1",
  sku: "",
  compare_at_price: "",
  is_best_seller: false,
};

const AdminPage = () => {
  const isAdmin = localStorage.getItem("cn_admin_logged_in") === "true";
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [listStatus, setListStatus] = useState("");
  const [universities, setUniversities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [status, setStatus] = useState("");
  const [created, setCreated] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/universities").then((r) => r.json()),
      apiFetch("/api/categories").then((r) => r.json()),
      apiFetch("/api/brands").then((r) => r.json()),
    ])
      .then(([u, c, b]) => {
        setUniversities(u || []);
        setCategories(c || []);
        setBrands(b || []);
        setForm((prev) => ({
          ...prev,
          university: prev.university || u?.[0]?.name || "",
          category_slug: prev.category_slug || c?.[0]?.name || "",
          brand: prev.brand || b?.[0]?.name || "",
        }));
      })
      .catch(() => setStatus("Could not load admin form options."));
  }, []);

  const loadProducts = (page = productPage, search = searchTerm) => {
    setListStatus("Loading products...");
    const params = new URLSearchParams({
      sort: "newest",
      page_size: "10",
      page: String(page),
    });
    if (search.trim()) {
      params.set("search", search.trim());
    }

    apiFetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setProductPage(data.page || page);
        setProductTotal(data.total || 0);
        setListStatus("");
      })
      .catch(() => setListStatus("Could not load products."));
  };

  useEffect(() => {
    loadProducts(productPage, searchTerm);
  }, [productPage, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(productTotal / 10));

  const brandOptions = useMemo(() => brands.map((b) => b.name), [brands]);

  if (!isAdmin) {
    return <Navigate to="/signin" replace />;
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateImage = (file) => {
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const imageSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    return src;
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("admin_email", ADMIN_EMAIL);
    payload.append("name", form.name);
    payload.append("brand", form.brand);
    payload.append("university", form.university);
    payload.append("category_slug", form.category_slug);
    payload.append("price", form.price || "0");
    payload.append("color", form.color);
    payload.append("sizes", form.sizes);
    payload.append("gender", form.gender);
    payload.append("department", form.department);
    payload.append("stock", form.stock || "0");
    payload.append("sku", form.sku);
    payload.append("is_best_seller", String(form.is_best_seller));
    if (form.compare_at_price) {
      payload.append("compare_at_price", form.compare_at_price);
    }
    if (imageFile) {
      payload.append("image", imageFile);
    }
    return payload;
  };

  const resetForm = (closeForm = true) => {
    setEditingProduct(null);
    setCreated(null);
    setStatus("");
    setForm((prev) => ({
      ...DEFAULT_FORM,
      university: prev.university,
      category_slug: prev.category_slug,
      brand: prev.brand,
      gender: prev.gender,
    }));
    setImageFile(null);
    setImagePreview("");
    if (closeForm) {
      setShowForm(false);
    }
  };

  const openCreateForm = () => {
    resetForm(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setProductPage(1);
    setSearchTerm(searchInput);
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus(editingProduct ? "Updating product..." : "Saving product...");
    setCreated(null);

    if (!editingProduct && !imageFile) {
      setStatus("Please upload a product image.");
      return;
    }

    try {
      const endpoint = editingProduct
        ? `/api/admin/products/${editingProduct.id}/form`
        : "/api/admin/products/form";
      const res = await apiFetch(endpoint, {
        method: editingProduct ? "PUT" : "POST",
        body: buildPayload(),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg).join(", ")
          : data.detail;
        throw new Error(detail || `Product was not saved. (${res.status})`);
      }
      setCreated(data);
      setStatus(editingProduct ? "Product updated successfully." : "Product added successfully.");
      setForm((prev) => ({
        ...DEFAULT_FORM,
        university: prev.university,
        category_slug: prev.category_slug,
        brand: prev.brand,
        gender: prev.gender,
      }));
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview("");
      setShowForm(false);
      setProductPage(1);
      loadProducts(1, searchTerm);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const editProduct = (product) => {
    setShowForm(true);
    setEditingProduct(product);
    setCreated(null);
    setStatus("Editing product. Upload a new image only if you want to replace it.");
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      university: product.university || "",
      category_slug: product.category || product.category_slug || "",
      price: product.price ?? "",
      color: product.color || "",
      sizes: (product.sizes || []).join(", "),
      gender: product.gender || "Unisex",
      department: product.department || "",
      stock: product.stock ?? "0",
      sku: product.sku || "",
      compare_at_price: product.compare_at_price ?? "",
      is_best_seller: Boolean(product.is_best_seller),
    });
    setImageFile(null);
    setImagePreview(imageSrc(product.image_url));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (product) => {
    const confirmDelete = window.confirm(`Delete "${product.name}" from database?`);
    if (!confirmDelete) return;

    setListStatus("Deleting product...");
    try {
      const res = await apiFetch(
        `/api/admin/products/${product.id}?admin_email=${encodeURIComponent(ADMIN_EMAIL)}`,
        { method: "DELETE" },
      );
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new Error(data.detail || `Product was not deleted. (${res.status})`);
      }
      if (editingProduct?.id === product.id) {
        resetForm();
      }
      setListStatus("Product deleted.");
      const nextPage = products.length === 1 && productPage > 1 ? productPage - 1 : productPage;
      setProductPage(nextPage);
      loadProducts(nextPage, searchTerm);
    } catch (error) {
      setListStatus(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("cn_admin_logged_in");
    localStorage.removeItem("cn_admin_email");
    window.location.href = "/signin";
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link to="/" className="admin-logo">COLLEGE NATION</Link>
        <div>
          <Link to="/collections/all-products">View shop</Link>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="admin-shell">
        <div className="admin-title">
          <span>Admin panel</span>
          <h1>Products</h1>
          <p>Manage products from the catalog database.</p>
        </div>

        {showForm && (
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-fields">
            <div className="admin-form-title admin-full">
              <div>
                <span>{editingProduct ? "Edit product" : "Add product"}</span>
                <h2>{editingProduct ? "Update product" : "Create product"}</h2>
              </div>
              <button type="button" onClick={() => resetForm()}>
                Back
              </button>
            </div>

            <label>
              Product name
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Alabama Crimson Tide Hoodie"
              />
            </label>

            <label>
              Brand
              <input
                required
                list="admin-brands"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="Nike"
              />
              <datalist id="admin-brands">
                {brandOptions.map((brand) => (
                  <option value={brand} key={brand} />
                ))}
              </datalist>
            </label>

            <label>
              University
              <input
                required
                list="admin-universities"
                value={form.university}
                onChange={(e) => update("university", e.target.value)}
                placeholder="Type or select university"
              />
              <datalist id="admin-universities">
                {universities.map((u) => (
                  <option value={u.name} key={u.name} />
                ))}
              </datalist>
              <span className="admin-field-help">Select existing or type a new university.</span>
            </label>

            <label>
              Category
              <input
                required
                list="admin-categories"
                value={form.category_slug}
                onChange={(e) => update("category_slug", e.target.value)}
                placeholder="Type or select category"
              />
              <datalist id="admin-categories">
                {categories.map((c) => (
                  <option value={c.name} key={c.slug} />
                ))}
              </datalist>
              <span className="admin-field-help">Select existing or type a new category.</span>
            </label>

            <label>
              Price
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="45.00"
              />
            </label>

            <label>
              Compare at price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.compare_at_price}
                onChange={(e) => update("compare_at_price", e.target.value)}
                placeholder="60.00"
              />
            </label>

            <label className="admin-full admin-upload">
              Product image
              <input
                required={!editingProduct}
                type="file"
                accept="image/*"
                onChange={(e) => updateImage(e.target.files?.[0])}
              />
              <span>
                {imageFile
                  ? imageFile.name
                  : editingProduct
                    ? "Leave empty to keep current image"
                    : "Upload JPG, PNG, WEBP, or GIF"}
              </span>
            </label>

            <label>
              Color
              <input
                value={form.color}
                onChange={(e) => update("color", e.target.value)}
                placeholder="Crimson"
              />
            </label>

            <label>
              Sizes
              <input
                value={form.sizes}
                onChange={(e) => update("sizes", e.target.value)}
                placeholder="S, M, L, XL"
              />
            </label>

            <label>
              Gender
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option>Men</option>
                <option>Women</option>
                <option>Kids</option>
                <option>Unisex</option>
              </select>
            </label>

            <label>
              Department
              <input
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                placeholder="Hoodies"
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </label>

            <label>
              SKU
              <input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="SKU-1001"
              />
            </label>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.is_best_seller}
                onChange={(e) => update("is_best_seller", e.target.checked)}
              />
              Best seller
            </label>
          </div>

          <aside className="admin-preview">
            <div className="admin-image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Product preview" />
              ) : (
                <span>Image preview</span>
              )}
            </div>
            <h2>{form.name || "Product name"}</h2>
            <p>{form.brand || "Brand"} · {form.university || "University"}</p>
            <strong>${Number(form.price || 0).toFixed(2)}</strong>
            <button type="submit">{editingProduct ? "Update product" : "Add product"}</button>
            {status && <p className="admin-status">{status}</p>}
            {created && (
              <Link to={`/products/${created.slug}`} className="admin-created">
                Show your added product
              </Link>
            )}
          </aside>
        </form>
        )}

        {!showForm && (
        <section className="admin-products">
          <div className="admin-products-head">
            <div>
              <span>Products</span>
              <h2>Product list</h2>
            </div>
            <div className="admin-product-tools">
              <form className="admin-product-search" onSubmit={submitSearch}>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search product name"
                />
                <button type="submit">Search</button>
              </form>
              <button type="button" onClick={openCreateForm}>Add product</button>
              <button type="button" onClick={() => loadProducts(productPage, searchTerm)}>
                Refresh
              </button>
            </div>
          </div>

          {listStatus && <p className="admin-list-status">{listStatus}</p>}

          <div className="admin-product-table">
            {products.map((product) => (
              <article className="admin-product-row" key={product.id}>
                <img src={imageSrc(product.image_url)} alt={product.name} />
                <div className="admin-product-main">
                  <strong>{product.name}</strong>
                  <span>{product.brand} · {product.university} · {product.category}</span>
                  <small>SKU: {product.sku || "None"} · Stock: {product.stock}</small>
                </div>
                <div className="admin-product-price">
                  ${Number(product.price || 0).toFixed(2)}
                </div>
                <div className="admin-product-actions">
                  <Link to={`/products/${product.slug}`}>View</Link>
                  <button type="button" onClick={() => editProduct(product)}>Edit</button>
                  <button
                    type="button"
                    className="admin-danger"
                    onClick={() => deleteProduct(product)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {!products.length && !listStatus && (
              <p className="admin-empty">No products found.</p>
            )}
          </div>
          <div className="admin-pagination">
            <span>
              Page {productPage} of {totalPages} · {productTotal} products
            </span>
            <div>
              <button
                type="button"
                disabled={productPage <= 1}
                onClick={() => setProductPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={productPage >= totalPages}
                onClick={() => setProductPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </section>
        )}
      </section>
    </main>
  );
};

export default AdminPage;
