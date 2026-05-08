import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, FileText, Download, Package, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { farmerProductService, FarmerProduct, ProductStats } from '../../services/farmerProductService';
import { generateAuditReport } from '../../utils/auditReportGenerator';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl } from '../../utils/imageUtils';
import RecommendationsPanel from './RecommendationsPanel';

interface EditModalProps {
  product: FarmerProduct;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    description: product.description,
    category: product.category,
    stockQuantity: product.stockQuantity,
    stockUnit: product.stockUnit,
    discount: product.discount,
    tags: product.tags.join(', ')
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(product._id, formData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-color">
          <h3 className="text-xl font-semibold text-text-dark">Edit Product</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Discount (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Select category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="organic">Organic</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Stock Quantity *</label>
              <input
                type="number"
                step="0.01"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) })}
                required
                className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Unit *</label>
              <select
                value={formData.stockUnit}
                onChange={(e) => setFormData({ ...formData, stockUnit: e.target.value })}
                required
                className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="kg">Kg</option>
                <option value="litre">Litre</option>
                <option value="dozen">Dozen</option>
                <option value="piece">Piece</option>
                <option value="grams">Grams</option>
                <option value="ml">ML</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="fresh, organic, seasonal"
              className="w-full px-4 py-3 border border-border-color rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-text-dark font-semibold py-3 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageProductsTable: React.FC = () => {
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<FarmerProduct | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, statsData] = await Promise.all([
        farmerProductService.getMyProducts(),
        farmerProductService.getProductStats()
      ]);
      setProducts(productsData);
      setStats(statsData);
    } catch (error: any) {
      addNotification({ type: 'error', message: error.response?.data?.message || 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: FarmerProduct) => {
    setEditingProduct(product);
  };

  const handleSave = async (id: string, data: any) => {
    try {
      await farmerProductService.updateProduct(id, data);
      addNotification({ type: 'success', message: 'Product updated successfully' });
      loadData();
    } catch (error: any) {
      addNotification({ type: 'error', message: error.response?.data?.message || 'Failed to update product' });
      throw error;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await farmerProductService.deleteProduct(id);
      addNotification({ type: 'success', message: 'Product deleted successfully' });
      loadData();
    } catch (error: any) {
      addNotification({ type: 'error', message: error.response?.data?.message || 'Failed to delete product' });
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const auditData = await farmerProductService.getAuditData();
      console.log('Audit data received:', auditData);
      generateAuditReport(auditData);
      addNotification({ type: 'success', message: 'Audit report downloaded successfully' });
      // Show recommendations after report is generated
      setShowRecommendations(true);
    } catch (error: any) {
      console.error('Error generating report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate report';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white border border-border-color rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <div className="text-text-muted text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Recommendations Panel - Only show after report generation */}
      {showRecommendations && <RecommendationsPanel />}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-border-color rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-text-muted">Total Products</div>
                <div className="text-2xl font-bold text-text-dark">{stats.totalProducts}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-border-color rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-text-muted">In Stock</div>
                <div className="text-2xl font-bold text-text-dark">{stats.inStock}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-color rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-text-muted">Out of Stock</div>
                <div className="text-2xl font-bold text-text-dark">{stats.outOfStock}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-color rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-text-muted">Total Value</div>
                <div className="text-2xl font-bold text-text-dark">₹{stats.totalValue}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text-dark">My Products</h2>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport || products.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {generatingReport ? 'Generating...' : 'Generate Audit Report'}
          </button>
          {!showRecommendations && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>Generate report to get AI-powered recommendations</span>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white border border-border-color rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">No Products Yet</h3>
          <p className="text-text-muted">Start by adding products through the "Sell Product" section</p>
        </div>
      ) : (
        <div className="bg-white border border-border-color rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-color">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md border border-border-color"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                          }}
                        />
                        <div>
                          <div className="font-medium text-text-dark">{product.name}</div>
                          <div className="text-xs text-text-muted">ID: {product._id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-dark-gray capitalize">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-text-dark">₹{product.price.toFixed(2)}</div>
                      {product.discount > 0 && (
                        <div className="text-xs text-green-600">{product.discount}% off</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-dark">{product.stockQuantity} {product.stockUnit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        product.stockStatus === 'In Stock'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stockStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageProductsTable;
