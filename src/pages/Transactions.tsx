
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/Authcontext";
import Navbar from "@/components/Navbar";
import TransactionList, { Transaction } from "@/components/TransactionList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Transactions = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month" | "year">("month");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      generateMockTransactions();
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, timeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      generateMockTransactions();
      setRefreshing(false);
      toast.success("Transactions refreshed!");
    }, 1500);
  };

  const generateMockTransactions = () => {
    // Generate mock transactions
    const mockCategories = ["Food & Dining", "Shopping", "Housing", "Transportation", "Travel", "Coffee", "Other"];
    const mockMerchants = [
      "Amazon", "Walmart", "Target", "Starbucks", "Uber", "Netflix", 
      "Spotify", "Apple", "Rent", "Electric Company", "Gas Station",
      "Grocery Store", "Restaurant", "Gym"
    ];
    const mockAccounts = ["Checking Account", "Savings Account", "Credit Card"];
    
    // Determine date range based on filter
    const now = new Date();
    let startDate = new Date();
    
    if (timeFilter === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeFilter === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeFilter === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 3); // "all" - use 3 years for demo
    }
    
    const dayRange = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate more transactions for longer time periods
    const transactionCount = timeFilter === "week" ? 20 : 
                            timeFilter === "month" ? 50 : 
                            timeFilter === "year" ? 100 : 150;
    
    const newTransactions = Array.from({ length: transactionCount }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * dayRange));
      
      const type = Math.random() > 0.7 
        ? "income" 
        : Math.random() > 0.2 ? "expense" : "transfer";
      
      const amount = type === "income"
        ? Math.floor(Math.random() * 2000) + 500
        : type === "expense"
        ? -(Math.floor(Math.random() * 200) + 10)
        : Math.random() > 0.5 
          ? Math.floor(Math.random() * 500) + 100
          : -(Math.floor(Math.random() * 500) + 100);
      
      return {
        id: `trans-${i}`,
        date: date.toISOString(),
        merchant: mockMerchants[Math.floor(Math.random() * mockMerchants.length)],
        amount,
        category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
        type: type as "income" | "expense" | "transfer",
        account: mockAccounts[Math.floor(Math.random() * mockAccounts.length)]
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(newTransactions);
  };
  
  const handleExport = () => {
    toast.success("Transactions exported successfully!");
  };
  
  // Calculate transaction stats
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0));
    
  const totalTransactions = transactions.length;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">Transactions</h1>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      {timeFilter === "week" ? "This Week" : 
                       timeFilter === "month" ? "This Month" :
                       timeFilter === "year" ? "This Year" : "All Time"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTimeFilter("week")}>
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeFilter("month")}>
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeFilter("year")}>
                      This Year
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeFilter("all")}>
                      All Time
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                
                <Button
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </div>
            </div>
            
            {/* Transaction Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription>Total Transactions</CardDescription>
                  <CardTitle className="text-2xl">
                    {loading ? (
                      <div className="h-8 w-16 rounded shimmer"></div>
                    ) : (
                      totalTransactions
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription>Total Income</CardDescription>
                  <CardTitle className="text-2xl text-green-600">
                    {loading ? (
                      <div className="h-8 w-28 rounded shimmer"></div>
                    ) : (
                      formatCurrency(totalIncome)
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription>Total Expenses</CardDescription>
                  <CardTitle className="text-2xl text-red-600">
                    {loading ? (
                      <div className="h-8 w-28 rounded shimmer"></div>
                    ) : (
                      formatCurrency(totalExpenses)
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            {/* Transactions List */}
            <TransactionList 
              transactions={transactions} 
              loading={loading}
              className="mb-6"
            />
            
            {!loading && transactions.length > 0 && (
              <div className="flex justify-center">
                <Button variant="outline" size="sm">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Transactions;
