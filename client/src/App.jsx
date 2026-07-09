import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import './layouts/MainLayout.css';

const Home = lazy(() => import('./pages/customer/Home'));
const Shop = lazy(() => import('./pages/customer/Shop'));
const ProductDetails = lazy(() => import('./pages/customer/ProductDetails'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const OrderSuccess = lazy(() => import('./pages/customer/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/customer/TrackOrder'));
const Login = lazy(() => import('./pages/customer/Login'));
const Register = lazy(() => import('./pages/customer/Register'));
const ForgotPassword = lazy(() => import('./pages/customer/ForgotPassword'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Wishlist = lazy(() => import('./pages/customer/Wishlist'));
const Categories = lazy(() => import('./pages/customer/Categories'));
const About = lazy(() => import('./pages/customer/About'));
const Contact = lazy(() => import('./pages/customer/Contact'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const PrivacyPolicy = lazy(() => import('./pages/customer/Policies').then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import('./pages/customer/Policies').then(m => ({ default: m.RefundPolicy })));
const ShippingPolicy = lazy(() => import('./pages/customer/Policies').then(m => ({ default: m.ShippingPolicy })));
const TermsConditions = lazy(() => import('./pages/customer/Policies').then(m => ({ default: m.TermsConditions })));
const NotFound = lazy(() => import('./pages/customer/Policies').then(m => ({ default: m.NotFound })));

const Loading = () => <div className="loading-spinner" />;

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="shipping-policy" element={<ShippingPolicy />} />
          <Route path="terms" element={<TermsConditions />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/*" element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="staff/*" element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
