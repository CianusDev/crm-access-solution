/**
 * Traite les messages d'erreur selon le code status HTTP.
 * @param statusCode Le code status HTTP de la réponse.
 * @returns Un message d'erreur adapté au code status.
 */
function traiterErreurParStatus(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Requête invalide (400).';
    case 401:
      return 'Non autorisé (401).';
    case 403:
      return 'Accès refusé (403).';
    case 404:
      return 'Ressource non trouvée (404).';
    case 500:
      return 'Erreur interne du serveur (500).';
    case 502:
      return 'Mauvaise passerelle (502).';
    case 503:
      return 'Service indisponible (503).';
    case 504:
      return "Délai d'attente dépassé (504).";
    default:
      return `Erreur inconnue (${statusCode}).`;
  }
}
