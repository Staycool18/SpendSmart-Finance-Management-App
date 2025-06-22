import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/Authcontext';  // Changed to useAuth hook
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = ({ className }: { className?: string }) => {
  const { isAuthenticated, logout } = useAuth();  // Using logout from context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();  // Using the logout function from auth context
    navigate("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="mr-2 h-4 w-4" /> },
    { href: "/transactions", label: "Transactions", icon: <CreditCard className="mr-2 h-4 w-4" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart className="mr-2 h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="mr-2 h-4 w-4" /> },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 z-40 w-full glass backdrop-blur-md border-b border-slate-200/20",
        className
      )}
    >
      {/* ... rest of your JSX remains exactly the same ... */}
    </nav>
  );
};

export default Navbar;