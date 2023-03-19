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

//Hook:

  const [qtmulti, setQtmulti] = useState("x1");
  const [money, setMoney] = useState(world.money)
  const [score, setScore] = useState(world.score);
  const [ange, setAnge]= useState(world.activeangels)
  const [bonusAnge, setBonusAnge] = useState(world.angelbonus);
  const [snackbar, setSnackbar] = useState("");


// Hook pour l'affichage des modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAmeliorationOpen, setIsAmeliorationOpen] = useState(false);
  const [isAllUnlocksOpen, setIsAllUnlocksOpen] = useState(false);
  const [isInvestisseursOpen, setIsInvestisseursOpen] = useState(false);
  const [isAngelUpgradesOpen, setIsAngelUpgradesOpen]= useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);  
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
};



//----------FONCTIONS GERANT L'OUVETURE ET LA FERMETURE DES "MODAL"------------------------
//--Managers
function handleOpenModal() {
  setIsModalOpen(true);
  console.log(isModalOpen)
}

function handleCloseModal() {
  setIsModalOpen(false);
}

//--Upgrades
function handleOpenAmelioration() {
  setIsAmeliorationOpen(true);
  console.log(isAmeliorationOpen)
}

function handleCloseAmelioration() {
  setIsAmeliorationOpen(false);
}

//--Déblocages
function handleOpenAllUnlocks() {
  setIsAllUnlocksOpen(true);
  console.log(isAllUnlocksOpen)
}

function handleCloseAllUnlocks() {
  setIsAllUnlocksOpen(false);
}

//--AngelUpgrades
function handleOpenAngelUpgrades() {
  setIsAngelUpgradesOpen(true);
  console.log(isAngelUpgradesOpen)
}

function handleCloseAngelUpgrades() {
  setIsAngelUpgradesOpen(false);
}

//--Investisseur
function handleOpenInvestisseurs() {
  setIsInvestisseursOpen(true);
  console.log(isInvestisseursOpen)
}

function handleCloseInvestisseurs() {
  setIsInvestisseursOpen(false);
}


//---------- PRODUCTION TERMINE ----------------
function onProductionDone(produit: Product): void {
  //calcul du gain en tenant compte de la quantite 
  let gain = produit.revenu * produit.quantite * (1 + ange * bonusAnge / 100)
  // ajout de la somme à l’argent possédé
  let newScore = score + gain
  let newMoney = money + gain
  setScore(newScore)
  setMoney(newMoney)
  //console.log(newMoney)
  //console.log(money)
}


  
//---------------- PRODUCTION D'UN PRODUIT ------------------

//--Mutation
const [acheterQtProduit] = useMutation(ACHETER_QTE,
  {
    context: { headers: { "x-user": username } },
    onError: (error): void => {
      // actions en cas d'erreur
    }
  }
)

//--Fonction
  function onProductBuy(produit: Product) {
    let Quantite = produit.quantite
    //si on peut acheter le produit alors on defini un cas pour chaque valeur de qtmulti
    if (money >= produit.cout) {
        if (qtmulti == "x1") {
        //On rajoute a la quantite du produit passer en paramètre (ici 1)
        produit.quantite = produit.quantite + 1

        //On passe dans une variable la nouvelle valeur de money
        let newMoney = money - ((Math.pow(produit.croissance, 1) - 1) / (produit.croissance - 1) * produit.cout)

        //Le nouveau coup du produit est établi
        produit.cout = produit.cout * Math.pow(produit.croissance, 1)

        // On utilise setMoney afin de passer la valeur de la variable newMoney dans money
        setMoney(newMoney)
        //On appelle la mutation
        acheterQtProduit({ variables: { id: produit.id, quantite: 1 } });
      }
      //on fait la meme chose pour qtmulti = 10
      if (qtmulti == "x10") {
        produit.quantite = produit.quantite + 10
        let newMoney = money - ((Math.pow(produit.croissance, 10) - 1) / (produit.croissance - 1) * produit.cout)
        produit.cout = produit.cout * Math.pow(produit.croissance, 10)
        setMoney(newMoney)
        acheterQtProduit({ variables: { id: produit.id, quantite: 10 } });
      }
      //on fait la meme chose pour qtmulti = 100
      if (qtmulti == "x100") {
        produit.quantite = produit.quantite + 100
        let newMoney = money - ((Math.pow(produit.croissance, 100) - 1) / (produit.croissance - 1) * produit.cout)
        produit.cout = produit.cout * Math.pow(produit.croissance, 100)
        setMoney(newMoney)
        acheterQtProduit({ variables: { id: produit.id, quantite: 100 } });
      }
      
    }
    produit.palliers.forEach(i => { // Pour chaque pallier du produit
      //On verifie si la quantite est supérieur ou égale à celle d'un palier
      if (i.idcible === produit.id && produit.quantite >= i.seuil && Quantite<i.seuil) { 
        //On débloque le pallier
        i.unlocked = true 

        // Afficher d'un message pour signaler le déblocage éventuel d'un pallier
        setSnackbar(i.name  + "débloqué!") 
        setSnackbarOpen(true) 

        // Si le type de ratio est "vitesse" on met à jour la vitesse du produit en la divisant par le ratio du pallier
        if (i.typeratio === "vitesse") { 
          produit.vitesse = Math.round(produit.vitesse / i.ratio) 
        }

        // Si le type de ratio est "gain" on met à jour le gain du produit en le multipliant par le ratio du pallier
        if (i.typeratio === "gain") { 
          produit.revenu = produit.revenu * i.ratio 
        }
        
      }
    })
    
    // de la même manière que pour les unlocks simple
    world.allunlocks.forEach(i => {
      if (produit.quantite >= i.seuil && Quantite<i.seuil) {
        let allunlocks = true
        //la différence est qu'ici nous allons parcourir tous les produits et verifier que chacun est la bonne quantité
        world.products.forEach(produit => {
          if (produit.quantite < i.seuil) {
            allunlocks = false
          }
        })
        if (allunlocks) {
          i.unlocked = true
          setSnackbar(i.name + "débloqué!")
          setSnackbarOpen(true)
          if (i.typeratio === "ange") {
            world.angelbonus += i.ratio
          } else {
            let produitCible = world.products.find(produit => produit.id === i.idcible)

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


  

//---------------- ENGAGER UN MANAGER ------------------

//--Mutation
  const [engagerManager] = useMutation(ENGAGER_MANAGER,
    {
      context: { headers: { "x-user": username } },
      onError: (error): void => {
        // actions en cas d'erreur
      }
    }
  )

  //--Fonction

  function hireManager(manager: Pallier): void{
    //On defini le produit ciblé
    const produit = world.products.find((produit) => produit.id === manager.idcible);
    
    //On met à jour l'argent
    let newMoney = money - manager.seuil;
        setMoney(newMoney)

    //On met à jour le statut du manager
        manager.unlocked = true;
        
        if (produit) {
          //On met à jour le statut du manager dans le produit ciblé
            produit.managerUnlocked = true;
        }

        // On appelle la mutation
        engagerManager({ variables: { name: manager.name } });
  
    }


//---------------- ACHETER UNE CASH UPGRADE ------------------

//--Mutation
const [acheterCashUpgrade] = useMutation(ACHETER_UPGRADES,
  { context: { headers: { "x-user": username }},
      onError: (error): void => {
          console.log(error);
      }
  }
)

//--Fonction
  function buyUpgrades(upgrades: Pallier): void{
    //On defini le produit ciblé
    let produit = world.products.find(produit => produit.id === upgrades.idcible)

    //On met à jour l'argent
    let newMoney = money - upgrades.seuil
    setMoney(newMoney)

    //On met à jour le statut de l'unlock 
    upgrades.unlocked = true;


    if(produit){ 
      if (upgrades.typeratio === "vitesse") {
        produit.vitesse = Math.round(produit.vitesse / upgrades.ratio)
      }
      if (upgrades.typeratio === "gain") {
        produit.revenu = produit.revenu * upgrades.ratio
      }
    }
    //on appelle la mutation
    acheterCashUpgrade({ variables: { name: upgrades.name } });

    //popup pour notifier l'obtention d'une nouvelle amélioration
    setSnackbar(upgrades.name + "débloqué!")
    setSnackbarOpen(true)

  }



//---------------- ACHETER UNE ANGEL UPGRADE ------------------

//--Mutation
const [acheterAngelUpgrade] = useMutation(ACHETER_ANGELS_UPGRADES,
  { context: { headers: { "x-user": username }},
      onError: (error): void => {
      // actions en cas d'erreur
      }
  }
)

//--Fonction
function buyAngelUpgrades(angel: Pallier): void {
  //On modifie le montant d'ange après l'achat
  let newAnge = ange - angel.seuil
  setAnge(newAnge)

  //On modifie l'état de l'améliration
  angel.unlocked = true


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
  //On appelle la mutation
  acheterAngelUpgrade({ variables: { name: angel.name } });
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
        <AllUnlocks isOpen={isAllUnlocksOpen} onClose={handleCloseAllUnlocks} loadworld={world}  />
        
        <button className="investisseur-button" onClick={handleOpenInvestisseurs}>Investisseurs</button>
        <Investisseurs isOpen={isInvestisseursOpen} onClose={handleCloseInvestisseurs} loadworld={world} username={username} />

        <button className="amelioration-anges-button" onClick={handleOpenAngelUpgrades}>Angel Upgrades</button>
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


