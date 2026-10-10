import { Tabs, TabSlot } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ height: '100%' }} />
    </Tabs>
  );
}