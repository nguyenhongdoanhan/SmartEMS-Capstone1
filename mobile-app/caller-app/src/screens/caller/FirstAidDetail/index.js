/**
 * C-07 · Chi tiết hướng dẫn sơ cứu:
 * - Header: back + tên chủ đề (set động từ route param ở AppNavigator)
 * - Khung minh họa hồng nhạt + badge "KHẨN CẤP" (chủ đề nguy cấp)
 * - Các bước đánh số vòng tròn đỏ (đúng mockup)
 * - Nút đỏ "Gọi 115 ngay" (tel:115) + disclaimer tham khảo.
 */
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton, Badge } from '../../../components';
import { findTopic } from '../../../data/firstAid';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const EMERGENCY_NUMBER = '115';

export default function FirstAidDetailScreen({ route, navigation }) {
  const topic = findTopic(route.params?.topicId);

  // Đặt lại tiêu đề header theo chủ đề ("CPR — Hỗ trợ hô hấp" như mockup).
  // PHẢI đặt trước mọi early return - Rules of Hooks.
  useEffect(() => {
    if (topic) navigation.setOptions({ title: topic.searchTitle || topic.title });
  }, [navigation, topic]);

  // ID không hợp lệ (vd deep link lỗi) -> quay về thư viện thay vì crash trắng
  if (!topic) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Không tìm thấy chủ đề này.</Text>
      </View>
    );
  }

  const call115 = () => {
    Linking.openURL(`tel:${EMERGENCY_NUMBER}`).catch(() => {});
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Khung minh họa (mockup: icon trong nền hồng nhạt) */}
      <View style={styles.illustration}>
        <Text style={styles.illustrationEmoji}>{topic.emoji}</Text>
      </View>
      {topic.badge ? <Badge label={topic.badge} variant="danger" style={styles.badge} /> : null}

      {/* Các bước đánh số đỏ - mockup C-07 */}
      <View style={styles.card}>
        {topic.steps.map((step, index) => (
          <View key={String(index)} style={styles.stepRow}>
            <View style={styles.stepNo}>
              <Text style={styles.stepNoText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Lưu ý riêng của chủ đề (nếu có) */}
      {topic.note ? (
        <View style={styles.noteBox}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
          <Text style={styles.noteText}>{topic.note}</Text>
        </View>
      ) : null}

      {/* Gọi 115 - mockup C-07 */}
      <AppButton
        title={`Gọi ${EMERGENCY_NUMBER} ngay`}
        size="lg"
        onPress={call115}
        icon={<Ionicons name="call" size={20} color={colors.textOnPrimary} />}
        style={styles.callBtn}
      />

      <Text style={styles.disclaimer}>
        Nội dung tham khảo chung — không thay thế chuyên môn y tế. Khi có thể, hãy gọi SOS hoặc 115 để được hỗ trợ.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.s },

  illustration: {
    height: 140,
    borderRadius: radius.l,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: { fontSize: 64 },
  badge: { alignSelf: 'center', marginTop: -12 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.xl,
    marginTop: spacing.l,
  },
  stepRow: { flexDirection: 'row', marginBottom: spacing.l },
  stepNo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    marginTop: 2,
  },
  stepNoText: { color: colors.textOnPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.s },
  stepText: { flex: 1, fontSize: fontSize.m, color: colors.text, lineHeight: 23 },

  noteBox: {
    flexDirection: 'row',
    gap: spacing.s,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#FDE4C7',
    borderRadius: radius.m,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  noteText: { flex: 1, color: colors.warning, fontSize: fontSize.s, lineHeight: 20, fontWeight: fontWeight.medium },

  callBtn: { marginTop: spacing.xl },
  disclaimer: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.l,
    lineHeight: 18,
  },
});
