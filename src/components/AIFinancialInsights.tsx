import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancialInsight {
  type: 'savings' | 'budget' | 'health';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
}

interface AIFinancialInsightsProps {
  bankInfo: {
    monthlyData: {
      income: number;
      expenses: number;
      balance: number;
    };
    categoryDistribution: Array<{
      category: string;
      value: number;
      percentage: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
  };
}

const AIFinancialInsights = ({ bankInfo }: AIFinancialInsightsProps) => {
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(0);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(bankInfo)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }

        const data = await response.json();
        setHealthScore(data.score);
        setInsights(data.insights);
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Set default insights if API fails
        setInsights([{
          type: 'health',
          title: 'Unable to Generate Insights',
          description: 'Please try again later',
          severity: 'medium'
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [bankInfo]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getScoreExplanation = () => {
    const isCredit = bankInfo.monthlyData.balance < 0;
    
    if (isCredit) {
      return (
        <div className="space-y-2 text-sm">
          <p className="font-medium">Credit Card Health Score Components:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><span className="font-medium">Credit Utilization (30pts):</span> Keep usage below 30% of limit</li>
            <li><span className="font-medium">Payment History (30pts):</span> Based on timely payments</li>
            <li><span className="font-medium">Category Balance (20pts):</span> Diverse spending across categories</li>
            <li><span className="font-medium">Expense Trend (20pts):</span> Month-over-month spending patterns</li>
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-2 text-sm">
        <p className="font-medium">Bank Account Health Score Components:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><span className="font-medium">Savings Rate (30pts):</span> Aim for 20% or more of income</li>
          <li><span className="font-medium">Expense Management (30pts):</span> Income vs. expense ratio</li>
          <li><span className="font-medium">Category Balance (20pts):</span> Even distribution across categories</li>
          <li><span className="font-medium">Income Trend (20pts):</span> Month-over-month income growth</li>
        </ul>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI Financial Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Health Score Section */}
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-lg font-medium">Financial Health Score</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm p-4">
                      {getScoreExplanation()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className={`text-4xl font-bold mb-2 ${getHealthScoreColor(healthScore)}`}>
                {healthScore}/100
              </div>
              <Progress 
                value={healthScore} 
                className={`h-2 w-full mb-2 ${getHealthScoreBackground(healthScore)}`}
              />
            </div>

            {/* Insights Section */}
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(insight.severity)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-sm font-medium mt-2">
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFinancialInsights; 