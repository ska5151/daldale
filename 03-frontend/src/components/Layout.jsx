import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Layout.css';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo">Daldale</div>
                <nav className="nav-menu">
                    <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>대시보드</Link>
                    <Link to="/add" className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}>지출 등록</Link>
                    <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>설정</Link>
                </nav>
            </header>
            <main className="content-area">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
