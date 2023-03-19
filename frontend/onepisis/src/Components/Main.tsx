import React, { useEffect, useState } from "react";
import { Pallier, Product, World } from "../world";
import "../styles/Main.css";
import ProductComponent from "./Product";
import { transform } from "../utils";
import { gql, useMutation } from "@apollo/client";
import Modal from "./Managers";
import Amelioration from "./Ameliorations";
import AllUnlocksComponent from "./AllUnlocks";
import AngelUpgrades from "./AngelUpgrades";
import { Button, IconButton, Snackbar } from '@mui/material';


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
  

  const [snackbar, setSnackbar] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
};


  function onProductionDone(produit: Product): void {
    // calcul de la somme obtenue par la produition du produit
    let gain = produit.revenu * produit.quantite;
    // ajout de la somme à l’argent possédé
    let newScore = score + gain;
    setScore(newScore)
    let newMoney = money + gain;
    setMoney(newMoney) 
    console.log("argent apres production")  
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


    function onProductBuy(produit: Product) {
      let Quantite = produit.quantite
      console.log(produit.cout)
      if (money >= produit.cout) {
        if (qtmulti === "x1") {
          produit.quantite += 1
          let newMoney = money - ((Math.pow(produit.croissance, 1) - 1) / (produit.croissance - 1) * produit.cout)
          produit.cout = produit.cout * Math.pow(produit.croissance, 1)
          setMoney(newMoney)
          console.log(produit.cout)
          acheterQtProduit({ variables: { id: produit.id, quantite: 1 } })

          console.log("argent")
          console.log(money)
          
          console.log("produit.cout")
          console.log(produit.cout)
        }
        
        if (qtmulti === "x10") {
          produit.quantite += 10
          let newMoney = money - ((Math.pow(produit.croissance, 10) - 1) / (produit.croissance - 1) * produit.cout)
          produit.cout = produit.cout * Math.pow(produit.croissance, 10)
          setMoney(newMoney)
          acheterQtProduit({ variables: { id: produit.id, quantite: 10 } });
        }
        if (qtmulti === "x100") {
          produit.quantite += 100
          let newMoney = money - ((Math.pow(produit.croissance, 100) - 1) / (produit.croissance - 1) * produit.cout)
          produit.cout = produit.cout * Math.pow(produit.croissance, 100)
          setMoney(newMoney)
          acheterQtProduit({ variables: { id: produit.id, quantite: 100 } });
        }
        if (qtmulti === "Max"){
          let maxCanBuy = Math.floor((Math.log10(((money * (produit.croissance - 1))/produit.cout) + 1))/Math.log10(produit.croissance))
  
          produit.quantite += maxCanBuy
          let newMoney = money - ((Math.pow(produit.croissance, maxCanBuy) - 1) / (produit.croissance - 1) * produit.cout)
          produit.cout = produit.cout * Math.pow(produit.croissance, maxCanBuy)
          setMoney(newMoney)
          acheterQtProduit({ variables: { id: produit.id, quantite: maxCanBuy } });
        }
      }

      produit.palliers.forEach(i => {
        if (i.idcible === produit.id && produit.quantite >= i.seuil && Quantite<i.seuil) {
          i.unlocked = true
          setSnackbar(i.name + "" + i.typeratio +"" + "" + i.ratio + "débloqué!")
          setSnackbarOpen(true)
          if (i.typeratio === "vitesse") {
            produit.vitesse = Math.round(produit.vitesse / i.ratio)
          }
          if (i.typeratio === "gain") {
            produit.revenu = produit.revenu * i.ratio
          }
          if (i.typeratio === "ange") {
            world.angelbonus += i.ratio
          }
        }
      }
        );
        world.allunlocks.forEach(i => {
          if (produit.quantite >= i.seuil && Quantite<i.seuil) {
            let allunlocks = true
            // on parcours les produits pour savoir s'il ont tous un quantité suffisante
            world.products.forEach(p => {
              if (p.quantite < i.seuil) {
                allunlocks = false
              }
            })
            if (allunlocks) {
              i.unlocked = true
              setSnackbar(i.name + i.typeratio + "fois" + i.ratio + "débloqué!")
              setSnackbarOpen(true)
              if (i.typeratio === "ange") {
                world.angelbonus += i.ratio
              } else {
                let produitCible = world.products.find(p => p.id === i.idcible)
    
                if (produitCible === undefined) {
                  throw new Error(
                    `Le produit avec l'id ${i.idcible} n'existe pas`)
                } else {
                  if (i.typeratio === "vitesse") {
                    produitCible.vitesse = Math.round(produitCible.vitesse / i.ratio)
                  }
                  if (i.typeratio === "gain") {
                    produitCible.revenu = Math.round(produitCible.revenu * i.ratio)
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
      setSnackbar(upgrades.name + upgrades.typeratio + "fois" + upgrades.ratio + "débloqué!")
      setSnackbarOpen(true)
  }
}

function buyAngelUpgrades(angels: Pallier): void{
  let anges = angels
  const produit = world.products.find((produit) => produit.id === angels.idcible);

  if (produit === undefined) {
    throw new Error(
      `Le produit avec l'id ${angels.idcible} n'existe pas`)
    }
  else{
      let newAnges = ange - angels.seuil;
      setAnge(newAnges);
      angels.unlocked = true;
      if (produit) {
        if(angels.typeratio=="gain"){
          produit.revenu= produit.revenu*angels.ratio;
      }else{
          produit.vitesse= produit.vitesse*angels.ratio;
      }
      acheterCashUpgrade({ variables: { name : angels.name} });
  }
  }
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
        <AllUnlocksComponent isOpen={isAllUnlocksOpen} onClose={handleCloseAllUnlocks} loadworld={world}   onAllUnlocks={onAllUnlocks}/>
        
        <button className="investisseur-button">Investisseurs</button>

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


