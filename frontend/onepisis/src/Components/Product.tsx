import {  Product } from "../world"; // Import Product depuis le fichier "../world"
import '../styles/Product.css'; // Import de la feuille de style "../styles/Product.css"
import { transform } from "../utils"; // Import de la fonction "transform" depuis le fichier "../utils"
import MyProgressbar, { Orientation } from './ProgressBar'; // Import de MyProgressbar et Orientation depuis le fichier "./ProgressBar"
import {useInterval} from './MyInterval'; // Import de la fonction "useInterval" depuis le fichier "./MyInterval"
import { useRef, useState } from "react"; // Import de la fonction "useRef" et "useState" depuis la librairie React
import { gql, useMutation } from "@apollo/client";

// Définition du type ProductProps qui représente les propriétés de ProductComponent
type ProductProps = {
  produit: Product;
  onProductionDone: (product: Product) => void;
  onProductBuy: (quantity: number, product: Product) => void;
  money: number;
  qtmulti: string;
  username: string;
};


// Définition de ProductComponent qui représente un composant React
function ProductComponent({ produit, onProductionDone, onProductBuy, money, qtmulti, username }: ProductProps) {
  // Définition de l'état "timeLeft" qui représente le temps restant pour produire le produit
  const [timeLeft, setTimeLeft] = useState(produit.timeleft);
  // Définition d'une référence "lastUpdate" qui stocke le temps de la dernière mise à jour
  const lastUpdate = useRef(Date.now());

  // Fonction qui calcule le score de production
  function calcScore() {
    let end = Date.now() - lastUpdate.current;
    lastUpdate.current = Date.now();
    
  if (produit.managerUnlocked) {
        setTimeLeft(produit.vitesse);
        if (timeLeft === 0) {
            return;
        }
        if (end >= timeLeft) {
            setTimeLeft(0);
            onProductionDone(produit);
        } else {
            setTimeLeft(timeLeft - end);
        }
    }else{
    if (timeLeft === 0) {
        return;
    }
    if (end >= timeLeft) {
        setTimeLeft(0);
        onProductionDone(produit);
    } else {
        setTimeLeft(timeLeft - end);
    }}
}
 // Utilisation de la fonction "useInterval" pour appeler la fonction "calcScore" toutes les 100 millisecondes
 useInterval(() => calcScore(), 100)


const LANCER_PRODUCTION = gql`
 mutation lancerProductionProduit($id: Int!) {
 lancerProductionProduit(id: $id) {
      id
}
}`

const [lancerProduction] = useMutation(LANCER_PRODUCTION,
 { context: { headers: { "x-user": username }},
 onError: (error): void => {
console.log("error")
 }
 }
)

 // Fonction qui lance la production du produit
 function startFabrication(){
    setTimeLeft(produit.vitesse);
    lastUpdate.current=Date.now();
    lancerProduction({ variables: { id: produit.id } });
 }

 // Fonction qui calcule la quantité maximale de produits achetables
 function MaxBuy(): number {
 const cost = produit.cout;
        const croissance = produit.croissance;
        const affordable = money / cost;
        if (croissance === 1) {
            return Math.floor(affordable);
            //nombre d'unités que l'utilisateur peut acheter avec son argent disponible, arrondi à l'entier inférieur
        } else {
            const maxBuyable = Math.floor(Math.log(1 - affordable * (1 - croissance)) / Math.log(croissance));
            return maxBuyable > 0 ? maxBuyable : 0;
            //nombre maximal d'unités achetables en prenant en compte le taux de croissance
        }
 }

 
/**
 * Fonction qui gère l'achat d'un produit.
 */
function handleBuyProduct() {
  // On calcule le nombre maximum d'achat possible.
  const canBuy = MaxBuy();
if(qtmulti=="Max"){
    if(canBuy >0){
  onProductBuy(canBuy, produit)
    }
}
else{
    // On récupère l'entier à partir de la chaîne de caractères qtmulti.
    const qtmultInt = parseInt(qtmulti.substring(1));
  if(qtmultInt <= canBuy){
    onProductBuy(qtmultInt, produit)

  }
}
}

 return (
  <div className="product-container">
  <div className="barre-image">
    <img
  className="image"
  src={"http://localhost:4000/" + produit.logo}
  height="170"
  width="100"
  style={{ opacity: produit.quantite <= 0 ? 0.5 : 1, cursor: produit.quantite <= 0 ? "not-allowed" : "pointer" }} // Applique un style pour donner l'apparence d'un élément désactivé
  onClick={() => {
    if (produit.quantite > 0 ) {
      startFabrication();
    }}}
/>
    <div className="progressbar-container">
      <MyProgressbar className="barstyle" vitesse={produit.vitesse} initialvalue={produit.vitesse - timeLeft} run={timeLeft > 0 || produit.managerUnlocked} frontcolor="#114BAA" auto={produit.managerUnlocked} orientation={Orientation.vertical} />
    </div>
    
  </div>
  <div className="product-details">
    <p className="revenu" dangerouslySetInnerHTML={{__html: transform(produit.revenu*produit.quantite)}}></p>
    <p className="quantite" >{produit.quantite}</p>
    <button className="buttonbuy" onClick={handleBuyProduct} id={"handleBuyProduct" + produit.id.toString()}>
      Acheter {qtmulti}
    </button>
    <p className="cout" dangerouslySetInnerHTML={{__html: transform(produit.cout)}}></p>
  </div>
  <p className="time-left">Time left: {timeLeft}</p>
</div>


   
  );
}

export default ProductComponent;
