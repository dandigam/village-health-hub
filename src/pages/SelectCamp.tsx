import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { mockCamps } from '@/data/mockData';
import { useCamp } from '@/context/CampContext';

const campRules = [
  'Volunteers must report on time and follow the assigned duty schedule.',
  'Wear the volunteer ID badge and maintain proper dress and hygiene.',
  'Follow instructions from the Camp Coordinator and medical staff.',
  'Treat all patients with respect, patience, and compassion.',
  'Maintain strict confidentiality of patient information.',
  'Do not provide medical advice unless authorized to do so.',
  'Ensure cleanliness, safety, and orderly crowd management.',
  'Report any emergencies, incidents, or issues immediately to the coordinator.',
];

export default function SelectCamp() {
  const navigate = useNavigate();
  const { setSelectedCamp } = useCamp();
  const [selectedCampId, setSelectedCampId] = useState<string>('');
  const activeCamps = mockCamps.filter((c) => c.status === 'active' || c.status === 'draft');

  const handleContinue = () => {
    if (selectedCampId) {
      const camp = activeCamps.find(c => c.id === selectedCampId);
      if (camp) {
        setSelectedCamp(camp.location);
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-primary/10"
        style={{
          backgroundImage: `url('/placeholder.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
      />

      {/* Header */}
      <header className="relative z-10 h-16 bg-primary flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-bold text-primary-foreground">Srini Foundation</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-primary-foreground" onClick={() => navigate('/login')}>
            Log in
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-muted-foreground">Select your</p>
            <CardTitle className="text-2xl">Camp Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedCampId}
              onValueChange={setSelectedCampId}
              className="flex flex-wrap gap-4 justify-center"
            >
              {activeCamps.map((camp) => (
                <div key={camp.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={camp.id} id={camp.id} />
                  <Label htmlFor={camp.id} className="cursor-pointer font-medium">
                    {camp.location}
                  </Label>
                </div>
              ))}
              <Button
                size="icon"
                className="rounded-full bg-accent hover:bg-accent/90"
                onClick={handleContinue}
                disabled={!selectedCampId}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </RadioGroup>

            {/* Rules Section */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-4">
                Health Camp Volunteer Rules & Regulations
              </h4>
              <ul className="space-y-2">
                {campRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-foreground">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Arrows */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <Button variant="secondary" size="icon" className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
