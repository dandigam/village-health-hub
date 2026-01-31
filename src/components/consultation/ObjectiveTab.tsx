import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Scale, Activity, Heart, Thermometer, Wind,
  Plus, Copy, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalsData {
  weight: number | '';
  bp: string;
  pulse: number | '';
  temp: number | '';
  spo2: number | '';
}

interface LabTest {
  id: string;
  name: string;
  date: string;
  testWithMedicine: boolean | null;
  clinicalResults: string;
  resultDifference: string;
}

interface ObjectiveTabProps {
  vitals: VitalsData;
  onVitalsChange: (vitals: VitalsData) => void;
  labTests: LabTest[];
  onLabTestsChange: (tests: LabTest[]) => void;
}

const LAB_TEST_OPTIONS = [
  'BP', 'FBS', 'PPBS', 'HBA1C', 'RBS', 'Lipid Profile', 'Thyroid', 'CBC'
];

export function ObjectiveTab({
  vitals,
  onVitalsChange,
  labTests,
  onLabTestsChange,
}: ObjectiveTabProps) {
  const updateVital = (field: keyof VitalsData, value: string | number) => {
    onVitalsChange({ ...vitals, [field]: value });
  };

  const updateLabTest = (index: number, field: keyof LabTest, value: any) => {
    const updated = [...labTests];
    updated[index] = { ...updated[index], [field]: value };
    onLabTestsChange(updated);
  };

  const addLabTestRow = (index: number) => {
    const newTest: LabTest = {
      id: `lab-${Date.now()}`,
      name: '',
      date: '',
      testWithMedicine: null,
      clinicalResults: '',
      resultDifference: '-',
    };
    const updated = [...labTests];
    updated.splice(index + 1, 0, newTest);
    onLabTestsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Vitals Input Row */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-5 gap-4">
          {/* Weight */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                value={vitals.weight}
                onChange={(e) => updateVital('weight', e.target.value ? Number(e.target.value) : '')}
                placeholder="Kg's"
                className="h-10"
              />
            </div>
          </div>

          {/* BP */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Input
                value={vitals.bp}
                onChange={(e) => updateVital('bp', e.target.value)}
                placeholder="mmHg"
                className="h-10"
              />
            </div>
          </div>

          {/* Pulse */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                value={vitals.pulse}
                onChange={(e) => updateVital('pulse', e.target.value ? Number(e.target.value) : '')}
                placeholder="/min"
                className="h-10"
              />
            </div>
          </div>

          {/* Temp */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Thermometer className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                step="0.1"
                value={vitals.temp}
                onChange={(e) => updateVital('temp', e.target.value ? Number(e.target.value) : '')}
                placeholder="°F"
                className="h-10"
              />
            </div>
          </div>

          {/* SpO2 */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Wind className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                value={vitals.spo2}
                onChange={(e) => updateVital('spo2', e.target.value ? Number(e.target.value) : '')}
                placeholder="%"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-24">Name</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-36">Test With Medicine</TableHead>
              <TableHead className="w-40">Clinical Results</TableHead>
              <TableHead className="w-28">Result Difference</TableHead>
              <TableHead className="w-24">Add Multiple</TableHead>
              <TableHead className="w-20">History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labTests.map((test, index) => (
              <TableRow key={test.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Select
                    value={test.name}
                    onValueChange={(value) => updateLabTest(index, 'name', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_TEST_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={test.date}
                    onValueChange={(value) => updateLabTest(index, 'date', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <RadioGroup
                    value={test.testWithMedicine === null ? '' : test.testWithMedicine ? 'yes' : 'no'}
                    onValueChange={(value) => updateLabTest(index, 'testWithMedicine', value === 'yes')}
                    className="flex gap-3"
                  >
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="yes" id={`${test.id}-yes`} />
                      <Label htmlFor={`${test.id}-yes`} className="text-xs cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="no" id={`${test.id}-no`} />
                      <Label htmlFor={`${test.id}-no`} className="text-xs cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
                <TableCell>
                  <Input
                    value={test.clinicalResults}
                    onChange={(e) => updateLabTest(index, 'clinicalResults', e.target.value)}
                    className="h-9"
                  />
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {test.resultDifference}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-green-100 hover:bg-green-200 text-green-600"
                    onClick={() => addLabTestRow(index)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-green-500 hover:bg-green-600">Save</Button>
        </div>
      </div>
    </div>
  );
}
