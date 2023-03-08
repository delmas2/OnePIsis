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
            //Si des productions ont été terminées, on
            if (produitactuel.timeleft < time) {
                time -= produitactuel.timeleft
                qte = Math.floor(time / produitactuel.vitesse) + 1;
                produitactuel.timeleft = produitactuel.vitesse - (time % produitactuel.vitesse)
            }
            //Si la production est toujours en ocours, on l'actualise
            else {
                produitactuel.timeleft -= time
                qte = 0
            }
        }
        else {
            if (produitactuel.timeleft < time && produitactuel.timeleft != 0) {
                produitactuel.timeleft = 0
                qte = 1
            }
            else if (produitactuel.timeleft === 0) {
                qte = 0
            }
            else {
                produitactuel.timeleft -= time
                qte = 0
            }
        }
        world.money += (produitactuel.revenu * produitactuel.quantite * (1 + world.activeangels * world.angelbonus / 100)) * qte
        world.score += (produitactuel.revenu * produitactuel.quantite * (1 + world.activeangels * world.angelbonus / 100)) * qte
    })
    world.lastupdate = Date.now().toString();
    saveWorld(context)
}



function appliquerBonus(bonus, context) {
    console.log(1)
    let world = context.world
    if (bonus.unlocked === false) {

        if (bonus.idcible != 0 && bonus.idcible != (-1)) {

            let produit = world.products.find((prod) => prod.id === bonus.idcible)
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


        else if (bonus.idcible === 0) {
            console.log(2)
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

        else if (bonus.idcible === (-1)) {
            angelbonus = angelbonus * bonus.ratio
        }

        bonus.unlocked = true
    }
    else {
        console.log(3)
        throw new Error(`Le bonus: ${bonus.name} est déjà débloqué`)
    }
}






module.exports = {

    Query: {

        getWorld(parent, args, context, info) {
            updateScore(context)
            world.lastupdate = Date.now().toString();
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
                if(produit.timeleft===0){
                produit.timeleft = produit.vitesse}
                updateScore(context)
                world.lastupdate = Date.now().toString();
                saveWorld(context)
                return produit
            }

        }
        ,
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

                context.world.money -= produit.cout * (1-coeff)
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