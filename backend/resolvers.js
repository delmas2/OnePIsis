const { angelbonus } = require('./world');

let world = require('./world');

const fs = require('fs').promises;

function saveWorld(context) {
    fs.writeFile("../userworlds/" + context.user + "-world.json",
        JSON.stringify(context.world), err => {
            if (err) {
                console.error(err)
                throw new Error(
                    `Erreur d'écriture du monde coté serveur`)
            }
        })
}

//Vérifie l'avancement des productions et gère le gain dans le cas d'un produit fini selon le temps écoulé
function updateScore(context) {
    let world = context.world
    let produits = world.products
    let time = Date.now() - parseInt(world.lastupdate)
    let qte = 0

    produits.forEach(produitactuel => {

        //Si le manager est débloqué
        if (produitactuel.managerUnlocked === true) {
            //Si des productions ont été terminées, on récupère la quantité produite
            if (produitactuel.timeleft < time) {
                time -= produitactuel.timeleft
                qte = Math.floor(time / produitactuel.vitesse) + 1;
                produitactuel.timeleft = produitactuel.vitesse - (time % produitactuel.vitesse)
            }
            //Si le produit est encore en production, on l'actualise
            else {
                produitactuel.timeleft -= time
                qte = 0
            }
        }

        //Si le manager n'est pas débloqué
        else {
            //Si le produit à fini sa production, on en a produit 1
            if (produitactuel.timeleft < time && produitactuel.timeleft != 0) {
                produitactuel.timeleft = 0
                qte = 1
            }
            //Si le produit n'était pas en production on ne fait rien
            else if (produitactuel.timeleft === 0) {
                qte = 0
            }
            //Si le produit est encore en production, on l'actualise
            else {
                produitactuel.timeleft -= time
                qte = 0
            }
        }
        //On récupère les gains en fonction de la quantité de produits ayant fini leur production
        world.money += (produitactuel.revenu * produitactuel.quantite * (1 + world.activeangels * world.angelbonus / 100)) * qte
        world.score += (produitactuel.revenu * produitactuel.quantite * (1 + world.activeangels * world.angelbonus / 100)) * qte
    })
    world.lastupdate = Date.now().toString();
    saveWorld(context)
}


//Applique les bonus des cashupgrades,unlocks,angelupgrades et allunlocks
function appliquerBonus(bonus, context) {
    let world = context.world
    //Vérification que le bonus n'est pas déjà débloqué en cas d'érreur de vérification dans la couche supérieure
    if (bonus.unlocked === false) {

        //Si le bonus s'applique à 1 produit en particulier :
        if (bonus.idcible != 0 && bonus.idcible != (-1)) {

            //On récupère le produit en question et on lui applique le bonus selon son typeratio
            let produit = world.products.find((prod) => prod.id === bonus.idcible)
            //Si le produit est introuvable, on affiche une erreur
            if (produit === undefined) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)
            }
            else {
                if (bonus.typeratio === "vitesse") {
                    produit.vitesse = Math.round(produit.vitesse / bonus.ratio)
                }
                else if (bonus.typeratio === "gain") {
                    produit.revenu = produit.revenu * bonus.ratio
                }
            }
        }

        //Si le bonus s'applique à tous les produits on l'applique à tous 1 par 1 selon son typeratio
        else if (bonus.idcible === 0) {
            if (bonus.typeratio === "vitesse") {
                world.products.forEach(prod => {
                    prod.vitesse = prod.vitesse / bonus.ratio
                })
            }
            else if (bonus.typeratio === "gain") {
                world.products.forEach(prod => {
                    prod.revenu = prod.revenu * bonus.ratio
                })
            }
        }

        //Si le bonus s'applique aux anges, on modifie le angelbonus en considération
        else if (bonus.idcible === (-1)) {
            angelbonus = angelbonus * bonus.ratio
        }

        //On passe le unlocked à true pour éviter que le bonus se réapplique dan le futur
        bonus.unlocked = true
    }

    //Si le bonus a déjà été débloqué, on renvoie un message d'erreur indiquant cela
    else {
        throw new Error(`Le bonus: ${bonus.name} est déjà débloqué`)
    }
}




module.exports = {

    Query: {
        //Récupération du monde, on actualise le score pour le mettre à jour au chargement
        getWorld(parent, args, context, info) {
            updateScore(context)
            world.lastupdate = Date.now().toString();
            saveWorld(context)
            return context.world
        }
    },

    Mutation: {

        //Lance la prodction d'un produit
        lancerProductionProduit(parent, args, context) {
            let world = context.world
            let idProduit = args.id

            //On récupère le produit en question voulu
            let produit = world.products.find((p) => p.id === idProduit)
            //Si le produit est introuvable, on affiche une erreur
            if (produit === undefined) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)
            }
            else {
                //Si le produit nétait pas déjà en production on la lance et on actualise le monde
                if(produit.timeleft===0){
                produit.timeleft = produit.vitesse}
                updateScore(context)
                world.lastupdate = Date.now().toString();
                saveWorld(context)
                return produit
            }

        }
        ,
        //Permet l'achat d'un ou plusieurs produits
        acheterQtProduit(parent, args, context) {
            let world = context.world
            let idProduit = args.id
            let ajoutQuantite = args.quantite

            let produit = world.products.find((prod) => prod.id === idProduit)

            let coefficient = Math.pow(produit.croissance, produit.quantite)


            if (produit === undefined) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)
            }
            else {

                context.world.money -= produit.cout * (1-coefficient)/(1-produit.croissance)
                produit.cout = produit.cout * Math.pow(produit.croissance, ajoutQuantite)
                produit.quantite += ajoutQuantite

                let palliersNonDebloques = produit.palliers.filter(pr => pr.unlocked === false && pr.seuil < produit.quantite)

                palliersNonDebloques.forEach(pa => {
                    appliquerBonus(pa, context)
                })

                let allUnlocksNonDebloques = world.allunlocks.filter(unlock => unlock.unlocked === false)
                let minQuantite = produit.quantite


                world.products.forEach(prod => {
                    if (minQuantite > prod.quantite) {
                        minQuantite = prod.quantite
                    }})
                    console.log("min changé pour" + minQuantite +" coucou")
                allUnlocksNonDebloques.forEach(unlock => {
                    if (minQuantite > unlock.seuil) {
                        console.log("itération" + minQuantite + unlock.seuil)
                        appliquerBonus(unlock, context)
                    }
                })

            }
            updateScore(context)
            world.lastupdate = Date.now().toString()
            saveWorld(context)
            return produit
        }
        ,
        acheterCashUpgrade(parent, args, context) {
            let world = context.world
            let upgradeName = args.name

            let upgrade = world.upgrades.find((u) => u.name === upgradeName)

            if (upgrade === undefined) {
                throw new Error(
                    `L'upgrade de nom: ${args.name} n'existe pas`)
            }
            else {
                context.world.money -= upgrade.seuil
                appliquerBonus(upgrade, context)
                updateScore(context)
                world.lastupdate = Date.now().toString()
                saveWorld(context)
                return upgrade
            }
        }
        ,
        acheterAngelUpgrade(parent, args, context) {
            let world = context.world
            let angelUpgradeName = args.name

            let angelUpgrade = world.angelupgrades.find((u) => u.name === angelUpgradeName)

            if (angelUpgrade === undefined) {
                throw new Error(
                    `L'angelUpgrade de nom: ${args.name} n'existe pas`)
            }
            else {
                context.world.activeangels -= angelUpgrade.seuil
                appliquerBonus(angelUpgrade, context)
                updateScore(context)
                world.lastupdate = Date.now().toString()
                saveWorld(context)
                return angelUpgrade
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
            updateScore(context)
            world.lastupdate = Date.now().toString();
            saveWorld(context)
            return manager
        }
        ,
        resetWorld(parent, args, context) {
            console.log("coucou")
            updateScore(context)
            let currentWorld = context.world
            let storeScore = currentWorld.score
            let storeActiveAngels = currentWorld.activeangels
            let storeTotalAngels = currentWorld.totalangels

            let newWorld = world


            newWorld.activeangels = storeActiveAngels
            newWorld.totalangels = storeTotalAngels

            let ajoutAnges=Math.round(150 * Math.sqrt(storeScore / Math.pow(10, 15)) - storeTotalAngels)
            if(ajoutAnges>0){
            newWorld.activeangels += Math.round(150 * Math.sqrt(storeScore / Math.pow(10, 15)) - storeTotalAngels)
            newWorld.totalangels += Math.round(150 * Math.sqrt(storeScore / Math.pow(10, 15)))
            }

            newWorld.lastupdate = Date.now().toString();
            context.world = newWorld
            saveWorld(context)
            return newWorld
        }


    }


};