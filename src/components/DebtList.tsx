import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Debt {
  id: string;
  type: "borrowed" | "lent";
  person_name: string;
  amount: number;
  description: string | null;
  status: "pending" | "settled";
  debt_date: string;
  settled_date: string | null;
}

interface DebtListProps {
  refresh: number;
}

const DebtList = ({ refresh }: DebtListProps) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebts();
  }, [refresh]);

  const fetchDebts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .order("status", { ascending: true })
      .order("debt_date", { ascending: false });

    if (error) {
      toast.error("Failed to load debt records");
    } else {
      setDebts(data || []);
    }
    setLoading(false);
  };

  const handleSettle = async (id: string) => {
    const { error } = await supabase
      .from("debts")
      .update({ 
        status: "settled", 
        settled_date: new Date().toISOString().split("T")[0] 
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to settle debt");
    } else {
      toast.success("Debt marked as settled!");
      fetchDebts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("debts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete debt record");
    } else {
      toast.success("Debt record deleted");
      fetchDebts();
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card bg-gradient-card">
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader>
        <CardTitle>Debt Records</CardTitle>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No debt records yet. Add your first record above!
          </p>
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow ${
                  debt.status === "settled" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {debt.type === "lent" ? (
                    <ArrowUpCircle className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{debt.person_name}</p>
                      <Badge variant={debt.type === "lent" ? "default" : "destructive"}>
                        {debt.type === "borrowed" ? "I owe" : "They owe me"}
                      </Badge>
                      {debt.status === "settled" && (
                        <Badge variant="outline" className="bg-success/10">
                          Settled
                        </Badge>
                      )}
                    </div>
                    {debt.description && (
                      <p className="text-sm text-muted-foreground">{debt.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(debt.debt_date), "MMM dd, yyyy")}
                      {debt.settled_date && ` • Settled: ${format(new Date(debt.settled_date), "MMM dd, yyyy")}`}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${debt.type === "lent" ? "text-success" : "text-destructive"}`}>
                    ৳{Number(debt.amount).toFixed(2)}
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  {debt.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSettle(debt.id)}
                      title="Mark as settled"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(debt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtList;
