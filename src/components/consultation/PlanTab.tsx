import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface PrescriptionItem {
  id: string;
  selected: boolean;
  medicineName: string;
  qtyAvailable: number;
  morning: number;
  afternoon: number;
  night: number;
  days: number;
  quantityOrdered: number;
}

interface PlanTabProps {
  prescriptionItems: PrescriptionItem[];
  onPrescriptionItemsChange: (items: PrescriptionItem[]) => void;
}

export function PlanTab({
  prescriptionItems,
  onPrescriptionItemsChange,
}: PlanTabProps) {
  const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate quantity ordered
    if (['morning', 'afternoon', 'night', 'days'].includes(field)) {
      const item = updated[index];
      updated[index].quantityOrdered = 
        (Number(item.morning) + Number(item.afternoon) + Number(item.night)) * Number(item.days);
    }
    
    onPrescriptionItemsChange(updated);
  };

  const toggleItemSelection = (index: number) => {
    const updated = [...prescriptionItems];
    updated[index].selected = !updated[index].selected;
    onPrescriptionItemsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">Select</TableHead>
              <TableHead className="w-48">Medicine Name</TableHead>
              <TableHead className="w-28">Qty. Available</TableHead>
              <TableHead colSpan={3} className="text-center">Schedule</TableHead>
              <TableHead className="w-24">No. of Days</TableHead>
              <TableHead className="w-32">Quantity ordered</TableHead>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-center w-20">Morning</TableHead>
              <TableHead className="text-center w-24">Afternoon</TableHead>
              <TableHead className="text-center w-20">Night</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptionItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItemSelection(index)}
                  />
                </TableCell>
                <TableCell className="font-medium text-blue-700">
                  {item.medicineName}
                </TableCell>
                <TableCell className="text-green-600 font-semibold">
                  {item.qtyAvailable}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.morning}
                    onChange={(e) => updateItem(index, 'morning', Number(e.target.value))}
                    className={cn(
                      "h-9 w-16 text-center",
                      item.morning > 0 ? "text-green-600" : "text-gray-400"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.afternoon}
                    onChange={(e) => updateItem(index, 'afternoon', Number(e.target.value))}
                    className={cn(
                      "h-9 w-16 text-center",
                      item.afternoon > 0 ? "text-green-600" : "text-gray-400"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.night}
                    onChange={(e) => updateItem(index, 'night', Number(e.target.value))}
                    className={cn(
                      "h-9 w-16 text-center",
                      item.night > 0 ? "text-green-600" : "text-gray-400"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.days}
                    onChange={(e) => updateItem(index, 'days', Number(e.target.value))}
                    className="h-9 w-20 text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantityOrdered}
                    readOnly
                    className="h-9 w-20 text-center bg-gray-50"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
