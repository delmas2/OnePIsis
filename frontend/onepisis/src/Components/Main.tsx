import React, { useEffect, useState } from "react";
import { Pallier, Product, World } from "../world";
import "../styles/Main.css";
import ProductComponent from "./Product";
import { transform } from "../utils";
import { gql, useMutation } from "@apollo/client";
import Modal from "./Managers";
import Amelioration from "./Ameliorations";

type MainProps = {
  loadworld: World;
  username: string;
  
};

export default function Main({ loadworld, username }: MainProps) {
  const [world, setWorld] = useState(JSON.parse(JSON.stringify(loadworld)) as World);
  const [qtmulti, setQtmulti] = useState("x1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [money, setMoney] = useState(world.money)
  const [isAmeliorationOpen, setIsAmeliorationOpen] = useState(false);






  useEffect(() => {
    setWorld(JSON.parse(JSON.stringify(loadworld)) as World);
  }, [loadworld]);



  function onProductionDone(produit: Product): void {
    // calcul de la somme obtenue par la produition du produit
    let gain = produit.revenu * produit.quantite;
    // ajout de la somme à l’argent possédé
    world.score += gain;
    world.money += gain;
    setWorld(prevWorld => ({ ...prevWorld, money: prevWorld.money }));
  }

  
  const ACHETER_QTE = gql`
         mutation acheterQtProduit($id: Int!, $quantite: Int!) {
            acheterQtProduit(id: $id, quantite: $quantite) {
             id
             quantite
             }
         }`;

  const ACHETER_UPGRADES = gql`
         mutation acheterCashUpgrade($name: String!) {
            acheterCashUpgrade(name: $name) {
                name
             }
         }`;


    const [acheterQtProduit] = useMutation(ACHETER_QTE,
        { context: { headers: { "x-user": username }},
            onError: (error): void => {
                console.log(error);
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
  function onProductBuy(quantite: number, produit: Product): void {
    console.log("test")
    console.log(world.money)
    let prix = prevision(quantite, produit)
    console.log(produit.quantite)
    console.log("avant ajout quantite")
    produit.quantite= produit.quantite + quantite
    console.log("apres ajout quantite")
    console.log(produit.quantite)
    produit.cout=produit.cout*Math.pow(produit.croissance, quantite)
    world.money = world.money - prix
    setWorld(prevWorld => ({...prevWorld, money: prevWorld.money}));
    console.log(world.money)
    //acheterQtProduit({ variables: { id: produit.id, quantite:produit.quantite } });
    console.log("apres mutation")
    console.log(produit.quantite)

}


  // calcule le prix du produit en fonction de sa quantité et de sa croissance
  function prevision(quantity: number, produit: Product): number {
    let price = produit.cout;
    let somme= produit.cout
    for (let i = 1; i < quantity; i++) {
      price =produit.cout * produit.croissance
      somme = somme + price;
    }
    console.log("somme "+ somme)
    return somme;
    
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




  function hireManager(manager: Pallier): void{
    let arg = world.money
    if (arg >= manager.seuil) {
        // Retirer le coût du manager de l'argent possédé par le joueur
        world.money = arg - manager.seuil;
        // Positionner la propriété unlocked du manager à vrai
        manager.unlocked = true;
        // Trouver le produit associé au manager
        const produit = world.products.find((p) => p.id === manager.idcible);
        if (produit) {
            // Positionner la propriété managerUnlocked du produit à vrai
            produit.managerUnlocked = true;

        }
    }
}

function buyUpgrades(upgrades: Pallier): void{
  let arg = world.money
  if (arg >= upgrades.seuil) {
      // Retirer le coût de l'upgrades de l'argent possédé par le joueur
      world.money = arg - upgrades.seuil;
      // Positionner la propriété unlocked de l'upgrades à vrai
      upgrades.unlocked = true;
      // Trouver le produit associé à l'upgrades
      const produit = world.products.find((p) => p.id === upgrades.idcible);
      if (produit) {
        if(upgrades.typeratio=="gain"){
          produit.revenu= produit.revenu * upgrades.ratio;
        }
                    
      acheterCashUpgrade({ variables: { name : upgrades.name} });
      }
  }
}


  
  return (
    <div className="main">
      <div className="one">
        <img src={"http://localhost:4000/" + world.logo} />
        <div className="world">
          Bienvenue dans {world.name}, {username}
        </div>
        <span className="score" dangerouslySetInnerHTML={{__html: transform(world.money)}}>
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
        <button onClick={handleOpenAmelioration} className="amelioration-button">Améliorations</button>
        <button onClick={handleOpenModal} className="manager-button">Managers</button>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} loadworld={world} hireManager={hireManager}/> 
        </div>    
        <button className="deblocage-button">Déblocages</button>
        <button className="investisseur-button">Investisseurs</button>
      </div>
      <div className="prod1">
        <ProductComponent
          produit={world.products[0]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()} 
          username={username}        
          />
      </div>
      <div className="prod2">
        <ProductComponent
          produit={world.products[1]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()} 
          username={username}        />
          
      </div>
      <div className="prod3">
        <ProductComponent
          produit={world.products[2]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()} 
          username={username}        />
      </div>
      <div className="prod4">
        <ProductComponent
          produit={world.products[3]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()} 
          username={username}        />
      </div>
      <div className="prod5">
        <ProductComponent
          produit={world.products[4]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()} 
          username={username}   
          />
     </div>
      <div className="prod6">
        <ProductComponent
          produit={world.products[5]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()} 
          username={username}  
          /> 
      </div>
    </div>
  );
}


