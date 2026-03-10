export interface CoraManager {
  id: number;
  nom: string;
  prenom: string;
  code: string | null;
  nbAgentValide: number;
  nbAgentEnAttente: number;
}
