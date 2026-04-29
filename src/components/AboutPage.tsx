import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, RotateCcw, Upload } from 'lucide-react';

const EMULATORJS_DATA_PATH = 'https://cdn.emulatorjs.org/stable/data/';
const DEFAULT_WAD_URL = '/doom/freedoom2.wad';
const DEFAULT_WAD_NAME = 'freedoom2.wad';
const PRBOOM_CFG_URL = '/doom/prboom.cfg';

type WadSource =
  | { kind: 'url'; url: string }
  | { kind: 'file'; file: File };

export function AboutPage() {
  const [wadFileName, setWadFileName] = useState<string | null>(null);
  const [wadSource, setWadSource] = useState<WadSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instanceKey, setInstanceKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingUploadRef = useRef<File | null>(null);

  useEffect(() => {
    setWadFileName(DEFAULT_WAD_NAME);
    setWadSource({ kind: 'url', url: DEFAULT_WAD_URL });
  }, []);

  useEffect(() => {
    if (wadSource?.kind === 'file') {
      pendingUploadRef.current = wadSource.file;
    } else {
      pendingUploadRef.current = null;
    }
  }, [wadSource]);

  const postUploadedWadToIframe = async () => {
    const iframeWindow = iframeRef.current?.contentWindow;
    const file = pendingUploadRef.current;

    if (!iframeWindow || !file) return;

    // Transfer ArrayBuffer to avoid copying large WAD data.
    const buffer = await file.arrayBuffer();
    iframeWindow.postMessage(
      {
        type: 'EJS_UPLOAD_WAD',
        name: file.name,
        data: buffer,
      },
      '*',
      [buffer],
    );

    // Clear after sending so we don't accidentally send again.
    pendingUploadRef.current = null;
  };

  const iframeSrcDoc = useMemo(() => {
    if (!wadSource) return null;

    const safeCfgUrl = PRBOOM_CFG_URL.replaceAll('"', '%22');
    const safeLoaderUrl = `${EMULATORJS_DATA_PATH}loader.js`.replaceAll('"', '%22');

    const initialWadUrl = wadSource.kind === 'url' ? wadSource.url : null;
    const safeInitialWadUrl = initialWadUrl ? initialWadUrl.replaceAll('"', '%22') : '';
    const safeInitialName = (wadFileName ?? 'doom.wad').replaceAll('"', '%22');

    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOOM</title>
    <style>
      html, body { margin: 0; height: 100%; background: #000; }
      #game { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="game"></div>
    <script>
      window.EJS_player = "#game";
      window.EJS_core = "prboom";
      window.EJS_pathtodata = "${EMULATORJS_DATA_PATH}";
      window.EJS_startOnLoaded = true;
      window.EJS_threads = false;
      window.EJS_disableDatabases = true;
      window.EJS_disableLocalStorage = true;
      window.EJS_noAutoFocus = false;
      window.EJS_DEBUG_XX = false;

      function wadBaseName(name) {
        if (!name) return "doom";
        const justName = name.split("/").pop().split("#")[0].split("?")[0];
        return justName.toLowerCase().endsWith(".wad") ? justName.slice(0, -4) : justName;
      }

      function setCfgForWad(name) {
        const base = wadBaseName(name);
        // EmulatorJS writes non-compressed ROMs to the root (e.g. /freedoom2.wad),
        // so put cfg files in root too.
        window.EJS_externalFiles = {};
        window.EJS_externalFiles["/prboom.cfg"] = "${safeCfgUrl}";
        window.EJS_externalFiles["/" + base + ".prboom.cfg"] = "${safeCfgUrl}";
      }

      let started = false;
      function startEmulator() {
        if (started) return;
        started = true;
        const s = document.createElement('script');
        s.src = "${safeLoaderUrl}";
        document.body.appendChild(s);
      }

      // Default boot: URL based WAD.
      const initialUrl = ${wadSource.kind === 'url' ? '"' + safeInitialWadUrl + '"' : 'null'};
      if (initialUrl) {
        window.EJS_gameName = "${safeInitialName}";
        window.EJS_gameUrl = initialUrl;
        setCfgForWad(window.EJS_gameName);
        startEmulator();
      }

      // Upload boot: parent sends ArrayBuffer + filename.
      window.addEventListener('message', (ev) => {
        const msg = ev && ev.data;
        if (!msg || msg.type !== 'EJS_UPLOAD_WAD') return;
        try {
          const name = typeof msg.name === 'string' ? msg.name : 'custom.wad';
          const data = msg.data;
          if (!(data instanceof ArrayBuffer)) return;
          window.EJS_gameName = name;
          window.EJS_gameUrl = new File([data], name, { type: 'application/octet-stream' });
          setCfgForWad(name);
          startEmulator();
        } catch (e) {
          console.warn('Failed to start uploaded WAD', e);
        }
      });
    </script>
  </body>
</html>`;
  }, [wadSource, wadFileName]);

  const handleWadSelected = (file: File | null) => {
    setError(null);
    if (!file) return;

    const isWad = file.name.toLowerCase().endsWith('.wad');
    if (!isWad) {
      setError('Selecciona un archivo .wad');
      return;
    }

    setWadFileName(file.name);
    setWadSource({ kind: 'file', file });
    setInstanceKey((k) => k + 1);
  };

  const resetToFreedoom = () => {
    setError(null);
    setWadFileName(DEFAULT_WAD_NAME);
    setWadSource({ kind: 'url', url: DEFAULT_WAD_URL });
    setInstanceKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Acerca de: Generador de Documentos + <span className="text-red-800">DOOM (WASM)</span></h2>
            <p className="text-slate-600 mt-1">
              El sistema de generación de documentos es una herramienta que te permite obtener tu curp y acta de nacimiento para
              descargarlas en formato PDF. Sin embargo también puede ejecutar código WASM, así que puedes usar un pequeño emulador de DOOM 
              basado en EmulatorJS, esto ejecuta el motor en el navegador. Incluye un <span className="font-medium">WAD libre</span>{' '}
              (Freedoom) para jugar sin descargar nada, adicionalmente puedse agregar el que tu desees.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            href="https://freedoom.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            Descargar Freedoom (WAD libre) <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-5 flex flex-col md:flex-row items-start md:items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 cursor-pointer">
            <Upload className="w-4 h-4" />
            Cargar .wad
            <input
              type="file"
              accept=".wad"
              className="hidden"
              onChange={(e) => handleWadSelected(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="button"
            onClick={resetToFreedoom}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4" /> Volver a Freedoom
          </button>

          <div className="text-sm text-slate-600">
            {wadFileName ? (
              <span>
                WAD seleccionado: <span className="font-medium text-slate-900">{wadFileName}</span>
              </span>
            ) : (
              <span>Iniciando…</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          {iframeSrcDoc ? (
            <iframe
              key={instanceKey}
              ref={iframeRef}
              title="DOOM"
              className="w-full h-full"
              srcDoc={iframeSrcDoc}
              allow="autoplay; fullscreen; gamepad"
              onLoad={() => {
                // If we're booting an uploaded WAD, send it once the iframe is ready.
                void postUploadedWadToIframe();
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
              DOOM cargando…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
