import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import DashboardBanner from '../../components/sections/DashboardBanner';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import farmerProductRequestService, { ProductRequest } from '../../services/farmerProductRequestService';
import { useNotification } from '../../context/NotificationContext';
import Dropdown from '../../components/ui/Dropdown';
import { getImageUrl } from '../../utils/imageUtils';

const CompleteProductDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [request, setRequest] = useState<ProductRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stockUnit, setStockUnit] = useState('kg');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const stockUnitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'litre', label: 'Litre' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'piece', label: 'Piece' },
    { value: 'grams', label: 'Grams' },
    { value: 'ml', label: 'Millilitre (ml)' },
  ];

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      const data = await farmerProductRequestService.getRequestById(requestId!);
      
      if (data.status !== 'approved') {
        showNotification('This request is not approved yet', 'error');
        navigate('/dashboard/sell-product');
        return;
      }
      
      setRequest(data);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to fetch request', 'error');
      navigate('/dashboard/sell-product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      showNotification('Maximum 5 additional images allowed', 'error');
      return;
    }

    setImages([...images, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      showNotification('Please provide a product description', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await farmerProductRequestService.completeProduct(requestId!, {
        description,
        tags,
        discount: Number(discount),
        stockUnit,
        images
      });

      showNotification('Product created successfully and is now live!', 'success');
      setTimeout(() => {
        navigate('/dashboard/sell-product');
      }, 2000);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <DashboardBanner />
        <div className="container mx-auto px-4 sm:px-6 lg:px-[120px] py-24">
          <div className="text-center">
            <p className="text-text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen">
      <main>
        <DashboardBanner />
        <div className="container mx-auto px-4 sm:px-6 lg:px-[120px] py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3">
              <DashboardSidebar />
            </aside>
            <div className="lg:col-span-9">
              <button
                onClick={() => navigate('/dashboard/sell-product')}
                className="flex items-center gap-2 text-text-dark-gray hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Requests</span>
              </button>

              <div className="border border-border-color rounded-lg p-8 bg-white">
                <h2 className="text-2xl font-semibold text-text-dark mb-2">Complete Product Details</h2>
                <p className="text-sm text-text-muted mb-8">Your request has been approved! Please provide additional details to publish your product.</p>

                {/* Request Summary */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-border-color">
                  <h3 className="text-lg font-semibold text-text-dark mb-4">Request Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-muted mb-1">Product Name</p>
                      <p className="text-sm font-medium text-text-dark">{request.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Category</p>
                      <p className="text-sm font-medium text-text-dark capitalize">{request.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Quantity</p>
                      <p className="text-sm font-medium text-text-dark">{request.quantity} {request.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Base Price</p>
                      <p className="text-sm font-medium text-text-dark">₹{request.pricePerUnit}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-text-muted mb-2">Initial Image</p>
                    <img
                      src={getImageUrl(request.images[0])}
                      alt={request.productName}
                      className="w-32 h-32 object-cover rounded-lg border border-border-color"
                    />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product, its quality, farming methods, etc."
                      rows={5}
                      className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Additional Images (Max 5)
                    </label>
                    <div className="border-2 border-dashed border-border-color rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        id="additional-images"
                      />
                      <label htmlFor="additional-images" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-text-muted" size={32} />
                        <p className="text-sm text-text-dark-gray mb-1">Click to upload additional images</p>
                        <p className="text-xs text-text-muted">PNG, JPG, WEBP up to 5MB each</p>
                      </label>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-3 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-border-color"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Dropdown
                      label="Stock Unit"
                      options={stockUnitOptions}
                      value={stockUnit}
                      onChange={setStockUnit}
                      placeholder="Select stock unit"
                    />

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Product Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. organic, fresh, pesticide-free"
                      className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    <p className="text-xs text-text-muted mt-1">Separate tags with commas</p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/sell-product')}
                      className="flex-1 px-6 py-3 border border-border-color text-text-dark font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompleteProductDetailsPage;
