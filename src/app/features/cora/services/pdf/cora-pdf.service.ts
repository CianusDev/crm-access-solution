import { Injectable } from '@angular/core';
import { LogoBase64, SignatureDirecteurGeneralAdjointBase64 } from '@/features/credit/enumeration/logo_base64.enum';
import { Cora, CoraAgent } from '../../interfaces/cora.interface';

const CIVILITES: Record<number, string> = {
  1: 'Mademoiselle',
  2: 'Madame',
  3: 'Monsieur',
};

@Injectable({ providedIn: 'root' })
export class CoraPdfService {
  private pdfMakeInstance: any = null;

  private async getPdfMake(): Promise<any> {
    if (this.pdfMakeInstance) return this.pdfMakeInstance;

    // Fetch Montserrat.js et extraction du VFS via un conteneur isolé
    const [pdfMakeModule, montserratVfs] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      fetch('assets/fonts-creditaccess/Montserrat.js')
        .then((r) => r.text())
        .then((code) => {
          // Montserrat.js = `this.pdfMake = this.pdfMake || {}; this.pdfMake.vfs = { "Font.ttf": "base64..." };`
          // On cherche le { qui suit `this.pdfMake.vfs = `, pas le {} du `|| {}`
          const marker = 'this.pdfMake.vfs = ';
          const markerIdx = code.indexOf(marker);
          const start = code.indexOf('{', markerIdx + marker.length);
          const end = code.lastIndexOf('}');
          return JSON.parse(code.slice(start, end + 1)) as Record<string, string>;
        })
        .catch(() => ({}) as Record<string, string>),
    ]);

    const pdfMake = (pdfMakeModule as any).default ?? pdfMakeModule;

    // API pdfmake 0.2.x
    pdfMake.vfs = montserratVfs;
    pdfMake.fonts = {
      Montserrat: {
        normal: 'Montserrat-Light.ttf',
        bold: 'Montserrat-Bold.ttf',
        italics: 'Montserrat-Regular.ttf',
        bolditalics: 'Montserrat-Medium.ttf',
      },
    };

    this.pdfMakeInstance = pdfMake;
    return pdfMake;
  }

  async printContrat(cora: Cora): Promise<void> {
    const pdfMake = await this.getPdfMake();

    const mandataire: CoraAgent | undefined = cora.agents?.find((a) => a.typeUser === 1);
    const capital = cora.capital
      ? cora.capital.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      : '\u2014';
    const civilite = CIVILITES[cora.civilite ?? 0] ?? '';

    const docDefinition: any = {
      pageSize: 'A4',
      content: [
        {
          columns: [
            [
              // ── Cover page ──────────────────────────────────────────────────
              {
                image: LogoBase64.logoVertical,
                width: 90,
                height: 90,
              },
              {
                style: 'pageAcceuil',
                table: {
                  body: [
                    [
                      {
                        text: 'CONTRAT DE CORRESPONDANTS RAPID ACCESS',
                        style: 'pageAcceuilText',
                      },
                    ],
                  ],
                },
              },

              // ── Entre les soussign\u00e9s ──────────────────────────────────────
              {
                text: 'Entre les soussign\u00e9s\u00a0:',
                style: 'titre',
              },
              {
                stack: [
                  {
                    text: [
                      { text: 'CREDIT ACCESS S.A,', bold: true },
                      ` Syst\u00e8me Financier D\u00e9centralis\u00e9, Soci\u00e9t\u00e9 Anonyme avec Conseil d\u2019Administration au capital d\u2019un milliard cent million de Francs CFA (1.100.000.000 FCFA), immatricul\u00e9 au Registre du Commerce et du Cr\u00e9dit Mobilier d\u2019Abidjan sous le n\u00b0 CI-ABJ-2003-B-2556, Agr\u00e9ment N\u00b0A.6.1.1/1308, dont le si\u00e8ge est \u00e0 ABIDJAN Cocody, Riviera Palmeraie, Rue 1166 \u00e0 200 m de l\u2019espace triangle, 01 BP 12084 ABIDJAN 01, repr\u00e9sent\u00e9 par `,
                      { text: 'Monsieur ALI BADINI', bold: true },
                      `, son Directeur G\u00e9n\u00e9ral, demeurant en cette qualit\u00e9 au si\u00e8ge social susdit,`,
                    ],
                    fontSize: 11,
                    alignment: 'justify',
                  },
                  {
                    text: [
                      `Ci-apr\u00e8s d\u00e9nomm\u00e9e \u00ab`,
                      { text: 'CREDIT ACCESS', bold: true },
                      `\u00bb,`,
                    ],
                    fontSize: 11,
                    alignment: 'justify',
                  },
                  {
                    text: `D\u2019une part,`,
                    fontSize: 11,
                    alignment: 'right',
                  },
                  {
                    text: 'ET',
                    bold: true,
                    fontSize: 11,
                    alignment: 'center',
                  },
                  {
                    text: [
                      `La soci\u00e9t\u00e9 `,
                      { text: cora.designation, bold: true },
                      `, au capital social de `,
                      { text: capital, bold: true },
                      ` Francs CFA, ayant son si\u00e8ge \u00e0 `,
                      { text: (cora.commune?.libelle ?? '') + ', ', bold: true },
                      { text: mandataire?.quartier ?? '', bold: true },
                      ` immatricul\u00e9e au RCCM sous le num\u00e9ro `,
                      { text: cora.rccm ?? '\u2014', bold: true },
                      `, repr\u00e9sent\u00e9e par `,
                      { text: civilite },
                      ' ',
                      { text: (cora.nomPrenom ?? '') + ', ', bold: true },
                      { text: cora.fonction ?? '', bold: true },
                      ` demeurant en cette qualit\u00e9 au susdit si\u00e8ge social, `,
                      { text: (cora.mobile ?? '') + ' ;', bold: true },
                    ],
                    fontSize: 11,
                    alignment: 'justify',
                  },
                  {
                    text: `D\u2019autre part,`,
                    fontSize: 11,
                    alignment: 'right',
                  },
                ],
                margin: [0, 6, 0, 6],
              },

              {
                text: [
                  `Ci-apr\u00e8s d\u00e9nomm\u00e9es ensemble `,
                  { text: '\u00ables Parties\u00bb', bold: true },
                  ` et s\u00e9par\u00e9ment une ou `,
                  { text: '\u00abla Partie\u00bb', bold: true },
                ],
                style: 'contenuText',
                alignment: 'center',
                margin: [0, 0, 0, 12],
              },

              // ── Pr\u00e9ambule ────────────────────────────────────────────────
              {
                text: 'PREAMBULE\n\n',
                alignment: 'center',
                style: 'titre',
              },
              {
                text: `RAPID ACCESS est un service de CREDIT ACCESS qui permet aux clients d\u2019effectuer des transactions hors des agences classiques.\n\nPour favoriser le d\u00e9ploiement du service RAPID ACCESS, CREDIT ACCESS a convenu avec des agents tiers appel\u00e9s "Correspondants RAPID ACCESS" ou "CORA", qui disposent de qualit\u00e9s op\u00e9rationnelles et logistiques, ainsi que de l\u2019expertise et des ressources humaines et financi\u00e8res n\u00e9cessaires pour l\u2019ex\u00e9cution de cette mission.\n\nLe CORA, apr\u00e8s analyse, consent \u00e0 distribuer le service RAPID ACCESS.\n\nLes Parties se sont donc rapproch\u00e9es pour conclure le pr\u00e9sent contrat qui d\u00e9termine les conditions et modalit\u00e9s de distribution de ce service.\n\n\n\n`,
                style: 'contenuText',
              },

              {
                text: 'CECI EXPOSE, IL A ETE CONVENU CE QUI SUIT\u00a0:\n\n',
                alignment: 'center',
                style: 'titre',
              },

              // ── Article 1 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 1', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: `VALEUR JURIDIQUE DE L\u2019EXPOSE ET DES ANNEXES\n\n`, style: 'titre' },
                ],
              },
              {
                text: `L\u2019expos\u00e9 ci-dessus ainsi que les Annexes et avenants \u00e9ventuels ont la m\u00eame valeur juridique que le pr\u00e9sent Contrat dont ils font partie int\u00e9grante et peuvent utilement servir d\u2019\u00e9l\u00e9ment d\u2019interpr\u00e9tation, le cas \u00e9ch\u00e9ant, dans la recherche de la commune intention des Parties, au sens de l\u2019article 1156 du Code civil\n\n`,
                style: 'contenuText',
              },

              // ── Article 2 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 2', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'OBJET DU CONTRAT DE REPRESENTATION\n\n', style: 'titre' },
                ],
              },
              {
                text: `La pr\u00e9sente Convention a pour objet de d\u00e9terminer les conditions et modalit\u00e9s du partenariat entre les Parties en vue de la fourniture du service "Rapid Access".\n\n`,
                style: 'contenuText',
              },

              // ── Article 3 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 3', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'PRE-REQUIS DU CORRESPONDANT RAPID ACCESS\n\n', style: 'titre' },
                ],
              },
              {
                text: `Le CORA d\u00e9clare sous sa pleine et enti\u00e8re responsabilit\u00e9\u00a0:\n\n`,
                style: 'contenuText',
              },
              {
                ul: [
                  `Avoir satisfait aux exigences requises au contrat de repr\u00e9sentation pour la distribution de services mobile money, E-Banking, transfert d\u2019argent ou toute autre activit\u00e9 similaire\u00a0;`,
                  `\u00catre capable d\u2019ex\u00e9cuter le contrat avec CREDIT ACCESS en appliquant et mettant en exergue les valeurs et pratiques de CREDIT ACCESS\u00a0;`,
                  `Avoir une bonne capacit\u00e9 financi\u00e8re afin de permettre les op\u00e9rations de retrait d\u2019esp\u00e8ces des clients.`,
                  `Disposer du personnel ou des mandataires qualifi\u00e9s et jouissant d\u2019une bonne int\u00e9grit\u00e9 morale pour la fourniture du service Rapid Access aux clients\u00a0;\n\n`,
                ],
                margin: [20, 0, 0, 0],
              },

              // ── Article 4 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 4', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'OBLIGATIONS DU CORRESPONDANT RAPID ACCESS\n\n', style: 'titre' },
                ],
              },
              {
                text: `Le Correspondant Rapid Access s\u2019oblige, par la seule force du pr\u00e9sent contrat, \u00e0\u00a0:\n\n`,
                style: 'contenuText',
              },
              {
                ul: [
                  `S\u2019autofinancer exclusivement pour toutes les transactions et services effectu\u00e9s pour les clients, investir par cons\u00e9quent le capital n\u00e9cessaire pour la distribution de services Rapid Access et tous les autres services d\u00e9finis au pr\u00e9sent Contrat\u00a0;`,
                  `Effectuer \u00e0 la cl\u00f4ture en fin de journ\u00e9e, les r\u00e9conciliations de toutes les transactions effectu\u00e9es durant la journ\u00e9e et signaler toute irr\u00e9gularit\u00e9 ou \u00e9cart non justifi\u00e9 \u00e0 CREDIT ACCESS dans le d\u00e9lai maximal de quarante-huit (48) heures. Le d\u00e9faut de notification \u00e0 CREDIT ACCESS des irr\u00e9gularit\u00e9s ou \u00e9carts non justifi\u00e9s vaudra d\u00e9ch\u00e9ance pour toute r\u00e9clamation ult\u00e9rieure. De plus, en cas d\u2019irr\u00e9gularit\u00e9 entra\u00eenant une perte financi\u00e8re pour CREDIT ACCESS non signal\u00e9e par le CORA dans le d\u00e9lai indiqu\u00e9 au pr\u00e9sent article, CREDIT ACCESS se r\u00e9serve le droit de r\u00e9silier le pr\u00e9sent Contrat en application des dispositions de l\u2019article 13 ci-apr\u00e8s, sans pr\u00e9judice des droits et proc\u00e9dures l\u00e9gales que CREDIT ACCESS pourrait mettre en \u0153uvre afin de recouvrer les fonds\u00a0;`,
                  `Effectuer, conform\u00e9ment aux directives de CREDIT ACCESS et autant que n\u00e9cessaire, la formation de tout son personnel sur la maitrise des outils, produits et l\u2019application des proc\u00e9dures de CREDIT ACCESS`,
                  `Prendre toutes les dispositions n\u00e9cessaires afin de ne mener aucune activit\u00e9 susceptible de porter pr\u00e9judice \u00e0 l\u2019image de CREDIT ACCESS\u00a0;`,
                  `Se conformer scrupuleusement \u00e0 toutes les proc\u00e9dures, manuels et autres codes de conduite qui lui sont r\u00e9guli\u00e8rement communiqu\u00e9s par CREDIT ACCESS et s\u2019assurer que l\u2019ensemble de son personnel respecte et applique scrupuleusement les dispositions desdits documents\u00a0;`,
                  `Se soumettre aux contr\u00f4les p\u00e9riodiques de CREDIT ACCESS pour s\u2019assurer de la mise en \u0153uvre effective des proc\u00e9dures ci-dessus vis\u00e9es\u00a0;`,
                  `Signaler imm\u00e9diatement \u00e0 CREDIT ACCESS toute activit\u00e9 suspecte et donner imm\u00e9diatement \u00e0 CREDIT ACCESS toute information sur des transactions suspectes\u00a0;`,
                  `Ex\u00e9cuter le pr\u00e9sent Contrat de bonne foi et de mani\u00e8re, prudente, diligente et avis\u00e9e, et au mieux des pratiques professionnelles applicables \u00e0 son activit\u00e9, de bonne foi et conform\u00e9ment aux prescriptions et attentes de CREDIT ACCESS\u00a0;`,
                  `Garantir la meilleure collaboration de ses salari\u00e9s pour l\u2019ex\u00e9cution de la pr\u00e9sente Convention.\n\n`,
                ],
                margin: [20, 0, 0, 0],
              },

              // ── Article 5 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 5', style: 'titre' },
                  { text: ' : ', bold: true },
                  {
                    text: 'SERVICES FOURNIS PAR LE CORRESPONDANT RAPID ACCESS\n\n',
                    style: 'titre',
                  },
                ],
              },
              {
                text: `Le CORA s\u2019engage dans le pr\u00e9sent Contrat \u00e0 fournir les services ci-apr\u00e8s en contrepartie des commissions pay\u00e9es par CREDIT ACCESS et d\u00e9finies en annexes au pr\u00e9sent contrat\u00a0:\n\n`,
                style: 'contenuText',
              },
              {
                ul: [
                  `R\u00e9aliser les op\u00e9rations de retrait pour les clients sur leurs comptes ou leurs porte-monnaie \u00e9lectroniques\u00a0;`,
                  `Effectuer des d\u00e9p\u00f4ts pour les clients sur leurs comptes ou sur leurs porte-monnaie \u00e9lectroniques\u00a0;`,
                  `Effectuer les op\u00e9rations de retraits par mise \u00e0 disposition\u00a0;`,
                  `Collaborer avec les \u00e9quipes commerciales de CREDIT ACCESS pour les campagnes de promotion du service RAPID ACCESS.\n\n`,
                ],
                margin: [20, 0, 0, 0],
              },

              // ── Article 6 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 6', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'OBLIGATIONS DE CREDIT ACCESS\n\n', style: 'titre' },
                ],
              },
              {
                ul: [
                  `CREDIT ACCESS s\u2019engage \u00e0 ex\u00e9cuter le pr\u00e9sent Contrat de bonne foi et de mani\u00e8re prudente, diligente et avis\u00e9e et au mieux des pratiques professionnelles applicables \u00e0 son activit\u00e9, de bonne foi et \u00e0 garantir une bonne collaboration de ses \u00e9quipes\u00a0;`,
                  `CREDIT ACCESS s\u2019engage \u00e0 fournir au CORA la formation n\u00e9cessaire \u00e0 l\u2019utilisation des outils (applications, logiciels\u2026) et la maitrise des proc\u00e9dures de RAPID ACCESS\u00a0;`,
                  `CREDIT ACCESS s\u2019engage \u00e0 payer \u00e0 bonne date les commissions du CORA.\n\n`,
                ],
                margin: [20, 0, 0, 0],
              },

              // ── Article 7 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 7', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'RESPONSABILITE DES PARTIES\n\n', style: 'titre' },
                ],
              },
              {
                text: `CREDIT ACCESS et le CORA fourniront chacun en ce qui le concerne, les prestations mises \u00e0 leur charge respective par les pr\u00e9sentes, sous la seule et enti\u00e8re responsabilit\u00e9 de chaque Partie.\n\nCREDIT ACCESS et le CORA s\u2019engagent, chacun pour lui-m\u00eame, ainsi que pour tout son personnel \u00e0 la fourniture des services objet des pr\u00e9sentes, au respect strict des obligations d\u00e9finies au pr\u00e9sent Contrat et du code de conduite annex\u00e9 audit contrat.\n\nCREDIT ACCESS et le CORA agissent, chacun dans le cadre du pr\u00e9sent Contrat, comme un professionnel averti mesurant les risques de son activit\u00e9.\n\nLe CORA r\u00e9pondra de tous les dommages caus\u00e9s \u00e0 CREDIT ACCESS par son personnel.\n\nCREDIT ACCESS r\u00e9pondra de tous les dommages caus\u00e9s par son personnel au CORA.\n\n`,
                style: 'contenuText',
              },

              // ── Article 8 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 8', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'CONDITIONS FINANCIERES\n\n', style: 'titre' },
                ],
              },
              {
                text: [{ text: '8.1 Montant des commissions du CORA et taxes\n\n', bold: true }],
                margin: [20, 0, 0, 0],
              },
              {
                text: `Les commissions dues au CORA sont d\u00e9taill\u00e9es en annexes et elles sont nettes de toutes taxes\n\n`,
                style: 'contenuText',
              },
              {
                text: [{ text: '8.2 Variation des commissions\n\n', bold: true }],
                margin: [20, 0, 0, 0],
              },
              {
                text: `Il est express\u00e9ment convenu entre les Parties que les commissions payables au CORA pourront faire l\u2019objet de modifications en fonction des n\u00e9cessit\u00e9s commerciales, conjoncturelles ou r\u00e9glementaires.\n\nDans tous les cas, la modification des commissions jointes en annexes sera notifi\u00e9e au CORA par tout moyen laissant trace \u00e9crite, (notamment SMS, courrier ou email) et ne prendra effet que suite \u00e0 un pr\u00e9avis de deux (02) semaines.\n\nEn cas de d\u00e9saccord sur la nouvelle commission qui lui sera notifi\u00e9e, le CORA sera libre de r\u00e9silier la pr\u00e9sente Convention en respectant le pr\u00e9avis stipul\u00e9 \u00e0 l\u2019article 16 alin\u00e9a 1 ci-dessous\n\n`,
                style: 'contenuText',
              },

              // ── Article 9 ────────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 9', style: 'titre' },
                  { text: ' : ', bold: true },
                  {
                    text: `MODALITES D\u2019ACHAT ET DE REVENTE DES UV PAR LE CORRESPONDANT RAPID ACCESS\n\n`,
                    style: 'titre',
                  },
                ],
              },
              {
                text: `Les modalit\u00e9s suivant lesquelles le CORA s\u2019approvisionne en UV ou revend ses UV aupr\u00e8s de CREDIT ACCESS sont d\u00e9finies aux proc\u00e9dures jointes en annexe 2 et 3. Il doit pour ce faire, disposer dans son Compte Correspondant Rapid ACCESS d\u2019un solde sup\u00e9rieur ou \u00e9gal \u00e0 la valeur des UV \u00e0 acheter.\n\nLa proc\u00e9dure mentionn\u00e9e ci-dessus pourra \u00eatre modifi\u00e9e en cas de n\u00e9cessit\u00e9, et \u00eatre notifi\u00e9e par CREDIT ACCESS au CORA par tout moyen laissant trace \u00e9crite notamment par SMS, email ou simple courrier.\n\nEn cas de modification de la proc\u00e9dure mentionn\u00e9e ci-dessus, les nouvelles modalit\u00e9s seront applicables une (01) semaine apr\u00e8s leur notification par CREDIT ACCESS.\n\nEn cas de d\u00e9saccord du CORA sur ces nouvelles modalit\u00e9s, il pourra s\u2019il le souhaite r\u00e9silier la pr\u00e9sente Convention en respectant le pr\u00e9avis stipul\u00e9 \u00e0 l\u2019article 16 alin\u00e9a 1 ci-dessous.\n\n`,
                style: 'contenuText',
              },

              // ── Article 10 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 10', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: `PRISE D\u2019EFFET ET DUREE DU CONTRAT\n\n`, style: 'titre' },
                ],
              },
              {
                text: `Le pr\u00e9sent contrat prend effet \u00e0 sa date de signature pour une dur\u00e9e de douze (12) mois renouvelable par tacite reconduction, sauf r\u00e9siliation pr\u00e9vue \u00e0 l\u2019article 16 alin\u00e9a 1 ci-dessous.\n\n`,
                style: 'contenuText',
              },

              // ── Article 11 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 11', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'REVISION\n\n', style: 'titre' },
                ],
              },
              {
                text: `Chaque Partie pourra, \u00e0 tout moment, soumettre \u00e0 l\u2019autre une proposition de r\u00e9vision du Contrat.\n\nLa Partie qui d\u00e9sire user de la pr\u00e9sente stipulation devra la notifier \u00e0 l\u2019autre Partie, par tout moyen laissant trace \u00e9crite.\n\nToute r\u00e9vision prendra la forme d\u2019un avenant convenu dans les m\u00eames formes que les pr\u00e9sentes dont il fera partie int\u00e9grante.\n\n`,
                style: 'contenuText',
              },

              // ── Article 12 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 12', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: `IND\u00c9PENDANCE RECIPROQUE DES PARTIES\n\n`, style: 'titre' },
                ],
              },
              {
                text: [
                  { text: '12.1 ', bold: true },
                  {
                    text: ` Les deux Parties concluent et ex\u00e9cuteront le pr\u00e9sent contrat en qualit\u00e9 de professionnels ind\u00e9pendants.\n\nLes Parties conviennent express\u00e9ment que ni le pr\u00e9sent contrat, ni aucune des op\u00e9rations d\u00e9coulant de son ex\u00e9cution, ne sauraient cr\u00e9er ou constituer une co-entreprise ou association entre CREDIT ACCESS et le CORA.\n\nLe CORA dans le cadre du pr\u00e9sent contrat ne saurait engager CREDIT ACCESS aupr\u00e8s des tiers au-del\u00e0 de ce qui est strictement n\u00e9cessaire \u00e0 l\u2019ex\u00e9cution des pr\u00e9sentes.\n\n`,
                    style: 'contenuText',
                  },
                  { text: '12.2 ', bold: true },
                  {
                    text: ` Le CORA reste seul responsable de son personnel et r\u00e9pond de ses actes en cas de dommage caus\u00e9 \u00e0 CREDIT ACCESS.\n\n`,
                    style: 'contenuText',
                  },
                ],
              },

              // ── Article 13 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 13', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'OBLIGATION DE CONFIDENTIALITE\n\n', style: 'titre' },
                ],
              },
              {
                text: [
                  {
                    text: `Toute information communiqu\u00e9e par l\u2019une des Parties \u00e0 l\u2019autre et r\u00e9ciproquement dans le cadre du pr\u00e9sent Contrat est consid\u00e9r\u00e9e comme confidentielle par les Parties et sera trait\u00e9e comme telle.\n\nChacune des Parties s\u2019oblige \u00e0 respecter la confidentialit\u00e9 la plus absolue sur toutes informations et affaires concernant l\u2019autre Partie, et dont elle aura eu connaissance dans le cadre de l\u2019ex\u00e9cution du pr\u00e9sent contrat.\n\nPlus particuli\u00e8rement, chaque Partie gardera strictement confidentiels les termes du pr\u00e9sent contrat ainsi que toutes les informations financi\u00e8res, strat\u00e9giques ou relatives \u00e0 l\u2019organisation de l\u2019autre Partie.\n\nCette obligation demeure valable au cours de l\u2019ex\u00e9cution du pr\u00e9sent contrat et pour une dur\u00e9e minimum de deux (2) ans apr\u00e8s le terme du pr\u00e9sent contrat.\n\n`,
                    style: 'contenuText',
                  },
                ],
              },

              // ── Article 14 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 14', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'CESSION\n\n', style: 'titre' },
                ],
              },
              {
                text: [
                  {
                    text: `Le pr\u00e9sent Contrat \u00e9tant conclu en consid\u00e9ration de la personne des cocontractants, il ne pourra \u00eatre c\u00e9d\u00e9, sauf l\u2019accord pr\u00e9alable et \u00e9crit de l\u2019autre Partie.\n\n`,
                    style: 'contenuText',
                  },
                ],
              },

              // ── Article 15 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 15', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'INTERDICTIONS\n\n', style: 'titre' },
                ],
              },
              {
                text: [
                  { text: '15.1 ', bold: true },
                  {
                    text: ` Le pr\u00e9sent contrat est conclu intuitu personae. Par cons\u00e9quent, le CORA s\u2019interdit express\u00e9ment de sous-traiter tout ou partie de ses obligations et services souscrits dans le cadre des pr\u00e9sentes sans l\u2019accord formel de CREDIT ACCESS.\n\n`,
                    style: 'contenuText',
                  },
                  { text: '15.2 ', bold: true },
                  {
                    text: ` Le CORA s\u2019interdit de faire toute entente ou collusion avec les agents de CREDIT ACCESS dans le but de commettre ou dissimuler des malversations au pr\u00e9judice de CREDIT ACCESS ou des utilisateurs du service RAPID ACCESS\n\n`,
                    style: 'contenuText',
                  },
                  { text: '15.3 ', bold: true },
                  {
                    text: ` Le CORA ne pourra \u00e0 aucun moment mener de sa propre initiative des campagnes de promotion du service RAPID ACCESS ou de la marque CREDIT ACCESS sans l\u2019accord pr\u00e9alable de CREDIT ACCESS sur les modalit\u00e9s et la dur\u00e9e de la promotion en question. Tous les supports qui seront associ\u00e9s \u00e0 des actions de promotion ou de marketing de CREDIT ACCESS devront exclusivement provenir d\u2019elle-m\u00eame.\n\n`,
                    style: 'contenuText',
                  },
                  { text: '15.4 ', bold: true },
                  {
                    text: ` Le CORA s\u2019interdit de faire toute man\u0153uvre tendant \u00e0 augmenter artificiellement les commissions qui lui seront dues dans le cadre du pr\u00e9sent contrat.\n\n`,
                    style: 'contenuText',
                  },
                ],
              },

              // ── Article 16 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 16', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'RESILIATION DE LA CONVENTION\n\n', style: 'titre' },
                ],
              },
              {
                text: `Le pr\u00e9sent contrat peut \u00eatre r\u00e9sili\u00e9 dans les conditions suivantes\u00a0:\n\n`,
                style: 'contenuText',
              },
              {
                ul: [
                  `Inex\u00e9cution ou mauvaise ex\u00e9cution des obligations contractuelles par l\u2019une ou l\u2019autre des parties contractantes\u00a0;`,
                  `Fautes lourdes de l\u2019une ou l\u2019autre des parties\u00a0;`,
                  `Tout cas de force majeure rendant quasiment impossible l\u2019ex\u00e9cution du contrat.\n\n`,
                ],
                margin: [20, 0, 0, 0],
              },
              {
                text: `En cas d\u2019inobservation par l\u2019une des Parties des obligations \u00e9num\u00e9r\u00e9es dans le pr\u00e9sent contrat, l\u2019autre Partie aura le droit de r\u00e9silier de plein droit les pr\u00e9sentes si le manquement de la Partie d\u00e9faillante n\u2019est pas corrig\u00e9 dans un d\u00e9lai de huit (08) jours suivant une mise en demeure envoy\u00e9e par tout moyen (email, courrier etc.) et rest\u00e9e sans effet.\n\nle pr\u00e9sent contrat sera automatiquement r\u00e9sili\u00e9 \u00e0 la date de prise d\u2019effet de la r\u00e9siliation du contrat de distribution du service RAPID ACCESS sign\u00e9 par le CORA et dans les Conditions pr\u00e9vues au pr\u00e9sent article.\n\nAu plus tard \u00e0 la prise d\u2019effet de la r\u00e9siliation du pr\u00e9sent contrat, le CORA devra restituer l\u2019ensemble des supports publicitaires ou autres mat\u00e9riels appartenant \u00e0 CREDIT ACCESS.\n\nDans tous les cas, la r\u00e9siliation du pr\u00e9sent contrat sera notifi\u00e9e par tout moyen \u00e9crit (mail, courrier etc ...).\n\n`,
                style: 'contenuText',
              },

              // ── Article 17 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 17', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'FORCE MAJEURE\n\n', style: 'titre' },
                ],
              },
              {
                text: `Dans le cadre du pr\u00e9sent contrat, la force majeure est d\u00e9finie comme un \u00e9v\u00e9nement \u00e0 la fois impr\u00e9visible, insurmontable, et ind\u00e9pendant de la volont\u00e9 des Parties.\n\nAucune des deux (02) Parties ne sera tenue responsable du retard constat\u00e9 en raison des \u00e9v\u00e9nements de force majeure.\n\nEn cas d\u2019\u00e9v\u00e9nement de force majeure, l\u2019ex\u00e9cution du pr\u00e9sent contrat sera suspendue jusqu\u2019\u00e0 la cessation de la cause dudit \u00e9v\u00e9nement.\n\nLes Parties s\u2019engagent \u00e0 trouver une solution \u00e0 la force majeure dans les meilleurs d\u00e9lais.\n\nEn cas de persistance de l\u2019\u00e9v\u00e9nement de force majeure, constat\u00e9 d\u2019un commun accord pendant une p\u00e9riode de trois (03) mois, le pr\u00e9sent contrat sera consid\u00e9r\u00e9 comme r\u00e9sili\u00e9 de plein droit sans qu\u2019aucune Partie ne puisse \u00eatre tenue pour responsable.\n\n`,
                style: 'contenuText',
              },

              // ── Article 18 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 18', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'MODIFICATION DE LA CONVENTION\n\n', style: 'titre' },
                ],
              },
              {
                text: `Les dispositions du pr\u00e9sent contrat ne pourront \u00eatre modifi\u00e9es que par la commune volont\u00e9 des Parties par avenant \u00e9crit et d\u00fbment sign\u00e9 entre elles ou leurs repr\u00e9sentants habilit\u00e9s.\n\n`,
                style: 'contenuText',
              },

              // ── Article 19 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 19', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'LOI APPLICABLE- JURIDICTION COMPETENTE\n\n', style: 'titre' },
                ],
              },
              {
                text: `Le pr\u00e9sent contrat est r\u00e9gi par les lois applicables en C\u00f4te d\u2019ivoire.\n\nEn cas de litige d\u00e9coulant de son ex\u00e9cution, les Parties s\u2019engagent \u00e0 trouver une solution amiable.\n\nA d\u00e9faut d\u2019une solution amiable dans un d\u00e9lai d\u2019un (01) mois, tout litige aff\u00e9rent au contrat sera soumis au Tribunal de Commerce d\u2019Abidjan par la Partie la plus diligente.\n\n`,
                style: 'contenuText',
              },

              // ── Article 20 ───────────────────────────────────────────────
              {
                text: [
                  { text: 'Article 20', style: 'titre' },
                  { text: ' : ', bold: true },
                  { text: 'ELECTION DE DOMICILE\n\n', style: 'titre' },
                ],
              },
              {
                text: `Pour les besoins du pr\u00e9sent contrat, chaque Partie \u00e9lit domicile \u00e0 l\u2019adresse indiqu\u00e9e ci-dessus.\n\nChaque Partie s\u2019engage \u00e0 notifier \u00e0 l\u2019autre Partie tout changement d\u2019adresse dans un d\u00e9lai de huit (08) jours.\n\nEn cas de non-respect de cette disposition, toute correspondance sera consid\u00e9r\u00e9e comme valablement faite \u00e0 la derni\u00e8re adresse connue du contractant.\n\n`,
                style: 'contenuText',
              },

              // ── Signatures ───────────────────────────────────────────────
              {
                text: [
                  {
                    text: `Fait \u00e0 Abidjan le: ${new Date().toLocaleString()}`,
                    alignment: 'right',
                  },
                  { text: '\nen deux (02)exemplaires\n\n\n\n', alignment: 'right' },
                ],
                margin: [0, 190, 0, 0],
              },
              {
                columns: [
                  {
                    text: [{ text: 'Pour le CORRESPONDANT RAPID ACCESS', style: 'titre' }],
                  },
                  {
                    text: [
                      { text: 'Pour CREDIT ACCESS SA\n\n', style: 'titre' },
                      {
                        text: `Pour le Repr\u00e9sentant L\u00e9gal et par d\u00e9l\u00e9gation de signature`,
                        style: 'contenuText',
                      },
                    ],
                  },
                ],
              },
              {
                image: SignatureDirecteurGeneralAdjointBase64.signatureDga,
                width: 200,
                height: 120,
                alignment: 'right',
                margin: [0, 0, 50, 0],
              },
              {
                columns: [
                  {
                    text: [
                      { text: civilite, style: 'contenuText' },
                      ' ',
                      { text: cora.nomPrenom ?? cora.designation, bold: true },
                    ],
                  },
                  {
                    text: [
                      { text: 'Monsieur ', style: 'contenuText' },
                      { text: 'Charles MOUNET', bold: true },
                    ],
                  },
                ],
                margin: [0, 0, 0, 20],
              },
              {
                text: [
                  { text: '[1] Signature pr\u00e9c\u00e9d\u00e9e de la mention', fontSize: 8 },
                  { text: '"Lu et approuv\u00e9"', bold: true, fontSize: 8 },
                ],
              },

              // ── Annexe 1 ─────────────────────────────────────────────────
              {
                text: [{ text: 'ANNEXE 1\u00a0: GRILLE TARIFAIRE', bold: true }],
                margin: [0, 500, 0, 0],
              },
              {
                text: [{ text: 'Retrait et mises \u00e0 disposition', bold: true }],
                margin: [20, 20, 0, 20],
              },
              {
                table: {
                  widths: [250, 250],
                  body: [
                    [
                      { text: 'Tranches', fontSize: 12, bold: true },
                      { text: 'Frais applicables', fontSize: 12, bold: true },
                    ],
                    ['1000 \u2013 20.000 F CFA', '200'],
                    ['20.001 \u2013 2.000.000', '1% du montant retir\u00e9'],
                  ],
                },
              },
              {
                text: [{ text: 'D\u00e9p\u00f4ts', bold: true }],
                margin: [20, 20, 0, 20],
              },
              {
                table: {
                  widths: [250, 250],
                  body: [
                    [
                      { text: 'Tranches', fontSize: 12, bold: true },
                      { text: 'Frais applicables', fontSize: 12, bold: true },
                    ],
                    ['1000 - 26.000 F CFA', '200'],
                    ['26.001 - 2.000.000', '0,75% du montant d\u00e9pos\u00e9'],
                  ],
                },
              },
            ],
          ],
        },
      ],
      styles: {
        pageAcceuil: {
          alignment: 'center',
          margin: [0, 190, 0, 500],
        },
        pageAcceuilText: {
          fontSize: 30,
          bold: true,
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

    await new Promise<void>((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contrat-cora-${cora.reference}.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 30_000);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async exportListePDF(coras: Cora[], userName: string): Promise<void> {
    const pdfMake = await this.getPdfMake();

    const docDefinition: any = {
      pageSize: 'A3',
      pageOrientation: 'landscape',
      content: [
        {
          columns: [
            {
              stack: [
                { image: LogoBase64.logoVertical, width: 80 },
                {
                  text: [
                    { text: 'Email : ', bold: true }, 'support@creditaccess.ci\n',
                    { text: 'Tél : ', bold: true }, '+225 21 22 21 50 / +225 05 94 27 67 05\n',
                    { text: 'BP : ', bold: true }, '01 BP 12084 ABIDJAN 01',
                  ],
                  fontSize: 9,
                  marginTop: 4,
                },
              ],
            },
            {
              stack: [
                { text: 'Imprimé le : ' + new Date().toLocaleString(), fontSize: 9 },
                { text: 'Imprimé par : ' + userName, bold: true, fontSize: 9, marginTop: 4 },
              ],
              alignment: 'right',
            },
          ],
          marginBottom: 10,
        },
        {
          text: 'LISTE DES GESTIONNAIRES DE CORRESPONDANT',
          fontSize: 20,
          marginTop: 10,
          marginBottom: 20,
          alignment: 'center',
          decoration: 'underline',
          bold: true,
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 200, 200, 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Référence', bold: true },
                { text: 'Identifiant Perfect', bold: true },
                { text: 'Identifiant P-Mobile', bold: true },
                { text: 'Raison Sociale', bold: true },
                { text: 'Commune', bold: true },
                { text: 'Quartier', bold: true },
                { text: 'Gestionnaire', bold: true },
                { text: "Nombre d'Agence", bold: true },
              ],
              ...coras.map((c) => [
                c.reference ?? '',
                c.perfect ?? '',
                c.pmobile ?? '',
                c.designation ?? '',
                c.commune?.libelle ?? '',
                c.quartier ?? '',
                c.user ? `${c.user.nom} ${c.user.prenom}` : '',
                c.agents?.length ?? 0,
              ]),
            ],
          },
        },
      ],
      defaultStyle: { font: 'Montserrat' },
    };

    await new Promise<void>((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `liste-coras_${Date.now()}.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 30_000);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
