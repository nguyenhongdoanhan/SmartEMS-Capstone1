import React from 'react';

const Hospitals = () => {
  const hospitalsList = [
    { id: 'H1', name: 'BV Đa khoa Đà Nẵng', dept: '24/7 · 12 giường', phone: '0236 3821 219', coords: '16.0678, 108.2130' },
    { id: 'H2', name: 'BV C Đà Nẵng', dept: '24/7 · 8 giường', phone: '0236 3821 221', coords: '16.0492, 108.2247' },
    { id: 'H3', name: 'BV Hoàn Mỹ Đà Nẵng', dept: '24/7 · 6 giường', phone: '0236 3711 999', coords: '16.0451, 108.1882' },
    { id: 'H4', name: 'BV Việt Hàn', dept: '7:00–22:00', phone: '0236 3650 555', coords: '16.0017, 108.2091' },
  ];

  return (
    <div style={{ padding: '24px', color: '#f8fafc', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>SmartEMS · Bệnh viện</h2>
        <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Thêm bệnh viện
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left', color: '#94a3b8', fontSize: '13px' }}>
            <th style={{ padding: '14px' }}>BỆNH VIỆN</th>
            <th style={{ padding: '14px' }}>KHOA CẤP CỨU</th>
            <th style={{ padding: '14px' }}>ĐIỆN THOẠI</th>
            <th style={{ padding: '14px' }}>TỌA ĐỘ</th>
            <th style={{ padding: '14px', textAlign: 'right' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {hospitalsList.map((hp) => (
            <tr key={hp.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '14px', fontWeight: 'bold' }}>{hp.name}</td>
              <td style={{ padding: '14px' }}>{hp.dept}</td>
              <td style={{ padding: '14px' }}>{hp.phone}</td>
              <td style={{ padding: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>{hp.coords}</td>
              <td style={{ padding: '14px', textAlign: 'right' }}>
                <span style={{ color: '#38bdf8', cursor: 'pointer' }}>Sửa</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Hospitals;
