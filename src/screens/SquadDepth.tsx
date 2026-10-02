import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock Data mimicking your roster + new RSVP/Injury flags
const mockRoster = [
  { id: 1, name: "Kali", pos: "ST", status: "fit", available: true },
  { id: 2, name: "Lew", pos: "CM", status: "fit", available: true },
  { id: 3, name: "JJ", pos: "LW", status: "injured", available: false },
  { id: 4, name: "Ben", pos: "CB", status: "fit", available: true },
  { id: 5, name: "Henry", pos: "GK", status: "doubtful", available: true }
];

export default function SquadDepthVisualizer() {
  const [viewMode, setViewMode] = useState('coachPref'); 

  // Helper to place players on the pitch
  const renderPosition = (positionCode, label, top, left) => {
    const playersInPos = mockRoster.filter(p => p.pos === positionCode);
    
    return (
      <View style={[styles.positionContainer, { top, left }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
        {playersInPos.map(player => (
          <View key={player.id} style={[styles.playerCard, !player.available && styles.playerUnavailable]}>
            {player.status === 'injured' && <Text style={styles.statusIcon}>🔴 </Text>}
            {player.status === 'doubtful' && <Text style={styles.statusIcon}>🟡 </Text>}
            <Text style={styles.playerName}>{player.name}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>Tactical Development Hub</Text>
        <Text style={styles.headerTitle}>Squad Depth</Text>
        <Text style={styles.headerInfo}>U16s • 4-2-3-1 Template</Text>
      </View>

      {/* Toggles */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'coachPref' && styles.activeToggle]} 
          onPress={() => setViewMode('coachPref')}
        >
          <Text style={[styles.toggleText, viewMode === 'coachPref' && styles.activeToggleText]}>Coach Preferred</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'playerPref' && styles.activeToggle]} 
          onPress={() => setViewMode('playerPref')}
        >
          <Text style={[styles.toggleText, viewMode === 'playerPref' && styles.activeToggleText]}>Player Preferred</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* The Tactical Pitch */}
        <View style={styles.pitch}>
          {/* Pitch Markings */}
          <View style={styles.halfwayLine} />
          <View style={styles.centerCircle} />
          <View style={styles.penaltyBoxTop} />
          <View style={styles.penaltyBoxBottom} />

          {/* Render Positions */}
          {renderPosition('ST', 'ST', '10%', '50%')}
          {renderPosition('LW', 'LW', '25%', '20%')}
          {renderPosition('CAM', 'CAM', '25%', '50%')}
          {renderPosition('RW', 'RW', '25%', '80%')}
          {renderPosition('CM', 'LCM', '45%', '30%')}
          {renderPosition('CM', 'RCM', '45%', '70%')}
          {renderPosition('LB', 'LB', '65%', '15%')}
          {renderPosition('CB', 'LCB', '70%', '35%')}
          {renderPosition('CB', 'RCB', '70%', '65%')}
          {renderPosition('RB', 'RB', '65%', '85%')}
          {renderPosition('GK', 'GK', '88%', '50%')}
        </View>

        {/* Insights Panel */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Automated Insights</Text>
          <Text style={styles.insightText}>⚠️ <Text style={styles.insightBold}>Shortage Alert:</Text> Only 0 players assigned to LB.</Text>
          <Text style={styles.insightText}>🔴 <Text style={styles.insightBold}>Injury Update:</Text> JJ (LW) is marked as injured.</Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

// Styling (Marlow United Navy, Orange & Pitch Green)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a192f' },
  header: { backgroundColor: '#112240', padding: 20, borderBottomWidth: 1, borderBottomColor: '#233554' },
  headerSub: { color: '#f97316', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  headerInfo: { color: '#94a3b8', fontSize: 14, marginTop: 5 },
  
  toggleContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#0a192f', gap: 10 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 6, backgroundColor: '#112240', borderWidth: 1, borderColor: '#233554', alignItems: 'center' },
  activeToggle: { backgroundColor: '#f97316', borderColor: '#f97316' },
  toggleText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14 },
  activeToggleText: { color: '#ffffff' },
  
  scrollContent: { padding: 15, alignItems: 'center', paddingBottom: 40 },
  
  pitch: { width: '100%', height: 500, backgroundColor: '#15803d', borderRadius: 10, borderWidth: 2, borderColor: '#ffffff', position: 'relative', overflow: 'hidden' },
  halfwayLine: { position: 'absolute', top: '50%', width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  centerCircle: { position: 'absolute', top: '50%', left: '50%', width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', transform: [{ translateX: -35 }, { translateY: -35 }] },
  penaltyBoxTop: { position: 'absolute', top: 0, left: '25%', width: '50%', height: '15%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderTopWidth: 0 },
  penaltyBoxBottom: { position: 'absolute', bottom: 0, left: '25%', width: '50%', height: '15%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderBottomWidth: 0 },
  
  positionContainer: { position: 'absolute', alignItems: 'center', width: 60, transform: [{ translateX: -30 }, { translateY: -15 }] },
  badge: { backgroundColor: '#1e3a8a', borderWidth: 1, borderColor: '#f97316', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, marginBottom: 4 },
  badgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 10 },
  
  playerCard: { backgroundColor: '#ffffff', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', marginBottom: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  playerUnavailable: { opacity: 0.5, backgroundColor: '#e2e8f0' },
  playerName: { color: '#0f172a', fontSize: 10, fontWeight: 'bold' },
  statusIcon: { fontSize: 8 },

  insightsCard: { backgroundColor: '#112240', borderRadius: 10, padding: 15, width: '100%', marginTop: 20, borderColor: '#233554', borderWidth: 1 },
  insightsTitle: { color: '#f97316', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', marginBottom: 10 },
  insightText: { color: '#cbd5e1', fontSize: 13, marginBottom: 6 },
  insightBold: { color: '#ffffff', fontWeight: 'bold' }
});