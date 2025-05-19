
import { PenManagement } from '@/components/settings/PenManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Application Settings</h1>
      <Tabs defaultValue="pens" className="w-full">
        <TabsList>
          <TabsTrigger value="pens">Pen Management</TabsTrigger>
          <TabsTrigger value="general" disabled>General (Coming Soon)</TabsTrigger>
          <TabsTrigger value="account" disabled>Account (Coming Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="pens" className="mt-4">
          <PenManagement />
        </TabsContent>
         <TabsContent value="general">
          {/* Placeholder for General Settings */}
        </TabsContent>
         <TabsContent value="account">
          {/* Placeholder for Account Settings */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
