/**
 * C-06 · Thư viện sơ cứu (8 chủ đề, offline):
 * - Search "Tìm hướng dẫn..." (không phân biệt dấu tiếng Việt)
 * - Badge xanh "Offline sẵn"
 * - Grid 2 cột: emoji + tên chủ đề + số bước, bấm vào -> C-07 chi tiết.
 * Nội dung bundle sẵn trong app (src/data/firstAid.js) - không cần mạng.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FIRST_AID_TOPICS, searchTopics } from '../../../data/firstAid';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

export default function FirstAidScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const topics = useMemo(() => searchTopics(query), [query]);

  const openTopic = (topic) => navigation.navigate('FirstAidDetail', { topicId: topic.id });

  const renderTopic = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => openTopic(item)}
      accessibilityLabel={`Hướng dẫn ${item.title}`}
    >
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSub}>{item.steps.length} bước</Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      {/* Search + badge offline */}
      <View style={styles.toolRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm hướng dẫn..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setQuery('')} accessibilityLabel="Xóa tìm kiếm">
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <View style={styles.offlineBadge}>
          <Ionicons name="cloud-offline-outline" size={12} color={colors.successStrong} />
          <Text style={styles.offlineText}>Offline sẵn</Text>
        </View>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(t) => t.id}
        renderItem={renderTopic}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Không tìm thấy hướng dẫn</Text>
            <Text style={styles.emptySub}>Thử từ khóa khác: "cầm máu", "bỏng", "co giật"...</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: fontSize.s, color: colors.text, paddingVertical: 0 },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.s + 2,
    paddingVertical: 5,
  },
  offlineText: { color: colors.successStrong, fontSize: fontSize.xs - 1, fontWeight: fontWeight.semibold },

  listContent: { padding: spacing.l, paddingBottom: spacing.xxl },
  columnWrapper: { gap: spacing.m, marginBottom: spacing.m },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.l,
    alignItems: 'flex-start',
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: radius.m,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  emoji: { fontSize: 28 },
  cardTitle: { fontSize: fontSize.s + 1, fontWeight: fontWeight.semibold, color: colors.text },
  cardSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  emptyBox: { alignItems: 'center', padding: spacing.xxl, gap: spacing.s },
  emptyTitle: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text },
  emptySub: { fontSize: fontSize.s, color: colors.textSecondary, textAlign: 'center' },
});
