import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoryEntry {
  date: string;
  testWithMedicine: boolean;
  results: string;
}

interface AssessmentTabProps {
  conditionHistories: Record<string, HistoryEntry[]>;
  notes: string;
  onNotesChange: (notes: string) => void;
}

// Mock BP history data for chart
const mockBPChartData = [
  { date: '10/09/25', systolic: 135, diastolic: 80 },
  { date: '12/09/25', systolic: 145, diastolic: 85 },
  { date: '14/09/25', systolic: 155, diastolic: 90 },
  { date: '01/10/25', systolic: 120, diastolic: 80 },
];

export function AssessmentTab({
  conditionHistories,
  notes,
  onNotesChange,
}: AssessmentTabProps) {
  return (
    <div className="space-y-6">
      {/* HTN Section with History Table and Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-blue-800">HTN</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* History Table */}
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Test With Medicine</TableHead>
                  <TableHead>Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: '10/09/2025', testWithMedicine: true, results: '135/80' },
                  { date: '12/09/2025', testWithMedicine: true, results: '145/85' },
                  { date: '13/09/2025', testWithMedicine: false, results: '155/90' },
                  { date: '01/10/2025', testWithMedicine: true, results: '120/80' },
                ].map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-blue-600 font-medium">{entry.date}</TableCell>
                    <TableCell>{entry.testWithMedicine ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-blue-600 font-bold">{entry.results}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* BP Chart */}
          <div className="bg-white rounded-lg border p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockBPChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[60, 180]} />
                <Tooltip />
                <Legend 
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => value === 'systolic' ? 'Systolic (mmHg)' : 'Diastolic (mmHg)'}
                />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="font-bold text-gray-700 mb-2 block">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add notes about HTN assessment..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Diabetes Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-blue-800">Diabetes</h3>
        
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Date</TableHead>
                <TableHead>Test With Medicine</TableHead>
                <TableHead>Results (FBS/PPBS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { date: '10/09/2025', testWithMedicine: true, results: '126/180' },
                { date: '15/09/2025', testWithMedicine: true, results: '118/165' },
                { date: '01/10/2025', testWithMedicine: false, results: '135/195' },
              ].map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="text-blue-600 font-medium">{entry.date}</TableCell>
                  <TableCell>{entry.testWithMedicine ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-blue-600 font-bold">{entry.results}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
