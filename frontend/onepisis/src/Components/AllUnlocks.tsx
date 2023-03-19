import React, {useState} from 'react';
import {Pallier, World} from "../world";
import "../styles/AllUnlocks.css"
import "../styles/Paliers.css"
import {Button} from "@mui/material";


type AllUnloksProps = {
    isOpen: boolean;
    onClose: () => void;
    loadworld: World;
    onAllUnlocks: (allUnlocks: Pallier) => void;

}
function AllUnlocks({loadworld, isOpen, onClose}: AllUnloksProps) {



    return (
    <div className={`custom-modal ${isOpen ? "open" : ""}`}> 
    <div className="custom-modal-header">
      <span className="custom-modal-close" onClick={onClose}>&times;</span>
      <h1 className="custom-modal-title">Palliers</h1>
    </div>
    <div className="custom-modal-body">
      {loadworld.products.map(product => (
        <div className="product-grid" key={product.id}>
          <div className="product-name">
            <h2>{product.name}</h2>
          </div>
          <div className="product-palliers">
            {product.palliers.map(pallier => (
              <div className="pallier-info" >
                <div className="pallier-image">
                  <img alt="palier logo" className="pallier-img" src={"http://localhost:4000/" + pallier.logo}/>
                </div>
                <div className="pallier-details">
                  <h3 className="pallier-name">{pallier.name}</h3>
                  <div className="pallier-seuil">{pallier.seuil}</div>
                  <div className="pallier-ratio">{pallier.typeratio} x{pallier.ratio}</div>
                  {pallier.unlocked && <p className="pallier-unlocked">Dévérouillé</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="custom-modal-header">
        <h1 className="custom-modal-title2">AllUnloks</h1>
      </div>
      <div className="custom-modal-body">
        {loadworld.allunlocks.filter(allUnloks => !allUnloks.unlocked).map(allunlock => (
          <div className="allunlock-grid" key={allunlock.name}>
            <div className="allunlock-image">
              <img alt="allUnloks logo" className="allunlock-img" src={"http://localhost:4000/" + allunlock.logo} />
            </div>
            <div className="allunlock-details">
              <h2 className="allunlock-name">{allunlock.name}</h2>
              <div className="allunlock-cost">{allunlock.seuil}</div>
              <div className="allunlock-ratio">{allunlock.typeratio} x{allunlock.ratio}</div>
              {allunlock.unlocked && <p className="pallier-unlocked">Dévérouillé</p>}

            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
            
    );
}
export default AllUnlocks;