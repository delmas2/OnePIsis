import { gql, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import './App.css';

const GET_WORLD = gql`
query ExampleQuery {
  getWorld {
    activeangels
    allunlocks {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    angelbonus
    angelupgrades {
      idcible
      logo
      name
      ratio
      seuil
      typeratio
      unlocked
    }
    lastupdate
    logo
    managers {
      idcible
      name
      logo
      ratio
      seuil
      typeratio
      unlocked
    }
    money
    name
    products {
      cout
      croissance
      id
      logo
      managerUnlocked
      name
      paliers {
        idcible
        logo
        name
        ratio
        seuil
        typeratio
        unlocked
      }
      quantite
      revenu
      timeleft
      vitesse
    }
    score
    totalangels
    upgrades {
      idcible
      logo
      name
      ratio
      seuil
      typeratio
      unlocked
    }
  }
}`



function App() {
  const [username, setUsername] = useState("");
  function onUserNameChanged(event: React.FormEvent<HTMLInputElement>) {
    setUsername(event.currentTarget.value);
    localStorage.setItem('username', event.currentTarget.value);
  };

  useEffect(() => {
    let storedUsername = localStorage.getItem('username');
    if (storedUsername) {}
    else{
    storedUsername = "Copine n°" +  Math.floor(Math.random() * 10000)
    localStorage.setItem('username', storedUsername);
    }
    setUsername(storedUsername);
    
  }, []);


  const {loading, error, data, refetch } = useQuery(GET_WORLD, {
    context: { headers: { "x-user": username } }
   });
  

  return (
    <div className="App">
  
      <div className="wrapper">
      
  <div className="one">

  <form>
  <label className="form">
        Nom:
        <input type="text" value={username} onChange={onUserNameChanged} />
  </label>
    </form>

  </div>
  
  <div className="two">Menu</div>
  <div className="three">Trois</div>

</div>
    </div>
  );
}






export default App;
