import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="layout">
      <header>
        <nav>
          <Link to="/">Головна</Link>
          <Link to="/auth">Увійти</Link>
        </nav>
      </header>
      
      <main>
        <Outlet /> 
      </main>
      
      <footer>© 2026 Postline System - Курсовий проект</footer>
    </div>
  );
};

export default PublicLayout;