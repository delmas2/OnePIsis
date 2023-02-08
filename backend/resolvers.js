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

            if(produit === undefined){
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)    
            }
            else{
                produit.quantite += ajoutQuantite
                world.lastudate=Date.now()
                saveWorld(context)
                return produit
            }

        }
        ,
        


    }


};