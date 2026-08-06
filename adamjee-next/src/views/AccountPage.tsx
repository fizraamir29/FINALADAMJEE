'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Package, MapPin, User, ChevronRight, Bell, LayoutDashboard, Clock, Mail, ShieldCheck, ShoppingCart, Trash2, X, Camera, Phone, Edit2, Check, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

import { Product } from '../types';

interface AccountPageProps {
  handleAddToCart: (product: Product) => void;
  formatPrice: (usdAmount: number) => string;
}

type Tab = 'dashboard' | 'orders' | 'cart' | 'addresses' | 'notifications' | 'profile';

export default function AccountPage({ handleAddToCart, formatPrice }: AccountPageProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'dashboard';
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, token, isLoggedIn, logout, updateUser } = useAuth();
  const { cart, setCart, formatPrice: appFormatPrice, setCartOpen } = useApp();
  const fmtPrice = formatPrice || appFormatPrice;

  // Profile editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security / Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressIdx, setEditingAddressIdx] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
    phone: '',
  });

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 'global-1',
      title: 'Welcome to Adamjee Computers!',
      message: 'Thank you for creating an account with us. Build your custom dream PC and explore our shop!',
      date: new Date().toLocaleDateString(),
      read: false,
      type: 'info'
    },
    {
      id: 'global-2',
      title: 'Active Season Sale 🌟',
      message: 'Get up to 20% discount on all gaming headsets and gaming accessories. Use promo code: ADAMJEE20.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
      read: false,
      type: 'promo'
    }
  ]);

  // Sync active tab from URL search params
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Auth guard — redirect to login if not authenticated (must be in useEffect, not render)
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);

  // Fetch orders
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const ordersRes = await fetch('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token, isLoggedIn, router]);




  // Dynamically populate order notifications
  useEffect(() => {
    if (orders.length > 0) {
      const orderNotifications = orders.map((order) => ({
        id: `order-notif-${order._id}`,
        title: `Order Update: ${order.orderId}`,
        message: `Your order containing ${order.items?.length || 0} item(s) is in "${order.orderStatus.toUpperCase()}" status. Delivery is estimated in 3-5 business days.`,
        date: new Date(order.createdAt).toLocaleDateString(),
        read: false,
        type: 'order'
      }));

      setNotifications(prev => {
        const cleanPrev = prev.filter(n => typeof n.id !== 'string' || !n.id.startsWith('order-notif-'));
        return [...cleanPrev, ...orderNotifications];
      });
    }
  }, [orders]);

  // Init edit fields when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  // Helper: save any profile fields to DB permanently
  const saveProfileToDb = async (fields: { name?: string; phone?: string; profilePicture?: string; addresses?: any[] }) => {
    if (!token) return;
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(fields),
      });
    } catch (err) {
      console.error('Failed to save profile to DB:', err);
    }
  };

  // Profile picture upload — saves to DB
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      updateUser({ profilePicture: base64 });   // instant UI update
      await saveProfileToDb({ profilePicture: base64 });  // persist to MongoDB
      setProfileMessage('Profile picture updated!');
      setTimeout(() => setProfileMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setProfileSaving(true);
    try {
      updateUser({ name: editName.trim() });   // instant UI
      await saveProfileToDb({ name: editName.trim() });  // persist to MongoDB
      setIsEditingName(false);
      setProfileMessage('Name updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePhone = async () => {
    setProfileSaving(true);
    try {
      updateUser({ phone: editPhone.trim() });   // instant UI
      await saveProfileToDb({ phone: editPhone.trim() });  // persist to MongoDB
      setIsEditingPhone(false);
      setProfileMessage('Phone number saved!');
      setTimeout(() => setProfileMessage(''), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordChanging(true);
    setPasswordMsg(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ type: 'success', text: data.message || 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordMsg({ type: 'error', text: 'An error occurred while updating your password.' });
    } finally {
      setPasswordChanging(false);
    }
  };

  // Show spinner while auth or data is loading
  if (loading || !user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#164475] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-50 text-green-700 border border-green-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-[#0a1b2d]">My Profile</h2>

            {profileMessage && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-semibold">
                <Check className="w-4 h-4 flex-shrink-0" /> {profileMessage}
              </div>
            )}

            {/* Profile Picture */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black text-[#0a1b2d] uppercase tracking-wider mb-6">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-28 h-28 rounded-2xl object-cover border-4 border-[#164475]/10 shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#164475] to-[#0a1b2d] flex items-center justify-center text-white font-black text-4xl shadow-lg border-4 border-[#164475]/10">
                      {getUserInitials()}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
                <div className="text-center sm:text-left">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#164475] hover:bg-[#0a1b2d] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 mx-auto sm:mx-0"
                  >
                    <Camera className="w-4 h-4" /> Change Photo
                  </button>
                  <p className="text-xs text-gray-400 mt-2 font-medium">JPG, PNG or GIF · Max 2MB</p>
                  {user.profilePicture && (
                    <button
                      onClick={() => { updateUser({ profilePicture: '' }); setProfileMessage('Profile picture removed'); setTimeout(() => setProfileMessage(''), 3000); }}
                      className="text-red-400 hover:text-red-600 text-xs font-bold mt-2 flex items-center gap-1 mx-auto sm:mx-0"
                    >
                      <Trash2 className="w-3 h-3" /> Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-[#0a1b2d] uppercase tracking-wider">Personal Information</h3>

              {/* Full Name */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#164475]/40 focus:ring-2 focus:ring-[#164475]/30 outline-none text-sm font-semibold text-[#0a1b2d]"
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        autoFocus
                      />
                      <button onClick={handleSaveName} disabled={profileSaving} className="w-9 h-9 bg-[#164475] text-white rounded-xl flex items-center justify-center hover:bg-[#0a1b2d] transition-all flex-shrink-0">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setIsEditingName(false); setEditName(user.name); }} className="w-9 h-9 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-bold text-[#0a1b2d] text-base">{user.name}</p>
                  )}
                </div>
                {!isEditingName && (
                  <button onClick={() => setIsEditingName(true)} className="flex items-center gap-1.5 text-[#164475] hover:text-[#0a1b2d] text-xs font-bold flex-shrink-0 mt-5">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="font-semibold text-[#0a1b2d] text-sm">{user.email}</p>
                  <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-200">Verified</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#164475]/40 focus:ring-2 focus:ring-[#164475]/30 outline-none text-sm font-semibold text-[#0a1b2d]"
                        placeholder="+92 300 0000000"
                        onKeyDown={e => e.key === 'Enter' && handleSavePhone()}
                        autoFocus
                      />
                      <button onClick={handleSavePhone} disabled={profileSaving} className="w-9 h-9 bg-[#164475] text-white rounded-xl flex items-center justify-center hover:bg-[#0a1b2d] transition-all flex-shrink-0">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setIsEditingPhone(false); setEditPhone(user.phone || ''); }} className="w-9 h-9 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="font-semibold text-[#0a1b2d] text-sm">{user.phone || <span className="text-gray-400 italic">Not added</span>}</p>
                    </div>
                  )}
                </div>
                {!isEditingPhone && (
                  <button onClick={() => setIsEditingPhone(true)} className="flex items-center gap-1.5 text-[#164475] hover:text-[#0a1b2d] text-xs font-bold flex-shrink-0 mt-5">
                    <Edit2 className="w-3.5 h-3.5" /> {user.phone ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>

              {/* Role */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#164475] flex-shrink-0" />
                  <span className="capitalize font-bold text-[#0a1b2d] text-sm">{user.role === 'admin' ? '⚡ Admin' : 'Standard Customer'}</span>
                </div>
              </div>
            </div>

            {/* Password & Security Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-[#0a1b2d] uppercase tracking-wider">Security & Change Password</h3>

              {passwordMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMsg.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-semibold text-[#0a1b2d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-semibold text-[#0a1b2d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-semibold text-[#0a1b2d]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordChanging}
                  className="bg-[#164475] hover:bg-[#0a1b2d] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer border-none"
                >
                  {passwordChanging ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top Welcome Banner */}
            <div className="bg-gradient-to-r from-[#0a1b2d] to-[#164475] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-3xl font-black">
                        {getUserInitials()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Hello, {user?.name?.split(' ')[0]}!</h2>
                    <p className="text-white/60 text-xs mt-1">Account Level: Standard Customer</p>
                    <p className="text-white/80 text-sm mt-0.5">{user?.email}</p>
                    {user?.phone && <p className="text-white/60 text-xs mt-0.5">📞 {user.phone}</p>}
                  </div>
                </div>
                <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-white/10 transition-colors">
                  <LogOut className="w-4.5 h-4.5" /> Logout
                </button>
              </div>
            </div>

            {/* Statistics Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <button onClick={() => setActiveTab('orders')} className="bg-white p-6 rounded-3xl border border-gray-150 flex items-center gap-4 hover:shadow-lg transition-all text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#164475]/10 text-[#164475] flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#0a1b2d] leading-none mb-1">{orders.length}</h3>
                  <p className="text-xs text-[#64748b] font-semibold">Total Orders</p>
                </div>
              </button>

              <button onClick={() => setActiveTab('cart')} className="bg-white p-6 rounded-3xl border border-gray-150 flex items-center gap-4 hover:shadow-lg transition-all text-left">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#0a1b2d] leading-none mb-1">{cart.reduce((t, i) => t + i.qty, 0)}</h3>
                  <p className="text-xs text-[#64748b] font-semibold">Items in Cart</p>
                </div>
              </button>


              <button onClick={() => setActiveTab('notifications')} className="bg-white p-6 rounded-3xl border border-gray-150 flex items-center gap-4 hover:shadow-lg transition-all text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-55/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#0a1b2d] leading-none mb-1">{notifications.filter(n => !n.read).length}</h3>
                  <p className="text-xs text-[#64748b] font-semibold">Unread Notifications</p>
                </div>
              </button>

            </div>

            {/* Recent Order & Recent Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Orders Overview */}
              <div className="bg-[#fafbfc] border border-gray-150 rounded-3xl p-6">
                <h3 className="font-black text-[#0a1b2d] text-lg mb-4 flex items-center justify-between">
                  <span>Recent Order</span>
                  <button onClick={() => setActiveTab('orders')} className="text-[#164475] text-xs font-bold hover:underline flex items-center gap-1">All Orders <ChevronRight className="w-3.5 h-3.5" /></button>
                </h3>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium">No orders placed yet.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#0a1b2d] text-sm">{orders[0].orderId}</p>
                        <p className="text-xs text-[#64748b] font-medium mt-0.5">{new Date(orders[0].createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${getOrderStatusColor(orders[0].orderStatus)}`}>
                        {orders[0].orderStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 border-t border-b border-gray-100 py-3">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl p-1 flex-shrink-0 flex items-center justify-center">
                        <img src={orders[0].items[0]?.image} alt={orders[0].items[0]?.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0a1b2d] truncate">{orders[0].items[0]?.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {orders[0].items.length > 1 ? `and ${orders[0].items.length - 1} other item(s)` : `Qty: ${orders[0].items[0]?.quantity}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total amount</p>
                        <p className="font-extrabold text-[#164475] text-base">{formatPrice(orders[0].total)}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(orders[0])} className="bg-[#0a1b2d] hover:bg-[#164475] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Announcements / Notifications Block */}
              <div className="bg-[#fafbfc] border border-gray-150 rounded-3xl p-6">
                <h3 className="font-black text-[#0a1b2d] text-lg mb-4 flex items-center justify-between">
                  <span>Announcements</span>
                  <button onClick={() => setActiveTab('notifications')} className="text-[#164475] text-xs font-bold hover:underline flex items-center gap-1">All Notices <ChevronRight className="w-3.5 h-3.5" /></button>
                </h3>

                <div className="space-y-3">
                  {notifications.slice(0, 2).map((notif) => (
                    <div key={notif.id} className={`bg-white border rounded-2xl p-4 shadow-sm relative transition-all ${!notif.read ? 'border-blue-150 bg-blue-50/5' : 'border-gray-150'}`}>
                      {!notif.read && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />}
                      <h4 className="text-xs font-bold text-[#0a1b2d] pr-4">{notif.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <p className="text-[9px] text-gray-400 font-bold mt-2">{notif.date}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-black text-[#0a1b2d]">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-[#fafbfc] rounded-3xl border border-dashed border-gray-250">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-bold text-[#0a1b2d] mb-1">No Orders Found</p>
                <p className="text-sm max-w-sm mx-auto mb-6">Looks like you haven't placed any orders yet. Visit our shop to explore custom setups!</p>
                <Link href="/" className="inline-flex items-center gap-2 bg-[#164475] hover:bg-[#0a1b2d] text-white font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md">
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8fafc] text-[#64748b] text-xs font-bold tracking-wider uppercase border-b border-gray-150">
                      <tr>
                        <th className="p-5">Order ID</th>
                        <th className="p-5">Date</th>
                        <th className="p-5">Status</th>
                        <th className="p-5">Total</th>
                        <th className="p-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-[#0a1b2d] text-sm font-medium">
                      {orders.map((order: any) => (
                        <tr key={order._id} className="hover:bg-[#fafbfc] transition-colors">
                          <td className="p-5 font-mono text-[#0a1b2d] font-bold">{order.orderId}</td>
                          <td className="p-5 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="p-5 font-extrabold text-[#164475]">{formatPrice(order.total)}</td>
                          <td className="p-5 text-right">
                            <button onClick={() => setSelectedOrder(order)} className="text-[#164475] hover:text-[#0d2a52] font-black text-xs">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case 'cart': {
        const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
        const cartQty = cart.reduce((sum, i) => sum + i.qty, 0);

        const removeFromCart = (productId: string) => {
          setCart(prev => prev.filter(i => (i.product.id || i.product._id) !== productId));
        };

        const changeQty = (productId: string, delta: number) => {
          setCart(prev => prev
            .map(i => (i.product.id || i.product._id) === productId ? { ...i, qty: i.qty + delta } : i)
            .filter(i => i.qty > 0)
          );
        };

        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#0a1b2d]">My Cart</h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-[#fafbfc] rounded-3xl border-2 border-dashed border-gray-200">
                <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-black text-[#0a1b2d] mb-1">Your Cart is Empty</p>
                <p className="text-sm text-gray-400 font-medium mb-6 max-w-xs mx-auto">Browse our shop and add products to your cart.</p>
                <Link href="/category/all" className="inline-flex items-center gap-2 bg-[#164475] hover:bg-[#0a1b2d] text-white font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md">
                  <ShoppingCart className="w-4 h-4" /> Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-100">
                  {cart.map(({ product, qty }) => {
                    const pId = product.id || product._id || '';
                    return (
                      <div key={pId} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl p-1.5 flex-shrink-0 flex items-center justify-center">
                          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</span>
                          <h4 className="font-extrabold text-[#0a1b2d] text-sm truncate leading-snug">{product.name}</h4>
                          <p className="text-[#164475] font-extrabold text-sm mt-0.5">{fmtPrice(product.price)}</p>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => changeQty(pId, -1)}
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#164475] hover:text-white text-gray-600 flex items-center justify-center transition-all font-bold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-black text-[#0a1b2d] text-sm">{qty}</span>
                          <button
                            onClick={() => changeQty(pId, 1)}
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#164475] hover:text-white text-gray-600 flex items-center justify-center transition-all font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right flex-shrink-0 min-w-[70px]">
                          <p className="font-extrabold text-[#0a1b2d] text-sm">{fmtPrice(product.price * qty)}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{qty} × {fmtPrice(product.price)}</p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(pId)}
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-[#0a1b2d] to-[#164475] rounded-3xl p-6 text-white">
                  <h3 className="font-black text-lg mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>{cartQty} item{cartQty !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-white">{fmtPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Estimated Shipping</span>
                      <span className="font-bold text-green-300">Free</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 mt-3 flex justify-between">
                      <span className="font-black text-base">Total</span>
                      <span className="font-black text-xl text-green-300">{fmtPrice(cartTotal)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setCartOpen(true); }}
                    className="w-full mt-5 bg-white text-[#0a1b2d] font-black py-3.5 rounded-2xl hover:bg-gray-100 transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" /> Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'addresses': {
        const savedAddresses: any[] = user?.addresses || [];

        const openAddModal = (idx?: number) => {
          if (idx !== undefined && savedAddresses[idx]) {
            const a = savedAddresses[idx];
            setAddressForm({
              label: a.label || 'Home',
              fullName: a.fullName || user?.name || '',
              street: a.street || '',
              city: a.city || '',
              postalCode: a.postalCode || '',
              country: a.country || 'Pakistan',
              phone: a.phone || user?.phone || '',
            });
            setEditingAddressIdx(idx);
          } else {
            setAddressForm({
              label: 'Home',
              fullName: user?.name || '',
              street: '',
              city: '',
              postalCode: '',
              country: 'Pakistan',
              phone: user?.phone || '',
            });
            setEditingAddressIdx(null);
          }
          setAddressModalOpen(true);
        };

        const saveAddress = async () => {
          if (!addressForm.fullName || !addressForm.street || !addressForm.city) return;
          const updated = [...savedAddresses];
          const newAddr = { ...addressForm, isDefault: editingAddressIdx === null ? savedAddresses.length === 0 : savedAddresses[editingAddressIdx]?.isDefault };
          if (editingAddressIdx !== null) {
            updated[editingAddressIdx] = newAddr;
          } else {
            updated.push(newAddr);
          }
          updateUser({ addresses: updated });       // instant UI
          await saveProfileToDb({ addresses: updated }); // persist to MongoDB
          setAddressModalOpen(false);
        };

        const deleteAddress = async (idx: number) => {
          const updated = savedAddresses.filter((_, i) => i !== idx);
          if (updated.length > 0) updated[0] = { ...updated[0], isDefault: true };
          updateUser({ addresses: updated });
          await saveProfileToDb({ addresses: updated });
        };

        const setDefault = async (idx: number) => {
          const updated = savedAddresses.map((a, i) => ({ ...a, isDefault: i === idx }));
          updateUser({ addresses: updated });
          await saveProfileToDb({ addresses: updated });
        };


        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#0a1b2d]">Address Book</h2>
              <button
                onClick={() => openAddModal()}
                className="flex items-center gap-2 bg-[#164475] hover:bg-[#0a1b2d] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="text-center py-20 bg-[#fafbfc] rounded-3xl border-2 border-dashed border-gray-200">
                <MapPin className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-black text-[#0a1b2d] mb-1">No Saved Addresses</p>
                <p className="text-sm text-gray-400 font-medium mb-6 max-w-xs mx-auto">Add your delivery address so we can ship your orders quickly.</p>
                <button
                  onClick={() => openAddModal()}
                  className="inline-flex items-center gap-2 bg-[#164475] hover:bg-[#0a1b2d] text-white font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl relative shadow-sm transition-all ${
                      addr.isDefault
                        ? 'border-2 border-[#164475] bg-[#f0f7ff]'
                        : 'border border-gray-200 bg-white hover:border-[#164475]/40'
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="absolute top-5 right-5 bg-[#164475] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Default</span>
                    )}
                    <h4 className="font-extrabold text-[#0a1b2d] mb-3 flex items-center gap-2 pr-16">
                      <MapPin className="w-4 h-4 text-[#164475] flex-shrink-0" />
                      {addr.label || 'Home'} Address
                    </h4>
                    <div className="text-gray-600 text-sm leading-relaxed space-y-1">
                      <p className="font-bold text-[#0a1b2d]">{addr.fullName}</p>
                      {addr.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {addr.phone}</p>}
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{addr.street}, {addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''}, {addr.country || 'Pakistan'}</span>
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3 text-xs font-bold">
                      <button onClick={() => openAddModal(idx)} className="text-[#164475] hover:underline flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      {!addr.isDefault && (
                        <button onClick={() => setDefault(idx)} className="text-gray-500 hover:text-[#164475] hover:underline">
                          Set as Default
                        </button>
                      )}
                      <button onClick={() => deleteAddress(idx)} className="text-red-400 hover:text-red-600 hover:underline ml-auto flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Card */}
                <button
                  onClick={() => openAddModal()}
                  className="p-6 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-[#164475] hover:text-[#164475] transition-all min-h-[180px] bg-white group"
                >
                  <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">Add New Address</span>
                </button>
              </div>
            )}

            {/* Add/Edit Address Modal */}
            {addressModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddressModalOpen(false)} />
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-black text-[#0a1b2d]">{editingAddressIdx !== null ? 'Edit Address' : 'Add New Address'}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Fill in your delivery details</p>
                    </div>
                    <button onClick={() => setAddressModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Label */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address Label</label>
                      <div className="flex gap-2">
                        {['Home', 'Office', 'Other'].map(lbl => (
                          <button
                            key={lbl}
                            onClick={() => setAddressForm(f => ({ ...f, label: lbl }))}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                              addressForm.label === lbl
                                ? 'border-[#164475] bg-[#164475] text-white'
                                : 'border-gray-200 text-gray-500 hover:border-[#164475] hover:text-[#164475]'
                            }`}
                          >{lbl}</button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={e => setAddressForm(f => ({ ...f, fullName: e.target.value }))}
                        placeholder="Muhammad Ali"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-medium text-[#0a1b2d] transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+92 300 0000000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-medium text-[#0a1b2d] transition-all"
                      />
                    </div>

                    {/* Street */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Street Address *</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))}
                        placeholder="House 12A, Street 4, DHA Phase 6"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-medium text-[#0a1b2d] transition-all"
                      />
                    </div>

                    {/* City & Postal */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">City *</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                          placeholder="Karachi"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-medium text-[#0a1b2d] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Postal Code</label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={e => setAddressForm(f => ({ ...f, postalCode: e.target.value }))}
                          placeholder="75500"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-medium text-[#0a1b2d] transition-all"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Country</label>
                      <select
                        value={addressForm.country}
                        onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#164475]/30 focus:border-[#164475] outline-none text-sm font-medium text-[#0a1b2d] transition-all bg-white"
                      >
                        <option>Pakistan</option>
                        <option>United Arab Emirates</option>
                        <option>Saudi Arabia</option>
                        <option>United Kingdom</option>
                        <option>United States</option>
                      </select>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => setAddressModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveAddress}
                      disabled={!addressForm.fullName || !addressForm.street || !addressForm.city}
                      className="flex-1 py-3 rounded-xl bg-[#164475] hover:bg-[#0a1b2d] text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {editingAddressIdx !== null ? 'Save Changes' : 'Add Address'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'notifications':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-black text-[#0a1b2d]">Company Announcements</h2>
            
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-6 border rounded-3xl shadow-sm relative transition-all cursor-pointer flex gap-4 items-start ${
                    !notif.read 
                      ? 'border-blue-150 bg-blue-50/5' 
                      : 'border-gray-150 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    notif.type === 'promo' ? 'bg-purple-50 text-purple-700' :
                    notif.type === 'order' ? 'bg-[#164475]/10 text-[#164475]' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#0a1b2d] leading-snug">{notif.title}</h4>
                      {!notif.read && (
                        <span className="bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">New</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 font-extrabold mt-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {notif.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc] font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-black text-[#0a1b2d] tracking-tight mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side navigation panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden sticky top-32 shadow-sm">

              {/* Profile Preview in Sidebar */}
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#164475] to-[#0a1b2d] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {getUserInitials()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-black text-[#0a1b2d] text-xs truncate">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="flex flex-col">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'profile', label: 'My Profile', icon: User },
                  { id: 'orders', label: 'Order History', icon: Package },
                  { id: 'cart', label: 'My Cart', icon: ShoppingCart },
                  { id: 'addresses', label: 'Address Book', icon: MapPin },
                  { id: 'notifications', label: 'Notifications', icon: Bell }
                ].map(item => {
                  const Icon = item.icon;
                  const isNotification = item.id === 'notifications';
                  const isCart = item.id === 'cart';
                  const unreadCount = notifications.filter(n => !n.read).length;
                  const cartCount = cart.reduce((t, i) => t + i.qty, 0);
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`px-6 py-4.5 text-left font-bold text-xs uppercase tracking-wider flex items-center gap-3 transition-colors border-l-4 ${
                        activeTab === item.id 
                          ? 'bg-[#f8fafc] border-[#164475] text-[#164475]' 
                          : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-[#0a1b2d]'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {isNotification && unreadCount > 0 && (
                        <span className="bg-[#164475] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
                      )}
                      {isCart && cartCount > 0 && (
                        <span className="bg-green-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
                      )}
                    </button>
                  );
                })}

                <button 
                  onClick={handleLogout}
                  className="px-6 py-4.5 text-left font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors border-l-4 border-transparent mt-4 border-t border-gray-100"
                >
                  <LogOut className="w-4.5 h-4.5" /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Account details render area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-150 p-6 lg:p-10 shadow-sm min-h-[500px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-zoom-in">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-[#0a1b2d]">Order Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">ID: <span className="font-mono text-[#164475] font-extrabold">{selectedOrder.orderId}</span></p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Order Status & Payment details summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${getOrderStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Date</span>
                  <span className="text-xs font-bold text-[#0a1b2d]">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Payment</span>
                  <span className="text-xs font-bold text-[#0a1b2d] capitalize">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Paid</span>
                  <span className="text-xs font-extrabold text-[#164475]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-[#0a1b2d] uppercase tracking-wider">Ordered Items</h4>
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 divide-y divide-gray-100">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center">
                      <div className="w-12 h-12 bg-white border border-gray-150 rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-[#0a1b2d] truncate">{item.name}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-extrabold text-[#164475]">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#0a1b2d] uppercase tracking-wider">Shipping Destination</h4>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-600 space-y-2">
                  <p className="font-extrabold text-[#0a1b2d] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#164475]" /> {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode || 'Pakistan'}
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {selectedOrder.guestEmail || user?.email}
                  </p>
                  {selectedOrder.shippingAddress?.phone && (
                    <p className="flex items-center gap-2 text-xs">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      Ph: {selectedOrder.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="border-t border-gray-100 pt-5 space-y-2 text-xs font-semibold text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#0a1b2d]">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="text-[#0a1b2d]">{formatPrice(selectedOrder.shippingCost || 15)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount Applied</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-extrabold text-[#0a1b2d] mt-2">
                  <span>Final Total</span>
                  <span className="text-base text-[#164475]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
