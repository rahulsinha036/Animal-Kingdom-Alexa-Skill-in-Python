const Alexa = require('ask-sdk-core');
const animalUtils = require('./animalUtils');
const APLDocs = {
    launch: require('./apl/launchRequest.json'),
    recipe: require('./apl/animalIntent.json'),
    help: require('./apl/helpIntent.json'),
};

function supportsAPL(handlerInput) {
    const supportedInterfaces = Alexa.getSupportedInterfaces(handlerInput.requestEnvelope);
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface !== null && aplInterface !== undefined;
}

function launchScreen(handlerInput) {
    if (supportsAPL(handlerInput)) {
        handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.1',
            document: APLDocs.launch,
            datasources: generateLaunchScreenDatasource(handlerInput)
        });
    }
}

function helpScreen(handlerInput) {
    if (supportsAPL(handlerInput)) {
        handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.1',
            document: APLDocs.help,
            datasources: generateHelpScreenDatasource(handlerInput)
        });
    }
}

function recipeScreen(handlerInput, sauceItem) {
    // Get prompt & reprompt speech
    const speakOutput = sauceItem.instructions;
    const repromptOutput = handlerInput.t('ANIMAL_REPEAT_MESSAGE');
    // Only add APL directive if User's device supports APL
    if (supportsAPL(handlerInput)) {
        handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: 'animal-kingdom',
            version: '1.1',
            document: APLDocs.recipe,
            datasources: generateRecipeScreenDatasource(handlerInput, sauceItem)
        })
        .addDirective({
            type: 'Alexa.Presentation.APL.ExecuteCommands',
            token: 'animal-kingdom',
            commands: [{
                type: 'SpeakItem',
                componentId: 'recipeText',
                highlightMode: 'line',
            }],
        });
        // As speech will be done by APL Command (SpeakItem) Voice/Text sync
        // Save prompt & reprompt for repeat
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.speakOutput = speakOutput;
        sessionAttributes.repromptOutput = repromptOutput;
    } else {
        handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput);
    }
}

function generateLaunchScreenDatasource(handlerInput) {
    const animals = handlerInput.t('RECIPES');
    const randomRecipe = animalUtils.getRandomAnimal(handlerInput);
    const headerTitle = handlerInput.t('HEADER_TITLE', { skillName: handlerInput.t('SKILL_NAME') });
    const hintText = handlerInput.t('HINT_TEMPLATE', { sauce: randomRecipe.name });
    const saucesIdsToDisplay = ["LION", "COW", "TIGER", "CAT", "DONKEY", "ELEPHANT", "DOG", "CROW", "GIRAFFE", "MONKEY", "GOAT", "PANDA", "PEACOCK", "SPARROW", "PIGEON"];
    const sauces = [];
    Object.keys(animals).forEach((item) => {
        if (saucesIdsToDisplay.includes(item)) {
            let sauceItem = {
                id: item,
                image: animalUtils.getAnimalsImage(item),
                text: animals[item].name,
            };
            sauces.push(sauceItem);
        }
    });
    return {
        sauceBossData: {
            type: 'object',
            properties: {
                headerTitle: headerTitle,
                hintText: hintText,
                items: sauces
            },
            transformers: [
                {
                    inputPath: 'hintText',
                    transformer: 'textToHint',
                }
            ]
        }
    };
}

function generateRecipeScreenDatasource(handlerInput, sauceItem) {
    const randomSauce = animalUtils.getRandomAnimal(handlerInput);
    const headerTitle = handlerInput.t('ANIMAL_HEADER_TITLE', { sauce: sauceItem.name });
    const hintText = handlerInput.t('HINT_TEMPLATE', { sauce: randomSauce.name });
    return {
        sauceBossData: {
            type: 'object',
            properties: {
                headerTitle: headerTitle,
                headerBackButton: !Alexa.isNewSession(handlerInput.requestEnvelope),
                hintText: hintText,
                sauceImg: sauceItem.image,
                sauceText: sauceItem.instructions,
                sauceSsml: `<speak>${sauceItem.instructions}</speak>`
            },
            transformers: [
                {
                    inputPath: 'sauceSsml',
                    transformer: 'ssmlToSpeech',
                    outputName: 'sauceSpeech'
                },
                {
                    inputPath: 'hintText',
                    transformer: 'textToHint',
                }
            ]
        }
    };
}

function generateHelpScreenDatasource(handlerInput) {
    const animals = handlerInput.t('RECIPES');
    const headerTitle = handlerInput.t('HELP_HEADER_TITLE');
    const headerSubTitle = handlerInput.t('HELP_HEADER_SUBTITLE');
    const saucesIdsToDisplay = ["LION", "COW", "TIGER", "CAT", "DONKEY", "ELEPHANT", "DOG", "CROW", "GIRAFFE", "MONKEY", "GOAT", "PANDA", "PEACOCK", "SPARROW", "PIGEON"];
    const sauces = [];
    Object.keys(animals).forEach((item) => {
        if (saucesIdsToDisplay.includes(item)) {
            let sauceItem = {
                id: item,
                primaryText: handlerInput.t('HINT_TEMPLATE', { sauce: animals[item].name }),
            };
            sauces.push(sauceItem);
        }
    });
    return {
        sauceBossData: {
            headerTitle: headerTitle,
            headerSubtitle: headerSubTitle,
            headerBackButton: !Alexa.isNewSession(handlerInput.requestEnvelope),
            items: sauces
        }
    };
}

module.exports = {
    launchScreen,
    helpScreen,
    recipeScreen
} 