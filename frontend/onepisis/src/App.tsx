import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="wrapper">
  <div className="one">Un</div>
  <form>
    <label>
    Nom :
      <input type="text" name="name" />
    </label>
      <input type="submit" value="Envoyer" />
  </form>
  <div className="two">Deux</div>
  <div className="three">Trois</div>

</div>
    </div>
  );
}

export default App;
