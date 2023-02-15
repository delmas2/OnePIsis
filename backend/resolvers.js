const fs = require('fs').promises;

function saveWorld(context) {
    fs.writeFile("userworlds/" + context.user + "-world.json",
        JSON.stringify(context.world), err => {
            if (err) {
                console.error(err)
                throw new Error(
                    `Erreur d'écriture du monde coté serveur`)
            }
        })
}


module.exports = {

    Query: {

        getWorld(parent, args, context, info) {
            saveWorld(context)
            return context.world
        }
    },
    Mutation: {

        lancerProductionProduit(parent,args,context){
            let world = context.world
            let idProduit=args.id

            let produit = world.products.find((p) => p.id === idProduit)

            if(produit === undefined){
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)    
            }
            else{
                produit.timeleft = produit.vitesse
                world.lastudate=Date.now()
                saveWorld(context)
                return produit
            }
                    
        }        
        ,
        acheterQtProduit(parent,args,context){
            let world = context.world
            let idProduit=args.id
            let ajoutQuantite = args.quantite

            let produit = world.products.find((p) => p.id === idProduit)

            let coefficient = Math.pow(produit.croissance,produit.quantite)


            if(produit === undefined){
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)    
            }
            else{
                context.world.money -= produit.cout*((1-coefficient)/(1-produit.croissance))
                produit.cout=produit.cout*Math.pow(produit.croissance,ajoutQuantite)
                produit.quantite += ajoutQuantite
                world.lastudate=Date.now()
                saveWorld(context)
                return produit
            }
        }
        ,
        engagerManager(parent, args, context){
            let world = context.world
            let managerName=args.name
            let manager = context.world.managers.find((m) => m.name === managerName)
            let managerProduct = manager.idcible 
            let produit = world.products.find((p) => p.id === managerProduct)

            context.world.money -= manager.seuil
            produit.managerUnlocked = true;
            manager.unlocked = true;
            world.lastudate=Date.now()
            saveWorld(context)
            return manager
        }


    }


};