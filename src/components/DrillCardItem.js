import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DrillCardItem({ drill, phaseLabel, openDrillVideo }) {
  if (!drill) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  const safeParse = (val) => {
    if (!val) return null;
    if (typeof val !== 'string') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  };

  const setupGrid = safeParse(drill.setupGrid || drill.setup_grid || drill.setup_instructions);
  const passingSeq = safeParse(drill.passingSeq || drill.passing_sequence);
  const coachingTriggers = safeParse(drill.coachingTriggers || drill.coaching_triggers || drill.uefa_coaching_trigger);
  const matchContext = drill.matchContext || drill.match_context || drill.tactical_objective;
  const asciiText = drill.ascii_diagram || drill.asciiDiagram || drill.diagramUrl || drill.diagram_url;
  const videoUrl = drill.video_url || drill.videoUrl;

  return (
    <View style={styles.card}>
      {phaseLabel ? <Text style={styles.sectionHeaderModal}>{phaseLabel}</Text> : null}
      {drill.category ? <Text style={styles.categoryBadgeText}>{drill.category}</Text> : null}
      <Text style={[styles.roleTitle, { marginBottom: 5 }]}>{drill.title}</Text>
      <Text style={styles.bulletText}>{drill.summary || drill.description || drill.desc || drill.tactical_objective}</Text>

      <View style={styles.drillActionRow}>
        <TouchableOpacity 
          style={styles.expandTouchable} 
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandTouchableText}>
            {isExpanded ? '▲ Hide full description' : '▼ View full description'}
          </Text>
        </TouchableOpacity>

        {videoUrl ? (
          <TouchableOpacity style={styles.videoBtnSmall} onPress={() => openDrillVideo(videoUrl)}>
            <Text style={styles.videoBtnTextSmall}>▶️ Watch Video</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isExpanded && (
        <View style={styles.drillExpandedBox}>
          {asciiText && (asciiText.includes('[') || asciiText.includes('\n') || asciiText.includes('|')) ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailBlockHeader}>Spatial ASCII Pitch Layout:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.asciiContainer}>
                <Text style={styles.asciiText}>{asciiText}</Text>
              </ScrollView>
            </View>
          ) : null}

          {setupGrid ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailBlockHeader}>Grid Setup & Dimensions:</Text>
              {typeof setupGrid === 'string' ? (
                <Text style={styles.bulletText}>• {setupGrid}</Text>
              ) : (
                <>
                  {setupGrid.dimensions ? (
                    <Text style={styles.detailSubText}>📐 {setupGrid.dimensions}</Text>
                  ) : null}

                  {setupGrid.cones?.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.boldTextLabel}>Cones & Markers:</Text>
                      {setupGrid.cones.map((cone, cIdx) => (
                        <Text key={cIdx} style={styles.bulletText}>
                          • <Text style={styles.boldText}>{cone.label}:</Text> {cone.detail}
                        </Text>
                      ))}
                    </View>
                  )}

                  {setupGrid.personnel?.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.boldTextLabel}>Personnel Requirements:</Text>
                      {setupGrid.personnel.map((person, pIdx) => (
                        <Text key={pIdx} style={styles.bulletText}>• {person}</Text>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          ) : null}

          {passingSeq && Array.isArray(passingSeq) && passingSeq.length > 0 && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailBlockHeader}>Passing & Movement Sequence:</Text>
              {passingSeq.map((stepItem, sIdx) => (
                <View key={sIdx} style={styles.seqStepRow}>
                  <Text style={styles.seqStepBadge}>Step {stepItem.step || sIdx + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.seqStepTitle}>{stepItem.title}</Text>
                    <Text style={styles.bulletText}>{stepItem.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {coachingTriggers ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailBlockHeader}>UEFA-Pro Coaching Triggers:</Text>
              {typeof coachingTriggers === 'string' ? (
                <View style={styles.triggerCardBox}>
                  <Text style={styles.triggerTitleText}>⚡ Key Focus</Text>
                  <Text style={styles.bulletText}>{coachingTriggers}</Text>
                </View>
              ) : Array.isArray(coachingTriggers) ? (
                coachingTriggers.map((trig, tIdx) => (
                  <View key={tIdx} style={styles.triggerCardBox}>
                    <Text style={styles.triggerTitleText}>⚡ {trig.title || 'Trigger'}</Text>
                    <Text style={styles.bulletText}>{trig.detail || trig}</Text>
                  </View>
                ))
              ) : null}
            </View>
          ) : null}

          {matchContext ? (
            <View style={styles.matchContextCard}>
              <Text style={styles.matchContextTitle}>Match Context Application:</Text>
              <Text style={styles.matchContextText}>{typeof matchContext === 'string' ? matchContext : JSON.stringify(matchContext)}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1A1F26', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#2E3A44', borderWidth: 1 },
  sectionHeaderModal: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 10, textTransform: 'uppercase', alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2E3A44', paddingBottom: 4, width: '100%' },
  roleTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  bulletText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, lineHeight: 20 },
  categoryBadgeText: { color: '#39FF14', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  drillActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2E3A44' },
  expandTouchable: { paddingVertical: 4 },
  expandTouchableText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  videoBtnSmall: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', alignSelf: 'flex-start', marginTop: 5, borderWidth: 1, borderColor: '#39FF14' },
  videoBtnTextSmall: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  drillExpandedBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2E3A44' },
  detailBlock: { marginBottom: 12 },
  detailBlockHeader: { color: '#39FF14', fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  detailSubText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic', marginBottom: 4 },
  boldTextLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: 'bold', marginTop: 4, marginBottom: 2 },
  boldText: { color: '#ffffff', fontWeight: 'bold' },
  seqStepRow: { flexDirection: 'row', backgroundColor: '#0B0E14', padding: 8, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#2E3A44' },
  seqStepBadge: { backgroundColor: '#39FF14', color: '#0B0E14', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, height: 18, marginRight: 8 },
  seqStepTitle: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  triggerCardBox: { backgroundColor: '#0B0E14', borderLeftWidth: 3, borderLeftColor: '#39FF14', padding: 8, borderRadius: 4, marginBottom: 6 },
  triggerTitleText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  matchContextCard: { backgroundColor: 'rgba(57, 255, 20, 0.1)', borderColor: 'rgba(57, 255, 20, 0.3)', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 6 },
  matchContextTitle: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  matchContextText: { color: '#cbd5e1', fontSize: 12, lineHeight: 17 },
  asciiContainer: { backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginVertical: 10, borderWidth: 1, borderColor: '#2E3A44' },
  asciiText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#39FF14', fontSize: 11, lineHeight: 14 }
});