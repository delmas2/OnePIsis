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

            let produit = world.products.find((p) => p.id === idProduit)
            if (produit === undefined) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`)
            }
            else {
                //Si le produit nétait pas déjà en production on la lance et on actualise le monde
                if (produit.timeleft === 0) {
                    produit.timeleft = produit.vitesse
                }
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
                //On paye l'achat et actualise le coût et la quantité du produit
                context.world.money -= produit.cout * (1 - coefficient) / (1 - produit.croissance)
                produit.cout = produit.cout * Math.pow(produit.croissance, ajoutQuantite)
                produit.quantite += ajoutQuantite

                //On sélectionne tous les paliers qui ne sont pas encore débloqués et qui doivent le devenir
                let palliersNonDebloques = produit.palliers.filter(pr => pr.unlocked === false && pr.seuil < produit.quantite)

                //On parcours les palliers filtrés et on les débloque
                palliersNonDebloques.forEach(pa => {
                    appliquerBonus(pa, context)
                    produit.logo=pa.logo
                })

                //On filtre les allunlocks non débloqués
                let allUnlocksNonDebloques = world.allunlocks.filter(unlock => unlock.unlocked === false)
                let minQuantite = produit.quantite

                //On stock dans la variable minQuantite la plus petite quantité parmis tous les produits
                world.products.forEach(prod => {
                    if (minQuantite > prod.quantite) {
                        minQuantite = prod.quantite
                    }
                })
                console.log("min changé pour" + minQuantite + " coucou")

                //Pour chaque allunlock, si le seuil est plus petit que minQuantite, il est débloqué
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
        //Permet d'acheter des upgrades avec de l'argent
        acheterCashUpgrade(parent, args, context) {
            let world = context.world
            let upgradeName = args.name

            let upgrade = world.upgrades.find((u) => u.name === upgradeName)

            if (upgrade === undefined) {
                throw new Error(
                    `L'upgrade de nom: ${args.name} n'existe pas`)
            }
            else {
                //On paye l'upgrade et on applique son bonus
                context.world.money -= upgrade.seuil
                appliquerBonus(upgrade, context)
                updateScore(context)
                world.lastupdate = Date.now().toString()
                saveWorld(context)
                return upgrade
            }
        }
        ,
        //Permet d'acheter des upgrades avec des anges
        acheterAngelUpgrade(parent, args, context) {
            let world = context.world
            let angelUpgradeName = args.name

            let angelUpgrade = world.angelupgrades.find((u) => u.name === angelUpgradeName)

            if (angelUpgrade === undefined) {
                throw new Error(
                    `L'angelUpgrade de nom: ${args.name} n'existe pas`)
            }
            else {
                //On paye l'upgrade et on applique son bonus 
                context.world.activeangels -= angelUpgrade.seuil
                appliquerBonus(angelUpgrade, context)
                updateScore(context)
                world.lastupdate = Date.now().toString()
                saveWorld(context)
                return angelUpgrade
            }
        }
        ,
        //Permet d'engager un manager
        engagerManager(parent, args, context) {
            let world = context.world
            //On récupère le manager et le produit qui lui est associé
            let managerName = args.name
            let manager = context.world.managers.find((m) => m.name === managerName)
            if (manager === undefined) {
                throw new Error(
                    `Le manager de nom: ${args.name} n'existe pas`)
            }
            else {
                let managerProduct = manager.idcible
                let produit = world.products.find((p) => p.id === managerProduct)
                if (produit === undefined) {
                    throw new Error(
                        `Le produit avec l'id ${args.managerProduct} n'existe pas`)
                }
                else {
                    //On paye le manzger et on le débloque au niveau produit et manager
                    context.world.money -= manager.seuil
                    produit.managerUnlocked = true;
                    manager.unlocked = true;
                    updateScore(context)
                    world.lastupdate = Date.now().toString();
                    saveWorld(context)
                    return manager
                }
            }
        }
        ,
        //Permer de réinitialiser le monde et d'ajouter des anges
        resetWorld(parent, args, context) {
            updateScore(context)
            let currentWorld = context.world
            //On stock le score et les anges
            let storeScore = currentWorld.score
            let storeActiveAngels = currentWorld.activeangels
            let storeTotalAngels = currentWorld.totalangels

            let newWorld = world

            //On remet les anges et on calcule le nombre d'anges à ajouter
            newWorld.activeangels = storeActiveAngels
            newWorld.totalangels = storeTotalAngels

            let ajoutAnges = Math.round(150 * Math.sqrt(storeScore / Math.pow(10, 15)) - storeTotalAngels)
            //Si il y a des anges à ajouter, on les ajoute, sinon on ne fait rien
            if (ajoutAnges > 0) {
                newWorld.activeangels += Math.round(150 * Math.sqrt(storeScore / Math.pow(10, 15)) - storeTotalAngels)
                newWorld.totalangels += Math.round(150 * Math.sqrt(storeScore / Math.pow(10, 15)))
            }

            //Le nouveau monde devient le monde actuel
            newWorld.lastupdate = Date.now().toString();
            context.world = newWorld
            saveWorld(context)
            return newWorld
        }


    }
};