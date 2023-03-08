import { gql, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import Main from './Main';
import './Main.tsx';

const GET_WORLD = gql`
query getWorld {
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
      palliers {
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
    storedUsername = "Nakama" +  Math.floor(Math.random() * 10000)
    localStorage.setItem('username', storedUsername);
    }
    setUsername(storedUsername);
    
  }, []);

    

  const {loading, error, data, refetch } = useQuery(GET_WORLD, {
    context: { headers: { "x-user": username } }
   });
   let main = undefined
   let corps = undefined
   if (loading) corps = <div> Loading... </div>
   else if (error) corps = <div> Erreur de chargement du monde ! </div>
   else main= <div> <Main loadworld={data.getWorld} username={username} /> </div>;
   

  return (
    <div className="App">
  
      <div className="wrapper">
      
  <div className="one">

    <div className="form">
    <div> Nom :</div>
    <input type="text" value={username} onChange={onUserNameChanged}/>
    </div>
    { corps }
    { main}
  </div>
  
  <div className="two">
    
  </div>
  <div className="three"></div>

</div>
    </div>
  );
}







export default App;
