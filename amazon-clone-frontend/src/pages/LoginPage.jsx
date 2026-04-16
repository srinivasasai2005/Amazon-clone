import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-background flex flex-col items-center pt-8">
      <Link to="/" className="flex items-center mb-6">
        <ShoppingCart className="w-8 h-8 text-amazon-yellow mr-2" />
        <span className="text-3xl font-bold text-gray-900">Amazon.in</span>
      </Link>

      <div className="w-[350px] bg-white border border-gray-300 rounded-md p-6">
        <h1 className="text-[28px] font-normal mb-4">Sign in</h1>
        
        {error && (
          <div className="mb-4 text-[#c40000] text-sm">
            <i>!</i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-[13px] font-bold mb-1">Email or mobile phone number</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-bold mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#f0c14b] active:bg-[#f0c14b] border border-[#a88734] hover:bg-[#f4d078] rounded-[3px] py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.4)_inset]"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs mt-4">
          By continuing, you agree to Amazon's <span className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">Privacy Notice</span>.
        </p>

        <div className="mt-6">
          <div className="relative text-center border-b border-gray-300 mt-2 mb-4 leading-[0.1em]">
            <span className="bg-white px-2 text-xs text-gray-500">New to Amazon?</span>
          </div>
          <Link to={`/signup${location.search}`} className="block text-center w-full bg-[#e7e9ec] active:bg-[#d9dce1] border border-[#adb1b8] hover:bg-[#e7e9ec] rounded-[3px] py-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
            Create your Amazon account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
