import {  Product, World } from "../world"; 
import '../styles/Product.css'; 
import { transform } from "../utils"; 
import MyProgressbar, { Orientation } from './ProgressBar'; 
import {useInterval} from './MyInterval'; 
import { useRef, useState } from "react"; 
import { gql, useMutation } from "@apollo/client";


const LANCER_PRODUCTION = gql`
    mutation lancerProductionProduit($id: Int!) {
        lancerProductionProduit(id: $id) {
            id
        }
    }
`;

// Définition du type ProductProps qui représente les propriétés de ProductComponent
type ProductProps = {
  product: Product;
  onProductionDone: (product: Product) => void;
  onProductBuy: (product: Product) => void;
  money: number;
  qtmulti: string;
  username: string;
  loadworld : World
};


// Définition de ProductComponent qui représente un composant React
function ProductComponent({ product, onProductionDone, onProductBuy, money, qtmulti, username }: ProductProps) {
  // Définition de l'état "timeLeft" qui représente le temps restant pour produire le produit
  const [timeLeft, setTimeLeft] = useState(product.timeleft);
  // Définition d'une référence "lastUpdate" qui stocke le temps de la dernière mise à jour
  const lastUpdate = useRef(Date.now());

  // Fonction qui calcule le score de production
  function calcScore() {
    let end = Date.now() - lastUpdate.current;
    lastUpdate.current = Date.now();
    
  if (product.managerUnlocked) {
        setTimeLeft(product.vitesse);
        if (timeLeft === 0) {
            return;
        }
        if (end >= timeLeft) {
            setTimeLeft(0);
            onProductionDone(product);
        } else {
            setTimeLeft(timeLeft - end);
        }
    }else{
    if (timeLeft === 0) {
        return;
    }
    if (end >= timeLeft) {
        setTimeLeft(0);
        onProductionDone(product);
    } else {
        setTimeLeft(timeLeft - end);
    }}
}
 // Utilisation de la fonction "useInterval" pour appeler la fonction "calcScore" toutes les 100 millisecondes
 useInterval(() => calcScore(), 100)


//---------------- LANCER PRODUCTION ---------------------

//--Mutation
 const [lancerProduction] = useMutation(LANCER_PRODUCTION,
  { context: { headers: { "x-user": username }},
  onError: (error): void => {
  // actions en cas d'erreur
  }
  }
 )

 //--Fonction
 function startFabrication() {
  setTimeLeft(product.vitesse);
  lastUpdate.current = Date.now();

  //mutation
  lancerProduction({ variables: { id: product.id } });
}



 return (
  <div className="product-container">
  <div className="barre-image">
    <img
  className="image"
  src={"http://localhost:4000/" + product.logo}
  height="170"
  width="100"
  style={{ opacity: product.quantite <= 0 ? 0.5 : 1, cursor: product.quantite <= 0 ? "not-allowed" : "pointer" }} // Applique un style pour donner l'apparence d'un élément désactivé
  onClick={() => {
    if (product.quantite > 0 ) {
      startFabrication();
    }}}
/>
    <div className="progressbar-container">
      <MyProgressbar className="barstyle" vitesse={product.vitesse} initialvalue={product.vitesse - timeLeft} run={timeLeft > 0 || product.managerUnlocked} frontcolor="#114BAA" auto={product.managerUnlocked} orientation={Orientation.vertical} />
    </div>
    
  </div>
  <div className="product-details">
    <p className="revenu" dangerouslySetInnerHTML={{__html: transform(product.revenu*product.quantite)}}></p>
    <p className="quantite" >{product.quantite}</p>
    <button className="buttonbuy" 
    
    onClick={() => {
    if (money >= product.cout && qtmulti=="x1" ) {
      onProductBuy(product)}
      if (money >= ((Math.pow(product.croissance, 10) - 1) / (product.croissance - 1) * product.cout) && qtmulti=="x10" ) {
        onProductBuy(product)}
        if (money >= ((Math.pow(product.croissance, 100) - 1) / (product.croissance - 1) * product.cout) && qtmulti=="x100" ) {
          onProductBuy(product);
    }}} id={"handleBuyProduct" + product.id.toString()}>
      Acheter {qtmulti}
    </button>
    <p className="cout" dangerouslySetInnerHTML={{__html: transform(product.cout)}}></p>
  </div>
<p className="time-left">Time left: {Math.floor(timeLeft / 1000)} s</p>
</div>


   
  );
}

export default ProductComponent;
