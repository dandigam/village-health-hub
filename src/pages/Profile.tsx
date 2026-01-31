import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PhotoUpload } from '@/components/shared/PhotoUpload';
import { 
  User,
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Building,
  IdCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Venkatesh Dandigam',
    email: 'venkatesh.dandigam@srinifoundation.org',
    phone: '+91 98765 43210',
    role: 'Camp Admin',
    department: 'Medical Operations',
    employeeId: 'SF-2024-001',
    joinDate: '2024-01-15',
    location: 'Bapatla, Andhra Pradesh',
    photoUrl: '',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handlePhotoCapture = (photoData: string) => {
    setProfile({ ...profile, photoUrl: photoData });
    setShowPhotoUpload(false);
    toast({
      title: "Photo updated",
      description: "Your profile photo has been updated.",
    });
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
                  <p className="text-sm text-muted-foreground">Manage your personal information and preferences</p>
                </div>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Photo Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Profile Photo</CardTitle>
                  <CardDescription>Your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  {showPhotoUpload ? (
                    <div className="w-full">
                      <PhotoUpload 
                        onPhotoChange={(url) => {
                          if (url) handlePhotoCapture(url);
                        }}
                        currentPhoto={profile.photoUrl}
                        name={profile.name}
                      />
                      <Button 
                        variant="ghost" 
                        className="w-full mt-2"
                        onClick={() => setShowPhotoUpload(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={profile.photoUrl} />
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-teal-400 to-teal-600 text-white">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => setShowPhotoUpload(true)}
                      >
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Role & Access Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Role & Access</CardTitle>
                  <CardDescription>Your system permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{profile.role}</p>
                      <p className="text-xs text-muted-foreground">Primary Role</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Manage Patients</Badge>
                      <Badge variant="secondary">View Reports</Badge>
                      <Badge variant="secondary">Manage Staff</Badge>
                      <Badge variant="secondary">Camp Operations</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Employment Info</CardTitle>
                  <CardDescription>Work details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <IdCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{profile.employeeId}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-medium">{profile.department}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Join Date</p>
                      <p className="font-medium">{new Date(profile.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Your contact and personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input 
                        id="email" 
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input 
                        id="location" 
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Activity Summary</CardTitle>
                <CardDescription>Your recent activity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">12</p>
                    <p className="text-sm text-muted-foreground">Camps Managed</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">248</p>
                    <p className="text-sm text-muted-foreground">Patients Registered</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">45</p>
                    <p className="text-sm text-muted-foreground">Staff Assigned</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">156</p>
                    <p className="text-sm text-muted-foreground">Reports Generated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
