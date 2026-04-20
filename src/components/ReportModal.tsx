import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Coordinate, Report, ReportType } from '../constants/types';

interface Props {
  visible: boolean;
  location: Coordinate | null;
  onClose: () => void;
  onReport: (report: Report) => void;
}

const REPORT_TYPES: { id: ReportType; icon: string; label: string; color: string }[] = [
  { id: 'nice_spot', icon: '🌳', label: 'Nice spot', color: '#10B981' },
  { id: 'hazard', icon: '⚠️', label: 'Hazard', color: '#EF4444' },
  { id: 'no_shade', icon: '🌞', label: 'No shade here', color: '#F59E0B' },
  { id: 'construction', icon: '🚧', label: 'Construction', color: '#8B5CF6' },
];

const REPORT_MARKER_ICONS: Record<ReportType, string> = {
  nice_spot: '🌳',
  hazard: '⚠️',
  no_shade: '🌞',
  construction: '🚧',
};

export { REPORT_MARKER_ICONS };

export default function ReportModal({ visible, location, onClose, onReport }: Props) {
  const handleReport = (type: ReportType) => {
    if (location) {
      onReport({
        id: Date.now().toString(),
        type,
        location,
        timestamp: Date.now(),
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Report something</Text>
          <Text style={styles.subtitle}>Drop a pin at your current location</Text>

          <View style={styles.grid}>
            {REPORT_TYPES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.option, { borderColor: item.color + '50' }]}
                onPress={() => handleReport(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <Text style={[styles.optionLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingBottom: 44,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 22,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.subtext, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  option: {
    width: '47%',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.cardBg,
  },
  optionIcon: { fontSize: 30 },
  optionLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 16, color: COLORS.subtext },
});
