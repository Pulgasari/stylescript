#!/usr/bin/env node
// @stylescript/cli

/*
  stylescript main.ss                    -> main.css next to it
  stylescript styles/*.ss                every file, each next to its source
  stylescript main.ss -o dist/main.css   one file to a path of its own
  stylescript main.ss --stdout           the css to stdout
  stylescript styles --watch             compiled again on every change
*/

import { watch }                                     from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join }                    from 'node:path';

import compile from '../compiler/index.js';

const HELP = `stylescript <files or folders …> [-o out.css] [--stdout] [--watch]`;

function argsOf (argv) {
  const args = { inputs: [], out: null, stdout: false, watch: false };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if      (arg === '-o' || arg === '--out')   args.out    = argv[++index];
    else if (arg === '--stdout')                args.stdout = true;
    else if (arg === '-w' || arg === '--watch') args.watch  = true;
    else if (arg === '-h' || arg === '--help')  args.help   = true;
    else                                        args.inputs.push(arg);
  }
  return args;
}

// the .ss files of the inputs, folders walked
async function filesOf (inputs) {
  const files = [];
  for (const input of inputs) {
    if ((await stat(input)).isDirectory()) {
      for (const entry of await readdir(input, { recursive: true })) if (extname(entry) === '.ss') files.push(join(input, entry));
    }
    else files.push(input);
  }
  return files;
}

const cssPathOf = file => file.slice(0, -extname(file).length) + '.css';

async function build (file, { out, stdout }) {
  const css = compile(await readFile(file, 'utf8'));
  if (stdout) return process.stdout.write(css);
  const target = out ?? cssPathOf(file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, css);
  console.log(`${file} -> ${target}`);
}

async function main () {
  const args = argsOf(process.argv.slice(2));
  if (args.help || !args.inputs.length) return console.log(HELP);

  const files = await filesOf(args.inputs);
  if (args.out && files.length > 1) throw new Error('-o takes one input file');
  for (const file of files) await build(file, args);

  if (!args.watch) return;
  for (const file of files) watch(file, () => build(file, args).catch(error => console.error(error.message)));
  console.log('watching …');
}

main().catch(error => { console.error(`[stylescript] ${error.message}`); process.exitCode = 1; });
