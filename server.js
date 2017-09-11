const ApiAiApp = require('actions-on-google').ApiAiApp;
const requestHttp = require('request');
const express = require('express');
const bodyParser = require('body-parser');

const RECIPE_CHOOSE = 'recipe.choose';
const SHOW_INGREDIENTS = 'show.ingredients';
const SHOW_INSTRUCTIONS = 'show.instructions';

function ingredients(body) {
	// remove asterisks
	return body.originalIngredients.replace(/\*/g,'')+'\n\nDo you want to know the recipe?';
};

function confirmRecipe(title) {
	return 'Would you like to know the recipe for '+title+'?';
};

var server = express();
server.use(bodyParser.json());
server.post('/', function(request, response) {

	const app = new ApiAiApp({ request, response });

	function recipeChoose (app) {
		const recipe = app.getContextArgument('recipe_choosen', 'recipe');

		requestHttp({
			uri: 'http://forkthecookbook.com/search-recipes.json?q='+recipe.value,
			json: true
		}, 
			function(error, response, body){
				if (!error && response.statusCode == 200) {
					if(body != null && body.length>0) {
						const recipeBody=body[0];
						const title=recipeBody.title;
						const slug=recipeBody.slug;
						app.setContext('recipe_choosen', 1, {recipeSlug:slug});

						app.ask(confirmRecipe(title), []);
					}
					else {
						console.log('No recipes found');
						app.ask('I don\'t know that recipe. What would you like to cook instead?');
					}
				}
				else {
					console.log('Error searching recipe.');
					console.log('status code: '+response.statusCode);
					console.log('error: '+error);
				}

			});


	}

	function showIngredients (app) {
		const recipe = app.getContextArgument('recipe_choosen', 'recipe');
		const recipeSlug=app.getContextArgument('recipe_choosen', 'recipeSlug').value;

		requestHttp({
			uri: 'http://forkthecookbook.com/recipes/'+recipeSlug+'.json',
			json: true
		}, 
			function(error, response, body){
				if (!error && response.statusCode == 200) {
					app.ask(ingredients(body), []);
				}
				else {
					console.log('Error fetching ingredients.');
					console.log('status code: '+response.statusCode);
					console.log('error: '+error);
				}

			});

	}

	function showInstructions (app) {
		const recipeSlug=app.getContextArgument('recipe_choosen', 'recipeSlug').value;

		const instructionsStepArgument = app.getContextArgument('showing_instructions', 'instructionsStep');
		let step=0;
		if(instructionsStepArgument != null) {
			step = instructionsStepArgument.value;
		}


		requestHttp({
			uri: 'http://forkthecookbook.com/recipes/'+recipeSlug+'.json',
			json: true
		}, 
			function(error, response, body){
				if (!error && response.statusCode == 200) {
					if(body.instructions.length>step) {
						app.setContext('showing_instructions', 1, {instructionsStep:step+1});
						app.setContext('recipe_choosen', 1, {recipeSlug:recipeSlug});
						app.ask(body.instructions[step].instruction+'\n\nContinue?', []);
					}
					else {
						app.setContext('recipe_finished', 1);
						app.tell('Finished. Hope it is delicious!');
					}
				}
				else {
					console.log('Error fetching instructions.');
					console.log('status code: '+response.statusCode);
					console.log('error: '+error);
				}

			});
	}

	const actionMap = new Map();
	actionMap.set(RECIPE_CHOOSE, recipeChoose);
	actionMap.set(SHOW_INGREDIENTS, showIngredients);
	actionMap.set(SHOW_INSTRUCTIONS, showInstructions);

	app.handleRequest(actionMap);

});

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
const ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

server.listen(port, ip, function() {
	console.log('Server running on http://%s:%s', ip, port);
});

