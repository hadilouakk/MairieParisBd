import {Router} from "express"
import { isValidObjectId } from "mongoose";
import {balade} from "./model.js";



const router =Router (); 
//Premiere requete
router.get("/all", async function(req,rep){
    const reponse = await balade.find({});
    rep.json(reponse)
})
//Deuxieme requete
router.get("/id/:id", async function(req, rep){
    const id = req.params.id;

   
    const verif = isValidObjectId(id)

    if(!verif){
        return rep.status(400).json({msg: "id invalid"});
    }

    const reponse = await balade.findById({_id: id});

    rep.json(reponse)
})
//troisieme
router.get("/search/:search", async function(req, res) {
    const searchQuery = req.params.search;

    const balades = await balade.find({
        $or: [
            { nom_poi: { $regex: new RegExp(searchQuery, "i") } }, 
            { texte_intro: { $regex: new RegExp(searchQuery, "i") } } 
        ]
    });

    res.json(balades);
});
//quatrieme requete
router.get("/site-internet", async function(req,rep){
    const reponse = await balade.find(
        {
            url_site: {
                $ne: null
            }
    });
    rep.json(reponse)
})
//cinquieme requete
router.get('/mot_cle', async (req, res) => {
    try {
        const result = await balade.find({
            $expr: { $gt: [{ $size: "$mot_cle" }, 5] }
        });

        res.json(result);
    } catch (error) {
        console.error('Erreur lors de la recherche  :', error);
        res.status(500).json({ message: 'Erreur lors de la recherche' });
    }
});
//sixieme requete
router.get ("/publie/:annee", async function(req, rep){

    const year = req.params.annee;

const reponse = await balade.find({
    date_saisie: { $regex: year, $options: 'i' }
}).sort({ date_saisie: 1 })

    rep.json(reponse)
})

//huitieme requete
router.get("/synthese", async function (req, rep) {

    const result = await balade.aggregate([
        {
          $group: {
            _id: "$code_postal",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
    ]);

    rep.json(result);
});
//neuvieme requete 
router.get("/categories", async function(req, res) {
    try {
        const categories = await balade.distinct("categorie");
        res.json(categories);
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
});
//septieme requete 
router.get("/arrondissement/:num_arrondissement", async function (req, rep) {
    const code_postal = req.params.num_arrondissement;

    const count = await balade.countDocuments({ 
        code_postal: code_postal 
    });
    rep.json({ count: count });

});
//dixieme requete 
router.post('/add', async (req, res) => {
    try {
        const { nom_poi, adresse, categorie, code_postal, parcours, url_image, copyright_image, legende, date_saisie, mot_cle, ville, texte_intro, texte_description, url_site, fichier_image, geo_shape, geo_point_2d } = req.body;

        if (!nom_poi || !adresse || !categorie) {
            return res.status(400).json({ error: 'Les champs nom_poi, adresse, et categorie sont obligatoires.' });
        }

        const nouvelleBalade = new balade({
            nom_poi,
            adresse,
            categorie,
            code_postal,
            parcours,
            url_image,
            copyright_image,
            legende,
            date_saisie,
            mot_cle,
            ville,
            texte_intro,
            texte_description,
            url_site,
            fichier_image,
            geo_shape,
            geo_point_2d
        });

        await nouvelleBalade.save();
        res.status(201).json(nouvelleBalade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la nouvelle balade.' });
    }
});
//onzieme requete
router.put('/add-mot-cle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mot_cle } = req.body;

        if (!mot_cle) {
            return res.status(400).json({ error: 'Le mot clé est obligatoire.' });
        }

        const balade = await balade.findById(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        if (balade.mot_cle.includes(mot_cle)) {
            return res.status(400).json({ error: 'Le mot clé existe déjà.' });
        }

        balade.mot_cle.push(mot_cle);
        await balade.save();

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du mot clé.' });
    }
});
//douzieme requete
router.put('/update-one/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const balade = await balade.findByIdAndUpdate(id, miseAJour, { new: true });

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la balade.' });
    }
});
//treisieme requte 
router.put('/update-many/:search', async (req, res) => {
    try {
        const { search } = req.params;
        const { nom_poi } = req.body;

        if (!nom_poi) {
            return res.status(400).json({ error: 'Le nom_poi est obligatoire.' });
        }

        const regex = new RegExp(search, 'i'); // Expression régulière insensible à la casse

        const balades = await balade.updateMany({ texte_description: { $regex: regex } }, { nom_poi });

        if (balades.nModified === 0) {
            return res.status(404).json({ error: 'Aucune balade à mettre à jour.' });
        }

        res.status(200).json({ message: 'Balades mises à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des balades.' });
    }
});
//quatrosieme requete 
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const balade = await balade.findByIdAndDelete(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json({ message: 'Balade supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la balade.' });
    }
});
export default router;