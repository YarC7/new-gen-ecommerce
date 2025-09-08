import {useFetcher} from 'react-router';
import {useState, useEffect} from 'react';

interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  onSave?: (address: Address) => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  address,
  onSave,
}: AddressModalProps) {
  const fetcher = useFetcher();
  const [formData, setFormData] = useState<Address>({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: 'US',
    zip: '',
    phone: '',
  });

  const isSubmitting = fetcher.state === 'submitting';
  const isEditing = Boolean(address?.id);

  // Reset form when modal opens/closes or address changes
  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData({
          firstName: address.firstName || '',
          lastName: address.lastName || '',
          company: address.company || '',
          address1: address.address1 || '',
          address2: address.address2 || '',
          city: address.city || '',
          province: address.province || '',
          country: address.country || 'US',
          zip: address.zip || '',
          phone: address.phone || '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          province: '',
          country: 'US',
          zip: '',
          phone: '',
        });
      }
    }
  }, [isOpen, address]);

  // Close modal on successful submission
  useEffect(() => {
    if (fetcher.data?.success) {
      onClose();
      if (onSave && fetcher.data.address) {
        onSave(fetcher.data.address);
      }
    }
  }, [fetcher.data, onClose, onSave]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData for submission
    const submitData = new FormData();
    submitData.append('intent', isEditing ? 'updateAddress' : 'createAddress');
    if (address?.id) {
      submitData.append('addressId', address.id);
    }
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        submitData.append(key, value);
      }
    });

    fetcher.submit(submitData, {
      method: 'post',
      action: '/account/addresses',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-gray-900/70 to-black/60 backdrop-blur-sm transition-all duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal with CSS conflict prevention */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full bg-white rounded-3xl shadow-2xl ring-4 ring-white/10 border-2 border-gray-100 transform transition-all duration-300 scale-100" style={{maxWidth: '56rem'}}>
          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 rounded-t-3xl shadow-lg">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-12 translate-y-12"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isEditing ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <p className="text-blue-100">
                    {isEditing ? 'Update your address information' : 'Enter your address details'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg border border-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8 bg-gradient-to-b from-white to-gray-50" style={{padding: '2rem'}}>
            {/* Error Messages */}
            {fetcher.data?.errors && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-lg ring-2 ring-red-100">
                <div className="space-y-2">
                  {fetcher.data.errors.map((error: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-800">{error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Centered Form */}
            <div className="mx-auto" style={{maxWidth: '48rem', width: '100%'}}>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
                  
                  {/* Name Fields */}
                  <div className="grid gap-6" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%'}}>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  {/* Phone and Company Fields */}
                  <div className="grid gap-6" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%'}}>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">Company (Optional)</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Address Information</h3>
                  
                  {/* Country Field */}
                  <div className="space-y-3" style={{width: '100%'}}>
                    <label className="block text-sm font-semibold text-gray-800">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900"
                      style={{width: '100%'}}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="JP">Japan</option>
                      <option value="VN">Vietnam</option>
                    </select>
                  </div>

                  {/* Street Address Fields */}
                  <div className="space-y-3" style={{width: '100%'}}>
                    <label className="block text-sm font-semibold text-gray-800">Street Address *</label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      required
                      className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                      style={{width: '100%'}}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="space-y-3" style={{width: '100%'}}>
                    <label className="block text-sm font-semibold text-gray-800">Apartment, suite, etc. (Optional)</label>
                    <input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                      style={{width: '100%'}}
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>

                  {/* City, State, ZIP Grid */}
                  <div className="grid gap-6" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%'}}>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">State/Province *</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter state/province"
                      />
                    </div>
                    <div className="space-y-3" style={{width: '100%'}}>
                      <label className="block text-sm font-semibold text-gray-800">ZIP/Postal Code *</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        required
                        className="px-5 py-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-400 text-gray-900 placeholder-gray-500"
                        style={{width: '100%'}}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg">{isEditing ? 'Updating...' : 'Saving...'}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-lg">{isEditing ? 'Update Address' : 'Save Address'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-8 py-4 border-2 border-gray-400 bg-white text-gray-800 font-bold rounded-xl hover:border-gray-500 hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg">Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}