import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PdfExportModal({
  visible,
  onClose,
  isPdfExportModalOpen,
  setIsPdfExportModalOpen,
  pdfExportStep,
  setPdfExportStep,
  exportMatchdaySummary,
  teamSheet,
  myTeams,
  activeTeamId,
  activeTeamObj,
  effectiveAgeGroup,
  teamLogoUrl,
  generatePlayerReportCard
}) {
  // Defensive fallbacks for prop names
  const isVisible = visible !== undefined ? Boolean(visible) : Boolean(isPdfExportModalOpen);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else if (typeof setIsPdfExportModalOpen === 'function') {
      setIsPdfExportModalOpen(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {pdfExportStep === 'type' ? (
            <>
              <Text style={styles.modalTitle}>📄 EXPORT BRANDED PDF</Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 15, textAlign: 'center' }}>
                Select the report format to generate:
              </Text>

              <TouchableOpacity
                style={styles.inviteRow}
                onPress={() => {
                  handleClose();
                  if (typeof exportMatchdaySummary === 'function') exportMatchdaySummary();
                }}
              >
                <View>
                  <Text style={styles.inviteName}>🏆 Full Team Season Report</Text>
                  <Text style={[styles.inviteCodeText, { color: '#64748B', marginTop: 2, fontWeight: 'normal' }]}>
                    Complete team record, honours, squad stats
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inviteRow}
                onPress={() => setPdfExportStep && setPdfExportStep('player_select')}
              >
                <View>
                  <Text style={styles.inviteName}>👤 Individual Player Report</Text>
                  <Text style={[styles.inviteCodeText, { color: '#64748B', marginTop: 2, fontWeight: 'normal' }]}>
                    360° matrix, match stats, and notes
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { marginTop: 10 }]}
                onPress={handleClose}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.modalTitle}>Select Player</Text>
                <TouchableOpacity onPress={() => setPdfExportStep && setPdfExportStep('type')}>
                  <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>⬅ Back</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                {(teamSheet || []).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.inviteRow}
                    onPress={async () => {
                      handleClose();
                      const currentTeam = (myTeams || []).find((t) => t.id === activeTeamId);
                      if (typeof generatePlayerReportCard === 'function') {
                        await generatePlayerReportCard({
                          player: p,
                          teamName: currentTeam?.name || activeTeamObj?.name || 'Tactical Engine Squad',
                          ageGroup: currentTeam?.age_group || effectiveAgeGroup || 'Youth',
                          clubLogoUrl: currentTeam?.logo_url || teamLogoUrl || null
                        });
                      }
                    }}
                  >
                    <Text style={styles.inviteName}>#{p.squad_number || 0} {p.name}</Text>
                    <Text style={{ color: '#39FF14', fontWeight: 'bold', fontSize: 12 }}>{p.position || 'CM'} ➔</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.cancelBtn, { marginTop: 10 }]}
                onPress={handleClose}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalBox: { backgroundColor: '#1A1F26', width: '88%', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2E3A44', zIndex: 5 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0E14', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2E3A44' },
  inviteName: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  inviteCodeText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  cancelBtn: { padding: 10, alignItems: 'center', width: '100%' },
  cancelBtnText: { color: '#94a3b8', fontSize: 14 },
});