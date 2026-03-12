export interface User {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  phone: string;
  dateNaiss: string;
  sexe: string;
  nationalite: string | null;
  profilPhoto: string;
  role: string;
  fonction: string | null;
  situationMatri: string | null;
  email: string;
  description: string;
  cni: string | null;
  extrait: string | null;
  diplome: string | null;
  adresse: string | null;
  commune: {
    id: number;
    libelle: string;
  } | null;
  quartier: any | null;
  flotte: any | null;
  etat: number;
  statut: number;
  profil: {
    id: number;
    name: string;
    libelle: string;
  } | null;
  agence: {
    id: number;
    code: string;
    libelle: string;
    email: string;
    contact: string;
    ca: any | null;
    caa: any | null;
    suPme: {
      id: number;
      nom: string;
      prenom: string;
      profil: {
        id: number;
        name: string;
        libelle: string;
        created_at: string;
        updated_at: string;
      };
    } | null;
    respoReseau: any | null;
  } | null;
  service: {
    id: number;
    code: string;
    libelle: string;
    email: string;
    contact: string;
  } | null;
  direction: any | null;
  code: string;
}

export enum UserRole {
  Admin = 'Admin', // Administrateur
  DG = 'DG', // Directeur Général
  DirecteurGeneral = 'DG',
  DGA = 'DGA', // Directeur Général Adjoint
  DirecteurGeneralAdjoint = 'DGA',
  DirecteurRisque = 'DR',
  DirectriceExploitation = 'D_EXPL',
  ChefDepartementMarketing = 'CHEF_DEPART_MARK', // Chef Département marketing
  GestionCora = 'Gestion_Cora', // Gestionnaire de réseau correspondant
  ChargeCora = 'Charge_Cora', // Chargé du réseau de correspondant
  AgentBO = 'Agent_BO', // Agent Back Office
  ChefAgence = 'CA', // Chef Agence
  ChefAgenceAdjoint = 'CAA', // Chef d'Agence Adjoint
  AgentCommercialJunior = 'ACJ', // Agent Commercial Junior
  ChargeDeveloppementCommercial = 'CDC', // Chargé de Developpement Commercial
  AnalysteRisque = 'AR', // Analyste Risque
  GestionnairePortefeuilles = 'GP', // Gestionnaire de portefeuilles
  GestionnairePortefeuillesJunior = 'GPJ', // Gestionnaire de portefeuilles Junior
  responsableClient = 'RC', // Responsable Client
  assistanteClientelePME = 'ASSC_PME', // Assistante Clientele PME
  ResponsableClientelePME = 'RESPO_CLT_PME', // Responsable Clientele PME
  ResponsableFrontOffice = 'RESPO_FO', // Responsable Front Office
  agentAccueil = 'AGENT_ACC', // Agent Accueil
  conseilClientele = 'CC', // Conseillé Clientèle
  ResponsableExploitation = 'RESPO_EXPL', // Responsable Exploitation ou Chef de département exploitation
  SuperviseurRisqueZone = 'SUP_RISQ_ZONE', // Superviseur Risque Zone
  ChargeDuComite = 'CHARGE_COMIT', // CHARGE DU COMITE
  ResponsableRegional = 'RESPO_RGL', // Responsable Regional
  Chargedepartementcredit = 'CDCR', // Charge du departement de credit
  ResponsableJuridique = 'RESPO_JURIDIQUE', // Responsable Juridique
  ResponsableAssurance = 'RESPO_ASSUR', // Responsable Assurance
  ChefEquipe = 'CE', // Chef d'équipe
  ChefUnitePolyvalent = 'CUP', //  Chef d'Unité Polyvalent
  SuperviseurPME = 'SUP_PME',
  ResponsableClienteleTPE = 'RESPO_CLT_TPE', // Responsable Clientèle TPE
  ResponsableProduitAgricole = 'RESPO_PROD_AGRI', // Responsable Produit Agricole
  ResponsableReseau = 'RESPO_RS', // Responsable Reseau
  AdministrationAudit = 'ADMIN_AUDIT', // Administration Audit
}
