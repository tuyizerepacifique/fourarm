import { useState, useEffect } from "react";
import { 
  Menu, 
  Home, 
  Wallet, 
  CheckSquare, 
  Megaphone, 
  Settings, 
  Sun, 
  Moon, 
  LogOut,
  User,
  UserCog
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/contributions", label: "Contributions", icon: Wallet },
  { to: "/investments", label: "Investments", icon: CheckSquare },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/user-management", label: "User Management", icon: UserCog, admin: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }) {
  const [open, setOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    // Debug: Check available routes
    console.log('Available navigation routes:', nav.filter(i => !i.admin || isAdmin).map(item => item.to));
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container flex h-14 items-center justify-between">
          <button 
            onClick={() => setOpen(!open)} 
            aria-label="Toggle navigation" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h1 className="font-semibold">4Arms Family Portal</h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {currentUser?.firstName || currentUser?.email}
                </span>
              </button>
              
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container grid grid-cols-12 gap-6 py-6">
        {/* Sidebar */}
        {open && (
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <nav className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 border border-gray-200 dark:border-gray-700">
              {nav
                .filter(i => !i.admin || isAdmin)
                .map(({ to, label, icon: Icon }) => (
                  <NavLink 
                    key={to} 
                    to={to}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isActive 
                          ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium" 
                          : "text-gray-600 dark:text-gray-300"
                      }`
                    }
                    onClick={() => window.innerWidth < 768 && setOpen(false)}
                  >
                    <Icon className="w-5 h-5" /> 
                    <span>{label}</span>
                  </NavLink>
                ))}
            </nav>
          </aside>
        )}
        
        {/* Main Content */}
        <main className={`${open ? "col-span-12 md:col-span-9 lg:col-span-10" : "col-span-12"}`}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  ); 
}