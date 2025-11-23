import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SIPMSLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const ROLE_REDIRECTS = {
            ADMIN: '/main/admindashboard',
            MINEDUC: '/main/predictions/mineduc',
            DISTRICT: '/main/districtdashboard',
            UMURENGE: '/main/umurengedashboard',
            SCHOOL: '/main/school/additionalinfo',
        };

        try {
            const result = await authService.login(email, password);

            if (result.success) {
                toast.success("Login Successful");
                const userRole = result.data.role;
                const redirectPath = ROLE_REDIRECTS[userRole];

                navigate(redirectPath);
            } else {
                toast.error("Incorrect username or password!");
                console.error('Login failed:', result.message);
            }
        } catch (error) {
            toast.error('An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4" style={{ fontFamily: 'Tw Cen MT' }}>
            <div className="w-full max-w-6xl flex items-center justify-between">
                <div className="hidden lg:block lg:w-1/2 text-white pr-16">
                    <div className="flex items-center space-x-3 mb-16">
                        <div className="w-20 h-12 rounded-lg flex items-center justify-center">
                            <img src="/public/images/planinglogo.png" alt="SIPMS Logo" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Tw Cen MT' }}>SIPMS</h1>
                        </div>
                    </div>
                    <h2 className="text-5xl font-bold leading-tight mb-6" style={{ fontFamily: 'Tw Cen MT' }}>
                        We make digital products that drive you to stand out.
                    </h2>
                    <p className="text-lg text-blue-100 mb-12" style={{ fontFamily: 'Tw Cen MT' }}>
                        Plan, manage, and expand school infrastructure to create optimal learning environments for every student.
                    </p>
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    </div>
                </div>

                <div className="w-full lg:w-auto lg:min-w-[440px]">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl p-10">
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900">SIPMS</span>
                            </div>
                        </div>

                        <div className="mb-6 text-center">
                            <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Tw Cen MT' }}>Welcome Back 👋</h2>
                            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Tw Cen MT' }}>
                                Please login to your <span className="font-semibold text-blue-600" >SIPMS</span> account to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div>
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-1" style={{ fontFamily: 'Tw Cen MT' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                    style={{ fontFamily: 'Tw Cen MT' }}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-gray-700 font-medium mb-1" style={{ fontFamily: 'Tw Cen MT' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your password"
                                        required
                                        disabled={isLoading}
                                        style={{ fontFamily: 'Tw Cen MT' }}

                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        style={{ fontFamily: 'Tw Cen MT' }}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                                style={{ fontFamily: 'Tw Cen MT' }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    'Log in now'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-gray-500 text-sm" >
                            <p style={{ fontFamily: 'Tw Cen MT' }}>© 2025 SIPMS System. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
