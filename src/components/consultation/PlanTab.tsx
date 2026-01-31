import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Search, Plus, Trash2, Pill } from 'lucide-react';
import { mockMedicines, mockStockItems } from '@/data/mockData';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Available medicines from mock data
  const availableMedicines = useMemo(() => {
    return mockMedicines.map(medicine => {
      const stockItem = mockStockItems.find(s => s.medicineId === medicine.id);
      return {
        id: medicine.id,
        name: medicine.name,
        category: medicine.category,
        qtyAvailable: stockItem?.quantity || 0,
      };
    });
  }, []);

  const filteredMedicines = useMemo(() => {
    if (!searchQuery) return availableMedicines;
    return availableMedicines.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableMedicines, searchQuery]);

  const addMedicine = (medicine: typeof availableMedicines[0]) => {
    // Check if already added
    if (prescriptionItems.some(item => item.medicineName === medicine.name)) {
      setSearchOpen(false);
      setSearchQuery('');
      return;
    }

    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      selected: true,
      medicineName: medicine.name,
      qtyAvailable: medicine.qtyAvailable,
      morning: 1,
      afternoon: 0,
      night: 1,
      days: 7,
      quantityOrdered: 14, // (1+0+1) * 7
    };

    onPrescriptionItemsChange([...prescriptionItems, newItem]);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: number) => {
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

  const removeItem = (index: number) => {
    const updated = prescriptionItems.filter((_, i) => i !== index);
    onPrescriptionItemsChange(updated);
  };

  const getScheduleDisplay = (item: PrescriptionItem) => {
    const parts = [];
    if (item.morning > 0) parts.push(`${item.morning}M`);
    if (item.afternoon > 0) parts.push(`${item.afternoon}A`);
    if (item.night > 0) parts.push(`${item.night}N`);
    return parts.join(' - ') || '0-0-0';
  };

  return (
    <div className="space-y-4">
      {/* Search and Add Medicine */}
      <div className="flex items-center gap-3">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full max-w-md justify-start text-muted-foreground">
              <Search className="mr-2 h-4 w-4" />
              Search and add medicine...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search medicine name..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No medicine found.</CommandEmpty>
                <CommandGroup heading="Available Medicines">
                  {filteredMedicines.map((medicine) => {
                    const isAdded = prescriptionItems.some(item => item.medicineName === medicine.name);
                    return (
                      <CommandItem
                        key={medicine.id}
                        value={medicine.name}
                        onSelect={() => addMedicine(medicine)}
                        disabled={isAdded}
                        className={cn("flex items-center justify-between", isAdded && "opacity-50")}
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-xs text-muted-foreground">{medicine.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={medicine.qtyAvailable > 50 ? "default" : medicine.qtyAvailable > 0 ? "secondary" : "destructive"} className="text-xs">
                            Stock: {medicine.qtyAvailable}
                          </Badge>
                          {isAdded ? (
                            <Badge variant="outline" className="text-xs">Added</Badge>
                          ) : (
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Prescription Table */}
      {prescriptionItems.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Medicine Name</TableHead>
                <TableHead className="text-center font-semibold w-32">Schedule (M-A-N)</TableHead>
                <TableHead className="text-center font-semibold w-24">Days</TableHead>
                <TableHead className="text-center font-semibold w-28">Qty Ordered</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptionItems.map((item, index) => (
                <TableRow key={item.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Pill className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.medicineName}</p>
                        <p className="text-xs text-muted-foreground">
                          Available: <span className={item.qtyAvailable > 50 ? "text-emerald-600" : item.qtyAvailable > 0 ? "text-amber-600" : "text-destructive"}>{item.qtyAvailable}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={item.morning}
                        onChange={(e) => updateItem(index, 'morning', Number(e.target.value))}
                        className={cn(
                          "h-8 w-10 text-center text-sm font-medium",
                          item.morning > 0 ? "border-primary/50 bg-primary/5" : ""
                        )}
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={item.afternoon}
                        onChange={(e) => updateItem(index, 'afternoon', Number(e.target.value))}
                        className={cn(
                          "h-8 w-10 text-center text-sm font-medium",
                          item.afternoon > 0 ? "border-primary/50 bg-primary/5" : ""
                        )}
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={item.night}
                        onChange={(e) => updateItem(index, 'night', Number(e.target.value))}
                        className={cn(
                          "h-8 w-10 text-center text-sm font-medium",
                          item.night > 0 ? "border-primary/50 bg-primary/5" : ""
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={item.days}
                      onChange={(e) => updateItem(index, 'days', Number(e.target.value))}
                      className="h-8 w-16 text-center text-sm font-medium mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                        {item.quantityOrdered}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Pill className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No Medicines Prescribed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Search and add medicines using the search box above
          </p>
        </div>
      )}
    </div>
  );
}
