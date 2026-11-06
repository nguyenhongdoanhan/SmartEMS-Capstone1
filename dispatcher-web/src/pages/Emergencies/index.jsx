import React from 'react';

const Emergencies = () => {
  const list = [
    { id: 'EMG-0031', location: 'Ngã 6 Lê Duẩn, Hải Châu', status: 'DISPATCHED', time: '10:15 - 23/10', priority: 'HIGH' },
    { id: 'EMG-0030', location: '120 Nguyễn Văn Linh', status: 'COMPLETED', time: '09:40 - 23/10', priority: 'MEDIUM' },
  ];

  return (
    <div style={{ padding: '24px', color: '#f8fafc', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h2>Danh sách Ca Cấp cứu (Emergencies)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px' }}>
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left', padding: '12px' }}>
            <th style={{ padding: '12px' }}>Mã Ca</th>
            <th style={{ padding: '12px' }}>Địa điểm</th>
            <th style={{ padding: '12px' }}>Thời gian</th>
            <th style={{ padding: '12px' }}>Độ ưu tiên</th>
            <th style={{ padding: '12px' }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.id}</td>
              <td style={{ padding: '12px' }}>{item.location}</td>
              <td style={{ padding: '12px' }}>{item.time}</td>
              <td style={{ padding: '12px', color: item.priority === 'HIGH' ? '#f87171' : '#facc15' }}>{item.priority}</td>
              <td style={{ padding: '12px' }}>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Emergencies;