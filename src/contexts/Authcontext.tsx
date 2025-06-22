import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { useToast } from "@/components/ui/use-toast"; // Adjust path as needed

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  hasBankConnection: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setBankConnection: (status: boolean) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasBankConnection, setHasBankConnection] = useState(false);
  const navigate = useNavigate();

  // Initialize state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedBankConnection = localStorage.getItem("hasBankConnection");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setHasBankConnection(storedBankConnection === "true");
        } catch (error) {
          console.error("Failed to initialize auth state", error);
          logout();
        }
      }
    };

    initializeAuth();
  }, []);

  const setBankConnection = useCallback((status: boolean) => {
    setHasBankConnection(status);
    localStorage.setItem("hasBankConnection", status.toString());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      // Always redirect to connect-bank first
      navigate("/connect-bank");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [navigate]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await apiRegister(name, email, password);
      
      if (!response?.access_token || !response?.user) {
        throw new Error('Registration succeeded but login failed');
      }
  
      setUser(response.user);
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/connect-bank");
    } catch (error) {
      console.error("Registration failed:", error);
      // Check if registration actually succeeded but login failed
      if (error.message.includes('Registration succeeded')) {
        toast({
          title: "Registration successful",
          description: "Please login with your new account",
        });
        navigate("/login");
      } else {
        throw error;
      }
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setHasBankConnection(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasBankConnection");
    navigate("/login");
  }, [navigate]);

  const value = {
    user,
    token,
    hasBankConnection,
    login,
    register,
    logout,
    setBankConnection,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};