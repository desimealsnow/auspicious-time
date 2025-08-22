export function timeOfDayNotes(d: Date, activity: string): { boost: number; notes: string[] } {
  const h = d.getHours();
  const notes: string[] = [];
  let boost = 0;

  if (h >= 6 && h <= 11) { boost += 1; notes.push('Morning clarity (06:00–11:00) supports focus & momentum.'); }
  if (h >= 16 && h <= 19) { boost += 1; notes.push('Late-afternoon (16:00–19:00) is good for decisions & closures.'); }
  if (h >= 14 && h <= 16) { boost -= 1; notes.push('Post-lunch dip (14:00–16:00): guard against low energy.'); }

  if (h >= 23 || h < 5) {
    if (activity === 'spiritual' && h >= 4 && h < 6) {
      boost += 1; notes.push('Pre-dawn calm (≈04:00–06:00) favors spiritual work.');
    } else {
      boost -= 1; notes.push('Late night caution: sleep, mood & decision quality may suffer.');
    }
  }
  return { boost, notes };
}
