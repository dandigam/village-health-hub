import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  return (
    <div className="space-y-6">
      {/* General Questions */}
      <div>
        <h3 className="text-lg font-semibold text-amber-700 mb-4">
          General Questions (సాధారణ ప్రశ్నలు)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="frequentInfections"
              checked={generalQuestions.frequentInfections || false}
              onCheckedChange={() => toggleQuestion('frequentInfections')}
            />
            <Label htmlFor="frequentInfections" className="text-sm cursor-pointer">
              Frequent Infections (తరచుగా వచ్చే ఇన్ఫెక్షన్లు)
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="darkenedSkin"
              checked={generalQuestions.darkenedSkin || false}
              onCheckedChange={() => toggleQuestion('darkenedSkin')}
            />
            <Label htmlFor="darkenedSkin" className="text-sm cursor-pointer">
              Darkened skin in folds (చర్మ మడతల్లో నల్లబడటం)
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="feelingTired"
              checked={generalQuestions.feelingTired || false}
              onCheckedChange={() => toggleQuestion('feelingTired')}
            />
            <Label htmlFor="feelingTired" className="text-sm cursor-pointer">
              Are you feeling tired or weak? (మీకు అలసట లేదా బలహీనతగా అనిపిస్తున్నదా?)
            </Label>
          </div>
        </div>
      </div>

      {/* Condition Toggle Buttons */}
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((condition) => (
          <button
            key={condition.id}
            onClick={() => toggleCondition(condition.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all",
              selectedConditions.includes(condition.id)
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-amber-400"
            )}
          >
            {selectedConditions.includes(condition.id) && (
              <span className="mr-1">✓</span>
            )}
            {condition.label}
          </button>
        ))}
      </div>

      {/* Diabetes Section */}
      {selectedConditions.includes('diabetes') && (
        <div className="bg-gray-50 rounded-lg p-5 border space-y-4">
          <h4 className="text-lg font-semibold text-amber-700">
            Diabetes (మధుమేహం)
          </h4>
          
          <div className="flex items-center gap-6">
            <RadioGroup
              value={diabetesData.type}
              onValueChange={(value) => onDiabetesDataChange({ ...diabetesData, type: value })}
              className="flex gap-4"
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
                <Label htmlFor="gestational" className="text-sm cursor-pointer">Gestational Diabetes</Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-3 ml-auto">
              <Checkbox
                id="onsetDurationCheck"
                checked={diabetesData.onsetDuration !== ''}
              />
              <Label htmlFor="onsetDurationCheck" className="text-sm">
                Onset Duration (ప్రారంభ కాలం)
              </Label>
              <Select
                value={diabetesData.onsetDuration}
                onValueChange={(value) => onDiabetesDataChange({ ...diabetesData, onsetDuration: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Onset Duration" />
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
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="presentingComplaints"
              checked={diabetesData.presentingComplaints}
              onCheckedChange={(checked) => 
                onDiabetesDataChange({ ...diabetesData, presentingComplaints: !!checked })
              }
            />
            <Label htmlFor="presentingComplaints" className="text-sm cursor-pointer">
              Presenting Complaints (ప్రస్తుత లక్షణాలు)
            </Label>
          </div>
        </div>
      )}

      {/* HTN Section */}
      {selectedConditions.includes('htn') && (
        <div className="bg-gray-50 rounded-lg p-5 border space-y-4">
          <h4 className="text-lg font-semibold text-amber-700">
            HTN (Hypertension) (అధిక రక్తపోటు)
          </h4>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Onset Duration:</Label>
              <Select
                value={htnData.onsetDuration}
                onValueChange={(value) => onHtnDataChange({ ...htnData, onsetDuration: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Onset Duration" />
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

            <div className="flex items-center gap-3">
              <Checkbox
                id="htnComplaints"
                checked={htnData.presentingComplaints}
                onCheckedChange={(checked) => 
                  onHtnDataChange({ ...htnData, presentingComplaints: !!checked })
                }
              />
              <Label htmlFor="htnComplaints" className="text-sm cursor-pointer">
                Presenting Complaints
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
