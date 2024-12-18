import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App bg-white">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-green-700">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hi
        </a>
      </header>
    </div>
  );
}

export default App;
