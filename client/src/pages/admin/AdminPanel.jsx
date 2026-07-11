import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminProductForm from './AdminProductForm';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Payments from './pages/Payments';
import Shipping from './pages/Shipping';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Content from './pages/Content';
import Users from './pages/Users';

const AdminPanel = () => (
  <AdminLayout>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="orders" element={<Orders />} />
      <Route path="orders/:id" element={<OrderDetail />} />
      <Route path="payments" element={<Payments />} />
      <Route path="shipping" element={<Shipping />} />
      <Route path="products" element={<Products />} />
      <Route path="products/new" element={<AdminProductForm />} />
      <Route path="products/:id/edit" element={<AdminProductForm />} />
      <Route path="categories" element={<Categories />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="customers" element={<Customers />} />
      <Route path="coupons" element={<Coupons />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="content" element={<Content />} />
      <Route path="settings" element={<Settings />} />
      <Route path="users" element={<Users />} />
    </Routes>
  </AdminLayout>
);

export default AdminPanel;
