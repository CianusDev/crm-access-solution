
[GET]: backend2.creditaccess.ci/api/credit/tbByProd
result: status 500

[GET] https://backend2.creditaccess.ci/api/cheque/showAsc/:id
- la propriete user est nulls

[POST] https://backend-dev.creditaccess.ci/api/cheque/updateAsc/2566
- body
{"montantAccorde":500000,"numDemandeAsc":""}
- montant non modifier

[DemandSection] ficheHeader =
[DemandSection] ficheHeader = 
Object { refDemande: "1772115119C0503512", dateDemande: "2026-02-26T14:11:59.000000Z", dateEffet: null, dateRetrait: null, dateDecaissementEffective: null, montantSollicite: 15000000, montantEcheSouhaite: "1200000", objetCredit: "3", checkliste: null, derogation: 0, … }
​
acteNotarie: 0
​
actifCirculantStock: Array []
​
activites: Array []
​
ar: Object { nom: "ABIZI", prenom: "ASSOUAN ERNEST", code: null }
​
avsFond: null
​
checkliste: null
​
client: Object { id: 589, codeClient: "C0503512", numOrdre: "03512", … }
​
crCaution: Array []
​
dateDecaissementEffective: null
​
dateDemande: "2026-02-26T14:11:59.000000Z"
​
dateEffet: null
​
dateRetrait: null
​
derogation: 0
​
montantEcheSouhaite: "1200000"
​
montantSollicite: 15000000
​
nbreEcheanceSollicite: 12
​
numTransaction: null
​
objetCredit: "3"
​
pause: 0
​
refDemande: "1772115119C0503512"
​
refTirage: null
​
statut: 1
​
tirage: 0
​
typeActivite: Object { id: 3, libelle: "Transport", description: "transport", … }
​
typeCredit: Object { id: 29, code: "033", libelle: "AVANCE SUR FACTURE", … }
​
typeGaranties: Array(6) [ {…}, {…}, {…}, … ]
​
visiteMedicale: 0
​
<prototype>: Object { … }
demande-section.component.ts:46:13



 Oui, le payload que tu montres est conforme au legacy
  pour [POST] /saveStock :

REQ:
   {"activite":113,"article":"Huile","quantite":null,"m
  ontanTotal":25000,"refDemande":"1775126013C0503512"}
  
RES:
SQLSTATE[01000]: Warning: 1265 Data truncated for column 'REF_DEMANDE' at row 1 (SQL: insert into `cr_stocks` (`REF_DEMANDE`, `activite_id`, `ARTICLE`, `QUANTITE`, `MONTANT`, `MONTANT_TOTAL`, `ETAT`, `STATUT`, `updated_at`, `created_at`) values (1775126013C0503512, 113, Huile, 0, 0, 25000, 1, 1, 2026-04-09 09:54:37, 2026-04-09 09:54:37))

  Le problème vient du backend/table cr_stocks : la
  colonne REF_DEMANDE n’accepte visiblement pas ce
  format alphanumérique (d’où Data truncated).
  Donc ici, ce n’est pas un écart de mapping frontend
  par rapport au legacy, mais un souci de
  schéma/validation côté API pour cr_stocks.




[DELETE] /api/credit/deleteChargeExploitation/:id

status : 200 ok
mais l'element en question est toujours visible dans la liste


[POST] /credit/saveTresorerie

RES:                                                
  {"message":"SQLSTATE[HY000]: General error: 1364 Field    
  'id' doesn't have a default value (SQL: insert into       
  `cr_tresoreries` (`REF_DEMANDE`, `activite_id`, `LIBELLE`,
   `MONTANT`, `TYPE`, `ETAT`, `STATUT`, `updated_at`,       
  `created_at`) values (1775126013C0503512, 113,            
  Esp\u00e8ces du jour, 500000, 1, 1, 1, 2026-04-09         
  12:22:37, 2026-04-09 12:22:37))"}                         

REQ:                                                 
  {"tresorerie":null,"refDemande":"1775126013C0503512","acti
  vite":113,"type":"1","libelle":"Espèces du                
  jour","montant":"500000"}


[POST] /credit/saveCreanceClient
RES :
{"message":"SQLSTATE[01000]: Warning: 1265 Data truncated for column 'REF_DEMANDE' at row 1 (SQL: insert into `cr_creance_clients` (`REF_DEMANDE`, `activite_id`, `OBJET`, `DUREE`, `MONTANT_INITIAL`, `SOLDE`, `RECOUVR_MAX`, `MONT_ARECEVOIR`, `ETAT`, `STATUT`, `updated_at`, `created_at`) values (1775126013C0503512, 113, Vente de marchandise, 30, 300000, 15000, 10, 1500, 1, 1, 2026-04-09 14:44:17, 2026-04-09 14:44:17


[POST] 	/api/credit/saveAvanceFournisseur
RES :
{"message":"SQLSTATE[01000]: Warning: 1265 Data truncated for column 'REF_DEMANDE' at row 1 (SQL: insert into `cr_avances_fournisseurs` (`REF_DEMANDE`, `activite_id`, `OBJET`, `MONTANT`, `DATE_VERS_AVC`, `DATE_RECEP_MARCH`, `RESTE_A_PAY`, `ETAT`, `STATUT`, `updated_at`, `created_at`) values (1775126013C0503512, 113, Avance pour achat de marchandise, 50000, 2026-04-06, 2026-04-08, 200000, 1, 1, 2026-04-09 14:50:20, 2026-04-09 14:50:20))"}

[POST] /credit/saveDetteFournisseur

RES:
{"message":"SQLSTATE[HY000]: General error: 1364 Field 'id' doesn't have a default value (SQL: insert into `cr_dette_fournisseurs` (`REF_DEMANDE`, `activite_id`, `OBJET`, `MONTANT`, `DATE_PAIE`, `DATE_RECEP_MARCH`, `SOLDE`, `ETAT`, `STATUT`, `updated_at`, `created_at`) values (1775126013C0503512, 113, Fourniture Diallo, 450000, 2026-04-06, 2026-04-08, 200000, 1, 1, 2026-04-09 14:53:50, 2026-04-09 14:53:50))"}

[POST] /api/credit/saveDetteEntreprise

RES :
{
"message": "This action is unauthorized.",
    "exception": "Symfony\\Component\\HttpKernel\\Exception\\AccessDeniedHttpException",
    "file": "/var/www/html/cacrm/backend_dev/vendor/laravel/framework/src/Illuminate/Foundation/Exceptions/Handler.php",
    "line": 395,
}


[POST] /api/credit/saveChargeFamille

RES:
{"message":"SQLSTATE[HY000]: General error: 1364 Field 'id' doesn't have a default value (SQL: insert into `cr_charge_familles` (`REF_DEMANDE`, `TYPE_CHARGE`, `CHARGE_MENS`, `MONTANT`, `COMMENTAIRE`, `ETAT`, `STATUT`, `updated_at`, `created_at`) values (1775126013C0503512, 1, Entretien et r\u00e9paration, 50000, RAS, 1, 1, 2026-04-09 15:14:23, 2026-04-09 15:14:23))"}
