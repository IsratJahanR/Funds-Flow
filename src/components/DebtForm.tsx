import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const debtSchema = z.object({
  type: z.enum(["borrowed", "lent"]),
  personName: z.string().min(1, "Person name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().max(500).optional(),
  date: z.string().min(1, "Date is required"),
});

interface DebtFormProps {
  onSuccess: () => void;
}

const DebtForm = ({ onSuccess }: DebtFormProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"borrowed" | "lent">("borrowed");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = debtSchema.parse({
        type,
        personName,
        amount: parseFloat(amount),
        description,
        date,
      });

      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("debts").insert({
        user_id: user.id,
        type: validation.type,
        person_name: validation.personName,
        amount: validation.amount,
        description: validation.description,
        debt_date: validation.date,
      });

      if (error) throw error;

      toast.success("Debt record added successfully!");
      setPersonName("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to add debt record");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader>
        <CardTitle>Add Debt Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debt-type">Type</Label>
            <Select value={type} onValueChange={(value: "borrowed" | "lent") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrowed">I Borrowed (I owe)</SelectItem>
                <SelectItem value="lent">I Lent (They owe me)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="person-name">Person Name</Label>
            <Input
              id="person-name"
              placeholder="e.g., John Doe"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-amount">Amount (৳)</Label>
            <Input
              id="debt-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-date">Date</Label>
            <Input
              id="debt-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-description">Description (Optional)</Label>
            <Textarea
              id="debt-description"
              placeholder="Add notes about this debt..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Debt Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DebtForm;
