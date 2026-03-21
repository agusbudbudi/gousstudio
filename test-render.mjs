import { JSDOM } from 'jsdom';

(async () => {
  try {
    const dom = await JSDOM.fromURL('http://localhost:5173', {
      runScripts: "dangerously",
      resources: "usable"
    });
    
    dom.window.console.error = (...args) => {
      console.log('BROWSER EXCEPTION:', ...args);
    };
    
    // Give it 2 seconds to run React
    setTimeout(() => {
      const root = dom.window.document.getElementById('root');
      console.log('Root HTML:', root ? root.innerHTML.slice(0, 100) : 'NO ROOT');
      process.exit(0);
    }, 2000);
  } catch (err) {
    console.error('Fetch error:', err);
  }
})();
