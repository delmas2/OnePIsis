import {World, Pallier} from "../world";
import React, {useState} from 'react';
import "../styles/Amelioration.css";
 

interface AmeliorationProps {
    isOpen: boolean;
    onClose: () => void;
    loadworld: World,
    buyUpgrades:(upgrades:Pallier) => void
  }
  
  export default function Amelioration({ isOpen, onClose, loadworld, buyUpgrades }: AmeliorationProps) {
    const[world, setWorld]= useState(loadworld)
    const[money, setMoney]= useState(world.money)

    function onBuyUpgrades(upgrades: Pallier){
        if(world.money>=upgrades.seuil){
            buyUpgrades(upgrades)
        }
    }

    return (
      <div className={`upgrade ${isOpen ? "open" : ""}`}>
        <div className="upgrade-content">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <p>Améliore ton rendement!</p>
          <div className="upgrade" >
            <div>
                {<div>
                        <div>
                            {
                                world.upgrades.filter((upgrades: Pallier) => !upgrades.unlocked).map(
                                    (upgrades: Pallier) => {
                        
                                        return (
                                            <div key={upgrades.idcible} className="upgrade-grid">
                                                <div>
                                                    <div className="logo">
                                                        <img
                                                            alt="upgradelogo"
                                                            className="round"
                                                            src={"http://localhost:4000/" + upgrades.logo}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="infosupgrade">
                                                    <div className="upgradename">{upgrades.name}</div>
                                                    <div className="upgradecost">{upgrades.seuil}</div>
                                                </div>
                                                <div onClick={() => onBuyUpgrades(upgrades)}>
                                                    <button className="acheter" disabled={money < upgrades.seuil}>Acheter!</button>
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
  