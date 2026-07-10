import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerApi } from '../api/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { showNotification } from '../features/notification/notificationSlice';

const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'guest' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, phone: digitsOnly });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(form.phone)) {
      dispatch(showNotification({ message: 'Enter a valid 10-digit Indian mobile number', type: 'error' }));
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(form);
      dispatch(setCredentials(res.data.data));
      dispatch(showNotification({ message: 'Account created successfully', type: 'success' }));
      navigate('/');
    } catch (err) {
      dispatch(showNotification({
        message: err.response?.data?.message || 'Registration failed',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
          <p className="text-muted text-sm mt-1 font-sans">Join LuxeLodging as a guest or host</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
            <input
              type="text" name="name" required value={form.name} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Amulya Gupta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email" name="email" required value={form.email} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Phone</label>
            <input
              type="tel" name="phone" required value={form.phone} onChange={handlePhoneChange}
              maxLength={10} inputMode="numeric"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password" name="password" required minLength={6} value={form.password} onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">I want to</label>
            <div className="flex gap-3">
              <label className={`flex-1 text-center py-2 rounded-md border cursor-pointer font-sans text-sm ${form.role === 'guest' ? 'bg-primary text-white border-primary' : 'border-border text-ink'}`}>
                <input type="radio" name="role" value="guest" checked={form.role === 'guest'} onChange={handleChange} className="hidden" />
                Book stays
              </label>
              <label className={`flex-1 text-center py-2 rounded-md border cursor-pointer font-sans text-sm ${form.role === 'host' ? 'bg-primary text-white border-primary' : 'border-border text-ink'}`}>
                <input type="radio" name="role" value="host" checked={form.role === 'host'} onChange={handleChange} className="hidden" />
                Host my place
              </label>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4 font-sans">
          Already have an account? <Link to="/login" className="text-primary font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;