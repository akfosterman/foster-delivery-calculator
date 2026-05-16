import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, MapPin, DollarSign, Truck, Settings, BarChart3, Download, RefreshCw } from 'lucide-react';

const DeliveryCalculator = () => {
  // ==================== STATE MANAGEMENT ====================
  const [activeTab, setActiveTab] = useState('calculator');
  const [sessionId] = useState(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Calculator state
  const [addressInput, setAddressInput] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [material, setMaterial] = useState('');
  const [yardage, setYardage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Address data
  const [allAddresses, setAllAddresses] = useState([]);
  const [addressDataLoaded, setAddressDataLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Pricing
  const [pricing] = useState({
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
  });
  
  const [lookupLogs, setLookupLogs] = useState([]);

  // ==================== YOUR CALTOPO ZONES ====================
  const YOUR_CALTOPO_ZONES = {
    greenZones: [
      {
        name: 'College/Big Funny Green Zone',
        coordinates: [
          [
            [-151.06000003062604, 60.56332197121339],
            [-151.06866893016218, 60.56349070064157],
            [-151.09845217906354, 60.55889250879035],
            [-151.09561976634382, 60.56260486132028],
            [-151.17424067698835, 60.57251661609308],
            [-151.1744123383653, 60.56140779451036],
            [-151.12360057078718, 60.55583889972999],
            [-151.1176782532823, 60.55474188316143],
            [-151.11527499400495, 60.554379953343364],
            [-151.11355838023542, 60.55370484017565],
            [-151.1113053246629, 60.55501285914061],
            [-151.10845145427106, 60.55547698218752],
            [-151.10375222407697, 60.55339892488235],
            [-151.09664973460553, 60.553894717178316],
            [-151.08643588267682, 60.55271324216336],
            [-151.06369075023053, 60.55366264513478],
            [-151.06369075023053, 60.55526601799182],
            [-151.0480695649278, 60.55290312498695],
            [-151.03519496165632, 60.555519174861516],
            [-151.04635295115827, 60.56269112945395],
            [-151.06025752269147, 60.56345041976081],
            [-151.06000003062604, 60.56332197121339]
          ]
        ]
      },
      {
        name: 'Main Green Zone',
        coordinates: [
          [
            [-151.18452395701047, 60.452642682673314],
            [-151.1975702216589, 60.44629304448479],
            [-151.21525134348508, 60.43062529612522],
            [-151.22074450754758, 60.41359393586737],
            [-151.23173083567258, 60.39853662032388],
            [-151.22005786203977, 60.376940842825846],
            [-151.22263278269406, 60.36568668335785],
            [-151.22992839121457, 60.35181520315901],
            [-151.2335332801306, 60.348715613293066],
            [-151.23413409494992, 60.34599792229665],
            [-151.2349065711462, 60.343874568649476],
            [-151.24220217966672, 60.34209084477446],
            [-151.25636424326535, 60.33160582680084],
            [-151.25593508982297, 60.32438267533596],
            [-151.23919810557004, 60.32353278773041],
            [-151.228383438822, 60.32914163710259],
            [-151.22555102610227, 60.3331777126946],
            [-151.22425283693906, 60.334414988544545],
            [-151.22268106245633, 60.33590443651739],
            [-151.22308339380857, 60.33671417917148],
            [-151.22353400492307, 60.33910346660447],
            [-151.21473635935422, 60.34409385818563],
            [-151.18057574534055, 60.36658950582258],
            [-151.14332522654172, 60.40852973126292],
            [-151.16255130076047, 60.40369756687102],
            [-151.1774858405554, 60.402680177667534],
            [-151.1737951209509, 60.41250893039682],
            [-151.16924609446164, 60.41632282367651],
            [-151.17036189341184, 60.42161074204884],
            [-151.17426718973752, 60.42281397859908],
            [-151.17476071619626, 60.422737735234335],
            [-151.17457832598325, 60.42325036422443],
            [-151.17345716261502, 60.43185146025229],
            [-151.17890472912427, 60.45067336748531],
            [-151.18452395701047, 60.452642682673314]
          ]
        ]
      }
    ],

    yellowZones: [
      {
        name: 'Big Funny Yellow',
        coordinates: [
          [
            [-151.18452395701047, 60.452642682673314],
            [-151.1975702216589, 60.44629304448479],
            [-151.21525134348508, 60.43062529612522],
            [-151.22074450754758, 60.41359393586737],
            [-151.23173083567258, 60.39853662032388],
            [-151.22005786203977, 60.376940842825846],
            [-151.22263278269406, 60.36568668335785],
            [-151.22992839121457, 60.35181520315901],
            [-151.2335332801306, 60.348715613293066],
            [-151.23413409494992, 60.34599792229665],
            [-151.2349065711462, 60.343874568649476],
            [-151.24220217966672, 60.34209084477446],
            [-151.25636424326535, 60.33160582680084],
            [-151.25593508982297, 60.32438267533596],
            [-151.23919810557004, 60.32353278773041],
            [-151.228383438822, 60.32914163710259],
            [-151.22555102610227, 60.3331777126946],
            [-151.22425283693906, 60.334414988544545],
            [-151.22268106245633, 60.33590443651739],
            [-151.22308339380857, 60.33671417917148],
            [-151.22353400492307, 60.33910346660447],
            [-151.21473635935422, 60.34409385818563],
            [-151.18057574534055, 60.36658950582258],
            [-151.14332522654172, 60.40852973126292],
            [-151.16255130076047, 60.40369756687102],
            [-151.1774858405554, 60.402680177667534],
            [-151.1737951209509, 60.41250893039682],
            [-151.16924609446164, 60.41632282367651],
            [-151.17036189341184, 60.42161074204884],
            [-151.17426718973752, 60.42281397859908],
            [-151.17476071619626, 60.422737735234335],
            [-151.17457832598325, 60.42325036422443],
            [-151.17345716261502, 60.43185146025229],
            [-151.17890472912427, 60.45067336748531],
            [-151.18452395701047, 60.452642682673314]
          ]
        ]
      }
    ],

    redZones: [
      {
        name: 'College/Big Funny Red',
        coordinates: [
          [
            [-151.06000003062604, 60.56332197121339],
            [-151.06866893016218, 60.56349070064157],
            [-151.09845217906354, 60.55889250879035],
            [-151.09561976634382, 60.56260486132028],
            [-151.17424067698835, 60.57251661609308],
            [-151.1744123383653, 60.56140779451036],
            [-151.12360057078718, 60.55583889972999],
            [-151.1176782532823, 60.55474188316143],
            [-151.11527499400495, 60.554379953343364],
            [-151.11355838023542, 60.55370484017565],
            [-151.1113053246629, 60.55501285914061],
            [-151.10845145427106, 60.55547698218752],
            [-151.10375222407697, 60.55339892488235],
            [-151.09664973460553, 60.553894717178316],
            [-151.08643588267682, 60.55271324216336],
            [-151.06369075023053, 60.55366264513478],
            [-151.06369075023053, 60.55526601799182],
            [-151.0480695649278, 60.55290312498695],
            [-151.03519496165632, 60.555519174861516],
            [-151.04635295115827, 60.56269112945395],
            [-151.06025752269147, 60.56345041976081],
            [-151.06000003062604, 60.56332197121339]
          ]
        ]
      },
      {
        name: 'College Pit Red',
        coordinates: [
          [
            [-151.2547334601843, 60.48346123422819],
            [-151.26039828562375, 60.413952142186425],
            [-151.29627551340695, 60.4156471858695],
            [-151.2880357673132, 60.448090234935854],
            [-151.2825426032507, 60.48682472228648],
            [-151.25387515329953, 60.48682472228648],
            [-151.25490512156125, 60.48361111359611],
            [-151.2547334601843, 60.48346123422819]
          ]
        ]
      },
      {
        name: 'Big Funny Red',
        coordinates: [
          [
            [-151.28550036629755, 60.31387962687459],
            [-151.2904785462292, 60.31336953293082],
            [-151.29614337166865, 60.312179282749106],
            [-151.30489810189326, 60.30597227550826],
            [-151.3076446839245, 60.29750182759524],
            [-151.30300982674677, 60.293163601167706],
            [-151.2933967896374, 60.28954797263759],
            [-151.29202349862177, 60.283038833548595],
            [-151.27846224984248, 60.27980505401133],
            [-151.27408488473017, 60.28254953217526],
            [-151.27331240853388, 60.2863999233669],
            [-151.27125247201045, 60.296736300063074],
            [-151.23692019661982, 60.304305728781145],
            [-151.20653613289912, 60.32248112948608],
            [-151.2549446411999, 60.323671004264384],
            [-151.26060946663935, 60.31823122271479],
            [-151.2636993714245, 60.317381174984234],
            [-151.26781924447138, 60.31776369920113],
            [-151.27039416512568, 60.31772119673159],
            [-151.27279742440302, 60.31814621893744],
            [-151.28326876839716, 60.31430469907588],
            [-151.28550036629755, 60.31387962687459]
          ]
        ]
      }
    ]
  };

  // ==================== LOAD ADDRESSES ON MOUNT ====================
  useEffect(() => {
    loadAddressesFromStorage();
  }, []);

  // ==================== ADDRESS MANAGEMENT ====================
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
      // KPB GeoHub REST API query for addresses
      const query = `https://services.arcgis.com/r62b6pXCTNDKVNk0/arcgis/rest/services/KPB_Physical_Addresses/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=json&resultRecordCount=10000`;
      
      const response = await fetch(query);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Format addresses for our use
        const formattedAddresses = data.features
          .map(feature => {
            const attrs = feature.attributes;
            const geometry = feature.geometry;
            
            // KPB uses different field names, adjust as needed
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
        
        // Save to localStorage
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
      alert('Could not fetch from KPB GeoHub. Make sure you have internet connection. Using cached data if available.');
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
      // Filter addresses - dependent dropdown
      const filtered = allAddresses.filter(addr =>
        addr.displayAddress.toUpperCase().includes(value.toUpperCase())
      ).slice(0, 50); // Limit to 50 results
      
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

  // ==================== POINT-IN-POLYGON ====================
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

  // ==================== ZONE DETERMINATION ====================
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

  // ==================== PRICING CALCULATION ====================
  const calculatePrice = async () => {
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

  // ==================== RENDER ====================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Foster Construction</h1>
            <p style={styles.subtitle}>Delivery Price Calculator</p>
            <p style={styles.versionNote}>✓ KPB GeoHub Address Integration</p>
          </div>
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab('calculator')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'calculator' ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
            >
              <Truck size={16} /> Calculator
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'admin' ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
            >
              <Settings size={16} /> Admin
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'logs' ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
            >
              <BarChart3 size={16} /> Logs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* ========== CALCULATOR TAB ========== */}
        {activeTab === 'calculator' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Get Your Delivery Estimate</h2>
            
            {/* Address Status */}
            {!addressDataLoaded && (
              <div style={styles.warningBox}>
                <AlertCircle size={18} style={{ marginRight: 12 }} />
                <div>
                  <strong>No addresses loaded.</strong> Go to Admin tab and click "Load KPB Addresses" to get started.
                </div>
              </div>
            )}

            {/* Address Input - Dependent Dropdown */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Delivery Address *</label>
              <div style={styles.inputWrapper}>
                <MapPin size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Type address to search KPB parcel viewer..."
                  value={addressInput}
                  onChange={handleAddressInput}
                  style={styles.input}
                  disabled={!addressDataLoaded}
                />
              </div>
              
              {/* Dependent Dropdown - Shows filtered addresses as you type */}
              {showAddressDropdown && filteredAddresses.length > 0 && (
                <div style={styles.suggestions}>
                  {filteredAddresses.map((addr, idx) => (
                    <div
                      key={idx}
                      style={styles.suggestionItem}
                      onClick={() => selectAddress(addr)}
                    >
                      <MapPin size={14} style={{ marginRight: 8 }} />
                      <strong>{addr.displayAddress}</strong>
                    </div>
                  ))}
                </div>
              )}

              {selectedAddress && (
                <div style={styles.selectedBadge}>
                  ✓ {selectedAddress.displayAddress}
                </div>
              )}
            </div>

            {/* Material Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Material Type *</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                style={styles.select}
              >
                <option value="">Select a material...</option>
                {pricing.materials.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} - ${m.pricePerYard}/yard
                  </option>
                ))}
              </select>
            </div>

            {/* Yardage Input */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Yards Requested *</label>
              <input
                type="number"
                placeholder="Enter number of yards"
                value={yardage}
                onChange={(e) => setYardage(e.target.value)}
                style={styles.input}
                min="0"
                step="0.5"
              />
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={18} style={{ marginRight: 12 }} />
                <div>{error}</div>
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={calculatePrice}
              disabled={loading || !addressDataLoaded}
              style={{
                ...styles.calculateButton,
                ...(loading || !addressDataLoaded ? styles.calculateButtonDisabled : {}),
              }}
            >
              {loading ? 'Calculating...' : 'Calculate Estimate'}
            </button>

            {/* Results */}
            {result && !result.outOfZone && (
              <div style={styles.resultBox}>
                <h3 style={styles.resultTitle}>Your Delivery Estimate</h3>
                <div style={styles.pricingBreakdown}>
                  <div style={styles.pricingRow}>
                    <span>Material: {result.material}</span>
                    <span>${result.materialCost}</span>
                  </div>
                  <div style={styles.pricingRow}>
                    <span>Delivery ({result.deliveries} trips, {result.zone} Zone)</span>
                    <span>${result.deliveryTotal}</span>
                  </div>
                  <div style={styles.pricingRowTotal}>
                    <span>ESTIMATED TOTAL:</span>
                    <span>${result.estimatedTotal}</span>
                  </div>
                </div>
                <div style={styles.ctaSection}>
                  <a href="tel:+1-907-555-0123" style={styles.callButton}>
                    📞 Call Foster Construction to Order
                  </a>
                </div>
              </div>
            )}

            {result && result.outOfZone && (
              <div style={styles.outOfZoneBox}>
                <AlertCircle size={24} style={{ marginRight: 12 }} />
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>
                    {result.message}
                  </p>
                  <a href="tel:+1-907-555-0123" style={styles.callButton}>
                    📞 Call Foster Construction
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== ADMIN TAB ========== */}
        {activeTab === 'admin' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Address & Pricing Management</h2>

            {/* Address Data Management */}
            <div style={styles.adminCard}>
              <h3 style={styles.adminCardTitle}>📍 KPB Address Data</h3>
              
              <div style={styles.adminInfoBox}>
                <p style={{ margin: '0 0 12px 0' }}>
                  <strong>Current Status:</strong> {addressDataLoaded ? '✓ Loaded' : '✗ Not loaded'}
                </p>
                {addressDataLoaded && (
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                    <strong>Total Addresses:</strong> {allAddresses.length} | <strong>Last Updated:</strong> {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'}
                  </p>
                )}
              </div>

              <button
                onClick={fetchAddressesFromKPB}
                disabled={loadingAddresses}
                style={{
                  ...styles.primaryButton,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  ...(loadingAddresses ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                }}
              >
                <RefreshCw size={18} /> {loadingAddresses ? 'Loading...' : 'Load KPB Addresses from GeoHub'}
              </button>

              <p style={{ fontSize: 12, color: '#666', marginTop: 12, marginBottom: 0 }}>
                💡 Automatically saves to your browser. Click to refresh every couple months for new addresses.
              </p>
            </div>

            {/* Materials */}
            <div style={styles.adminCard}>
              <h3 style={styles.adminCardTitle}>Materials ({pricing.materials.length})</h3>
              
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>Material</th>
                    <th>Price/Yard</th>
                    <th>Max Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.materials.map(m => (
                    <tr key={m.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{m.name}</td>
                      <td style={styles.tableCell}>${m.pricePerYard.toFixed(2)}</td>
                      <td style={styles.tableCell}>{m.maxYards} yards</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Zones */}
            <div style={styles.adminCard}>
              <h3 style={styles.adminCardTitle}>Delivery Zones</h3>
              
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>Zone</th>
                    <th>Delivery Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.zones.map(z => (
                    <tr key={z.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{z.name}</td>
                      <td style={styles.tableCell}>${z.deliveryFee.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== LOGS TAB ========== */}
        {activeTab === 'logs' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Lookup History</h2>

            {lookupLogs.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>Address</th>
                      <th>Material</th>
                      <th>Yards</th>
                      <th>Zone</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lookupLogs.slice().reverse().map((log, idx) => (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.tableCell}>{log.address}</td>
                        <td style={styles.tableCell}>{log.material}</td>
                        <td style={styles.tableCell}>{log.yardage}</td>
                        <td style={styles.tableCell}>{log.zone}</td>
                        <td style={styles.tableCell}>${log.estimatedTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No lookups yet</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>Foster Construction - KPB GeoHub Integrated</p>
        <p style={{ fontSize: 12, color: '#999' }}>Dependent dropdown with exact address matching</p>
      </div>
    </div>
  );
};

// ==================== STYLES ====================
const styles = {
  container: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderBottom: '3px solid #d97706',
    padding: '24px 20px',
  },
  headerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    margin: 0,
  },
  versionNote: {
    fontSize: 11,
    color: '#4ade80',
    margin: '4px 0 0 0',
    fontWeight: 600,
  },
  tabContainer: {
    display: 'flex',
    gap: 8,
  },
  tabButton: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#d97706',
    color: '#fff',
  },
  tabButtonInactive: {
    backgroundColor: '#333',
    color: '#aaa',
  },
  mainContent: {
    flex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    padding: '32px 20px',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 28,
    color: '#1a1a1a',
  },
  warningBox: {
    padding: 16,
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 6,
    color: '#92400e',
    fontSize: 14,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    color: '#333',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    color: '#999',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderTop: 'none',
    borderRadius: '0 0 6px 6px',
    maxHeight: 300,
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  suggestionItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: '#333',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.1s',
  },
  selectedBadge: {
    marginTop: 8,
    padding: '8px 12px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #86efac',
    borderRadius: 4,
    fontSize: 13,
    color: '#166534',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: '#fff',
    fontFamily: 'inherit',
  },
  errorBox: {
    padding: 16,
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    color: '#991b1b',
    fontSize: 14,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
  },
  calculateButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#d97706',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 24,
  },
  calculateButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultBox: {
    marginTop: 24,
    padding: 24,
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
    color: '#166534',
  },
  pricingBreakdown: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 6,
  },
  pricingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  pricingRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 16,
    fontWeight: 700,
    padding: '12px 0 0 0',
    color: '#d97706',
  },
  ctaSection: {
    marginTop: 20,
  },
  callButton: {
    display: 'inline-block',
    padding: '12px 20px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
  },
  outOfZoneBox: {
    marginTop: 24,
    padding: 24,
    backgroundColor: '#fee2e2',
    border: '2px solid #fca5a5',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    color: '#991b1b',
  },
  adminCard: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: '#1a1a1a',
  },
  adminInfoBox: {
    padding: 12,
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 4,
    marginBottom: 16,
  },
  primaryButton: {
    padding: '10px 16px',
    backgroundColor: '#d97706',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 600,
    fontSize: 13,
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '12px 8px',
    fontSize: 13,
    color: '#333',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  footer: {
    backgroundColor: '#1a1a1a',
    color: '#aaa',
    textAlign: 'center',
    padding: '16px 20px',
    fontSize: 13,
    borderTop: '1px solid #333',
    marginTop: 'auto',
  },
};

export default DeliveryCalculator;
