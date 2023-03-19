import {World, Pallier} from "../world";
import React, {useState} from 'react';
import "../styles/AngelUpgrades.css";
 

interface AngelUpgradesProps {
    isOpen: boolean;
    onClose: () => void;
    loadworld: World,
    buyAngelUpgrades:(angels:Pallier) => void
  }
  
  export default function AngelUpgrades({ isOpen, onClose, loadworld, buyAngelUpgrades }: AngelUpgradesProps) {
    const[world, setWorld]= useState(loadworld)
    const[money, setMoney]= useState(world.money)

    function onBuyAngelUpgrades(angels: Pallier){
        if(world.activeangels>=angels.seuil){
            buyAngelUpgrades(angels)
        }
    }

    return (
      <div className={`angels ${isOpen ? "open" : ""}`}>
        <div className="angels-content">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <p>Améliore ton rendement!</p>
          <div className="angel" >
            <div>
                {<div>
                        <div>
                            {
                                world.angelupgrades.filter((angels: Pallier) => !angels.unlocked).map(
                                    (angels: Pallier) => {
                        
                                        return (
                                            
                                            <div className="angels-grid " key={angels.name}>
                                                <div>
                                                    <div className="logo">
                                                        <img
                                                            alt="angelslogo"
                                                            className="round"
                                                            src={"http://localhost:4000/" + angels.logo}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="infosangels">
                                                    <div className="angelsname">{angels.name}</div>
                                                    <div className="angelscost">{angels.seuil}</div>
                                                    <div className="angelscost">{angels.typeratio}</div>
                                                    <div className="angelscost">X{angels.ratio}</div>
                                                </div>
                                                <div onClick={() => onBuyAngelUpgrades(angels)}>
                                                    <button className="acheter" disabled={money < angels.seuil}>Acheter!</button>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                )
                            }
                            
                        </div>
                    </div>
                }
            </div>
        </div>
        </div>
      </div>
    );
  }
  