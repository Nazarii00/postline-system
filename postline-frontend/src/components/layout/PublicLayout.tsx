import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div className="layout min-h-screen bg-slate-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer/>
    </div>
  );
};

export default PublicLayout;