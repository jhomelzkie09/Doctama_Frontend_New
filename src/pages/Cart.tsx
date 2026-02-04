import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import { Cart, CartItem } from '../types';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowRight } from 'react-icons/fa';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdating(itemId);
    try {
      await cartService.updateCartItem(itemId, newQuantity);
      await loadCart(); // Refresh cart data
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update item quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    setUpdating(itemId);
    try {
      await cartService.removeFromCart(itemId);
      await loadCart(); // Refresh cart data
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item from cart');
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setCheckoutLoading(true);
    try {
      const result = await cartService.checkout();
      alert(`Checkout successful! Order #${result.data?.orderId} has been created.`);
      navigate('/orders');
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <FaShoppingCart />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="page-title">Shopping Cart</h1>
      
      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="cart-header">
            <h2>Cart Items ({cart.itemCount})</h2>
          </div>
          
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={item.imageUrl || '/api/placeholder/100/100'} 
                  alt={item.productName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/100/100';
                  }}
                />
              </div>
              
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.productName}</h3>
                <p className="cart-item-price">${item.unitPrice.toFixed(2)} each</p>
                
                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={updating === item.id}
                    className="quantity-btn"
                  >
                    <FaMinus />
                  </button>
                  
                  <span className="quantity-display">
                    {updating === item.id ? 'Updating...' : item.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                    className="quantity-btn"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              
              <div className="cart-item-total">
                <span className="subtotal">${item.subtotal.toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={updating === item.id}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            
            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">${cart.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="checkout-btn"
          >
            {checkoutLoading ? 'Processing...' : (
              <>
                Proceed to Checkout
                <FaArrowRight />
              </>
            )}
          </button>
          
          <div className="continue-shopping">
            <Link to="/products">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;