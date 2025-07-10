import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  ShoppingCart, 
  Tag, 
  Gift, 
  Settings, 
  Crown, 
  CheckCircle, 
  X, 
  Plus, 
  Edit, 
  Trash2,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  LogOut,
  Database,
  Activity,
  FileText,
  Zap,
  Shield,
  Globe,
  Server,
  MessageCircle,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { superDatabase, type User, type Order, type SpecialOffer, type Coupon, type Plan } from '../utils/database';

interface AdminPageProps {
  theme?: string;
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ theme = 'dark', onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newOffer, setNewOffer] = useState({
    type: 'minecraft',
    planName: '',
    originalPrice: '',
    discountPrice: '',
    discountPercentage: 0
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    usageLimit: 100,
    expiryDate: ''
  });

  const [newPlan, setNewPlan] = useState({
    type: 'minecraft',
    category: 'budget',
    name: '',
    price: '',
    specs: {},
    isActive: true
  });

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [orderIdToConfirm, setOrderIdToConfirm] = useState('');

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 3 seconds for real-time updates
    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Force sync with other devices
      superDatabase.forceSync();
      
      setUsers(superDatabase.getAllUsers());
      setOrders(superDatabase.getAllOrders());
      setSpecialOffers(superDatabase.getAllSpecialOffers());
      setCoupons(superDatabase.getAllCoupons());
      setPlans(superDatabase.getAllPlans());
      setAnalytics(superDatabase.getAnalytics());
      
      console.log('Admin data loaded:', {
        users: superDatabase.getAllUsers().length,
        orders: superDatabase.getAllOrders().length,
        analytics: superDatabase.getAnalytics()
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadData();
    setTimeout(() => setIsLoading(false), 500);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
          card: 'bg-white/90 backdrop-blur-xl border-white/40',
          text: 'text-gray-900',
          textSecondary: 'text-gray-600',
          textMuted: 'text-gray-500',
          button: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
          input: 'bg-white/80 border-gray-300 text-gray-900'
        };
      case 'glass':
        return {
          bg: 'bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-3xl',
          card: 'bg-white/5 backdrop-blur-xl border-white/10',
          text: 'text-white',
          textSecondary: 'text-white/80',
          textMuted: 'text-white/60',
          button: 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-600/80 hover:to-pink-600/80',
          input: 'bg-white/5 border-white/10 text-white'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
          card: 'bg-white/5 backdrop-blur-xl border-white/10',
          text: 'text-white',
          textSecondary: 'text-gray-300',
          textMuted: 'text-gray-400',
          button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
          input: 'bg-white/10 border-white/20 text-white'
        };
    }
  };

  const themeStyles = getThemeClasses();

  const handleUserMembershipChange = (userId: string, membershipType: 'normal' | 'premium') => {
    superDatabase.updateUserMembership(userId, membershipType);
    loadData();
  };

  const handleConfirmOrder = () => {
    if (orderIdToConfirm.trim()) {
      const success = superDatabase.confirmOrder(orderIdToConfirm.trim());
      if (success) {
        alert('Order confirmed successfully!');
        setOrderIdToConfirm('');
        loadData();
      } else {
        alert('Order not found!');
      }
    }
  };

  const handleResetOrder = (orderId: string) => {
    if (confirm('Are you sure you want to reset this order to pending status?')) {
      superDatabase.resetOrder(orderId);
      loadData();
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      superDatabase.deleteOrder(orderId);
      loadData();
    }
  };

  const handleCreateSpecialOffer = () => {
    if (newOffer.planName && newOffer.originalPrice && newOffer.discountPrice) {
      const discountPercentage = Math.round(
        ((parseFloat(newOffer.originalPrice.replace(/[₹,]/g, '')) - 
          parseFloat(newOffer.discountPrice.replace(/[₹,]/g, ''))) / 
         parseFloat(newOffer.originalPrice.replace(/[₹,]/g, ''))) * 100
      );

      superDatabase.createSpecialOffer({
        type: newOffer.type as 'minecraft' | 'vps' | 'domain',
        planName: newOffer.planName,
        originalPrice: newOffer.originalPrice,
        discountPrice: newOffer.discountPrice,
        discountPercentage,
        isActive: true
      });

      setNewOffer({
        type: 'minecraft',
        planName: '',
        originalPrice: '',
        discountPrice: '',
        discountPercentage: 0
      });
      loadData();
    }
  };

  const handleDeleteSpecialOffer = (offerId: string) => {
    if (confirm('Are you sure you want to delete this special offer?')) {
      superDatabase.deleteSpecialOffer(offerId);
      loadData();
    }
  };

  const handleCreateCoupon = () => {
    if (newCoupon.code && newCoupon.discountValue && newCoupon.expiryDate) {
      superDatabase.createCoupon({
        code: newCoupon.code.toUpperCase(),
        discountType: newCoupon.discountType as 'percentage' | 'fixed',
        discountValue: newCoupon.discountValue,
        isActive: true,
        usageLimit: newCoupon.usageLimit,
        expiryDate: newCoupon.expiryDate
      });

      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        usageLimit: 100,
        expiryDate: ''
      });
      loadData();
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      superDatabase.deleteCoupon(couponId);
      loadData();
    }
  };

  const handleResetCoupon = (couponId: string) => {
    if (confirm('Are you sure you want to reset the usage count for this coupon?')) {
      superDatabase.resetCoupon(couponId);
      loadData();
    }
  };

  const handleToggleCoupon = (couponId: string) => {
    superDatabase.toggleCoupon(couponId);
    loadData();
  };

  const handleCreatePlan = () => {
    if (newPlan.name && newPlan.price) {
      superDatabase.createPlan({
        type: newPlan.type as 'minecraft' | 'vps' | 'domain',
        category: newPlan.category,
        name: newPlan.name,
        price: newPlan.price,
        specs: newPlan.specs,
        isActive: newPlan.isActive
      });

      setNewPlan({
        type: 'minecraft',
        category: 'budget',
        name: '',
        price: '',
        specs: {},
        isActive: true
      });
      loadData();
    }
  };

  const handleUpdatePlan = () => {
    if (editingPlan) {
      superDatabase.updatePlan(editingPlan.id, editingPlan);
      setEditingPlan(null);
      loadData();
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      superDatabase.deletePlan(planId);
      loadData();
    }
  };

  const toggleSpecialOffer = (offerId: string) => {
    superDatabase.toggleSpecialOffer(offerId);
    loadData();
  };

  const exportData = () => {
    const data = {
      users: users,
      orders: orders,
      specialOffers: specialOffers,
      coupons: coupons,
      plans: plans,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demon-node-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDeviceIcon = (deviceInfo?: string) => {
    switch (deviceInfo) {
      case 'Mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'users', name: 'Users', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'orders', name: 'Orders', icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'offers', name: 'Offers', icon: <Gift className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'coupons', name: 'Coupons', icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'plans', name: 'Plans', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'system', name: 'System', icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" /> }
  ];

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text}`}>Admin Dashboard</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className={`${themeStyles.card} p-3 sm:p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${themeStyles.textMuted} text-xs sm:text-sm`}>Total Users</p>
              <p className={`${themeStyles.text} text-lg sm:text-2xl font-bold`}>{analytics.totalUsers || 0}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
        </div>

        <div className={`${themeStyles.card} p-3 sm:p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${themeStyles.textMuted} text-xs sm:text-sm`}>Premium Users</p>
              <p className={`${themeStyles.text} text-lg sm:text-2xl font-bold`}>{analytics.premiumUsers || 0}</p>
            </div>
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
          </div>
        </div>

        <div className={`${themeStyles.card} p-3 sm:p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${themeStyles.textMuted} text-xs sm:text-sm`}>Total Orders</p>
              <p className={`${themeStyles.text} text-lg sm:text-2xl font-bold`}>{analytics.totalOrders || 0}</p>
            </div>
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
        </div>

        <div className={`${themeStyles.card} p-3 sm:p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${themeStyles.textMuted} text-xs sm:text-sm`}>Pending Orders</p>
              <p className={`${themeStyles.text} text-lg sm:text-2xl font-bold`}>{analytics.pendingOrders || 0}</p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Device Statistics */}
      {analytics.deviceStats && (
        <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
          <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Device Statistics</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(analytics.deviceStats).map(([device, count]) => (
              <div key={device} className={`${themeStyles.card} p-3 sm:p-4 rounded-xl border text-center`}>
                <div className="flex justify-center mb-2">
                  {getDeviceIcon(device)}
                </div>
                <h4 className={`font-semibold ${themeStyles.text} text-sm sm:text-base`}>{device}</h4>
                <p className={`text-xs sm:text-sm ${themeStyles.textMuted}`}>{count} users</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
        <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder="Order ID"
              value={orderIdToConfirm}
              onChange={(e) => setOrderIdToConfirm(e.target.value)}
              className={`flex-1 px-3 py-2 ${themeStyles.input} border rounded-lg text-sm`}
            />
            <button
              onClick={handleConfirmOrder}
              className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Confirm Order
            </button>
          </div>
          
          <button
            onClick={() => setActiveTab('offers')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Gift className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
          
          <button
            onClick={() => setActiveTab('coupons')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Tag className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
        <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Recent Orders</h3>
        <div className="space-y-2 sm:space-y-3">
          {orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className={`${themeStyles.card} p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${themeStyles.text} text-sm`}>#{order.orderId}</span>
                    {order.deviceInfo && getDeviceIcon(order.deviceInfo)}
                  </div>
                  <span className={`text-xs sm:text-sm ${themeStyles.textSecondary} capitalize`}>
                    {order.type} - {order.planName}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                  order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${themeStyles.textMuted}`}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>User Management</h2>
      
      <div className={`${themeStyles.card} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>User</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden sm:table-cell`}>Email</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Status</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden md:table-cell`}>Device</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${themeStyles.text}`}>{user.username}</div>
                    <div className={`text-xs ${themeStyles.textMuted} sm:hidden`}>{user.email}</div>
                    <div className={`text-xs ${themeStyles.textMuted}`}>
                      Last seen: {new Date(user.lastSeen).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden sm:table-cell`}>
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.membershipType === 'premium' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.membershipType === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                      {user.membershipType}
                    </span>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden md:table-cell`}>
                    <div className="flex items-center space-x-1">
                      {getDeviceIcon(user.deviceInfo)}
                      <span>{user.deviceInfo || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={user.membershipType}
                      onChange={(e) => handleUserMembershipChange(user.id, e.target.value as 'normal' | 'premium')}
                      className={`${themeStyles.input} border rounded px-2 py-1 text-xs sm:text-sm`}
                    >
                      <option value="normal">Normal</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>Order Management</h2>
      
      <div className={`${themeStyles.card} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Order</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden sm:table-cell`}>Plan</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Status</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden md:table-cell`}>Device</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${themeStyles.text}`}>#{order.orderId}</div>
                    <div className={`text-xs ${themeStyles.textSecondary} capitalize sm:hidden`}>
                      {order.type} - {order.planName}
                    </div>
                    <div className={`text-xs ${themeStyles.textMuted}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden sm:table-cell`}>
                    <div className="capitalize">{order.type}</div>
                    <div className="text-xs">{order.planName}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden md:table-cell`}>
                    <div className="flex items-center space-x-1">
                      {getDeviceIcon(order.deviceInfo)}
                      <span>{order.deviceInfo || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleResetOrder(order.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Reset to Pending"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSpecialOffers = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>Special Offers</h2>
      
      {/* Create New Offer */}
      <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
        <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Create Special Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <select
            value={newOffer.type}
            onChange={(e) => setNewOffer({...newOffer, type: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          >
            <option value="minecraft">Minecraft</option>
            <option value="vps">VPS</option>
            <option value="domain">Domain</option>
          </select>
          <input
            type="text"
            placeholder="Plan Name"
            value={newOffer.planName}
            onChange={(e) => setNewOffer({...newOffer, planName: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <input
            type="text"
            placeholder="Original Price"
            value={newOffer.originalPrice}
            onChange={(e) => setNewOffer({...newOffer, originalPrice: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <input
            type="text"
            placeholder="Discount Price"
            value={newOffer.discountPrice}
            onChange={(e) => setNewOffer({...newOffer, discountPrice: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <button
            onClick={handleCreateSpecialOffer}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            Create Offer
          </button>
        </div>
      </div>

      {/* Existing Offers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {specialOffers.map((offer) => (
          <div key={offer.id} className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                offer.type === 'minecraft' ? 'bg-green-100 text-green-800' :
                offer.type === 'vps' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {offer.type}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => toggleSpecialOffer(offer.id)}
                  className={`p-1 rounded ${offer.isActive ? 'text-green-400' : 'text-gray-400'}`}
                  title={offer.isActive ? 'Deactivate' : 'Activate'}
                >
                  {offer.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteSpecialOffer(offer.id)}
                  className="p-1 rounded text-red-400 hover:text-red-300"
                  title="Delete Offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h4 className={`font-semibold ${themeStyles.text} mb-2 text-sm sm:text-base`}>{offer.planName}</h4>
            <div className="space-y-1">
              <div className={`text-sm ${themeStyles.textMuted} line-through`}>{offer.originalPrice}</div>
              <div className={`text-lg font-bold text-green-400`}>{offer.discountPrice}</div>
              <div className={`text-sm ${themeStyles.textSecondary}`}>{offer.discountPercentage}% OFF</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>Coupon Management</h2>
      
      {/* Create New Coupon */}
      <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
        <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Create Coupon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Coupon Code"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <select
            value={newCoupon.discountType}
            onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input
            type="number"
            placeholder="Discount Value"
            value={newCoupon.discountValue}
            onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseInt(e.target.value)})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <input
            type="number"
            placeholder="Usage Limit"
            value={newCoupon.usageLimit}
            onChange={(e) => setNewCoupon({...newCoupon, usageLimit: parseInt(e.target.value)})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <input
            type="date"
            value={newCoupon.expiryDate}
            onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <button
            onClick={handleCreateCoupon}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            Create Coupon
          </button>
        </div>
      </div>

      {/* Existing Coupons */}
      <div className={`${themeStyles.card} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Code</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden sm:table-cell`}>Discount</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Usage</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden md:table-cell`}>Expiry</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Status</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${themeStyles.text}`}>
                    {coupon.code}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden sm:table-cell`}>
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary}`}>
                    {coupon.usedCount}/{coupon.usageLimit}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden md:table-cell`}>
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleToggleCoupon(coupon.id)}
                        className={`p-1 rounded ${coupon.isActive ? 'text-green-400' : 'text-gray-400'}`}
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleResetCoupon(coupon.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Reset Usage"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>Plan Management</h2>
      
      {/* Create New Plan */}
      <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
        <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Create New Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <select
            value={newPlan.type}
            onChange={(e) => setNewPlan({...newPlan, type: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          >
            <option value="minecraft">Minecraft</option>
            <option value="vps">VPS</option>
            <option value="domain">Domain</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={newPlan.category}
            onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <input
            type="text"
            placeholder="Plan Name"
            value={newPlan.name}
            onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <input
            type="text"
            placeholder="Price"
            value={newPlan.price}
            onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          />
          <select
            value={newPlan.isActive.toString()}
            onChange={(e) => setNewPlan({...newPlan, isActive: e.target.value === 'true'})}
            className={`${themeStyles.input} border rounded-lg px-3 py-2 text-sm`}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button
            onClick={handleCreatePlan}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            Create Plan
          </button>
        </div>
      </div>

      {/* Existing Plans */}
      <div className={`${themeStyles.card} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Type</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden sm:table-cell`}>Category</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Name</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider hidden md:table-cell`}>Price</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Status</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${themeStyles.textMuted} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} capitalize`}>
                    {plan.type}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} capitalize hidden sm:table-cell`}>
                    {plan.category}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${themeStyles.text}`}>
                    {editingPlan?.id === plan.id ? (
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                        className={`${themeStyles.input} border rounded px-2 py-1 text-sm w-full`}
                      />
                    ) : (
                      plan.name
                    )}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${themeStyles.textSecondary} hidden md:table-cell`}>
                    {editingPlan?.id === plan.id ? (
                      <input
                        type="text"
                        value={editingPlan.price}
                        onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                        className={`${themeStyles.input} border rounded px-2 py-1 text-sm w-full`}
                      />
                    ) : (
                      plan.price
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      {editingPlan?.id === plan.id ? (
                        <>
                          <button
                            onClick={handleUpdatePlan}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Save Changes"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingPlan(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Edit Plan"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
          <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Revenue Overview</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>Total Revenue</span>
              <span className={`font-bold ${themeStyles.text}`}>₹{(analytics.totalOrders * 500).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>This Month</span>
              <span className={`font-bold text-green-400`}>₹{(analytics.confirmedOrders * 300).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
          <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Service Distribution</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>Minecraft</span>
              <span className={`font-bold ${themeStyles.text}`}>60%</span>
            </div>
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>VPS</span>
              <span className={`font-bold ${themeStyles.text}`}>30%</span>
            </div>
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>Domains</span>
              <span className={`font-bold ${themeStyles.text}`}>10%</span>
            </div>
          </div>
        </div>

        <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
          <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Growth Metrics</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>User Growth</span>
              <span className={`font-bold text-green-400`}>+15%</span>
            </div>
            <div className="flex justify-between">
              <span className={themeStyles.textSecondary}>Order Growth</span>
              <span className={`font-bold text-green-400`}>+25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.text} mb-4 sm:mb-6`}>System Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
          <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>Database Operations</h3>
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={exportData}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Database</span>
            </button>
            <button
              onClick={() => alert('Import functionality would be implemented here')}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Import Database</span>
            </button>
          </div>
        </div>

        <div className={`${themeStyles.card} p-4 sm:p-6 rounded-xl border`}>
          <h3 className={`text-base sm:text-lg font-semibold ${themeStyles.text} mb-3 sm:mb-4`}>System Status</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className={themeStyles.textSecondary}>Database</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={themeStyles.textSecondary}>Storage</span>
              <span className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                Available
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={themeStyles.textSecondary}>Last Backup</span>
              <span className={themeStyles.text}>Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${themeStyles.bg} py-4 sm:py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className={`${themeStyles.card} p-2 rounded-xl border mb-6 sm:mb-8`}>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : `${themeStyles.textSecondary} hover:bg-white/10`
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'offers' && renderSpecialOffers()}
          {activeTab === 'coupons' && renderCoupons()}
          {activeTab === 'plans' && renderPlans()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'system' && renderSystem()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;