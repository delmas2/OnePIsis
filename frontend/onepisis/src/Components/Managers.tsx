import {World, Pallier} from "../world";
import React, {useState} from 'react';
import "../styles/Manager.css";
 

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    loadworld: World,
    hireManager:(manager:Pallier) => void
  }
  
  export default function Modal({ isOpen, onClose, loadworld, hireManager }: ModalProps) {
    const[world, setWorld]= useState(loadworld)
    const[money, setMoney]= useState(world.money)


    return (
      <div className={`modal ${isOpen ? "open" : ""}`}>
        <div className="modal-content">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <p>Achètes les personnages préférés de tes personnages préferés</p>
          <div className="manager" >
            <div>
                {<div>
                        <div>
                            {
                                world.managers.filter((manager: Pallier) => !manager.unlocked).map(
                                    (manager: Pallier) => {
                        
                                        return (
                                            <div key={manager.idcible} className="managergrid">
                                                <div>
                                                    <div className="logo">
                                                        <img
                                                            alt="manager logo"
                                                            className="round"
                                                            src={"http://localhost:4000/" + manager.logo}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="infosmanager">
                                                    <div className="managername">{manager.name}</div>
                                                    <div className="managercible">
                                                        {world.products[manager.idcible - 1].name}
                                                    </div>
                                                    <div className="managercost">{manager.seuil}</div>
                                                </div>
                                                <div onClick={() => hireManager(manager)}>
                                                    <button className="acheter" disabled={money <= manager.seuil}>Acheter!</button>
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
  