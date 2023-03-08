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
        <ProductComponent product={world.products[0]}/>
        </div>
        <div className="prod2">        
        <ProductComponent product={world.products[1]}/>
        </div>
        <div className="prod3">        
        <ProductComponent product={world.products[2]}/>
        </div>
        <div className="prod4">        
        <ProductComponent product={world.products[3]}/>
        </div>
        <div className="prod5">        
        <ProductComponent product={world.products[4]}/>
        </div>
        <div className="prod6">        
        <ProductComponent product={world.products[5]}/>
        </div>
    
    </div>
  );
}
