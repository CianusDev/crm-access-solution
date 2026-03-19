[13:00, 18/03/2026] Mr Dongo: //Les  STATUTs au niveau de Avance sur chèque
    // 1 = En attente (RC)
    // 2 = En attente de Validation(ASSC_PME)
    // 3 = En attente d'Approbation (RESPONS DEPART PME)
    // 4 = Suivi du decaissement (Respo backoffice)
    // 5 = En Attente de Décaissement (RC)
    // 6 = Clôturé (RC)
    // 7 = Rejettée
    // 8 = Demande transfere
    // 9 = Demande chez m aka
    // 10= En attente de creation
[13:00, 18/03/2026] Mr Dongo: au niveau de credit
public function statut(){
        return [
            1   => 'GP',//GP OU ACJ
            2   => "CE",//CC OU RC Pour la creation de la demande dans perfect
            3   => "CC",//CC OU RC Pour la creation de la demande dans perfect          
            4   => 'CA',//Affectation A UN AR MAIS ENVOYE AU RC POUR CREATION DANS PERFECT // supprime pour le moment
            5   => 'AR',//NIVEAU AR
            6   => 'SUP_RISQ_ZONE',
            7   => 'CHARGE_COMIT',
            8   => 'RESPO_RGL',
            9   => 'CDCR',
            10  => 'DR',
            11  => 'DGA',
            12  => 'DG',
            13  => 'RC',//lévé des conditions:  Authentification des gages ,Prelèvement du déposit,Récupération de la prime d'assurances,Prél…
[13:03, 18/03/2026] Mr Dongo: ========================> ACCESS CREDIT
* Enregistrement de la demande (GP ou ACJ)
	--> gp-palmeraie@yopmail.com
	--> 17117014212024

->chefequipepalmeraie@yopmail.com
->17187203932024
[13:04, 18/03/2026] Mr Dongo: En attente de création du dossier de crédit (CC ou RC)
	--> conseillerclientele@yopmail.com
	--> 17229628822024
[13:05, 18/03/2026] Mr Dongo: En attente d'affectation de la demande (CA ou CAA)
	--> ca@yopmail.com
	--> 5532360409
[13:07, 18/03/2026] Mr Dongo: * Visite commanditaire (SUP PME)
	--> superviseurpme@yopmail.com
	--> 17368483362025
[13:08, 18/03/2026] Mr Dongo: * En cours d'analyse chez l'Analyste Risque
	--> analysterisquemermoz@yopmail.com
	--> 16789607602023
[13:08, 18/03/2026] Mr Dongo: En attente de la contre-évaluation
	--> supervisseurrisque@yopmail.com
	--> 17122248102024
[13:09, 18/03/2026] Mr Dongo: * En attente du pré-comité
	--> chargecomite@yopmail.com
	--> 17122258352024
[13:17, 18/03/2026] Mr Dongo: * En attente du comité au niveau du Responsable Régional
	--> responsableregionalcocody@yopmail.com
	--> 17122268542024
[13:18, 18/03/2026] Mr Dongo: * En attente du comité au niveau du CDCR
	--> chargedepartementcredit@yopmail.com
	--> 17122269862024
[13:19, 18/03/2026] Mr Dongo: * En attente de validation du Directeur Risque
	--> directeurrisque@yopmail.com
	--> 17122270562024
[13:24, 18/03/2026] Mr Dongo: * En attente de validation du Directeur Général Adjoint
	--> dga@yopmail.com
	--> 17301944922024
[13:30, 18/03/2026] Mr Dongo: * En attente de validation du Directeur Général
	--> dg@yopmail.com
	--> 17301946872024
[13:58, 18/03/2026] Mr Dongo: * Acte notarié
	--> responsablejuridique@yopmail.com
	--> 17122292002024
[14:00, 18/03/2026] Mr Dongo: Charger la visite medicale
--> responsableassurance@yopmail.com
	--> 17122413352024
[14:03, 18/03/2026] Mr Dongo: --> assistantepme@yopmail.com
	--> 16939049192023
[14:07, 18/03/2026] Mr Dongo: * ASuivi et Autorisation de décaissement
	-->responsablefrontoffice@yopmail.com
	-->4655328028
[14:10, 18/03/2026] Mr Dongo: si tu as des incompréhension tu me fais signe
[14:12, 18/03/2026] Mr Dongo: CORA
Gestionnaire de correspondant
jeanlouis@yopmail.com
28031998
[14:22, 18/03/2026] Mr Dongo: N+1 apres la creation du cora
chargecorra@yopmail.com
8405524849
[14:22, 18/03/2026] Mr Dongo: En attente de validation du Directeur Général Adjoint
	--> dga@yopmail.com
	--> 17301944922024
le n+2 c'est DGA
[14:27, 18/03/2026] Mr Dongo: apres le DGA
LES AGENTS BACKOFFICE
-->agentbacke@yopmail.com
-->4377964991

de l'equipe backend
