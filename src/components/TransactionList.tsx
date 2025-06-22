
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpDown, 
  ChevronDown, 
  Search, 
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Coffee,
  ShoppingBasket,
  Home as HomeIcon,
  Utensils,
  Car,
  Plane,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: "income" | "expense" | "transfer";
  account: string;
}

const categories = [
  { name: "Food & Dining", icon: <Utensils className="h-3 w-3" /> },
  { name: "Shopping", icon: <ShoppingBasket className="h-3 w-3" /> },
  { name: "Housing", icon: <HomeIcon className="h-3 w-3" /> },
  { name: "Transportation", icon: <Car className="h-3 w-3" /> },
  { name: "Travel", icon: <Plane className="h-3 w-3" /> },
  { name: "Coffee", icon: <Coffee className="h-3 w-3" /> },
  { name: "Other", icon: <CreditCard className="h-3 w-3" /> },
];

const typeIcons = {
  income: <ArrowUpCircle className="h-4 w-4 text-green-500" />,
  expense: <ArrowDownCircle className="h-4 w-4 text-red-500" />,
  transfer: <RefreshCw className="h-4 w-4 text-blue-500" />,
};

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  className?: string;
}

const TransactionList = ({ transactions, loading = false, className }: TransactionListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | "transfer" | null>(null);

  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Apply search filter
    const searchMatch = searchTerm
      ? transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Apply category filter
    const categoryMatch = categoryFilter
      ? transaction.category === categoryFilter
      : true;

    // Apply type filter
    const typeMatch = typeFilter
      ? transaction.type === typeFilter
      : true;

    return searchMatch && categoryMatch && typeMatch;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortColumn === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortColumn === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      const aValue = a[sortColumn].toString().toLowerCase();
      const bValue = b[sortColumn].toString().toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="flex flex-col space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-md shimmer"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 shimmer rounded"></div>
                <div className="h-3 w-1/2 shimmer rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );

  const getCategoryIcon = (category: string) => {
    const foundCategory = categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );
    return foundCategory?.icon || <CreditCard className="h-3 w-3" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="px-4 py-4 border-b">
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transactions..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  {categoryFilter || "All Categories"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.name}
                    onClick={() => setCategoryFilter(category.name)}
                    className="flex items-center"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : "All Types"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setTypeFilter(null)}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTypeFilter("income")}
                  className="flex items-center"
                >
                  {typeIcons.income}
                  <span className="ml-2">Income</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTypeFilter("expense")}
                  className="flex items-center"
                >
                  {typeIcons.expense}
                  <span className="ml-2">Expense</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTypeFilter("transfer")}
                  className="flex items-center"
                >
                  {typeIcons.transfer}
                  <span className="ml-2">Transfer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {categoryFilter && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 h-8"
              >
                {getCategoryIcon(categoryFilter)}
                {categoryFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setCategoryFilter(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {typeFilter && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1 h-8"
              >
                {typeIcons[typeFilter]}
                {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setTypeFilter(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium p-0 text-xs"
                    onClick={() => handleSort("date")}
                  >
                    Date
                    {sortColumn === "date" && (
                      <ArrowUpDown className={cn(
                        "ml-1 h-3 w-3 transition-transform", 
                        sortDirection === "desc" ? "transform rotate-180" : ""
                      )} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium p-0 text-xs"
                    onClick={() => handleSort("merchant")}
                  >
                    Description
                    {sortColumn === "merchant" && (
                      <ArrowUpDown className={cn(
                        "ml-1 h-3 w-3 transition-transform", 
                        sortDirection === "desc" ? "transform rotate-180" : ""
                      )} />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium p-0 text-xs"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    {sortColumn === "amount" && (
                      <ArrowUpDown className={cn(
                        "ml-1 h-3 w-3 transition-transform", 
                        sortDirection === "desc" ? "transform rotate-180" : ""
                      )} />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeleton()
              ) : sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="group hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          transaction.type === "income" ? "bg-green-100" :
                          transaction.type === "expense" ? "bg-red-100" : "bg-blue-100"
                        )}>
                          {typeIcons[transaction.type]}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-medium text-sm">
                            {transaction.merchant}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.account}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-xs font-normal flex items-center gap-1 capitalize"
                      >
                        {getCategoryIcon(transaction.category)}
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-sm font-medium",
                      transaction.type === "income" ? "text-green-600" :
                      transaction.type === "expense" ? "text-red-600" : "text-blue-600"
                    )}>
                      {transaction.type === "income" ? "+" : 
                       transaction.type === "expense" ? "-" : ""}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
