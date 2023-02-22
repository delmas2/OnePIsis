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

function updateScore(context) {
    let world = context.world
    let produits = context.products
    let time = Date.now() - parseInt(lastupdate)
    for (let i = 0; i < produits.length; i++) {
        let produitactuel = produits[i]
        let qte=0
        if (produitactuel.managerUnlocked === true) {
            if (produitactuel.timeleft < time) {
                time -= produitactuel.timeleft
                qte = Math.floor(time / produitactuel.vitesse) + 1;
                produitactuel.timeleft = produitactuel.vitesse-(time % produitactuel.vitesse)
            }
            else{
                produitactuel.timeleft -= time
                qte = 0
            }   
        }
        else {
            if (produitactuel.timeleft < time && produitactuel.timeleft != 0) {
                produitactuel.timeleft = 0
                qte = 1
            }
            else {
                produitactuel.timeleft -= time
                qte = 0
            }
        }
        world.money += (produitactuel.revenu * produitactuel.quantite) * qte
        world.score += (produitactuel.revenu * produitactuel.quantite) * qte
    }
    world.lastudate = Date.now().toString();
    saveWorld(context)
}

function appliquerBonus(p,context) {
    let world = context.world
    let produit = world.products.find((prod) => prod.id === p.idcible)

    if(p.typeratio === "vitesse"){
        produit.vitesse = produit.vitesse/p.ratio
    }
    else if(p.typeratio === "gain"){
        produit.revenu = produit.revenu*produit.ratio
    }
    p.unlocked=true
    }





module.exports = {

    Query: {

        getWorld(parent, args, context, info) {
            saveWorld(context)
            return context.world
        }
    },

    Mutation: {

        lancerProductionProduit(parent, args, context) {
            let world = context.world
            let idProduit = args.id

            let produit = world.products.find((p) => p.id === idProduit)

            if (produit === undefined) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)
            }
            else {
                produit.timeleft = produit.vitesse
                world.lastudate = Date.now().toString();
                saveWorld(context)
                return produit
            }

        }
        ,
        acheterQtProduit(parent, args, context) {
            let world = context.world
            let idProduit = args.id
            let ajoutQuantite = args.quantite

            let produit = world.products.find((p) => p.id === idProduit)

            let coefficient = Math.pow(produit.croissance, produit.quantite)


            if (produit === undefined) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)
            }
            else {
                context.world.money -= produit.cout * ((1 - coefficient) / (1 - produit.croissance))
                produit.cout = produit.cout * Math.pow(produit.croissance, ajoutQuantite)
                produit.quantite += ajoutQuantite
                //parcourir boucle for avec tous les palliers mais vérifier seulement ceux unlocked = false
                //si seuil<produit.quantité alors appliquer ratio à typeratio + passer unlocked à true pour exclure de la boucle
                let palliersDebloquees = produit.palliers.filter(p => p.unlocked===false && p.seuil<produit.quantite)
                
                palliersDebloquees.forEach(p => {
                    appliquerBonus(p,context)
                })
                world.lastudate = Date.now().toString()
                saveWorld(context)
                return produit
            }
        }
        ,
        engagerManager(parent, args, context) {
            let world = context.world
            let managerName = args.name
            let manager = context.world.managers.find((m) => m.name === managerName)
            let managerProduct = manager.idcible
            let produit = world.products.find((p) => p.id === managerProduct)

            context.world.money -= manager.seuil
            produit.managerUnlocked = true;
            manager.unlocked = true;
            world.lastudate = Date.now().toString();
            saveWorld(context)
            return manager
        }


    }


};