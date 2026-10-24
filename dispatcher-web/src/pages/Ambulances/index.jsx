import React from 'react';

const Ambulances = () => {
  const vehicles = [
    { code: 'AMB-01', plate: '43A-123.45', station: 'Trạm Sơn Trà', status: 'AVAILABLE', driver: 'Nguyễn Văn A' },
    { code: 'AMB-02', plate: '43A-678.90', station: 'Trạm Hải Châu', status: 'BUSY', driver: 'Trần Văn B' },
  ];

  return (
    <div style={{ padding: '24px', color: '#f8fafc', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h2>Danh sách Đội xe Cấp cứu (Ambulances)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px' }}>
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Mã Xe</th>
            <th style={{ padding: '12px' }}>Biển Số</th>
            <th style={{ padding: '12px' }}>Trạm Trực</th>
            <th style={{ padding: '12px' }}>Tài Xế</th>
            <th style={{ padding: '12px' }}>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.code} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{v.code}</td>
              <td style={{ padding: '12px' }}>{v.plate}</td>
              <td style={{ padding: '12px' }}>{v.station}</td>
              <td style={{ padding: '12px' }}>{v.driver}</td>
              <td style={{ padding: '12px', color: v.status === 'AVAILABLE' ? '#4ade80' : '#f87171' }}>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ambulances;
