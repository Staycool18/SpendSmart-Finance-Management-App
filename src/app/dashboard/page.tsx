"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyOverview from "@/components/MonthlyOverview";
import AIFinancialInsights from "@/components/AIFinancialInsights";
import SmartPiggyBank from "@/components/SmartPiggyBank";
import { useToast } from "@/components/ui/use-toast";

interface BankInfo {
  monthlyData: {
    income: number;
    expenses: number;
    balance: number;
  };
  categoryDistribution: {
    category: string;
    value: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export default function DashboardPage() {
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    monthlyData: {
      income: 0,
      expenses: 0,
      balance: 0,
    },
    categoryDistribution: [],
    monthlyTrend: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const response = await fetch("/api/bank-info");
        if (!response.ok) {
          throw new Error("Failed to fetch bank info");
        }
        const data = await response.json();
        setBankInfo(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bank information",
          variant: "destructive",
        });
      }
    };

    fetchBankInfo();
  }, [toast]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyOverview bankInfo={bankInfo} />
        <AIFinancialInsights bankInfo={bankInfo} />
        <SmartPiggyBank bankInfo={bankInfo} />
      </div>
    </div>
  );
} 