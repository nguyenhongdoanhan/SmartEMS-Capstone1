import React from 'react';

const Users = () => {
  const usersList = [
    { id: '1', name: 'Nguyễn Minh', phone: '0935...', role: 'CALLER', status: 'Active', lastActive: '12:01 · SOS EMG-0031' },
    { id: '2', name: 'Nguyễn Văn B', phone: '0702...', role: 'DRIVER', status: 'Active', lastActive: '12:01 · AMB-07 transport' },
    { id: '3', name: 'Hoàng Vũ', phone: '0936...', role: 'DISPATCHER', status: 'Online', lastActive: '12:01 · điều phối' },
    { id: '4', name: 'Trưởng trạm A', phone: '0905...', role: 'ADMIN', status: 'Active', lastActive: '11:47 · thêm BV' },
  ];

  const permissionsMatrix = [
    { feature: 'Gửi SOS · xem xe của mình', caller: true, driver: false, dispatcher: false, admin: false },
    { feature: 'Nhận ca · cập nhật FSM', caller: false, driver: true, dispatcher: false, admin: false },
    { feature: 'GIS console · điều phối', caller: false, driver: false, dispatcher: true, admin: true },
    { feature: 'CRUD xe / trạm / BV / user', caller: false, driver: false, dispatcher: false, admin: true },
    { feature: 'Xem audit logs', caller: false, driver: false, dispatcher: false, admin: true },
  ];

  const getRoleStyle = (role) => {
    switch (role) {
      case 'CALLER': return { backgroundColor: '#334155', color: '#cbd5e1' };
      case 'DRIVER': return { backgroundColor: '#1e3a8a', color: '#93c5fd' };
      case 'DISPATCHER': return { backgroundColor: '#831843', color: '#fbcfe8' };
      case 'ADMIN': return { backgroundColor: '#581c87', color: '#e9d5ff' };
      default: return {};
    }
  };

  return (
    <div style={{ padding: '24px', color: '#f8fafc', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>SmartEMS · Người dùng</h2>
        <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Mời người dùng
        </button>
      </div>

      {/* Danh sách người dùng */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px' }}>
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left', color: '#94a3b8', fontSize: '13px' }}>
            <th style={{ padding: '14px' }}>NGƯỜI DÙNG</th>
            <th style={{ padding: '14px' }}>SĐT</th>
            <th style={{ padding: '14px' }}>VAI TRÒ</th>
            <th style={{ padding: '14px' }}>TRẠNG THÁI</th>
            <th style={{ padding: '14px' }}>HOẠT ĐỘNG CUỐI</th>
            <th style={{ padding: '14px', textAlign: 'right' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '14px', fontWeight: 'bold' }}>{u.name}</td>
              <td style={{ padding: '14px', color: '#94a3b8' }}>{u.phone}</td>
              <td style={{ padding: '14px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', ...getRoleStyle(u.role) }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '14px' }}>
                <span style={{ color: '#4ade80' }}>● {u.status}</span>
              </td>
              <td style={{ padding: '14px', color: '#94a3b8', fontSize: '13px' }}>{u.lastActive}</td>
              <td style={{ padding: '14px', textAlign: 'right' }}>
                <span style={{ color: '#38bdf8', cursor: 'pointer' }}>Sửa</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ma trận phân quyền (RBAC) */}
      <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>MA TRẬN PHÂN QUYỀN (RBAC)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left', color: '#94a3b8', fontSize: '12px' }}>
            <th style={{ padding: '12px 14px' }}>CHỨC NĂNG</th>
            <th style={{ padding: '12px 14px', textAlign: 'center' }}>CALLER</th>
            <th style={{ padding: '12px 14px', textAlign: 'center' }}>DRIVER</th>
            <th style={{ padding: '12px 14px', textAlign: 'center' }}>DISPATCHER</th>
            <th style={{ padding: '12px 14px', textAlign: 'center' }}>ADMIN</th>
          </tr>
        </thead>
        <tbody>
          {permissionsMatrix.map((p, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px 14px', fontSize: '14px' }}>{p.feature}</td>
              <td style={{ padding: '12px 14px', textAlign: 'center' }}>{p.caller ? <span style={{ color: '#22c55e' }}>●</span> : '—'}</td>
              <td style={{ padding: '12px 14px', textAlign: 'center' }}>{p.driver ? <span style={{ color: '#22c55e' }}>●</span> : '—'}</td>
              <td style={{ padding: '12px 14px', textAlign: 'center' }}>{p.dispatcher ? <span style={{ color: '#22c55e' }}>●</span> : '—'}</td>
              <td style={{ padding: '12px 14px', textAlign: 'center' }}>{p.admin ? <span style={{ color: '#22c55e' }}>●</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;