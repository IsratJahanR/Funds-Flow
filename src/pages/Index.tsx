import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthGuard from "@/components/AuthGuard";
import Dashboard from "@/components/Dashboard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import DebtForm from "@/components/DebtForm";
import DebtList from "@/components/DebtList";

const Index = () => {
  const [transactionRefresh, setTransactionRefresh] = useState(0);
  const [debtRefresh, setDebtRefresh] = useState(0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Dashboard />
          
          <Tabs defaultValue="transactions" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="debts">Debts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <TransactionForm onSuccess={() => setTransactionRefresh((r) => r + 1)} />
                <TransactionList refresh={transactionRefresh} />
              </div>
            </TabsContent>
            
            <TabsContent value="debts" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <DebtForm onSuccess={() => setDebtRefresh((r) => r + 1)} />
                <DebtList refresh={debtRefresh} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Index;
