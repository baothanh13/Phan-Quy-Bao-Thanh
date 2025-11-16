import "./App.css";
import SwapForm from "./components/SwapForm";

function App() {
  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>🔄 Currency Swap</h1>
          <p>Swap your tokens instantly with the best rates</p>
        </header>
        <SwapForm />
      </div>
    </div>
  );
}

export default App;
