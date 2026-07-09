import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FloatingButtons from '../components/layout/FloatingButtons';
import { ToastProvider } from '../components/common/Toast';

const MainLayout = () => (
  <ToastProvider>
    <div className="app-layout">
      <Header />
      <div className="trust-strip">
        <div className="container trust-strip-inner">
          <span>🕉 100% Authentic</span>
          <span>✦ Handcrafted</span>
          <span>🪷 Blessed Packaging</span>
          <span>🚚 Pan India Delivery</span>
          <span>💰 COD Available</span>
          <span>🔒 Secure Payment</span>
        </div>
      </div>
      <main><Outlet /></main>
      <Footer />
      <FloatingButtons />
    </div>
  </ToastProvider>
);

export default MainLayout;
