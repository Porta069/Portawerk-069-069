// ─── Symbolbild je Gewerk ─────────────────────────────────────────────────────
// Kandidaten sind bei WerkPair anonym: kein Name, kein Foto, bis sie selbst
// freigeben. Damit sich eine Bewerbung trotzdem merken lässt, steht statt der
// Person ein echtes Foto aus dem Gewerk — eine Elektrowerkstatt sieht anders
// aus als eine Heizungsmontage, und genau daran erkennt man die Karte wieder.
//
// Die Zuordnung läuft über Stichworte statt über feste Schlüssel: die
// Bereichsbezeichnung kommt mal aus dem Gewerkekatalog ("Elektro"), mal aus
// der Auswahlliste der Registrierung ("Elektriker / Elektroniker"). Mit einer
// Tabelle exakter Schlüssel fiel die Hälfte auf das Ersatzbild zurück.

const REGELN: { stichworte: string[]; bild: string }[] = [
  { stichworte: ["elektr"], bild: "/images/elektriker-werkstatt.jpg" },
  { stichworte: ["shk", "sanitär", "sanitaer", "heizung", "klima", "lüftung", "lueftung", "installateur", "klempner", "anlagenmechaniker"], bild: "/images/shk-heizung.jpg" },
  { stichworte: ["maler", "lackier"], bild: "/images/maler-leiter.jpg" },
  { stichworte: ["tischler", "schreiner", "holz", "zimmer"], bild: "/images/tischler-hobel.jpg" },
  { stichworte: ["maurer", "beton", "fliesen", "trockenbau", "bau"], bild: "/images/maurer-ziegel.jpg" },
  { stichworte: ["metall", "schlosser", "schweiss", "kfz", "mechatronik"], bild: "/images/metallbau-schweisser.jpg" },
];

export const GEWERK_BILD_ERSATZ = "/images/hero-team-werkstatt.jpg";

/** Foto zum Gewerk — niemals die Person. */
export function gewerkBild(bereich: string | null | undefined): string {
  const text = (bereich ?? "").toLowerCase();
  const treffer = REGELN.find((r) => r.stichworte.some((w) => text.includes(w)));
  return treffer?.bild ?? GEWERK_BILD_ERSATZ;
}
