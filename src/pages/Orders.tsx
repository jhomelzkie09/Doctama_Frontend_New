import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/order.service';
import { Order } from '../types';
import { FaClock, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      const ordersData = await orderService.getMyOrders();
      setOrders(ordersData.orders);
      setTotalOrders(ordersData.total);
      setCurrentPage(ordersData.page);
      setTotalPages(ordersData.pages);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'processing':
        return <FaBox className="status-icon processing" />;
      case 'shipped':
        return <FaShippingFast className="status-icon shipped" />;
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadOrders}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">View your order history and track shipments</p>
        
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="mt-2 md:mt-0">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="mr-2">{getStatusIcon(order.status)}</span>
                      {order.status}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.imageUrl || 'https://via.placeholder.com/50'}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-gray-900 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-center text-gray-500 text-sm pt-2 border-t">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Total Amount:</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link 
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                    >
                      👁️ View Details
                    </Link>
                    
                    {order.status === 'Pending' && (
                      <button className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
                        Cancel Order
                      </button>
                    )}
                    
                    {order.status === 'Shipped' && (
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Update getStatusIcon to use emojis (since react-icons is having issues)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '⏰';
    case 'processing':
      return '📦';
    case 'shipped':
      return '🚚';
    case 'delivered':
      return '✅';
    case 'cancelled':
      return '❌';
    default:
      return '⏰';
  }
};

export default Orders;

