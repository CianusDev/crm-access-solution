// @ts-nocheck
import { Injectable, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import pdfFonts from '../../../../../assets/fonts-creditaccess/Montserrat.js';
import pdfMake from 'pdfmake/build/pdfmake';

// import { ProfilEnum } from 'app/enumeration/profil.enum.js';
// import { LogoBase64 } from 'app/enumeration/logo_base64.enum.js';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
  Montserrat: {
    normal: 'Montserrat-Light.ttf',
    bold: 'Montserrat-Bold.ttf',
    italics: 'Montserrat-Regular.ttf',
    bolditalics: 'Montserrat-Medium.ttf',
  },
  Assistant: {},
};

@Injectable({ providedIn: 'root' })
export class CreditPDFService {
  listeGarantieBienMobilierFamille: any[] = [];
  listeGarantieBienProfessionnel: any[] = [];
  listeGarantieVehicules: any[] = [];
  listeGarantieImmobilisations: any[] = [];

  private _datePipe = inject(DatePipe);

  // Contrat de PRET CREDIT AUTO POUR PERSONNE MORALE
  conventionCreditAutoPersonneMoralePDF(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
  ) {
    const existenceSignataire = ficheCredit.demande.client.signataires.length != 0 ? true : false;

    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const typePiece = existenceSignataire
      ? ficheCredit.demande.client.signataires[0].codTypePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.signataires[0].codTypePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.signataires[0].codTypePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.signataires[0].codTypePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.signataires[0].codTypePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : ''
      : '';

    const calculTauxInteretParMois =
      ficheCredit.demande.typeCredit.taux / ficheCredit.decision.duree;

    let montantDeposit = (ficheCredit.decision.deposit / 100) * ficheCredit.decision.montantPropose;

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONVENTION DE CREDIT-AUTO PERSONNE MORALE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01,",
            'représentée par ',
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Dénomination ou Raison sociale : ',
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            '\n',
            'Forme juridique : ',
            { text: statutJuridique, bold: true },
            '\n',
            'Immatriculation N° : ',
            { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
            '\n',
            'Compte Contribuable N° : ',
            { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
            '\n',
            'Capital social : ',
            {
              text:
                ficheCredit.demande.client.entreprise.capitalSocial
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA',
              bold: true,
            },
            '\n',
            'Siège social : ',
            {
              text:
                ficheCredit.demande.client.commune.libelle +
                ', ' +
                ficheCredit.demande.client.quartier,
              bold: true,
            },
            '\n',
            'Adresse postale : ',
            { text: ficheCredit.demande.client.adresse, bold: true },
            '\n',
          ],
          style: 'contenuText',
        },

        // SIGNATAIRE
        existenceSignataire
          ? {
              text: [
                'Représentant légal : ',
                {
                  text:
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                ' Qualité',
                { text: ' GERANT\n', bold: true },
                'Né (e) le : ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateNaissance,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: ficheCredit.demande.client.signataires[0].lieuNaiss, bold: true },
                ', de nationalité ',
                {
                  text: ficheCredit.demande.client.signataires[0].nationalite.nationalite,
                  bold: true,
                },
                ' titulaire de ',
                { text: typePiece, bold: true },
                ' numéro ',
                { text: ficheCredit.demande.client.signataires[0].numPiece, bold: true },
                ' établie le ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateDelivrancePiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: ficheCredit.demande.client.signataires[0].lieuDelivrance, bold: true },
                " valable jusqu'au ",
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateExpirationPiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' domicilié à ',
                {
                  text:
                    ficheCredit.demande.client.signataires[0].commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].quartier +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].rue,
                  bold: true,
                },
                ' Contacts: ',
                { text: ficheCredit.demande.client.signataires[0].numTelephone, bold: true },
                '\n\n',
              ],
            }
          : {
              text: ['\n\n'],
            },

        {
          text: [
            'Ci-après désigné : ',
            { text: "« l'emprunteur »\n\n", bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            {
              text:
                'CREDIT ACCESS S.A. ET ' +
                ficheCredit.demande.client.nomPrenom +
                ' CI-APRES ENSEMBLE DESIGNES « LES PARTIES » ET INDIVIDUELLEMENT UNE OU LA « PARTIE »',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nPREAMBULE\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            'Dans le but de dynamiser les activités de ses clients, CREDIT ACCESS a mis en place un produit dénommé CREDIT AUTO.\n\n',
            "Le CREDIT AUTO consiste en un prêt de somme d'argent pour l'achat d'un véhicule neuf, lequel sera mis à la disposition du Client pour les besoins de son activité professionnelle.\n\n",
            "Le Client, intéressé par l'acquisition d'un véhicule neuf s'est rapproché de CREDIT ACCESS, muni d'une facture proforma, en vue de souscrire au CREDIT AUTO.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nIL A ETE ARRETE ET CONVENU CE QUI SUIT :\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : VALEUR DU PRÉAMBULE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le préambule a la même valeur juridique que le présent contrat dont il fait partie intégrante.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : OBJET\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "La présente convention a pour objet de définir les conditions et modalités de la mise en place du crédit-auto ainsi que celles de l'acquisition de la pleine propriété du véhicule objet du crédit.\n\n",
            "L'emprunteur procédera au remboursement échelonné du prêt, conformément à un échéancier au terme duquel la propriété entière du véhicule lui sera acquise.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : CARACTERISTIQUES DU VEHICULE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        ficheCredit.infosCrAuto.map((vehicue) => [
          {
            type: 'circle',
            text: [
              'Marque : ',
              { text: vehicue.marque + ' ; \n', bold: true },
              'Type commercial : ',
              { text: vehicue.typeCommercial + ' ; \n', bold: true },
              'Nombre de places assises : ',
              { text: vehicue.nbrePlace + ' ; \n', bold: true },
              'Puissance fiscale : ',
              { text: vehicue.puissanceFiscale + '.\n\n', bold: true },
            ],
            style: 'contenuText',
          },
        ]),
        {
          text: [
            {
              text: '\n\nARTICLE 4 : CARACTERISTIQUES DU PRÊT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Type de crédit :',
            { text: ' CREDIT-AUTO\n', bold: true },
            'Objet du crédit : ',
            {
              text:
                (ficheCredit.demande.objetCredit == '1'
                  ? 'Fonds de roulement'
                  : ficheCredit.demande.objetCredit == '2'
                    ? 'Investissement'
                    : ficheCredit.demande.objetCredit == '3'
                      ? 'Fonds de roulement et Investissement'
                      : ' ') + '\n',
              bold: true,
            },
            'Montant du crédit (en lettres) : ',
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' F CFA ;\n',
              bold: true,
            },
            "Montant de l'échéance mensuelle : ",
            {
              text:
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' F CFA ;\n',
              bold: true,
            },
            'Durée du crédit : ',
            {
              text:
                ficheCredit.decision.duree.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' Mois;\n',
              bold: true,
            },
            'Montant total des échéances : ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n',
              bold: true,
            },
            // "Taux d'intérêt : ", {text: calculTauxInteretParMois +"% par mois", bold: true},
            "Taux d'intérêt : ",
            { text: '1.5% par mois.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : REALISATION- DEBLOCAGE DES FONDS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le montant du crédit objet des présentes sera inscrit au crédit du compte ordinaire ',
            { text: 'numéro ' + ficheCredit.demande.client.codeClient, bold: true },
            ", ouvert dans les livres de CREDIT ACCESS, au nom de l'Emprunteur.\n\n",
            "Les fonds prêtés seront transférés sur le compte susmentionné afin de servir à l'achat du véhicule désigné.  A cet effet, le Client autorise irrévocablement CREDIT ACCESS à prélever ce montant pour l'acquisition dudit véhicule.\n\n",
            "Toutefois, l'Emprunteur ne pourra exiger le déblocage des fonds qu'après constitution au profit du Prêteur des sûretés et garanties prévues.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : EQUIPEMENT GPS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Le véhicule sera doté d'une balise GPS.\n",
            "Durant toute la durée de la présente convention, le GPS ne pourra, en aucun cas, être retiré ou modifié, sans l'accord préalable de CREDIT ACCESS sous peine de poursuites pénales.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : MISE A DISPOSITION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les parties conviennent que le véhicule sera mis à la disposition de l'Emprunteur après l'accomplissement des formalités administratives et techniques.\n\n",
            'Ce dernier pourra, selon sa disponibilité, récupérer le véhicule au siège de CREDIT ACCESS sis ABIDJAN Cocody Riviera Palmeraie, ou à tout autre lieu après accord de CREDIT ACCESS.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : REMBOURSEMENT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Le remboursement des sommes dues en principal, intérêts et accessoires, s'opèrera conformément au tableau d'amortissement annexé aux présentes.\n\n",
            "L'Emprunteur s'engage à domicilier, dans les livres de CREDIT ACCESS, les revenus générés par ses activités ou tout autre source de revenus.\n\n",
            "Ce remboursement s'effectuera par le débit du compte de l'Emprunteur ouvert dans les livres de CREDIT ACCESS.\n\n",
            "L'Emprunteur s'oblige à ce que son compte susmentionné soit approvisionné à terme pour le remboursement.\n\n",
            'En outre, il autorise irrévocablement CREDIT ACCESS à prélever toute somme quelconque devenue exigible sur tout compte ouvert en son nom dans ses livres.\n',
            "A l'effet de tenir l'Emprunteur informé de l'évolution du remboursement, CREDIT ACCESS lui permettra d'avoir son relevé de compte en agence.\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 9 : PRINCIPE D'UNICITE DES COMPTES OUVERTS A CREDIT ACCESS\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'ensemble des comptes ouverts par le client dans les livres de CREDIT ACCESS tant en son siège social que dans ses agences constituent des éléments d'un compte unique.\n\n",
            "L'Emprunteur a connaissance de ce que la présente convention d'unicité de comptes constitue une condition essentielle à l'octroi des crédits ou facilités par CREDIT ACCESS. En adhérant aux présentes, l'Emprunteur s'engage, en outre, à ne rien faire qui pourrait faire obstacle à la libre disposition par CREDIT ACCESS du solde de ses comptes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Toute somme, en principal, intérêts, frais et accessoire, échue et restée impayée à l'échéance portera intérêts de plein droit, au Taux d'intérêt de 100% l'an.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : REMBOURSEMENT ANTICIPE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'Emprunteur pourra se libérer, par anticipation, de la totalité du capital restant du prêt.\n\n",
            "Le remboursement anticipé donnera lieu au paiement d'une pénalité appliquée sur le capital restant dû conformément au barème général en vigueur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 12 : DE L'EXIGIBILITE ANTICIPEE DE TOUTES SOMMES RESTANT DUES\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les Parties conviennent expressément qu'en cas de violation d'une quelconque obligation née du contrat de Prêt, le montant du Prêt restant à recouvrer ainsi que tous frais accessoires seront rendus exigibles.\n\n",
            "Le Prêteur pourra prononcer l'exigibilité immédiate du capital décaissé, des intérêts et de tous accessoires en cas de :",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Déconfiture, faillite ou liquidation des biens, règlement judiciaire ou cessation de paiement de l'Emprunteur, avant le remboursement intégral du crédit susmentionné ;",
            "Non-paiement à son échéance, d'une somme due au titre du crédit ;",
            "Inexécution ou de violation de l'un quelconque des engagements pris par l'Emprunteur dans le présent acte, de non-constitution des garanties prévues, ou de déclarations inexactes ;",
            "Aliénation d'une fraction importante de l'actif ou des biens données en garantie de l'Emprunteur en dehors des opérations commerciales courantes ;",
            "Non approvisionnement du compte de domiciliation prévu à l'article 5, ou solde inférieur dudit compte à ce qui est convenu ;",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            "Si l'une de ces hypothèses se réalisait, le Prêteur pourrait exiger le paiement de toutes les sommes à lui dues et ce, Huit (08) jours après une mise en demeure adressée par simple lettre et demeurée infructueuse. Le Prêteur mentionnerait dans cet avis son intention de se prévaloir de la présente clause. Il n'aurait à remplir aucune formalité, ni à faire prononcer en justice la déchéance du terme. Le paiement ou les régularisations postérieures à l'expiration du délai ci-dessus prévu, ne feraient pas obstacle à cette exigibilité.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 13 : CLAUSE DE DEFAUT CROISE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'EMPRUNTEUR accepte que le présent prêt soit lié à toute obligation de sa part concernant d'autres crédits ou emprunts éventuels consentis ou à consentir par CREDIT ACCESS SA, de telle manière qu'une défaillance de sa part dans l'une quelconque de ses obligations au titre des prêts consentis, entraîne automatiquement l'exigibilité des sommes restant dues de l'ensemble des prêts consentis par CREDIT ACCESS SA.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 14 : OBLIGATIONS DES PARTIES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Tant que l'Emprunteur sera débiteur de CREDIT ACCESS, en vertu des présentes, il ne pourra entreprendre aucune transformation en vue d'obtenir la modification des performances du véhicule ou de son utilisation et encore moins céder ou aliéner le véhicule à quelque titre que cela soit.\n\n",
            "Sous peine de résiliation de la convention, l'Emprunteur s'engage, en outre, à :",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Utiliser le véhicule en bon père de famille ;',
            "Procéder aux éventuelles réparations dues à l'utilisation du véhicule ;",
            "Supporter les frais d'entretien, de visite technique, d'assurance du véhicule et tous les frais liés au GPS ;",
            'Informer CREDIT ACCESS, sans délai, en cas de sinistre du véhicule ;',
            "Respecter l'échéancier, jusqu'au remboursement total du capital, des intérêts et des frais ;",
            'Présenter le véhicule à toute réclamation de CREDIT ACCESS ;',
            'Supporter, au terme de la convention, les frais de mutation de propriété du véhicule.',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: ["CREDIT ACCESS s'engage à :"],
          style: 'contenuText',
        },
        {
          ul: [
            "Décaisser le montant du prêt et à payer au concessionnaire le prix d'acquisition du véhicule ;",
            'Mettre le véhicule à la disposition du Client.',
            "Accomplir les formalités administratives avant la remise du véhicule à l'emprunteur",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 15 : EXECUTION DE BONNE FOI ET CHARGE DES FRAIS ANNEXES OU CONNEXES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'Emprunteur s'engage à exécuter de bonne foi ses obligations contenues dans le présent contrat. A cet effet, il prendra toutes mesures utiles afin de régler à bonne date les échéances de Prêt dès leurs dates d'exigibilité, ainsi que tous autres frais annexes ou connexes.\n",
            "Seront à la charge de l'Emprunteur qui s'y oblige expressément aux termes des présentes :\n\n",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Toutes dépenses que CREDIT ACCESS serait amenée à engager du fait du Prêt contracté par le Client et tendant soit à sa régularisation, soit à son recouvrement ;',
            'Tous impôts, taxes ou charges quelconques en cours ou à venir afférents au Prêt.',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            "Par ailleurs, CREDIT ACCESS se réserve le droit d'initier toute action en justice s'il y a lieu au terme des procédures amiables restées infructueuses.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 16 : DROITS SUR L'INDEMNITE D'ASSURANCE\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "En vertu, de l'article 43 du code CIMA, les parties consentent à accorder à CREDIT ACCESS un droit sur les éventuelles indemnités d'assurance qui seront dues en réparation de tout sinistre touchant au véhicule objet de la présente convention. Le Client consent à affecter les indemnités qui lui seront dues par suite d'assurance. Ainsi, ces indemnités seront attribuées à CREDIT ACCESS, sans qu'il y ait besoin de délégation expresse.\n\n",
            "L'assureur sera informé du droit de CREDIT ACCESS sur les indemnités d'assurance dues, par courrier avec accusé de réception ou tout moyen laissant trace écrite, par la partie la plus diligente.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE  17 : GARANTIE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '17.1	Dépôt de garantie :\n\n',
              style: 'titre',
            },
          ],
          margin: [10, 0, 0, 0],
          style: 'contenuText',
        },
        {
          text: [
            "A la sûreté et garantie du présent crédit, en principal, intérêts, frais et accessoires l'Emprunteur consent à faire affecter au profit de CREDIT ACCESS SA :\n\n",
            "Un dépôt de garantie dont le montant s'élève à ",
            { text: this.convertirEnLettres(montantDeposit), bold: true },
            ' (',
            { text: montantDeposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), bold: true },
            ') Francs CFA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\n17.2	Reserve de propriété:\n\n',
              style: 'titre',
            },
          ],
          margin: [10, 0, 0, 0],
          style: 'contenuText',
        },
        {
          text: [
            "En vertu des articles 72 et suivants de l'Acte Uniforme sur les Suretés, les parties conviennent expressément de subordonner le transfert de la propriété exclusive du véhicule à l'Emprunteur, après complet remboursement du prêt, comprenant le capital, les intérêts, les frais et autres accessoires grevant éventuellement la créance.\n\n",
            "A cet effet, les Parties conviennent de procéder de bonne foi à toutes les formalités juridiques et administratives nécessaires à la mutation de propriété du véhicule et la levée du gage l'affectant.\n\n",
            "A défaut du remboursement comme convenu à l'article 8, CREDIT ACCESS SA sera en droit de procéder au retrait du véhicule après une sommation de délivrer adressée à l'Emprunteur.\n\n",
            "En cas de restitution du véhicule, l'Emprunteur sera invité par simple lettre ou par tout moyen laissant trace écrite à une expertise qui s'effectuera dans un délai de quinze (15) jours à compter de la réception de l'invitation.\n\n",
            "Les parties conviennent que la remise du véhicule ne vaut remboursement qu'à condition que la valeur vénale du véhicule déterminée par l'Expert couvre le solde des sommes dues à CREDIT ACCESS SA.  A défaut, CREDIT ACCESS se réserve le droit de poursuivre le recouvrement du reliquat.\n\n",
            "Les parties conviennent qu'en cas de non-restitution volontaire du véhicule, CREDIT ACCESS se réserve le droit d'immobiliser ledit véhicule par le canal du GPS et/ou le récupérer par tout moyen de droit puis procéder à sa vente dans les conditions ci-dessus indiquées.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 18 : RESILIATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "La présente convention sera résiliée de plein droit en cas de manquement des parties à leurs obligations contractuelles. Le manquement par le Client d'une échéance ou le non-respect des délais de paiement peut entrainer la résiliation de la convention.\n\n",
            "La partie qui prend l'initiative de la résiliation pourra résilier de plein droit la convention quinze (15) jours après la mise en demeure infructueuse. La partie défaillante sera informée de la résiliation par courrier avec accusé de réception ou par tout moyen laissant trace écrite.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 19 : EFFET DE LA RESILIATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "En cas de résiliation avant le terme ou avant le paiement total des sommes ci-dessus détaillées, l'Emprunteur devra remettre, sans délai, le véhicule dont CREDIT ACCESS est encore propriétaire. Cette action se fera soit par la remise des clés aux agents de recouvrement, soit par le stationnement du véhicule au siège de CREDIT ACCESS avec remise des clés dument constatée, soit par l'immobilisation du véhicule par tout moyen et en tout lieu par les agents mandatés par CREDIT ACCESS.\n\n",
            "Auquel cas, les sommes déjà perçues par CREDIT ACCESS ne seront pas répétées. Celles-ci seront considérées comme la rétribution pour l'usage du véhicule qui a été mis à la disposition de l'Emprunteur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 20 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractère personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement de la présente convention, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins de la présente convention.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, la présente convention n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 21 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 22 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes et de leurs suites, les parties déclarent élire domicile à leurs adresses respectives sus indiquées.",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // Contrat de PRET CREDIT AUTO POUR PERSONNE MORALE SOCIETE COOPERATIVE
  conventionCreditAutoPersonneMoraleSocieteCooperativePDF(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
  ) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';

    const calculTauxInteretParMois =
      ficheCredit.demande.typeCredit.taux / ficheCredit.decision.duree;

    let montantDeposit = (ficheCredit.decision.deposit / 100) * ficheCredit.decision.montantPropose;

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONVENTION DE CREDIT-AUTO SOCIETE COOPERATIVE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01, ",
            'représentée par ',
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Dénomination ou Raison sociale : ',
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            '\n',
            'Forme juridique : ',
            { text: statutJuridique, bold: true },
            '\n',
            'Immatriculation N° : ',
            { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
            '\n',
            'Compte Contribuable N° : ',
            { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
            '\n',
            'Capital social : ',
            {
              text:
                ficheCredit.demande.client.entreprise.capitalSocial
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA',
              bold: true,
            },
            '\n',
            'Siège social est à ',
            { text: ficheCredit.demande.client.commune.libelle, bold: true },
            ', ',
            { text: ficheCredit.demande.client.quartier, bold: true },
            ', ',
            { text: ficheCredit.demande.client.villa, bold: true },
            '\n',
            'Adresse postale : ',
            { text: ficheCredit.demande.client.adresse, bold: true },
            '\n',
          ],
          style: 'contenuText',
        },
        {
          type: 'circle',
          ul: ficheCredit.demande.client.signataires.map((signataire) => [
            {
              text: [
                'Représentant légal ',
                { text: signataire.nom + ' ' + signataire.prenom, bold: true },
                ' Qualité ',
                { text: 'PCG / PCA\n', bold: true },
                'Né (e) le ',
                {
                  text: this._datePipe.transform(signataire.dateNaissance, 'dd MMMM yyyy', 'fr'),
                  bold: true,
                },
                ' à ',
                { text: signataire.lieuNaiss, bold: true },
                ', de nationalité ',
                { text: signataire.nationalite.nationalite, bold: true },
                'titulaire de ',
                { text: this.retourneTypePiece(signataire.codTypePiece), bold: true },
                ' numéro ',
                { text: signataire.numPiece, bold: true },
                ' établie le ',
                {
                  text: this._datePipe.transform(
                    signataire.dateDelivrancePiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: signataire.lieuDelivrance, bold: true },
                " valable jusqu'au ",
                {
                  text: this._datePipe.transform(
                    signataire.dateExpirationPiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' domicilié à ',
                { text: signataire.commune.libelle, bold: true },
                ', ',
                { text: signataire.quartier, bold: true },
                ', Contacts: ',
                { text: signataire.numTelephone, bold: true },
                '\n',
                'Agissant en vertu des Statuts et de la délégation de pouvoirs en date du ',
                {
                  text: this._datePipe.transform(signataire.dateStatut, 'dd MMMM yyyy', 'fr'),
                  bold: true,
                },
              ],
            },
          ]),
          style: 'contenuText',
          margin: [0, 10, 0, 0],
        },
        {
          text: [
            '\n\nCi-après désigné : ',
            { text: "« l'emprunteur »\n\n", bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            {
              text:
                'CREDIT ACCESS S.A. ET ' +
                ficheCredit.demande.client.nomPrenom +
                ' CI-APRES ENSEMBLE DESIGNES « LES PARTIES » ET INDIVIDUELLEMENT UNE OU LA « PARTIE »',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nPREAMBULE\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            'Dans le but de dynamiser les activités de ses clients, CREDIT ACCESS a mis en place un produit dénommé CREDIT AUTO.\n\n',
            "Le CREDIT AUTO consiste en un prêt de somme d'argent pour l'achat d'un véhicule neuf, lequel sera mis à la disposition du Client pour les besoins de son activité professionnelle.\n\n",
            "Le Client, intéressé par l'acquisition d'un véhicule neuf s'est rapproché de CREDIT ACCESS, muni d'une facture proforma, en vue de souscrire au CREDIT AUTO.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nIL A ETE ARRETE ET CONVENU CE QUI SUIT :\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : VALEUR DU PRÉAMBULE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le préambule a la même valeur juridique que le présent contrat dont il fait partie intégrante.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : OBJET\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "La présente convention a pour objet de définir les conditions et modalités de la mise en place du crédit-auto ainsi que celles de l'acquisition de la pleine propriété du véhicule objet du crédit.\n\n",
            "L'emprunteur procédera au remboursement échelonné du prêt, conformément à un échéancier au terme duquel la propriété entière du véhicule lui sera acquise.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : CARACTERISTIQUES DU VEHICULE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        ficheCredit.infosCrAuto.map((vehicue) => [
          {
            type: 'circle',
            text: [
              'Marque : ',
              { text: vehicue.marque, bold: true },
              ' ; \n',
              'Type commercial : ',
              { text: vehicue.typeCommercia, bold: true },
              ' ; \n',
              'Nombre de places assises : ',
              { text: vehicue.nbrePlace, bold: true },
              ' ; \n',
              'Puissance fiscale : ',
              { text: vehicue.puissanceFiscale, bold: true },
              ' ; \n',
            ],
            style: 'contenuText',
          },
        ]),
        {
          text: [
            {
              text: '\n\nARTICLE 4 : CARACTERISTIQUES DU PRÊT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Type de crédit :',
            { text: ' CREDIT-AUTO\n', bold: true },
            'Objet du crédit : ',
            {
              text:
                (ficheCredit.demande.objetCredit == '1'
                  ? 'Fonds de roulement'
                  : ficheCredit.demande.objetCredit == '2'
                    ? 'Investissement'
                    : ficheCredit.demande.objetCredit == '3'
                      ? 'Fonds de roulement et Investissement'
                      : ' ') + '\n',
              bold: true,
            },
            'Montant du crédit (en lettres) : ',
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' F CFA ',
              bold: true,
            },
            ';\n',
            "Montant de l'échéance mensuelle : ",
            {
              text:
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' F CFA ',
              bold: true,
            },
            ';\n',
            'Durée du crédit : ',
            {
              text:
                ficheCredit.decision.duree.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' Mois',
              bold: true,
            },
            ';\n',
            'Montant total des échéances : ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA',
              bold: true,
            },
            ';\n',
            // "Taux d'intérêt : ", {text: calculTauxInteretParMois +" % par mois", bold: true},
            "Taux d'intérêt : ",
            { text: '1.5% par mois.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : REALISATION- DEBLOCAGE DES FONDS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le montant du crédit objet des présentes sera inscrit au crédit du compte ordinaire ',
            { text: 'numéro ' + ficheCredit.demande.client.codeClient, bold: true },
            ", ouvert dans les livres de CREDIT ACCESS, au nom de l'Emprunteur.\n\n",
            "Les fonds prêtés seront transférés sur le compte susmentionné afin de servir à l'achat du véhicule désigné.  A cet effet, le Client autorise irrévocablement CREDIT ACCESS à prélever ce montant pour l'acquisition dudit véhicule.\n\n",
            "Toutefois, l'Emprunteur ne pourra exiger le déblocage des fonds qu'après constitution au profit du Prêteur des sûretés et garanties prévues.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : EQUIPEMENT GPS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Le véhicule sera doté d'une balise GPS.\n",
            "Durant toute la durée de la présente convention, le GPS ne pourra, en aucun cas, être retiré ou modifié, sans l'accord préalable de CREDIT ACCESS sous peine de poursuites pénales.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : MISE A DISPOSITION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les parties conviennent que le véhicule sera mis à la disposition de l'Emprunteur après l'accomplissement des formalités administratives et techniques.\n\n",
            'Ce dernier pourra, selon sa disponibilité, récupérer le véhicule au siège de CREDIT ACCESS sis ABIDJAN Cocody Riviera Palmeraie, ou à tout autre lieu après accord de CREDIT ACCESS.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : REMBOURSEMENT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Le remboursement des sommes dues en principal, intérêts et accessoires, s'opèrera conformément au tableau d'amortissement annexé aux présentes.\n\n",
            "L'Emprunteur s'engage à domicilier, dans les livres de CREDIT ACCESS, les revenus générés par ses activités ou tout autre source de revenus.\n\n",
            "Ce remboursement s'effectuera par le débit du compte de l'Emprunteur ouvert dans les livres de CREDIT ACCESS.\n\n",
            "L'Emprunteur s'oblige à ce que son compte susmentionné soit approvisionné à terme pour le remboursement.\n\n",
            'En outre, il autorise irrévocablement CREDIT ACCESS à prélever toute somme quelconque devenue exigible sur tout compte ouvert en son nom dans ses livres.\n',
            "A l'effet de tenir l'Emprunteur informé de l'évolution du remboursement, CREDIT ACCESS lui permettra d'avoir son relevé de compte en agence.\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 9 : PRINCIPE D'UNICITE DES COMPTES OUVERTS A CREDIT ACCESS\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'ensemble des comptes ouverts par le client dans les livres de CREDIT ACCESS tant en son siège social que dans ses agences constituent des éléments d'un compte unique.\n\n",
            "L'Emprunteur a connaissance de ce que la présente convention d'unicité de comptes constitue une condition essentielle à l'octroi des crédits ou facilités par CREDIT ACCESS. En adhérant aux présentes, l'Emprunteur s'engage, en outre, à ne rien faire qui pourrait faire obstacle à la libre disposition par CREDIT ACCESS du solde de ses comptes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Toute somme, en principal, intérêts, frais et accessoire, échue et restée impayée à l'échéance portera intérêts de plein droit, au Taux d'intérêt en vigueur de 0,28% par jour.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : REMBOURSEMENT ANTICIPE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'Emprunteur pourra se libérer, par anticipation, de la totalité du capital restant du prêt.\n\n",
            "Le remboursement anticipé donnera lieu au paiement d'une pénalité appliquée sur le capital restant dû conformément au barème général en vigueur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 12 : DE L'EXIGIBILITE ANTICIPEE DE TOUTES SOMMES RESTANT DUES\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les Parties conviennent expressément qu'en cas de violation d'une quelconque obligation née du contrat de Prêt, le montant du Prêt restant à recouvrer ainsi que tous frais accessoires seront rendus exigibles.\n\n",
            "Le Prêteur pourra prononcer l'exigibilité immédiate du capital décaissé, des intérêts et de tous accessoires en cas de :",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Déconfiture, faillite ou liquidation des biens, règlement judiciaire ou cessation de paiement de l'Emprunteur, avant le remboursement intégral du crédit susmentionné ;",
            "Non-paiement à son échéance, d'une somme due au titre du crédit ;",
            "Inexécution ou de violation de l'un quelconque des engagements pris par l'Emprunteur dans le présent acte, de non-constitution des garanties prévues, ou de déclarations inexactes ;",
            "Aliénation d'une fraction importante de l'actif ou des biens données en garantie de l'Emprunteur en dehors des opérations commerciales courantes ;",
            "Non approvisionnement du compte de domiciliation prévu à l'article 5, ou solde inférieur dudit compte à ce qui est convenu ;",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            "Si l'une de ces hypothèses se réalisait, le Prêteur pourrait exiger le paiement de toutes les sommes à lui dues et ce, Huit (08) jours après une mise en demeure adressée par simple lettre et demeurée infructueuse. Le Prêteur mentionnerait dans cet avis son intention de se prévaloir de la présente clause. Il n'aurait à remplir aucune formalité, ni à faire prononcer en justice la déchéance du terme. Le paiement ou les régularisations postérieures à l'expiration du délai ci-dessus prévu, ne feraient pas obstacle à cette exigibilité.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 13 : CLAUSE DE DEFAUT CROISE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'EMPRUNTEUR accepte que le présent prêt soit lié à toute obligation de sa part concernant d'autres crédits ou emprunts éventuels consentis ou à consentir par CREDIT ACCESS SA, de telle manière qu'une défaillance de sa part dans l'une quelconque de ses obligations au titre des prêts consentis, entraîne automatiquement l'exigibilité des sommes restant dues de l'ensemble des prêts consentis par CREDIT ACCESS SA.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 14 : OBLIGATIONS DES PARTIES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Tant que l'Emprunteur sera débiteur de CREDIT ACCESS, en vertu des présentes, il ne pourra entreprendre aucune transformation en vue d'obtenir la modification des performances du véhicule ou de son utilisation et encore moins céder ou aliéner le véhicule à quelque titre que cela soit.\n\n",
            "Sous peine de résiliation de la convention, l'Emprunteur s'engage, en outre, à :",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Utiliser le véhicule en bon père de famille ;',
            "Procéder aux éventuelles réparations dues à l'utilisation du véhicule ;",
            "Supporter les frais d'entretien, de visite technique, d'assurance du véhicule et tous les frais liés au GPS ;",
            'Informer CREDIT ACCESS, sans délai, en cas de sinistre du véhicule ;',
            "Respecter l'échéancier, jusqu'au remboursement total du capital, des intérêts et des frais ;",
            'Présenter le véhicule à toute réclamation de CREDIT ACCESS ;',
            'Supporter, au terme de la convention, les frais de mutation de propriété du véhicule.',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: ["CREDIT ACCESS s'engage à :"],
          style: 'contenuText',
        },
        {
          ul: [
            "Décaisser le montant du prêt et à payer au concessionnaire le prix d'acquisition du véhicule ;",
            'Mettre le véhicule à la disposition du Client.',
            "Accomplir les formalités administratives avant la remise du véhicule à l'emprunteur.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 15 : EXECUTION DE BONNE FOI ET CHARGE DES FRAIS ANNEXES OU CONNEXES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'Emprunteur s'engage à exécuter de bonne foi ses obligations contenues dans le présent contrat. A cet effet, il prendra toutes mesures utiles afin de régler à bonne date les échéances de Prêt dès leurs dates d'exigibilité, ainsi que tous autres frais annexes ou connexes.\n",
            "Seront à la charge de l'Emprunteur qui s'y oblige expressément aux termes des présentes :\n\n",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Toutes dépenses que CREDIT ACCESS serait amenée à engager du fait du prêt contracté par le Client et tendant soit à sa régularisation, soit à son recouvrement ;',
            'Tous impôts, taxes ou charges quelconques en cours ou à venir afférents au prêt.',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            "Par ailleurs, CREDIT ACCESS se réserve le droit d'initier toute action en justice s'il y a lieu au terme des procédures amiables restées infructueuses.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 16 : DROITS SUR L'INDEMNITE D'ASSURANCE\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "En vertu, de l'article 43 du code CIMA, les parties consentent à accorder à CREDIT ACCESS un droit sur les éventuelles indemnités d'assurance qui seront dues en réparation de tout sinistre touchant au véhicule objet de la présente convention. Le Client consent à affecter les indemnités qui lui seront dues par suite d'assurance. Ainsi, ces indemnités seront attribuées à CREDIT ACCESS, sans qu'il y ait besoin de délégation expresse.\n\n",
            "L'assureur sera informé du droit de CREDIT ACCESS sur les indemnités d'assurance dues, par courrier avec accusé de réception ou tout moyen laissant trace écrite, par la partie la plus diligente.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE  17 : GARANTIE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '17.1	Dépôt de garantie :\n\n',
              style: 'titre',
            },
          ],
          margin: [10, 0, 0, 0],
          style: 'contenuText',
        },
        {
          text: [
            "A la sûreté et garantie du présent crédit, en principal, intérêts, frais et accessoires l'Emprunteur consent à faire affecter au profit de CREDIT ACCESS SA :\n\n",
            "Un dépôt de garantie dont le montant s'élève à ",
            { text: this.convertirEnLettres(montantDeposit), bold: true },
            ' (',
            { text: montantDeposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), bold: true },
            ') Francs CFA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\n17.2	Reserve de propriété:\n\n',
              style: 'titre',
            },
          ],
          margin: [10, 0, 0, 0],
          style: 'contenuText',
        },
        {
          text: [
            "En vertu des articles 72 et suivants de l'Acte Uniforme sur les Suretés, les parties conviennent expressément de subordonner le transfert de la propriété exclusive du véhicule à l'Emprunteur, après complet remboursement du prêt, comprenant le capital, les intérêts, les frais et autres accessoires grevant éventuellement la créance.\n\n",
            "A cet effet, les Parties conviennent de procéder de bonne foi à toutes les formalités juridiques et administratives nécessaires à la mutation de propriété du véhicule et la levée du gage l'affectant.\n\n",
            "A défaut du remboursement comme convenu à l'article 8, CREDIT ACCESS SA sera en droit de procéder au retrait du véhicule après une sommation de délivrer adressée à l'Emprunteur.\n\n",
            "En cas de restitution du véhicule, l'Emprunteur sera invité par simple lettre ou par tout moyen laissant trace écrite à une expertise qui s'effectuera dans un délai de quinze (15) jours à compter de la réception de l'invitation.\n\n",
            "Les parties conviennent que la remise du véhicule ne vaut remboursement qu'à condition que la valeur vénale du véhicule déterminée par l'Expert couvre le solde des sommes dues à CREDIT ACCESS SA.  A défaut, CREDIT ACCESS se réserve le droit de poursuivre le recouvrement du reliquat.\n\n",
            "Les parties conviennent qu'en cas de non-restitution volontaire du véhicule, CREDIT ACCESS se réserve le droit d'immobiliser ledit véhicule par le canal du GPS et/ou le récupérer par tout moyen de droit puis procéder à sa vente dans les conditions ci-dessus indiquées.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 18 : RESILIATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "La présente convention sera résiliée de plein droit en cas de manquement des parties à leurs obligations contractuelles. Le manquement par le Client d'une échéance ou le non-respect des délais de paiement peut entrainer la résiliation de la convention.\n\n",
            "La partie qui prend l'initiative de la résiliation pourra résilier de plein droit la convention quinze (15) jours après la mise en demeure infructueuse. La partie défaillante sera informée de la résiliation par courrier avec accusé de réception ou par tout moyen laissant trace écrite.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 19 : EFFET DE LA RESILIATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "En cas de résiliation avant le terme ou avant le paiement total des sommes ci-dessus détaillées, l'Emprunteur devra remettre, sans délai, le véhicule dont CREDIT ACCESS est encore propriétaire. Cette action se fera soit par la remise des clés aux agents de recouvrement, soit par le stationnement du véhicule au siège de CREDIT ACCESS avec remise des clés dument constatée, soit par l'immobilisation du véhicule par tout moyen et en tout lieu par les agents mandatés par CREDIT ACCESS.\n\n",
            "Auquel cas, les sommes déjà perçues par CREDIT ACCESS ne seront pas répétées. Celles-ci seront considérées comme la rétribution pour l'usage du véhicule qui a été mis à la disposition de l'Emprunteur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 20 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractère personnel et pour les besoins de la présente convention, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement de la présente convention, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins de la présente convention.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, la présente convention n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 21 : REGLEMENT DES DIFFERENDS - DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 22 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes et de leurs suites, les parties déclarent élire domicile à leurs adresses respectives sus indiquées.",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText' },
                        { text: 'ALI BADINI', bold: true },
                      ],
                      alignment: 'right',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 16,
          bold: true,
          alignment: 'center',
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // Contrat de PRET CREDIT AUTO POUR PERSONNE PHYSIQUE
  conventionCreditAutoPersonnePhysiquePDF(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
  ) {
    const typePiece =
      ficheCredit.demande.client.typePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.typePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.typePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.typePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.typePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : '';

    const activiteClient = ficheCredit.demande.activites.find((item) => item.niveauActivite === 1);

    const calculTauxInteretParMois =
      ficheCredit.demande.typeCredit.taux / ficheCredit.decision.duree;

    let montantDeposit = (ficheCredit.decision.deposit / 100) * ficheCredit.decision.montantPropose;

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONVENTION DE CREDIT-AUTO',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01,",
            'représentée par ',
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            '\n',
            // "Nom : " , {text: ficheCredit.demande.client.nom, bold: true}, "\n",
            // "Prénom(s) : " , {text: ficheCredit.demande.client.prenom, bold: true}, "\n",
            'Date et lieu de naissance : ',
            {
              text:
                this._datePipe.transform(
                  ficheCredit.demande.client.dataNaiss,
                  'dd MMMM yyyy',
                  'fr',
                ) +
                ', ' +
                ficheCredit.demande.client.lieuNaiss +
                ' ;\n',
              bold: true,
            },
            'Nationalité : ',
            { text: ficheCredit.demande.client.nationalite.nationalite + ';\n', bold: true },
            "Pièce d'identité : ",
            { text: typePiece, bold: true },
            ', numéro ',
            { text: ficheCredit.demande.client.numPiece + ' ;\n', bold: true },
            'Domicile : ',
            {
              text:
                ficheCredit.demande.client.commune.libelle +
                ', ' +
                ficheCredit.demande.client.quartier +
                ', ' +
                ficheCredit.demande.client.rue +
                ' ;\n',
              bold: true,
            },
            'Profession : ',
            { text: ficheCredit.demande.client.profession + ' ;\n', bold: true },
            'Situation matrimoniale : ',
            {
              text:
                this.retourneSituationMatrimoniale(
                  ficheCredit.demande.client.situationMatri,
                  ficheCredit.demande.client.sexe,
                ) + ' ;\n',
              bold: true,
            },
            'Adresse Postale: ',
            { text: ficheCredit.demande.client.adresse + ';\n', bold: true },
            'Contact : ',
            { text: ficheCredit.demande.client.telPortable + ' ;\n', bold: true },
            'Exerçant son activité commerciale sous la dénomination de : ',
            { text: ficheCredit.demande.client.denomination + ' ;\n', bold: true },
            'Immatriculation N° : ',
            { text: ficheCredit.demande.client.rccm + ';\n', bold: true },
            // "Boite Postale: ", {text: activiteClient.boitePostale +";\n", bold: true},
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Ci-après désigné : ',
            { text: "« l'emprunteur »\n\n", bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            {
              text:
                'CREDIT ACCESS S.A. ET ' +
                ficheCredit.demande.client.nomPrenom +
                ' CI-APRES ENSEMBLE DESIGNES « LES PARTIES » ET INDIVIDUELLEMENT UNE OU LA « PARTIE »',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nPREAMBULE\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            'Dans le but de dynamiser les activités de ses clients, CREDIT ACCESS a mis en place un produit dénommé CREDIT AUTO.\n\n',
            "Le CREDIT AUTO consiste en un prêt de somme d'argent pour l'achat d'un véhicule neuf, lequel sera mis à la disposition du Client pour les besoins de son activité professionnelle.\n\n",
            "Le Client, intéressé par l'acquisition d'un véhicule neuf s'est rapproché de CREDIT ACCESS, muni d'une facture proforma, en vue de souscrire au CREDIT AUTO.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nIL A ETE ARRETE ET CONVENU CE QUI SUIT :\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : VALEUR DU PRÉAMBULE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le préambule a la même valeur juridique que le présent contrat dont il fait partie intégrante.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : OBJET\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "La présente convention a pour objet de définir les conditions et modalités de la mise en place du crédit-auto ainsi que celles de l'acquisition de la pleine propriété du véhicule objet du crédit.\n\n",
            "L'emprunteur procédera au remboursement échelonné du prêt, conformément à un échéancier au terme duquel la propriété entière du véhicule lui sera acquise.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : CARACTERISTIQUES DU VEHICULE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        ficheCredit.infosCrAuto.map((vehicue) => [
          {
            type: 'circle',
            text: [
              { text: 'Marque :', bold: true },
              vehicue.marque + ' ; \n',
              { text: 'Type commercial : ', bold: true },
              vehicue.typeCommercial + ' ; \n',
              { text: 'Nombre de places assises : ', bold: true },
              vehicue.nbrePlace + ' ; \n',
              { text: 'Puissance fiscale : ', bold: true },
              vehicue.puissanceFiscale + '.\n\n',
            ],
            style: 'contenuText',
          },
        ]),
        {
          text: [
            {
              text: '\n\nARTICLE 4 : CARACTERISTIQUES DU PRÊT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Type de crédit :',
            { text: ' CREDIT-AUTO\n', bold: true },
            'Objet du crédit : ',
            {
              text:
                (ficheCredit.demande.objetCredit == '1'
                  ? 'Fonds de roulement'
                  : ficheCredit.demande.objetCredit == '2'
                    ? 'Investissement'
                    : ficheCredit.demande.objetCredit == '3'
                      ? 'Fonds de roulement et Investissement'
                      : ' ') + '\n',
              bold: true,
            },
            'Montant du crédit (en lettres) : ',
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' F CFA ;\n',
              bold: true,
            },
            "Montant de l'échéance mensuelle : ",
            {
              text:
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' F CFA ;\n',
              bold: true,
            },
            'Durée du crédit : ',
            {
              text:
                ficheCredit.decision.duree.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' Mois;\n',
              bold: true,
            },
            'Montant total des échéances : ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n',
              bold: true,
            },
            // "Taux d'intérêt : ", {text: calculTauxInteretParMois +" % par mois", bold: true},
            "Taux d'intérêt : ",
            { text: '1.5% par mois.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : REALISATION- DEBLOCAGE DES FONDS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le montant du crédit objet des présentes sera inscrit au crédit du compte ordinaire ',
            { text: 'numéro ' + ficheCredit.demande.client.codeClient, bold: true },
            ", ouvert dans les livres de CREDIT ACCESS, au nom de l'Emprunteur.\n\n",
            "Les fonds prêtés seront transférés sur le compte susmentionné afin de servir à l'achat du véhicule désigné.  A cet effet, le Client autorise irrévocablement CREDIT ACCESS à prélever ce montant pour l'acquisition dudit véhicule.\n\n",
            "Toutefois, l'Emprunteur ne pourra exiger le déblocage des fonds qu'après constitution au profit du Prêteur des sûretés et garanties prévues.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : EQUIPEMENT GPS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Le véhicule sera doté d'une balise GPS\n\n",
            "Durant toute la durée de la présente convention, le GPS ne pourra, en aucun cas, être retiré ou modifié, sans l'accord préalable de CREDIT ACCESS sous peine de poursuites pénales.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : MISE A DISPOSITION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les parties conviennent que le véhicule sera mis à la disposition de l'Emprunteur après l'accomplissement des formalités administratives et techniques.\n\n",
            'Ce dernier pourra, selon sa disponibilité, récupérer le véhicule au siège de CREDIT ACCESS sis ABIDJAN Cocody Riviera Palmeraie, ou à tout autre lieu après accord de CREDIT ACCESS.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : REMBOURSEMENT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Le remboursement des sommes dues en principal, intérêts et accessoires, s'opèrera conformément au tableau d'amortissement annexé aux présentes.\n\n",
            "L'Emprunteur s'engage à domicilier, dans les livres de CREDIT ACCESS, les revenus générés par ses activités ou tout autre source de revenus.\n\n",
            "Ce remboursement s'effectuera par le débit du compte de l'Emprunteur ouvert dans les livres de CREDIT ACCESS.\n\n",
            "L'Emprunteur s'oblige à ce que son compte susmentionné soit approvisionné à terme pour le remboursement.\n\n",
            'En outre, il autorise irrévocablement CREDIT ACCESS à prélever toute somme quelconque devenue exigible sur tout compte ouvert en son nom dans ses livres.\n',
            "A l'effet de tenir l'Emprunteur informé de l'évolution du remboursement, CREDIT ACCESS lui permettra d'avoir son relevé de compte en agence.\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 9 : PRINCIPE D'UNICITE DES COMPTES OUVERTS A CREDIT ACCESS\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'ensemble des comptes ouverts par le client dans les livres de CREDIT ACCESS tant en son siège social que dans ses agences constituent des éléments d'un compte unique.\n\n",
            "L'Emprunteur a connaissance de ce que la présente convention d'unicité de comptes constitue une condition essentielle à l'octroi des crédits ou facilités par CREDIT ACCESS. En adhérant aux présentes, l'Emprunteur s'engage, en outre, à ne rien faire qui pourrait faire obstacle à la libre disposition par CREDIT ACCESS du solde de ses comptes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Toute somme, en principal, intérêts, frais et accessoire, échue et restée impayée à l'échéance portera intérêts de plein droit, au Taux d'intérêt de 100% l'an.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : REMBOURSEMENT ANTICIPE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'Emprunteur pourra se libérer, par anticipation, de la totalité du capital restant du prêt.\n\n",
            "Le remboursement anticipé donnera lieu au paiement d'une pénalité appliquée sur le capital restant dû conformément au barème général en vigueur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 12 : DE L'EXIGIBILITE ANTICIPEE DE TOUTES SOMMES RESTANT DUES\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les Parties conviennent expressément qu'en cas de violation d'une quelconque obligation née du contrat de Prêt, le montant du Prêt restant à recouvrer ainsi que tous frais accessoires seront rendus exigibles.\n\n",
            "Le Prêteur pourra prononcer l'exigibilité immédiate du capital décaissé, des intérêts et de tous accessoires en cas de :",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Déconfiture, faillite ou liquidation des biens, règlement judiciaire ou cessation de paiement de l'Emprunteur, avant le remboursement intégral du crédit susmentionné ;",
            "Non-paiement à son échéance, d'une somme due au titre du crédit ;",
            "Inexécution ou de violation de l'un quelconque des engagements pris par l'Emprunteur dans le présent acte, de non-constitution des garanties prévues, ou de déclarations inexactes ;",
            "Aliénation d'une fraction importante de l'actif ou des biens données en garantie de l'Emprunteur en dehors des opérations commerciales courantes ;",
            "Non approvisionnement du compte de domiciliation prévu à l'article 5, ou solde inférieur dudit compte à ce qui est convenu ;",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            "Si l'une de ces hypothèses se réalisait, le Prêteur pourrait exiger le paiement de toutes les sommes à lui dues et ce, Huit (08) jours après une mise en demeure adressée par simple lettre et demeurée infructueuse. Le Prêteur mentionnerait dans cet avis son intention de se prévaloir de la présente clause. Il n'aurait à remplir aucune formalité, ni à faire prononcer en justice la déchéance du terme. Le paiement ou les régularisations postérieures à l'expiration du délai ci-dessus prévu, ne feraient pas obstacle à cette exigibilité.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 13 : CLAUSE DE DEFAUT CROISE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'EMPRUNTEUR accepte que le présent prêt soit lié à toute obligation de sa part concernant d'autres crédits ou emprunts éventuels consentis ou à consentir par CREDIT ACCESS SA, de telle manière qu'une défaillance de sa part dans l'une quelconque de ses obligations au titre des prêts consentis, entraîne automatiquement l'exigibilité des sommes restant dues de l'ensemble des prêts consentis par CREDIT ACCESS SA.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 14 : OBLIGATIONS DES PARTIES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Tant que l'Emprunteur sera débiteur de CREDIT ACCESS, en vertu des présentes, il ne pourra entreprendre aucune transformation en vue d'obtenir la modification des performances du véhicule ou de son utilisation et encore moins céder ou aliéner le véhicule à quelque titre que cela soit.\n\n",
            "Sous peine de résiliation de la convention, l'Emprunteur s'engage, en outre, à :",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Utiliser le véhicule en bon père de famille ;',
            "Procéder aux éventuelles réparations dues à l'utilisation du véhicule ;",
            "Supporter les frais d'entretien, de visite, d'assurance du véhicule et tous les frais liés au GPS ;",
            'Informer CREDIT ACCESS, sans délai, en cas de sinistre du véhicule ;',
            "Respecter l'échéancier, jusqu'au remboursement total du capital, des intérêts et des frais ;",
            'Présenter le véhicule à toute réclamation de CREDIT ACCESS ;',
            'Supporter, au terme de la convention, les frais de mutation de propriété du véhicule.',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: ["CREDIT ACCESS s'engage à :"],
          style: 'contenuText',
        },
        {
          ul: [
            "Décaisser le montant du prêt et à payer au concessionnaire le prix d'acquisition du véhicule ;",
            'Mettre le véhicule à la disposition du Client.',
            'Accomplir les formalités administratives et techniques',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 15 : EXECUTION DE BONNE FOI ET CHARGE DES FRAIS ANNEXES OU CONNEXES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "L'Emprunteur s'engage à exécuter de bonne foi ses obligations contenues dans le présent contrat. A cet effet, il prendra toutes mesures utiles afin de régler à bonne date les échéances de Prêt dès leurs dates d'exigibilité, ainsi que tous autres frais annexes ou connexes.\n",
            "Seront à la charge de l'Emprunteur qui s'y oblige expressément aux termes des présentes :\n\n",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Toutes dépenses que CREDIT ACCESS serait amenée à engager du fait du Prêt contracté par le Client et tendant soit à sa régularisation, soit à son recouvrement ;',
            'Tous impôts, taxes ou charges quelconques en cours ou à venir afférents au Prêt.',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 10],
        },
        {
          text: [
            "Par ailleurs, CREDIT ACCESS se réserve le droit d'initier toute action en justice s'il y a lieu au terme des procédures amiables restées infructueuses.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 16 : DROITS SUR L'INDEMNITE D'ASSURANCE\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "En vertu, de l'article 43 du code CIMA, les parties consentent à accorder à CREDIT ACCESS un droit sur les éventuelles indemnités d'assurance qui seront dues en réparation de tout sinistre touchant au véhicule objet de la présente convention. Le Client consent à affecter les indemnités qui lui seront dues par suite d'assurance. Ainsi, ces indemnités seront attribuées à CREDIT ACCESS, sans qu'il y ait besoin de délégation expresse.\n\n",
            "L'assureur sera informé du droit de CREDIT ACCESS sur les indemnités d'assurance dues, par courrier avec accusé de réception ou tout moyen laissant trace écrite, par la partie la plus diligente.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE  17 : GARANTIE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '17.1	Dépôt de garantie :\n\n',
              style: 'titre',
            },
          ],
          margin: [10, 0, 0, 0],
          style: 'contenuText',
        },
        {
          text: [
            "A la sûreté et garantie du présent crédit, en principal, intérêts, frais et accessoires l'Emprunteur consent à faire affecter au profit de CREDIT ACCESS SA :\n\n",
            "Un dépôt de garantie dont le montant s'élève à ",
            { text: this.convertirEnLettres(montantDeposit), bold: true },
            ' (',
            { text: montantDeposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), bold: true },
            ') Francs CFA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\n17.2	Reserve de propriété:\n\n',
              style: 'titre',
            },
          ],
          margin: [10, 0, 0, 0],
          style: 'contenuText',
        },
        {
          text: [
            "En vertu des articles 72 et suivants de l'Acte Uniforme sur les Suretés, les parties conviennent expressément de subordonner le transfert de la propriété exclusive du véhicule à l'Emprunteur, après complet remboursement du prêt, comprenant le capital, les intérêts, les frais et autres accessoires grevant éventuellement la créance.\n\n",
            "A cet effet, les Parties conviennent de procéder de bonne foi à toutes les formalités juridiques et administratives nécessaires à la mutation de propriété du véhicule et la levée du gage l'affectant.\n\n",
            "A défaut du remboursement comme convenu à l'article 8 CREDIT ACCESS SA sera en droit de procéder au retrait du véhicule après une sommation de délivrer adressée à l'Emprunteur.\n\n",
            "En cas de restitution du véhicule, l'Emprunteur sera invité par simple lettre ou par tout moyen laissant trace écrite à une expertise qui s'effectuera dans un délai de quinze (15) jours à compter de la réception de l'invitation.\n\n",
            "Les parties conviennent que la remise du véhicule ne vaut remboursement qu'à condition que la valeur vénale du véhicule déterminée par l'Expert couvre le solde des sommes dues à CREDIT ACCESS SA.  A défaut, CREDIT ACCESS se réserve le droit de poursuivre le recouvrement du reliquat.\n\n",
            "Les parties conviennent qu'en cas de non-restitution volontaire du véhicule, CREDIT ACCESS se réserve le droit d'immobiliser ledit véhicule par le canal du GPS et/ou le récupérer par tout moyen de droit puis procéder à sa vente dans les conditions ci-dessus indiquées.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 18 : RESILIATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "La présente convention sera résiliée de plein droit en cas de manquement des parties à leurs obligations contractuelles. Le manquement par le Client d'une échéance ou le non-respect des délais de paiement peut entrainer la résiliation de la convention.\n\n",
            "La partie qui prend l'initiative de la résiliation pourra résilier de plein droit la convention quinze (15) jours après la mise en demeure infructueuse. La partie défaillante sera informée de la résiliation par courrier avec accusé de réception ou par tout moyen laissant trace écrite.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 19 : EFFET DE LA RESILIATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "En cas de résiliation avant le terme ou avant le paiement total des sommes ci-dessus détaillées, l'Emprunteur devra remettre, sans délai, le véhicule dont CREDIT ACCESS est encore propriétaire. Cette action se fera soit par la remise des clés aux agents de recouvrement, soit par le stationnement du véhicule au siège de CREDIT ACCESS avec remise des clés dument constatée, soit par l'immobilisation du véhicule par tout moyen et en tout lieu par les agents mandatés par CREDIT ACCESS.\n\n",
            "Auquel cas, les sommes déjà perçues par CREDIT ACCESS ne seront pas répétées. Celles-ci seront considérées comme la rétribution pour l'usage du véhicule qui a été mis à la disposition de l'Emprunteur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 20 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de bail, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de bail.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le présent bail n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 21 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable. A défaut de règlement à l'amiable dans un délai de quinze (15) jours, suivant la réception, par l'une des parties de la demande d'un règlement amiable, émanant de l'autre partie, le litige sera soumis au Tribunal de Commerce d'Abidjan.\n\n",
            'Le droit applicable à la présente convention est le droit ivoirien, et les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 22 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes et de leurs suites, les parties déclarent élire domicile à leurs adresses respectives sus indiquées.",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText' },
                        { text: 'ALI BADINI', bold: true },
                      ],
                      alignment: 'right',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  //CONTRAT DE GAGE VEHICULE PERSONNE MORALE
  contratDeGageDeVehiculePersonneMorale(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    typeConstituant: string,
    data: any,
    ficheCredit: any,
  ) {
    const existenceSignataire = ficheCredit.demande.client.signataires.length != 0 ? true : false;

    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const typePiece = existenceSignataire
      ? ficheCredit.demande.client.signataires[0].codTypePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.signataires[0].codTypePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.signataires[0].codTypePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.signataires[0].codTypePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.signataires[0].codTypePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : ''
      : '';
    this.listeGarantieVehicules = data.garanties.filter((item) => item.garantie == 1);

    // this.listeGarantieVehicules = data.garanties.filter(item => item.typeTechnique != null);

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text:
                            data.type == 'Caution'
                              ? 'CONTRAT DE GAGE DE VEHICULE'
                              : 'CONTRAT DE GAGE DE VEHICULE PERSONNE MORALE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01, représentée par ",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },

        data.type == 'Caution'
          ? {
              text: [
                'Nom : ',
                { text: data.proprietaire.nom, bold: true },
                '\n',
                'Prénom(s) : ',
                { text: data.proprietaire.prenom, bold: true },
                '\n',
                'Date et lieu de naissance : ',
                {
                  text:
                    this._datePipe.transform(
                      data.proprietaire.dateNaissance,
                      'dd MMMM yyyy',
                      'fr',
                    ) +
                    ', ' +
                    data.proprietaire.lieuNaissance +
                    ' ;\n',
                  bold: true,
                },
                'Nationalité : ',
                { text: data.proprietaire.nationalite.nationalite + ' ;\n', bold: true },
                "Pièce d'identité : ",
                {
                  text:
                    data.proprietaire.typePiece == 1
                      ? 'CNI'
                      : data.proprietaire.typePiece == 2
                        ? 'PASSEPORT'
                        : data.proprietaire.typePiece == 3
                          ? 'CARTE CONSULAIRE'
                          : data.proprietaire.typePiece == 4
                            ? 'PERMIS DE CONDUIRE'
                            : data.proprietaire.typePiece == 5
                              ? "ATTESTATION D'IDENTITE"
                              : '',
                  bold: true,
                },
                ', numéro ',
                { text: data.proprietaire.numPiece + ' ;\n', bold: true },
                'Domicile : ',
                {
                  text:
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    ' ;\n',
                  bold: true,
                },
                'Profession : ',
                { text: data.proprietaire.profession + ' ;\n', bold: true },
                'Situation matrimoniale : ',
                {
                  text:
                    this.retourneSituationMatrimonialeCaution(
                      data.proprietaire.situationMatri,
                      data.proprietaire.genre,
                    ) + ' ;\n',
                  bold: true,
                },
                'Contact : ',
                { text: data.proprietaire.contact + ' ;\n', bold: true },
              ],
              style: 'contenuText',
            }
          : {
              text: [
                {
                  text: [
                    'Dénomination ou Raison sociale : ',
                    { text: ficheCredit.demande.client.nomPrenom, bold: true },
                    '\n',
                    'Forme juridique : ',
                    { text: statutJuridique, bold: true },
                    '\n',
                    'Immatriculation N° : ',
                    { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
                    '\n',
                    'Compte Contribuable N° : ',
                    { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
                    '\n',
                    'Capital social : ',
                    {
                      text:
                        ficheCredit.demande.client.entreprise.capitalSocial
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA',
                      bold: true,
                    },
                    '\n',
                    'Siège social : ',
                    { text: ficheCredit.demande.client.commune.libelle, bold: true },
                    ', ',
                    { text: ficheCredit.demande.client.quartier, bold: true },
                    ', ',
                    { text: ficheCredit.demande.client.villa, bold: true },
                    '\n',
                    'Adresse postale : ',
                    { text: ficheCredit.demande.client.adresse, bold: true },
                    '\n',
                  ],
                  style: 'contenuText',
                },

                // SIGNATAIRE
                existenceSignataire
                  ? {
                      text: [
                        'Représentant légal : ',
                        {
                          text:
                            ficheCredit.demande.client.signataires[0].nom +
                            ' ' +
                            ficheCredit.demande.client.signataires[0].prenom,
                          bold: true,
                        },
                        ' Qualité',
                        { text: ' GERANT\n', bold: true },
                        'Né (e) le : ',
                        {
                          text: this._datePipe.transform(
                            ficheCredit.demande.client.signataires[0].dateNaissance,
                            'dd MMMM yyyy',
                            'fr',
                          ),
                          bold: true,
                        },
                        ' à ',
                        { text: ficheCredit.demande.client.signataires[0].lieuNaiss, bold: true },
                        ', de nationalité ',
                        {
                          text: ficheCredit.demande.client.signataires[0].nationalite.nationalite,
                          bold: true,
                        },
                        ' titulaire de ',
                        { text: typePiece, bold: true },
                        ' numéro ',
                        { text: ficheCredit.demande.client.signataires[0].numPiece, bold: true },
                        ' établie le ',
                        {
                          text: this._datePipe.transform(
                            ficheCredit.demande.client.signataires[0].dateDelivrancePiece,
                            'dd MMMM yyyy',
                            'fr',
                          ),
                          bold: true,
                        },
                        ' à ',
                        {
                          text: ficheCredit.demande.client.signataires[0].lieuDelivrance,
                          bold: true,
                        },
                        " valable jusqu'au ",
                        {
                          text: this._datePipe.transform(
                            ficheCredit.demande.client.signataires[0].dateExpirationPiece,
                            'dd MMMM yyyy',
                            'fr',
                          ),
                          bold: true,
                        },
                        ' domicilié à ',
                        {
                          text:
                            ficheCredit.demande.client.signataires[0].commune.libelle +
                            ', ' +
                            ficheCredit.demande.client.signataires[0].quartier +
                            ', ' +
                            ficheCredit.demande.client.signataires[0].rue,
                          bold: true,
                        },
                        ' Contacts: ',
                        {
                          text: ficheCredit.demande.client.signataires[0].numTelephone,
                          bold: true,
                        },
                        '\n\n',
                      ],
                    }
                  : '\n\n',
              ],
              style: 'contenuText',
            },

        {
          text: [
            'Ci-après désigné : ',
            { text: '« le Constituant »\n\n', bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            {
              text:
                'CREDIT ACCESS S.A. ET ' +
                (data.type == 'Caution'
                  ? data.proprietaire.nom + ' ' + data.proprietaire.prenom
                  : ficheCredit.demande.client.nomPrenom) +
                ' CI-APRES ENSEMBLE DESIGNES « LES PARTIES » ET INDIVIDUELLEMENT UNE OU LA « PARTIE »',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nIL A ETE CONVENU CE QUI SUIT :\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            'A la sûreté et en garantie du prêt consenti à ',
            { text: ficheCredit.demande.client.nomPrenom },
            ' par ',
            { text: ' CREDIT ACCESS SA ', bold: true },
            "d'un montant en principal de ",
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' FRANCS CFA, ',
              bold: true,
            },
            {
              text:
                '(' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') FRANCS CFA, ',
              bold: true,
            },
            'augmenté des intérêts, frais et accessoires, le constituant affecte EN GAGE DE PREMIER RANG au profit de ',
            { text: 'CREDIT ACCESS SA, ', bold: true },
            'dans les conditions prévues par ',
            {
              text: "l'acte uniforme OHADA portant organisation des sûretés en ses articles 96 et suivants, le véhicule automobile dont la désignation suit : ",
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : DESIGNATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: this.listeGarantieVehicules.map((garantieVehicule) => [
            {
              text: [
                'Un (01) Véhicule de marque ',
                { text: garantieVehicule.marque, bold: true },
                ' de type commercial ',
                { text: garantieVehicule.typeCommercial, bold: true },
                ' et type technique ',
                { text: garantieVehicule.typeTechnique + ',', bold: true },
                ' de couleur ',
                { text: garantieVehicule.couleur + ',', bold: true },
                ' immatriculé ',
                { text: garantieVehicule.immatriculation + ',', bold: true },
                ' disposant de ',
                { text: garantieVehicule.nbrePlace, bold: true },
                ' places assises.',
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Le(s) véhicule(s) affecté(s) est (sont) détenu(s) au domicile du constituant à l'adresse suivante : ",
            {
              text:
                typeConstituant == 'Caution'
                  ? data.proprietaire.ville.libelle +
                    ', ' +
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    '.\n'
                  : ficheCredit.demande.client.signataires[0].commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].quartier +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].rue +
                    '.\n',
              bold: true,
            },
            "Ce(s) véhicule(s) est (sont) susceptible d'être déplacé (s) par ",
            { text: 'le constituant', bold: true },
            ' pour effectuer toute tâche relative à son activité commerciale.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : CREANCE GARANTIE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Sur le véhicule affecté en gage, le ',
            { text: 'constituant', bold: true },
            " consent qu'il soit pris contre lui, toutes les inscriptions utiles pour la sûreté de la somme de ",
            {
              text:
                this.convertirEnLettres(ficheCredit.decision.montantEmprunte) +
                ' (' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') DE FRANCS CFA ',
              bold: true,
            },
            'augmentée de tous les intérêts, frais et accessoires, constituant le montant de son emprunt à ',
            { text: 'CREDIT ACCESS SA.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : DROITS, ACTIONS, PRIVILEGES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: 'AU MOYEN DE CE GAGE,\n', bold: true },
            { text: 'CREDIT ACCESS SA,', bold: true },
            " exercera sur les véhicules ci-dessus désignés tous les droits, actions et privilèges conférés par la loi au créancier gagiste et notamment ceux des articles 99 et suivants de l'Acte Uniforme portant organisation des sûretés jusqu'à concurrence du montant en principal, intérêts et accessoires dus, et ce par priorité et préférence à tous autres créanciers.\n\n",
            'Le présent contrat de gage prend effet à compter de sa signature et restera en vigueur tant que les sommes dues par le Débiteur principal à ',
            { text: 'CREDIT ACCESS SA,', bold: true },
            " en principal intérêts frais et accessoires n'auront pas été intégralement remboursées.\n\n",
            'Cependant, dès lors que les sommes dues par le ',
            { text: 'Débiteur principal,', bold: true },
            ' à ',
            { text: 'CREDIT ACCESS SA,', bold: true },
            " au titre du prêt auront été intégralement remboursées, en principal, intérêts, frais et accessoires, le créancier gagiste s'engage à donner mainlevée du présent gage, aux frais du constituant.\n\n",
            'Le gage continuera de produire ses effets en cas de prorogation de la durée de remboursement du financement octroyé par CREDIT ACCESS, sans que le constituant ne puisse invoquer ces faits comme opérant novation.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 : ENGAGEMENT ET DECLARATION DU CONSTITUANT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: [
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " atteste qu'il est valablement obligé aux termes des présentes et qu'aucune autorisation particulière n'est nécessaire à la validation de son engagement.",
              ],
            },
            {
              text: [
                "Il s'engage aussi longtemps que les sommes dues à ",
                { text: 'CREDIT ACCESS SA,', bold: true },
                " n'auront pas été intégralement remboursées, en principal, intérêts, frais et accessoires, à ne pas constituer d'autres sûretés, ou permettre la prise d'autres gages sur le(s) Véhicule(s), identifié(s) dans le présent contrat et en annexe, dès lors que la constitution de telles sûretés entame les droits de CREDIT ACCESS.",
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " déclare que le(s) Véhicule(s) objet du présent contrat n'est (ne sont) pas affecté(s) à la garantie de remboursement d'un concours financier consenti par un prêteur autre que ",
                { text: 'CREDIT ACCESS SA.', bold: true },
              ],
            },
            {
              text: ['Le ', { text: 'constituant', bold: true }, " s'engage d'autre part : "],
            },
            {
              ul: [
                'à ne pas consentir un nouveau gage sur ledit (lesdits) véhicule(s) sans accord préalable du créancier gagiste,',
                'Défendre les droits du créancier gagiste sur le(s) Véhicule(s) affecté(s) en gage contre toutes les actions et prétentions de toutes personnes physiques et/ou morales.',
              ],
              style: 'contenuText',
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " s'engage à ne pas vendre tout ou partie du véhicule affecté en gage sans l'accord préalable du créancier gagiste.",
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                ' déclare que le(s) Véhicule(s) objet du présent contrat, est (sont) assujetti(s) à une assurance couvrant la responsabilité civile des personnes physiques ayant leur garde ou leur conduite même non autorisée ainsi que la responsabilité civile des passagers dudit véhicule, dont la copie est jointe au présent contrat.',
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " s'engage conformément à l'article 119 de l'acte uniforme portant organisation des sûretés, ",
                { text: 'à mentionner le gage', italics: true, bold: true },
                ' sur le titre administratif portant autorisation de circuler et immatriculation.',
              ],
            },
            {
              text: ['Le ', { text: 'constituant', bold: true }, " s'engage d'autre part : "],
            },
            {
              ul: [
                "Maintenir, compléter et au besoin, renouveler les assurances et procéder, s'il y a lieu au réajustement des valeurs assurées ;",
                "Prévenir le créancier gagiste dans le délai de huit (08) jours de toute modification apportée au contrat d'assurance ;",
                "Payer la ou les primes afférentes à l'assurance visée au point 6 ci-dessus et fournir toutes les justifications au système financier décentralisé, à première demande.",
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : GARANTIE COMPLEMENTAIRE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le présent gage viendra en complément de toutes les autres garanties, de quelque nature que ce soit, qui ont pu ou qui pourraient être données au créancier gagiste, soit par le constituant, soit par tout tiers agissant pour le compte du Débiteur principal.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : PACTE COMMISSOIRE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Conformément aux dispositions de l'article 104 alinéa 3 de l'acte uniforme portant organisation des suretés, les parties conviennent que la propriété exclusive du bien gagé sera attribuée à ",
            { text: 'CREDIT ACCESS SA,', bold: true },
            ' faute de paiement.\n\n',
            "Les parties conviennent qu'en cas de défaut de paiement ou lorsque l'exigibilité de la créance entière a été prononcée conformément au contrat de prêt, le constituant se verra dans l'obligation de remettre le ou les véhicules à CREDIT ACCESS suivant la sommation à lui adressée.\n\n",
            "Le(s) bien(s) qui fera(ont) objet d'attribution conventionnelle est(sont) le(s) suivant(s) :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: this.listeGarantieVehicules.map((garantieVehicule) => [
            {
              text: [
                'Un (01) Véhicule de marque ',
                { text: garantieVehicule.marque, bold: true },
                ' de type commercial ',
                { text: garantieVehicule.typeCommercial, bold: true },
                ' et type technique ',
                { text: garantieVehicule.typeTechnique + ',', bold: true },
                ' de couleur ',
                { text: garantieVehicule.couleur + ',', bold: true },
                ' immatriculé ',
                { text: garantieVehicule.immatriculation + ',', bold: true },
                ' disposant de ',
                { text: garantieVehicule.nbrePlace, bold: true },
                ' places assises.',
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Le (Les) véhicule affecté (s) est (sont) détenu (s) au domicile du constituant à l'adresse suivante : ",
            {
              text:
                typeConstituant == 'Caution'
                  ? data.proprietaire.ville.libelle +
                    ', ' +
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    '.\n'
                  : ficheCredit.demande.client.signataires[0].commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].quartier +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].rue +
                    '.\n',
              bold: true,
            },
            "Les parties conviennent que la mutation de la propriété du (des) véhicule(s) cité (s) au profit de CREDIT ACCESS ne vaut remboursement qu'à condition que la valeur vénale du (des) véhicule(s) cité (s) déterminée par Expert, couvre la totalité des sommes dues à CREDIT ACCESS SA.\n\n",
            'A défaut, CREDIT ACCESS se réserve le droit de poursuivre le recouvrement du reliquat.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : REQUISITION-POUVOIRS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les parties requièrent Monsieur le Greffier en Chef du Tribunal du commerce d'Abidjan, de bien vouloir formaliser les présentes conformément aux stipulations qui y sont contenues, sur le Registre du Commerce et du Crédit Mobilier, conformément aux articles 51 et suivants de l'Acte Uniforme OHADA portant organisation des sûretés.\n\n",
            "Cette inscription conservera le privilège pendant (5) cinq ans à compter de la date de son inscription au Registre du Commerce et du crédit mobilier et devra être renouvelée, si besoin était, à la diligence du constituant, avant l'expiration du délai ci-dessus ;\n\n",
            "Pour prendre inscription sur ledit registre, tous pouvoirs sont donnés au porteur d'une expédition des présentes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : FORMALITES ET FRAIS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Toutes les formalités légales nécessaires à la validité du présent contrat, seront effectuées par le constituant ou toute personne porteuse d'une expédition des présentes.\n",
            "Tous les frais et droits auxquels les présentes donneront lieu et ceux des formalités ou actes qui en seront la suite ou la conséquence seront à la charge du constituant qui s'oblige expressément.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de gage, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de gage.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le contrat de gage n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes, les parties élisent domicile en leurs sièges sociaux respectifs mentionnés en tête des présentes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : DROIT APPLICABLE ET JURIDICTION\n\n',
              style: 'titre',
            },
            "Le présent contrat est régi par le droit ivoirien et ce, y compris l'Acte uniforme sur les sûretés du Traité OHADA.\n",
            "Tout litige qui pourrait naître de l'interprétation et/ou de l'exécution du présent contrat de Gage et qui n'aura pas été préalablement réglé à l'amiable par les parties, sera tranché définitivement par le Tribunal de Commerce d'Abidjan.",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: [
                {
                  text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n\n`,
                  alignment: 'right',
                },
                {
                  text: 'En 4 exemplaires originaux\n',
                  alignment: 'right',
                  fontSize: 8,
                  bold: true,
                  italics: true,
                },
                {
                  text: "Dont (2) deux pour l'enregistrement \n\n\n",
                  alignment: 'right',
                  fontSize: 8,
                  italics: true,
                },
              ],
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [{ text: 'LE CONSTITUANT\n', bold: true }],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    // {
                    //     text: [
                    //         {text: 'Monsieur ', style: 'contenuText'},
                    //         {text: 'ALI BADINI', bold: true},
                    //     ],
                    //     alignment: 'right'
                    // },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  //CONTRAT DE GAGE VEHICULE PERSONNE MORALE SOCIETE COOPERATIVE
  contratDeGageDeVehiculePersonneMoralePourSocieteCooperative(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    typeConstituant: string,
    data: any,
    ficheCredit: any,
  ) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const objetCredit =
      ficheCredit.demande.objetCredit == '1'
        ? 'Fonds de roulement'
        : ficheCredit.demande.objetCredit == '2'
          ? 'Investissement'
          : ficheCredit.demande.objetCredit == '3'
            ? 'Fonds de roulement et Investissement'
            : '';

    this.listeGarantieVehicules = data.garanties.filter((item) => item.garantie == 1);
    // this.listeGarantieVehicules = data.garanties.filter(item => item.typeTechnique != null);

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          // 'CONTRAT DE GAGE DE VEHICULE PERSONNE MORALE / SOCIETE COOPERATIVE'
                          text:
                            data.type == 'Caution'
                              ? 'CONTRAT DE GAGE DE VEHICULE'
                              : 'CONTRAT DE GAGE DE VEHICULE SOCIETE COOPERATIVE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01.\n",
            'Représentée par ',
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            {
              text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS SA »\n\n',
              bold: true,
            },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },

        data.type == 'Caution'
          ? {
              text: [
                'Nom : ',
                { text: data.proprietaire.nom, bold: true },
                '\n',
                'Prénom(s) : ',
                { text: data.proprietaire.prenom, bold: true },
                '\n',
                'Date et lieu de naissance : ',
                {
                  text:
                    this._datePipe.transform(
                      data.proprietaire.dateNaissance,
                      'dd MMMM yyyy',
                      'fr',
                    ) +
                    ', ' +
                    data.proprietaire.lieuNaissance +
                    ' ;\n',
                  bold: true,
                },
                'Nationalité : ',
                { text: data.proprietaire.nationalite.nationalite + ' ;\n', bold: true },
                "Pièce d'identité : ",
                {
                  text:
                    data.proprietaire.typePiece == 1
                      ? 'CNI'
                      : data.proprietaire.typePiece == 2
                        ? 'PASSEPORT'
                        : data.proprietaire.typePiece == 3
                          ? 'CARTE CONSULAIRE'
                          : data.proprietaire.typePiece == 4
                            ? 'PERMIS DE CONDUIRE'
                            : data.proprietaire.typePiece == 5
                              ? "ATTESTATION D'IDENTITE"
                              : '',
                  bold: true,
                },
                ', numéro ',
                { text: data.proprietaire.numPiece + ' ;\n', bold: true },
                'Domicile : ',
                {
                  text:
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    ' ;\n',
                  bold: true,
                },
                'Profession : ',
                { text: data.proprietaire.profession + ' ;\n', bold: true },
                'Situation matrimoniale : ',
                {
                  text:
                    this.retourneSituationMatrimonialeCaution(
                      data.proprietaire.situationMatri,
                      data.proprietaire.genre,
                    ) + ' ;\n',
                  bold: true,
                },
                'Contact : ',
                { text: data.proprietaire.contact + ' ;\n', bold: true },
              ],
              style: 'contenuText',
            }
          : {
              text: [
                'Dénomination ou Raison sociale : ',
                { text: ficheCredit.demande.client.nomPrenom, bold: true },
                '\n',
                'Forme juridique : ',
                { text: statutJuridique, bold: true },
                '\n',
                'Immatriculation N° : ',
                { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
                '\n',
                'Compte Contribuable N° : ',
                { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
                '\n',
                'Capital social : ',
                {
                  text:
                    ficheCredit.demande.client.entreprise.capitalSocial
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA',
                  bold: true,
                },
                '\n',
                'Siège social est à ',
                { text: ficheCredit.demande.client.commune.libelle, bold: true },
                ', ',
                { text: ficheCredit.demande.client.quartier, bold: true },
                ', ',
                { text: ficheCredit.demande.client.villa, bold: true },
                '\n',
                'Adresse postale : ',
                { text: ficheCredit.demande.client.adresse, bold: true },
                '\n',
              ],
              style: 'contenuText',
            },

        data.type == 'Caution'
          ? ''
          : {
              text: [
                'Représentant légal ',
                {
                  text:
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                ' Qualité ',
                { text: 'PCG / PCA\n', bold: true },
                'Né (e) le ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateNaissance,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: ficheCredit.demande.client.signataires[0].lieuNaiss, bold: true },
                ', de nationalité ',
                {
                  text: ficheCredit.demande.client.signataires[0].nationalite.nationalite,
                  bold: true,
                },
                'titulaire de ',
                {
                  text: this.retourneTypePiece(
                    ficheCredit.demande.client.signataires[0].codTypePiece,
                  ),
                  bold: true,
                },
                ' numéro ',
                { text: ficheCredit.demande.client.signataires[0].numPiece, bold: true },
                ' établie le ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateDelivrancePiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: ficheCredit.demande.client.signataires[0].lieuDelivrance, bold: true },
                " valable jusqu'au ",
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateExpirationPiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                '\ndomicilié à ',
                { text: ficheCredit.demande.client.signataires[0].commune.libelle, bold: true },
                ', ',
                { text: ficheCredit.demande.client.signataires[0].quartier, bold: true },
                ', ',
                { text: ficheCredit.demande.client.signataires[0].rue, bold: true },
                ' Contacts: ',
                { text: ficheCredit.demande.client.signataires[0].numTelephone, bold: true },
                '\n',
                'Agissant en vertu des Statuts et de la délégation de pouvoirs en date du ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateStatut,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
              ],
            },

        // data.type == 'Caution' ? '' : {
        //     type: 'circle',
        //     ul: ficheCredit.demande.client.signataires.map(signataire => ([
        //         {
        //             text: [
        //                 "Représentant légal ", {text: signataire.nom + ' ' + signataire.prenom, bold: true}, " Qualité ", {text:  "PCG / PCA\n", bold: true},
        //                 "Né (e) le ", {text: this._datePipe.transform(signataire.dateNaissance, 'dd MMMM yyyy', 'fr'), bold: true}, " à ", {text: signataire.lieuNaiss, bold: true}, ", de nationalité ", {text: signataire.nationalite.nationalite, bold: true}, "titulaire de ", {text: this.retourneTypePiece(signataire.codTypePiece), bold: true}, " numéro ", {text:  signataire.numPiece, bold: true}, " établie le ", {text: this._datePipe.transform(signataire.dateDelivrancePiece, 'dd MMMM yyyy', 'fr'), bold: true}, " à ", {text: signataire.lieuDelivrance, bold: true}, " valable jusqu'au ", {text: this._datePipe.transform(signataire.dateExpirationPiece, 'dd MMMM yyyy', 'fr'), bold: true}, "\ndomicilié à ", {text: signataire.commune.libelle, bold: true}, ', ', {text: signataire.quartier, bold: true}, ', ', {text: signataire.rue, bold: true}, " Contacts: ", {text: signataire.numTelephone, bold: true}, "\n",
        //                 "Agissant en vertu des Statuts et de la délégation de pouvoirs en date du ", {text: this._datePipe.transform(signataire.dateStatut, 'dd MMMM yyyy', 'fr'), bold: true},
        //             ]
        //         },
        //     ])),
        //     style: "contenuText",
        //     margin: [0, 10, 0, 0],
        // },

        {
          text: [
            'Ci-après désigné : ',
            { text: '« le Constituant »\n\n', bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            {
              text:
                'CREDIT ACCESS S.A. ET ' +
                (data.type == 'Caution'
                  ? data.proprietaire.nom + ' ' + data.proprietaire.prenom
                  : ficheCredit.demande.client.nomPrenom) +
                ' CI-APRES ENSEMBLE DESIGNES « LES PARTIES » ET INDIVIDUELLEMENT UNE OU LA « PARTIE »',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nIL A ETE CONVENU CE QUI SUIT :\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            'A la sûreté et en garantie du prêt consenti à ',
            { text: ficheCredit.demande.client.nomPrenom },
            ' par ',
            { text: ' CREDIT ACCESS SA ', bold: true },
            "d'un montant en principal de ",
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' FRANCS CFA, ',
              bold: true,
            },
            {
              text:
                '(' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') FRANCS CFA, ',
              bold: true,
            },
            'augmenté des intérêts, frais et accessoires, le constituant affecte EN GAGE DE PREMIER RANG au profit de ',
            { text: 'CREDIT ACCESS SA, ', bold: true },
            'dans les conditions prévues par ',
            {
              text: "l'acte uniforme OHADA portant organisation des sûretés en ses articles 96 et suivants, le véhicule automobile dont la désignation suit : ",
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : DESIGNATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: this.listeGarantieVehicules.map((garantieVehicule) => [
            {
              text: [
                'Un (01) Véhicule de marque ',
                { text: garantieVehicule.marque, bold: true },
                ' de type commercial ',
                { text: garantieVehicule.typeCommercial, bold: true },
                ' et type technique ',
                { text: garantieVehicule.typeTechnique + ',', bold: true },
                ' de couleur ',
                { text: garantieVehicule.couleur + ',', bold: true },
                ' immatriculé ',
                { text: garantieVehicule.immatriculation + ',', bold: true },
                ' disposant de ',
                { text: garantieVehicule.nbrePlace, bold: true },
                ' places assises.',
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Le(s) véhicule(s) affecté(s) est(sont) détenu(s) au domicile du constituant à l'adresse suivante : ",
            {
              text:
                typeConstituant == 'Caution'
                  ? data.proprietaire.ville.libelle +
                    ', ' +
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    '.\n'
                  : ficheCredit.demande.client.signataires[0].commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].quartier +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].rue +
                    '.\n',
              bold: true,
            },
            "Ce(s) véhicule(s) est(sont) susceptible d'être déplacé(s) par ",
            { text: 'le constituant', bold: true },
            ' pour effectuer toute tâche relative à son activité commerciale.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : CREANCE GARANTIE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Sur le véhicule affecté en gage, le ',
            { text: 'constituant', bold: true },
            " consent qu'il soit pris contre lui, toutes les inscriptions utiles pour la sûreté de la somme de ",
            {
              text:
                this.convertirEnLettres(ficheCredit.decision.montantEmprunte) +
                ' (' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') DE FRANCS CFA ',
              bold: true,
            },
            'augmentée de tous les intérêts, frais et accessoires, constituant le montant de son emprunt à ',
            { text: 'CREDIT ACCESS SA.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : DROITS, ACTIONS, PRIVILEGES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: 'AU MOYEN DE CE GAGE,\n', bold: true },
            { text: 'CREDIT ACCESS SA,', bold: true },
            " exercera sur les véhicules ci-dessus désignés tous les droits, actions et privilèges conférés par la loi au créancier gagiste et notamment ceux des articles 99 et suivants de l'Acte Uniforme portant organisation des sûretés jusqu'à concurrence du montant en principal, intérêts et accessoires dus, et ce par priorité et préférence à tous autres créanciers.\n\n",
            'Le présent contrat de gage prend effet à compter de sa signature et restera en vigueur tant que les sommes dues par le Débiteur principal à ',
            { text: 'CREDIT ACCESS SA,', bold: true },
            " en principal intérêts frais et accessoires n'auront pas été intégralement remboursées.\n\n",
            'Cependant, dès lors que les sommes dues par le ',
            { text: 'Débiteur principal,', bold: true },
            ' à ',
            { text: 'CREDIT ACCESS SA,', bold: true },
            " au titre du prêt auront été intégralement remboursées, en principal, intérêts, frais et accessoires, le créancier gagiste s'engage à donner mainlevée du présent gage, aux frais du constituant.\n\n",
            'Le gage continuera de produire ses effets en cas de prorogation de la durée de remboursement du financement octroyé par CREDIT ACCESS, sans que le constituant ne puisse invoquer ces faits comme opérant novation.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 : ENGAGEMENT ET DECLARATION DU CONSTITUANT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: [
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " atteste qu'il est valablement obligé aux termes des présentes et qu'aucune autorisation particulière n'est nécessaire à la validation de son engagement.",
              ],
            },
            {
              text: [
                "Il s'engage aussi longtemps que les sommes dues à ",
                { text: 'CREDIT ACCESS SA,', bold: true },
                " n'auront pas été intégralement remboursées, en principal, intérêts, frais et accessoires, à ne pas constituer d'autres sûretés, ou permettre la prise d'autres gages sur le(s) Véhicule(s), identifié(s) dans le présent contrat et en annexe, dès lors que la constitution de telles sûretés entame les droits de CREDIT ACCESS.",
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " déclare que le(s) Véhicule(s) objet du présent contrat n'est (ne sont) pas affecté(s) à la garantie de remboursement d'un concours financier consenti par un prêteur autre que ",
                { text: 'CREDIT ACCESS SA.', bold: true },
              ],
            },
            {
              text: ['Le ', { text: 'constituant', bold: true }, " s'engage d'autre part : "],
            },
            {
              ul: [
                'à ne pas consentir un nouveau gage sur ledit (lesdits) véhicule(s) sans accord préalable du créancier gagiste,',
                'Défendre les droits du créancier gagiste sur le(s) Véhicule(s) affecté(s) en gage contre toutes les actions et prétentions de toutes personnes physiques et/ou morales.',
              ],
              style: 'contenuText',
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " s'engage à ne pas vendre tout ou partie du véhicule affecté en gage sans l'accord préalable du créancier gagiste.",
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                ' déclare que le(s) Véhicule(s) objet du présent contrat, est (sont) assujetti(s) à une assurance couvrant la responsabilité civile des personnes physiques ayant leur garde ou leur conduite même non autorisée ainsi que la responsabilité civile des passagers dudit véhicule, dont la copie est jointe au présent contrat.',
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " s'engage conformément à l'article 119 de l'acte uniforme portant organisation des sûretés, ",
                { text: 'à mentionner le gage', italics: true, bold: true },
                ' sur le titre administratif portant autorisation de circuler et immatriculation.',
              ],
            },
            {
              text: ['Le ', { text: 'constituant', bold: true }, " s'engage d'autre part : "],
            },
            {
              ul: [
                "Maintenir, compléter et au besoin, renouveler les assurances et procéder, s'il y a lieu au réajustement des valeurs assurées ;",
                "Prévenir le créancier gagiste dans le délai de huit (08) jours de toute modification apportée au contrat d'assurance ;",
                "Payer la ou les primes afférentes à l'assurance visée au point 6 ci-dessus et fournir toutes les justifications au système financier décentralisé, à première demande.",
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : GARANTIE COMPLEMENTAIRE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le présent gage viendra en complément de toutes les autres garanties, de quelque nature que ce soit, qui ont pu ou qui pourraient être données au créancier gagiste, soit par le constituant, soit par tout tiers agissant pour le compte du Débiteur principal.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : PACTE COMMISSOIRE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Conformément aux dispositions de l'article 104 alinéa 3 de l'acte uniforme portant organisation des suretés, les parties conviennent que la propriété exclusive du bien gagé sera attribuée à ",
            { text: 'CREDIT ACCESS SA,', bold: true },
            ' faute de paiement.\n\n',
            "Les parties conviennent qu'en cas de défaut de paiement ou lorsque l'exigibilité de la créance entière a été prononcée conformément au contrat de prêt, le constituant se verra dans l'obligation de remettre le ou les véhicules à CREDIT ACCESS suivant la sommation à lui adressée.\n\n",
            "Le(s) bien(s) qui fera(ont) objet d'attribution conventionnelle est(sont) le(s) suivant(s) :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: this.listeGarantieVehicules.map((garantieVehicule) => [
            {
              text: [
                'Un (01) Véhicule de marque ',
                { text: garantieVehicule.marque, bold: true },
                ' de type commercial ',
                { text: garantieVehicule.typeCommercial, bold: true },
                ' et type technique ',
                { text: garantieVehicule.typeTechnique + ',', bold: true },
                ' de couleur ',
                { text: garantieVehicule.couleur + ',', bold: true },
                ' immatriculé ',
                { text: garantieVehicule.immatriculation + ',', bold: true },
                ' disposant de ',
                { text: garantieVehicule.nbrePlace, bold: true },
                ' places assises.',
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Le (Les) véhicule affecté (s) est (sont) détenu (s) au domicile du constituant à l'adresse suivante : ",
            {
              text:
                typeConstituant == 'Caution'
                  ? data.proprietaire.ville.libelle +
                    ', ' +
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    '.\n'
                  : ficheCredit.demande.client.signataires[0].commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].quartier +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].rue +
                    '.\n',
              bold: true,
            },
            "Les parties conviennent que la mutation de la propriété du (des) véhicule(s) cité (s) au profit de CREDIT ACCESS ne vaut remboursement qu'à condition que la valeur vénale du (des) véhicule(s) cité (s) déterminée par Expert, couvre la totalité des sommes dues à CREDIT ACCESS SA.\n\n",
            'A défaut, CREDIT ACCESS se réserve le droit de poursuivre le recouvrement du reliquat.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : REQUISITION-POUVOIRS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les parties requièrent Monsieur le Greffier en Chef du Tribunal du commerce d'Abidjan, de bien vouloir formaliser les présentes conformément aux stipulations qui y sont contenues, sur le Registre du Commerce et du Crédit Mobilier, conformément aux articles 51 et suivants de l'Acte Uniforme OHADA portant organisation des sûretés.\n\n",
            "Cette inscription conservera le privilège pendant (5) cinq ans à compter de la date de son inscription au Registre du Commerce et du crédit mobilier et devra être renouvelée, si besoin était, à la diligence du constituant, avant l'expiration du délai ci-dessus ;\n\n",
            "Pour prendre inscription sur ledit registre, tous pouvoirs sont donnés au porteur d'une expédition des présentes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : FORMALITES ET FRAIS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Toutes les formalités légales nécessaires à la validité du présent contrat, seront effectuées par le constituant ou toute personne porteuse d'une expédition des présentes.\n",
            "Tous les frais et droits auxquels les présentes donneront lieu et ceux des formalités ou actes qui en seront la suite ou la conséquence seront à la charge du constituant qui s'oblige expressément.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de gage, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de gage.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le contrat de gage n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes, les parties élisent domicile en leurs sièges sociaux respectifs mentionnés en tête des présentes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : DROIT APPLICABLE ET JURIDICTION\n\n',
              style: 'titre',
            },
            "Le présent contrat est régi par le droit ivoirien et ce, y compris l'Acte uniforme sur les sûretés du Traité OHADA.\n",
            "Tout litige qui pourrait naître de l'interprétation et/ou de l'exécution du présent contrat de Gage et qui n'aura pas été préalablement réglé à l'amiable par les parties, sera tranché définitivement par le Tribunal de Commerce d'Abidjan.",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: [
                {
                  text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n\n`,
                  alignment: 'right',
                },
                {
                  text: 'En 4 exemplaires originaux\n',
                  alignment: 'right',
                  fontSize: 8,
                  bold: true,
                  italics: true,
                },
                {
                  text: "Dont (2) deux pour l'enregistrement \n\n\n",
                  alignment: 'right',
                  fontSize: 8,
                  italics: true,
                },
              ],
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [{ text: 'LE CONSTITUANT\n', bold: true }],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    // {
                    //     text: [
                    //         {text: 'Monsieur ', style: 'contenuText'},
                    //         {text: 'ALI BADINI', bold: true},
                    //     ],
                    //     alignment: 'right'
                    // },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 15, 10, 15],
          fontSize: 16,
          bold: true,
          alignment: 'center',
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT DE GAGE VEHICULE PERSONNE PHYSIQUE
  contratDeGageDeVehiculePersonnePhysique(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    typeConstituant: string,
    data: any,
    ficheCredit: any,
  ) {
    const typePiece =
      ficheCredit.demande.client.typePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.typePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.typePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.typePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.typePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : '';
    this.listeGarantieVehicules = data.garanties.filter((item) => item.garantie == 1);

    const activiteClient = ficheCredit.demande.activites.find((item) => item.niveauActivite === 1);

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          // CONTRAT DE GAGE DE VEHICULE PERSONNE PHYSIQUE
                          text: 'CONTRAT DE GAGE DE VEHICULE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01, représentée par ",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },

        data.type == 'Caution'
          ? {
              text: [
                'Nom : ',
                { text: data.proprietaire.nom, bold: true },
                '\n',
                'Prénom(s) : ',
                { text: data.proprietaire.prenom, bold: true },
                '\n',
                'Date et lieu de naissance : ',
                {
                  text:
                    this._datePipe.transform(
                      data.proprietaire.dateNaissance,
                      'dd MMMM yyyy',
                      'fr',
                    ) +
                    ', ' +
                    data.proprietaire.lieuNaissance +
                    ' ;\n',
                  bold: true,
                },
                'Nationalité : ',
                { text: data.proprietaire.nationalite.nationalite + ' ;\n', bold: true },
                "Pièce d'identité : ",
                {
                  text:
                    data.proprietaire.typePiece == 1
                      ? 'CNI'
                      : data.proprietaire.typePiece == 2
                        ? 'PASSEPORT'
                        : data.proprietaire.typePiece == 3
                          ? 'CARTE CONSULAIRE'
                          : data.proprietaire.typePiece == 4
                            ? 'PERMIS DE CONDUIRE'
                            : data.proprietaire.typePiece == 5
                              ? "ATTESTATION D'IDENTITE"
                              : '',
                  bold: true,
                },
                ', numéro ',
                { text: data.proprietaire.numPiece + ' ;\n', bold: true },
                'Domicile : ',
                {
                  text:
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    ' ;\n',
                  bold: true,
                },
                'Profession : ',
                { text: data.proprietaire.profession + ' ;\n', bold: true },
                'Situation matrimoniale : ',
                {
                  text:
                    this.retourneSituationMatrimonialeCaution(
                      data.proprietaire.situationMatri,
                      data.proprietaire.genre,
                    ) + ' ;\n',
                  bold: true,
                },
                'Contact : ',
                { text: data.proprietaire.contact + ' ;\n', bold: true },
              ],
              style: 'contenuText',
            }
          : {
              text: [
                { text: ficheCredit.demande.client.nomPrenom, bold: true },
                '\n',
                // "Nom : " , {text: ficheCredit.demande.client.nom, bold: true}, "\n",
                // "Prénom(s) : " , {text: ficheCredit.demande.client.prenom, bold: true}, "\n",
                'Date et lieu de naissance : ',
                {
                  text:
                    this._datePipe.transform(
                      ficheCredit.demande.client.dataNaiss,
                      'dd MMMM yyyy',
                      'fr',
                    ) +
                    ', ' +
                    ficheCredit.demande.client.lieuNaiss +
                    ' ;\n',
                  bold: true,
                },
                'Nationalité : ',
                { text: ficheCredit.demande.client.nationalite.nationalite + ';\n', bold: true },
                "Pièce d'identité : ",
                { text: typePiece, bold: true },
                ', numéro ',
                { text: ficheCredit.demande.client.numPiece + ' ;\n', bold: true },
                'Domicile : ',
                {
                  text:
                    ficheCredit.demande.client.commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.quartier +
                    ', ' +
                    ficheCredit.demande.client.rue +
                    ' ;\n',
                  bold: true,
                },
                'Boite Postale: ',
                { text: ficheCredit.demande.client.adresse + ';\n', bold: true },
                'Profession : ',
                { text: ficheCredit.demande.client.profession + ' ;\n', bold: true },
                'Situation matrimoniale : ',
                {
                  text:
                    this.retourneSituationMatrimoniale(
                      ficheCredit.demande.client.situationMatri,
                      ficheCredit.demande.client.sexe,
                    ) + ' ;\n',
                  bold: true,
                },
                'Contact : ',
                { text: ficheCredit.demande.client.telPortable + ' ;\n', bold: true },
                'Exerçant son activité commerciale sous la dénomination de : ',
                { text: ficheCredit.demande.client.denomination + ' ;\n', bold: true },
                'Immatriculation N° : ',
                { text: ficheCredit.demande.client.rccm + ';\n', bold: true },
              ],
              style: 'contenuText',
            },

        {
          text: [
            'Ci-après désigné : ',
            { text: '« le Constituant »\n\n', bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            {
              text:
                'CREDIT ACCESS S.A. ET ' +
                (data.type == 'Caution'
                  ? data.proprietaire.nom + ' ' + data.proprietaire.prenom
                  : ficheCredit.demande.client.nomPrenom) +
                ' CI-APRES ENSEMBLE DESIGNES « LES PARTIES » ET INDIVIDUELLEMENT UNE OU LA « PARTIE »',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nIL A ETE CONVENU CE QUI SUIT :\n\n',
              alignment: 'center',
              style: 'titre',
            },
          ],
        },
        {
          text: [
            'A la sûreté et en garantie du prêt consenti à',
            { text: ficheCredit.demande.client.nomPrenom },
            ' par ',
            { text: ' CREDIT ACCESS SA ', bold: true },
            "d'un montant en principal de ",
            {
              text:
                this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' FRANCS CFA,\n',
              bold: true,
            },
            {
              text:
                '(' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') FRANCS CFA, ',
              bold: true,
            },
            'augmenté des intérêts, frais et accessoires, le constituant affecte EN GAGE DE PREMIER RANG au profit de ',
            { text: 'CREDIT ACCESS SA, ', bold: true },
            'dans les conditions prévues par ',
            {
              text: "l'acte uniforme OHADA portant organisation des sûretés en ses articles 96 et suivants, le véhicule automobile dont la désignation suit : ",
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : DESIGNATION\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: this.listeGarantieVehicules.map((garantieVehicule) => [
            {
              text: [
                'Un (01) Véhicule de marque ',
                { text: garantieVehicule.marque, bold: true },
                ' de type commercial ',
                { text: garantieVehicule.typeCommercial, bold: true },
                ' et type technique ',
                { text: garantieVehicule.typeTechnique + ',', bold: true },
                ' de couleur ',
                { text: garantieVehicule.couleur + ',', bold: true },
                ' immatriculé ',
                { text: garantieVehicule.immatriculation + ',', bold: true },
                ' disposant de ',
                { text: garantieVehicule.nbrePlace, bold: true },
                ' places assises.\n',
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Le(s) véhicule(s) affecté(s) est(sont) détenu(s) au domicile du constituant à l'adresse suivante : ",
            {
              text:
                typeConstituant == 'Adherent'
                  ? ficheCredit.demande.client.commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.quartier +
                    ', ' +
                    ficheCredit.demande.client.rue +
                    '.\n'
                  : data.proprietaire.ville.libelle +
                    ', ' +
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    '.\n',
              bold: true,
            },
            "Ce(s) véhicule(s) est(sont) susceptible d'être déplacé(s) par ",
            { text: 'le constituant', bold: true },
            ' pour effectuer toute tâche relative à son activité commerciale.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : CREANCE GARANTIE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Sur le véhicule affecté en gage, le ',
            { text: 'constituant', bold: true },
            " consent qu'il soit pris contre lui, toutes les inscriptions utiles pour la sûreté de la somme de ",
            {
              text:
                this.convertirEnLettres(ficheCredit.decision.montantEmprunte) +
                ' (' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') DE FRANCS CFA ',
              bold: true,
            },
            'augmentée de tous les intérêts, frais et accessoires, constituant le montant de son emprunt à ',
            { text: 'CREDIT ACCESS SA.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : DROITS, ACTIONS, PRIVILEGES\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: 'AU MOYEN DE CE GAGE,\n', bold: true },
            { text: 'CREDIT ACCESS SA,', bold: true },
            " exercera sur les véhicules ci-dessus désignés tous les droits, actions et privilèges conférés par la loi au créancier gagiste et notamment ceux des articles 99 et suivants de l'Acte Uniforme portant organisation des sûretés jusqu'à concurrence du montant en principal, intérêts et accessoires dus, et ce par priorité et préférence à tous autres créanciers.\n\n",
            'Le présent contrat de gage prend effet à compter de sa signature et restera en vigueur tant que les sommes dues par le Débiteur principal à ',
            { text: 'CREDIT ACCESS SA,', bold: true },
            " en principal intérêts frais et accessoires n'auront pas été intégralement remboursées.\n\n",
            'Cependant, dès lors que les sommes dues par le ',
            { text: 'Débiteur principal,', bold: true },
            ' à ',
            { text: 'CREDIT ACCESS SA,', bold: true },
            " au titre du prêt auront été intégralement remboursées, en principal, intérêts, frais et accessoires, le créancier gagiste s'engage à donner mainlevée du présent gage, aux frais du constituant.\n\n",
            'Le gage continuera de produire ses effets en cas de prorogation de la durée de remboursement du financement octroyé par CREDIT ACCESS, sans que le constituant ne puisse invoquer ces faits comme opérant novation.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 : ENGAGEMENT ET DECLARATION DU CONSTITUANT\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: [
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " atteste qu'il est valablement obligé aux termes des présentes et qu'aucune autorisation particulière n'est nécessaire à la validation de son engagement.\n\n",
              ],
            },
            {
              text: [
                "Il s'engage aussi longtemps que les sommes dues à ",
                { text: 'CREDIT ACCESS SA,', bold: true },
                " n'auront pas été intégralement remboursées, en principal, intérêts, frais et accessoires, à ne pas constituer d'autres sûretés, ou permettre la prise d'autres gages sur le(s) Véhicule(s), identifié(s) dans le présent contrat et en annexe, dès lors que la constitution de telles sûretés entame les droits de CREDIT ACCESS.\n\n",
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " déclare que le(s) Véhicule(s) objet du présent contrat n'est (ne sont) pas affecté(s) à la garantie de remboursement d'un concours financier consenti par un prêteur autre que ",
                { text: 'CREDIT ACCESS SA.\n\n', bold: true },
              ],
            },
            {
              text: ['Le ', { text: 'constituant', bold: true }, " s'engage d'autre part : "],
            },
            {
              ul: [
                'à ne pas consentir un nouveau gage sur ledit (lesdits) véhicule(s) sans accord préalable du créancier gagiste,',
                'Défendre les droits du créancier gagiste sur le(s) Véhicule(s) affecté(s) en gage contre toutes les actions et prétentions de toutes personnes physiques et/ou morales.\n\n',
              ],
              style: 'contenuText',
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " s'engage à ne pas vendre tout ou partie du véhicule affecté en gage sans l'accord préalable du créancier gagiste.\n\n",
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                ' déclare que le(s) Véhicule(s) objet du présent contrat, est (sont) assujetti(s) à une assurance couvrant la responsabilité civile des personnes physiques ayant leur garde ou leur conduite même non autorisée ainsi que la responsabilité civile des passagers dudit véhicule, dont la copie est jointe au présent contrat.\n\n',
              ],
            },
            {
              text: [
                'Le ',
                { text: 'constituant', bold: true },
                " s'engage conformément à l'article 119 de l'acte uniforme portant organisation des sûretés, ",
                { text: 'à mentionner le gage', italics: true, bold: true },
                ' sur le titre administratif portant autorisation de circuler et immatriculation.\n\n',
              ],
            },
            {
              text: ['Le ', { text: 'constituant', bold: true }, " s'engage d'autre part : "],
            },
            {
              ul: [
                "Maintenir, compléter et au besoin, renouveler les assurances et procéder, s'il y a lieu au réajustement des valeurs assurées ;",
                "Prévenir le créancier gagiste dans le délai de huit (08) jours de toute modification apportée au contrat d'assurance ;",
                "Payer la ou les primes afférentes à l'assurance visée au point 6 ci-dessus et fournir toutes les justifications au système financier décentralisé, à première demande.",
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : GARANTIE COMPLEMENTAIRE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Le présent gage viendra en complément de toutes les autres garanties, de quelque nature que ce soit, qui ont pu ou qui pourraient être données au créancier gagiste, soit par le constituant, soit par tout tiers agissant pour le compte du Débiteur principal.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : PACTE COMMISSOIRE\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Conformément aux dispositions de l'article 104 alinéa 3 de l'acte uniforme portant organisation des suretés, les parties conviennent que la propriété exclusive du bien gagé sera attribuée à ",
            { text: 'CREDIT ACCESS SA,', bold: true },
            ' faute de paiement.\n\n',
            "Les parties conviennent qu'en cas de défaut de paiement ou lorsque l'exigibilité de la créance entière a été prononcée conformément au contrat de prêt, le constituant se verra dans l'obligation de remettre le ou les véhicules à CREDIT ACCESS suivant la sommation à lui adressée.\n\n",
            "Le(s) bien(s) qui fera(ont) objet d'attribution conventionnelle est(sont) le(s) suivant(s) :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: this.listeGarantieVehicules.map((garantieVehicule) => [
            {
              text: [
                'Un (01) Véhicule de marque ',
                { text: garantieVehicule.marque, bold: true },
                ' de type commercial ',
                { text: garantieVehicule.typeCommercial, bold: true },
                ' et type technique ',
                { text: garantieVehicule.typeTechnique + ',', bold: true },
                ' de couleur ',
                { text: garantieVehicule.couleur + ',', bold: true },
                ' immatriculé ',
                { text: garantieVehicule.immatriculation + ',', bold: true },
                ' disposant de ',
                { text: garantieVehicule.nbrePlace, bold: true },
                ' places assises.',
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Le (Les) véhicule affecté (s) est (sont) détenu (s) au domicile du constituant à l'adresse suivante : ",
            {
              text:
                typeConstituant == 'Adherent'
                  ? ficheCredit.demande.client.commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.quartier +
                    ', ' +
                    ficheCredit.demande.client.rue +
                    '.\n'
                  : data.proprietaire.ville.libelle +
                    ', ' +
                    data.proprietaire.commune.libelle +
                    ', ' +
                    data.proprietaire.quartier +
                    ', ' +
                    data.proprietaire.rue +
                    '.\n',
              bold: true,
            },
            "Les parties conviennent que la mutation de la propriété du (des) véhicule(s) cité (s) au profit de CREDIT ACCESS ne vaut remboursement qu'à condition que la valeur vénale du (des) véhicule(s) cité (s) déterminée par Expert, couvre la totalité des sommes dues à CREDIT ACCESS SA.\n\n",
            'A défaut, CREDIT ACCESS se réserve le droit de poursuivre le recouvrement du reliquat.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : REQUISITION-POUVOIRS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Les parties requièrent Monsieur le Greffier en Chef du Tribunal du commerce d'Abidjan, de bien vouloir formaliser les présentes conformément aux stipulations qui y sont contenues, sur le Registre du Commerce et du Crédit Mobilier, conformément aux articles 51 et suivants de l'Acte Uniforme OHADA portant organisation des sûretés.\n\n",
            "Cette inscription conservera le privilège pendant (5) cinq ans à compter de la date de son inscription au Registre du Commerce et du crédit mobilier et devra être renouvelée, si besoin était, à la diligence du constituant, avant l'expiration du délai ci-dessus ;\n\n",
            "Pour prendre inscription sur ledit registre, tous pouvoirs sont donnés au porteur d'une expédition des présentes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : FORMALITES ET FRAIS\n\n',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            "Toutes les formalités légales nécessaires à la validité du présent contrat, seront effectuées par le constituant ou toute personne porteuse d'une expédition des présentes.\n\n",
            "Tous les frais et droits auxquels les présentes donneront lieu et ceux des formalités ou actes qui en seront la suite ou la conséquence seront à la charge du constituant qui s'oblige expressément.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de gage, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de gage.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le contrat de gage n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes, les parties élisent domicile en leurs sièges sociaux respectifs mentionnés en tête des présentes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : DROIT APPLICABLE ET JURIDICTION\n\n',
              style: 'titre',
            },
            "Le présent contrat est régi par le droit ivoirien et ce, y compris l'Acte uniforme sur les sûretés du Traité OHADA.\n",
            "Tout litige qui pourrait naître de l'interprétation et/ou de l'exécution du présent contrat de Gage et qui n'aura pas été préalablement réglé à l'amiable par les parties, sera tranché définitivement par le Tribunal de Commerce d'Abidjan.",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: [
                {
                  text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n\n`,
                  alignment: 'right',
                },
                {
                  text: 'En 4 exemplaires originaux\n',
                  alignment: 'right',
                  fontSize: 8,
                  bold: true,
                  italics: true,
                },
                {
                  text: "Dont (2) deux pour l'enregistrement \n\n\n",
                  alignment: 'right',
                  fontSize: 8,
                  italics: true,
                },
              ],
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [{ text: 'LE CONSTITUANT\n', bold: true }],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText' },
                        { text: 'ALI BADINI', bold: true },
                      ],
                      alignment: 'right',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  /** CONTRAT POUR LES CAUTIONS */
  conventionDeCautionnementPersonnePhysique(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
    caution: any,
  ) {
    const typePiece =
      ficheCredit.demande.client.typePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.typePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.typePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.typePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.typePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : '';
    const activiteClient = ficheCredit.demande.activites.find((item) => item.niveauActivite === 1);

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONVENTION DE CAUTIONNEMENT SOLIDAIRE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'ENTRE, LES SOUSSIGNE(E)S\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec Conseil d'Administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody Riviera Palmeraie, Rue I 166, 01 BP 12084 ABJ 01, représentée par ",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment : ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },

        // INFORMATION SUR LA CAUTION
        {
          text: [
            'Nom : ',
            { text: caution.nom, bold: true },
            '\n',
            'Prénom(s) : ',
            { text: caution.prenom, bold: true },
            '\n',
            'Date et lieu de naissance : ',
            {
              text:
                this._datePipe.transform(caution.dateNaissance, 'dd MMMM yyyy', 'fr') +
                ', ' +
                caution.lieuNaissance +
                ' ;\n',
              bold: true,
            },
            caution.nationalite ? 'Nationalité : ' : '',
            caution.nationalite
              ? { text: caution.nationalite.nationalite + ';\n', bold: true }
              : '',
            "Pièce d'identité : ",
            {
              text:
                caution.typePiece == 1
                  ? 'CNI'
                  : caution.typePiece == 2
                    ? 'PASSEPORT'
                    : caution.typePiece == 3
                      ? 'CARTE CONSULAIRE'
                      : caution.typePiece == 4
                        ? 'PERMIS DE CONDUIRE'
                        : caution.typePiece == 5
                          ? "ATTESTATION D'IDENTITE"
                          : '',
              bold: true,
            },
            ', numéro ',
            { text: caution.numPiece + ' ;\n', bold: true },
            'Domicile : ',
            {
              text: caution.commune.libelle + ', ' + caution.quartier + ', ' + caution.rue + ' ;\n',
              bold: true,
            },
            'Profession : ',
            { text: caution.profession + ' ;\n', bold: true },
            'Situation matrimoniale : ',
            {
              text:
                this.retourneSituationMatrimonialeCaution(caution.situationMatri, caution.genre) +
                ' ;\n',
              bold: true,
            },
            'Contact : ',
            { text: caution.contact + ' ;\n', bold: true },
          ],
          style: 'contenuText',
        },

        {
          text: [
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            'Ci-après désigné: ',
            { text: '« la Caution » \n\n', bold: true },
            { text: 'CREDIT ACCESS S.A. et ' + caution.nom + ' ' + caution.prenom, bold: true },
            ', ci-après ensemble désigné(e)s ',
            { text: '« Les parties »\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: 'PRESENCE-REPRESENTATION\n\n',
              style: 'titre',
            },
            'Toutes les parties sont présentes et valablement représentées au présent acte.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nTERMINOLOGIE\n\n',
              style: 'titre',
            },
            'Les parties citées sont ci-après, ensemble, désignées les « Parties », ou, séparément, la \n',
            { text: '« Partie ».\n\n', bold: true },
            { text: 'LESQUELS noms et ès qualités, ', alignment: 'right', bold: true },
            "ont par les présentes requis le Notaire soussigné de constater par acte authentique, les conventions suivantes arrêtées directement entre elles sans le concours ni la participation dudit Notaire, qui n'en est ici que le simple rédacteur,\n\n",
            'CE QUI A LIEU DE LA MANIERE SUIVANTE,',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nCONVENTION DE CAUTIONNEMENT\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 - ENGAGEMENT DE LA CAUTION\n\n',
              style: 'titre',
            },
            {
              text:
                (caution.genre == 'Masculin' ? 'Monsieur ' : 'Madame ') +
                caution.nom +
                ' ' +
                caution.prenom +
                ', ',
              bold: true,
            },
            'se constitue, par la présente, caution personnelle solidaire et indivisible, au profit de ',
            { text: 'CREDIT ACCESS S.A, ', bold: true },
            "qui l'accepte, pour le remboursement ou le paiement de toutes les sommes qui peuvent ou qui pourront lui être dues par le Débiteur principal, ",
            { text: '(Madame/monsieur ' + ficheCredit.demande.client.nomPrenom + '),', bold: true },
            " jusqu'à concurrence de la somme maximale garantie ",
            {
              text:
                ficheCredit.decision.montantCaution
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' FRANCS CFA (' +
                this.convertirEnLettres(ficheCredit.decision.montantCaution) +
                ' FCFA), ',
              bold: true,
            },
            "couvrant le principal, les frais et autres accessoires par application des dispositions des articles 13 et 14 de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA). \n\n",
            'En conséquence, en cas de défaillance du Débiteur principal, ci-dessus désigné, pour quelque cause que ce soit,',
            { text: ' la Caution ', bold: true },
            "s'engage à effectuer le règlement de toutes les sommes qui pourraient lui être réclamée par le Système Financier Décentralisé, et ce, dans la limite de son engagement.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 2 - PORTEE DE L'ENGAGEMENT DE LA CAUTION\n\n",
              style: 'titre',
            },
            'Le présent cautionnement étant solidaire,',
            { text: ' la Caution ', bold: true },
            'renonce expressément et irrévocablement :\n\n',
          ],
          style: 'contenuText',
        },
        {
          ul: [
            "à tout bénéfice de discussion et de division, tant à l'égard du Débiteur principal que des autres coobligés, conformément aux dispositions des articles 27 et 28 de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA);",
            "à toutes subrogations, toutes actions personnelles ou autres qui auraient pour résultat de faire venir la Caution en concours avec CREDIT ACCESS, jusqu'à ce que le Système Financier Décentralisé soit totalement désintéressée de la totalité des sommes en principal, intérêts, commissions, frais et accessoires dues par le Débiteur principal.\n Il en sera de même, lorsque la Caution se sera libérée partiellement ou totalement de ses obligations et quand bien même le présent engagement serait d'un montant inférieur aux sommes dues par le Débiteur principal au Système Financier Décentralisé.",
            "à se prévaloir des dispositions de l'article 23 alinéa 3 de l'Acte uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA) relatif à la prorogation du terme accordée au Débiteur principal par le Système Financier Décentralisé.\n\n Partant, si le Débiteur principal obtient une prorogation de délais de CREDIT ACCESS, les sommes qui restent tenues, ne pourront poursuivre le Débiteur principal avant l'expiration de ces délais.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 - ENGAGEMENT DU SYSTEME FINANCIER DECENTRALISE\n\n',
              style: 'titre',
            },
            "Le Système Financier Décentralisé est tenu d'aviser",
            { text: ' la Caution ', bold: true },
            'de toute déchéance ou prorogation de terme accordée au Débiteur principal, ainsi que toute défaillance de ce dernier en indiquant le montant restant dû par le Débiteur principal, en principal, intérêts, frais et autres accessoires au moment de la défaillance.\n\n',
            "En application des dispositions de l'article 24 de l'Acte Uniforme susvisé, le Système Financier Décentralisé ne pourra poursuivre",
            { text: ' la Caution ', bold: true },
            "qu'après une mise en demeure de payer adressée au Débiteur principal, restée sans effet.\n\n",
            "En outre, conformément aux dispositions de l'article 25 de l'Acte Uniforme portant organisation des sûretés,  le Système Financier Décentralisé s'oblige dans le mois qui suit le terme de chaque semestre civil à compter de la signature de la présente convention, à communiquer à",
            { text: ' la Caution ', bold: true },
            "un état des dettes du Débiteur principal précisant leurs causes , leurs échéances et leurs montants en principal, intérêts et autres accessoires restant dus à la fin du semestre écoulé, en leur rappelant la faculté de révocation par reproduction littérale des dispositions de l'article 19 de l'Acte Uniforme susvisé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 - REVOCATION DE LA CAUTION\n\n',
              style: 'titre',
            },
            "Le présent cautionnement subsistera dans son intégralité jusqu'à révocation dûment notifiée par",
            { text: ' la Caution ', bold: true },
            'au Système Financier Décentralisé. Cette révocation pourra être notifiée à tout moment, et sera faite par lettre recommandée avec accusé de réception adressée au Système Financier Décentralisé, à son siège social sus indiqué.\n\n',
            'Toutefois',
            { text: ' la Caution ', bold: true },
            "ou toute personne venant à ses droits et obligations, ne sera déchargée des effets de sa garantie que par le paiement effectif des sommes dues à CREDIT ACCESS pour toutes les obligations dont l'origine sera antérieure à la date de réception de l'avis de révocation par le Système Financier Décentralisé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 - INDIVISIBILITE\n\n',
              style: 'titre',
            },
            'Au cas où ',
            { text: ' la Caution ', bold: true },
            'viendrait à décéder avant entière libération, il y aurait solidarité entre ses héritiers et représentant lesquels seront tenus sans division ni discussion et individuellement, au remboursement, ou le paiement de toutes les sommes qui peuvent ou qui pourront leur être dues par le Débiteur Principal en principal, intérêt, frais et accessoires sus cités et en supporteront en outre, les frais de notification à leur faire conformément à la loi 2019-573 du vingt-six juin deux mil dix-neuf relatives aux successions.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 - EXIGIBILITE\n\n',
              style: 'titre',
            },
            { text: 'La Caution ', bold: true },
            "sera tenue de s'exécuter dès que les obligations du Débiteur principal à l'égard de CREDIT ACCESS deviendront exigibles, fut-ce par anticipation, pour quelque cause que ce soit.\n\n",
            { text: 'La Caution ', bold: true },
            "s'engage, toutefois, à ne pas se prévaloir des délais de paiement qui pourraient être accordés, expressément ou tacitement, par CREDIT ACCESS au Débiteur principal.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 - AUTONOMIE DU PRESENT ENGAGEMENT\n\n',
              style: 'titre',
            },
            "La présente convention n'emporte pas novation aux droits et obligations de CREDIT ACCESS.\n\n",
            "Le cautionnement s'ajoute ou s'ajoutera à toutes garanties réelles ou personnelles qui ont pu ou pourront être données à CREDIT ACCESS par",
            { text: ' la Caution, ', bold: true },
            'le Débiteur principal ou tout tiers.\n\n',
            "Par ailleurs, les dispositions du présent engagement conserveront leur plein effet, quelle que soit l'évolution de la situation financière ou juridique au Débiteur principal.\n\n",
            "Ainsi, la modification ou la disparition des liens de fait ou de droit pouvant exister à ce jour entre le Débiteur principal et la Caution ne seront pas susceptibles d'entraîner la déchéance du présent engagement, en dehors de toute révocation dûment notifiée.",
          ],
          style: 'contenuText',
        },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 8 - REGLEMENT DES DIFFERENDS - LOI APPLICABLE\n\n',
        //             style: 'titre'
        //         },
        //         "Tout différend résultant de l'interprétation ou de l'exécution de la présente convention, qui n'aura pas été préalablement réglé à l'amiable, dans un délai maximum d'un (1) mois à compter de la réception par l'une des parties, de la demande d'un règlement amiable émanant de l'autre partie, sera soumis au Tribunal de Commerce d'ABIDJAN.\n\n",
        //         "La loi applicable à la présente convention est la loi Ivoirienne en ce compris les dispositions de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA)."
        //     ],
        //     style: "contenuText"
        // },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement de la présente convention, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins de la présente convention de cautionnement solidaire.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou une partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, la présente convention n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 10 - DECLARATIONS D'ETAT CIVIL ET AUTRES\n\n",
              style: 'titre',
            },
            { text: 'La Caution ', bold: true },
            'et',
            { text: ' CREDIT ACCESS ', bold: true },
            'par son représentant, déclarent chacun en ce qui les concerne, sous les peines de droit et la foi du serment :',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nI/ LA CAUTION\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            "Exact son état civil et autre élément d'identification indiqué plus haut,",
            "Qu'il n'existe aucun empêchement, ni restriction d'ordre légal ou statutaire à la signature des présentes.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nII/LE REPRESENTANT DE CREDIT ACCESS\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Que la Société a été régulièrement constituée et que sa constitution a été publiée conformément à la loi,',
            "Qu'elle ne fait l'objet d'aucune action en nullité,",
            "Qu'elle n'est pas en état de faillite, de liquidation judiciaire ou amiable, de règlement préventif ou de cessation de paiement pour quelque cause que ce soit.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 11 - IMPOTS - FRAIS - FORMALITES\n\n',
        //             style: 'titre'
        //         },
        //         "Tous les droits, impôts, taxes, pénalités et frais auxquels donneront lieu la présente convention de cautionnement et son exécution, y compris les droits d'enregistrement en cas d'accomplissement de cette formalité, seront à la charge de", {text: " la Caution ", bold: true}, "qui s'y oblige expressément.\n\n",
        //         "Il est précisé que ces droits et frais ont été déjà payé par le débiteur principal, ", {text: ficheCredit.demande.client.nomPrenom + '.', bold: true}
        //     ],
        //     style: "contenuText"
        // },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 12 - DELIVRANCE DE GROSSE\n\n',
        //             style: 'titre'
        //         },
        //         "Les parties noms et ès qualités, requièrent expressément le Notaire soussigné de délivrer au CREANCIER une grosse des présentes pour lui servir de titre exécutoire direct contre", {text: " la CAUTION " + caution.nom + " "+ caution.prenom + ", ", bold: true}, "en raison des sommes qui peuvent et pourront lui être dues en vertu du présent contrat."
        //     ],
        //     style: "contenuText"
        // },
        {
          text: [
            {
              text: '\n\nARTICLE 11 - ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution de la présente convention et de ses suites, il est fait élection de domicile par les parties, savoir :",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'La Caution en son domicile sus indiqué ;',
            'La Société « CREDIT ACCESS SA » en son siège social également sus indiqué ;',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            'Toutes demandes, notifications et significations seront valablement faites aux parties à leurs domiciles élus sus indiqué, sauf changement dûment notifié aux parties.\n\n',
          ],
          style: 'contenuText',
        },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 14 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
        //             style: 'titre'
        //         },
        //         "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
        //         "A défaut de règlement à l'amiable, le litige sera soumis au ", {text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true},
        //         "Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA."
        //     ],
        //     style: "contenuText",
        // },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 15 - MENTION\n\n',
        //             style: 'titre'
        //         },
        //         "Mention des présentes est consentie pour avoir lieu partout où besoin sera.\n\n\n"
        //     ],
        //     style: "contenuText"
        // },
        {
          unbreakable: true,
          stack: [
            {
              columns: [
                {
                  text: [
                    { text: 'LA CAUTION\n', bold: true, alignment: 'right' },
                    {
                      text: "(Mention manuscrite « Bon pour caution solidaire dans les termes ci-dessus indiqués jusqu'à concurrence de la somme maximale garantie de ",
                      italics: true,
                      fontSize: 8,
                    },
                    {
                      text:
                        ficheCredit.decision.montantCaution
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA',
                      italics: true,
                      fontSize: 8,
                    },
                    {
                      text: ', incluant le principal, les intérêts, les commissions, les frais et accessoires »)',
                      italics: true,
                      fontSize: 8,
                    },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },

                    {
                      text: [{ text: 'Le Directeur Général', bold: true, alignment: 'right' }],
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT CAUTION SOLIDAIRE POUR PERSONNE MORALE
  conventionDeCautionnementPersonneMorale(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
    caution: any,
  ) {
    const existenceSignataire = ficheCredit.demande.client.signataires.length != 0 ? true : false;

    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const typePiece = existenceSignataire
      ? ficheCredit.demande.client.signataires[0].codTypePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.signataires[0].codTypePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.signataires[0].codTypePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.signataires[0].codTypePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.signataires[0].codTypePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : ''
      : '';

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONVENTION DE CAUTIONNEMENT SOLIDAIRE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'ENTRE, LES SOUSSIGNE(E)S\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec Conseil d'Administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody Riviera Palmeraie, Rue I 166, 01 BP 12084 ABJ 01, représentée par",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment : ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },

        // INFORMATION SUR LA CAUTION
        {
          text: [
            'Nom : ',
            { text: caution.nom, bold: true },
            '\n',
            'Prénom(s) : ',
            { text: caution.prenom, bold: true },
            '\n',
            'Date et lieu de naissance : ',
            {
              text:
                this._datePipe.transform(caution.dateNaissance, 'dd MMMM yyyy', 'fr') +
                ', ' +
                caution.lieuNaissance +
                ' ;\n',
              bold: true,
            },
            caution.nationalite ? 'Nationalité : ' : '',
            caution.nationalite
              ? { text: caution.nationalite.nationalite + ';\n', bold: true }
              : '',
            "Pièce d'identité : ",
            {
              text:
                caution.typePiece == 1
                  ? 'CNI'
                  : caution.typePiece == 2
                    ? 'PASSEPORT'
                    : caution.typePiece == 3
                      ? 'CARTE CONSULAIRE'
                      : caution.typePiece == 4
                        ? 'PERMIS DE CONDUIRE'
                        : caution.typePiece == 5
                          ? "ATTESTATION D'IDENTITE"
                          : '',
              bold: true,
            },
            ', numéro ',
            { text: caution.numPiece + ' ;\n', bold: true },
            'Domicile : ',
            {
              text: caution.commune.libelle + ', ' + caution.quartier + ', ' + caution.rue + ' ;\n',
              bold: true,
            },
            caution.profession ? 'Profession : ' : '',
            caution.profession ? { text: caution.profession + ' ;\n', bold: true } : '',
            'Situation matrimoniale : ',
            {
              text:
                this.retourneSituationMatrimonialeCaution(caution.situationMatri, caution.genre) +
                ' ;\n',
              bold: true,
            },
            'Contact : ',
            { text: '0' + caution.contact + ' ;\n', bold: true },
          ],
          style: 'contenuText',
        },

        {
          text: [
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            'Ci-après désigné: ',
            { text: '« la Caution » \n\n', bold: true },
            { text: 'CREDIT ACCESS S.A. et ' + caution.nom + ' ' + caution.prenom, bold: true },
            ', ci-après ensemble désigné(e)s ',
            { text: '« Les parties »\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: 'PRESENCE-REPRESENTATION\n\n',
              style: 'titre',
            },
            'Toutes les parties sont présentes et valablement représentées au présent acte.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nTERMINOLOGIE\n\n',
              style: 'titre',
            },
            'Les parties citées sont ci-après, ensemble, désignées les « Parties », ou, séparément, la \n',
            { text: '« Partie ».\n\n', bold: true },
            { text: 'LESQUELS noms et ès qualités, ', alignment: 'right', bold: true },
            "ont par les présentes requis le Notaire soussigné de constater par acte authentique, les conventions suivantes arrêtées directement entre elles sans le concours ni la participation dudit Notaire, qui n'en est ici que le simple rédacteur,\n\n",
            'CE QUI A LIEU DE LA MANIERE SUIVANTE,',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nCONVENTION DE CAUTIONNEMENT\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 - ENGAGEMENT DE LA CAUTION\n\n',
              style: 'titre',
            },
            {
              text:
                (caution.genre == 'Masculin' ? 'Monsieur ' : 'Madame ') +
                caution.nom +
                ' ' +
                caution.prenom +
                ', ',
              bold: true,
            },
            'se constitue, par la présente, caution personnelle solidaire et indivisible, au profit de ',
            { text: 'CREDIT ACCESS S.A, ', bold: true },
            "qui l'accepte, pour le remboursement ou le paiement de toutes les sommes qui peuvent ou qui pourront lui être dues par le Débiteur principal, ",
            { text: 'La société ' + ficheCredit.demande.client.nomPrenom + ',', bold: true },
            " jusqu'à concurrence de la somme maximale garantie ",
            {
              text:
                this.convertirEnLettres(ficheCredit.decision.montantCaution) +
                ' FRANCS CFA (' +
                ficheCredit.decision.montantCaution
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' FCFA), ',
              bold: true,
            },
            "couvrant le principal, les frais et autres accessoires par application des dispositions des articles 13 et 14 de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA); \n\n",
            'En conséquence, en cas de défaillance du Débiteur principal, ci-dessus désigné, pour quelque cause que ce soit,',
            { text: ' la Caution ', bold: true },
            "s'engage à effectuer le règlement de toutes les sommes qui pourraient lui être réclamée par le Système Financier Décentralisé, et ce, dans la limite de son engagement.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 2 - PORTEE DE L'ENGAGEMENT DE LA CAUTION\n\n",
              style: 'titre',
            },
            'Le présent cautionnement étant solidaire,',
            { text: ' la Caution ', bold: true },
            'renonce expressément et irrévocablement :\n\n',
          ],
          style: 'contenuText',
        },
        {
          ul: [
            "à tout bénéfice de discussion et de division, tant à l'égard du Débiteur principal que des autres coobligés, conformément aux dispositions des articles 27 et 28 de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA);",
            "à toutes subrogations, toutes actions personnelles ou autres qui auraient pour résultat de faire venir la Caution en concours avec CREDIT ACCESS, jusqu'à ce que le Système Financier Décentralisé soit totalement désintéressée de la totalité des sommes en principal, intérêts, commissions, frais et accessoires dues par le Débiteur principal.\n Il en sera de même, lorsque la Caution se sera libérée partiellement ou totalement de ses obligations et quand bien même le présent engagement serait d'un montant inférieur aux sommes dues par le Débiteur principal au Système Financier Décentralisé.",
            "à se prévaloir des dispositions de l'article 23 alinéa 3 de l'Acte uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA) relatif à la prorogation du terme accordée au Débiteur principal par le Système Financier Décentralisé.\n\n Partant, si le Débiteur principal obtient une prorogation de délais de CREDIT ACCESS, les sommes qui restent tenues, ne pourront poursuivre le Débiteur principal avant l'expiration de ces délais.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 - ENGAGEMENT DU SYSTEME FINANCIER DECENTRALISE\n\n',
              style: 'titre',
            },
            "Le Système Financier Décentralisé est tenu d'aviser",
            { text: ' la Caution ', bold: true },
            'de toute déchéance ou prorogation de terme accordée au Débiteur principal, ainsi que toute défaillance de ce dernier en indiquant le montant restant dû par le Débiteur principal, en principal, intérêts, frais et autres accessoires au moment de la défaillance.\n\n',
            "En application des dispositions de l'article 24 de l'Acte Uniforme susvisé, le Système Financier Décentralisé ne pourra poursuivre",
            { text: ' la Caution ', bold: true },
            "qu'après une mise en demeure de payer adressée au Débiteur principal, restée sans effet.\n\n",
            "En outre, conformément aux dispositions de l'article 25 de l'Acte Uniforme portant organisation des sûretés,  le Système Financier Décentralisé s'oblige dans le mois qui suit le terme de chaque semestre civil à compter de la signature de la présente convention, à communiquer à",
            { text: ' la Caution ', bold: true },
            "un état des dettes du Débiteur principal précisant leurs causes , leurs échéances et leurs montants en principal, intérêts et autres accessoires restant dus à la fin du semestre écoulé, en leur rappelant la faculté de révocation par reproduction littérale des dispositions de l'article 19 de l'Acte Uniforme susvisé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 - REVOCATION DE LA CAUTION\n\n',
              style: 'titre',
            },
            "Le présent cautionnement subsistera dans son intégralité jusqu'à révocation dûment notifiée par",
            { text: ' la Caution ', bold: true },
            'au Système Financier Décentralisé. Cette révocation pourra être notifiée à tout moment, et sera faite par lettre recommandée avec accusé de réception adressée au Système Financier Décentralisé, à son siège social sus indiqué.\n\n',
            'Toutefois',
            { text: ' la Caution ', bold: true },
            "ou toute personne venant à ses droits et obligations, ne sera déchargée des effets de sa garantie que par le paiement effectif des sommes dues à CREDIT ACCESS pour toutes les obligations dont l'origine sera antérieure à la date de réception de l'avis de révocation par le Système Financier Décentralisé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 - INDIVISIBILITE\n\n',
              style: 'titre',
            },
            'Au cas où ',
            { text: ' la Caution ', bold: true },
            'viendrait à décéder avant entière libération, il y aurait solidarité entre ses héritiers et représentant lesquels seront tenus sans division ni discussion et individuellement, au remboursement, ou le paiement de toutes les sommes qui peuvent ou qui pourront leur être dues par le Débiteur Principal en principal, intérêt, frais et accessoires sus cités et en supporteront en outre, les frais de notification à leur faire conformément à la loi 2019-573 du vingt-six juin deux mil dix-neuf relatives aux successions.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 - EXIGIBILITE\n\n',
              style: 'titre',
            },
            { text: 'La Caution ', bold: true },
            "sera tenue de s'exécuter dès que les obligations du Débiteur principal à l'égard de CREDIT ACCESS deviendront exigibles, fut-ce par anticipation, pour quelque cause que ce soit.\n\n",
            { text: 'La Caution ', bold: true },
            "s'engage, toutefois, à ne pas se prévaloir des délais de paiement qui pourraient être accordés, expressément ou tacitement, par CREDIT ACCESS au Débiteur principal.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 - AUTONOMIE DU PRESENT ENGAGEMENT\n\n',
              style: 'titre',
            },
            "La présente convention n'emporte pas novation aux droits et obligations de CREDIT ACCESS.\n\n",
            "Le cautionnement s'ajoute ou s'ajoutera à toutes garanties réelles ou personnelles qui ont pu ou pourront être données à CREDIT ACCESS par",
            { text: ' la Caution, ', bold: true },
            'le Débiteur principal ou tout tiers.\n\n',
            "Par ailleurs, les dispositions du présent engagement conserveront leur plein effet, quelle que soit l'évolution de la situation financière ou juridique au Débiteur principal.\n\n",
            "Ainsi, la modification ou la disparition des liens de fait ou de droit pouvant exister à ce jour entre le Débiteur principal et la Caution ne seront pas susceptibles d'entraîner la déchéance du présent engagement, en dehors de toute révocation dûment notifiée.",
          ],
          style: 'contenuText',
        },
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 8 - REGLEMENT DES DIFFERENDS - LOI APPLICABLE\n\n',
        //             style: 'titre'
        //         },
        //         "Tout différend résultant de l'interprétation ou de l'exécution de la présente convention, qui n'aura pas été préalablement réglé à l'amiable, dans un délai maximum d'un (1) mois à compter de la réception par l'une des parties, de la demande d'un règlement amiable émanant de l'autre partie, sera soumis au Tribunal de Commerce d'ABIDJAN.\n\n",
        //         "La loi applicable à la présente convention est la loi Ivoirienne en ce compris les dispositions de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA)."
        //     ],
        //     style: "contenuText"
        // },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement de la présente convention, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins de la présente convention de cautionnement solidaire.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou une partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, la présente convention n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 10 - DECLARATIONS D'ETAT CIVIL ET AUTRES\n\n",
              style: 'titre',
            },
            { text: 'La Caution ', bold: true },
            'et',
            { text: ' CREDIT ACCESS ', bold: true },
            'par son représentant, déclarent chacun en ce qui les concerne, sous les peines de droit et la foi du serment :',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nI/ LA CAUTION\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            "Exact son état civil et autre élément d'identification indiqué plus haut,",
            "Qu'il n'existe aucun empêchement, ni restriction d'ordre légal ou statutaire à la signature des présentes.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nII/LE REPRESENTANT DE CREDIT ACCESS\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Que la Société a été régulièrement constituée et que sa constitution a été publiée conformément à la loi,',
            "Qu'elle ne fait l'objet d'aucune action en nullité,",
            "Qu'elle n'est pas en état de faillite, de liquidation judiciaire ou amiable, de règlement préventif ou de cessation de paiement pour quelque cause que ce soit.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 - ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution de la présente convention et de ses suites, il est fait élection de domicile par les parties, savoir :",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'La Caution en son domicile sus indiqué ;',
            'La Société « CREDIT ACCESS SA » en son siège social également sus indiqué ;',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            'Toutes demandes, notifications et significations seront valablement faites aux parties à leurs domiciles élus sus indiqué, sauf changement dûment notifié aux parties.\n\n',
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              columns: [
                {
                  text: [
                    { text: 'LA CAUTION\n', bold: true, alignment: 'right' },
                    {
                      text: "(Mention manuscrite « Bon pour caution solidaire dans les termes ci-dessus indiqués jusqu'à concurrence de la somme maximale garantie de ",
                      italics: true,
                      fontSize: 8,
                    },
                    {
                      text:
                        ficheCredit.decision.montantCaution
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA',
                      italics: true,
                      fontSize: 8,
                    },
                    {
                      text: ', incluant le principal, les intérêts, les commissions, les frais et accessoires »)',
                      italics: true,
                      fontSize: 8,
                    },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    // {text: 'Le Directeur Général', bold: true, alignment: 'right', style: 'contenuText'},
                    {
                      text: [{ text: 'Le Directeur Général', bold: true, alignment: 'right' }],
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT CAUTION SOLIDAIRE POUR PERSONNE MORALE SOCIETE COOPERATIVE
  conventionDeCautionnementPersonneMoraleSocieteCooperative(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
    caution: any,
  ) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONVENTION DE CAUTIONNEMENT SOLIDAIRE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'ENTRE, LES SOUSSIGNE(E)S\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec Conseil d'Administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody Riviera Palmeraie, Rue I 166, 01 BP 12084 ABJ 01, représentée par ",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment : ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },

        // INFORMATION SUR LA CAUTION
        {
          text: [
            'Nom : ',
            { text: caution.nom, bold: true },
            '\n',
            'Prénom(s) : ',
            { text: caution.prenom, bold: true },
            '\n',
            'Date et lieu de naissance : ',
            {
              text:
                this._datePipe.transform(caution.dateNaissance, 'dd MMMM yyyy', 'fr') +
                ', ' +
                caution.lieuNaissance +
                ' ;\n',
              bold: true,
            },
            caution.nationalite ? 'Nationalité : ' : '',
            caution.nationalite
              ? { text: caution.nationalite.nationalite + ';\n', bold: true }
              : '',
            "Pièce d'identité : ",
            {
              text:
                caution.typePiece == 1
                  ? 'CNI'
                  : caution.typePiece == 2
                    ? 'PASSEPORT'
                    : caution.typePiece == 3
                      ? 'CARTE CONSULAIRE'
                      : caution.typePiece == 4
                        ? 'PERMIS DE CONDUIRE'
                        : caution.typePiece == 5
                          ? "ATTESTATION D'IDENTITE"
                          : '',
              bold: true,
            },
            ', numéro ',
            { text: caution.numPiece + ' ;\n', bold: true },
            'Domicile : ',
            {
              text: caution.commune.libelle + ', ' + caution.quartier + ', ' + caution.rue + ' ;\n',
              bold: true,
            },
            'Profession : ',
            { text: caution.profession + ' ;\n', bold: true },
            'Situation matrimoniale : ',
            {
              text:
                this.retourneSituationMatrimonialeCaution(caution.situationMatri, caution.genre) +
                ' ;\n',
              bold: true,
            },
            'Contact : ',
            { text: caution.contact + ' ;\n', bold: true },
          ],
          style: 'contenuText',
        },

        {
          text: [
            '\n\nCi-après désigné : ',
            { text: '« la Caution »\n\n', bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            { text: 'CREDIT ACCESS S.A. et ' + caution.nom + ' ' + caution.prenom, bold: true },
            ', ci-après ensemble désigné(e)s ',
            { text: '« Les parties »\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: 'PRESENCE-REPRESENTATION\n\n',
              style: 'titre',
            },
            'Toutes les parties sont présentes et valablement représentées au présent acte.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nTERMINOLOGIE\n\n',
              style: 'titre',
            },
            'Les parties citées sont ci-après, ensemble, désignées les « Parties », ou, séparément, la \n',
            { text: '« Partie ».\n\n', bold: true },
            { text: 'LESQUELS noms et ès qualités, ', alignment: 'right', bold: true },
            "ont par les présentes requis le Notaire soussigné de constater par acte authentique, les conventions suivantes arrêtées directement entre elles sans le concours ni la participation dudit Notaire, qui n'en est ici que le simple rédacteur,\n\n",
            'CE QUI A LIEU DE LA MANIERE SUIVANTE,',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nCONVENTION DE CAUTIONNEMENT\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 - ENGAGEMENT DE LA CAUTION\n\n',
              style: 'titre',
            },
            {
              text:
                (caution.genre == 'Masculin' ? 'Monsieur ' : 'Madame ') +
                caution.nom +
                ' ' +
                caution.prenom +
                ', ',
              bold: true,
            },
            'se constitue, par la présente, caution personnelle solidaire et indivisible, au profit de ',
            { text: 'CREDIT ACCESS S.A, ', bold: true },
            "qui l'accepte, pour le remboursement ou le paiement de toutes les sommes qui peuvent ou qui pourront lui être dues par le Débiteur principal, ",
            { text: 'La société ' + ficheCredit.demande.client.nomPrenom + ',', bold: true },
            " jusqu'à concurrence de la somme maximale garantie ",
            {
              text:
                this.convertirEnLettres(ficheCredit.decision.montantCaution) +
                ' FRANCS CFA (' +
                ficheCredit.decision.montantCaution
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' FCFA), ',
              bold: true,
            },
            "couvrant le principal, les frais et autres accessoires par application des dispositions des articles 13 et 14 de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA); \n\n",
            'En conséquence, en cas de défaillance du Débiteur principal, ci-dessus désigné, pour quelque cause que ce soit,',
            { text: ' la Caution ', bold: true },
            "s'engage à effectuer le règlement de toutes les sommes qui pourraient lui être réclamée par le Système Financier Décentralisé, et ce, dans la limite de son engagement.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 2 - PORTEE DE L'ENGAGEMENT DE LA CAUTION\n\n",
              style: 'titre',
            },
            'Le présent cautionnement étant solidaire,',
            { text: ' la Caution ', bold: true },
            'renonce expressément et irrévocablement :\n\n',
          ],
          style: 'contenuText',
        },
        {
          ul: [
            "à tout bénéfice de discussion et de division, tant à l'égard du Débiteur principal que des autres coobligés, conformément aux dispositions des articles 27 et 28 de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA);",
            "à toutes subrogations, toutes actions personnelles ou autres qui auraient pour résultat de faire venir la Caution en concours avec CREDIT ACCESS, jusqu'à ce que le Système Financier Décentralisé soit totalement désintéressée de la totalité des sommes en principal, intérêts, commissions, frais et accessoires dues par le Débiteur principal.\n Il en sera de même, lorsque la Caution se sera libérée partiellement ou totalement de ses obligations et quand bien même le présent engagement serait d'un montant inférieur aux sommes dues par le Débiteur principal au Système Financier Décentralisé.",
            "à se prévaloir des dispositions de l'article 23 alinéa 3 de l'Acte uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA) relatif à la prorogation du terme accordée au Débiteur principal par le Système Financier Décentralisé.\n\n Partant, si le Débiteur principal obtient une prorogation de délais de CREDIT ACCESS, les sommes qui restent tenues, ne pourront poursuivre le Débiteur principal avant l'expiration de ces délais.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 - ENGAGEMENT DU SYSTEME FINANCIER DECENTRALISE\n\n',
              style: 'titre',
            },
            "Le Système Financier Décentralisé est tenu d'aviser",
            { text: ' la Caution ', bold: true },
            'de toute déchéance ou prorogation de terme accordée au Débiteur principal, ainsi que toute défaillance de ce dernier en indiquant le montant restant dû par le Débiteur principal, en principal, intérêts, frais et autres accessoires au moment de la défaillance.\n\n',
            "En application des dispositions de l'article 24 de l'Acte Uniforme susvisé, le Système Financier Décentralisé ne pourra poursuivre",
            { text: ' la Caution ', bold: true },
            "qu'après une mise en demeure de payer adressée au Débiteur principal, restée sans effet.\n\n",
            "En outre, conformément aux dispositions de l'article 25 de l'Acte Uniforme portant organisation des sûretés,  le Système Financier Décentralisé s'oblige dans le mois qui suit le terme de chaque semestre civil à compter de la signature de la présente convention, à communiquer à",
            { text: ' la Caution ', bold: true },
            "un état des dettes du Débiteur principal précisant leurs causes , leurs échéances et leurs montants en principal, intérêts et autres accessoires restant dus à la fin du semestre écoulé, en leur rappelant la faculté de révocation par reproduction littérale des dispositions de l'article 19 de l'Acte Uniforme susvisé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 - REVOCATION DE LA CAUTION\n\n',
              style: 'titre',
            },
            "Le présent cautionnement subsistera dans son intégralité jusqu'à révocation dûment notifiée par",
            { text: ' la Caution ', bold: true },
            'au Système Financier Décentralisé. Cette révocation pourra être notifiée à tout moment, et sera faite par lettre recommandée avec accusé de réception adressée au Système Financier Décentralisé, à son siège social sus indiqué.\n\n',
            'Toutefois',
            { text: ' la Caution ', bold: true },
            "ou toute personne venant à ses droits et obligations, ne sera déchargée des effets de sa garantie que par le paiement effectif des sommes dues à CREDIT ACCESS pour toutes les obligations dont l'origine sera antérieure à la date de réception de l'avis de révocation par le Système Financier Décentralisé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 - INDIVISIBILITE\n\n',
              style: 'titre',
            },
            'Au cas où ',
            { text: ' la Caution ', bold: true },
            'viendrait à décéder avant entière libération, il y aurait solidarité entre ses héritiers et représentant lesquels seront tenus sans division ni discussion et individuellement, au remboursement, ou le paiement de toutes les sommes qui peuvent ou qui pourront leur être dues par le Débiteur Principal en principal, intérêt, frais et accessoires sus cités et en supporteront en outre, les frais de notification à leur faire conformément à la loi 2019-573 du vingt-six juin deux mil dix-neuf relatives aux successions.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 - EXIGIBILITE\n\n',
              style: 'titre',
            },
            { text: 'La Caution ', bold: true },
            "sera tenue de s'exécuter dès que les obligations du Débiteur principal à l'égard de CREDIT ACCESS deviendront exigibles, fut-ce par anticipation, pour quelque cause que ce soit.\n\n",
            { text: 'La Caution ', bold: true },
            "s'engage, toutefois, à ne pas se prévaloir des délais de paiement qui pourraient être accordés, expressément ou tacitement, par CREDIT ACCESS au Débiteur principal.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 - AUTONOMIE DU PRESENT ENGAGEMENT\n\n',
              style: 'titre',
            },
            "La présente convention n'emporte pas novation aux droits et obligations de CREDIT ACCESS.\n\n",
            "Le cautionnement s'ajoute ou s'ajoutera à toutes garanties réelles ou personnelles qui ont pu ou pourront être données à CREDIT ACCESS par",
            { text: ' la Caution, ', bold: true },
            'le Débiteur principal ou tout tiers.\n\n',
            "Par ailleurs, les dispositions du présent engagement conserveront leur plein effet, quelle que soit l'évolution de la situation financière ou juridique au Débiteur principal.\n\n",
            "Ainsi, la modification ou la disparition des liens de fait ou de droit pouvant exister à ce jour entre le Débiteur principal et la Caution ne seront pas susceptibles d'entraîner la déchéance du présent engagement, en dehors de toute révocation dûment notifiée.",
          ],
          style: 'contenuText',
        },
        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 8 - REGLEMENT DES DIFFERENDS - LOI APPLICABLE\n\n',
        //             style: 'titre'
        //         },
        //         "Tout différend résultant de l'interprétation ou de l'exécution de la présente convention, qui n'aura pas été préalablement réglé à l'amiable, dans un délai maximum d'un (1) mois à compter de la réception par l'une des parties, de la demande d'un règlement amiable émanant de l'autre partie, sera soumis au Tribunal de Commerce d'ABIDJAN.\n\n",
        //         "La loi applicable à la présente convention est la loi Ivoirienne en ce compris les dispositions de l'Acte Uniforme portant organisation des sûretés du Traité de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA)."
        //     ],
        //     style: "contenuText"
        // },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement de la présente convention, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins de la présente convention de cautionnement solidaire.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou une partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, la présente convention n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 10 - DECLARATIONS D'ETAT CIVIL ET AUTRES\n\n",
              style: 'titre',
            },
            { text: 'La Caution ', bold: true },
            'et',
            { text: ' CREDIT ACCESS ', bold: true },
            'par son représentant, déclarent chacun en ce qui les concerne, sous les peines de droit et la foi du serment :',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nI/ LA CAUTION\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            "Exact son état civil et autre élément d'identification indiqué plus haut,",
            "Qu'il n'existe aucun empêchement, ni restriction d'ordre légal ou statutaire à la signature des présentes.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nII/LE REPRESENTANT DE CREDIT ACCESS\n\n',
              style: 'titre',
              alignment: 'center',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'Que la Société a été régulièrement constituée et que sa constitution a été publiée conformément à la loi,',
            "Qu'elle ne fait l'objet d'aucune action en nullité,",
            "Qu'elle n'est pas en état de faillite, de liquidation judiciaire ou amiable, de règlement préventif ou de cessation de paiement pour quelque cause que ce soit.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 11 - IMPOTS - FRAIS - FORMALITES\n\n',
        //             style: 'titre'
        //         },
        //         "Tous les droits, impôts, taxes, pénalités et frais auxquels donneront lieu la présente convention de cautionnement et son exécution, y compris les droits d'enregistrement en cas d'accomplissement de cette formalité, seront à la charge de", {text: " la Caution ", bold: true}, "qui s'y oblige expressément.\n\n",
        //         "Il est précisé que ces droits et frais ont été déjà payé par le débiteur principal, ", {text: ficheCredit.demande.client.nomPrenom + '.', bold: true},
        //     ],
        //     style: "contenuText"
        // },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 12 - DELIVRANCE DE GROSSE\n\n',
        //             style: 'titre'
        //         },
        //         "Les parties noms et ès qualités, requièrent expressément le Notaire soussigné de délivrer au CREANCIER une grosse des présentes pour lui servir de titre exécutoire direct contre", {text: " la CAUTION "+ caution.nom + " "+ caution.prenom +" , ", bold: true}, "en raison des sommes qui peuvent et pourront lui être dues en vertu du présent contrat."
        //     ],
        //     style: "contenuText"
        // },
        {
          text: [
            {
              text: '\n\nARTICLE 11 - ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution de la présente convention et de ses suites, il est fait élection de domicile par les parties, savoir :",
          ],
          style: 'contenuText',
        },
        {
          ul: [
            'La Caution en son domicile sus indiqué ;',
            'La Société « CREDIT ACCESS SA » en son siège social également sus indiqué ;',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            'Toutes demandes, notifications et significations seront valablement faites aux parties à leurs domiciles élus sus indiqué, sauf changement dûment notifié aux parties.\n\n',
          ],
          style: 'contenuText',
        },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 14 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
        //             style: 'titre'
        //         },
        //         "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
        //         "A défaut de règlement à l'amiable, le litige sera soumis au ", {text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true},
        //         "Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA."
        //     ],
        //     style: "contenuText",
        // },

        /** ON NOUS A DEMANDE DE RETIRER CETTE PARTIE */
        // {
        //     text: [
        //         {
        //             text: '\n\nARTICLE 15 - MENTION\n\n',
        //             style: 'titre'
        //         },
        //         "Mention des présentes est consentie pour avoir lieu partout où besoin sera.\n\n\n"
        //     ],
        //     style: "contenuText"
        // },
        {
          unbreakable: true,
          stack: [
            {
              columns: [
                {
                  text: [
                    { text: 'LA CAUTION\n', bold: true, alignment: 'right' },
                    {
                      text: "(Mention manuscrite « Bon pour caution solidaire dans les termes ci-dessus indiqués jusqu'à concurrence de la somme maximale garantie de ",
                      italics: true,
                      fontSize: 8,
                    },
                    {
                      text:
                        ficheCredit.decision.montantCaution
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA',
                      italics: true,
                      fontSize: 8,
                    },
                    {
                      text: ', incluant le principal, les intérêts, les commissions, les frais et accessoires »)',
                      italics: true,
                      fontSize: 8,
                    },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: [
                        {
                          text: 'Le Directeur Général',
                          bold: true,
                          alignment: 'right',
                          style: 'contenuText',
                        },
                      ],
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT DE PRET POUR PERSONNE PHYSIQUE
  contratDePretPersonnePhysique(logo: any, imageSignatureDirecteurGeneral: any, ficheCredit: any) {
    const typePiece =
      ficheCredit.demande.client.typePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.typePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.typePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.typePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.typePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : '';
    const objetCredit =
      ficheCredit.demande.objetCredit == '1'
        ? 'Fonds de roulement'
        : ficheCredit.demande.objetCredit == '2'
          ? 'Investissement'
          : ficheCredit.demande.objetCredit == '3'
            ? 'Fonds de roulement et Investissement'
            : '';

    const activiteClient = ficheCredit.demande.activites.find((item) => item.niveauActivite === 1);

    const calculTauxInteretParMois =
      ficheCredit.demande.typeCredit.taux / ficheCredit.decision.duree;

    const bienMobilierFamille = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'BIENS MOBILIERS DE LA FAMILLE',
    );
    const bienMaterielProfessionnel = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'MATÉRIELS PROFESSIONNELS',
    );
    const vehicule = ficheCredit.demande.typeGaranties.find((item) => item.libelle === 'VÉHICULES');
    const immobilisations = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'IMMOBILISATIONS',
    );
    this.listeGarantieBienMobilierFamille = bienMobilierFamille.garanties.filter(
      (item) => item.garantie == 1,
    );
    this.listeGarantieBienProfessionnel = bienMaterielProfessionnel.garanties.filter(
      (item) => item.garantie == 1,
    );
    this.listeGarantieVehicules = vehicule.garanties.filter((item) => item.garantie == 1);
    this.listeGarantieImmobilisations = immobilisations.garanties.filter(
      (item) => item.garantie == 1,
    );

    let montantDeposit = (ficheCredit.decision.deposit / 100) * ficheCredit.decision.montantPropose;

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONTRAT DE PRET PERSONNE PHYSIQUE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01, représentée par ",
            { text: ' Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            '\n',
            // "Nom : " , {text: ficheCredit.demande.client.nom, bold: true}, "\n",
            // "Prénom(s) : " , {text: ficheCredit.demande.client.prenom, bold: true}, "\n",
            'Date et lieu de naissance : ',
            {
              text:
                this._datePipe.transform(
                  ficheCredit.demande.client.dataNaiss,
                  'dd MMMM yyyy',
                  'fr',
                ) +
                ', ' +
                ficheCredit.demande.client.lieuNaiss +
                ' ;\n',
              bold: true,
            },
            'Nationalité : ',
            { text: ficheCredit.demande.client.nationalite.nationalite + ';\n', bold: true },
            "Pièce d'identité : ",
            { text: typePiece, bold: true },
            ', numéro ',
            { text: ficheCredit.demande.client.numPiece + ' ;\n', bold: true },
            'Domicile : ',
            {
              text:
                ficheCredit.demande.client.commune.libelle +
                ', ' +
                ficheCredit.demande.client.quartier,
              bold: true,
            },
            ficheCredit.demande.client.rue != null
              ? { text: ', ' + ficheCredit.demande.client.rue + ' ;\n', bold: true }
              : { text: ' ;\n', bold: true },
            'Profession : ',
            { text: ficheCredit.demande.client.profession + ' ;\n', bold: true },
            'Situation matrimoniale : ',
            {
              text:
                this.retourneSituationMatrimoniale(
                  ficheCredit.demande.client.situationMatri,
                  ficheCredit.demande.client.sexe,
                ) + ' ;\n',
              bold: true,
            },
            'Contact : ',
            { text: ficheCredit.demande.client.telPortable + ' ;\n', bold: true },
            'Exerçant son activité commerciale sous la dénomination de : ',
            { text: ficheCredit.demande.client.denomination + ' ;\n', bold: true },
            'Immatriculation N° : ',
            { text: ficheCredit.demande.client.rccm + ';\n', bold: true },
            // "Boite Postale: ", {text: activiteClient.boitePostale +";\n", bold: true},
            'Ci-après désigné indifféremment : ',
            { text: "« l'Emprunteur »\n\n", bold: true },
            { text: 'CREDIT ACCESS S.A. et ' + ficheCredit.demande.client.nomPrenom, bold: true },
            ', ci-après ensemble désigné(e)s ',
            { text: '« Les parties »\n\n', bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: 'Il a été arrêté et convenu ce qui suit :', alignment: 'center', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : CARACTERISTIQUES DU CREDIT\n\n',
              style: 'titre',
            },
            'Montant du crédit (en lettres) : ',
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' FCFA ,\n',
              bold: true,
            },
            'Montant du crédit (en chiffres) : ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA \n',
              bold: true,
            },
            'Objet du crédit : ',
            { text: objetCredit + ', \n', bold: true },
            'Type de crédit : ',
            { text: ficheCredit.demande.typeCredit.libelle + ', \n', bold: true },
            "Montant de l'échéance mensuelle :  ",
            {
              text:
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' F CFA , \n',
              bold: true,
            },
            'Durée du crédit : ',
            {
              text:
                ficheCredit.decision.duree.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' mois, \n',
              bold: true,
            },
            // "Taux d'intérêt : ", {text: calculTauxInteretParMois +"% par mois.", bold: true},
            "Taux d'intérêt : ",
            { text: '1.5% par mois.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : REALISATION- DEBLOCAGE DES FONDS\n\n',
              style: 'titre',
            },
            'Le montant du crédit objet des présentes sera inscrit au crédit du compte ordinaire ',
            { text: 'identifiant ' + ficheCredit.demande.client.codeClient, bold: true },
            " ouvert dans les livres de CREDIT ACCESS, au nom de l'Emprunteur. Il est à la libre disposition de l'emprunteur qui pourra l'utiliser, à tout moment, en un ou plusieurs tirages conformément à ses besoins.\n\n",
            "Toutefois, l'Emprunteur ne pourra exiger le déblocage des fonds qu'après constitution au profit du Prêteur des sûretés et garanties prévues ci-après.\n",
            "A l'effet de tenir l'Emprunteur informé de l'évolution du compte, le Prêteur lui permettra d'avoir son relevé de compte en agence.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : REMBOURSEMENT - MOBILISATION DE RESSOURCES\n\n',
              style: 'titre',
            },
            "Le remboursement en capital, intérêts, frais et accessoires de la créance de CREDIT ACCESS se réalisera par la domiciliation dans les livres de CREDIT ACCESS, des revenus générés par l'activité de l'Emprunteur.\n\n",
            "Ce remboursement s'effectuera par inscription au débit du compte de domiciliation de l'emprunteur tenu dans les livres de CREDIT ACCESS SA.\n\n",
            "Les parties conviennent que le compte ordinaire du client susmentionné est le compte de domiciliation. En conséquence, il est le seul destiné à recevoir les revenus de l'Emprunteur, et notamment toutes les sommes qui sont ou qui lui seront dues par des tiers.\n\n",
            "A compter de la date d'octroi du prêt, l'Emprunteur s'oblige à ce que ce compte soit approvisionné à terme conformément au remboursement du prêt.\n\n",
            "L'Emprunteur autorise irrévocablement le Prêteur à prélever toute somme quelconque devenue exigible sur tout compte ouvert à son nom dans ses livres.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 4 : PRINCIPE D'UNICITE DES COMPTES OUVERTS A CREDIT ACCESS\n\n",
              style: 'titre',
            },
            "L'ensemble des comptes ouverts par le client dans les livres de CREDIT ACCESS tant en son siège social que dans ses agences constituent des éléments d'un compte unique.\n\n",
            "L'Emprunteur a connaissance de ce que la présente convention d'unicité de comptes constitue une condition essentielle à l'octroi des crédits ou facilités par CREDIT ACCESS. En adhérant aux présentes, l'Emprunteur s'engage, en outre, à ne rien faire qui pourrait faire obstacle à la libre disposition par CREDIT ACCESS du solde de ses comptes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
            "Toute somme en principal, intérêts, commissions, frais et accessoires échue et restée impayée à l'échéance, de même que toute somme engagée par le Prêteur en vue de la conservation de sa créance sur l'Emprunteur, portera intérêts de plein droit, au Taux d'intérêt en vigueur de 100% l'an.\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : REMBOURSEMENTS ANTICIPES\n\n',
              style: 'titre',
            },
            "L'Emprunteur pourra se libérer par anticipation pour la totalité du capital restant dû.\n",
            "Le remboursement anticipé donnera lieu au paiement d'une pénalité appliquée sur le capital restant dû conformément au barème général en vigueur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : OBLIGATION DE MAINTENIR LA VALEUR DU PATRIMOINE ET DE NE PAS EFFECTUER CERTAINES OPERATIONS\n\n',
              style: 'titre',
            },
            "Tant que l'Emprunteur sera débiteur, en vertu des présentes, il ne pourra, et sous réserve d'accord préalable et écrit du prêteur :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Contracter aucun emprunt à moyen ou long terme relatif à l'objet du présent prêt ; ",
            'Aliéner son fonds de commerce par voie de vente, apport en société ou autrement, donner en gérance son fonds de commerce, consentir un nantissement sur ce fonds ainsi que le matériel donné en garantie du remboursement du prêt ;',
            'Aliéner ses biens donnés en garantie du remboursement du prêt.',
            "En cas d'aliénation des biens donnés en garantie du remboursement du prêt, avec l'accord du Prêteur, l'Emprunteur s'engage à reverser à CREDIT ACCESS SA tout paiement qui pourrait lui être fait directement ou indirectement par l'acquéreur ou tout tiers.  Les parties conviennent que ce remboursement interviendra dans les deux jours ouvrables suivant le paiement, et viendra en déduction de la dette de l'Emprunteur à l'égard de CREDIT ACCESS SA.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: ["Le tout à peine d'exigibilité anticipée."],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : EXIGIBILITE ANTICIPEE\n\n',
              style: 'titre',
            },
            "Le Prêteur pourra prononcer l'exigibilité immédiate du capital décaissé, des intérêts et de tous accessoires en cas de :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Déconfiture, faillite ou liquidation des biens, règlement judiciaire ou cessation de paiement de l'Emprunteur, avant le remboursement intégral du crédit susmentionné ;",
            "Non-paiement à son échéance, d'une somme due au titre du crédit ;",
            "Inexécution ou violation de l'un quelconque des engagements pris par l'Emprunteur dans le présent acte, de non-constitution des garanties prévues, ou de déclarations inexactes ;",
            "Aliénation d'une fraction importante de l'actif ou des biens données en garantie de l'Emprunteur en dehors des opérations commerciales courantes ;",
            "Non approvisionnement du compte de domiciliation prévu à l'article 6, ou solde inférieur dudit compte à ce qui est convenu ;",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            "\nSi l'une de ces hypothèses se réalisait, le Prêteur pourrait exiger le paiement de toutes les sommes à lui dues et ce, huit (08) jours après une mise en demeure adressée par simple lettre et demeurée infructueuse. Le Prêteur mentionnerait dans cet avis son intention de se prévaloir de la présente clause. Il n'aurait à remplir aucune formalité, ni à faire prononcer en justice la déchéance du terme. Le paiement ou les régularisations postérieures à l'expiration du délai de huit (08) jours ci-dessus prévus, ne feraient pas obstacle à cette exigibilité.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : GARANTIE\n\n',
              style: 'titre',
            },
            "A la sûreté et garantie du présent crédit, en principal, intérêts, frais et accessoires l'Emprunteur consent par acte séparé ou s'engage à faire affecter au profit de CREDIT ACCESS SA :\n\n",
          ],
          style: 'contenuText',
        },
        {
          type: 'square',
          ul: [
            {
              text: [
                "Un dépôt de garantie dont le montant s'élève à ",
                { text: this.convertirEnLettres(montantDeposit), bold: true },
                ' (',
                {
                  text: montantDeposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
                  bold: true,
                },
                ') de Francs CFA,\n',
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          type: 'square',
          ul: [{ text: 'Le gage des biens meubles énumérés ci-dessous :', bold: true }],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieVehicules.map((garantie) => [
            "Le gage d'un véhicule de marque " +
              garantie.marque +
              " portant l'immatriculation " +
              garantie.immatriculation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieBienMobilierFamille.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.designation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieBienProfessionnel.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.designation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },

        ficheCredit.demande.actifCirculantStock.length != 0
          ? {
              type: 'square',
              ul: [{ text: 'Le nantissement de :', bold: true }],
              style: 'contenuText',
              margin: [10, 20, 0, 0],
            }
          : '',
        {
          type: 'circle',
          ul: ficheCredit.demande.actifCirculantStock.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.description,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 20],
        },
        this.listeGarantieImmobilisations.length != 0
          ? {
              type: 'square',
              ul: this.listeGarantieImmobilisations.map((garantie) => [
                {
                  text: [
                    // "L'hypothèque d'un " + (garantie.typePropriete == 1 ? 'local :\n' : garantie.typePropriete == 2 ? 'terrain :\n' : ''),
                    "L'hypothèque d'un bien immobilier dont les caractéristiques suivent :\n",
                    'Lot N° : ',
                    { text: garantie.lot + '\n', bold: true },
                    'Ilot N° : ',
                    { text: garantie.ilot + '\n', bold: true },
                    'Superficie : ',
                    { text: garantie.superficie + '\n', bold: true },
                    'Titre foncier : ',
                    { text: garantie.titreFoncier + '\n', bold: true },
                  ],
                  style: 'contenuText',
                },
              ]),
              style: 'contenuText',
              margin: [10, 0, 0, 0],
            }
          : '',
        {
          text: [
            {
              text: '\n\nARTICLE 10 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de prêt, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de prêt.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le présent contrat de prêt n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 12 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes et de leurs suites, les parties déclarent élire domicile en leurs adresses respectives sus indiquées.\n",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    // {text: 'Le Directeur Général', bold: true, alignment: 'right', style: 'contenuText'},
                    {
                      text: [{ text: 'Le Directeur Général', bold: true, alignment: 'right' }],
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT DE PRET POUR PERSONNE MORALE
  contratDePretPersonneMorale(logo: any, imageSignatureDirecteurGeneral: any, ficheCredit: any) {
    const existenceSignataire = ficheCredit.demande.client.signataires.length != 0 ? true : false;

    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const typePiece = existenceSignataire
      ? ficheCredit.demande.client.signataires[0].codTypePiece == '1'
        ? "CARTE NATIONALE D'IDENTITE"
        : ficheCredit.demande.client.signataires[0].codTypePiece == '2'
          ? 'PASSEPORT'
          : ficheCredit.demande.client.signataires[0].codTypePiece == '3'
            ? 'CARTE CONSULAIRE'
            : ficheCredit.demande.client.signataires[0].codTypePiece == '4'
              ? 'PERMIS DE CONDUIT'
              : ficheCredit.demande.client.signataires[0].codTypePiece == '5'
                ? "ATTESTATION D'IDENTITE"
                : ''
      : '';
    const objetCredit =
      ficheCredit.demande.objetCredit == '1'
        ? 'Fonds de roulement'
        : ficheCredit.demande.objetCredit == '2'
          ? 'Investissement'
          : ficheCredit.demande.objetCredit == '3'
            ? 'Fonds de roulement et Investissement'
            : '';

    const calculTauxInteretParMois =
      ficheCredit.demande.typeCredit.taux / ficheCredit.decision.duree;

    const bienMobilierFamille = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'BIENS MOBILIERS DE LA FAMILLE',
    );
    const bienMaterielProfessionnel = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'MATÉRIELS PROFESSIONNELS',
    );
    const vehicule = ficheCredit.demande.typeGaranties.find((item) => item.libelle === 'VÉHICULES');
    const immobilisations = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'IMMOBILISATIONS',
    );
    this.listeGarantieBienMobilierFamille = bienMobilierFamille.garanties.filter(
      (item) => item.garantie == 1,
    );
    this.listeGarantieBienProfessionnel = bienMaterielProfessionnel.garanties.filter(
      (item) => item.garantie == 1,
    );
    this.listeGarantieVehicules = vehicule.garanties.filter((item) => item.garantie == 1);
    this.listeGarantieImmobilisations = immobilisations.garanties.filter(
      (item) => item.garantie == 1,
    );

    let montantDeposit = (ficheCredit.decision.deposit / 100) * ficheCredit.decision.montantPropose;

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONTRAT DE PRET PERSONNE MORALE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01, représentée par ",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            {
              text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS SA »\n\n',
              bold: true,
            },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Dénomination ou Raison sociale : ',
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            '\n',
            'Forme juridique : ',
            { text: statutJuridique, bold: true },
            '\n',
            'Immatriculation N° : ',
            { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
            '\n',
            'Compte Contribuable N° : ',
            { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
            '\n',
            'Capital social : ',
            {
              text:
                ficheCredit.demande.client.entreprise.capitalSocial
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA',
              bold: true,
            },
            '\n',
            'Siège social : ',
            {
              text:
                ficheCredit.demande.client.commune.libelle +
                ', ' +
                ficheCredit.demande.client.quartier,
              bold: true,
            },
            '\n', // + ", " + ficheCredit.demande.client.villa + ", " + ficheCredit.demande.client.lot
            'Adresse postale : ',
            { text: ficheCredit.demande.client.adresse, bold: true },
            '\n',
          ],
          style: 'contenuText',
        },

        // SIGNATAIRE
        existenceSignataire
          ? {
              text: [
                'Représentant légal : ',
                {
                  text:
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                ' Qualité',
                { text: ' GERANT\n', bold: true },
                'Né (e) le : ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateNaissance,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: ficheCredit.demande.client.signataires[0].lieuNaiss, bold: true },
                ', de nationalité ',
                {
                  text: ficheCredit.demande.client.signataires[0].nationalite.nationalite,
                  bold: true,
                },
                ' titulaire de ',
                { text: typePiece, bold: true },
                ' numéro ',
                { text: ficheCredit.demande.client.signataires[0].numPiece, bold: true },
                ' établie le ',
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateDelivrancePiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: ficheCredit.demande.client.signataires[0].lieuDelivrance, bold: true },
                " valable jusqu'au ",
                {
                  text: this._datePipe.transform(
                    ficheCredit.demande.client.signataires[0].dateExpirationPiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' domicilié à ',
                {
                  text:
                    ficheCredit.demande.client.signataires[0].commune.libelle +
                    ', ' +
                    ficheCredit.demande.client.signataires[0].quartier,
                  bold: true,
                },
                ' Contacts: ',
                { text: ficheCredit.demande.client.signataires[0].numTelephone, bold: true },
                '\n\n',
              ],
              style: 'contenuText',
            }
          : {
              text: ['\n\n'],
            },

        {
          text: [
            'Ci-après désigné indifféremment :',
            { text: " « le client » ou « l'emprunteur »\n", bold: true },
            { text: "D'AUTRE PART,\n\n", alignment: 'right', bold: true },
            { text: 'CREDIT ACCESS S.A. et ' + ficheCredit.demande.client.nomPrenom, bold: true },
            ', ci-après ensemble désigné(e)s ',
            { text: '« Les parties »\n\n', bold: true },
            { text: 'Il a été arrêté et convenu ce qui suit :', alignment: 'center', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : CARACTERISTIQUES DU CREDIT\n\n',
              style: 'titre',
            },
            'Montant du crédit (en lettres) : ',
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' FCFA ,\n',
              bold: true,
            },
            'Montant du crédit (en chiffres) : ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA \n',
              bold: true,
            },
            'Objet du crédit :',
            { text: objetCredit + ', \n', bold: true },
            'Type de crédit : ',
            { text: ficheCredit.demande.typeCredit.libelle + ', \n', bold: true },
            "Montant de l'échéance :  ",
            {
              text:
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' F CFA , \n',
              bold: true,
            },
            'Durée du crédit : ',
            {
              text:
                ficheCredit.decision.duree.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' mois, \n',
              bold: true,
            },
            // "Taux d'intérêt : ", {text: calculTauxInteretParMois +"% par mois.", bold: true},
            "Taux d'intérêt : ",
            { text: '1.5% par mois.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : REALISATION- DEBLOCAGE DES FONDS\n\n',
              style: 'titre',
            },
            'Le montant du crédit objet des présentes sera inscrit au crédit du compte ordinaire ',
            { text: 'identifiant ' + ficheCredit.demande.client.codeClient, bold: true },
            " ouvert dans les livres de CREDIT ACCESS, au nom de l'Emprunteur. Il est à la libre disposition de l'emprunteur qui pourra l'utiliser, à tout moment, en un ou plusieurs tirages conformément à ses besoins.\n\n",
            "Toutefois, l'Emprunteur ne pourra exiger le déblocage des fonds qu'après constitution au profit du Prêteur des sûretés et garanties prévues ci-après.\n",
            "A l'effet de tenir l'Emprunteur informé de l'évolution du compte, le Prêteur lui permettra d'avoir son relevé de compte en agence.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : REMBOURSEMENT - MOBILISATION DE RESSOURCES\n\n',
              style: 'titre',
            },
            "Le remboursement en capital, intérêts, frais et accessoires de la créance de CREDIT ACCESS se réalisera par la domiciliation dans les livres de CREDIT ACCESS, des revenus générés par l'activité de l'Emprunteur.\n\n",
            "Ce remboursement s'effectuera par inscription au débit du compte de domiciliation de l'emprunteur tenu dans les livres de CREDIT ACCESS SA.\n",
            "Les parties conviennent que le compte ordinaire du client susmentionné est le compte de domiciliation. En conséquence, il est le seul destiné à recevoir les revenus de l'Emprunteur, et notamment toutes les sommes qui sont ou qui lui seront dues par des tiers.\n\n",
            "A compter de la date d'octroi du prêt, l'Emprunteur s'oblige à ce que ce compte soit approvisionné à terme conformément au remboursement du prêt.\n\n",
            "L'Emprunteur autorise irrévocablement le Prêteur à prélever toute somme quelconque devenue exigible sur tout compte ouvert à son nom dans ses livres.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 4 : PRINCIPE D'UNICITE DES COMPTES OUVERTS A CREDIT ACCESS\n\n",
              style: 'titre',
            },
            "L'ensemble des comptes ouverts par le client dans les livres de CREDIT ACCESS tant en son siège social que dans ses agences constituent des éléments d'un compte unique.\n\n",
            "L'Emprunteur a connaissance de ce que la présente convention d'unicité de comptes constitue une condition essentielle à l'octroi des crédits ou facilités par CREDIT ACCESS. En adhérant aux présentes, l'Emprunteur s'engage, en outre, à ne rien faire qui pourrait faire obstacle à la libre disposition par CREDIT ACCESS du solde de ses comptes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
            "Toute somme en principal, intérêts, commissions, frais et accessoires échue et restée impayée à l'échéance, de même que toute somme engagée par le Prêteur en vue de la conservation de sa créance sur l'Emprunteur, portera intérêts de plein droit, au Taux d'intérêt en vigueur de 100% l'an.\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : REMBOURSEMENTS ANTICIPES\n\n',
              style: 'titre',
            },
            "L'Emprunteur pourra se libérer par anticipation pour la totalité du capital restant dû.\n",
            "Le remboursement anticipé donnera lieu au paiement d'une pénalité appliquée sur le capital restant dû conformément au barème général en vigueur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : OBLIGATION DE MAINTENIR LA VALEUR DU PATRIMOINE ET DE NE PAS EFFECTUER CERTAINES OPERATIONS\n\n',
              style: 'titre',
            },
            "Tant que l'Emprunteur sera débiteur, en vertu des présentes, il ne pourra, et sous réserve d'accord préalable et écrit du prêteur :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Contracter aucun emprunt à moyen ou long terme relatif à l'objet du présent prêt ; ",
            'Aliéner son fonds de commerce par voie de vente, apport en société ou autrement, donner en gérance son fonds de commerce, consentir un nantissement sur ce fonds ainsi que le matériel donné en garantie du remboursement du prêt ;',
            'Aliéner ses biens donnés en garantie du remboursement du prêt.',
            "En cas d'aliénation des biens donnés en garantie du remboursement du prêt, avec l'accord du Prêteur, l'Emprunteur s'engage à reverser à CREDIT ACCESS SA tout paiement qui pourrait lui être fait directement ou indirectement par l'acquéreur ou tout tiers.  Les parties conviennent que ce remboursement interviendra dans les deux jours ouvrables suivant le paiement, et viendra en déduction de la dette de l'Emprunteur à l'égard de CREDIT ACCESS SA.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: ["Le tout à peine d'exigibilité anticipée."],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : EXIGIBILITE ANTICIPEE\n\n',
              style: 'titre',
            },
            "Le Prêteur pourra prononcer l'exigibilité immédiate du capital décaissé, des intérêts et de tous accessoires en cas de :\n",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Déconfiture, faillite ou liquidation des biens, règlement judiciaire ou cessation de paiement de l'Emprunteur, avant le remboursement intégral du crédit susmentionné ;",
            "Non-paiement à son échéance, d'une somme due au titre du crédit ;",
            "Inexécution ou violation de l'un quelconque des engagements pris par l'Emprunteur dans le présent acte, de non-constitution des garanties prévues, ou de déclarations inexactes ;",
            "Aliénation d'une fraction importante de l'actif ou des biens données en garantie de l'Emprunteur en dehors des opérations commerciales courantes ;",
            "Non approvisionnement du compte de domiciliation prévu à l'article 6, ou solde inférieur dudit compte à ce qui est convenu ;",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            "\nSi l'une de ces hypothèses se réalisait, le Prêteur pourrait exiger le paiement de toutes les sommes à lui dues et ce, huit (08) jours après une mise en demeure adressée par simple lettre et demeurée infructueuse. Le Prêteur mentionnerait dans cet avis son intention de se prévaloir de la présente clause. Il n'aurait à remplir aucune formalité, ni à faire prononcer en justice la déchéance du terme. Le paiement ou les régularisations postérieures à l'expiration du délai de huit (08) jours ci-dessus prévus, ne feraient pas obstacle à cette exigibilité.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : GARANTIE\n\n',
              style: 'titre',
            },
            "A la sûreté et garantie du présent crédit, en principal, intérêts, frais et accessoires l'Emprunteur consent par acte séparé ou s'engage à faire affecter au profit de CREDIT ACCESS SA :\n\n",
          ],
          style: 'contenuText',
        },
        {
          type: 'square',
          ul: [
            {
              text: [
                "Un dépôt de garantie dont le montant s'élève à ",
                { text: this.convertirEnLettres(montantDeposit), bold: true },
                ' (',
                {
                  text: montantDeposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
                  bold: true,
                },
                ') de Francs CFA,\n',
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          type: 'square',
          ul: [{ text: 'Le gage des biens meubles énumérés ci-dessous :', bold: true }],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieVehicules.map((garantie) => [
            "Le gage d'un véhicule de marque " +
              garantie.marque +
              " portant l'immatriculation " +
              garantie.immatriculation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieBienMobilierFamille.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.designation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieBienProfessionnel.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.designation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        ficheCredit.demande.actifCirculantStock.length != 0
          ? {
              type: 'square',
              ul: [{ text: 'Le nantissement de :', bold: true }],
              style: 'contenuText',
              margin: [10, 20, 0, 0],
            }
          : '',
        {
          type: 'circle',
          ul: ficheCredit.demande.actifCirculantStock.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.description,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 20],
        },
        this.listeGarantieImmobilisations.length != 0
          ? {
              type: 'square',
              ul: this.listeGarantieImmobilisations.map((garantie) => [
                {
                  text: [
                    // "L'hypothèque d'un " + (garantie.typePropriete == 1 ? 'local :\n' : garantie.typePropriete == 2 ? 'terrain :\n' : ''),
                    "L'hypothèque d'un bien immobilier dont les caractéristiques suivent :\n",
                    'Lot N° : ',
                    { text: garantie.lot + '\n', bold: true },
                    'Ilot N° : ',
                    { text: garantie.ilot + '\n', bold: true },
                    'Superficie : ',
                    { text: garantie.superficie + '\n', bold: true },
                    'Titre foncier : ',
                    { text: garantie.titreFoncier + '\n', bold: true },
                  ],
                  style: 'contenuText',
                },
              ]),
              style: 'contenuText',
              margin: [10, 0, 0, 0],
            }
          : '',
        {
          text: [
            {
              text: '\n\nARTICLE 10 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de prêt, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de prêt.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le présent contrat prêt n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 12 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes et de leurs suites, les parties déclarent élire domicile en leurs adresses respectives sus indiquées.\n",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                    // {
                    //     text: [
                    //         {text: 'Monsieur ', style: 'contenuText'},
                    //         {text: 'ALI BADINI', bold: true},
                    //     ],
                    //     alignment: 'right'
                    // },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  ficheResumeDossierCredit(logo: any, logoUser: any, ficheCredit: any, datePipe: DatePipe) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const objetCredit =
      ficheCredit.demande.objetCredit == '1'
        ? 'Fonds de roulement'
        : ficheCredit.demande.objetCredit == '2'
          ? 'Investissement'
          : ficheCredit.demande.objetCredit == '3'
            ? 'Fonds de roulement et Investissement'
            : ficheCredit.demande.objetCredit == '4'
              ? 'Financement du pas-de-porte'
              : ficheCredit.demande.objetCredit == '5'
                ? 'Avance sur trésorerie'
                : '';

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'FICHE RESUME DEMANDE CREDIT',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          // margin: [0, 0, 0, 20]
        },
        {
          image: logoUser,
          width: 70,
          height: 70,
          alignment: 'center',
        },
        {
          text: [
            {
              text: ficheCredit.demande.client.nomPrenom + '\n',
              bold: true,
              alignment: 'center',
              fontSize: 16,
            },
            {
              text: ficheCredit.demande.client.codeClient + '\n',
              alignment: 'center',
              fontSize: 12,
            },
            {
              text:
                ficheCredit.demande.client.typeAgent != 'PP'
                  ? 'Personne morale\n\n'
                  : 'Personne physique\n\n',
              alignment: 'center',
              fontSize: 12,
            },
          ],
        },
        {
          stack: [
            {
              columns: [
                {
                  text: [
                    { text: 'N° RCCM\n ', style: 'styleCle' },
                    {
                      text: ficheCredit.demande.client.entreprise.rccm + '\n\n',
                      style: 'styleValeur',
                    },
                  ],
                },
                {
                  text: [
                    { text: 'N° CC\n ', style: 'styleCle' },
                    {
                      text: ficheCredit.demande.client.entreprise.ncc + '\n\n',
                      style: 'styleValeur',
                    },
                  ],
                },
                {
                  text: [
                    { text: 'Statut juridique\n ', style: 'styleCle' },
                    { text: statutJuridique + '\n\n', style: 'styleValeur' },
                  ],
                },
                {
                  text: [
                    { text: 'Catégorie Entreprise\n ', style: 'styleCle' },
                    { text: ficheCredit.demande.client.tpePme + '\n\n', style: 'styleValeur' },
                  ],
                },
              ],
            },

            {
              columns: [
                {
                  text: [
                    { text: 'Impôts (à jour)\n ', style: 'styleCle' },
                    {
                      text:
                        ficheCredit.demande.client.entreprise.impots == '1'
                          ? 'Oui'
                          : 'Non' + '\n\n',
                      style: 'styleValeur',
                    },
                  ],
                },
                {
                  text: [
                    { text: 'Capital\n ', style: 'styleCle' },
                    {
                      text:
                        ficheCredit.demande.client.entreprise.capitalSocial
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                      style: 'styleValeur',
                    },
                  ],
                },
                {
                  text: [
                    { text: 'Date de création\n ', style: 'styleCle' },
                    {
                      text:
                        datePipe.transform(
                          ficheCredit.demande.client.entreprise.dateCreation,
                          'dd/MM/yyyy',
                        ) + '\n\n',
                      style: 'styleValeur',
                    },
                  ],
                },
                {
                  text: [
                    { text: 'Téléphone Mobile\n ', style: 'styleCle' },
                    { text: ficheCredit.demande.client.telPortable + '\n\n', style: 'styleValeur' },
                  ],
                },
              ],
            },

            {
              columns: [
                {
                  text: [
                    { text: 'Commune\n ', style: 'styleCle' },
                    { text: ficheCredit.demande.client.commune.libelle, style: 'styleValeur' },
                  ],
                },
                {
                  text: [
                    { text: 'Quartier\n ', style: 'styleCle' },
                    { text: ficheCredit.demande.client.quartier, style: 'styleValeur' },
                  ],
                },
                {},
                {},
              ],
            },
          ],
        },
        {
          margin: [0, 15, 0, 0],
          table: {
            widths: [520],
            body: [
              [
                {
                  fillColor: '#eeeeee',
                  border: [false, false, false, false],
                  margin: [10, 10, 0, 10],
                  stack: [
                    { text: 'Informations sur la demande de crédit\n\n', bold: true, fontSize: 12 },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'Type crédit\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.demande.tirage == 0
                                  ? ficheCredit.demande.typeCredit.libelle
                                  : 'Tirage' + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Objet du crédit\n ', style: 'styleCle' },
                            { text: objetCredit + '\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          text: [
                            { text: "Secteur d'activité\n ", style: 'styleCle' },
                            {
                              text: ficheCredit.demande.typeActivite.libelle + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Montant demandé\n', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.demande.montantSollicite
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                      ],
                    },

                    {
                      columns: [
                        {
                          text: [
                            { text: 'Durée de remboursement\n', style: 'styleCle' },
                            {
                              text: ficheCredit.demande.nbreEcheanceSollicite + ' Mois\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: "Nbre d'échéances différées\n ", style: 'styleCle' },
                            {
                              text: ficheCredit.demande.nbreEcheDiffere + ' Mois\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Montant échéance souhaité\n', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.demande.montantEcheSouhaite
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {},
                      ],
                    },

                    {
                      columns: [
                        {
                          text: [
                            { text: 'Commune\n ', style: 'styleCle' },
                            {
                              text: ficheCredit.demande.client.commune.libelle,
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Quartier\n ', style: 'styleCle' },
                            { text: ficheCredit.demande.client.quartier, style: 'styleValeur' },
                          ],
                        },
                        {},
                        {},
                      ],
                    },
                  ],
                },
              ],
            ],
          },
        },
        {
          margin: [0, 15, 0, 0],
          table: {
            widths: [520],
            body: [
              [
                {
                  fillColor: '#eeeeee',
                  border: [false, false, false, false],
                  margin: [10, 10, 0, 10],
                  stack: [
                    { text: 'Informations sur la décision finale\n\n', bold: true, fontSize: 12 },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'Montant proposé\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.montantPropose
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Montant emprunté\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.montantEmprunte
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Durée\n ', style: 'styleCle' },
                            { text: ficheCredit.decision.duree + 'Mois\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          text: [
                            { text: 'Montant Echéance\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.mensualite
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                      ],
                    },

                    {
                      columns: [
                        {
                          text: [
                            { text: 'Mt emprunté pour cautions\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.montantCaution
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Montant Acte notarié\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.montantActeNotarie
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Frais de dossier\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.fraisDossier
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Commission déboursement\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.commissionDeboursement
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                      ],
                    },

                    {
                      columns: [
                        {
                          text: [
                            { text: 'Assurance décès invalidité\n ', style: 'styleCle' },
                            {
                              text:
                                ficheCredit.decision.assurDecesInvalidite
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'F CFA\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Hypothèque\n', style: 'styleCle' },
                            {
                              text: ficheCredit.decision.hypotheque == 1 ? 'Oui' : 'Non' + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Déposit\n', style: 'styleCle' },
                            { text: ficheCredit.decision.deposit + '%\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          text: [
                            { text: 'Total du déposit\n', style: 'styleCle' },
                            { text: '%\n\n', style: 'styleValeur' },
                          ],
                        },
                      ],
                    },

                    {
                      columns: [
                        {
                          text: [
                            { text: 'Taux de couverture\n', style: 'styleCle' },
                            {
                              text: ficheCredit.decision.tauxCouverture + '%\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Différé\n', style: 'styleCle' },
                            {
                              text: ficheCredit.decision.periodeGrace == 1 ? 'Oui' : 'Non' + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Nombre de mois différés\n', style: 'styleCle' },
                            {
                              text: ficheCredit.decision.nbreMoisGrace + 'Mois\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          text: [
                            { text: 'Acte notarié\n', style: 'styleCle' },
                            {
                              text: ficheCredit.decision.acteNotarie == 1 ? 'Oui' : 'Non' + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            ],
          },
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
        styleCle: {
          fontSize: 9,
        },
        styleValeur: {
          bold: true,
          fontSize: 10,
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT DE PRET RELAIS MAGASIN BUSINESS POUR PERSONNE MORALE
  contartPretRelaisBusinessMagasinPersonneMorale(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
  ) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONTRAT DE PRET PERSONNE MORALE',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'ENTRE LES SOUSSIGNÉS :\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            "Société Anonyme avec Conseil d'Administration, au capital de 2 000 000 000 FCFA, immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le numéro CI-ABJ-2003-2556, Agrément n° A.6.1.1/13-08, dont le siège social est à Abidjan Cocody, Rivera Palmeraie, Rue I166, 01 BP 12084 Abidjan 01, représentée par Monsieur",
            { text: ' ALI BADINI', bold: true },
            ', son Administrateur-Directeur Général, demeurant en cette qualité au susdit siège social,\n\n',
            'Ci-après dénommée « ',
            { text: 'CREDIT ACCESS', bold: true },
            ' » ou « ',
            { text: 'le Prêteur', bold: true },
            ' »\n\n',
            { text: "D'une part\n", alignment: 'right' },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            ', ',
            { text: statutJuridique, bold: true },
            ', au capital de ',
            {
              text:
                this.convertirEnLettres(ficheCredit.demande.client.entreprise.capitalSocial) + ' (',
            },
            {
              text:
                ficheCredit.demande.client.entreprise.capitalSocial
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA',
            },
            '), immatriculée au Registre de Commerce et du Crédit Mobilier sous le numéro ',
            { text: ficheCredit.demande.client.entreprise.rccm },
            ', dont le siège social est sis à ',
            {
              text:
                ficheCredit.demande.client.commune.libelle +
                ', ' +
                ficheCredit.demande.client.quartier,
            },
            ', ',
            { text: ficheCredit.demande.client.adresse },
            ', représentée par Madame/Monsieur ',
            {
              text:
                ficheCredit.demande.client.signataires[0].nom +
                ' ' +
                ficheCredit.demande.client.signataires[0].prenom,
              bold: true,
            },
            ', Gérant, dument habilité aux fins des présentes ;\n\n',
            'Ci-après dénommée « ',
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            ' » ou « ',
            { text: "l'Emprunteur", bold: true },
            ' »\n\n',
            {
              text:
                'CREDIT ACCESS ET ' +
                ficheCredit.demande.client.nomPrenom +
                ', CI-APRES DESIGNES ENSEMBLE « LES PARTIES » ET INDIVIDUELLEMENT « (UNE OU LA) PARTIE »\n\n',
              bold: true,
            },
          ],
          style: 'contenuText',
        },
        {
          text: [{ text: 'IL A ETE PRÉALABLEMENT EXPOSE CE QUI SUIT :\n\n', bold: true }],
          style: 'contenuText',
        },
        {
          text: [
            { text: ficheCredit.demande.client.nomPrenom },
            ' est locataire ',
            { text: ficheCredit.magasins.length > 1 ? 'de plusieurs magasins' : "d'un magasin" },
            ' appartenant à la SCI KOIRA, selon les conditions précisées ci-dessous.\n',
            { text: ficheCredit.magasins.length > 1 ? 'Pour chaque local' : 'Pour le local' },
            ", un pas-de-porte est exigé par la SCI KOIRA en contrepartie de l'accès au bien immobilier. Les caractéristiques ",
            { text: ficheCredit.magasins.length > 1 ? 'de chaque' : 'du' },
            ' magasin et le montant du pas-de-porte correspondant sont détaillés comme suit :\n\n',
          ],
          style: 'contenuText',
        },
        {
          ul: ficheCredit.magasins.map((magasin) => [
            magasin.blocCommerciale,
            {
              type: 'circle',
              ul: [
                'Localisation : ' + magasin.localisation,
                'Numéro du magasin : ' + magasin.numMagasin,
                'Pas-de-porte : ' +
                  magasin.MontantPartPorte.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                  ' (' +
                  this.convertirEnLettres(magasin.MontantPartPorte) +
                  ' F CFA)',
              ],
              style: 'contenuText',
              margin: [10, 0, 0, 20],
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            {
              text: "\n\nARTICLE 1 : VALEUR DE L'EXPOSE PREALABLE\n\n",
              style: 'titre',
            },
            "Le préambule fait partie intégrante du présent contrat. Il a pleine valeur juridique et pourra être utilisé pour l'interprétation des intentions des parties en cas de litige ou de difficulté d'interprétation.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : DESCRIPTION DU BIEN OBJET DU PRET\n\n',
              style: 'titre',
            },
            'Le prêt consenti par le Prêteur est destiné au financement du pas-de-porte ',
            {
              text:
                ficheCredit.magasins.length > 1
                  ? 'des magasins numéros :\n\n'
                  : 'du magasin numéro :\n\n',
            },
          ],
          style: 'contenuText',
        },
        {
          type: 'square',
          ul: ficheCredit.magasins.map((magasin) => [magasin.numMagasin + ',']),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            "Construit (s) sur une parcelle de terrain urbain située sur le territoire de la commune d'Adjamé, précisément au quartier Habitat Extension, appelé ",
            { text: '"Quartier Latin."\n\n', bold: true },
            'Ce magasin est loué à SOCIETE ',
            { text: ficheCredit.demande.client.nomPrenom },
            ' par la ',
            { text: 'SCI KOIRA.\n\n', bold: true },
            "Ce bien constitue l'objet principal du présent contrat et fait l'objet du nantissement prévu à l'article 7.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : OBJET DU CONTRAT\n\n',
              style: 'titre',
            },
            "Le présent contrat a pour objet de déterminer les conditions et modalités de l'octroi d'un prêt d'un montant de ",
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' (' +
                this.convertirEnLettres(ficheCredit.decision.montantEmprunte) +
                ' F CFA)',
              bold: true,
            },
            ' par CREDIT ACCESS à ',
            { text: ficheCredit.demande.client.nomPrenom },
            ', destiné exclusivement au financement du pas-de-porte portant sur ',
            {
              text:
                ficheCredit.magasins.length > 1
                  ? 'les locaux commerciaux loués par la SCI KOIRA.'
                  : 'le local commercial loué par la SCI KOIRA.',
            },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 4 : MISE A DISPOSITION DES FONDS\n\n',
              style: 'titre',
            },
            "Le Prêteur, CREDIT ACCESS SA, s'engage à mettre à la disposition de l'Emprunteur, SOCIETE ",
            { text: ficheCredit.demande.client.nomPrenom },
            ', la somme de ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' (' +
                this.convertirEnLettres(ficheCredit.decision.montantEmprunte) +
                ' F CFA)',
              bold: true,
            },
            ' conformément aux termes du contrat de bail.\n\n',
            'Cette somme sera déposée sur un compte ouvert au nom de SOCIETE ',
            { text: ficheCredit.demande.client.nomPrenom },
            ' dans les livres de CREDIT ACCESS SA.\n\n',
            'L\'Emprunteur reconnaît que le prêt est destiné exclusivement au financement du pas-de-porte du magasin loué par la SCI KOIRA, situé à commune d\'Adjamé, précisément au quartier Habitat Extension, appelé "Quartier Latin."',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 5 : TAUX D'INTERET\n\n",
              style: 'titre',
            },
            "Le prêt est consenti à un taux d'intérêt fixe de ",
            { text: '1,5% (un virgule cinq pour cent) par mois.\n', bold: true },
            'Les intérêts sont calculés mensuellement sur le capital restant dû.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : MODALITES DE REMBOURSEMENT\n\n',
              style: 'titre',
            },
            "L'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            ", s'engage à rembourser au Prêteur, CREDIT ACCESS SA, l'intégralité du capital prêté, ainsi que les intérêts calculés au taux stipulé à l'article 5, les frais et accessoires liés au présent contrat.\n\n",
            "Les remboursements seront effectués selon l'échéancier convenu, sous forme de mensualités comprenant :\n\n",
          ],
          style: 'contenuText',
        },
        {
          type: 'square',
          ul: [
            'le remboursement du capital ',
            'le paiement des intérêts ;',
            'le règlement des frais et accessoires éventuels (frais de dossier, commission de déboursement, pénalités, etc.).',
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            'Chaque mensualité sera payable à la date convenue, par virement bancaire au compte du Prêteur.\n\n',
            'Tout montant non payé à son échéance produira les intérêts et pénalités prévues au contrat.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : NANTISSEMENT DU PAS-DE-PORTE\n\n',
              style: 'titre',
            },
            "L'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            ', affecte en nantissement au profit du Prêteur, CREDIT ACCESS SA, le pas-de-porte ',
            {
              text:
                ficheCredit.magasins.length > 1
                  ? 'des locaux commerciaux loués'
                  : 'du local commercial loué',
            },
            ' par la SCI KOIRA, objet du financement par le présent prêt.\n\n',
            'Le Prêteur accepte expressément ce nantissement, qui constitue une garantie du remboursement du prêt.\n\n',
            'En cas de défaut de paiement ou de non-respect des termes du contrat, le Prêteur pourra faire valoir ses droits sur ce nantissement conformément à la législation applicable.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : FRAIS DE DOSSIER\n\n',
              style: 'titre',
            },
            "L'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            ", s'engage à verser au Prêteur, CREDIT ACCESS SA, des frais de dossier d'un montant de ",
            {
              text:
                ficheCredit.decision.fraisDossier.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' (' +
                this.convertirEnLettres(ficheCredit.decision.fraisDossier) +
                ' F CFA)',
              bold: true,
            },
            ", correspondant aux frais administratifs liés à l'étude et à la mise en place du présent prêt.\n\n",
            "Ces frais sont payables au moment de la mise à disposition des fonds et ne sont pas remboursables, quelle que soit l'issue du prêt.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : COMMISSION DE DEBOURSEMENT\n\n',
              style: 'titre',
            },
            "L'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            ", s'engage à verser au Prêteur, CREDIT ACCESS SA, une commission de déboursement d'un montant de ",
            {
              text:
                ficheCredit.decision.commissionDeboursement
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' (' +
                this.convertirEnLettres(ficheCredit.decision.commissionDeboursement) +
                ' F CFA)',
              bold: true,
            },
            ', correspondant aux frais liés à la mise à disposition effective des fonds du prêt.\n\n',
            'Cette commission sera prélevée au moment du déblocage des fonds, indépendamment des intérêts et autres frais prévus au présent contrat.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 10 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
            "En cas de retard de paiement d'une échéance, l'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            ', devra verser au Prêteur, CREDIT ACCESS SA, des intérêts de retard calculés au taux de ',
            { text: "100% (cent pour cent) l'an", bold: true },
            ' sur le montant de la somme due.\n\n',
            "Ces intérêts de retard seront exigibles de plein droit à compter du premier jour suivant la date d'échéance, sans qu'une mise en demeure préalable soit nécessaire.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : PENALITES DE RETARD\n\n',
              style: 'titre',
            },
            "En cas de retard de paiement d'une échéance, l'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            ", s'engage à verser au Prêteur, CREDIT ACCESS SA, une pénalité de retard égale à ",
            { text: "100% (cent pour cent) l'an", bold: true },
            " du montant de la mensualité due, par jour de retard, à compter du premier jour suivant la date d'échéance.\n\n",
            "Ces pénalités s'ajoutent aux intérêts dus et seront exigibles de plein droit sans nécessité d'une mise en demeure préalable.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 12 : EXIGIBILITE ANTICIPEE DU PRET\n\n',
              style: 'titre',
            },
            "Le défaut de paiement d'une seule échéance, à sa date d'exigibilité, rend de plein droit et sans formalité préalable, exigible l'intégralité des sommes restant dues au titre du prêt.\n\n",
            "En conséquence, CREDIT ACCESS SA se réserve le droit d'exiger le remboursement immédiat de la totalité du capital restant dû, ainsi que des intérêts courus et accessoires, et de poursuivre le recouvrement de sa créance par toute voie de droit, y compris le recouvrement forcé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 13 : PACTE COMMISSOIRE\n\n',
              style: 'titre',
            },
            "En cas de défaut de paiement de l'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            ", d'une seule échéance à sa date d'exigibilité, CREDIT ACCESS SA se réserve expressément le droit de demander la résiliation de plein droit après mise en demeure de payer restée infructueuse.\n\n",
            'Dans ce cas, le magasin objet du bail, loué à ',
            { text: ficheCredit.demande.client.nomPrenom },
            ", par la SCI KOIRA, fait l'objet d'un pacte commissoire au profit de CREDIT ACCESS SA.\n\n",
            "Ce pacte permet à CREDIT ACCESS SA de faire valoir ses droits et de récupérer la propriété des droits afférents au magasin, notamment le droit sur le pas-de-porte, en cas de défaillance de l'Emprunteur dans le remboursement du prêt.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 14 : REMBOURSEMENT ANTICIPE\n\n',
              style: 'titre',
            },
            "L'Emprunteur, ",
            { text: ficheCredit.demande.client.nomPrenom },
            'peut procéder au remboursement anticipé, total ou partiel, du capital restant dû à tout moment, sans pénalité ni frais supplémentaires, sauf disposition contraire prévue par la loi applicable.\n\n',
            'En cas de remboursement partiel anticipé, les mensualités futures seront recalculées en fonction du capital restant dû, sauf accord contraire entre les parties.\n\n',
            "L'Emprunteur devra notifier par écrit au Prêteur son intention de procéder à un remboursement anticipé.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 15 : ENGAGEMENTS DE L'EMPRUNTEUR\n\n",
              style: 'titre',
            },
            { text: ficheCredit.demande.client.nomPrenom },
            " s'engage à :",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Utiliser les fonds prêtés exclusivement pour le financement du pas-de-porte du magasin loué par la SCI KOIRA, conformément à l'objet du prêt ;",
            "Remettre tous documents ou informations demandés par le Prêteur relativement à la situation financière et à l'usage des fonds ;",
            'Effectuer les remboursements du prêt, intérêts, frais et accessoires conformément aux modalités et échéances prévues au présent contrat ;',
            "Ne pas aliéner, céder, ou grever le magasin, le pas-de-porte, le fonds de commerce et tous les éléments y afférents au profit d'une personne autre que le Prêteur.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            {
              text: "\n\nARTICLE 16 : PROCEDURE D'EXECUTION\n\n",
              style: 'titre',
            },
            "A défaut de paiement à une date d'exigibilité pour quelque cause que ce soit, CREDIT ACCESS pourra, après mise en demeure de payer restée infructueuse, et après un délai de huit (08) jours à compter de ladite mise en demeure, solliciter la résiliation du bail ou la relocation du magasin à un nouveau preneur susceptible de rembourser le pas-de-porte.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 17 : DECLARATION D'ETAT CIVIL ET AUTRES\n\n",
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ol: [
            'CREDIT ACCESS déclare, par son représentant ès-qualités, sous les peines de droit et la foi du serment que les renseignements la concernant figurant en tête des présentes sont exacts et complets ;',
            "L'EMPRUNTEUR déclare sous les peines de droit et la foi du serment :",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: [
            "Exact son état civil et autres éléments d'identification indiqués plus haut ;",
            "Qu'il n'est pas en état de faillite, de liquidation des biens, de règlement préventif, de cessation de paiement, de déconfiture ou d'interdiction ;",
            "Qu'il n'existe de son chef aucun obstacle, ni aucune restriction d'ordre administratif, légal, réglementaire ou contractuel, à la libre disposition de ses biens par suite de procédure tendant à le dessaisir de l'administration desdits biens.",
          ],
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          text: [
            {
              text: '\n\nARTICLE 18 : COMPETENCE JURIDICTIONNELLE - DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention sera soumis au Tribunal de Commerce d'Abidjan ou à la Juridiction Présidentielle du Tribunal de Commerce d'Abidjan.\n\n",
            'Le droit applicable à la présente convention est le droit ivoirien, et les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 19 : PRISE D'EFFET DE LA CONVENTION\n\n",
              style: 'titre',
            },
            'La Convention prend effet à la date de sa signature par les Parties.',
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },

                    {
                      text: [{ text: 'Le Directeur Général', bold: true, alignment: 'right' }],
                    },

                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT DE PRET POUR PERSONNE MORALE SOCIETE COOPERATIVE
  contratDePretPersonneMoralePourSocieteCooperative(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
  ) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'ENTREPRISE INDIVIDUELLE'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'SARL'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'SA'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'SASU'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'ASSOCIATION'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'COOPERATIVE'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'SAS'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'INFORMEL'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'SARLU'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'SCOOPS'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';
    const objetCredit =
      ficheCredit.demande.objetCredit == '1'
        ? 'Fonds de roulement'
        : ficheCredit.demande.objetCredit == '2'
          ? 'Investissement'
          : ficheCredit.demande.objetCredit == '3'
            ? 'Fonds de roulement et Investissement'
            : '';

    const bienMobilierFamille = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'BIENS MOBILIERS DE LA FAMILLE',
    );
    const bienMaterielProfessionnel = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'MATÉRIELS PROFESSIONNELS',
    );
    const vehicule = ficheCredit.demande.typeGaranties.find((item) => item.libelle === 'VÉHICULES');
    const immobilisations = ficheCredit.demande.typeGaranties.find(
      (item) => item.libelle === 'IMMOBILISATIONS',
    );
    this.listeGarantieBienMobilierFamille = bienMobilierFamille.garanties.filter(
      (item) => item.garantie == 1,
    );
    this.listeGarantieBienProfessionnel = bienMaterielProfessionnel.garanties.filter(
      (item) => item.garantie == 1,
    );
    this.listeGarantieVehicules = vehicule.garanties.filter((item) => item.garantie == 1);
    this.listeGarantieImmobilisations = immobilisations.garanties.filter(
      (item) => item.garantie == 1,
    );

    const calculTauxInteretParMois =
      ficheCredit.demande.typeCredit.taux / ficheCredit.decision.duree;

    let montantDeposit = (ficheCredit.decision.deposit / 100) * ficheCredit.decision.montantPropose;

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'CONTRAT DE PRET PERSONNE MORALE (SOCIETE COOPERATIVE)',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Entre les soussigné(e)s\n\n', bold: true },
            { text: 'CREDIT ACCESS SA, ', bold: true },
            " Système Financier Décentralisé, Société Anonyme avec conseil d'administration au capital de Deux Milliards de Francs CFA (2.000.000.000), immatriculée au Registre du Commerce et du Crédit Mobilier d'Abidjan sous le n° CI-ABJ-01-2003-B14-02556, Agrément N°A.6.1.1/13-08, dont le siège est à ABIDJAN Cocody, Riviera Palmeraie, Rue I 166, 01 Boîte Postale 12084 ABIDJAN 01, représentée par ",
            { text: 'Monsieur Ali BADINI,', bold: true },
            ' son Directeur Général, dûment habilité aux fins des présentes,\n\n',
            'Ci-après désignée indifféremment ',
            { text: '« Le Système Financier Décentralisé » ou « CREDIT ACCESS »\n\n', bold: true },
            { text: "D'UNE PART,\n", alignment: 'right', bold: true },
            { text: 'ET,\n\n', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            'Dénomination ou Raison sociale : ',
            { text: ficheCredit.demande.client.nomPrenom, bold: true },
            '\n',
            'Forme juridique : ',
            { text: statutJuridique, bold: true },
            '\n',
            'Immatriculation N° : ',
            { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
            '\n',
            'Compte Contribuable N° : ',
            { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
            '\n',
            'Capital social : ',
            {
              text:
                ficheCredit.demande.client.entreprise.capitalSocial
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA',
              bold: true,
            },
            '\n',
            'Siège social est à ',
            { text: ficheCredit.demande.client.commune.libelle, bold: true },
            ', ',
            { text: ficheCredit.demande.client.quartier, bold: true },
            ', ',
            { text: ficheCredit.demande.client.villa, bold: true },
            '\n',
            'Adresse postale : ',
            { text: ficheCredit.demande.client.adresse, bold: true },
            '\n',
          ],
          style: 'contenuText',
        },
        {
          type: 'circle',
          ul: ficheCredit.demande.client.signataires.map((signataire) => [
            {
              text: [
                'Représentant légal ',
                { text: signataire.nom + ' ' + signataire.prenom, bold: true },
                ' Qualité ',
                { text: 'PCG / PCA\n', bold: true },
                'Né (e) le ',
                {
                  text: this._datePipe.transform(signataire.dateNaissance, 'dd MMMM yyyy', 'fr'),
                  bold: true,
                },
                ' à ',
                { text: signataire.lieuNaiss, bold: true },
                ', de nationalité ',
                { text: signataire.nationalite.nationalite, bold: true },
                'titulaire de ',
                { text: this.retourneTypePiece(signataire.codTypePiece), bold: true },
                ' numéro ',
                { text: signataire.numPiece, bold: true },
                ' établie le ',
                {
                  text: this._datePipe.transform(
                    signataire.dateDelivrancePiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                ' à ',
                { text: signataire.lieuDelivrance, bold: true },
                " valable jusqu'au ",
                {
                  text: this._datePipe.transform(
                    signataire.dateExpirationPiece,
                    'dd MMMM yyyy',
                    'fr',
                  ),
                  bold: true,
                },
                '\ndomicilié à ',
                { text: signataire.commune.libelle, bold: true },
                ', ',
                { text: signataire.quartier, bold: true },
                ', ',
                { text: signataire.rue, bold: true },
                ' Contacts: ',
                { text: signataire.numTelephone, bold: true },
                '\n',
                'Agissant en vertu des Statuts et de la délégation de pouvoirs en date du ',
                {
                  text: this._datePipe.transform(signataire.dateStatut, 'dd MMMM yyyy', 'fr'),
                  bold: true,
                },
              ],
            },
          ]),
          style: 'contenuText',
          margin: [0, 10, 0, 0],
        },
        {
          text: [
            '.\n\n Ci-après désigné indifféremment :',
            { text: " « le client » ou « l'emprunteur »\n", bold: true },
            { text: "D\'AUTRE PART,\n\n", alignment: 'right', bold: true },
            { text: 'CREDIT ACCESS S.A. et ' + ficheCredit.demande.client.nomPrenom, bold: true },
            ' ci-après ensemble désigné(e)s ',
            { text: '« Les parties »\n\n', bold: true },
            { text: 'Il a été arrêté et convenu ce qui suit :', alignment: 'center', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 1 : CARACTERISTIQUES DU CREDIT\n\n',
              style: 'titre',
            },
            'Montant du crédit (en lettres) : ',
            {
              text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte) + ' FCFA ,\n',
              bold: true,
            },
            'Montant du crédit (en chiffres) : ',
            {
              text:
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F CFA \n',
              bold: true,
            },
            'Objet du crédit : ',
            { text: objetCredit + ', \n', bold: true },
            'Type de crédit : ',
            { text: ficheCredit.demande.typeCredit.libelle + ', \n', bold: true },
            "Montant de l'échéance mensuelle : ",
            {
              text:
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' F CFA , \n',
              bold: true,
            },
            'Durée du crédit : ',
            {
              text:
                ficheCredit.decision.duree.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ' mois, \n',
              bold: true,
            },
            // "Taux d'intérêt : ", {text: calculTauxInteretParMois +"% par mois.", bold: true},
            "Taux d'intérêt : ",
            { text: '1.5% par mois.', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 2 : REALISATION- DEBLOCAGE DES FONDS\n\n',
              style: 'titre',
            },
            'Le montant du crédit objet des présentes sera inscrit au crédit du compte ordinaire ',
            { text: 'identifiant ' + ficheCredit.demande.client.codeClient, bold: true },
            " ouvert dans les livres de CREDIT ACCESS, au nom de l'Emprunteur. Il est à la libre disposition de l'emprunteur qui pourra l'utiliser, à tout moment, en un ou plusieurs tirages conformément à ses besoins.\n\n",
            "Toutefois, l'Emprunteur ne pourra exiger le déblocage des fonds qu'après constitution au profit du Prêteur des sûretés et garanties prévues ci-après.\n",
            "A l'effet de tenir l'Emprunteur informé de l'évolution du compte, le Prêteur lui permettra d'avoir son relevé de compte en agence.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 3 : REMBOURSEMENT - MOBILISATION DE RESSOURCES\n\n',
              style: 'titre',
            },
            "Le remboursement en capital, intérêts, frais et accessoires de la créance de CREDIT ACCESS se réalisera par la domiciliation dans les livres de CREDIT ACCESS, des revenus générés par l'activité de l'Emprunteur.\n\n",
            "Ce remboursement s'effectuera par inscription au débit du compte de domiciliation de l'emprunteur tenu dans les livres de CREDIT ACCESS SA.\n",
            "Les parties conviennent que le compte ordinaire du client susmentionné est le compte de domiciliation. En conséquence, il est le seul destiné à recevoir les revenus de l'Emprunteur, et notamment toutes les sommes qui sont ou qui lui seront dues par des tiers.\n\n",
            "A compter de la date d'octroi du prêt, l'Emprunteur s'oblige à ce que ce compte soit approvisionné à terme conformément au remboursement du prêt.\n\n",
            "L'Emprunteur autorise irrévocablement le Prêteur à prélever toute somme quelconque devenue exigible sur tout compte ouvert à son nom dans ses livres.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "\n\nARTICLE 4 : PRINCIPE D'UNICITE DES COMPTES OUVERTS A CREDIT ACCESS\n\n",
              style: 'titre',
            },
            "L'ensemble des comptes ouverts par le client dans les livres de CREDIT ACCESS tant en son siège social que dans ses agences constituent des éléments d'un compte unique.\n\n",
            "L'Emprunteur a connaissance de ce que la présente convention d'unicité de comptes constitue une condition essentielle à l'octroi des crédits ou facilités par CREDIT ACCESS. En adhérant aux présentes, l'Emprunteur s'engage, en outre, à ne rien faire qui pourrait faire obstacle à la libre disposition par CREDIT ACCESS du solde de ses comptes.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 5 : INTERETS DE RETARD\n\n',
              style: 'titre',
            },
            "Toute somme en principal, intérêts, commissions, frais et accessoires échue et restée impayée à l'échéance, de même que toute somme engagée par le Prêteur en vue de la conservation de sa créance sur l'Emprunteur, portera intérêts de plein droit, au Taux d'intérêt en vigueur de 100% l'an.\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 6 : REMBOURSEMENTS ANTICIPES\n\n',
              style: 'titre',
            },
            "L'Emprunteur pourra se libérer par anticipation pour la totalité du capital restant dû.\n",
            "Le remboursement anticipé donnera lieu au paiement d'une pénalité appliquée sur le capital restant dû conformément au barème général en vigueur.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 7 : OBLIGATION DE MAINTENIR LA VALEUR DU PATRIMOINE ET DE NE PAS EFFECTUER CERTAINES OPERATIONS\n\n',
              style: 'titre',
            },
            "Tant que l'Emprunteur sera débiteur, en vertu des présentes, il ne pourra, et sous réserve d'accord préalable et écrit du prêteur :\n\n",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Contracter aucun emprunt à moyen ou long terme relatif à l'objet du présent prêt ; ",
            'Aliéner son fonds de commerce par voie de vente, apport en société ou autrement, donner en gérance son fonds de commerce, consentir un nantissement sur ce fonds ainsi que le matériel donné en garantie du remboursement du prêt ;',
            'Aliéner ses biens donnés en garantie du remboursement du prêt.',
            "En cas d'aliénation des biens donnés en garantie du remboursement du prêt, avec l'accord du Prêteur, l'Emprunteur s'engage à reverser à CREDIT ACCESS SA tout paiement qui pourrait lui être fait directement ou indirectement par l'acquéreur ou tout tiers.  Les parties conviennent que ce remboursement interviendra dans les deux jours ouvrables suivant le paiement, et viendra en déduction de la dette de l'Emprunteur à l'égard de CREDIT ACCESS SA.",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: ["Le tout à peine d'exigibilité anticipée."],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 8 : EXIGIBILITE ANTICIPEE\n\n',
              style: 'titre',
            },
            "Le Prêteur pourra prononcer l'exigibilité immédiate du capital décaissé, des intérêts et de tous accessoires en cas de :\n\n",
          ],
          style: 'contenuText',
        },
        {
          ol: [
            "Déconfiture, faillite ou liquidation des biens, règlement judiciaire ou cessation de paiement de l'Emprunteur, avant le remboursement intégral du crédit susmentionné ;",
            "Non-paiement à son échéance, d'une somme due au titre du crédit ;",
            "Inexécution ou violation de l'un quelconque des engagements pris par l'Emprunteur dans le présent acte, de non-constitution des garanties prévues, ou de déclarations inexactes ;",
            "Aliénation d'une fraction importante de l'actif ou des biens données en garantie de l'Emprunteur en dehors des opérations commerciales courantes ;",
            "Non approvisionnement du compte de domiciliation prévu à l'article 6, ou solde inférieur dudit compte à ce qui est convenu ;",
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          text: [
            "\nSi l'une de ces hypothèses se réalisait, le Prêteur pourrait exiger le paiement de toutes les sommes à lui dues et ce, huit (08) jours après une mise en demeure adressée par simple lettre et demeurée infructueuse. Le Prêteur mentionnerait dans cet avis son intention de se prévaloir de la présente clause. Il n'aurait à remplir aucune formalité, ni à faire prononcer en justice la déchéance du terme. Le paiement ou les régularisations postérieures à l'expiration du délai de huit (08) jours ci-dessus prévus, ne feraient pas obstacle à cette exigibilité.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 9 : GARANTIE\n\n',
              style: 'titre',
            },
            "A la sûreté et garantie du présent crédit, en principal, intérêts, frais et accessoires l'Emprunteur consent par acte séparé ou s'engage à faire affecter au profit de CREDIT ACCESS SA :\n\n",
          ],
          style: 'contenuText',
        },
        {
          type: 'square',
          ul: [
            {
              text: [
                "Un dépôt de garantie dont le montant s'élève à ",
                { text: this.convertirEnLettres(montantDeposit), bold: true },
                ' (',
                {
                  text: montantDeposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
                  bold: true,
                },
                ') de Francs CFA,\n',
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          type: 'square',
          ul: [{ text: 'Le gage des biens meubles énumérés ci-dessous :', bold: true }],
          style: 'contenuText',
          margin: [10, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieVehicules.map((garantie) => [
            "Le gage d'un véhicule de marque " +
              garantie.marque +
              " portant l'immatriculation " +
              garantie.immatriculation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieBienMobilierFamille.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.designation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        {
          type: 'circle',
          ul: this.listeGarantieBienProfessionnel.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.designation,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 0],
        },
        ficheCredit.demande.actifCirculantStock.length != 0
          ? {
              type: 'square',
              ul: [{ text: 'Le nantissement de :', bold: true }],
              style: 'contenuText',
              margin: [10, 20, 0, 0],
            }
          : '',
        {
          type: 'circle',
          ul: ficheCredit.demande.actifCirculantStock.map((garantie) => [
            '(' + garantie.quantite + ') ' + garantie.description,
          ]),
          style: 'contenuText',
          margin: [20, 0, 0, 20],
        },
        this.listeGarantieImmobilisations.length != 0
          ? {
              type: 'square',
              ul: this.listeGarantieImmobilisations.map((garantie) => [
                {
                  text: [
                    // "L'hypothèque d'un " + (garantie.typePropriete == 1 ? 'local :\n' : garantie.typePropriete == 2 ? 'terrain :\n' : ''),
                    "L'hypothèque d'un bien immobilier dont les caractéristiques suivent :\n",
                    'Lot N° : ',
                    { text: garantie.lot + '\n', bold: true },
                    'Ilot N° : ',
                    { text: garantie.ilot + '\n', bold: true },
                    'Superficie : ',
                    { text: garantie.superficie + '\n', bold: true },
                    'Titre foncier : ',
                    { text: garantie.titreFoncier + '\n', bold: true },
                  ],
                  style: 'contenuText',
                },
              ]),
              style: 'contenuText',
              margin: [10, 0, 0, 0],
            }
          : '',
        {
          text: [
            {
              text: '\n\nARTICLE 10 : DONNEES A CARACTERE PERSONNEL\n\n',
              style: 'titre',
            },
            "Conformément aux dispositions de la loi N°2013-450 du 19 juin 2013 sur les données à caractères personnel et pour les besoins du présent contrat, le Cocontractant autorise le Système Financier Décentralisé à collecter les données à caractères personnel le concernant, à les conserver et les utiliser pour ses besoins personnels d'identification, en vue de l'enregistrement du présent contrat de prêt, étant entendu que lesdites données pourront être communiquées ou utilisées dans les rapports avec les différentes autorités notamment administratives, judiciaires et fiscales. Elles pourront également être communiquées à des prestataires, sous-traitants et/ou intervenants extérieurs tels la BCEAO, la Commission Bancaire, les commissaires aux comptes de la Banque, des auditeurs, et tous autres intervenants, à la demande du Système Financier Décentralisé.\n\n",
            "Il s'agit essentiellement notamment des Nom et prénom(s), des date et lieu de naissance, de l'adresse postale et/ou e-mail, de l'adresse géographique (ville ou quartier de résidence), des numéros de téléphone, de l'activité professionnelle et des éléments patrimoniaux.\n\n",
            "Le Système Financier Décentralisé s'engage à n'utiliser les informations et/ou données concernant le Cocontractant qu'aux seules fins et pour les besoins du présent contrat de prêt.\n\n",
            "Le Système Financier Décentralisé s'interdit formellement de divulguer, céder, transférer, ou communiquer tout ou partie de ces informations et/ou données à caractère personnel concernant le Cocontractant à des tiers sauf dans le cadre de l'accomplissement des formalités d'ordre légal, fiscal, administratif et/ou judiciaire, le présent contrat de prêt n'entraînant aucun transfert de propriété desdites informations et/ou données qui restent donc la propriété exclusive du Cocontractant.",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 11 : REGLEMENT DES DIFFERENDS- DROIT APPLICABLE\n\n',
              style: 'titre',
            },
            "Tout litige résultant de l'interprétation ou de l'exécution de la présente convention devra, au préalable, faire l'objet d'un règlement à l'amiable.\n\n",
            "A défaut de règlement à l'amiable, le litige sera soumis au ",
            { text: "TRIBUNAL DE COMMERCE D'ABIDJAN.\n\n", bold: true },
            'Le droit applicable à la présente convention est le droit ivoirien, en ce compris les dispositions des Actes Uniformes pris en application du Traité OHADA.',
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: '\n\nARTICLE 12 : ELECTION DE DOMICILE\n\n',
              style: 'titre',
            },
            "Pour l'exécution des présentes et de leurs suites, les parties déclarent élire domicile en leurs adresses respectives sus indiquées.\n",
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    // {
                    //     text: [
                    //         {text: 'Monsieur ', style: 'contenuText'},
                    //         {text: 'ALI BADINI', bold: true},
                    //     ],
                    //     alignment: 'right'
                    // },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText', alignment: 'right' },
                        { text: 'ALI BADINI', bold: true, alignment: 'right' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  // CONTRAT D'ENGAGEMENT DE REGLEMENT POUR PERSONNE MORALE
  montantTotalLoyerMagasin: number = 0;
  montantTotalPasDePorteMagasin: number = 0;
  montantTotalLoyerMagasinPlusEcheance: number = 0;
  contartEngagementReglementPretRelaisBusinessMagasinPersonneMorale(
    logo: any,
    imageSignatureDirecteurGeneral: any,
    ficheCredit: any,
  ) {
    const statutJuridique =
      ficheCredit.demande.client.entreprise.statutJuridique == '1'
        ? 'Entreprise individuelle'
        : ficheCredit.demande.client.entreprise.statutJuridique == '2'
          ? 'Société à Responsabilité Limitée (SARL)'
          : ficheCredit.demande.client.entreprise.statutJuridique == '3'
            ? 'Société anonyme (SA)'
            : ficheCredit.demande.client.entreprise.statutJuridique == '4'
              ? 'Société par Actions Simplifiée Unipersonnelle (SASU)'
              : ficheCredit.demande.client.entreprise.statutJuridique == '5'
                ? 'Association'
                : ficheCredit.demande.client.entreprise.statutJuridique == '6'
                  ? 'Coopérative'
                  : ficheCredit.demande.client.entreprise.statutJuridique == '7'
                    ? 'Société par Actions Simplifiée (SAS)'
                    : ficheCredit.demande.client.entreprise.statutJuridique == '8'
                      ? 'Informel'
                      : ficheCredit.demande.client.entreprise.statutJuridique == '9'
                        ? 'Société à Responsabilité Limitée Unipersonnelle (SARLU)'
                        : ficheCredit.demande.client.entreprise.statutJuridique == '10'
                          ? 'Société coopérative simplifiée (SCOOPS)'
                          : ficheCredit.demande.client.entreprise.statutJuridique == '11'
                            ? 'COOP-CA'
                            : '';

    const montantTotalLoyer = this.calculMontantTotalLoyerEtPasDePorte(
      ficheCredit.magasins,
      ficheCredit,
    );

    let docDefinition = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            {
              alignment: 'justify',
              columns: [
                {
                  image: logo,
                  width: 90,
                  height: 90,
                },
                {
                  style: 'pageAccueil',
                  table: {
                    widths: [360],
                    body: [
                      [
                        {
                          text: 'ENGAGEMENT DE REGLEMENT',
                          style: 'pageAccueilText',
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'LES SOUSSIGNE(E)S :\n\n', bold: true },
            {
              text: 'La Société dénommée « ' + ficheCredit.demande.client.nomPrenom + ' », ',
              bold: true,
            },
            statutJuridique + ', au capital de ',
            {
              text: this.convertirEnLettres(ficheCredit.demande.client.entreprise.capitalSocial),
              bold: true,
            },
            ' de Francs CFA (' +
              ficheCredit.demande.client.entreprise.capitalSocial
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
              'F CFA), dont le siège social est à ' +
              ficheCredit.demande.client.commune.libelle +
              ', ' +
              ficheCredit.demande.client.quartier +
              ', et immatriculée au Registre de Commerce et du Crédit Mobilier sous le numéro ',
            { text: ficheCredit.demande.client.entreprise.rccm, bold: true },
            ' et déclaré sous le numéro de compte contribuable ',
            { text: ficheCredit.demande.client.entreprise.ncc, bold: true },
            ';\n\n',
            'Représentée par:\n\n',
            'M/Mme ',
            {
              text:
                ficheCredit.demande.client.signataires[0].nom +
                ' ' +
                ficheCredit.demande.client.signataires[0].prenom,
              bold: true,
            },
            ' Gérant de ladite Société, demeurant à ',
            { text: ficheCredit.demande.client.signataires[0].commune.libelle, bold: true },
            ', ',
            { text: ficheCredit.demande.client.signataires[0].quartier, bold: true },
            ', Né le ',
            {
              text: this._datePipe.transform(
                ficheCredit.demande.client.signataires[0].dateNaissance,
                'dd MMMM yyyy',
                'fr',
              ),
              bold: true,
            },
            ' à ',
            { text: ficheCredit.demande.client.signataires[0].lieuNaiss, bold: true },
            ', (',
            {
              text: this.retourneSituationMatrimonialeCaution(
                ficheCredit.demande.client.signataires[0].situationMatri,
                ficheCredit.demande.client.signataires[0].sexe,
              ),
              bold: true,
            },
            '),\n',
            'De nationalité ',
            { text: ficheCredit.demande.client.signataires[0].nationalite.nationalite, bold: true },
            ", Titulaire de la Carte Nationale d'Identité numéro ",
            { text: ficheCredit.demande.client.signataires[0].numPiece, bold: true },
            ' établie le ',
            {
              text: this._datePipe.transform(
                ficheCredit.demande.client.signataires[0].dateDelivrancePiece,
                'dd MMMM yyyy',
                'fr',
              ),
              bold: true,
            },
            " et valable jusqu'au ",
            {
              text: this._datePipe.transform(
                ficheCredit.demande.client.signataires[0].dateExpirationPiece,
                'dd MMMM yyyy',
                'fr',
              ),
              bold: true,
            },
            '\n\nCi-après désigné « ',
            { text: 'le Client', bold: true },
            ' »,\n\n',
            { text: "D'une part;\n\n", alignment: 'right', bold: true },
            { text: 'ET\n\n', bold: true },
            { text: 'CREDIT ACCESS,', bold: true },
            "Système Financier Décentralisé, Société Anonyme avec Conseil d'Administration, au capital de 2 000 000 000 FCFA, immatriculée au RCCM d'Abidjan sous le numéro CI-ABJ-01-2003-B14-02556, titulaire de l'Agrément n°A.6.1.1/13-08, dont le siège social est à Abidjan Cocody, Rivera Palmeraie, Rue I166, 01 BP 12084 Abidjan 01, représentée par Monsieur ",
            { text: 'ALI BADINI,', bold: true },
            ' son Administrateur-Directeur Général, demeurant en cette qualité au susdit siège social,\n\n',
            'Ci-après désigné « ',
            { text: "l'Institution Financière", bold: true },
            ' »,\n\n',
            { text: "D'autre part;\n\n", alignment: 'right', bold: true },
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: 'ENSEMBLE ET CONJOINTEMENT DESIGNES « LES PARTIES »\n\n',
              alignment: 'center',
              style: 'titre',
            },
            {
              text: 'RAPPELLENT QUE :\n\n',
              alignment: 'center',
              style: 'titre',
            },
            {
              text:
                'M/Mme ' +
                ficheCredit.demande.client.signataires[0].nom +
                ' ' +
                ficheCredit.demande.client.signataires[0].prenom,
              bold: true,
            },
            ', a pris en location entre les mains de la Société Anonyme KOIRA BTP qui a accepté, avec toutes les garanties de fait et de droit : ',
          ],
          style: 'contenuText',
        },
        {
          ul: ficheCredit.magasins.map((magasin) => [
            {
              text: [
                'Le magasin numéro ',
                { text: magasin.numMagasin, bold: true },
                ', Bloc commercial ',
                { text: magasin.blocCommerciale, bold: true },
                ', étage ',
                { text: magasin.etage, bold: true },
                ', sis à Adjamé précisément au quartier Habitat Extension, pour un loyer mensuel de ',
                {
                  text:
                    this.convertirEnLettres(magasin.montantLoyer) +
                    ' (' +
                    magasin.montantLoyer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                    ') de Francs CFA.',
                  bold: true,
                },
              ],
              style: 'contenuText',
            },
          ]),
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            'Pour le paiement du pas-de-porte, ',
            {
              text:
                'M/Mme ' +
                ficheCredit.demande.client.signataires[0].nom +
                ' ' +
                ficheCredit.demande.client.signataires[0].prenom,
              bold: true,
            },
            ' a sollicité de CREDIT A CCESS un financement à hauteur de ',
            { text: this.convertirEnLettres(ficheCredit.decision.montantEmprunte), bold: true },
            {
              text:
                '(' +
                ficheCredit.decision.montantEmprunte
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') FCFA',
              bold: true,
            },
            " qu'il s'engage à rembourser, à raison d'un paiement de ",
            { text: this.convertirEnLettres(ficheCredit.decision.mensualite), bold: true },
            {
              text:
                '(' +
                ficheCredit.decision.mensualite.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ')',
              bold: true,
            },
            ' de Francs CFA, par mois.\n',
            "Par acte séparé, le Bailleur a conféré tout pouvoir à l'Institution Financière à l'effet de recouvrer, pour lui, le loyer mensuel convenu ; ce qui revient au paiement par le Client de la somme totale mensuelle de ",
            {
              text: this.convertirEnLettres(this.montantTotalLoyerMagasinPlusEcheance),
              bold: true,
            },
            {
              text:
                '(' +
                this.montantTotalLoyerMagasinPlusEcheance
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                ') Francs CFA',
              bold: true,
            },
            " (incluant l'échéance mensuelle de remboursement du pas-de-porte et le loyer mensuel).\n\n",
          ],
          style: 'contenuText',
        },
        {
          text: [
            {
              text: "PAR CONSEQUENT, S'ENGAGENT A CE QUI SUIT :\n\n",
              alignment: 'center',
              style: 'titre',
            },
          ],
          style: 'contenuText',
        },
        {
          ul: [
            {
              text: [
                {
                  text:
                    'M/Mme ' +
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                ' reconnait avoir bénéficié du financement de CREDIT ACCESS pour le règlement de la somme de ',
                { text: this.convertirEnLettres(this.montantTotalPasDePorteMagasin), bold: true },
                {
                  text:
                    '(' +
                    this.montantTotalPasDePorteMagasin
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                    ') Francs CFA',
                  bold: true,
                },
                ', représentant le pas-de-porte afférent au(x) magasin(s) à lui/elle loué par KOIRA BTP SA.',
              ],
              style: 'contenuText',
            },
            {
              text: [
                {
                  text:
                    'M/Mme ' +
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                " s'engage à approvisionner régulièrement son compte ouvert dans les livres de CREDIT ACCESS d'un montant mensuel de ",
                {
                  text: this.convertirEnLettres(this.montantTotalLoyerMagasinPlusEcheance),
                  bold: true,
                },
                {
                  text:
                    '(' +
                    this.montantTotalLoyerMagasinPlusEcheance
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                    ') Francs CFA',
                  bold: true,
                },
                ", au plus tard le (05) de chaque mois, en vue de mettre l'Institution Financière à mesure de prélever, outre l'échéance de remboursement du prêt, le loyer revenant à KOIRA BTP SA, dans le délai du 10 de chaque mois.",
              ],
              style: 'contenuText',
            },
            {
              text: [
                {
                  text:
                    'M/Mme ' +
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                ' autorise CREDIT ACCESS à virer, chaque mois, la somme de ',
                { text: this.convertirEnLettres(this.montantTotalLoyerMagasin), bold: true },
                {
                  text:
                    '(' +
                    this.montantTotalLoyerMagasin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') +
                    ') Francs CFA',
                  bold: true,
                },
                ' au profit de KOIRA BTP SA, en paiement du loyer convenu.',
              ],
              style: 'contenuText',
            },
            {
              text: [
                {
                  text:
                    'M/Mme ' +
                    ficheCredit.demande.client.signataires[0].nom +
                    ' ' +
                    ficheCredit.demande.client.signataires[0].prenom,
                  bold: true,
                },
                " s'interdit d'effectuer directement tout règlement de loyers entre les mains de KOIRA BTP SA",
              ],
              style: 'contenuText',
            },
          ],
          style: 'contenuText',
          margin: [10, 0, 0, 20],
        },
        {
          text: [
            'En foi de quoi, le présent engagement de règlement est signé conjointement par les parties, pour servir et valoir ce que de droit.\n\n',
          ],
          style: 'contenuText',
        },
        {
          unbreakable: true,
          stack: [
            {
              text: `Fait à Abidjan le: ${new Date().toLocaleString()} \n En deux (02) exemplaires.\n\n`,
              alignment: 'right',
              style: 'contenuText',
              margin: [0, 20, 0, 0],
            },
            {
              columns: [
                {
                  text: [
                    { text: "Pour l'Emprunteur\n", bold: true },
                    {
                      text: 'Faire précéder la signature de la mention',
                      italics: true,
                      fontSize: 8,
                    },
                    { text: '« lu et approuvé »', bold: true, italics: true, fontSize: 8 },
                  ],
                  style: 'contenuText',
                },
                {
                  stack: [
                    { text: 'CREDIT ACCESS', bold: true, alignment: 'right', style: 'contenuText' },
                    {
                      image: imageSignatureDirecteurGeneral,
                      width: 160,
                      height: 80,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                    {
                      text: 'Le Directeur Général',
                      bold: true,
                      alignment: 'right',
                      style: 'contenuText',
                    },
                    {
                      text: [
                        { text: 'Monsieur ', style: 'contenuText' },
                        { text: 'ALI BADINI', bold: true },
                      ],
                      alignment: 'right',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      styles: {
        pageAccueil: {
          alignment: 'center',
          margin: [50, 10, 0, 50],
        },
        pageAccueilText: {
          margin: [10, 20, 10, 20],
          fontSize: 18,
          bold: true,
          // alignment: 'center'
        },
        titre: {
          bold: true,
          decoration: 'underline',
        },
        contenuText: {
          fontSize: 11,
          alignment: 'justify',
        },
      },
      defaultStyle: {
        font: 'Montserrat',
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  retourneTypePiece(typePiece): string {
    return typePiece == '1'
      ? "CARTE NATIONALE D'IDENTITE"
      : typePiece == '2'
        ? 'PASSEPORT'
        : typePiece == '3'
          ? 'CARTE CONSULAIRE'
          : typePiece == '4'
            ? 'PERMIS DE CONDUIT'
            : typePiece == '5'
              ? "ATTESTATION D'IDENTITE"
              : '';
  }

  unites = [
    '',
    'Un',
    'Deux',
    'Trois',
    'Quatre',
    'Cinq',
    'Six',
    'Sept',
    'Huit',
    'Neuf',
    'Dix',
    'Onze',
    'Douze',
    'Treize',
    'Quatorze',
    'Quinze',
    'Seize',
  ];
  centaine = [
    '',
    '',
    'Deux',
    'Trois',
    'Quatre',
    'Cinq',
    'Six',
    'Sept',
    'Huit',
    'Neuf',
    'Dix',
    'Onze',
    'Douze',
    'Treize',
    'Quatorze',
    'Quinze',
    'Seize',
  ];
  dizaines = [
    '',
    'Dix',
    'Vingt',
    'Trente',
    'Quarante',
    'Cinquante',
    'Soixante',
    'Soixante-Dix',
    'Quatre-Vingt',
    'Quatre-vingt-Dix',
  ];

  convertirEnLettres(montant: number): string {
    return this.NumberToLetter(montant);
  }

  convertirEnLettresOLD(montant: number): string {
    if (montant === 0) {
      return 'Zéro';
    }

    if (montant < 0) {
      return 'Veuillez entrer un montant positif.';
    }

    return this.convertirPartieEntiereEnLettres(Math.floor(montant));
  }

  calculMontantTotalLoyerEtPasDePorte(listeMagasin: any[], ficheCredit: any): number {
    var montantCalculer = 0;
    this.montantTotalLoyerMagasin = 0;
    this.montantTotalPasDePorteMagasin = 0;
    this.montantTotalLoyerMagasinPlusEcheance = 0;
    for (let magasin of listeMagasin) {
      this.montantTotalLoyerMagasin = this.montantTotalLoyerMagasin + magasin.montantLoyer;
      this.montantTotalPasDePorteMagasin =
        this.montantTotalPasDePorteMagasin + magasin.MontantPartPorte;
    }
    montantCalculer = this.montantTotalLoyerMagasin;
    this.montantTotalLoyerMagasinPlusEcheance =
      this.montantTotalLoyerMagasin + ficheCredit.decision.mensualite;
    return montantCalculer;
  }

  convertirPartieEntiereEnLettres(partieEntiere: number): string {
    if (partieEntiere < 20) {
      return this.unites[partieEntiere];
    } else if (partieEntiere < 100) {
      const dizaine = Math.floor(partieEntiere / 10);
      const unite = partieEntiere % 10;
      return this.dizaines[dizaine] + (unite !== 0 ? '-' + this.unites[unite] : '');
    } else if (partieEntiere < 1000) {
      const centaine = Math.floor(partieEntiere / 100);
      const reste = partieEntiere % 100;
      return (
        this.centaine[centaine] +
        (centaine > 0 ? ' Cent' : '') +
        (reste !== 0 ? ' ' + this.convertirPartieEntiereEnLettres(reste) : '')
      );
    } else if (partieEntiere < 1000000) {
      const millier = Math.floor(partieEntiere / 1000);
      const reste = partieEntiere % 1000;
      return (
        this.convertirPartieEntiereEnLettres(millier) +
        ' Mille' +
        (reste !== 0 && millier > 0 ? ' ' : '') + // Nouvelle condition
        this.convertirPartieEntiereEnLettres(reste)
      );
    } else if (partieEntiere < 1000000000) {
      const million = Math.floor(partieEntiere / 1000000);
      const reste = partieEntiere % 1000000;
      return (
        this.convertirPartieEntiereEnLettres(million) +
        ' Million' +
        (million > 1 ? 's' : '') +
        (reste !== 0 ? ' ' + this.convertirPartieEntiereEnLettres(reste) : '')
      );
    } else {
      return 'Montant trop élevé pour la conversion.';
    }
  }

  retourneTerrainOuLocalPourImmobilisation(type: any): string {
    if (type == 1) {
      return 'Local';
    } else {
      return 'Terrain';
    }
  }

  retourneSituationMatrimoniale(situationMatri: any, sexe: any): string {
    if (situationMatri == '1') {
      return 'Célibataire';
    }

    if (situationMatri == '2') {
      return 'Concubinage';
    }

    if (situationMatri == '3' && sexe == '1') {
      return 'Mariée';
    }
    if (situationMatri == '3' && sexe == '2') {
      return 'Marié';
    }

    if (situationMatri == '4') {
      return 'Divorcé';
    }

    if (situationMatri == '5' && sexe == '1') {
      return 'Veuve';
    }
    if (situationMatri == '5' && sexe == '2') {
      return 'Veuf';
    }
  }

  retourneSituationMatrimonialeCaution(situationMatri: any, genre: any): string {
    if (situationMatri == '1') {
      return 'Célibataire';
    }

    if (situationMatri == '2') {
      return 'Concubinage';
    }

    if (situationMatri == '3' && genre == 'Feminin') {
      return 'Mariée';
    }
    if (situationMatri == '3' && genre == 'Masculin') {
      return 'Marié';
    }

    if (situationMatri == '4') {
      return 'Divorcé';
    }

    if (situationMatri == '5' && genre == 'Feminin') {
      return 'Veuve';
    }
    if (situationMatri == '5' && genre == 'Masculin') {
      return 'Veuf';
    }
  }

  Unite(nombre) {
    var unite;
    switch (nombre) {
      case 0:
        unite = 'zéro';
        break;
      case 1:
        unite = 'un';
        break;
      case 2:
        unite = 'deux';
        break;
      case 3:
        unite = 'trois';
        break;
      case 4:
        unite = 'quatre';
        break;
      case 5:
        unite = 'cinq';
        break;
      case 6:
        unite = 'six';
        break;
      case 7:
        unite = 'sept';
        break;
      case 8:
        unite = 'huit';
        break;
      case 9:
        unite = 'neuf';
        break;
    } //fin switch
    return unite;
  }

  Dizaine(nombre) {
    var dizaine;
    switch (nombre) {
      case 10:
        dizaine = 'dix';
        break;
      case 11:
        dizaine = 'onze';
        break;
      case 12:
        dizaine = 'douze';
        break;
      case 13:
        dizaine = 'treize';
        break;
      case 14:
        dizaine = 'quatorze';
        break;
      case 15:
        dizaine = 'quinze';
        break;
      case 16:
        dizaine = 'seize';
        break;
      case 17:
        dizaine = 'dix-sept';
        break;
      case 18:
        dizaine = 'dix-huit';
        break;
      case 19:
        dizaine = 'dix-neuf';
        break;
      case 20:
        dizaine = 'vingt';
        break;
      case 30:
        dizaine = 'trente';
        break;
      case 40:
        dizaine = 'quarante';
        break;
      case 50:
        dizaine = 'cinquante';
        break;
      case 60:
        dizaine = 'soixante';
        break;
      case 70:
        dizaine = 'soixante-dix';
        break;
      case 80:
        dizaine = 'quatre-vingt';
        break;
      case 90:
        dizaine = 'quatre-vingt-dix';
        break;
    } //fin switch
    return dizaine;
  }

  NumberToLetter(nombre) {
    var i, j, n, quotient, reste, nb;
    var ch;
    var numberToLetter = '';
    //__________________________________

    if (nombre.toString().replace(/ /gi, '').length > 15) return 'dépassement de capacité';
    if (isNaN(nombre.toString().replace(/ /gi, ''))) return 'Nombre non valide';

    nb = parseFloat(nombre.toString().replace(/ /gi, ''));
    if (Math.ceil(nb) != nb) return 'Nombre avec virgule non géré.';

    n = nb.toString().length;
    switch (n) {
      case 1:
        numberToLetter = this.Unite(nb);
        break;
      case 2:
        if (nb > 19) {
          quotient = Math.floor(nb / 10);
          reste = nb % 10;
          if (nb < 71 || (nb > 79 && nb < 91)) {
            if (reste == 0) numberToLetter = this.Dizaine(quotient * 10);
            if (reste == 1)
              numberToLetter = this.Dizaine(quotient * 10) + '-et-' + this.Unite(reste);
            if (reste > 1) numberToLetter = this.Dizaine(quotient * 10) + '-' + this.Unite(reste);
          } else
            numberToLetter = this.Dizaine((quotient - 1) * 10) + '-' + this.Dizaine(10 + reste);
        } else numberToLetter = this.Dizaine(nb);
        break;
      case 3:
        quotient = Math.floor(nb / 100);
        reste = nb % 100;
        if (quotient == 1 && reste == 0) numberToLetter = 'cent';
        if (quotient == 1 && reste != 0) numberToLetter = 'cent' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.Unite(quotient) + ' cents';
        if (quotient > 1 && reste != 0)
          numberToLetter = this.Unite(quotient) + ' cent ' + this.NumberToLetter(reste);
        break;
      case 4:
        quotient = Math.floor(nb / 1000);
        reste = nb - quotient * 1000;
        if (quotient == 1 && reste == 0) numberToLetter = 'mille';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'mille' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + ' mille';
        if (quotient > 1 && reste != 0)
          numberToLetter = this.NumberToLetter(quotient) + ' mille ' + this.NumberToLetter(reste);
        break;
      case 5:
        quotient = Math.floor(nb / 1000);
        reste = nb - quotient * 1000;
        if (quotient == 1 && reste == 0) numberToLetter = 'mille';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'mille' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + ' mille';
        if (quotient > 1 && reste != 0)
          numberToLetter = this.NumberToLetter(quotient) + ' mille ' + this.NumberToLetter(reste);
        break;
      case 6:
        quotient = Math.floor(nb / 1000);
        reste = nb - quotient * 1000;
        if (quotient == 1 && reste == 0) numberToLetter = 'mille';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'mille' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + ' mille';
        if (quotient > 1 && reste != 0)
          numberToLetter = this.NumberToLetter(quotient) + ' mille ' + this.NumberToLetter(reste);
        break;
      case 7:
        quotient = Math.floor(nb / 1000000);
        reste = nb % 1000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un million';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un million' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' millions';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' millions ' + this.NumberToLetter(reste);
        break;
      case 8:
        quotient = Math.floor(nb / 1000000);
        reste = nb % 1000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un million';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un million' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' millions';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' millions ' + this.NumberToLetter(reste);
        break;
      case 9:
        quotient = Math.floor(nb / 1000000);
        reste = nb % 1000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un million';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un million' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' millions';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' millions ' + this.NumberToLetter(reste);
        break;
      case 10:
        quotient = Math.floor(nb / 1000000000);
        reste = nb - quotient * 1000000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un milliard';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un milliard' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' milliards';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' milliards ' + this.NumberToLetter(reste);
        break;
      case 11:
        quotient = Math.floor(nb / 1000000000);
        reste = nb - quotient * 1000000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un milliard';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un milliard' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' milliards';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' milliards ' + this.NumberToLetter(reste);
        break;
      case 12:
        quotient = Math.floor(nb / 1000000000);
        reste = nb - quotient * 1000000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un milliard';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un milliard' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' milliards';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' milliards ' + this.NumberToLetter(reste);
        break;
      case 13:
        quotient = Math.floor(nb / 1000000000000);
        reste = nb - quotient * 1000000000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un billion';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un billion' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' billions';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' billions ' + this.NumberToLetter(reste);
        break;
      case 14:
        quotient = Math.floor(nb / 1000000000000);
        reste = nb - quotient * 1000000000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un billion';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un billion' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' billions';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' billions ' + this.NumberToLetter(reste);
        break;
      case 15:
        quotient = Math.floor(nb / 1000000000000);
        reste = nb - quotient * 1000000000000;
        if (quotient == 1 && reste == 0) numberToLetter = 'un billion';
        if (quotient == 1 && reste != 0)
          numberToLetter = 'un billion' + ' ' + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0)
          numberToLetter = this.NumberToLetter(quotient) + ' billions';
        if (quotient > 1 && reste != 0)
          numberToLetter =
            this.NumberToLetter(quotient) + ' billions ' + this.NumberToLetter(reste);
        break;
    } //fin switch
    /*respect de l'accord de quatre-vingt*/
    if (
      numberToLetter.substr(numberToLetter.length - 'quatre-vingt'.length, 'quatre-vingt'.length) ==
      'quatre-vingt'
    )
      numberToLetter = numberToLetter + 's';

    return numberToLetter;
  }
}
