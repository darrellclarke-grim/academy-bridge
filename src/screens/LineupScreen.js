import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';
import { isPlayerEligibleForSlot } from '../utils/positionHelpers';

export default function LineupScreen({
  activeFormation = '4-2-3-1',
  appMode,
  lineupViewMode,
  setLineupViewMode,
  setIsFormationModalOpen,
  isTafeDisabled,
  openTafeModal,
  isLoadingSheet,
  activeLayout = [],
  renderPosition,
  subs = [],
  setLineupAssignPlayer,
  getFootednessString,
  teamSheet = [],
  setTeamSheet,
  currentAvailablePositions = []
}) {
  // Depth Inspector State
  const [selectedDepthSlot, setSelectedDepthSlot] = useState(null);
  const [drawerMode, setDrawerMode] = useState('inspector'); // 'inspector' | 'add_cover'

  const resolveTop = (node) => {
    const val = node.top !== undefined ? node.top : node.y;
    if (val === undefined) return '50%';
    if (typeof val === 'number') return `${val}%`;
    return String(val).endsWith('%') ? val : `${val}%`;
  };

  const resolveLeft = (node) => {
    const val = node.left !== undefined ? node.left : node.x;
    if (val === undefined) return '50%';
    if (typeof val === 'number') return `${val}%`;
    return String(val).endsWith('%') ? val : `${val}%`;
  };

  // Force pitch mode for non-coaches
  const activeMode = appMode === 'coach' ? lineupViewMode : 'pitch';

  // Helper to categorize depth for a specific pitch slot
  const getDepthForSlot = (slotCode) => {
    const sCode = String(slotCode).toUpperCase();
    const primaries = [];
    const secondaries = [];
    const customCovers = [];

    (teamSheet || []).forEach(p => {
      const pos = String(p.position || '').toUpperCase();
      const sec = String(p.secondary_position || '').toUpperCase();
      const customList = Array.isArray(p.additional_positions) 
        ? p.additional_positions 
        : (typeof p.additional_positions === 'string' ? p.additional_positions.split(',') : []);

      if (pos === sCode || isPlayerEligibleForSlot(pos, sCode)) {
        primaries.push(p);
      } else if (sec === sCode || (sec !== 'NONE' && isPlayerEligibleForSlot(sec, sCode))) {
        secondaries.push(p);
      } else if (customList.some(c => String(c).trim().toUpperCase() === sCode)) {
        customCovers.push(p);
      }
    });

    const totalCount = primaries.length + secondaries.length + customCovers.length;

    // Prioritize the active matchday starter for this slot if assigned
    const currentStarter = (teamSheet || []).find(
      p => p.is_starter && String(p.matchday_position || '').toUpperCase() === sCode
    );
    const topChoice = currentStarter || primaries[0] || secondaries[0] || customCovers[0] || null;

    return { primaries, secondaries, customCovers, totalCount, topChoice, currentStarter };
  };

  // Set selected player as active starter for this slot
  const handleSelectStarterForSlot = async (player, slotCode) => {
    if (!player || !slotCode) return;
    const cleanSlot = String(slotCode).toUpperCase();

    const updatedSheet = (teamSheet || []).map(p => {
      if (p.id === player.id) {
        return { ...p, matchday_position: cleanSlot, is_starter: true, available: true };
      }
      if (p.matchday_position === cleanSlot && p.id !== player.id) {
        return { ...p, matchday_position: 'Bench', is_starter: false };
      }
      return p;
    });

    if (setTeamSheet) {
      setTeamSheet(updatedSheet);
    }

    closeDepthModal();

    try {
      const dbUpdates = [
        supabase.from('players').update({ matchday_position: cleanSlot, is_starter: true, available: true }).eq('id', player.id)
      ];
      const previousStarter = (teamSheet || []).find(p => p.matchday_position === cleanSlot && p.id !== player.id);
      if (previousStarter) {
        dbUpdates.push(supabase.from('players').update({ matchday_position: 'Bench', is_starter: false }).eq('id', previousStarter.id));
      }
      await Promise.all(dbUpdates);
    } catch (err) {
      console.warn('⚠️ Starter update saved locally:', err);
    }
  };

  // Add custom cover position to a player
  const handleAddCoverToPlayer = async (player, slotCode) => {
    if (!slotCode || !player) return;

    // Parse existing positions into an array
    const currentList = Array.isArray(player.additional_positions) 
      ? [...player.additional_positions] 
      : (typeof player.additional_positions === 'string' && player.additional_positions 
          ? player.additional_positions.split(',').map(s => s.trim()) 
          : []);

    const cleanSlot = String(slotCode).toUpperCase();
    if (!currentList.includes(cleanSlot)) {
      currentList.push(cleanSlot);
    }

    // Convert array to a comma-separated string for Supabase storage
    const joinedPositionsStr = currentList.join(',');

    // Update local state immediately so UI refreshes with the purple badge
    if (setTeamSheet) {
      setTeamSheet(prev => prev.map(p => p.id === player.id ? { ...p, additional_positions: joinedPositionsStr } : p));
    }

    setDrawerMode('inspector');

    try {
      await supabase.from('players').update({ additional_positions: joinedPositionsStr }).eq('id', player.id);
    } catch (err) {
      console.warn('⚠️ Cover update saved locally:', err);
    }
  };

  const closeDepthModal = () => {
    setSelectedDepthSlot(null);
    setDrawerMode('inspector');
  };

  // Single Pitch Depth Node Renderer
  const renderUnifiedDepthPosition = (node) => {
    const topPos = resolveTop(node);
    const leftPos = resolveLeft(node);
    const depthInfo = getDepthForSlot(node.code);
    const extraCover = Math.max(0, depthInfo.totalCount - 1);

    return (
      <TouchableOpacity
        key={node.code}
        style={[styles.positionContainer, { top: topPos, left: leftPos }]}
        onPress={() => {
          setSelectedDepthSlot(node);
          setDrawerMode('inspector');
        }}
      >
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{node.label}</Text></View>
          {depthInfo.totalCount > 0 && (
            <View style={styles.depthCountPill}>
              <Text style={styles.depthCountText}>{depthInfo.totalCount} Depth</Text>
            </View>
          )}
        </View>

        {depthInfo.topChoice ? (
          <View style={[styles.playerCard, { backgroundColor: '#39FF14' }]}>
            <Text style={[styles.playerName, { color: '#0B0E14' }]} numberOfLines={1}>
              #{depthInfo.topChoice.squad_number || ''} {depthInfo.topChoice.name}
            </Text>
            {extraCover > 0 && (
              <Text style={styles.extraCoverSub}>+{extraCover} Cover</Text>
            )}
          </View>
        ) : (
          <View style={[styles.playerCard, { backgroundColor: 'rgba(11, 14, 20, 0.7)', borderColor: '#ef4444', borderWidth: 1 }]}>
            <Text style={[styles.playerName, { color: '#ef4444' }]}>No Cover</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Real Vector Football Pitch Canvas Renderer
  const renderRealPitchCanvas = (children) => (
    <View style={styles.pitchCanvasFrame}>
      <View style={styles.pitchGoalTopFrame} />
      <View style={styles.pitchTurfBody}>
        <View style={styles.pitchOuterBoundary} />
        <View style={styles.pitchHalfwayLine} />
        <View style={styles.pitchCenterCircle} />
        <View style={styles.pitchCenterSpot} />
        <View style={styles.pitchPenaltyBoxTop} />
        <View style={styles.pitchGoalBoxTop} />
        <View style={styles.pitchPenaltySpotTop} />
        <View style={styles.pitchPenaltyArcTop} />
        <View style={styles.pitchPenaltyBoxBottom} />
        <View style={styles.pitchGoalBoxBottom} />
        <View style={styles.pitchPenaltySpotBottom} />
        <View style={styles.pitchPenaltyArcBottom} />
        <View style={[styles.cornerArc, { top: 10, left: 10, borderBottomRightRadius: 10 }]} />
        <View style={[styles.cornerArc, { top: 10, right: 10, borderBottomLeftRadius: 10 }]} />
        <View style={[styles.cornerArc, { bottom: 10, left: 10, borderTopRightRadius: 10 }]} />
        <View style={[styles.cornerArc, { bottom: 10, right: 10, borderTopLeftRadius: 10 }]} />

        <View style={styles.pitchOverlayLayer}>{children}</View>
      </View>
      <View style={styles.pitchGoalBottomFrame} />
    </View>
  );

  const activeDepthData = selectedDepthSlot ? getDepthForSlot(selectedDepthSlot.code) : null;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>SYSTEM: {activeFormation}</Text>
        <Text style={styles.headerTitle}>Match Day Lineup</Text>
      </View>

      {/* VIEW MODE TOGGLES (COACH ONLY) */}
      {appMode === 'coach' && (
        <View style={styles.toggleBar}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'pitch' && styles.toggleBtnActive]}
            onPress={() => setLineupViewMode && setLineupViewMode('pitch')}
          >
            <Text style={[styles.toggleBtnText, activeMode === 'pitch' && styles.toggleBtnTextActive]}>
              ⚽ Pitch Lineup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'depth' && styles.toggleBtnActive]}
            onPress={() => setLineupViewMode && setLineupViewMode('depth')}
          >
            <Text style={[styles.toggleBtnText, activeMode === 'depth' && styles.toggleBtnTextActive]}>
              📊 Squad Depth Inspector
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* COACH-ONLY ACTION CONTROLS */}
      {appMode === 'coach' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.systemSelectBtn}
            onPress={() => setIsFormationModalOpen && setIsFormationModalOpen(true)}
          >
            <Text style={styles.systemSelectText}>System: {activeFormation} (Change ▼)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tafeBtn, isTafeDisabled && { opacity: 0.5 }]}
            disabled={isTafeDisabled}
            onPress={openTafeModal}
          >
            <Text style={styles.tafeBtnText}>⚡ TAFE Auto-Fill</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {activeMode === 'pitch' ? (
          <>
            <Text style={styles.instructionText}>
              {appMode === 'coach'
                ? 'Coach Mode: Tap any player on pitch or bench to reassign roles.'
                : 'Matchday Tactical Pitch Setup'}
            </Text>

            {renderRealPitchCanvas(
              (activeLayout || []).map((node) => {
                const topPos = resolveTop(node);
                const leftPos = resolveLeft(node);
                return renderPosition ? renderPosition(node.code, node.label, topPos, leftPos) : null;
              })
            )}

            {/* BENCH LIST */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SUBSTITUTES BENCH ({subs.length})</Text>
              <View style={styles.benchGrid}>
                {subs.length === 0 ? (
                  <Text style={styles.emptyText}>No substitutes assigned to bench.</Text>
                ) : (
                  subs.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.benchChip}
                      onPress={() => appMode === 'coach' && setLineupAssignPlayer && setLineupAssignPlayer(p)}
                    >
                      <Text style={styles.benchPos}>SUB</Text>
                      <Text style={styles.benchName} numberOfLines={1}>
                        #{p.squad_number || 0} {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* UNIFIED SQUAD DEPTH PITCH VIEW */}
            <Text style={styles.instructionText}>
              Tap any position on the pitch to inspect coverage or set your matchday starter.
            </Text>

            {renderRealPitchCanvas(
              (activeLayout || []).map((node) => renderUnifiedDepthPosition(node))
            )}
          </>
        )}
      </ScrollView>

      {/* SINGLE UNIFIED DEPTH INSPECTOR DRAWER */}
      <Modal visible={!!selectedDepthSlot} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDepthModal} />
          
          <View style={[styles.modalBox, { maxHeight: '82%' }]}>
            {drawerMode === 'inspector' ? (
              <>
                <Text style={styles.modalTitle}>Position Depth: {selectedDepthSlot?.label}</Text>
                <Text style={styles.modalSub}>
                  Tap any player below to set them as the starting player for {selectedDepthSlot?.label}:
                </Text>

                <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
                  {/* 🟢 PRIMARY ROLE PLAYERS */}
                  <Text style={[styles.drawerSectionHeader, { color: '#39FF14' }]}>🟢 PRIMARY ROLE PLAYERS</Text>
                  {activeDepthData?.primaries.length === 0 ? (
                    <Text style={styles.noneText}>No primary players configured for this slot.</Text>
                  ) : (
                    activeDepthData?.primaries.map(p => {
                      const isStarter = p.is_starter && String(p.matchday_position || '').toUpperCase() === String(selectedDepthSlot?.code).toUpperCase();
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.depthPlayerRow, { borderColor: isStarter ? '#39FF14' : '#2E3A44', backgroundColor: isStarter ? 'rgba(57, 255, 20, 0.12)' : '#0B0E14' }]}
                          onPress={() => handleSelectStarterForSlot(p, selectedDepthSlot?.code)}
                        >
                          <Text style={styles.depthPlayerName}>#{p.squad_number || ''} {p.name}</Text>
                          <Text style={[styles.depthBadgePill, { backgroundColor: isStarter ? '#39FF14' : '#2E3A44', color: isStarter ? '#0B0E14' : '#39FF14' }]}>
                            {isStarter ? 'Starter ⚽' : 'Select Starter'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}

                  {/* 🔵 SECONDARY ROLE PLAYERS */}
                  <Text style={[styles.drawerSectionHeader, { color: '#3B82F6', marginTop: 15 }]}>🔵 SECONDARY COVER PLAYERS</Text>
                  {activeDepthData?.secondaries.length === 0 ? (
                    <Text style={styles.noneText}>No secondary cover configured for this slot.</Text>
                  ) : (
                    activeDepthData?.secondaries.map(p => {
                      const isStarter = p.is_starter && String(p.matchday_position || '').toUpperCase() === String(selectedDepthSlot?.code).toUpperCase();
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.depthPlayerRow, { borderColor: isStarter ? '#3B82F6' : '#2E3A44', backgroundColor: isStarter ? 'rgba(59, 130, 246, 0.12)' : '#0B0E14' }]}
                          onPress={() => handleSelectStarterForSlot(p, selectedDepthSlot?.code)}
                        >
                          <Text style={styles.depthPlayerName}>#{p.squad_number || ''} {p.name}</Text>
                          <Text style={[styles.depthBadgePill, { backgroundColor: isStarter ? '#3B82F6' : '#2E3A44', color: '#ffffff' }]}>
                            {isStarter ? 'Starter ⚽' : 'Select Starter'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}

                  {/* 🟣 COACH-ADDED CUSTOM COVER */}
                  <Text style={[styles.drawerSectionHeader, { color: '#A855F7', marginTop: 15 }]}>🟣 COACH-ADDED CUSTOM COVER</Text>
                  {activeDepthData?.customCovers.length === 0 ? (
                    <Text style={styles.noneText}>No custom cover assigned to this slot.</Text>
                  ) : (
                    activeDepthData?.customCovers.map(p => {
                      const isStarter = p.is_starter && String(p.matchday_position || '').toUpperCase() === String(selectedDepthSlot?.code).toUpperCase();
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.depthPlayerRow, { borderColor: isStarter ? '#A855F7' : '#2E3A44', backgroundColor: isStarter ? 'rgba(168, 85, 247, 0.12)' : '#0B0E14' }]}
                          onPress={() => handleSelectStarterForSlot(p, selectedDepthSlot?.code)}
                        >
                          <Text style={styles.depthPlayerName}>#{p.squad_number || ''} {p.name}</Text>
                          <Text style={[styles.depthBadgePill, { backgroundColor: isStarter ? '#A855F7' : '#2E3A44', color: '#ffffff' }]}>
                            {isStarter ? 'Starter ⚽' : 'Select Starter'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.addCoverBtn}
                  onPress={() => setDrawerMode('add_cover')}
                >
                  <Text style={styles.addCoverBtnText}>➕ Add Squad Cover to {selectedDepthSlot?.label}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeDepthModal}>
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Assign Cover: {selectedDepthSlot?.label}</Text>
                <Text style={styles.modalSub}>Tap any player below to add {selectedDepthSlot?.label} to their cover roles:</Text>

                <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
                  {teamSheet.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.pickerPlayerRow}
                      onPress={() => handleAddCoverToPlayer(p, selectedDepthSlot?.code)}
                    >
                      <View>
                        <Text style={styles.pickerPlayerName}>#{p.squad_number || ''} {p.name}</Text>
                        <Text style={styles.pickerPlayerPosSub}>Primary: {p.position} | Sec: {p.secondary_position || 'None'}</Text>
                      </View>
                      <Text style={styles.assignPillText}>Assign ➕</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => setDrawerMode('inspector')}>
                  <Text style={styles.cancelBtnText}>← Back to Depth Inspector</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  header: { backgroundColor: '#1A1F26', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  headerSub: { color: '#39FF14', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  toggleBar: { flexDirection: 'row', backgroundColor: '#1A1F26', borderBottomWidth: 1, borderBottomColor: '#2E3A44' },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  toggleBtnActive: { borderBottomWidth: 3, borderBottomColor: '#39FF14' },
  toggleBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  toggleBtnTextActive: { color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', gap: 10, padding: 15, paddingBottom: 0 },
  systemSelectBtn: { flex: 1, backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#39FF14' },
  systemSelectText: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  tafeBtn: { flex: 1, backgroundColor: '#39FF14', padding: 12, borderRadius: 8, alignItems: 'center' },
  tafeBtnText: { color: '#0B0E14', fontWeight: 'bold', fontSize: 12 },
  content: { padding: 15 },
  instructionText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 12 },

  // PITCH CANVAS STYLES
  pitchCanvasFrame: { width: '100%', marginVertical: 10, alignItems: 'center', marginBottom: 20 },
  pitchGoalTopFrame: { width: 60, height: 6, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderBottomLeftRadius: 3, borderBottomRightRadius: 3, marginBottom: 2 },
  pitchGoalBottomFrame: { width: 60, height: 6, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderTopLeftRadius: 3, borderTopRightRadius: 3, marginTop: 2 },
  pitchTurfBody: { width: '100%', height: 420, backgroundColor: '#0D2B16', borderRadius: 8, borderWidth: 2, borderColor: '#1E4D2B', position: 'relative', overflow: 'hidden' },
  pitchOuterBoundary: { position: 'absolute', top: 10, bottom: 10, left: 10, right: 10, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchHalfwayLine: { position: 'absolute', top: '50%', left: 10, right: 10, height: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.85)' },
  pitchCenterCircle: { position: 'absolute', top: '50%', left: '50%', width: 80, height: 80, marginLeft: -40, marginTop: -40, borderRadius: 40, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchCenterSpot: { position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: 3, backgroundColor: '#FFFFFF' },
  pitchPenaltyBoxTop: { position: 'absolute', top: 10, left: '22%', right: '22%', height: 60, borderWidth: 1.5, borderTopWidth: 0, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchGoalBoxTop: { position: 'absolute', top: 10, left: '36%', right: '36%', height: 22, borderWidth: 1.5, borderTopWidth: 0, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchPenaltySpotTop: { position: 'absolute', top: 52, left: '50%', width: 4, height: 4, marginLeft: -2, borderRadius: 2, backgroundColor: '#FFFFFF' },
  pitchPenaltyArcTop: { position: 'absolute', top: 54, left: '40%', width: '20%', height: 20, borderRadius: 20, borderWidth: 1.5, borderTopWidth: 0, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchPenaltyBoxBottom: { position: 'absolute', bottom: 10, left: '22%', right: '22%', height: 60, borderWidth: 1.5, borderBottomWidth: 0, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchGoalBoxBottom: { position: 'absolute', bottom: 10, left: '36%', right: '36%', height: 22, borderWidth: 1.5, borderBottomWidth: 0, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchPenaltySpotBottom: { position: 'absolute', bottom: 52, left: '50%', width: 4, height: 4, marginLeft: -2, borderRadius: 2, backgroundColor: '#FFFFFF' },
  pitchPenaltyArcBottom: { position: 'absolute', bottom: 54, left: '40%', width: '20%', height: 20, borderRadius: 20, borderWidth: 1.5, borderBottomWidth: 0, borderColor: 'rgba(255, 255, 255, 0.85)' },
  cornerArc: { position: 'absolute', width: 10, height: 10, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.85)' },
  pitchOverlayLayer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 },

  card: { backgroundColor: '#1A1F26', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2E3A44' },
  cardTitle: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5, marginBottom: 10 },
  benchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  benchChip: { backgroundColor: '#0B0E14', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', minWidth: '45%', flex: 1 },
  benchPos: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  benchName: { color: '#CBD5E1', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },

  // PITCH PIN STYLES
  positionContainer: { position: 'absolute', alignItems: 'center', width: 120, marginLeft: -60, marginTop: -15, zIndex: 10 },
  badgeRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 2 },
  badge: { backgroundColor: '#2E3A44', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#39FF14', fontSize: 10, fontWeight: 'bold' },
  depthCountPill: { backgroundColor: '#3b82f6', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  depthCountText: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
  playerCard: { backgroundColor: '#ffffff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2, alignItems: 'center' },
  playerName: { color: '#0B0E14', fontSize: 10, fontWeight: 'bold' },
  extraCoverSub: { color: '#0B0E14', fontSize: 8, fontWeight: 'bold', opacity: 0.8 },

  // MODAL & DRAWER STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '92%', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#2E3A44' },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSub: { color: '#94a3b8', fontSize: 12, marginBottom: 15, textAlign: 'center' },
  drawerSectionHeader: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },
  noneText: { color: '#64748b', fontSize: 11, fontStyle: 'italic', marginBottom: 8 },
  depthPlayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  depthPlayerName: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  depthBadgePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 10, fontWeight: 'bold' },
  addCoverBtn: { backgroundColor: '#A855F7', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  addCoverBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  pickerPlayerRow: { backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2E3A44', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerPlayerName: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  pickerPlayerPosSub: { color: '#94a3b8', fontSize: 11 },
  assignPillText: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }
});