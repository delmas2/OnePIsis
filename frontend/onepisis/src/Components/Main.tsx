import React, { useEffect, useState } from "react";
import { Product, World } from "../world";
import "../styles/Main.css";
import ProductComponent from "./Product";
import { transform } from "../utils";


type MainProps = {
  loadworld: World;
  username: string;
};

export default function Main({ loadworld, username }: MainProps) {
  const [world, setWorld] = useState(
    JSON.parse(JSON.stringify(loadworld)) as World
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  useEffect(() => {
    setWorld(JSON.parse(JSON.stringify(loadworld)) as World);
  }, [loadworld]);


  /*function onProductionDone(p: Product): void {
    // calcul de la somme obtenue par la production du produit
    let gain = p.revenu;
    // ajout de la somme à l’argent possédé
    addToScore(gain)
   }*/
   

  return (
    <div className="main">
      <div className="one">
        <img src={"http://localhost:4000" + world.logo} />
        <div className="world">
          Bienvenue dans {world.name}, {username}
        </div>
        <span className="score" dangerouslySetInnerHTML={{__html: transform(world.money)}}>
        </span>

      </div>

      <div className="two">
        <span className="menu">Menu</span>
        <button className="amelioration-button">Améliorations</button>
        <button onClick={handleOpenModal} className="manager-button">
          Managers
        </button>
        <button className="deblocage-button">Déboclages</button>
        <button className="investisseur-button">Investisseurs</button>
      </div>
        <div className="prod1">        
        <ProductComponent produit={world.products[0]} onProductionDone={function (product: Product): void {
          throw new Error("Function not implemented.");
        } }/>
        </div>
        <div className="prod2">        
        <ProductComponent produit={world.products[1]} onProductionDone={function (product: Product): void {
          throw new Error("Function not implemented.");
        } }/>
        </div>
        <div className="prod3">        
        <ProductComponent produit={world.products[2]} onProductionDone={function (product: Product): void {
          throw new Error("Function not implemented.");
        } }/>
        </div>
        <div className="prod4">        
        <ProductComponent produit={world.products[3]} onProductionDone={function (product: Product): void {
          throw new Error("Function not implemented.");
        } }/>
        </div>
        <div className="prod5">        
        <ProductComponent produit={world.products[4]} onProductionDone={function (product: Product): void {
          throw new Error("Function not implemented.");
        } }/>
        </div>
        <div className="prod6">        
        <ProductComponent produit={world.products[5]} onProductionDone={function (product: Product): void {
          throw new Error("Function not implemented.");
        } }/>
        </div>
    
    </div>
  );
}
function addToScore(gain: Product) {
  throw new Error("Function not implemented.");
}

