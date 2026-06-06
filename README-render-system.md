# RenderGPT Remotion System

Dieses Repository rendert kurze Erklärvideos über GitHub Actions und Remotion.

## Steuerung

Die Render-Maske liegt hier:

```txt
render-requests/current.json
```

Sobald diese Datei geändert wird, startet der Workflow:

```txt
.github/workflows/render-video.yml
```

## Output

Das Video wird nach dem Rendern als GitHub-Actions-Artifact hochgeladen.

Standard-Dateiname im Workflow:

```txt
out/video.mp4
```

## Lokaler Test

```bash
npm install
npm run render
```
