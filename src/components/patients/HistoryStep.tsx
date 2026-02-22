import { ClipboardList } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMedicalConditions } from '@/services/api';

interface HistoryData {
  hasPreviousTreatment: string;
  conditions: string[];
  previousHospital: string;
  currentMedications: string;
  pastSurgery: string;
}

interface HistoryStepProps {
  data: HistoryData;
  onUpdate: <K extends keyof HistoryData>(field: K, value: HistoryData[K]) => void;
}


export function HistoryStep({ data, onUpdate }: HistoryStepProps) {
  const { data: conditions = [], isLoading } = useMedicalConditions();
  console.log(conditions);
  const handleConditionChange = (conditionId: string, checked: boolean) => {
    let newConditions;
    if (checked) {
      // Avoid duplicates
      newConditions = Array.from(new Set([...data.conditions, conditionId]));
    } else {
      newConditions = data.conditions.filter((c) => c !== conditionId);
    }
    onUpdate('conditions', newConditions);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-muted/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-accent" />
          Medical History (Outside Hospital / Previous Records)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {/* Previous Treatment Question */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Has the patient taken treatment at another hospital?
          </Label>
          <RadioGroup
            value={data.hasPreviousTreatment}
            onValueChange={(v) => onUpdate('hasPreviousTreatment', v)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="treatment-yes" />
              <Label htmlFor="treatment-yes" className="text-sm font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="treatment-no" />
              <Label htmlFor="treatment-no" className="text-sm font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Conditional Fields */}
        {data.hasPreviousTreatment === 'yes' && (
          <div className="space-y-4 pl-4 border-l-2 border-accent/30">
            {/* Conditions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Conditions</Label>
              <div className="grid grid-cols-3 gap-3">
                {isLoading ? (
                  <div>Loading conditions...</div>
                ) : (
                  conditions.map((condition) => {
                    // Pre-select if condition.id matches any in data.conditions
                    const checked = data.conditions.some(
                      (c) => String(c) === String(condition.id)
                    );
                    return (
                      <div key={condition.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={String(condition.id)}
                          checked={checked}
                          onCheckedChange={(checked) =>
                            handleConditionChange(String(condition.id), checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={String(condition.id)}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {condition.name}
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Previous Hospital */}
            <div className="space-y-1">
              <Label htmlFor="previousHospital" className="text-xs font-medium">
                Previous Hospital Name
              </Label>
              <Input
                id="previousHospital"
                value={data.previousHospital}
                onChange={(e) => onUpdate('previousHospital', e.target.value)}
                className="h-9 text-sm"
                placeholder="Enter hospital name"
              />
            </div>

            {/* Current Medications */}
            <div className="space-y-1">
              <Label htmlFor="currentMedications" className="text-xs font-medium">
                Current Medications
              </Label>
              <Textarea
                id="currentMedications"
                value={data.currentMedications}
                onChange={(e) => onUpdate('currentMedications', e.target.value)}
                className="text-sm min-h-[80px]"
                placeholder="List current medications..."
              />
            </div>

            {/* Past Surgery */}
            <div className="space-y-1">
              <Label htmlFor="pastSurgery" className="text-xs font-medium">
                Past Surgery / Major Illness
              </Label>
              <Textarea
                id="pastSurgery"
                value={data.pastSurgery}
                onChange={(e) => onUpdate('pastSurgery', e.target.value)}
                className="text-sm min-h-[80px]"
                placeholder="Describe any past surgeries or major illnesses..."
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
