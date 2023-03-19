import React, {useState} from 'react';
import "../styles/Investisseurs.css"
import {gql, useMutation} from "@apollo/client";
import {World} from "../world";

type InvestisseursProps = {
    username: string;
    loadworld: World;
    onClose: () => void;
    isOpen: boolean;

}
function Investisseurs({ isOpen, onClose, username, loadworld,}: InvestisseursProps) {

    const RESET_WORLD = gql`
         mutation resetWorld {
            resetWorld {
    name
    logo
    money
    score
    totalangels
    activeangels
    angelbonus
    lastupdate
    products {
      id
      name
      logo
      cout
      croissance
      revenu
      vitesse
      quantite
      timeleft
      managerUnlocked
      palliers {
        name
        logo
        seuil
        idcible
        ratio
        typeratio
        unlocked
      }
    }
    allunlocks {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    upgrades {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    angelupgrades {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    managers {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
             }
         }`;

    const [resetWorld] = useMutation(RESET_WORLD,
        { context: { headers: { "x-user": username }},
            onError: (error): void => {
                console.log(error);
            }
        }
    )
    let affichageAnges = Math.round(150 * Math.sqrt(loadworld.score / Math.pow(10, 15)) - loadworld.totalangels);


return(
    <div className={`custom-modal ${isOpen ? "open" : ""}`}> 
    <div className="custom-modal-header">
      <span className="custom-modal-close" onClick={onClose}>&times;</span>
      <h1 className="custom-modal-title">Investisseurs</h1>
      <div>
                        <div className="infosinvestors">
                            <div className="totalangels">Anges actifs : {loadworld.activeangels}</div>
                            <div className="angelbonus">{loadworld.angelbonus}% de bonus par anges</div>
                        </div>
                        <div>
                            <button className="button-reset" onClick={() => { resetWorld(); window.location.reload(); }}>
                                Reset World avec {affichageAnges} nouveaux anges en plus
                            </button>
                        </div>
                    </div>
                </div>
</div>



      );
    }

export default Investisseurs;
