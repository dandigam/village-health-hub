import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SubjectiveTabProps {
  selectedConditions: string[];
  onConditionsChange: (conditions: string[]) => void;
  generalQuestions: Record<string, boolean>;
  onGeneralQuestionsChange: (questions: Record<string, boolean>) => void;
  diabetesData: {
    type: string;
    onsetDuration: string;
    presentingComplaints: boolean;
  };
  onDiabetesDataChange: (data: any) => void;
  htnData: {
    onsetDuration: string;
    presentingComplaints: boolean;
  };
  onHtnDataChange: (data: any) => void;
}

const CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes (మధుమేహం)' },
  { id: 'htn', label: 'HTN (అధిక రక్తపోటు)' },
  { id: 'apd', label: 'APD' },
  { id: 'seizures', label: 'Seizures (మూర్ఛలు)' },
  { id: 'stroke', label: 'Stroke (స్ట్రోక్)' },
  { id: 'asthma', label: 'Asthma (ఆస్తమా)' },
];

const ONSET_DURATIONS = [
  '< 1 year',
  '1-5 years',
  '5-10 years',
  '> 10 years',
];

export function SubjectiveTab({
  selectedConditions,
  onConditionsChange,
  generalQuestions,
  onGeneralQuestionsChange,
  diabetesData,
  onDiabetesDataChange,
  htnData,
  onHtnDataChange,
}: SubjectiveTabProps) {
  const [activeConditionTab, setActiveConditionTab] = useState<string>('diabetes');

  const toggleCondition = (conditionId: string) => {
    if (selectedConditions.includes(conditionId)) {
      onConditionsChange(selectedConditions.filter(c => c !== conditionId));
    } else {
      onConditionsChange([...selectedConditions, conditionId]);
    }
  };

  const toggleQuestion = (key: string) => {
    onGeneralQuestionsChange({
      ...generalQuestions,
      [key]: !generalQuestions[key],
    });
  };

  const isConditionActive = (id: string) => selectedConditions.includes(id);

  return (
    <div className="space-y-6">
      {/* General Questions Section */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="text-base font-semibold text-primary mb-4">
          General Questions (సాధారణ ప్రశ్నలు)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="frequentInfections"
              checked={generalQuestions.frequentInfections || false}
              onCheckedChange={() => toggleQuestion('frequentInfections')}
              className="mt-0.5"
            />
            <Label htmlFor="frequentInfections" className="text-sm cursor-pointer leading-relaxed">
              Frequent Infections (తరచుగా వచ్చే ఇన్ఫెక్షన్లు)
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="darkenedSkin"
              checked={generalQuestions.darkenedSkin || false}
              onCheckedChange={() => toggleQuestion('darkenedSkin')}
              className="mt-0.5"
            />
            <Label htmlFor="darkenedSkin" className="text-sm cursor-pointer leading-relaxed">
              Darkened skin in folds (చర్మ మడతల్లో నల్లబడటం)
            </Label>
          </div>
          <div className="flex items-start gap-3 col-span-2">
            <Checkbox
              id="feelingTired"
              checked={generalQuestions.feelingTired || false}
              onCheckedChange={() => toggleQuestion('feelingTired')}
              className="mt-0.5"
            />
            <Label htmlFor="feelingTired" className="text-sm cursor-pointer leading-relaxed">
              Are you feeling tired or weak? (మీకు అలసట లేదా బలహీనతగా అనిపిస్తున్నదా?)
            </Label>
          </div>
        </div>
      </div>

      {/* Condition Tabs */}
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((condition) => {
          const isActive = isConditionActive(condition.id);
          const isCurrentTab = activeConditionTab === condition.id;
          
          return (
            <button
              key={condition.id}
              onClick={() => {
                if (!isActive) {
                  toggleCondition(condition.id);
                }
                setActiveConditionTab(condition.id);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {isActive && <span className="mr-1">✓</span>}
              {condition.label}
            </button>
          );
        })}
      </div>

      {/* Condition Content Area */}
      <div className="bg-card rounded-lg border p-5 min-h-[200px]">
        {/* Diabetes Tab Content */}
        {activeConditionTab === 'diabetes' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-primary">
                Diabetes (మధుమేహం)
              </h4>
              <Checkbox
                checked={isConditionActive('diabetes')}
                onCheckedChange={() => toggleCondition('diabetes')}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Type</Label>
                <RadioGroup
                  value={diabetesData.type}
                  onValueChange={(value) => onDiabetesDataChange({ ...diabetesData, type: value })}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="type1" id="type1" />
                    <Label htmlFor="type1" className="text-sm cursor-pointer">Type 1 (టైప్ 1)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="type2" id="type2" />
                    <Label htmlFor="type2" className="text-sm cursor-pointer">Type 2 (టైప్ 2)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="gestational" id="gestational" />
                    <Label htmlFor="gestational" className="text-sm cursor-pointer">Gestational</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Onset Duration (ప్రారంభ కాలం)
                  </Label>
                  <Select
                    value={diabetesData.onsetDuration}
                    onValueChange={(value) => onDiabetesDataChange({ ...diabetesData, onsetDuration: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {ONSET_DURATIONS.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-3 pb-2">
                    <Checkbox
                      id="diabetesComplaints"
                      checked={diabetesData.presentingComplaints}
                      onCheckedChange={(checked) => 
                        onDiabetesDataChange({ ...diabetesData, presentingComplaints: !!checked })
                      }
                    />
                    <Label htmlFor="diabetesComplaints" className="text-sm cursor-pointer">
                      Presenting Complaints (ప్రస్తుత లక్షణాలు)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HTN Tab Content */}
        {activeConditionTab === 'htn' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-primary">
                HTN - Hypertension (అధిక రక్తపోటు)
              </h4>
              <Checkbox
                checked={isConditionActive('htn')}
                onCheckedChange={() => toggleCondition('htn')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Onset Duration (ప్రారంభ కాలం)
                </Label>
                <Select
                  value={htnData.onsetDuration}
                  onValueChange={(value) => onHtnDataChange({ ...htnData, onsetDuration: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONSET_DURATIONS.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-3 pb-2">
                  <Checkbox
                    id="htnComplaints"
                    checked={htnData.presentingComplaints}
                    onCheckedChange={(checked) => 
                      onHtnDataChange({ ...htnData, presentingComplaints: !!checked })
                    }
                  />
                  <Label htmlFor="htnComplaints" className="text-sm cursor-pointer">
                    Presenting Complaints (ప్రస్తుత లక్షణాలు)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APD Tab Content */}
        {activeConditionTab === 'apd' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-primary">
                APD - Acid Peptic Disease
              </h4>
              <Checkbox
                checked={isConditionActive('apd')}
                onCheckedChange={() => toggleCondition('apd')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Onset Duration
                </Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONSET_DURATIONS.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Symptoms
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="heartburn" />
                    <Label htmlFor="heartburn" className="text-sm cursor-pointer">Heartburn</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="bloating" />
                    <Label htmlFor="bloating" className="text-sm cursor-pointer">Bloating</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seizures Tab Content */}
        {activeConditionTab === 'seizures' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-primary">
                Seizures (మూర్ఛలు)
              </h4>
              <Checkbox
                checked={isConditionActive('seizures')}
                onCheckedChange={() => toggleCondition('seizures')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Onset Duration
                </Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONSET_DURATIONS.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Type
                </Label>
                <RadioGroup className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="focal" id="focal" />
                    <Label htmlFor="focal" className="text-sm cursor-pointer">Focal</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="generalized" id="generalized" />
                    <Label htmlFor="generalized" className="text-sm cursor-pointer">Generalized</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox id="seizuresMedication" />
              <Label htmlFor="seizuresMedication" className="text-sm cursor-pointer">
                Currently on Medication
              </Label>
            </div>
          </div>
        )}

        {/* Stroke Tab Content */}
        {activeConditionTab === 'stroke' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-primary">
                Stroke (స్ట్రోక్)
              </h4>
              <Checkbox
                checked={isConditionActive('stroke')}
                onCheckedChange={() => toggleCondition('stroke')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  History of Stroke
                </Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONSET_DURATIONS.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Type
                </Label>
                <RadioGroup className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="ischemic" id="ischemic" />
                    <Label htmlFor="ischemic" className="text-sm cursor-pointer">Ischemic</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="hemorrhagic" id="hemorrhagic" />
                    <Label htmlFor="hemorrhagic" className="text-sm cursor-pointer">Hemorrhagic</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Residual Symptoms
              </Label>
              <Textarea 
                placeholder="Describe any residual symptoms..." 
                className="h-20"
              />
            </div>
          </div>
        )}

        {/* Asthma Tab Content */}
        {activeConditionTab === 'asthma' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-primary">
                Asthma (ఆస్తమా)
              </h4>
              <Checkbox
                checked={isConditionActive('asthma')}
                onCheckedChange={() => toggleCondition('asthma')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Onset Duration
                </Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONSET_DURATIONS.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Severity
                </Label>
                <RadioGroup className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="mild" id="mild" />
                    <Label htmlFor="mild" className="text-sm cursor-pointer">Mild</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="text-sm cursor-pointer">Moderate</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="severe" id="severe" />
                    <Label htmlFor="severe" className="text-sm cursor-pointer">Severe</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Triggers</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="dust" />
                  <Label htmlFor="dust" className="text-sm cursor-pointer">Dust</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="pollen" />
                  <Label htmlFor="pollen" className="text-sm cursor-pointer">Pollen</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cold" />
                  <Label htmlFor="cold" className="text-sm cursor-pointer">Cold Air</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="exercise" />
                  <Label htmlFor="exercise" className="text-sm cursor-pointer">Exercise</Label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
