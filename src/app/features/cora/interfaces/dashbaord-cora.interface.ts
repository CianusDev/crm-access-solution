export interface DashboardCoraData {
  agencePrincipale: number;
  sousAgence: number;
  allDocs: number;
  docsAttValid: number;
  docsValid: number;
  docsRejete: number;
  docsAttGes: number;
  gestCoras: {
    id: number;
    nom: string;
    prenom: string;
    code: string | null;
    nbAgentValide: number;
    nbAgentEnAttente: number;
  }[];
  agentAttenteCDPD: number;
  agentAttenteDGA: number;
  agentAttenteAGBO: number;
}
