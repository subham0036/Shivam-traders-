import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FloatingButtons from '../components/layout/FloatingButtons';
import { ToastProvider } from '../components/common/Toast';

const MainLayout = () => (
  <ToastProvider>
    <div className="app-layout">
      <Header />
      <main><Outlet /></main>
      <Footer />
      <FloatingButtons />
    </div>
  </ToastProvider>
);

export default MainLayout;
