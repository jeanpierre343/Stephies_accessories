import { useState, useEffect } from 'react';
import logoPath from './images/logo/logo.jpg';
import AdminPanel from './AdminPanel';

const categories = [
  {
    title: 'Bracelets',
    value: 'bracelet',
    description: 'Delicate chains, charm bracelets, and statement bangles.',
  },
  {
    title: 'Rings',
    value: 'ring',
    description: 'Stackable bands, gemstone rings, and everyday favorites.',
  },
  {
    title: 'Necklaces',
    value: 'necklace',
    description: 'Layered looks, pendants, and elegant chains.',
  },
  {
    title: 'Hair Straps',
    value: 'hair strap',
    description: 'Soft, stylish hair straps made for every outfit and occasion.',
  },
  {
    title: 'Anklets',
    value: 'anklet',
    description: 'Lightweight anklets for summer days and special occasions.',
  },
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState('bracelet');
  const [typedText, setTypedText] = useState('');
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelKey, setPanelKey] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [braceletSize, setBraceletSize] = useState('');
  const [showSizeTutorial, setShowSizeTutorial] = useState(false);
  const [view, setView] = useState('shop');
  const [cartItems, setCartItems] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState({ phone: '', fullName: '' });
  const [route, setRoute] = useState(() => window.location.pathname);
  const currentYear = new Date().getFullYear();
  const animatedText = 'check our beautiful pieces that shine with charming color and thoughtful detail.';

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      if (index > animatedText.length) {
        window.clearInterval(interval);
        return;
      }
      setTypedText(animatedText.slice(0, index));
      if (index === animatedText.length) {
        window.clearInterval(interval);
      }
    }, 45);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setPanelKey((current) => current + 1);
  }, [selectedCategory]);

  useEffect(() => {
    const handleRouteChange = () => {
      const nextPath = window.location.pathname;
      setRoute(nextPath.startsWith('/admin') ? nextPath : '/');
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://stephies-accessories-api.onrender.com/api/products');
        if (!response.ok) {
          const text = await response.text();
          const message = text ? text : response.statusText;
          throw new Error(`API error ${response.status}: ${message}`);
        }
        const data = await response.json();
        setProductsData(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = productsData.filter((item) => item.category?.toLowerCase() === selectedCategory);

  const navigateTo = (nextPath) => {
    window.history.pushState({}, '', nextPath);
    setRoute(nextPath);
  };

  const openProductDetails = (product) => {
  setSelectedProduct(product);
  setQuantity(1);
  setBraceletSize('');
  setShowSizeTutorial(false);
};

const sendOrderViaWhatsApp = (itemsToOrder) => {
  if (!itemsToOrder.length) {
    return;
  }

  if (!checkoutForm.phone.trim() || !checkoutForm.fullName.trim()) {
    return;
  }

  if (
    itemsToOrder.some(
      (item) =>
        item.category?.toLowerCase() === 'bracelet' &&
        !item.size
    )
  ) {
    return;
  }

  const productsText = itemsToOrder
    .map((item) => {
      const sizeText = item.size
        ? ` (size ${item.size}cm)`
        : '';

      return `    • ${item.name} (product #${item.id}) x${item.quantity}${sizeText}`;
    })
    .join('\n\n');

  const orderTotal = itemsToOrder.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const message = `Hi Steph! I'd like to order.

products details:

${productsText}

total: $${orderTotal.toFixed(2)}

delivery info:
    • phone: ${checkoutForm.phone.trim()}
    • full name: ${checkoutForm.fullName.trim()}

Looking forward to my new accessories!`;

  const whatsappUrl =
    `https://wa.me/96181519842?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleQuantityChange = (event) => {
    const nextValue = Number(event.target.value);
    setQuantity(Number.isNaN(nextValue) || nextValue < 1 ? 1 : nextValue);
  };

 const addToCart = () => {
  if (!selectedProduct) {
    return;
  }

  const isBracelet = selectedProduct.category?.toLowerCase() === 'bracelet';

  if (isBracelet && !braceletSize.trim()) {
    return;
  }

  const itemToAdd = {
  id: selectedProduct.id,
  name: selectedProduct.name,
  price: Number(selectedProduct.price || 0),
  quantity,
  category: selectedProduct.category,
  size: selectedProduct.category === 'bracelet' ? braceletSize : null,
};

  setCartItems((currentItems) => {
    const existingItem = currentItems.find(
  (item) =>
    item.id === itemToAdd.id &&
    item.size === itemToAdd.size
);

    if (existingItem) {
      return currentItems.map((item) =>
        item.id === itemToAdd.id &&
        item.size === itemToAdd.size
          ? {
              ...item,
              quantity: item.quantity + itemToAdd.quantity,
            }
          : item
      );
    }

    return [...currentItems, itemToAdd];
  });

  setView('cart');
  setSelectedProduct(null);
};
  const updateCartItemQuantity = (itemId, itemSize, nextQuantity) => {
  setCartItems((currentItems) =>
    currentItems
      .map((item) =>
        item.id === itemId && item.size === itemSize
          ? { ...item, quantity: nextQuantity }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

  const removeCartItem = (itemId, itemSize) => {
  setCartItems((currentItems) =>
    currentItems.filter(
      (item) => !(item.id === itemId && item.size === itemSize)
    )
  );
};

  const totalPrice = selectedProduct ? Number(selectedProduct.price || 0) * quantity : 0;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (route.startsWith('/admin')) {
    return <AdminPanel route={route} navigateTo={navigateTo} />;
  }

  return (
    <>
      <div className="site-shell">
        <header className="hero-panel">
          <div>
            <div className="eyebrow header-badge">
              <img src={logoPath} alt="Stephie's Accessories logo" className="header-logo" />
              <span>Stephie's Accessories</span>
            </div>
            <h1>Elegant handmade jewelry.</h1>
            <p className="hero-copy">
              handmade accessories made with love and passion
            </p>
            <div className="hero-actions">
              <span className="pill">Unique collections</span>
              <span className="pill">Everyday elegance</span>
            </div>
          </div>
          <div className="hero-card">
            <h1 className="hero-typing">{typedText}</h1>
          </div>
        </header>

        <button
          type="button"
          className="floating-cart-button"
          onClick={() => setView(view === 'cart' ? 'shop' : 'cart')}
          aria-label="Toggle cart"
        >
          <span>{view === 'cart' ? 'Back to shop' : `Cart ${cartCount > 0 ? `(${cartCount})` : ''}`}</span>
        </button>

        {view === 'cart' ? (
          <section className="section-block">
            <div className="section-header">
              <p className="section-label">Your cart</p>
              <h2>Edit your order</h2>
              <p>Adjust quantities or remove products before sending your WhatsApp order.</p>
            </div>
            <div className="cart-page-card">
              {cartItems.length > 0 ? (
                <>
                  <div className="cart-items-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="cart-item-row">
                        <div>
                         <h3>{item.name}</h3>
<p>Product ID: {item.id}</p>

{item.size ? (
  <p>Size: {item.size}cm</p>
) : null}
                        </div>
                        <div className="cart-item-actions">
                          <label className="cart-quantity-control">
                            <span>Qty</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
  updateCartItemQuantity(
    item.id,
    item.size,
    Number(event.target.value) || 1
  )
}
                            />
                          </label>
                          <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                          <button type="button" className="cart-remove-button" onClick={() => removeCartItem(item.id, item.size)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary-row">
                    <div>
                      <strong>Total</strong>
                      <p>{cartCount} item{cartCount === 1 ? '' : 's'}</p>
                    </div>
                    <div className="cart-summary-actions">
                      <strong>${cartTotal.toFixed(2)}</strong>
                      <button
  type="button"
  className="order-button"
  onClick={() => sendOrderViaWhatsApp(cartItems)}
>
  Send via WhatsApp
</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="cart-empty-state">
                  <p>Your cart is empty.</p>
                  <button type="button" className="product-detail-trigger" onClick={() => setView('shop')}>
                    Continue shopping
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="section-block">
            <div className="section-header">
              <p className="section-label">Categories</p>
              <h2>Find your favorite style</h2>
              <p>Tap any category to view the latest collection from Stephie’s accessories.</p>
            </div>

            <div className="category-row">
              {categories.map((category) => (
                <button
                  key={category.title}
                  type="button"
                  className={`category-card ${selectedCategory === category.value ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <span className="category-title">{category.title}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading-message">Loading products…</div>
            ) : (
              <div key={panelKey} className="selected-panel">
                <div className="selected-products-header">
                  <p className="section-label">Selected collection</p>
                  <h3>{categories.find((category) => category.value === selectedCategory)?.title}</h3>
                  <p>{categories.find((category) => category.value === selectedCategory)?.description}</p>
                </div>
                <div className="product-grid product-grid-inline">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.id}
                      className="product-card product-card-small"
                      onClick={() => openProductDetails(product)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openProductDetails(product);
                        }
                      }}
                    >
                      <div className="product-image-link">
                        <div className="product-image-wrapper">
                          <img src={product.image_url} alt={product.name} />
                        </div>
                      </div>
                      <h3>{product.name}</h3>
                      {product.description ? <p>{product.description}</p> : null}
                      <div className="product-meta">${product.price}</div>
                      
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {selectedProduct ? (
        <div className="product-modal-backdrop" onClick={closeProductDetails}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="product-modal-close" onClick={closeProductDetails} aria-label="Close product details">
              ×
            </button>
            <div className="product-modal-content">
              <div className="product-modal-image-panel">
                <img src={selectedProduct.image_url} alt={selectedProduct.name} />
              </div>
              <div className="product-modal-details">
                <div className="product-modal-heading">
                  <p className="section-label">Product details</p>
                  <h3>{selectedProduct.name}</h3>
                  <div className="product-meta">${selectedProduct.price}</div>
                </div>
                <p>{selectedProduct.description || 'More details coming soon.'}</p>
                <div className="product-modal-info">
                  <span>Product ID</span>
                  <strong>{selectedProduct.id}</strong>
                </div>
                {selectedProduct.category?.toLowerCase() === 'bracelet' ? (
  <div className="bracelet-size-section">
    <div className="bracelet-size-header">
      <label htmlFor="bracelet-size">Bracelet size (cm)</label>
      <button
        type="button"
        className="size-help-button"
        onClick={() => setShowSizeTutorial((current) => !current)}
        aria-label="How to measure bracelet size"
      >
       Tutorial ?
      </button>
    </div>

    <input
      id="bracelet-size"
      type="number"
      min="1"
      step="0.5"
      placeholder="e.g. 13"
      value={braceletSize}
      onChange={(event) => setBraceletSize(event.target.value)}
      required
    />

    {showSizeTutorial ? (
      <div className="size-tutorial">
        <p><strong>Items needed:</strong> ruler, sharpie and ribbon.</p>

        <p>
          <strong>Step 1:</strong> wrap the ribbon around your wrist. Note where it meets.
        </p>

        <p>
          <strong>Step 2:</strong> mark the ribbon with the sharpie.
        </p>

        <p>
          <strong>Step 3:</strong> measure using ruler.
        </p>

        <p>
          <strong>NOTE:</strong> Add an extra 0.5cm/1cm to ensure a comfortable fit.
        </p>

        <p>
          <a
            href="https://vt.tiktok.com/ZS4K6nDA4/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Video tutorial
          </a>
        </p>
      </div>
    ) : null}
  </div>
) : null}

<div className="product-quantity-section">
  <label htmlFor="product-quantity">Quantity</label>
  <input
    id="product-quantity"
    type="number"
    min="1"
    value={quantity}
    onChange={handleQuantityChange}
  />
</div>
                <div className="product-total-row">
                  <span>Total</span>
                  <strong>${totalPrice.toFixed(2)}</strong>
                </div>
                <form className="checkout-form">
  <h4>Delivery info</h4>

  <label>
    <span>Phone number</span>
    <input
      type="tel"
      value={checkoutForm.phone}
      onChange={(event) =>
        setCheckoutForm((current) => ({
          ...current,
          phone: event.target.value
        }))
      }
      required
    />
  </label>

  <label>
    <span>Full name</span>
    <input
      type="text"
      value={checkoutForm.fullName}
      onChange={(event) =>
        setCheckoutForm((current) => ({
          ...current,
          fullName: event.target.value
        }))
      }
      required
    />
  </label>

  <p className="delivery-note">
    Delivery fee: $3–$4
  </p>
</form>
          <div className="product-actions-row">
  <button
    type="button"
    className="add-to-cart-button"
    onClick={addToCart}
  >
    Add to cart
  </button>

  <button
  type="button"
  className="order-button"
  onClick={() => {
    const directOrderItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: Number(selectedProduct.price || 0),
      quantity,
      category: selectedProduct.category,
      size:
        selectedProduct.category?.toLowerCase() === 'bracelet'
          ? braceletSize
          : null,
    };

    if (
      selectedProduct.category?.toLowerCase() === 'bracelet' &&
      !braceletSize.trim()
    ) {
      return;
    }

    sendOrderViaWhatsApp([directOrderItem]);
  }}
>
  Send via WhatsApp
</button>
</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logoPath} alt="STEPHIE'S ACCESSORIES" />
            </div>
            <h3>STEPHIE'S ACCESSORIES</h3>
            <p className="footer-note">Handmade accessories · Lebanon-wide delivery</p>
          </div>

          <div className="footer-socials">
            <a href="https://wa.me/96181519842" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
            </a>
            <a href="https://www.instagram.com/press_ons_bysteph/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="https://www.tiktok.com/@press_ons_bysteph" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            </a>
            <a href="mailto:press_ons_bysteph@yahoo.com" target="_blank" rel="noopener noreferrer" aria-label="Email" className="footer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </a>
          </div>
          <hr className="footer-divider" />
          <div className="footer-bottom">
            <p className="footer-left">© {currentYear} STEPHIE'S ACCESSORIES. All rights reserved.</p>
            <p className="footer-credit footer-right">Dev by <span>JeanPierre</span></p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
