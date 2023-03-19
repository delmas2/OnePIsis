import { gql, useQuery, useApolloClient } from '@apollo/client';
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
  
  const [username, setUsername] = useState(localStorage.getItem('username') || `Youtubeur${Math.floor(Math.random()*10000)}`);
  
  // mise a jour du monde quand on écrit dans la barre d'ID
  const onUserNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem("username", event.currentTarget.value);
    setUsername(event.currentTarget.value);
    // forcer le client Apollo à refabriquer la requête
    client.resetStore()
    console.log(event.currentTarget.value);
  };
  // rechargement de la page lorsqu'on tappe la touche entrée pour réactualiser la money et le score
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      window.location.reload();
    }
  };

  const client = useApolloClient();

  const { loading, error, data, refetch } = useQuery(GET_WORLD, {
    context: { headers: { "x-user": username } }
  });

  let corps = undefined
  if (loading) corps = <div> Loading... </div>
  else if (error) corps = <div> Erreur de chargement du monde ! </div>
  else corps = <Main loadworld={data.getWorld} username={username} />

  return (
    <div className="App">
  
      <div className="wrapper">
      
  <div className="one">

    <div className="form">
    <div> Nom :</div>
    <input type="text" value={username} onChange={onUserNameChanged} onKeyPress={handleKeyPress}/>
    </div>
    { corps }
    
  </div>
  
  <div className="two">
    
  </div>
  <div className="three"></div>

</div>
    </div>
  );
}







export default App;
