import { useEffect, useState } from "react"
import {World} from "../world"
import '../styles/Main.css';

type MainProps = {
    loadworld: World
    username: string
   }

export default function Main({ loadworld, username } : MainProps) {
    const [world, setWorld] = useState(JSON.parse(JSON.stringify(loadworld)) as World) 

    useEffect(() => {
        setWorld(JSON.parse(JSON.stringify(loadworld)) as World)
       }, [loadworld])

    return (
        <div className="main">
        <img src={"http://localhost:4000" + world.logo} />
        <div className="world">
            Bienvenue dans {world.name}, {username}
           
        </div>
        <span>
        {world.score} Berrys
        </span>   
        </div>
        

        
    );
  }
