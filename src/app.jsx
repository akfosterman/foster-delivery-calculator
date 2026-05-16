import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Truck, Settings, BarChart3, RefreshCw } from 'lucide-react';

const DeliveryCalculator = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [addressInput, setAddressInput] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [material, setMaterial] = useState('');
  const [yardage, setYardage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [allAddresses, setAllAddresses] = useState([]);
  const [addressDataLoaded, setAddressDataLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [lookupLogs, setLookupLogs] = useState([]);

  const pricing = {
    materials: [
      { id: '1', name: 'Pit Run Gravel', pricePerYard: 9.25, maxYards: 10 },
      { id: '2', name: '2" Minus', pricePerYard: 14.00, maxYards: 10 },
      { id: '3', name: '1" Minus', pricePerYard: 13.00, maxYards: 10 },
      { id: '4', name: 'Small Sewer Rock', pricePerYard: 18.00, maxYards: 10 },
      { id: '5', name: 'Large Sewer Rock', pricePerYard: 18.00, maxYards: 10 },
      { id: '6', name: '1" Washed', pricePerYard: 18.00, maxYards: 10 },
      { id: '7', name: 'Washed Sand', pricePerYard: 15.00, maxYards: 10 },
      { id: '8', name: 'Pea Gravel', pricePerYard: 18.00, maxYards: 10 },
      { id: '9', name: 'Crushed Chips', pricePerYard: 50.00, maxYards: 10 },
      { id: '10', name: 'D1', pricePerYard: 29.00, maxYards: 10 },
      { id: '11', name: 'Recycled Asphalt Pavement (RAP)', pricePerYard: 30.00, maxYards: 10 },
      { id: '12', name: 'Screened Topsoil', pricePerYard: 30.00, maxYards: 10 },
      { id: '13', name: 'Fill Dirt', pricePerYard: 3.00, maxYards: 10 },
    ],
    zones: [
      { id: 'green', name: 'Green', deliveryFee: 125 },
      { id: 'yellow', name: 'Yellow', deliveryFee: 155 },
      { id: 'red', name: 'Red', deliveryFee: 185 },
    ]
  };

  const YOUR_CALTOPO_ZONES = {
    greenZones: [
      {
        name: 'Green Zone 1',
        coordinates: [[[-151.06, 60.56], [-151.07, 60.56], [-151.07, 60.55], [-151.06, 60.55], [-151.06, 60.56]]]
      }
    ],
    yellowZones: [
      {
        name: 'Yellow Zone 1',
        coordinates: [[[-151.18, 60.45], [-151.19, 60.45], [-151.19, 60.44], [-151.18, 60.44], [-151.18, 60.45]]]
      }
    ],
    redZones: [
      {
        name: 'Red Zone 1',
        coordinates: [[[-151.28, 60.31], [-151.29, 60.31], [-151.29, 60.30], [-151.28, 60.30], [-151.28, 60.31]]]
      }
    ]
  };

  useEffect(() => {
    loadAddressesFromStorage();
  }, []);

  const loadAddressesFromStorage = () => {
    const stored = localStorage.getItem('kpb_addresses');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAllAddresses(data.addresses || []);
        setLastUpdated(data.lastUpdated);
        setAddressDataLoaded(true);
      } catch (err) {
        console.error('Error loading stored addresses:', err);
      }
    }
  };

  const fetchAddressesFromKPB = async () => {
    setLoadingAddresses(true);
    try {
      const query = `https://services.arcgis.com/r62b6pXCTNDKVNk0/arcgis/rest/services/KPB_Physical_Addresses/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=json&resultRecordCount=10000`;
      const response = await fetch(query);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const formattedAddresses = data.features
          .map(feature => {
            const attrs = feature.attributes;
            const geometry = feature.geometry;
            const address = `${attrs.SITUS_NUM || ''} ${attrs.SITUS_STREET || ''}`.trim();
            
            return {
              displayAddress: address,
              lat: geometry.y,
              lng: geometry.x,
              attributes: attrs
            };
          })
          .filter(addr => addr.displayAddress)
          .sort((a, b) => a.displayAddress.localeCompare(b.displayAddress));
        
        const toStore = {
          addresses: formattedAddresses,
          lastUpdated: new Date().toISOString(),
          count: formattedAddresses.length
        };
        
        localStorage.setItem('kpb_addresses', JSON.stringify(toStore));
        setAllAddresses(formattedAddresses);
        setLastUpdated(toStore.lastUpdated);
        setAddressDataLoaded(true);
        alert(`✓ Loaded ${formattedAddresses.length} addresses from KPB GeoHub`);
      } else {
        alert('No addresses found from KPB. Using cached data if available.');
      }
    } catch (err) {
      console.error('Error fetching from KPB:', err);
      alert('Could not fetch from KPB GeoHub. Using cached data if available.');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressInput = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    setSelectedAddress(null);
    setError('');

    if (value.length > 0) {
      const filtered = allAddresses.filter(addr =>
        addr.displayAddress.toUpperCase().includes(value.toUpperCase())
      ).slice(0, 50);
      
      setFilteredAddresses(filtered);
      setShowAddressDropdown(filtered.length > 0);
    } else {
      setFilteredAddresses([]);
      setShowAddressDropdown(false);
    }
  };

  const selectAddress = (addr) => {
    setSelectedAddress(addr);
    setAddressInput(addr.displayAddress);
    setShowAddressDropdown(false);
    setFilteredAddresses([]);
    setError('');
  };

  const pointInPolygon = (lat, lng, polygonCoordinates) => {
    const x = lng;
    const y = lat;
    let inside = false;

    const coords = polygonCoordinates[0];
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][0];
      const yi = coords[i][1];
      const xj = coords[j][0];
      const yj = coords[j][1];

      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  const determineZone = (lat, lng) => {
    for (const greenZone of YOUR_CALTOPO_ZONES.greenZones) {
      if (pointInPolygon(lat, lng, greenZone.coordinates)) {
        return { zoneId: 'green', zoneName: 'Green' };
      }
    }

    for (const yellowZone of YOUR_CALTOPO_ZONES.yellowZones) {
      if (pointInPolygon(lat, lng, yellowZone.coordinates)) {
        return { zoneId: 'yellow', zoneName: 'Yellow' };
      }
    }

    for (const redZone of YOUR_CALTOPO_ZONES.redZones) {
      if (pointInPolygon(lat, lng, redZone.coordinates)) {
        return { zoneId: 'red', zoneName: 'Red' };
      }
    }

    return null;
  };

  const calculatePrice = () => {
    setError('');
    setResult(null);

    if (!selectedAddress) {
      setError('Please select an address from the dropdown.');
      return;
    }
    if (!material) {
      setError('Please select a material type.');
      return;
    }
    if (!yardage || isNaN(yardage) || parseFloat(yardage) <= 0) {
      setError('Please enter a valid number of yards.');
      return;
    }

    setLoading(true);

    try {
      const zoneResult = determineZone(selectedAddress.lat, selectedAddress.lng);
      
      if (!zoneResult) {
        setLoading(false);
        setResult({
          outOfZone: true,
          message: 'Delivery location requires office review. Please call Foster Construction to confirm pricing.',
        });
        return;
      }

      const materialObj = pricing.materials.find(m => m.id === material);
      const zoneObj = pricing.zones.find(z => z.id === zoneResult.zoneId);

      if (!materialObj || !zoneObj) {
        setError('Material or zone not found.');
        setLoading(false);
        return;
      }

      const yardsRequested = parseFloat(yardage);
      const deliveries = Math.ceil(yardsRequested / materialObj.maxYards);
      const materialCost = yardsRequested * materialObj.pricePerYard;
      const deliveryTotal = deliveries * zoneObj.deliveryFee;
      const estimatedTotal = materialCost + deliveryTotal;

      const resultData = {
        outOfZone: false,
        material: materialObj.name,
        yards: yardsRequested,
        deliveries,
        zone: zoneObj.name,
        materialCost: materialCost.toFixed(2),
        deliveryTotal: deliveryTotal.toFixed(2),
        estimatedTotal: estimatedTotal.toFixed(2),
      };

      setResult(resultData);

      const logEntry = {
        timestamp: new Date().toISOString(),
        address: selectedAddress.displayAddress,
        material: materialObj.name,
        yardage: yardsRequested,
        zone: zoneObj.name,
        estimatedTotal: estimatedTotal.toFixed(2),
      };
      setLookupLogs([...lookupLogs, logEntry]);
    } catch (err) {
      setError('Calculation error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { backgroundColor: '#1a1a1a', color: '#fff', borderBottom: '3px solid #d97706', padding: '24px 20px' },
    headerContent: { maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' },
    title: { fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#aaa', margin: 0 },
    versionNote: { fontSize: 11, color: '#4ade80', margin: '4px 0 0 0', fontWeight: 600 },
    tabContainer: { display: 'flex', gap: 8 },
    tabButton: { padding: '10px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
    tabButtonActive: { backgroundColor: '#d97706', color: '#fff' },
    tabButtonInactive: { backgroundColor: '#333', color: '#aaa' },
    mainContent: { flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 20px' },
    section: { backgroundColor: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 28, color: '#1a1a1a' },
    warningBox: { padding: 16, backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 6, color: '#92400e', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center' },
    formGroup: { marginBottom: 24 },
    label: { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#333' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: 12, color: '#999', pointerEvents: 'none' },
    input: { width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' },
    suggestions: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 6px 6px', maxHeight: 300, overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    suggestionItem: { padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 13, color: '#333', borderBottom: '1px solid #f0f0f0' },
    selectedBadge: { marginTop: 8, padding: '8px 12px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: 4, fontSize: 13, color: '#166534' },
    select: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, backgroundColor: '#fff', fontFamily: 'inherit' },
    errorBox: { padding: 16, backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 6, color: '#991b1b', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center' },
    calculateButton: { width: '100%', padding: 14, backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 24 },
    calculateButtonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    resultBox: { marginTop: 24, padding: 24, backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: 8 },
    resultTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#166534' },
    pricingBreakdown: { backgroundColor: '#fff', padding: 16, borderRadius: 6 },
    pricingRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
    pricingRowTotal: { display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, padding: '12px 0 0 0', color: '#d97706' },
    ctaSection: { marginTop: 20 },
    callButton: { display: 'inline-block', padding: '12px 20px', backgroundColor: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14 },
    outOfZoneBox: { marginTop: 24, padding: 24, backgroundColor: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 16, color: '#991b1b' },
    adminCard: { marginBottom: 32, padding: 20, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6 },
    adminCardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' },
    adminInfoBox: { padding: 12, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, marginBottom: 16 },
    primaryButton: { padding: '10px 16px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f3f4f6', fontWeight: 600, fontSize: 13 },
    tableRow: { borderBottom: '1px solid #e5e7eb' },
    tableCell: { padding: '12px 8px', fontSize: 13, color: '#333' },
    tableWrapper: { overflowX: 'auto' },
    footer: { backgroundColor: '#1a1a1a', color: '#aaa', textAlign: 'center', padding: '16px 20px', fontSize: 13, borderTop: '1px solid #333', marginTop: 'auto' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Foster Construction</h1>
            <p style={styles.subtitle}>Delivery Price Calculator</p>
            <p style={styles.versionNote}>✓ KPB GeoHub Address Integration</p>
          </div>
          <div style={styles.tabContainer}>
            <button onClick={() => setActiveTab('calculator')} style={{...styles.tabButton, ...(activeTab === 'calculator' ? styles.tabButtonActive : styles.tabButtonInactive)}}><Truck size={16} /> Calculator</button>
            <button onClick={() => setActiveTab('admin')} style={{...styles.tabButton, ...(activeTab === 'admin' ? styles.tabButtonActive : styles.tabButtonInactive)}}><Settings size={16} /> Admin</button>
            <button onClick={() => setActiveTab('logs')} style={{...styles.tabButton, ...(activeTab === 'logs' ? styles.tabButtonActive : styles.tabButtonInactive)}}><BarChart3 size={16} /> Logs</button>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {activeTab === 'calculator' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Get Your Delivery Estimate</h2>
            
            {!addressDataLoaded && (
              <div style={styles.warningBox}>
                <AlertCircle size={18} style={{ marginRight: 12 }} />
                <div><strong>No addresses loaded.</strong> Go to Admin tab and click "Load KPB Addresses" to get started.</div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Delivery Address *</label>
              <div style={styles.inputWrapper}>
                <MapPin size={18} style={styles.inputIcon} />
                <input type="text" placeholder="Type address to search KPB parcel viewer..." value={addressInput} onChange={handleAddressInput} style={styles.input} disabled={!addressDataLoaded} />
              </div>
              
              {showAddressDropdown && filteredAddresses.length > 0 && (
                <div style={styles.suggestions}>
                  {filteredAddresses.map((addr, idx) => (
                    <div key={idx} style={styles.suggestionItem} onClick={() => selectAddress(addr)}>
                      <MapPin size={14} style={{ marginRight: 8 }} />
                      <strong>{addr.displayAddress}</strong>
                    </div>
                  ))}
                </div>
              )}

              {selectedAddress && (<div style={styles.selectedBadge}>✓ {selectedAddress.displayAddress}</div>)}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Material Type *</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} style={styles.select}>
                <option value="">Select a material...</option>
                {pricing.materials.map(m => (<option key={m.id} value={m.id}>{m.name} - ${m.pricePerYard}/yard</option>))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Yards Requested *</label>
              <input type="number" placeholder="Enter number of yards" value={yardage} onChange={(e) => setYardage(e.target.value)} style={styles.input} min="0" step="0.5" />
            </div>

            {error && (<div style={styles.errorBox}><AlertCircle size={18} style={{ marginRight: 12 }} /><div>{error}</div></div>)}

            <button onClick={calculatePrice} disabled={loading || !addressDataLoaded} style={{...styles.calculateButton, ...(loading || !addressDataLoaded ? styles.calculateButtonDisabled : {})}}>{loading ? 'Calculating...' : 'Calculate Estimate'}</button>

            {result && !result.outOfZone && (
              <div style={styles.resultBox}>
                <h3 style={styles.resultTitle}>Your Delivery Estimate</h3>
                <div style={styles.pricingBreakdown}>
                  <div style={styles.pricingRow}><span>Material: {result.material}</span><span>${result.materialCost}</span></div>
                  <div style={styles.pricingRow}><span>Delivery ({result.deliveries} trips, {result.zone} Zone)</span><span>${result.deliveryTotal}</span></div>
                  <div style={styles.pricingRowTotal}><span>ESTIMATED TOTAL:</span><span>${result.estimatedTotal}</span></div>
                </div>
                <div style={styles.ctaSection}><a href="tel:+1-907-555-0123" style={styles.callButton}>📞 Call Foster Construction to Order</a></div>
              </div>
            )}

            {result && result.outOfZone && (
              <div style={styles.outOfZoneBox}>
                <AlertCircle size={24} style={{ marginRight: 12 }} />
                <div><p style={{ fontWeight: 600, marginBottom: 8 }}>{result.message}</p><a href="tel:+1-907-555-0123" style={styles.callButton}>📞 Call Foster Construction</a></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Address & Pricing Management</h2>

            <div style={styles.adminCard}>
              <h3 style={styles.adminCardTitle}>📍 KPB Address Data</h3>
              <div style={styles.adminInfoBox}>
                <p style={{ margin: '0 0 12px 0' }}><strong>Current Status:</strong> {addressDataLoaded ? '✓ Loaded' : '✗ Not loaded'}</p>
                {addressDataLoaded && (<p style={{ margin: 0, fontSize: 12, color: '#666' }}><strong>Total Addresses:</strong> {allAddresses.length} | <strong>Last Updated:</strong> {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'}</p>)}
              </div>
              <button onClick={fetchAddressesFromKPB} disabled={loadingAddresses} style={{...styles.primaryButton, ...(loadingAddresses ? { opacity: 0.6, cursor: 'not-allowed' } : {})}}><RefreshCw size={18} /> {loadingAddresses ? 'Loading...' : 'Load KPB Addresses from GeoHub'}</button>
              <p style={{ fontSize: 12, color: '#666', marginTop: 12, marginBottom: 0 }}>💡 Automatically saves to your browser. Click to refresh every couple months for new addresses.</p>
            </div>

            <div style={styles.adminCard}>
              <h3 style={styles.adminCardTitle}>Materials ({pricing.materials.length})</h3>
              <table style={styles.table}>
                <thead><tr style={styles.tableHeader}><th>Material</th><th>Price/Yard</th><th>Max Capacity</th></tr></thead>
                <tbody>{pricing.materials.map(m => (<tr key={m.id} style={styles.tableRow}><td style={styles.tableCell}>{m.name}</td><td style={styles.tableCell}>${m.pricePerYard.toFixed(2)}</td><td style={styles.tableCell}>{m.maxYards} yards</td></tr>))}</tbody>
              </table>
            </div>

            <div style={styles.adminCard}>
              <h3 style={styles.adminCardTitle}>Delivery Zones</h3>
              <table style={styles.table}>
                <thead><tr style={styles.tableHeader}><th>Zone</th><th>Delivery Fee</th></tr></thead>
                <tbody>{pricing.zones.map(z => (<tr key={z.id} style={styles.tableRow}><td style={styles.tableCell}>{z.name}</td><td style={styles.tableCell}>${z.deliveryFee.toFixed(2)}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Lookup History</h2>
            {lookupLogs.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead><tr style={styles.tableHeader}><th>Address</th><th>Material</th><th>Yards</th><th>Zone</th><th>Total</th></tr></thead>
                  <tbody>{lookupLogs.slice().reverse().map((log, idx) => (<tr key={idx} style={styles.tableRow}><td style={styles.tableCell}>{log.address}</td><td style={styles.tableCell}>{log.material}</td><td style={styles.tableCell}>{log.yardage}</td><td style={styles.tableCell}>{log.zone}</td><td style={styles.tableCell}>${log.estimatedTotal}</td></tr>))}</tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No lookups yet</p>
            )}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <p>Foster Construction - KPB GeoHub Integrated</p>
        <p style={{ fontSize: 12, color: '#999' }}>Dependent dropdown with exact address matching</p>
      </div>
    </div>
  );
};

export default DeliveryCalculator;
