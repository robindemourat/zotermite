$filename:begin$ $type$ - $creator_1_first_name$ $creator_1_last_name$ ($date$) - $title$ $filename:end$

$title$, par $creators[0].firstName$ $creators[0].lastName$
===================


## Références minimales

$if:title$
### Titre
$title$
$endif:title$
### Sous-titre
### Auteur

$loop:author in creators$
coucou
$author.firstName$ $author.lastName$
$endloop:author in creators$
$if:date$
### Année
$date$
$endif:date$
### Maison d’édition
### Type
$type$
$if:publication_title$
### Publication mère
Vol $volume_number$ n. $issue_number$
$endif:publication_title$
$if:url$
### URL texte complet
$url$
$endif:url$
$if:issn$
### ISSN
$issn$
$endif:issn$
$if:pages$
## Pages
$pages$
$endif:pages$
### Ce qui est lu
$if:abstract$
### Résumé officiel
$abstract$
$endif:abstract$
### Lien zotero
$zotero_url$
## Présentation de l’auteur et du contexte d’énonciation

## Mots-clés

## Résumé et thèse de l’ouvrage

## Plan officiel

## Notes linéaires

## Références et exemples à approfondir

## Notions et concepts à approfondir/définir
