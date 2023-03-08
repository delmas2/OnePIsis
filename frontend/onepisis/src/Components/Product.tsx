import { useState, useEffect, useRef } from 'react';
import { World, Product } from "../world";
import '../styles/Product.css';
import { transform } from "../utils";
import MyProgressbar, { Orientation } from './ProgressBar';
import {useInterval} from './MyInterval';


type ProductProps = {
  product: Product;
};

function ProductComponent({ product }: ProductProps) {
  const [run, setRun] = useState(false);
  const [progress, setProgress] = useState(product.vitesse - product.timeleft);
  const [timeLeft, setTimeLeft] = useState(product.timeleft);
  const lastUpdate = useRef(Date.now());


  function calcScore(){
    let ecoule = Date.now() - lastUpdate.current;
    lastUpdate.current = Date.now();
    if(timeLeft==0){}
    if(timeLeft!==0){
       if(ecoule>=timeLeft){
          console.log("production")
          setTimeLeft(0);
          onProductionDone(product);
       }
    else{
       console.log(timeLeft);
       setTimeLeft(timeLeft - ecoule);
    }
    }

 }

 useInterval(() => calcScore(), 100)


 function startFabrication(){
    setTimeLeft(product.vitesse);
    lastUpdate.current=Date.now();
    
 }


  /*useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (run) {
      intervalId = setInterval(() => {
        const elapsedTime = Date.now() - product.lastupdate;
        const newTimeleft = Math.max(product.timeleft - elapsedTime, 0);
        const newProgress = product.vitesse - newTimeleft;

        if (newTimeleft === 0) {
          clearInterval(intervalId);
          setRun(false);
          setProgress(0);
        } else {
          setProgress(newProgress);
        }

        product.timeleft = newTimeleft;
        product.lastupdate = Date.now();
      }, 10);
    }

    return () => clearInterval(intervalId);
  }, [product, run]);*/

  /*function startFabrication()  {
    console.log('startFabrication called');
    if (!run && product.timeleft === 0) {
      setRun(true);
      product.timeleft = product.vitesse;
      product.lastupdate = Date.now();
      
      console.log('run state updated:', run);
    }
  };*/
  

  return (
    <div className="product-container">
      <p>
        <h3 className="product">{product.name}</h3>
        <img src={"https://isiscapitalistgraphql.kk.kurasawa.fr/" + product.logo} height="170" width="100" onClick={startFabrication} />
        <button className="buttonbuy">Acheter </button>
        <span dangerouslySetInnerHTML={{__html: transform(product.cout)}}></span>
      </p>
      <MyProgressbar className="barstyle" vitesse={product.vitesse} initialvalue={product.vitesse - timeLeft} 
      run={timeLeft > 0 || product.managerUnlocked} frontcolor="#114BAA" backcolor="#AAA8A7 " auto={product.managerUnlocked} orientation={Orientation.horizontal} />
      <p>Time left: {timeLeft}</p>
    </div>
  );
}

export default ProductComponent;
function onProductionDone(product: Product) {
  throw new Error('Function not implemented.');
}

