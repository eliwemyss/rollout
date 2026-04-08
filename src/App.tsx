function App() {
  console.log('[v0] App component rendering');
  
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Test Page</h1>
      <p>If you can see this, React is rendering successfully.</p>
      <p>Check the browser console for debug messages.</p>
    </div>
  );
}

export default App;
