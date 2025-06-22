// src/pages/Dashboard.tsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/Authcontext";
import { getDashboardData } from "../api/auth";
import { DashboardData } from "../api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowUp, ArrowDown, IndianRupeeIcon, LogOut, Plus, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle, Calendar, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIFinancialInsights from "@/components/AIFinancialInsights";
import SmartPiggyBank from "@/components/SmartPiggyBank";

// Add utility function at the top level
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Update type definitions
type PeriodType = 'daily' | 'weekly' | 'monthly';

interface PeriodData {
  income: number;
  expenses: number;
  balance: number;
}

interface BankData {
  name: string;
  color: string;
  dailyData: PeriodData;
  weeklyData: PeriodData;
  monthlyData: PeriodData;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface Report {
  expenses: number;
  income: number;
  averageDailyExpense: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface Anomaly {
  type: 'spending_spike' | 'category_threshold' | 'credit_utilization';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

// Add category thresholds
const CATEGORY_THRESHOLDS: Record<string, number> = {
  'Shopping': 35,
  'Dining': 25,
  'Travel': 20,
  'Entertainment': 15,
  'Housing': 35,
  'Food': 25,
  'Transportation': 20,
  'Utilities': 20,
  'Other': 10
};

// Update the bank data interface
interface BankData {
  name: string;
  color: string;
  dailyData: PeriodData;
  weeklyData: PeriodData;
  monthlyData: PeriodData;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

// Update the bank data
const BANK_DATA: Record<string, BankData> = {
  'icici': {
    name: 'ICICI Bank',
    color: '#FF6B6B',
    dailyData: {
      income: 2000,
      expenses: 15000,
      balance: 300000
    },
    weeklyData: {
      income: 17500,
      expenses: 10570,
      balance: 255500
    },
    monthlyData: {
      income: 10000,
      expenses: 45080,
      balance: 250039
    },
    monthlyTrend: [
      { month: 'Jan', income: 60000, expenses: 42050 },
      { month: 'Feb', income: 70000, expenses: 39000 },
      { month: 'Mar', income: 75000, expenses: 26000 },
      { month: 'Apr', income: 72000, expenses: 41000 },
      { month: 'May', income: 76000, expenses: 47000 },
      { month: 'Jun', income: 75000, expenses: 45000 },
    ],
    categoryDistribution: [
      { category: 'Housing', value: 15000, percentage: 35 },
      { category: 'Food', value: 8000, percentage: 27 },
      { category: 'Transportation', value: 5000, percentage: 25 },
      { category: 'Entertainment', value: 7000, percentage: 16 },
      { category: 'Utilities', value: 10000, percentage: 45 },
    ],
    totalBalance: 250000,
    monthlyIncome: 75000,
    monthlyExpenses: 45000
  },
  'sbi': {
    name: 'State Bank of India',
    color: '#4ECDC4',
    dailyData: {
      income: 2550,
      expenses: 1220,
      balance: 1500
    },
    weeklyData: {
      income: 15000,
      expenses: 8090,
      balance: 18000
    },
    monthlyData: {
      income: 60000,
      expenses: 38000,
      balance: 120000
    },
    monthlyTrend: [
      { month: 'Jan', income: 60000, expenses: 30000 },
      { month: 'Feb', income: 62000, expenses: 33000 },
      { month: 'Mar', income: 65000, expenses: 38000 },
      { month: 'Apr', income: 68000, expenses: 35000 },
      { month: 'May', income: 67000, expenses: 36500 },
      { month: 'Jun', income: 65000, expenses: 30000 }
    ],
    categoryDistribution: [
      { category: 'Housing', value: 12000, percentage: 35 },
      { category: 'Food', value: 7000, percentage: 20 },
      { category: 'Transportation', value: 4000, percentage: 15 },
      { category: 'Entertainment', value: 6000, percentage: 27 },
      { category: 'Utilities', value: 6000, percentage: 11 }
    ],
    totalBalance: 180000,
    monthlyIncome: 65000,
    monthlyExpenses: 35000
  },
  'hdfc': {
    name: 'HDFC Bank',
    color: '#45B7D1',
    dailyData: {
      income: 3000,
      expenses: 2000,
      balance: 3200
    },
    weeklyData: {
      income: 20000,
      expenses: 14000,
      balance: 35000
    },
    monthlyData: {
      income: 75000,
      expenses: 55500,
      balance: 420000
    },
    monthlyTrend: [
      { month: 'Jan', income: 80000, expenses: 52000 },
      { month: 'Feb', income: 82000, expenses: 53000 },
      { month: 'Mar', income: 85000, expenses: 55000 },
      { month: 'Apr', income: 93000, expenses: 54000 },
      { month: 'May', income: 87000, expenses: 56000 },
      { month: 'Jun', income: 90000, expenses: 55000 },
    ],
    categoryDistribution: [
      { category: 'Housing', value: 18000, percentage: 13 },
      { category: 'Food', value: 10000, percentage: 48 },
      { category: 'Transportation', value: 7000, percentage: 33 },
      { category: 'Entertainment', value: 9000, percentage: 16 },
      { category: 'Utilities', value: 11000, percentage: 20 },
    ],
    totalBalance: 320000,
    monthlyIncome: 85000,
    monthlyExpenses: 55000
  },
  'citi': {
    name: 'Citibank',
    color: '#96CEB4',
    dailyData: {
      income: 3500,
      expenses: 2500,
      balance: 500
    },
    weeklyData: {
      income: 22000,
      expenses: 15000,
      balance: 350000
    },
    monthlyData: {
      income: 95000,
      expenses: 65000,
      balance: 450500
    },
    monthlyTrend: [
      { month: 'Jan', income: 90000, expenses: 62000 },
      { month: 'Feb', income: 92000, expenses: 63000 },
      { month: 'Mar', income: 95000, expenses: 65000 },
      { month: 'Apr', income: 93000, expenses: 64000 },
      { month: 'May', income: 97000, expenses: 66000 },
      { month: 'Jun', income: 95000, expenses: 65000 },
    ],
    categoryDistribution: [
      { category: 'Housing', value: 20000, percentage: 31 },
      { category: 'Food', value: 12000, percentage: 18 },
      { category: 'Transportation', value: 8000, percentage: 12 },
      { category: 'Entertainment', value: 11000, percentage: 17 },
      { category: 'Utilities', value: 14000, percentage: 22 },
    ],
    totalBalance: 450000,
    monthlyIncome: 95000,
    monthlyExpenses: 65000
  },
  // Credit Card Data
  'axis-credit': {
    name: 'Axis Neo Credit Card',
    color: '#FF9F1C',
    dailyData: {
      income: 0,
      expenses: 800,
      balance: -500
    },
    weeklyData: {
      income: 0,
      expenses: 5600,
      balance: -1000
    },
    monthlyData: {
      income: 0,
      expenses: 25000,
      balance: -15000
    },
    monthlyTrend: [
      { month: 'Jan', income: 0, expenses: 22000 },
      { month: 'Feb', income: 0, expenses: 25000 },
      { month: 'Mar', income: 0, expenses: 25000 },
      { month: 'Apr', income: 0, expenses: 23000 },
      { month: 'May', income: 0, expenses: 26000 },
      { month: 'Jun', income: 0, expenses: 25000 }
    ],
    categoryDistribution: [
      { category: 'Shopping', value: 8000, percentage: 32 },
      { category: 'Dining', value: 6000, percentage: 24 },
      { category: 'Travel', value: 5000, percentage: 20 },
      { category: 'Entertainment', value: 4000, percentage: 16 },
      { category: 'Other', value: 2000, percentage: 8 }
    ],
    totalBalance: -15000,
    monthlyIncome: 0,
    monthlyExpenses: 800
  },
  'amex': {
    name: 'American Express Card',
    color: '#2EC4B6',
    dailyData: {
      income: 0,
      expenses: 1200,
      balance: -25000
    },
    weeklyData: {
      income: 0,
      expenses: 8400,
      balance: -25000
    },
    monthlyData: {
      income: 0,
      expenses: 35000,
      balance: -25000
    },
    monthlyTrend: [
      { month: 'Jan', income: 0, expenses: 32000 },
      { month: 'Feb', income: 0, expenses: 34000 },
      { month: 'Mar', income: 0, expenses: 35000 },
      { month: 'Apr', income: 0, expenses: 33000 },
      { month: 'May', income: 0, expenses: 36000 },
      { month: 'Jun', income: 0, expenses: 35000 }
    ],
    categoryDistribution: [
      { category: 'Travel', value: 12000, percentage: 34 },
      { category: 'Dining', value: 9000, percentage: 26 },
      { category: 'Shopping', value: 8000, percentage: 23 },
      { category: 'Entertainment', value: 4000, percentage: 11 },
      { category: 'Other', value: 2000, percentage: 6 }
    ],
    totalBalance: -25000,
    monthlyIncome: 0,
    monthlyExpenses: 1200
  },
  'mastercard': {
    name: 'MasterCard',
    color: '#FF6B6B',
    dailyData: {
      income: 0,
      expenses: 900,
      balance: -100
    },
    weeklyData: {
      income: 0,
      expenses: 6300,
      balance: -1500
    },
    monthlyData: {
      income: 0,
      expenses: 28000,
      balance: -18000
    },
    monthlyTrend: [
      { month: 'Jan', income: 0, expenses: 25000 },
      { month: 'Feb', income: 0, expenses: 27000 },
      { month: 'Mar', income: 0, expenses: 28000 },
      { month: 'Apr', income: 0, expenses: 26000 },
      { month: 'May', income: 0, expenses: 29000 },
      { month: 'Jun', income: 0, expenses: 28000 }
    ],
    categoryDistribution: [
      { category: 'Shopping', value: 10000, percentage: 36 },
      { category: 'Dining', value: 7000, percentage: 25 },
      { category: 'Travel', value: 6000, percentage: 41 },
      { category: 'Entertainment', value: 3000, percentage: 11 },
      { category: 'Other', value: 2000, percentage: 7 }
    ],
    totalBalance: -18000,
    monthlyIncome: 0,
    monthlyExpenses: 900
  },
  'visa': {
    name: 'VISA Credit Card',
    color: '#1A535C',
    dailyData: {
      income: 0,
      expenses: 1000,
      balance: -800
    },
    weeklyData: {
      income: 0,
      expenses: 7000,
      balance: -2000
    },
    monthlyData: {
      income: 0,
      expenses: 30000,
      balance: -20000
    },
    monthlyTrend: [
      { month: 'Jan', income: 0, expenses: 27000 },
      { month: 'Feb', income: 0, expenses: 29000 },
      { month: 'Mar', income: 0, expenses: 30000 },
      { month: 'Apr', income: 0, expenses: 28000 },
      { month: 'May', income: 0, expenses: 31000 },
      { month: 'Jun', income: 0, expenses: 35000 }
    ],
    categoryDistribution: [
      { category: 'Shopping', value: 11000, percentage: 37 },
      { category: 'Dining', value: 8000, percentage: 27 },
      { category: 'Travel', value: 7000, percentage: 23 },
      { category: 'Entertainment', value: 2000, percentage: 7 },
      { category: 'Other', value: 2000, percentage: 6 }
    ],
    totalBalance: -20000,
    monthlyIncome: 0,
    monthlyExpenses: 1000
  }
};

// Update the anomaly detection function
const detectAnomalies = (bankInfo: BankData): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  const monthlyData = bankInfo.monthlyData;
  const monthlyTrend = bankInfo.monthlyTrend;
  const categories = bankInfo.categoryDistribution;

  // Check for spending spikes
  const avgMonthlyExpense = monthlyTrend.reduce((sum, month) => sum + month.expenses, 0) / monthlyTrend.length;
  if (monthlyData.expenses > avgMonthlyExpense * 1.2) {
    anomalies.push({
      type: 'spending_spike',
      severity: 'high',
      message: `Monthly expenses (${formatCurrency(monthlyData.expenses)}) are 20% above average (${formatCurrency(avgMonthlyExpense)})`
    });
  }

  // Check category thresholds
  categories.forEach(category => {
    const threshold = CATEGORY_THRESHOLDS[category.category] || 20;
    if (category.percentage > threshold) {
      anomalies.push({
        type: 'category_threshold',
        severity: 'medium',
        message: `${category.category} spending (${category.percentage}%) exceeds threshold of ${threshold}%`
      });
    }
  });

  // Check balance for credit cards (negative balance indicates credit utilization)
  if (monthlyData.balance < 0) {
    const creditLimit = Math.abs(monthlyData.balance) * 3; // Assuming credit limit is 3x the current balance
    const utilization = (Math.abs(monthlyData.balance) / creditLimit) * 100;
    if (utilization > 30) {
      anomalies.push({
        type: 'credit_utilization',
        severity: 'high',
        message: `Credit utilization is at ${utilization.toFixed(1)}%, recommended to keep below 30%`
      });
    }
  }

  return anomalies;
};

// Update the report generation function
const generateReport = (bankInfo: BankData, period: PeriodType): Report => {
  const periodData = period === 'daily' ? bankInfo.dailyData :
                    period === 'weekly' ? bankInfo.weeklyData :
                    bankInfo.monthlyData;
  const categories = bankInfo.categoryDistribution;

  return {
    expenses: periodData.expenses,
    income: periodData.income,
    averageDailyExpense: periodData.expenses / (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30),
    categoryBreakdown: categories.map(cat => ({
      category: cat.category,
      amount: (cat.percentage / 100) * periodData.expenses,
      percentage: cat.percentage
    }))
  };
};

// Update the anomaly title rendering
const getAnomalyTitle = (type: Anomaly['type']) => {
  switch (type) {
    case 'spending_spike':
      return 'Spending Spike';
    case 'category_threshold':
      return 'Category Threshold Exceeded';
    case 'credit_utilization':
      return 'High Credit Utilization';
    default:
      return 'Alert';
  }
};

// Update the financial metrics calculation
const calculateMetrics = (bankInfo: BankData, periodType: PeriodType) => {
  const periodData = periodType === 'daily' ? bankInfo.dailyData :
                    periodType === 'weekly' ? bankInfo.weeklyData :
                    bankInfo.monthlyData;

  const monthlyData = bankInfo.monthlyData;
  const monthlyTrend = bankInfo.monthlyTrend;
  const currentMonth = monthlyTrend[monthlyTrend.length - 1];
  const previousMonth = monthlyTrend[monthlyTrend.length - 2];

  return {
    currentPeriod: {
      income: periodData.income,
      expenses: periodData.expenses,
      balance: periodData.balance,
      savingsRate: periodData.income > 0 
        ? ((periodData.income - periodData.expenses) / periodData.income) * 100 
        : 0
    },
    monthlyComparison: {
      incomeChange: previousMonth
        ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
        : 0,
      expenseChange: previousMonth
        ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
        : 0
    },
    categoryBreakdown: bankInfo.categoryDistribution.map(cat => ({
      category: cat.category,
      amount: (cat.percentage / 100) * monthlyData.expenses,
      percentage: cat.percentage
    }))
  };
};

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  const [error, setError] = useState<string | null>(null);
  const [adjustedExpenses, setAdjustedExpenses] = useState<number | null>(null);

  // Get bank ID from location state with fallback to 'sbi'
  const bankId = location.state?.bankId || 'sbi';
  const bankInfo = BANK_DATA[bankId as keyof typeof BANK_DATA] || BANK_DATA['sbi'];

  // Get period-specific data and metrics
  const metrics = calculateMetrics(bankInfo, periodType);

  // Handle expense updates from SmartPiggyBank
  const handleExpenseUpdate = (newExpense: number) => {
    setAdjustedExpenses(newExpense);
  };

  // Use adjusted expenses if available
  const currentExpenses = adjustedExpenses !== null ? adjustedExpenses : metrics.currentPeriod.expenses;

  // Generate report
  const report = generateReport(bankInfo, periodType);

  // Detect anomalies
  const anomalies = detectAnomalies(bankInfo);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        
        // Use bank-specific data
        const data = {
          welcome_message: `Welcome to ${bankInfo.name}`,
          stats: {
            total_balance: bankInfo.monthlyData.balance,
            monthly_income: bankInfo.monthlyData.income,
            monthly_expenses: bankInfo.monthlyData.expenses
          },
          monthly_trend: bankInfo.monthlyTrend,
          category_distribution: bankInfo.categoryDistribution,
          recent_transactions: [
            {
              id: "1",
              date: new Date().toISOString(),
              description: bankInfo.monthlyData.income > 0 ? "Salary Deposit" : "Payment Due",
              amount: bankInfo.monthlyData.income > 0 ? bankInfo.monthlyData.income : -bankInfo.monthlyData.expenses,
              category: bankInfo.monthlyData.income > 0 ? "Income" : "Payment"
            },
            {
              id: "2",
              date: new Date().toISOString(),
              description: "Recent Transaction",
              amount: -bankInfo.categoryDistribution[0].value,
              category: bankInfo.categoryDistribution[0].category
            }
          ]
        };
        
        setDashboardData(data);
      } catch (error) {
        toast({
          title: "Error loading dashboard",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, toast, bankInfo]);

  const COLORS = [bankInfo.color, '#FFB347', '#FFCC33', '#66CC99', '#99CCFF'];

  // Function to get period-specific data
  const getPeriodData = (bankInfo: typeof BANK_DATA[keyof typeof BANK_DATA]) => {
    switch (periodType) {
      case 'daily':
        return bankInfo.dailyData;
      case 'weekly':
        return bankInfo.weeklyData;
      case 'monthly':
        return bankInfo.monthlyData;
      default:
        return bankInfo.monthlyData;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-8 w-40" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {dashboardData?.welcome_message || `Welcome back, ${user?.name}`}
          </h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/connect-bank")} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Bank
            </Button>
            <Button onClick={logout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title={
              <div className="flex items-center justify-between">
                <span>Total Balance</span>
                <Select
                  value={periodType}
                  onValueChange={(value: PeriodType) => setPeriodType(value)}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            value={metrics.currentPeriod.balance}
            icon={<IndianRupeeIcon className="h-5 w-5" />}
          />
          <StatCard 
            title={
              <div className="flex items-center justify-between">
                <span>Income</span>
                <Select
                  value={periodType}
                  onValueChange={(value: PeriodType) => setPeriodType(value)}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            value={metrics.currentPeriod.income}
            icon={<ArrowUp className="h-5 w-5 text-green-500" />}
            positive
          />
          <StatCard 
            title={
              <div className="flex items-center justify-between">
                <span>Expenses</span>
                <Select
                  value={periodType}
                  onValueChange={(value: PeriodType) => setPeriodType(value)}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            value={currentExpenses}
            icon={<ArrowDown className="h-5 w-5 text-red-500" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Financial Trends</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChartType('line')}
                    className={chartType === 'line' ? 'bg-blue-100' : ''}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChartType('bar')}
                    className={chartType === 'bar' ? 'bg-blue-100' : ''}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={bankInfo.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#22c55e" 
                        name="Income"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#ef4444" 
                        name="Expenses"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={bankInfo.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="income" fill="#22c55e" name="Income" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Expense Categories</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bankInfo.categoryDistribution}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bankInfo.categoryDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[
                            '#4FD1C5', // Housing - Teal
                            '#F6AD55', // Food - Orange
                            '#FC8181', // Transportation - Red
                            '#68D391', // Entertainment - Green
                            '#63B3ED'  // Utilities - Blue
                          ][index % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent_transactions && dashboardData.recent_transactions.length > 0 ? (
                dashboardData.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-medium ${
                      transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No transactions found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Financial Reports</CardTitle>
                <div className="flex gap-4">
                  <Select
                    value={periodType}
                    onValueChange={(value: PeriodType) => setPeriodType(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ReportSection bankInfo={bankInfo} periodType={periodType} setPeriodType={setPeriodType} />
            </CardContent>
          </Card>
        </div>

        {/* AI Financial Insights Section */}
        <div className="mb-8">
          <AIFinancialInsights bankInfo={bankInfo} />
        </div>

        {/* Smart Piggy Bank Section */}
        <div className="mb-8">
          <SmartPiggyBank 
            bankInfo={bankInfo} 
            onExpenseUpdate={handleExpenseUpdate}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, positive = false }: {
  title: React.ReactNode;
  value: number;
  icon: React.ReactNode;
  positive?: boolean;
}) => {
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(value);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {typeof title === 'string' ? (
              <p className="text-sm font-medium text-gray-500">{title}</p>
            ) : (
              <div className="text-sm font-medium text-gray-500">{title}</div>
            )}
            <h3 className={`text-2xl font-bold ${
              positive ? 'text-green-600' : ''
            }`}>
              {formattedValue}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Update the report section component
const ReportSection = ({ bankInfo, periodType, setPeriodType }: { 
  bankInfo: BankData; 
  periodType: PeriodType;
  setPeriodType: (value: PeriodType) => void;
}) => {
  const metrics = calculateMetrics(bankInfo, periodType);
  const anomalies = detectAnomalies(bankInfo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Financial Summary</CardTitle>
              <Select
                value={periodType}
                onValueChange={(value: PeriodType) => setPeriodType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {formatCurrency(metrics.currentPeriod.income)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {periodType === 'daily' ? 'Today\'s Income' : 
                   periodType === 'weekly' ? 'Weekly Income' : 
                   'Monthly Income'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {formatCurrency(metrics.currentPeriod.expenses)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {periodType === 'daily' ? 'Today\'s Expenses' : 
                   periodType === 'weekly' ? 'Weekly Expenses' : 
                   'Monthly Expenses'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {metrics.currentPeriod.savingsRate.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-500 mt-1">Savings Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {metrics.monthlyComparison.incomeChange > 0 ? '+' : ''}
                  {metrics.monthlyComparison.incomeChange.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-500 mt-1">Income Change</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {metrics.monthlyComparison.expenseChange > 0 ? '+' : ''}
                  {metrics.monthlyComparison.expenseChange.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-500 mt-1">Expense Change</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{category.category}</span>
                  <span className="text-sm font-semibold">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {anomalies.map((anomaly, index) => (
        <Alert
          key={index}
          variant={anomaly.severity === 'high' ? 'destructive' : 'default'}
          className="mb-4"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{getAnomalyTitle(anomaly.type)}</AlertTitle>
          <AlertDescription>{anomaly.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default Dashboard;