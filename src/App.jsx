import React, { useState, useEffect } from 'react';

export default function DeliveryCalculator() {
  const [addressInput, setAddressInput] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [material, setMaterial] = useState('');
  const [yards, setYards] = useState('');
  const [result, setResult] = useState(null);
  const [allAddresses, setAllAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [loadStatus, setLoadStatus] = useState('');
  const [zones, setZones] = useState({ greenZones: [], yellowZones: [], redZones: [] });

  const materials = [
    { name: 'Pit Run Gravel', price: 9.25 },
    { name: '2 Minus', price: 14.00 },
    { name: '1 Minus', price: 13.00 },
    { name: 'Small Sewer Rock', price: 18.00 },
    { name: 'Large Sewer Rock', price: 18.00 },
    { name: '1 Washed', price: 18.00 },
    { name: 'Washed Sand', price: 15.00 },
    { name: 'Pea Gravel', price: 18.00 },
    { name: 'Crushed Chips', price: 50.00 },
    { name: 'D1', price: 29.00 },
    { name: 'Recycled Asphalt Pavement (RAP)', price: 30.00 },
    { name: 'Screened Topsoil', price: 30.00 },
    { name: 'Fill Dirt', price: 3.00 },
  ];

  useEffect(() => {
    loadFromCache();
    loadZonesFromGeoJSON();
  }, []);

  const loadZonesFromGeoJSON = async () => {
    try {
      const response = await fetch('/data/zones.geojson');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const geoJsonData = await response.json();
      
      const greenZones = [];
      const yellowZones = [];
      const redZones = [];
      
      geoJsonData.features.forEach(feature => {
        const zone = feature.properties.zone;
        const name = feature.properties.name || 'Zone';
        
        if (feature.geometry && feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates[0];
          const zoneObj = { name, coords };
          
          if (zone === 'green') greenZones.push(zoneObj);
          else if (zone === 'yellow') yellowZones.push(zoneObj);
          else if (zone === 'red') redZones.push(zoneObj);
        }
      });
      
      setZones({ greenZones, yellowZones, redZones });
      console.log('Zones loaded successfully:', { greenZones: greenZones.length, yellowZones: yellowZones.length, redZones: redZones.length });
    } catch (err) {
      console.error('Error loading zones from GeoJSON:', err);
      setZones({ greenZones: [], yellowZones: [], redZones: [] });
    }
  };

  const loadFromCache = () => {
    const cached = localStorage.getItem('kpb_addresses');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setAllAddresses(data);
        setAddressesLoaded(true);
      } catch (e) {
        console.error('Cache error:', e);
      }
    }
  };

  const loadKPBAddresses = async () => {
    setLoadingAddresses(true);
    setLoadStatus('Connecting to KPB GeoHub...');
    
    try {
      const baseUrl = 'https://services.arcgis.com/ba4DH9pIcqkXJVfl/arcgis/rest/services/Physical_Addresses_view/FeatureServer/0/query';
      let allFeatures = [];
      let offset = 0;
      const pageSize = 2000;
      let hasMore = true;
      
      while (hasMore) {
        setLoadStatus(`Loading addresses... ${allFeatures.length} loaded so far`);
        const url = `${baseUrl}?where=1%3D1&outFields=Address,House_Number,Street_Name&returnGeometry=true&outSR=4326&f=json&resultRecordCount=${pageSize}&resultOffset=${offset}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          allFeatures = allFeatures.concat(data.features);
          offset += pageSize;
          if (data.features.length < pageSize) hasMore = false;
        } else {
          hasMore = false;
        }
        
        if (allFeatures.length > 50000) hasMore = false;
      }
      
      setLoadStatus(`Processing ${allFeatures.length} addresses...`);
      
      const addresses = allFeatures
        .map(f => {
          const display = (f.attributes.Address || '').trim();
          return {
            display: display,
            lat: f.geometry ? f.geometry.y : null,
            lng: f.geometry ? f.geometry.x : null
          };
        })
        .filter(a => a.display && a.lat && a.lng)
        .sort((a, b) => a.display.localeCompare(b.display));
      
      setAllAddresses(addresses);
      localStorage.setItem('kpb_addresses', JSON.stringify(addresses));
      setAddressesLoaded(true);
      setLoadStatus('');
      alert('Successfully loaded ' + addresses.length + ' addresses from KPB!');
    } catch (err) {
      console.error('Load error:', err);
      setLoadStatus('Error: ' + err.message);
      alert('Could not load addresses: ' + err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const pointInPolygon = (lat, lng, coords) => {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][0], yi = coords[i][1];
      const xj = coords[j][0], yj = coords[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const findZone = (lat, lng) => {
    for (const z of zones.greenZones) {
      if (pointInPolygon(lat, lng, z.coords)) return 'green';
    }
    for (const z of zones.yellowZones) {
      if (pointInPolygon(lat, lng, z.coords)) return 'yellow';
    }
    for (const z of zones.redZones) {
      if (pointInPolygon(lat, lng, z.coords)) return 'red';
    }
    return null;
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    setSelectedAddress(null);
    
    if (value.length > 0) {
      const filtered = allAddresses
        .filter(a => a.display.toUpperCase().includes(value.toUpperCase()))
        .slice(0, 30);
      setFilteredAddresses(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const selectAddress = (addr) => {
    setSelectedAddress(addr);
    setAddressInput(addr.display);
    setShowDropdown(false);
  };

  const handleCalculate = () => {
    if (!selectedAddress) {
      alert('Please select an address from the dropdown');
      return;
    }
    if (!material || !yards) {
      alert('Please fill in all fields');
      return;
    }
    
    const zone = findZone(selectedAddress.lat, selectedAddress.lng);
    
    if (!zone) {
      setResult({ outOfZone: true, address: selectedAddress.display });
      return;
    }
    
    const mat = materials.find(m => m.name === material);
    const deliveryFees = { green: 125, yellow: 155, red: 185 };
    const yardsRequested = parseFloat(yards);
    const numDeliveries = Math.ceil(yardsRequested / 10);
    const cost = yardsRequested * mat.price;
    const deliveryPerLoad = deliveryFees[zone];
    const delivery = numDeliveries * deliveryPerLoad;
    const total = cost + delivery;
    
    setResult({ 
      outOfZone: false,
      address: selectedAddress.display,
      material, 
      yards, 
      numDeliveries,
      zone, 
      cost: cost.toFixed(2), 
      delivery: delivery.toFixed(2), 
      total: total.toFixed(2) 
    });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Foster Construction</h1>
      <p>Delivery Price Calculator</p>
      
      {!addressesLoaded && (
        <div style={{ padding: '15px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 10px 0' }}>Click below to load KPB addresses (first time only):</p>
          <button onClick={loadKPBAddresses} disabled={loadingAddresses} style={{ padding: '8px 16px', backgroundColor: '#d97706', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loadingAddresses ? 'Loading...' : 'Load KPB Addresses'}
          </button>
          {loadStatus && <p style={{ marginTop: '10px', fontSize: '12px' }}>{loadStatus}</p>}
        </div>
      )}

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <label>Address: </label>
        <input 
          type="text" 
          value={addressInput} 
          onChange={handleAddressChange} 
          placeholder={addressesLoaded ? 'Start typing your address...' : 'Load addresses first'}
          disabled={!addressesLoaded}
          style={{ width: '100%', padding: '8px' }} 
        />
        {showDropdown && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto', zIndex: 10 }}>
            {filteredAddresses.map((addr, i) => (
              <div key={i} onClick={() => selectAddress(addr)} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                {addr.display}
              </div>
            ))}
          </div>
        )}
        {selectedAddress && (
          <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#ecfdf5', fontSize: '12px' }}>
            ✓ {selectedAddress.display}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Material: </label>
        <select value={material} onChange={(e) => setMaterial(e.target.value)} style={{ width: '100%', padding: '8px' }}>
          <option value="">Select Material</option>
          {materials.map(m => <option key={m.name} value={m.name}>{m.name} - ${m.price}/yard</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Yards: </label>
        <input type="number" value={yards} onChange={(e) => setYards(e.target.value)} style={{ width: '100%', padding: '8px' }} />
      </div>

      <button onClick={handleCalculate} style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
        Calculate
      </button>

      {result && !result.outOfZone && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
          <h3>Your Estimate</h3>
          <p>Address: {result.address}</p>
          <p>Material: {result.material} - {result.yards} yards</p>
          <p>Deliveries: {result.numDeliveries} load(s)</p>
          <p>Zone: {result.zone.toUpperCase()}</p>
          <p>Material Cost: ${result.cost}</p>
          <p>Delivery: ${result.delivery} ({result.numDeliveries} × $125-$185 per zone)</p>
          <p style={{ fontWeight: 'bold', fontSize: '18px' }}>TOTAL: ${result.total}</p>
        </div>
      )}

      {result && result.outOfZone && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fee2e2', border: '2px solid #fca5a5' }}>
          <h3>Out of Service Area</h3>
          <p>Address: {result.address}</p>
          <p>This delivery location requires office review. Please call Foster Construction for pricing.</p>
        </div>
      )}
    </div>
  );
}