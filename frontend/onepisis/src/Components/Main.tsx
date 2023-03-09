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
  const [world, setWorld] = useState(JSON.parse(JSON.stringify(loadworld)) as World);
  const [qtmulti, setQtmulti] = useState("x1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setWorld(JSON.parse(JSON.stringify(loadworld)) as World);
  }, [loadworld]);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function onProductionDone(p: Product): void {
    // calcul de la somme obtenue par la production du produit
    let gain = p.revenu;
    // ajout de la somme à l’argent possédé
    world.score += gain;
    world.money += gain;
    setWorld(prevWorld => ({ ...prevWorld, money: prevWorld.money }));
  }

  function onProductBuy(quantity: number, product: Product): void {
    let prix = prev(quantity, product);
    //console.log(product.quantite)
    product.quantite = product.quantite + quantity;
    //console.log(product.quantite)
    product.cout = product.cout * Math.pow(product.croissance, quantity);
    world.money = world.money - prix;
    setWorld(prevWorld => ({ ...prevWorld, money: prevWorld.money }));
  }

  // calcule le prix du produit en fonction de sa quantité et de sa croissance
  function prev(quantity: number, product: Product): number {
    let price = product.cout;
    for (let i = 1; i < quantity; i++) {
      price = product.cout + product.cout * product.croissance;
    }
    return price;
  }

  
  return (
    <div className="main">
      <div className="one">
        <img src={"http://localhost:4000" + world.logo} />
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
        <button className="amelioration-button">Améliorations</button>
        <button onClick={handleOpenModal} className="manager-button">Managers</button>
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
        />
      </div>
      <div className="prod2">
        <ProductComponent
          produit={world.products[1]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()}
        />
      </div>
      <div className="prod3">
        <ProductComponent
          produit={world.products[2]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()}
        />
      </div>
      <div className="prod4">
        <ProductComponent
          produit={world.products[3]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()}
        />
      </div>
      <div className="prod5">
        <ProductComponent
          produit={world.products[4]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()}
        />
      </div>
      <div className="prod6">
        <ProductComponent
          produit={world.products[5]}
          onProductionDone={onProductionDone}
          onProductBuy={onProductBuy}
          money={world.money}
          qtmulti={qtmulti.toString()}
        />
      </div>
    </div>
  );
}