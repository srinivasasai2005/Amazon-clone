import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider }         from './context/CartContext';
import { WishlistProvider }     from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar                   from './components/layout/Navbar';
import Footer                   from './components/layout/Footer';
import HomePage                 from './pages/HomePage';
import ProductListPage          from './pages/ProductListPage';
import ProductDetailPage        from './pages/ProductDetailPage';
import CartPage                 from './pages/CartPage';
import CheckoutPage             from './pages/CheckoutPage';
import OrderConfirmationPage    from './pages/OrderConfirmationPage';
import OrderHistoryPage         from './pages/OrderHistoryPage';
import WishlistPage             from './pages/WishlistPage';
import PrimePage                from './pages/PrimePage';
import CustomerServicePage      from './pages/CustomerServicePage';
import LoginPage                from './pages/LoginPage';
import SignupPage               from './pages/SignupPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/login"                     element={<LoginPage />} />
                    <Route path="/signup"                    element={<SignupPage />} />
                    
                    <Route path="/"                          element={<HomePage />} />
                    <Route path="/products"                  element={<ProductListPage />} />
                    <Route path="/products/:id"              element={<ProductDetailPage />} />
                    <Route path="/cart"                      element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="/checkout"                  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
                    <Route path="/orders"                    element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                    <Route path="/wishlist"                  element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    <Route path="/prime"                     element={<ProtectedRoute><PrimePage /></ProtectedRoute>} />
                    <Route path="/customer-service"          element={<CustomerServicePage />} />
                    
                    <Route path="*"                          element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
