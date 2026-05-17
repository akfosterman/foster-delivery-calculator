import React, { useState } from 'react';

export default function DeliveryCalculator() {
  const [address, setAddress] = useState('');
  const [material, setMaterial] = useState('');
  const [yards, setYards] = useState('');
  const [result, setResult] = useState(null);

  const materials = [
    { name: 'Pit Run Gravel', price: 9.25 },
    { name: '2 Minus', price: 14.00 },
    { name: 'Fill Dirt', price: 3.00 },
  ];

  const handleCalculate = () => {
    if (!material || !yards) {
      alert('Please fill in all fields');
      return;
    }
    
    const mat = materials.find(m => m.name === material);
    const cost = parseFloat(yards) * mat.price;
    const delivery = 150;
    const total = cost + delivery;
    
    setResult({ material, yards, cost: cost.toFixed(2), delivery, total: total.toFixed(2) });
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
          <option value="">Select</option>
          {materials.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Yards: </label>
        <input type="number" value={yards} onChange={(e) => setYards(e.target.value)} style={{ width: '100%', padding: '8px' }} />
      </div>

      <button onClick={handleCalculate} style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', cursor: 'pointer' }}>
        Calculate
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
          <h3>Estimate</h3>
          <p>Material: {result.material} - {result.yards} yards</p>
          <p>Cost: ${result.cost}</p>
          <p>Delivery: ${result.delivery}</p>
          <p style={{ fontWeight: 'bold', fontSize: '18px' }}>TOTAL: ${result.total}</p>
        </div>
      )}
    </div>
  );
}
