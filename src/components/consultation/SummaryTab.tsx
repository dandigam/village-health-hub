import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SummaryTabProps {
  description: string;
  onDescriptionChange: (description: string) => void;
  patientSummary: {
    name: string;
    age: number;
    gender: string;
    conditions: string[];
    prescribedMedicines: string[];
  };
}

export function SummaryTab({
  description,
  onDescriptionChange,
  patientSummary,
}: SummaryTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Description */}
      <div>
        <Label className="font-semibold text-gray-700 mb-2 block">
          Summary Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter consultation summary and final notes..."
          className="min-h-[200px]"
        />
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Diagnosed Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patientSummary.conditions.length > 0 ? (
                patientSummary.conditions.map((condition, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {condition}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No conditions recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Prescribed Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patientSummary.prescribedMedicines.length > 0 ? (
                patientSummary.prescribedMedicines.map((medicine, i) => (
                  <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {medicine}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No medicines prescribed</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
