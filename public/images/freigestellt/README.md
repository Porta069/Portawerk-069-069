# Freigestellte Bilder

Hintergrund entfernt mit rembg (U²-Net), lokal erzeugt. Die Originale in
`public/images/` sind unverändert — hier liegen nur zusätzliche Fassungen.

Je Motiv zwei Dateien: `.webp` für die Website (rund 85 % kleiner) und `.png`
als verlustfreie Reserve für weitere Bearbeitung.

## Verwendbar

| Datei | Motiv | Eignung |
|---|---|---|
| `maler-leiter` | Maler auf der Leiter, ganze Figur | sehr gut, klare Silhouette |
| `tischler-hobel` | Hobel auf Holz | sehr gut |
| `elektriker-werkstatt` | Mann über Sicherungskasten | gut, Schulterpartie etwas weich |
| `hero-team-werkstatt` | Zwei Handwerker | gut, links schwebt eine abgetrennte Hand — vor Verwendung beschneiden |
| `maurer-ziegel` | Ziegel mit Kelle | brauchbar, leichte Schlieren |

## Bewusst verworfen

- **shk-heizung** — das Modell hat den Heizkörper als Hintergrund entfernt,
  übrig blieben zwei schwebende Hände.
- **metallbau-schweisser** — Brenner und Funken teilweise verloren.
- **hero-werkstatt** — die Person kam als schwarze Silhouette heraus,
  Gegenlicht.

Bei diesen dreien gehört der Gegenstand zum Motiv. Das Modell isoliert immer
nur das Hauptobjekt und schneidet dabei genau das weg, was man behalten
wollte. Dort bleibt das Originalbild die bessere Wahl.

## Neu erzeugen

```python
from rembg import remove, new_session
from PIL import Image

sess = new_session("u2net")
out = remove(Image.open("public/images/DATEI.jpg"), session=sess)
out = out.crop(out.getchannel("A").getbbox())   # auf das Motiv zuschneiden
out.save("public/images/freigestellt/DATEI.webp", format="WEBP", quality=88, method=6)
```

Modell liegt unter `~/.u2net/u2net.onnx` und läuft offline.

## Wichtig

Freistellen ändert nichts an den Rechten. Die Motive stammen weiterhin aus
derselben Quelle wie die Originale; für erkennbare Personen braucht es
weiterhin eine Model-Freigabe.
