import React from 'react';

const Stations = () => {
  const stationsList = [
    { id: 'S1', name: 'S1 · Sơn Trà', address: '12 Mận Thái, Sơn Trà', coords: '16.0772, 108.2440', cars: 5, manager: 'Trưởng trạm A' },
    { id: 'S2', name: 'S2 · Liên Chiểu', address: '240 Nguyễn Lương Bằng', coords: '16.0338, 108.1376', cars: 4, manager: 'Trưởng trạm B' },
    { id: 'S3', name: 'S3 · Ngũ Hành Sơn', address: '88 Huỳnh Ngọc Huệ', coords: '16.0044, 108.2518', cars: 2, manager: 'Trưởng trạm C' },
    { id: 'S4', name: 'S4 · Cẩm Lệ', address: '45 Điện Biên Phủ', coords: '16.0228, 108.1789', cars: 1, manager: 'Trưởng trạm D' },
  ];

  return (
    <div style={{ padding: '24px', color: '#f8fafc', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>SmartEMS · Trạm cứu thương</h2>
        <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Thêm trạm
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left', color: '#94a3b8', fontSize: '13px' }}>
            <th style={{ padding: '14px' }}>TRẠM</th>
            <th style={{ padding: '14px' }}>ĐỊA CHỈ</th>
            <th style={{ padding: '14px' }}>TỌA ĐỘ (POSTGIS)</th>
            <th style={{ padding: '14px' }}>XE TRỰC</th>
            <th style={{ padding: '14px' }}>PHỤ TRÁCH</th>
            <th style={{ padding: '14px', textAlign: 'right' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {stationsList.map((st) => (
            <tr key={st.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '14px', fontWeight: 'bold' }}>{st.name}</td>
              <td style={{ padding: '14px' }}>{st.address}</td>
              <td style={{ padding: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>{st.coords}</td>
              <td style={{ padding: '14px' }}>{st.cars} xe</td>
              <td style={{ padding: '14px' }}>{st.manager}</td>
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

export default Stations;
