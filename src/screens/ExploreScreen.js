import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const categories = [
    { id: '1', title: '🧠 Tactical Manuals', desc: 'Position-specific responsibilities & pitch guides', icon: '📋' },
    { id: '2', title: '📹 Video Analysis', desc: 'Breakdowns of pressing triggers & transition phases', icon: '🎥' },
    { id: '3', title: '⚽ Drill Library', desc: 'Warmups, Rondos, SSGs, and match realistic sessions', icon: '🏃' },
    { id: '4', title: '📊 Scout Reports', desc: 'Opponent analysis and tactical counter-measures', icon: '🔍' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>TACTICAL HUB</Text>
        <Text style={styles.headerTitle}>Explore Engine Library</Text>
      </View>

      <ScrollView style={styles.content}>
        {categories.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  header: { backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  content: { padding: 15 },
  card: {
    backgroundColor: '#1A1F26',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E3A44',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 16 },
  arrow: { color: '#39FF14', fontSize: 18, fontWeight: 'bold' },
});