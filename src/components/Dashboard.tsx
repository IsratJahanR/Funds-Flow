import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingBorrowed: number;
  pendingLent: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    pendingBorrowed: 0,
    pendingLent: 0,
  });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchStats();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserName(profile.full_name);
      }
    }
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    const { data: debts } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const borrowed = debts
        ?.filter((d) => d.type === "borrowed")
        .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      const lent = debts
        ?.filter((d) => d.type === "lent")
        .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        pendingBorrowed: borrowed,
        pendingLent: lent,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
          <p className="text-muted-foreground">Here's your financial overview</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">৳{stats.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">৳{stats.totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
              ৳{stats.balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Borrowed</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">৳{stats.pendingBorrowed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending to return</p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Lent</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">৳{stats.pendingLent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending to receive</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
