
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpendingData {
  name: string;
  amount: number;
  category: string;
}

interface SpendingChartProps {
  data: SpendingData[];
  className?: string;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", 
  "#5DADE2", "#48C9B0", "#F4D03F", "#EB984E", "#CD6155"
];

const SpendingChart = ({ data, className }: SpendingChartProps) => {
  const [view, setView] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("shadow-sm h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Spending Overview</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={view === "weekly" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setView("weekly")}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={view === "monthly" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setView("monthly")}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={view === "yearly" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setView("yearly")}
          >
            Year
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 30 }}
              barSize={30}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.15 }} />
              <Bar 
                dataKey="amount" 
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
