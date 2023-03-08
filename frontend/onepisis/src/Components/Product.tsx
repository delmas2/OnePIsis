import { World, Product } from "../world";
import '../styles/Product.css';
import { transform } from "../utils";
import MyProgressbar, { Orientation } from './ProgressBar';
import {useInterval} from './MyInterval';
import { useRef, useState } from "react";


type ProductProps = {
  produit: Product;
  onProductionDone: (product: Product) => void;
};

function ProductComponent({ produit, onProductionDone }: ProductProps) {
  const [timeLeft, setTimeLeft] = useState(produit.timeleft);
  const lastUpdate = useRef(Date.now());


  function calcScore(){
    let ecoule = Date.now() - lastUpdate.current;
    lastUpdate.current = Date.now();
    if(timeLeft==0){}
    if(timeLeft!==0){
       if(ecoule>=timeLeft){
          console.log("production")
          setTimeLeft(0);
          onProductionDone(produit);
       }
    else{
       console.log(timeLeft);
       setTimeLeft(timeLeft - ecoule);
    }
    }

 }

 useInterval(() => calcScore(), 100)


 function startFabrication(){
    setTimeLeft(produit.vitesse);
    lastUpdate.current=Date.now();
    
 }

 return (
    <div className="product-container">
      <p>
        <h3 className="product">{produit.name}</h3>
        <img src={"https://isiscapitalistgraphql.kk.kurasawa.fr/" + produit.logo} height="170" width="100" onClick={startFabrication} />
        <button className="buttonbuy">Acheter </button>
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
