import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const STATUSES = [
  { key: 'available', label: 'Sẵn sàng', desc: 'Sẵn sàng nhận ca điều phối', color: '#2E7D32', bg: '#E8F5E9', icon: '🟢' },
  { key: 'on_trip', label: 'Đang chạy', desc: 'Đang thực hiện chuyến cấp cứu', color: '#EF6C00', bg: '#FFF3E0', icon: '🚑' },
  { key: 'offline', label: 'Nghỉ', desc: 'Tạm ngưng nhận ca', color: '#616161', bg: '#EEEEEE', icon: '😴' },
];

export default function HomeScreen({ navigation }) {
  const [status, setStatus] = useState('offline');
  const current = STATUSES.find((s) => s.key === status);

  const changeStatus = (key) => {
    setStatus(key);
    // TODO: gọi API cập nhật trạng thái tài xế lên backend ở bước sau.
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🚑</Text>
          </View>
          <View>
            <Text style={styles.hello}>Xin chào, Tài xế</Text>
            <Text style={styles.sub}>Xe cứu thương SmartEMS</Text>
          </View>
        </View>

        <View style={[styles.statusCard, { backgroundColor: current.color }]}>
          <Text style={styles.statusLabel}>TRẠNG THÁI HIỆN TẠI</Text>
          <Text style={styles.statusValue}>
            {current.icon}  {current.label}
          </Text>
          <Text style={styles.statusDesc}>{current.desc}</Text>
        </View>

        <Text style={styles.section}>Đổi trạng thái</Text>
        {STATUSES.map((s) => {
          const active = status === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              activeOpacity={0.8}
              style={[
                styles.option,
                active && { borderColor: s.color, backgroundColor: s.bg },
              ]}
              onPress={() => changeStatus(s.key)}
            >
              <Text style={styles.optionIcon}>{s.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.optionDesc}>{s.desc}</Text>
              </View>
              {active ? <Text style={[styles.check, { color: s.color }]}>✓</Text> : null}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.logout} onPress={() => navigation.replace('Login')}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.demo}>Chế độ demo (chưa nối backend)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F6FA' },
  pageContent: { alignItems: 'center', padding: 20 },
  wrap: { width: '100%', maxWidth: 480 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FDECEA',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarText: { fontSize: 26 },
  hello: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E' },
  sub: { fontSize: 13, color: '#777', marginTop: 2 },
  statusCard: {
    borderRadius: 18, padding: 22, marginBottom: 26,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 1 },
  statusValue: { color: '#fff', fontSize: 30, fontWeight: 'bold', marginTop: 6 },
  statusDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  section: { fontSize: 13, color: '#777', fontWeight: '600', marginBottom: 10, textTransform: 'uppercase' },
  option: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 2, borderColor: 'transparent', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionIcon: { fontSize: 26, marginRight: 14 },
  optionTitle: { fontSize: 17, fontWeight: 'bold' },
  optionDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  check: { fontSize: 22, fontWeight: 'bold' },
  logout: {
    marginTop: 18, borderWidth: 1, borderColor: '#D32F2F', borderRadius: 12,
    padding: 14, alignItems: 'center', backgroundColor: '#fff',
  },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: '600' },
  demo: { textAlign: 'center', color: '#aaa', marginTop: 16, fontSize: 12 },
});