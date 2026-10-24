/**
 * Màn Sơ cấp cứu: hiển thị nội dung hướng dẫn offline (bundle sẵn trong app).
 * Dữ liệu nguồn: src/assets/firstaid/cpr.json - xem được không cần mạng.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import cprData from '../../../assets/firstaid/cpr.json';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

export default function FirstAidScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Lưu ý quan trọng: đây chỉ là hướng dẫn chung, không thay thế chỉ định y khoa.
          Trong trường hợp nghiêm trọng, hãy gọi SOS hoặc 115 ngay.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{cprData.title}</Text>
        {cprData.steps.map((step, index) => (
          <View key={String(index)} style={styles.stepRow}>
            <View style={styles.stepNo}>
              <Text style={styles.stepNoText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.todoNote}>
        (Nội dung chi tiết đang được biên tập - cập nhật trong assets/firstaid/cpr.json)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  disclaimer: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#FDE4C7',
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  disclaimerText: { color: colors.warning, fontSize: fontSize.s, lineHeight: 20, fontWeight: fontWeight.medium },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.xl,
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.l },
  stepRow: { flexDirection: 'row', marginBottom: spacing.m },
  stepNo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    marginTop: 2,
  },
  stepNoText: { color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.xs },
  stepText: { flex: 1, fontSize: fontSize.m, color: colors.text, lineHeight: 22 },
  todoNote: { color: colors.textDisabled, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.l },
});
