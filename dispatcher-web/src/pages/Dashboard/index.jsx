import React, { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('console');
  const [fallbackMode, setFallbackMode] = useState(true);

  const [requests] = useState([
    {
      id: 'EMG-0031',
      location: 'Ngã 6 Lê Duẩn & N.V. Linh, Hải Châu',
      detail: '3 nạn nhân - 1 bất tỉnh',
      severity: 'CRITICAL',
      status: 'DISPATCHED',
      time: '00:42',
      assignedVehicle: 'AMB-07'
    },
    {
      id: 'EMG-0029',
      location: '254 Núi Thành, Cẩm Lệ',
      detail: 'Ngã cầu thang - nghi gãy xương',
      severity: 'URGENT',
      status: 'WAITING',
      time: '01:15',
      assignedVehicle: 'AMB-12'
    },
    {
      id: 'EMG-0025',
      location: '99 Bạch Đằng, Hải Châu',
      detail: 'Đau ngực nhẹ',
      severity: 'MODERATE',
      status: 'WAITING',
      time: '03:20',
      assignedVehicle: null
    }
  ]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', margin: 0 }}>
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '70px', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '24px', borderRight: '1px solid #334155' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#dc2626', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', color: '#fff' }}>
          +
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
          <button title="Live GIS Console" onClick={() => setActiveTab('console')} style={{ width: '44px', height: '44px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'console' ? '#dc2626' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>🗺️</button>
          <button title="Quản lý đội xe" onClick={() => setActiveTab('fleet')} style={{ width: '44px', height: '44px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'fleet' ? '#dc2626' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>🚑</button>
          <button title="Analytics" onClick={() => setActiveTab('analytics')} style={{ width: '44px', height: '44px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'analytics' ? '#dc2626' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>📊</button>
          <button title="Cấu hình hệ thống" onClick={() => setActiveTab('settings')} style={{ width: '44px', height: '44px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'settings' ? '#dc2626' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>⚙️</button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '56px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#f8fafc' }}>SmartEMS</span>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>• Dispatcher Console</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
              WebSocket Live
            </span>
          </div>
        </header>

        {/* TAB 1: GIS CONSOLE */}
        {activeTab === 'console' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, backgroundColor: '#0f172a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid #334155' }}>
                📍 Bản đồ GIS Đội xe (Đà Nẵng) — Live Tracking
              </div>
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '48px', margin: 0 }}>🗺️</p>
                <p>[ Khung hiển thị Bản đồ GIS / Leaflet Map ]</p>
              </div>
            </div>

            <div style={{ width: '380px', backgroundColor: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Hàng đợi khẩn cấp</h3>
                <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '12px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>{requests.length} đang chờ</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '14px', borderLeft: `4px solid ${item.severity === 'CRITICAL' ? '#dc2626' : item.severity === 'URGENT' ? '#f59e0b' : '#3b82f6'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: item.severity === 'CRITICAL' ? '#fca5a5' : '#fcd34d' }}>● {item.severity}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>chờ {item.time}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{item.location}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{item.detail}</div>
                    <button style={{ width: '100%', padding: '8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Điều phối xe →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ ĐỘI XE */}
        {activeTab === 'fleet' && (
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', marginTop: 0 }}>Quản lý đội xe (Live)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#334155', textAlign: 'left', fontSize: '14px', color: '#cbd5e1' }}>
                  <th style={{ padding: '12px 16px' }}>MÃ XE</th>
                  <th style={{ padding: '12px 16px' }}>BIỂN SỐ</th>
                  <th style={{ padding: '12px 16px' }}>TRẠM</th>
                  <th style={{ padding: '12px 16px' }}>TÀI XẾ</th>
                  <th style={{ padding: '12px 16px' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '12px 16px' }}>TỐC ĐỘ</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px' }}>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>AMB-07</td>
                  <td style={{ padding: '12px 16px' }}>51K-234.56</td>
                  <td style={{ padding: '12px 16px' }}>S1 Sơn Trà</td>
                  <td style={{ padding: '12px 16px' }}>Nguyễn Văn B</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ backgroundColor: '#1e3a8a', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>TRANSPORTING</span></td>
                  <td style={{ padding: '12px 16px' }}>42 km/h</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', marginTop: 0 }}>SmartEMS Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Phản hồi TB</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>8:24 min</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Dispatch dưới 30s</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>96%</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', marginTop: 0 }}>Cấu hình hệ thống (DevOps)</h2>
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <h4 style={{ color: '#94a3b8', margin: '0 0 12px 0' }}>ROUTING</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>Fallback khi OSRM chết</div>
                <input type="checkbox" checked={fallbackMode} onChange={(e) => setFallbackMode(e.target.checked)} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;