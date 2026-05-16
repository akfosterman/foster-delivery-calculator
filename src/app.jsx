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
      const xj =
