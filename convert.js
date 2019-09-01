const flatten = require('array-flatten');
const { writeFile, readFileSync } = require('fs');

const UtteranceExpander = require('./UtteranceExpander.js');

const DEBUG = true;

const COMMAND = process.argv[2];
const INPUT_FILE = process.argv[3];
const OUTPUT_FILE = process.argv[4];

function invalid() {
  console.log('convert.js [input | output] inputFile outputFile');
}

function getInputFile() {
  return readFileSync(INPUT_FILE, 'utf8');
}

function getInputTypes(input) {
  function merge(values) {
    return flatten(values.map(v => {
      let mergedValues = [v.value];
      if (v.synonyms) {
        mergedValues = mergedValues.concat(v.synonyms);
      }
      return mergedValues;
    }));
  }
  let inputTypes = {};
  input.inputTypes.forEach(type => inputTypes[type.name] = merge(type.values));
  return inputTypes;
}

function getIntentInputs(input) {
  let types = getInputTypes(input);
  let intentInputs = {};
  input.intents.forEach(intent => intent.inputs.forEach(intentInput => {
    let intentInputType = typeof intentInput.type === 'string' ? intentInput.type : intentInput.type.alexa;
    intentInputs[intentInput.name] = types[intentInputType];
  }));
  return intentInputs;
}

function getIntentPhrases(input) {
  let intentPhrases = {};
  input.intents.forEach(intent => intentPhrases[intent.name] = intent.phrases.map(phrase => phrase.replace(/\{/g, '[').replace(/\}/g, ']')));
  return intentPhrases;
}

function formatExpander(inputValues, formatter) {
  return Object.entries(inputValues)
    .map(intentValue => intentValue[1].map(value => formatter(intentValue[0], value)).join('\n')).join('\n\n');
}

function cleanOutput(output) {
  let INTENT_NAME_REGEX = /^(\w+) +([^\n]+)$/gm;
  let cleanLines = [];
  let lastIntentName = '';
  let match;
  while ((match = INTENT_NAME_REGEX.exec(output)) != null) {
    let intentName = match[1];
    if (lastIntentName !== intentName) {
      lastIntentName = intentName;
      cleanLines.push(`\n${intentName}\n`);
    }
    cleanLines.push(match[2]);
  }
  return cleanLines.join('\n').trim();
}

try {
  if (OUTPUT_FILE !== undefined) {
    if (COMMAND === 'input') {
      let input = JSON.parse(getInputFile());
      let intentInputs = formatExpander(getIntentInputs(input), (name, value) => `[${name}] ${value}`);
      let intentPhrases = formatExpander(getIntentPhrases(input), (name, value) => `${name} ${value}`);
      writeFile(OUTPUT_FILE, `${intentInputs}\n\n${intentPhrases}`, 'utf8', () => console.log(`Formatted language model -> ${OUTPUT_FILE}`));
    } else if (COMMAND === 'output') {
      writeFile(OUTPUT_FILE, cleanOutput(UtteranceExpander(getInputFile())), 'utf8', () => console.log(`Expanded Utterances -> ${OUTPUT_FILE}`));
    } else {
      invalid();
    }
  } else {
    invalid();
  }
} catch(e) {
  console.log(DEBUG ? e : e.message);
  invalid();
}
