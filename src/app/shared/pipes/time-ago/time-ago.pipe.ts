import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true, pure: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const datePassee = value instanceof Date ? value : new Date(value);
    if (isNaN(datePassee.getTime())) return '';

    const ms        = Date.now() - datePassee.getTime();
    const secondes  = ms / 1000;
    const minutes   = secondes / 60;
    const heures    = minutes / 60;
    const jours     = heures / 24;
    const semaines  = jours / 7;
    const mois      = jours / 30;
    const annees    = jours / 365;

    if (annees  >= 1) return Math.floor(annees)   + ' an' + (Math.floor(annees)  > 1 ? 's'  : '');
    if (mois    >= 1) return Math.floor(mois)      + ' mois';
    if (semaines >= 1) return Math.floor(semaines) + ' semaine' + (Math.floor(semaines) > 1 ? 's' : '');
    if (jours   >= 1) return Math.floor(jours)     + ' jour'    + (Math.floor(jours)   > 1 ? 's' : '');
    if (heures  >= 1) return Math.floor(heures)    + ' heure'   + (Math.floor(heures)  > 1 ? 's' : '');
    if (minutes >= 1) return Math.floor(minutes)   + ' minute'  + (Math.floor(minutes) > 1 ? 's' : '');
    return 'À l\'instant';
  }
}
