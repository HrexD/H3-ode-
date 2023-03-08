# Information
nous avons créé un export postman portant le nom "eval universal node.postman_collection.json" à disposition de le repo.
ATTENTION il ne faut pas oublier de créer une variable global comportant le nom "local" et ayant pour valeur local:3000


# SUJET 
# Devoir nodeJS

Vous êtes engagés par une filiale Universal studios pour créer l’API de la plateforme de soumission de maquettes par les artistes.

Le but est d’avoir un site sur lequel des artistes puissent poster leurs création, afin qu’elles soient écoutées par les managers, qui décideront s’ils financeront un album ou non.

## Utilisateurs

Ce site sera consulté par les artistes, les manager, et un compte administrateur

On doit retenir d’un utilisateur sa date d’inscription

### Administrateur

Le compte administrateur est unique et créé par défaut. On peut seulement changer son mot de passe.

L’administrateur a accès à toutes les requêtes mais il ne peut pas uploader de maquettes

L’admin peut supprimer n’importe quel compte.

L’admin a moyen de banir un artiste, ce qui ne le supprime pas mais l’empeche de poster de nouvelles maquettes.

### Artiste

Un artiste peut mettre en ligne une maquette et consulter ses anciennes maquettes, et
Il ne peut pas consulter les maquettes des autres.
Les artistes s’inscrivent eux mêmes via une route /register
Les utilisateurs se connectent via un email, mais chaque artiste peut renseigner un pseudo, qui doit alors être unique.

### Manager

Un manager peut consulter toutes les maquêtes.
Les managers sont ajoutés par l’admin.

Un manager peut laisser une approbation ou une désapprobation sur une maquette. Plusieurs manager peuvent laisser leur approbations ou désapprobation sur une seule maquette.

Une fois que tous les managers ont donné leur avis sur une maquette, elle est validée ou refusé.

## Approbations

Les approbations et désapprobation doivent être agrémentés d’un commentaire.

## Maquettes

On doit pouvoir retrouver, pour chaque maquette, un nom/url de fichier, un titre, l’artiste l’ayant posté.

Chaque approbation de manager doit contenir un flag indiquant si elle est positive ou négative, et un commentaire la justifiant

## Contraintes techniques

L’api doit être faite avec expressjs, en typescript.

La persistance doit être faite via une BDD document telle que MongoDB pour la rapidité de développement

La bdd doit être ajoutée au projet via un docker-compose. (pour corriger c’est plus simple svp)

L’authentification et les permissions doivent être gérée via les JWT.

L’api recevra et enverra du json dans ses requêtes

Les mots de passe doivent être protégés dans la bdd. Ils ne doivent jamais apparaître dans une requête non plus.

Répondre à toutes ces consignes vaut 16/20.

Vous serez notés sur:

- La propreté du code
- La pertinence de l’organisation du code
- La présence des attributs nécessaires sur les entités
- Le respect des règles métier
- L’utilisation d’au moins un middleware custom!
