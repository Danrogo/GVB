import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import type { Theme } from '../types';

const Navbar = () => {
    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('gvb_theme') as Theme) || 'light';
    });
    const [scrolled, setScrolled] = useState(false);

    // Apply theme to <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gvb_theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () =>
        setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/services', label: 'Services' },
        ...(isAuthenticated
            ? [
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/book', label: 'Book Now' },
                { to: '/notifications', label: 'Notifications' },
                { to: '/tickets', label: 'Support' },
                ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
            ]
            : []),
    ];

    return (
        <nav
            className={`navbar fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
                    ? 'bg-base-100/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
                }`}
        >
            <div className="navbar-start">
                {/* Mobile drawer */}
                <div className="dropdown lg:hidden">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </button>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[999] p-3 shadow-2xl bg-base-100 rounded-2xl w-56 border border-base-200">
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `rounded-xl font-medium ${isActive ? 'bg-primary text-primary-content' : ''}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 ml-1">
                    <div className="w-9 h-9 rounded-xl gvb-gradient flex items-center justify-center text-white font-bold text-lg shadow-md">
                        💅
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-display font-bold text-primary leading-tight text-lg">
                            Good Vibes
                        </p>
                        <p className="text-[10px] text-base-content/50 uppercase tracking-wider leading-none">
                            Beauty Salon
                        </p>
                    </div>
                </Link>
            </div>

            {/* Desktop nav */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal gap-1 px-1">
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) =>
                                    `rounded-xl font-medium text-sm transition-all px-4 ${isActive
                                        ? 'bg-primary text-primary-content'
                                        : 'hover:bg-base-200'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="navbar-end gap-2">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="btn btn-ghost btn-circle btn-sm"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                </button>

                {isAuthenticated ? (
                    <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                        </button>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[999] p-3 shadow-2xl bg-base-100 rounded-2xl w-52 border border-base-200">
                            <li className="menu-title px-2 py-1 text-xs text-base-content/50">
                                {user?.firstName} {user?.lastName}
                            </li>
                            <li><Link to="/profile" className="rounded-xl">Profile</Link></li>
                            {isAdmin && <li><Link to="/admin" className="rounded-xl text-warning">Admin Panel</Link></li>}
                            <li>
                                <button onClick={handleLogout} className="rounded-xl text-error">
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="btn btn-ghost btn-sm rounded-xl font-medium">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-primary btn-sm rounded-xl font-semibold shadow-md">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
