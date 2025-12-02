import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Home, Users, User, List, FileCheck, PlusCircle, School, BarChart3, ClipboardList, PlusSquare, FilePlus, FileText, Bell, Menu, X, Search, ChevronDown, LogOut, ChevronUp, FolderOpen, DollarSign, PieChart, Plus } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentUser, authService } from '../../api';

const Layout = ({ activePage, onPageChange }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenuItem, setActiveMenuItem] = useState(activePage || '/dashboard/overview');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();


    const menuConfig = [

        {
            name: "Dashboard",
            icon: <Bell className="w-5 h-5" />,
            path: "/main/admindashboard",
            roles: ["admin"],
        },
        {
            name: "Dashboard",
            icon: <Bell className="w-5 h-5" />,
            path: "/main/districtdashboard",
            roles: ["district"],
        },
        {
            name: "Dashboard",
            icon: <Bell className="w-5 h-5" />,
            path: "/main/umurengedashboard",
            roles: ["umurenge"],
        },
        {
            name: "User Management",
            icon: <User className="w-5 h-5" />,
            path: "/main/users/list",
            roles: ["admin", "umurenge"],
            hasSubItems: true,
            subItems: [
                {
                    name: "User List",
                    icon: <List className="w-4 h-4" />,
                    path: "/main/users/list",
                    roles: ["admin", "umurenge"],
                },
                {
                    name: "Add User",
                    icon: <PlusCircle className="w-4 h-4" />,
                    path: "/main/users/add",
                    roles: ["admin", "umurenge"],
                },
            ],
        },
        {
            name: "Schools",
            icon: <School className="w-5 h-5" />,
            path: "/main/schools/list",
            roles: ["admin", "umurenge", "school", "district"],
            hasSubItems: true,
            subItems: [
                {
                    name: "Schools List",
                    icon: <ClipboardList className="w-4 h-4" />,
                    path: "/main/schools/list",
                    roles: ["admin", "umurenge", "district"],
                },
                {
                    name: "Schools Add Info",
                    icon: <FilePlus className="w-4 h-4" />,
                    path: "/main/school/additionalinfo",
                    roles: ["school"],
                },
                {
                    name: "Schools Predictions",
                    icon: <BarChart3 className="w-4 h-4" />,
                    path: "/main/school/prictions/list",
                    roles: ["school"],
                },
            ],
        },
        {
            name: "Predictions",
            icon: <BarChart3 className="w-5 h-5" />,
            path: "/main/predictions/list",
            roles: ["admin", "umurenge", "district"],
            hasSubItems: true,
            subItems: [
                {
                    name: "Predictions List",
                    icon: <ClipboardList className="w-4 h-4" />,
                    path: "/main/predictions/list",
                    roles: ["admin", "umurenge", "district"],
                },
                {
                    name: "Add Prediction",
                    icon: <PlusSquare className="w-4 h-4" />,
                    path: "/main/predictions/add",
                    roles: ["admin", "umurenge"],
                },
                {
                    name: "Prediction",
                    icon: <FilePlus className="w-4 h-4" />,
                    path: "/main/predictions/district/add",
                    roles: ["admin", "district"],
                },
                {
                    name: "Predictions Documents",
                    icon: <FileText className="w-4 h-4" />,
                    path: "/main/predictions/doc",
                    roles: ["admin", "district"],
                },
            ]
        },
        {
            name: "MINEDUC Reviews",
            icon: <FileCheck className="w-4 h-4" />,
            path: "/main/predictions/mineduc",
            roles: ["admin", "mineduc"],
        },

        {
            name: "Notifications",
            icon: <Bell className="w-5 h-5" />,
            path: "/main/notification/list",
            roles: ["admin", "district", "umurenge", "mineduc"],
        },
    ];

    const getUserData = () => {

        try {
            const storedUserData = getCurrentUser();
            if (!storedUserData) {
                console.warn("No user data found. Redirecting to landing page...");
                navigate("/");
                return null;
            }
            return {
                first_name: storedUserData.first_name || 'Gym',
                last_name: storedUserData.last_name || 'Owner',
                email: storedUserData.email || 'owner@gymflow.rw',
                role: storedUserData.role || 'Admin',
                user_type: storedUserData.role?.toLowerCase() || 'admin'
            };

        } catch (error) {
            console.error('Error getting user data:', error);
            navigate("/");
            return null;
        }
    };


    const getFilteredMenuItems = (userData) => {
        if (!userData) return [];

        const userRole = userData.role?.toLowerCase();

        return menuConfig.filter(item => {
            const hasAccess = item.roles.some(role => role.toLowerCase() === userRole);
            if (!hasAccess) return false;

            if (item.hasSubItems) {
                const filteredSubItems = item.subItems.filter(subItem =>
                    subItem.roles.some(role => role.toLowerCase() === userRole)
                );
                return filteredSubItems.length > 0;
            }

            return true;
        }).map(item => {
            if (item.hasSubItems) {
                const filteredSubItems = item.subItems.filter(subItem =>
                    subItem.roles.some(role => role.toLowerCase() === userRole)
                );
                return { ...item, subItems: filteredSubItems };
            }
            return item;
        });
    };

    useEffect(() => {
        const user = getUserData();
        setUserData(user);

    }, []);

    const menuItems = useMemo(() =>
        getFilteredMenuItems(userData),
        [userData]
    );

    const handleMenuClick = (path, hasSubItems = false) => {
        if (hasSubItems) {
            setExpandedMenus(prev => ({
                ...prev,
                [path]: !prev[path]
            }));
        } else {
            setActiveMenuItem(path);
            if (onPageChange) {
                const pageId = path.split('/').pop();
                onPageChange(pageId);
            }
            window.location.href = path;
        }
    };

    const handleSubMenuClick = (path) => {
        setActiveMenuItem(path);
        if (onPageChange) {
            const pageId = path.split('/').pop();
            onPageChange(pageId);
        }
        window.location.href = path;
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast.success('Logged out successfully');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error logging out');
        }
    };

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading GymFlow Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                        <img src='/public/Images/planinglogo.png' className='w-13' alt="GymFlow Logo" />
                        <div className="ml-3">
                            <h1 className="text-lg font-bold text-gray-900">SIPMS</h1>
                            <p className="text-xs text-gray-500">Management System</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="px-4 py-6 space-y-2 h-[calc(100vh-64px)] overflow-auto">
                    {menuItems.map((item, index) => (
                        <div key={`${item.path}-${index}`} className="space-y-1">
                            <button
                                onClick={() => handleMenuClick(item.path, item.hasSubItems)}
                                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left
                  transition-all duration-200 group
                  ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem)))
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }
                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`
                    transition-colors duration-200
                    ${(activeMenuItem === item.path || (item.subItems && item.subItems.some(sub => sub.path === activeMenuItem)))
                                            ? 'text-blue-600'
                                            : 'text-gray-500 group-hover:text-gray-700'
                                        }
                  `}>
                                        {item.icon}
                                    </div>
                                    <span className="font-medium text-sm">
                                        {item.name}
                                    </span>
                                </div>
                                {item.hasSubItems && (
                                    <ChevronDown className={`
                    w-4 h-4 text-gray-400 transition-transform duration-200
                    ${expandedMenus[item.path] ? 'rotate-180' : ''}
                  `} />
                                )}
                            </button>
                            {item.hasSubItems && expandedMenus[item.path] && (
                                <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                    {item.subItems.map((subItem, subIndex) => (
                                        <button
                                            key={`${subItem.path}-${subIndex}`}
                                            onClick={() => handleSubMenuClick(subItem.path)}
                                            className={`
                        w-full flex items-center px-3 py-2 rounded-md text-left
                        transition-all duration-200 group
                        ${activeMenuItem === subItem.path
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }
                      `}
                                        >
                                            <div className={`
                        mr-3 transition-colors duration-200
                        ${activeMenuItem === subItem.path
                                                    ? 'text-blue-600'
                                                    : 'text-gray-400 group-hover:text-gray-600'
                                                }
                      `}>
                                                {subItem.icon}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {subItem.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
                <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="relative hidden md:flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                    placeholder="Search Users, Schools, Predictions..."
                                />
                            </div>
                            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                                <span>SIPMS</span>
                                <span>/</span>
                                <span className="text-gray-900 font-medium">
                                    {(() => {
                                        const mainItem = menuItems.find(item => item.path === activeMenuItem);
                                        if (mainItem) return mainItem.name;
                                        for (const item of menuItems) {
                                            if (item.subItems) {
                                                const subItem = item.subItems.find(sub => sub.path === activeMenuItem);
                                                if (subItem) return `${item.name} / ${subItem.name}`;
                                            }
                                        }
                                        return 'Dashboard';
                                    })()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                                </button>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-3 pl-3 pr-2 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-900 rounded-xl flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {userData?.first_name?.[0]?.toUpperCase()}{userData?.last_name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="font-medium text-gray-900">
                                            {userData?.first_name} {userData?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">{userData?.role}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-medium text-gray-900">
                                                {userData?.first_name} {userData?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">{userData?.email}</p>
                                            <p className="text-xs text-blue-600 font-medium">{userData?.role}</p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    navigate('/main/users/views/profile');
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                User Profile
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    navigate('/main/users/profile');
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                Update Profile
                                            </button>

                                        </div>
                                        <div className="border-t border-gray-100 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="py-6 px-6 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
