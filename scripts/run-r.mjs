import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const executable = process.env.RSCRIPT_PATH || (existsSync('D:/Rbin/R-4.4.1/bin/Rscript.exe') ? 'D:/Rbin/R-4.4.1/bin/Rscript.exe' : 'Rscript');
const args = process.argv.slice(2);
const script = args[0]?.endsWith('.R') ? args.shift() : 'scripts/actualizar_datos.R';
const result = spawnSync(executable, [script, ...args], { stdio: 'inherit' });
if (result.error) console.error(`No se pudo ejecutar R. Configurá RSCRIPT_PATH. ${result.error.message}`);
process.exit(result.status ?? 1);
