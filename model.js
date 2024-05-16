import { Schema,model } from "mongoose"


const Schemabalade = new Schema({
    identifiant: String,
    adresse: String,
    code_postal: String,
    parcours: [{ type: String }], 
    url_image: String,
    copyright_image: String,
    legende: String,
    categorie: String,
    nom_poi: String,
    date_saisie: String,
    mot_cle: [{ type: String }],
    ville: String,
    texte_intro: String,
    texte_description: String,
    url_site: String,
    fichier_image: { type: Object }, 
    geo_shape: { type: Object }, 
    geo_point_2d: { type: Object } 
});

const balade = model("balades", Schemabalade);


export {balade};