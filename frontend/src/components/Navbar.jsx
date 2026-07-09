import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { logoutApi } from '../api/authApi';
import { showNotification } from '../features/notification/notificationSlice';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // even if API call fails, clear local session
    }
    dispatch(logout());
    dispatch(showNotification({ message: 'Logged out successfully', type: 'success' }));
    navigate('/login');
  };

  return (
    <nav className="border-b border-border bg-paper px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-display text-2xl font-semibold text-primary">
        LuxeLodging
      </Link>

      <div className="flex items-center gap-4 font-sans text-sm">
        {isAuthenticated ? (
          <>
            <Link
              to={user?.role === 'host' ? '/dashboard/host' : '/dashboard/guest'}
              className="text-ink hover:text-primary"
            >
              {user?.role === 'host' ? 'My Listings' : 'My Bookings'}
            </Link>
            <span className="text-ink">
              Hi, <span className="font-medium">{user?.name}</span>
              <span className="ml-1 text-xs text-muted uppercase font-mono">({user?.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-md border border-border text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-ink hover:text-primary">Login</Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;