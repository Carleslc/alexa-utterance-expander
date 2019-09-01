# Alexa Utterance Expander
Write your Amazon Alexa utterances file in a simple-to-use DSL, and compile it to the full utterances.
Re-use placeholders, and let the compiler handle the work of creating the many variations.

# Usage

## Programmatically

Install

```bash
npm install alexa-utterance-expander
```

Require the library

```javascript
const UtteranceExpander = require('alexa-utterance-expander');
```

Define place holders
```javascript
console.log(UtteranceExpander(`
[game] game
[game] match
[game] round

[play] play
[play] start

PlayIntent [play] a [game]
`));
```
generates

```javascript
PlayIntent play a game
PlayIntent play a match
PlayIntent play a round
PlayIntent start a game
PlayIntent start a match
PlayIntent start a round
```

Some built-in placeholders
* PLEASE
* YES
* NO
* NEXT
* REPEAT
* STOP
* CANCEL
* STARTOVER
* HELP

## From Gulp#

```javascript
gulp.task('compile', function (cb) {
    fs.readFile(path.join(__dirname,'interaction-model','utterances-src.txt'),function(err,file){
          if(err) return cb(err);
               var expanded = UtteranceExpander(file);
                    fs.writeFile(path.join(__dirname,'interaction-model','utterances.txt'),expanded,cb);
                       
        });
         
    });
```

## From Jovo Language Model

Clone this repository and use **convert.js** tool to convert from [Jovo language model](https://www.jovo.tech/docs/model) to UtteranceExpander DSL:

`convert.js [input | output] inputFile outputFile`

**en-US.json**

```json
{
	"invocation": "my game",
	"intents": [
		{
			"name": "PlayIntent",
			"phrases": [
				"{play} a {game}"
			],
			"inputs": [
				{
					"name": "play",
					"type": "Play"
				},
				{
					"name": "game",
					"type": "Game"
				}
			]
		}
	],
	"inputTypes": [
		{
			"name": "Play",
			"values": [
				{
					"value": "play"
				},
				{
					"value": "start"
				}
			]
		},
		{
			"name": "Game",
			"values": [
				{
					"value": "game",
					"synonyms": [
						"match",
						"round"
					]
				}
			]
		}
	],
	"alexa": {
		"interactionModel": {
			"languageModel": {
				"intents": [
					{
						"name": "AMAZON.CancelIntent",
						"samples": []
					},
					{
						"name": "AMAZON.HelpIntent",
						"samples": []
					},
					{
						"name": "AMAZON.StopIntent",
						"samples": []
					},
					{
						"name": "AMAZON.NavigateHomeIntent",
						"samples": []
					}
				]
			}
		}
	}
}
```

***`$ node convert.js input en-US.json formattedInput`***

**formattedInput**

```
[play] play
[play] start

[game] game
[game] match
[game] round

PlayIntent [play] a [game]
```

***`$ node convert.js output formattedInput output`***

**output**

```
PlayIntent

play a game
start a game
play a match
start a match
play a round
start a round
```

You can copy these utterances to the intent bulk editor in alexa developer console.