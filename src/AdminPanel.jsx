import { useState, useEffect } from 'react';
import logoPath from './images/logo/logo.jpg';
import { supabase } from './supabase';

export default function AdminPanel() {
  const [loggedin,setLoggedin] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [password,setPassword] = useState('');
  const [loginError,setLoginError] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductError, setEditProductError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [showAddItemModal, setShowAddItemModal] = useState(false);

const [newProduct, setNewProduct] = useState({
  name: '',
  price: '',
  description: '',
  category: 'bracelet',
  image: null,
});

const [addingProduct, setAddingProduct] = useState(false);
const [addProductError, setAddProductError] = useState('');

  const handleLogin = async() =>{
    setLoginError('');

    try {
    const response = await fetch('https://stephies-accessories-api.onrender.com/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setLoggedin(true);
    } else {
      setLoginError(data.message);
    }
  } catch (error) {
    console.error(error);
    setLoginError('Unable to connect to the server.');
  }
  }

  const handleAddProduct = async (event) => {
  event.preventDefault();

  setAddProductError('');
  setAddingProduct(true);

  try {
    if (!newProduct.image) {
      throw new Error('Please select an image.');
    }

    const file = newProduct.image;

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: imageData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    const imageUrl = imageData.publicUrl;

    const response = await fetch('https://stephies-accessories-api.onrender.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        image_url: imageUrl,
        category: newProduct.category,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add product.');
    }

    setProducts((currentProducts) => [
      ...currentProducts,
      data,
    ]);

    setNewProduct({
      name: '',
      price: '',
      description: '',
      category: 'bracelet',
      image: null,
    });

    setShowAddItemModal(false);

  } catch (error) {
    console.error(error);
    setAddProductError(error.message || 'Failed to add product.');
  } finally {
    setAddingProduct(false);
  }
};

const handleEditProduct = async (event) => {
  event.preventDefault();

  if (!editingProduct) return;

  setEditProductError('');
  setSavingProduct(true);

  try {
    let imageUrl = editingProduct.image_url;

    // Upload a new image if one was selected
    if (editingProduct.newImage) {
      const file = editingProduct.newImage;

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: imageData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      imageUrl = imageData.publicUrl;
    }

    const response = await fetch(`https://stephies-accessories-api.onrender.com/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        category: editingProduct.category,
        image_url: imageUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product.');
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === data.id ? data : product
      )
    );

    setEditingProduct(null);
  } catch (error) {
    console.error(error);
    setEditProductError(
      error.message || 'Failed to update product.'
    );
  } finally {
    setSavingProduct(false);
  }
};

const handleDeleteProduct = async () => {
  if (!editingProduct) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete "${editingProduct.name}"?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`https://stephies-accessories-api.onrender.com/api/products/${editingProduct.id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete product.');
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== editingProduct.id
      )
    );

    setEditingProduct(null);
  } catch (error) {
    console.error(error);
    setEditProductError(
      error.message || 'Failed to delete product.'
    );
  }
};

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://stephies-accessories-api.onrender.com/api/products');

      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setProductsError('Unable to load products.');
    } finally {
      setProductsLoading(false);
    }
  };

  fetchProducts();
}, []);

  if(!loggedin){
    return(
      <div className="dashboard-login-container">
        <div className="dashboard-login-card">
          <div className="lock-logo-container">
            <div className="lock-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock text-rose-500">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            </div>
            <h1 className="dashboard-header">Admin Portal</h1>
            <p className="dashboard-title">Stephie's_Accessories_Dashboard</p>
            <div className="form-container">
              <div className="relative">
            <input id="Password" required className="password-input" type={showPassword? "text":"password"} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button className="show-password-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye">
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-off">
                                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                                    <path d="m2 2 20 20"></path>
                                    </svg>)}
            </button>
            </div>
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="dashboard-button" onClick={handleLogin}>Enter Dashboard</button>
            </div>
            <p className="auth-only">Authorized access only</p>
        </div>
      </div>
    )
  }
    return(
      <div>
        <div className="dashboard-header-container">
           <div className="dashboard-title-container">
            <div className="header-logo-container"><img className="header-logo" src={logoPath}/></div>
            <div className="header-title">
              <p style={{fontSize: ".875rem",fontWeight:600}}>Admin Dashboard</p>
              <p style={{fontSize:".75rem",opacity:.4}}>Stephie's Accessories</p>
            </div>
           </div>
           <button className="dashboard-sign-out-button" onClick={()=> {setLoggedin(false)}}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg> Sign Out</button>
        </div>
        <div className="dashboard-navbar">
  <button className="navbar-button active">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
    Gallery
  </button>

  <button className="navbar-button">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
    Reviews
  </button>

  <button className="navbar-button">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
    Dev Config
  </button>
</div>
      <div className="gallery-header">
        <h2 className="gallery-title">Gallery Items</h2>
        <button
  type="button"
  className="add-item-button"
  onClick={() => {
    setAddProductError('');
    setShowAddItemModal(true);
  }}
><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> Add Item</button>
        </div>
        {showAddItemModal && (
  <div
    className="admin-modal-backdrop"
    onClick={() => setShowAddItemModal(false)}
  >
    <div
      className="admin-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="admin-modal-header">
        <h2>Add Item</h2>

        <button
          type="button"
          className="admin-modal-close"
          onClick={() => setShowAddItemModal(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleAddProduct} className="add-product-form">

        <label>
          Product Name
          <input
            type="text"
            value={newProduct.name}
            onChange={(event) =>
              setNewProduct((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />
        </label>

        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={newProduct.price}
            onChange={(event) =>
              setNewProduct((current) => ({
                ...current,
                price: event.target.value,
              }))
            }
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={newProduct.description}
            onChange={(event) =>
              setNewProduct((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Category
          <select
            value={newProduct.category}
            onChange={(event) =>
              setNewProduct((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          >
            <option value="necklace">Necklace</option>
            <option value="bracelet">Bracelet</option>
            <option value="ring">Ring</option>
            <option value="hairstrap">Hair Strap</option>
            <option value="anklet">Anklet</option>
          </select>
        </label>

        <label>
          Product Image
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              setNewProduct((current) => ({
                ...current,
                image: event.target.files[0] || null,
              }))
            }
            required
          />
        </label>

        {addProductError && (
          <p className="add-product-error">
            {addProductError}
          </p>
        )}

        <div className="add-product-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowAddItemModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-item-submit"
            disabled={addingProduct}
          >
            {addingProduct ? 'Adding...' : 'Add Item'}
          </button>
        </div>

      </form>
    </div>
  </div>
)}
      <div className="admin-gallery">
  {productsLoading ? (
    <p>Loading products...</p>
  ) : productsError ? (
    <p className="admin-gallery-error">{productsError}</p>
  ) : products.length === 0 ? (
    <p>No products found.</p>
  ) : (
    <div className="admin-product-grid">
      {products.map((product) => (
        <div className="admin-product-card" key={product.id}>
          <div
  className={`admin-product-image ${selectedProductId === product.id ? 'selected' : ''}`}
  onClick={() =>
    setSelectedProductId(
      selectedProductId === product.id ? null : product.id
    )
  }
>
  <img
    src={product.image_url}
    alt={product.name}
  />

  {selectedProductId === product.id && (
   <div className="admin-product-actions">
  <button
    type="button"
    className="admin-edit-button"
    onClick={(event) => {
  event.stopPropagation();

  setEditingProduct({
    ...product,
    newImage: null,
  });
}}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  </button>
</div>
  )}
</div>

          <div className="admin-product-info">
            <h3>{product.name}</h3>

            {product.description && (
              <p>{product.description}</p>
            )}

            <div className="admin-product-bottom">
              <span>${product.price}</span>
              <small>{product.category}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
{editingProduct && (
  <div
    className="edit-product-modal-backdrop"
    onClick={() => setEditingProduct(null)}
  >
    <div
      className="edit-product-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="edit-product-modal-close"
        onClick={() => setEditingProduct(null)}
      >
        ×
      </button>

      <h2>Edit Product</h2>

      <form onSubmit={handleEditProduct}>
        <div className="edit-product-image">
          <img
            src={
              editingProduct.newImage
                ? URL.createObjectURL(editingProduct.newImage)
                : editingProduct.image_url
            }
            alt={editingProduct.name}
          />

          <label className="change-image-button">
            Change Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  setEditingProduct((current) => ({
                    ...current,
                    newImage: file,
                  }));
                }
              }}
            />
          </label>
        </div>

        <label className="edit-product-field">
          <span>Product Name</span>
          <input
            type="text"
            value={editingProduct.name}
            onChange={(event) =>
              setEditingProduct((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="edit-product-field">
          <span>Price</span>
          <input
            type="number"
            min="0"
            step="1"
            value={editingProduct.price}
            onChange={(event) =>
              setEditingProduct((current) => ({
                ...current,
                price: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="edit-product-field">
          <span>Description</span>
          <textarea
            value={editingProduct.description || ''}
            onChange={(event) =>
              setEditingProduct((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>

        <label className="edit-product-field">
          <span>Category</span>
          <select
            value={editingProduct.category}
            onChange={(event) =>
              setEditingProduct((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          >
            <option value="bracelet">Bracelet</option>
            <option value="necklace">Necklace</option>
            <option value="ring">Ring</option>
            <option value="hair strap">Hair Strap</option>
            <option value="anklet">Anklet</option>
          </select>
        </label>

        {editProductError && (
          <p className="edit-product-error">
            {editProductError}
          </p>
        )}

        <button
          type="submit"
          className="save-product-button"
          disabled={savingProduct}
        >
          {savingProduct ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          className="delete-product-button"
          onClick={handleDeleteProduct}
        >
          Delete Product
        </button>
      </form>
    </div>
  </div>
)}
      </div>
    )
}