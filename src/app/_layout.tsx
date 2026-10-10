import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

// Sidebar Context so any component can open/close the drawer
const SidebarContext = createContext<{
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}>({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />

        {/* Tactical Engine Sidebar Drawer Modal */}
        <Modal
          visible={isOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={closeSidebar}
        >
          <View style={styles.modalOverlay}>
            {/* Tap outside to close */}
            <Pressable style={styles.backdrop} onPress={closeSidebar} />

            {/* Drawer Panel */}
            <SafeAreaView style={styles.drawerContainer}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>⚡ Tactical Engine</Text>
                <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={closeSidebar}>
                  <Text style={styles.menuIcon}>📊</Text>
                  <Text style={styles.menuText}>Matchday Hub</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={closeSidebar}>
                  <Text style={styles.menuIcon}>📋</Text>
                  <Text style={styles.menuText}>Squad RSVPs</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={closeSidebar}>
                  <Text style={styles.menuIcon}>🛡️</Text>
                  <Text style={styles.menuText}>Lineup & Tactics</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={closeSidebar}>
                  <Text style={styles.menuIcon}>🏆</Text>
                  <Text style={styles.menuText}>Leaderboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={closeSidebar}>
                  <Text style={styles.menuIcon}>⚙️</Text>
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.drawerFooter}>
                <Text style={styles.footerText}>Tactical Engine v1.0.0</Text>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </ThemeProvider>
    </SidebarContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContainer: {
    width: 270,
    height: '100%',
    backgroundColor: '#0B0E14',
    borderRightWidth: 1,
    borderRightColor: '#1f2937',
    paddingHorizontal: 18,
    paddingVertical: 16,
    zIndex: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  drawerTitle: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItems: {
    marginTop: 20,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});