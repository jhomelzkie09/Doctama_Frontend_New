import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/product.service';
import cartService from '../services/cart.service';
import { Product, Category } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = async (productId: number) => {
    setAddingToCart(productId);
    try {
      await cartService.addToCart(productId, 1);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Page Header */}
      <div className="container mx-auto px-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
        <p className="text-gray-600 text-lg">Browse our collection of medical supplies and equipment</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">⚙️</span> Filters
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Search</h4>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === null 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedCategory === category.id 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price">Price (Low to High)</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600">
                  {sortedProducts.length} of {products.length} products
                </p>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:w-3/4">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : (
              <>
                {/* Products Header */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold">{sortedProducts.length}</span> products
                  </p>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-5xl text-gray-300 mb-4">📦</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">No products found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory(null);
                      }}
                      className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        {/* Product Image */}
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          <img 
                            src={product.imageUrl || 'https://via.placeholder.com/400x300'}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300';
                            }}
                          />
                          {!product.isActive && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          
                          {/* Product Meta */}
                          <div className="flex justify-between items-center mb-6">
                            <div className="text-2xl font-bold text-blue-600">
                              ${product.price.toFixed(2)}
                            </div>
                            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                              product.stockQuantity > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.stockQuantity > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stockQuantity} in stock
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Link 
                              to={`/products/${product.id}`}
                              className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-center text-sm"
                            >
                              👁️ View Details
                            </Link>
                            
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              disabled={!product.isActive || addingToCart === product.id}
                              className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-sm ${
                                !product.isActive || addingToCart === product.id
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {addingToCart === product.id ? (
                                <span className="flex items-center justify-center">
                                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></span>
                                  Adding...
                                </span>
                              ) : (
                                '🛒 Add to Cart'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination (Optional) */}
                {sortedProducts.length > 0 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        ← Previous
                      </button>
                      <span className="px-4 py-2 text-gray-700">Page 1 of 1</span>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next →
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;