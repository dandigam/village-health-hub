import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon,
  Bell, 
  Shield, 
  Palette, 
  Database,
  IdCard,
  Save,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    dailyDigest: false,
  });
  
  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    language: 'en',
  });
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const settingsCards = [
    {
      icon: IdCard,
      title: "ID Card / Tag Printouts",
      description: "Generate and print ID cards for doctors, volunteers, and staff",
      action: () => navigate('/settings/id-cards'),
      color: "text-stat-blue-text",
      bgColor: "bg-stat-blue",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your application preferences and configurations</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-1 gap-4">
          {settingsCards.map((card, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-stat-blue-text"
              onClick={card.action}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
                <Button variant="outline" size="sm">Open</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-stat-orange-text" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-alerts" className="flex-1">Email Alerts</Label>
                    <Switch 
                      id="email-alerts" 
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailAlerts: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-alerts" className="flex-1">SMS Alerts</Label>
                    <Switch 
                      id="sms-alerts" 
                      checked={notifications.smsAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsAlerts: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications" className="flex-1">Push Notifications</Label>
                    <Switch 
                      id="push-notifications" 
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="daily-digest" className="flex-1">Daily Digest</Label>
                    <Switch 
                      id="daily-digest" 
                      checked={notifications.dailyDigest}
                      onCheckedChange={(checked) => setNotifications({...notifications, dailyDigest: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-stat-purple-text" />
                <CardTitle className="text-lg">Appearance</CardTitle>
              </div>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={appearance.theme} 
                      onValueChange={(value) => setAppearance({...appearance, theme: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-mode" className="flex-1">Compact Mode</Label>
                    <Switch 
                      id="compact-mode" 
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) => setAppearance({...appearance, compactMode: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={appearance.language} 
                      onValueChange={(value) => setAppearance({...appearance, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-stat-green-text" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor" className="block">Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch 
                      id="two-factor" 
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Select 
                      value={security.sessionTimeout} 
                      onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Storage */}
              <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-stat-blue-text" />
                <CardTitle className="text-lg">Data & Storage</CardTitle>
              </div>
              <CardDescription>Manage your data and storage</CardDescription>
            </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Local Storage</p>
                      <p className="text-xs text-muted-foreground">2.4 MB used</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-xs text-muted-foreground">Download all your data</p>
                    </div>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
