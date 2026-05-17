import React, { useState } from 'react';

export default function DeliveryCalculator() {
  const [address, setAddress] = useState('');
  const [material, setMaterial] = useState('');
  const [yards, setYards] = useState('');
  const [zone, setZone] = useState('');
  const [result, setResult] = useState(null);

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

  const handleCalculate = () => {
    if (!material || !yards || !zone) {
      alert('Please fill in all fields');
      return;
    }
    
    const mat = materials.find(m => m.name === material);
    const deliveryFees = { green: 125, yellow: 155, red: 185 };
    const cost = parseFloat(yards) * mat.price;
    const delivery = deliveryFees[zone];
    const total = cost + delivery;
    
    setResult({ 
      material, 
      yards, 
      zone, 
      cost: cost.toFixed(2), 
      delivery, 
      total: total.toFixed(2) 
    });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Foster Construction</h1>
      <p>Delivery Price Calculator</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Address: </label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '8px' }} />
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

      <div style={{ marginBottom: '20px' }}>
        <label>Delivery Zone: </label>
        <select value={zone} onChange={(e) => setZone(e.target.value)} style={{ width: '100%', padding: '8px' }}>
          <option value="">Select Zone</option>
          <option value="green">Green Zone - $125</option>
          <option value="yellow">Yellow Zone - $155</option>
          <option value="red">Red Zone - $185</option>
        </select>
      </div>

      <button onClick={handleCalculate} style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
        Calculate
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
          <h3>Your Estimate</h3>
          <p>Address: {address}</p>
          <p>Material: {result.material} - {result.yards} yards</p>
          <p>Zone: {result.zone.toUpperCase()}</p>
          <p>Material Cost: ${result.cost}</p>
          <p>Delivery: ${result.delivery}</p>
          <p style={{ fontWeight: 'bold', fontSize: '18px' }}>TOTAL: ${result.total}</p>
        </div>
      )}
    </div>
  );
}
