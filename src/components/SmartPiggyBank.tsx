import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, PiggyBank, Target, Settings, Coins, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

type SavingsRuleType = 'round-up' | 'percentage' | 'fixed';

interface SavingsRule {
  id: string;
  type: SavingsRuleType;
  amount: number;
  isActive: boolean;
}

interface SmartPiggyBankProps {
  bankInfo: {
    monthlyData: {
      income: number;
      expenses: number;
      balance: number;
    };
  };
  onExpenseUpdate?: (newExpense: number) => void;
}

const SmartPiggyBank = ({ bankInfo, onExpenseUpdate }: SmartPiggyBankProps) => {
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [rules, setRules] = useState<SavingsRule[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    name?: string;
    targetAmount?: string;
    deadline?: string;
  }>({});
  const [newRule, setNewRule] = useState<{
    type?: 'round-up' | 'percentage' | 'fixed';
    amount?: string;
  }>({});
  const [trackingPreference, setTrackingPreference] = useState<'expense' | 'separate'>('expense');
  const { toast } = useToast();

  useEffect(() => {
    if (trackingPreference === 'expense' && onExpenseUpdate) {
      const totalSavings = calculateTotalSavings();
      onExpenseUpdate(bankInfo.monthlyData.expenses + totalSavings);
    } else if (onExpenseUpdate) {
      onExpenseUpdate(bankInfo.monthlyData.expenses);
    }
  }, [trackingPreference, goals, rules, bankInfo.monthlyData.expenses, onExpenseUpdate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateTotalSavings = () => {
    const goalsTotal = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const rulesTotal = rules.reduce((sum, rule) => {
      if (!rule.isActive) return sum;
      switch (rule.type) {
        case 'round-up':
          return sum + (bankInfo.monthlyData.expenses * 0.1); // 10% of expenses
        case 'percentage':
          return sum + (bankInfo.monthlyData.income * (rule.amount / 100));
        case 'fixed':
          return sum + rule.amount;
        default:
          return sum;
      }
    }, 0);
    return goalsTotal + rulesTotal;
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
    };

    setGoals([...goals, goal]);
    setNewGoal({});
    setIsAddingGoal(false);
    toast({
      title: "Goal added",
      description: "Your savings goal has been created",
    });
  };

  const handleAddRule = () => {
    if (!newRule.type || !newRule.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const rule: SavingsRule = {
      id: Date.now().toString(),
      type: newRule.type as 'round-up' | 'percentage' | 'fixed',
      amount: Number(newRule.amount),
      isActive: true,
    };

    setRules([...rules, rule]);
    setNewRule({});
    setIsAddingRule(false);
    toast({
      title: "Rule added",
      description: "Your savings rule has been created",
    });
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast({
      title: "Goal deleted",
      description: "Your savings goal has been removed",
    });
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule deleted",
      description: "Your savings rule has been removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Smart Piggy Bank</CardTitle>
            <CardDescription>
              {trackingPreference === 'expense' 
                ? 'Savings are counted as expenses for tighter budget control'
                : 'Savings are tracked separately for more flexibility'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="tracking-preference" className="text-sm text-muted-foreground">
                {trackingPreference === 'expense' ? 'Count savings as expense' : 'Track savings separately'}
              </Label>
              <Switch
                id="tracking-preference"
                checked={trackingPreference === 'expense'}
                onCheckedChange={(checked) => setTrackingPreference(checked ? 'expense' : 'separate')}
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Savings Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goal-name">Goal Name</Label>
                      <Input
                        id="goal-name"
                        value={newGoal.name || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        placeholder="e.g., New Car"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-amount">Target Amount</Label>
                      <Input
                        id="goal-amount"
                        type="number"
                        value={newGoal.targetAmount || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
                      <Input
                        id="goal-deadline"
                        type="date"
                        value={newGoal.deadline || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingGoal(false)}>Cancel</Button>
                    <Button onClick={handleAddGoal}>Add Goal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingRule} onOpenChange={setIsAddingRule}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Savings Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rule-type">Rule Type</Label>
                      <div id="rule-type">
                        <Select
                          value={newRule.type || ''}
                          onValueChange={(value) => setNewRule({ ...newRule, type: value as SavingsRuleType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rule type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="round-up">Round Up</SelectItem>
                            <SelectItem value="percentage">Percentage of Income</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rule-amount">Amount</Label>
                      <Input
                        id="rule-amount"
                        type="number"
                        value={newRule.amount || ''}
                        onChange={(e) => setNewRule({ ...newRule, amount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingRule(false)}>Cancel</Button>
                    <Button onClick={handleAddRule}>Add Rule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Total Savings</h3>
              <span className="text-sm text-muted-foreground">
                {trackingPreference === 'expense' ? 'Included in expenses' : 'Tracked separately'}
              </span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(calculateTotalSavings())}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {trackingPreference === 'expense' 
                ? 'Savings are counted as expenses for tighter budget control'
                : 'Savings are tracked separately for more flexibility'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Savings Goals
            </h3>
            {goals.length === 0 ? (
              <p className="text-sm text-gray-500">No savings goals yet</p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Progress
                      value={(goal.currentAmount / goal.targetAmount) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Savings Rules
            </h3>
            {rules.length === 0 ? (
              <p className="text-sm text-gray-500">No savings rules yet</p>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {rule.type === 'round-up'
                          ? 'Round-up Transactions'
                          : rule.type === 'percentage'
                          ? `${rule.amount}% of Income`
                          : `Fixed ${formatCurrency(rule.amount)}`}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {rule.type === 'round-up'
                          ? 'Rounds up transactions to nearest dollar'
                          : rule.type === 'percentage'
                          ? 'Saves percentage of monthly income'
                          : 'Saves fixed amount regularly'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartPiggyBank; 