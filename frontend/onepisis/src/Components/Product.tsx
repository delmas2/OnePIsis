import { World, Product } from "../world"; // Import de World et Product depuis le fichier "../world"
import '../styles/Product.css'; // Import de la feuille de style "../styles/Product.css"
import { transform } from "../utils"; // Import de la fonction "transform" depuis le fichier "../utils"
import MyProgressbar, { Orientation } from './ProgressBar'; // Import de MyProgressbar et Orientation depuis le fichier "./ProgressBar"
import {useInterval} from './MyInterval'; // Import de la fonction "useInterval" depuis le fichier "./MyInterval"
import { useRef, useState } from "react"; // Import de la fonction "useRef" et "useState" depuis la librairie React

// Définition du type ProductProps qui représente les propriétés de ProductComponent
type ProductProps = {
  produit: Product;
  onProductionDone: (product: Product) => void;
  onProductBuy: (quantity: number, product: Product) => void;
  money: number;
  qtmulti: string;
};

// Définition de ProductComponent qui représente un composant React
function ProductComponent({ produit, onProductionDone, onProductBuy, money, qtmulti }: ProductProps) {
  // Définition de l'état "timeLeft" qui représente le temps restant pour produire le produit
  const [timeLeft, setTimeLeft] = useState(produit.timeleft);
  // Définition d'une référence "lastUpdate" qui stocke le temps de la dernière mise à jour
  const lastUpdate = useRef(Date.now());

  // Fonction qui calcule le score de production
  function calcScore(){
    // Calcul du temps écoulé depuis la dernière mise à jour
    let ecoule = Date.now() - lastUpdate.current;
    // Stockage du temps de la dernière mise à jour
    lastUpdate.current = Date.now();
    // Si le temps restant pour produire le produit est égal à 0, on ne fait rien
    if(timeLeft==0){}
    // Sinon, on met à jour le temps restant et on appelle la fonction "onProductionDone" si le produit est terminé
    if(timeLeft!==0){
       if(ecoule>=timeLeft){
          console.log("production")
          setTimeLeft(0);
          onProductionDone(produit);
       }
       // Sinon, on met à jour le temps restant en soustrayant le temps écoulé depuis la dernière mise à jour
       else{
          console.log(timeLeft);
          setTimeLeft(timeLeft - ecoule);
       }
    }
 }

 // Utilisation de la fonction "useInterval" pour appeler la fonction "calcScore" toutes les 100 millisecondes
 useInterval(() => calcScore(), 100)

 // Fonction qui lance la production du produit
 function startFabrication(){
    setTimeLeft(produit.vitesse);
    lastUpdate.current=Date.now();
 }

 // Fonction qui calcule la quantité maximale de produits achetables
 function MaxBuy(): number {
  const cost = produit.cout;
  const growth = produit.croissance;
  const affordable = money / cost;

  if (growth === 1) {
    return Math.floor(affordable);
  }

  let maxBuyable = 0;
  let currentAffordable = affordable;

  while (currentAffordable > 0) {
    maxBuyable++;
    currentAffordable = currentAffordable * growth - 1;
  }
  return maxBuyable;
 }



/**
 * Fonction qui gère l'achat d'un produit.
 */
function handleBuyProduct() {
  // On calcule le nombre maximum d'achat possible.
  const canBuy = MaxBuy();

  // On récupère l'entier à partir de la chaîne de caractères qtmulti.
  const qtmultInt = parseInt(qtmulti.substring(1));

  // On calcule la quantité à acheter en fonction de la valeur de qtmulti.
  const quantity =
    qtmulti === "Max"
      ? canBuy // Si qtmulti vaut "Max", on achète le maximum possible.
      : canBuy >= qtmultInt
      ? qtmultInt // Si le maximum possible est supérieur ou égal à qtmultInt, on achète qtmultInt.
      : 0; // Sinon, on n'achète rien.

  // Si la quantité à acheter est supérieure à 0, on appelle la fonction onProductBuy avec cette quantité et le produit correspondant.
  if (quantity > 0) {
    onProductBuy(quantity, produit);
  }
}


 return (
    <div className="product-container">
      <p>
        <h3 className="product">{produit.name}</h3>
        <img src={"http://localhost:4000/" + produit.logo} height="170" width="100" onClick={startFabrication} />
        <span dangerouslySetInnerHTML={{__html: transform(produit.revenu*produit.croissance)}}></span>
        <button className="buttonbuy" 
        onClick={handleBuyProduct}
        id={"handleBuyProduct" + produit.id.toString()}>Acheter {qtmulti}
        </button>
        <span dangerouslySetInnerHTML={{__html: transform(produit.cout)}}></span>
      </p>
      <MyProgressbar 
      className="barstyle" 
      vitesse={produit.vitesse} 
      initialvalue={produit.vitesse - timeLeft} 
      run={timeLeft > 0 || produit.managerUnlocked} 
      frontcolor="#114BAA" backcolor="#AAA8A7 " 
      auto={produit.managerUnlocked} 
      orientation={Orientation.horizontal} />
      <p>Time left: {timeLeft}</p>
    </div>
   
  );
}

export default ProductComponent;
