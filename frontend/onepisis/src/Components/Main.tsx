import React, { useEffect, useState } from "react";
import { Pallier, Product, World } from "../world";
import "../styles/Main.css";
import ProductComponent from "./Product";
import { transform } from "../utils";
import { gql, useMutation } from "@apollo/client";
import Modal from "./Managers";
import Amelioration from "./Ameliorations";
import AngelUpgrades from "./AngelUpgrades";
import { Button, IconButton, Snackbar } from '@mui/material';
import AllUnlocks from "./AllUnlocks";
import Investisseurs from "./Investisseurs";


const ACHETER_QTE = gql`
    mutation acheterQtProduit($id: Int!, $quantite: Int!) {
        acheterQtProduit(id: $id, quantite: $quantite) {
            id
        }
    }
`;


const ENGAGER_MANAGER = gql`
    mutation engagerManager($name: String!) {
      engagerManager(name: $name) {
            name
        }
    }
`;

const ACHETER_UPGRADES = gql`
mutation acheterCashUpgrade($name: String!) {
   acheterCashUpgrade(name: $name) {
       name
    }
}`;

const RESET_WORLD = gql`
    mutation resetWorld {
      resetWorld {
        name
        }
    }
`;

const ACHETER_ANGELS_UPGRADES = gql`
mutation acheterAngelUpgrade($name: String!) {
   acheterAngelUpgrade(name: $name) {
       name
    }
}`;


type MainProps = {
  loadworld: World;
  username: string;
  
};

export default function Main({ loadworld, username }: MainProps) {
  const [world, setWorld] = useState(JSON.parse(JSON.stringify(loadworld)) as World);
  useEffect(() => {
    setWorld(JSON.parse(JSON.stringify(loadworld)) as World);
  }, [loadworld]);


  const [qtmulti, setQtmulti] = useState("x1");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [money, setMoney] = useState(world.money)
  const [isAmeliorationOpen, setIsAmeliorationOpen] = useState(false);
  const [isAllUnlocksOpen, setIsAllUnlocksOpen] = useState(false);
  const [score, setScore] = useState(world.score);
  const [isAngelUpgradesOpen, setIsAngelUpgradesOpen]= useState(false);

  const [ange, setAnge]= useState(world.activeangels)
  const [bonusAnge, setBonusAnge] = useState(world.angelbonus);
  const [isInvestisseursOpen, setIsInvestisseursOpen] = useState(false);

  const [snackbar, setSnackbar] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
};


function onProductionDone(p: Product): void {
  // calcul de la somme obtenue par la production du produit
  let gain = p.revenu * p.quantite * (1 + ange * bonusAnge / 100)
  // ajout de la somme à l’argent possédé
  let newScore = score + gain
  let newMoney = money + gain
  setScore(newScore)
  setMoney(newMoney)
  console.log(newMoney)
  console.log(money)
}



  const [acheterQtProduit] = useMutation(ACHETER_QTE,
    {
      context: { headers: { "x-user": username } },
      onError: (error): void => {
        // actions en cas d'erreur
      }
    }
  )

  const [engagerManager] = useMutation(ENGAGER_MANAGER,
    {
      context: { headers: { "x-user": username } },
      onError: (error): void => {
        // actions en cas d'erreur
      }
    }
  )
  

    const [acheterCashUpgrade] = useMutation(ACHETER_UPGRADES,
      { context: { headers: { "x-user": username }},
          onError: (error): void => {
              console.log(error);
          }
      }
  )

  const [acheterAngelUpgrade] = useMutation(ACHETER_ANGELS_UPGRADES,
    { context: { headers: { "x-user": username }},
        onError: (error): void => {
        // actions en cas d'erreur
        }
    }
)
  

  function onProductBuy(p: Product) {
    let lastQuantite = p.quantite
    //console.log("jai cliqué ")
    if (money >= p.cout) {
      if (qtmulti === "x1") {
        p.quantite += 1
        let moneyWorld = money - ((Math.pow(p.croissance, 1) - 1) / (p.croissance - 1) * p.cout)
        p.cout = p.cout * Math.pow(p.croissance, 1)
        setMoney(moneyWorld)
        console.log(money)
        acheterQtProduit({ variables: { id: p.id, quantite: 1 } });
      }
      if (qtmulti === "x10") {
        p.quantite += 10
        let moneyWorld = money - ((Math.pow(p.croissance, 10) - 1) / (p.croissance - 1) * p.cout)
        p.cout = p.cout * Math.pow(p.croissance, 10)
        setMoney(moneyWorld)
        acheterQtProduit({ variables: { id: p.id, quantite: 10 } });
      }
      if (qtmulti === "x100") {
        p.quantite += 100
        let moneyWorld = money - ((Math.pow(p.croissance, 100) - 1) / (p.croissance - 1) * p.cout)
        p.cout = p.cout * Math.pow(p.croissance, 100)
        setMoney(moneyWorld)
        acheterQtProduit({ variables: { id: p.id, quantite: 100 } });
      }
      if (qtmulti === "Max"){
        // on calcule le maximum de produit qu'on peut acheter
        let maxCanBuy = Math.floor((Math.log10(((money * (p.croissance - 1))/p.cout) + 1))/Math.log10(p.croissance))

        p.quantite += maxCanBuy
        let moneyWorld = money - ((Math.pow(p.croissance, maxCanBuy) - 1) / (p.croissance - 1) * p.cout)
        p.cout = p.cout * Math.pow(p.croissance, maxCanBuy)
        setMoney(moneyWorld)
        acheterQtProduit({ variables: { id: p.id, quantite: maxCanBuy } });
      }
    }
    // on vérifie si il y a un unlock a débloquer
    p.palliers.forEach(u => {
      if (u.idcible === p.id && p.quantite >= u.seuil && lastQuantite<u.seuil) {
        u.unlocked = true
        setSnackbar(u.name  + "débloqué!")
        setSnackbarOpen(true)
        
        if (u.typeratio === "vitesse") {
          p.vitesse = Math.round(p.vitesse / u.ratio)
        }
        if (u.typeratio === "gain") {
          p.revenu = p.revenu * u.ratio
        }
        if (u.typeratio === "ange") {
          world.angelbonus += u.ratio
        }
      }
    })
    // on vérifie si des allunlocks sont débloqués
    world.allunlocks.forEach(a => {
      if (p.quantite >= a.seuil && lastQuantite<a.seuil) {
        let allunlocks = true
        // on parcours les produits pour savoir s'il ont tous un quantité suffisante
        world.products.forEach(p => {
          if (p.quantite < a.seuil) {
            allunlocks = false
          }
        })
        if (allunlocks) {
          a.unlocked = true
          setSnackbar(a.name + "débloqué!")
          setSnackbarOpen(true)
          if (a.typeratio === "ange") {
            world.angelbonus += a.ratio
          } else {
            let produitCible = world.products.find(p => p.id === a.idcible)

            if (produitCible === undefined) {
              throw new Error(
                `Le produit avec l'id ${a.idcible} n'existe pas`)
            } else {
              if (a.typeratio === "vitesse") {
                produitCible.vitesse = Math.round(produitCible.vitesse / a.ratio)
              }
              if (a.typeratio === "gain") {
                produitCible.revenu = Math.round(produitCible.revenu * a.ratio)
              }
            }
          }
        }
      }
    })
  }


  


  function handleOpenModal() {
    setIsModalOpen(true);
    console.log(isModalOpen)
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }


  function handleOpenAmelioration() {
    setIsAmeliorationOpen(true);
    console.log(isAmeliorationOpen)
  }

  function handleCloseAmelioration() {
    setIsAmeliorationOpen(false);
  }

  function handleOpenAllUnlocks() {
    setIsAllUnlocksOpen(true);
    console.log(isAllUnlocksOpen)
  }

  function handleCloseAllUnlocks() {
    setIsAllUnlocksOpen(false);
  }

  function handleOpenAngelUpgrades() {
    setIsAngelUpgradesOpen(true);
    console.log(isAngelUpgradesOpen)
  }

  function handleCloseAngelUpgrades() {
    setIsAngelUpgradesOpen(false);
  }

  function handleOpenInvestisseurs() {
    setIsInvestisseursOpen(true);
    console.log(isInvestisseursOpen)
  }

  function handleCloseInvestisseurs() {
    setIsInvestisseursOpen(false);
  }



  function hireManager(manager: Pallier): void{
    let argent = money
    const produit = world.products.find((produit) => produit.id === manager.idcible);
    if (produit === undefined) {
      throw new Error(
        `Le produit avec l'id ${manager.idcible} n'existe pas`)
      }
      else {
        let newMoney = argent - manager.seuil;
        setMoney(newMoney)
        manager.unlocked = true;
        if (produit) {
            produit.managerUnlocked = true;

        }
        engagerManager({ variables: { name: manager.name } });
  }
    }


function buyUpgrades(upgrades: Pallier): void{
  let argent = money
  const produit = world.products.find((produit) => produit.id === upgrades.idcible);
  if (produit === undefined) {
    throw new Error(
      `Le produit avec l'id ${upgrades.idcible} n'existe pas`)
    }
  else{
      let newMoney = argent - upgrades.seuil;
      setMoney(newMoney);
      upgrades.unlocked = true;
      if (produit) {
        if(upgrades.typeratio=="gain"){
          produit.revenu= produit.revenu*upgrades.ratio;
      }else{
          produit.vitesse= produit.vitesse*upgrades.ratio;
      }
      acheterCashUpgrade({ variables: { name : upgrades.name} });
  }
      setSnackbar(upgrades.name + "débloqué!")
      setSnackbarOpen(true)
  }
}

// acheter des angelUpgrades
function buyAngelUpgrades(angel: Pallier): void {
  angel.unlocked = true
  let newAnge = ange - angel.seuil
  setAnge(newAnge)

  if (angel.typeratio === "ange") {
    let newAngelBonus = bonusAnge + angel.ratio
    setBonusAnge(newAngelBonus)
  } else {
    world.products.forEach(produit => {

      if (angel.typeratio === "vitesse") {
        produit.vitesse = Math.round(produit.vitesse / angel.ratio)
      }
      if (angel.typeratio === "gain") {
        produit.revenu = produit.revenu * angel.ratio
      }
    })
  }
  acheterAngelUpgrade({ variables: { name: angel.name } });
}
  
  function onAllUnlocks(allUnlocks: Pallier): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="main">
      <div className="one">
        <img src={"http://localhost:4000/" + world.logo} />
        <div className="world">
          Bienvenue dans {world.name}, {username}
        </div>
        <span className="score" dangerouslySetInnerHTML={{__html: transform(money)}}>
        </span>
        <div>
          <button className="Qtmulti" onClick={() => {
            switch(qtmulti) {
              case "x1":
                setQtmulti("x10");
                break;
              case "x10":
                setQtmulti("x100");
                break;
              case "x100":
                setQtmulti("MAX");
                break;
              default:
                setQtmulti("x1");
                break;
            }
          }}>{qtmulti}</button>
        </div>
      </div>
      <div className="two">
        <span className="menu">Menu</span>
        <div className="zzzz"> 
        
        <button onClick={handleOpenAmelioration} className="amelioration-button">Upgrades</button>
        <Amelioration isOpen={isAmeliorationOpen} onClose={handleCloseAmelioration} loadworld={world} buyUpgrades={buyUpgrades}/> 
        <button onClick={handleOpenModal} className="manager-button">Managers</button>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} loadworld={world} hireManager={hireManager} money={money}/> 
         
        <button className="deblocage-button" onClick={handleOpenAllUnlocks}>Déblocages</button>
        <AllUnlocks isOpen={isAllUnlocksOpen} onClose={handleCloseAllUnlocks} loadworld={world}  onAllUnlocks={onAllUnlocks}/>
        
        <button className="investisseur-button" onClick={handleOpenInvestisseurs}>Investisseurs</button>
        <Investisseurs isOpen={isInvestisseursOpen} onClose={handleCloseInvestisseurs} loadworld={world} username={username} />

        <button className="amelioration-anges-button" onClick={handleOpenAngelUpgrades}>Angel Upgrade</button>
        <AngelUpgrades isOpen={isAngelUpgradesOpen} onClose={handleCloseAngelUpgrades} loadworld={world}  buyAngelUpgrades={buyAngelUpgrades}/>

        </div>   
      </div>
      <div className="prod1">
        <ProductComponent
          loadworld={loadworld}
          product={world.products[0]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={money}
          qtmulti={qtmulti.toString()} 
          username={username}        
          />
      </div>
      <div className="prod2">
        <ProductComponent
          loadworld={loadworld}
          product={world.products[1]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={money}
          qtmulti={qtmulti.toString()} 
          username={username}        />
          
      </div>
      <div className="prod3">
        <ProductComponent
          loadworld={loadworld}
          product={world.products[2]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={money}
          qtmulti={qtmulti.toString()} 
          username={username}        />
      </div>
      <div className="prod4">
        <ProductComponent
          loadworld={loadworld}
          product={world.products[3]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={money}
          qtmulti={qtmulti.toString()} 
          username={username}        />
      </div>
      <div className="prod5">
        <ProductComponent
          loadworld={loadworld}
          product={world.products[4]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={money}
          qtmulti={qtmulti.toString()} 
          username={username}   
          />
     </div>
      <div className="prod6">
        <ProductComponent
          loadworld={loadworld}
          product={world.products[5]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={money}
          qtmulti={qtmulti.toString()} 
          username={username}  
          /> 
      </div>
      <div className="Snackbar">
      <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                message={snackbar}
            />
               
      </div>
      </div>
  );
}


