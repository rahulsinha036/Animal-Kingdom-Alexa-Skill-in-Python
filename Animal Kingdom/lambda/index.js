const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./languageStrings');
const aplUtils = require('./aplUtils');
const animalUtils = require('./animalUtils');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const randomRecipe = animalUtils.getRandomAnimal(handlerInput);
    const speakOutput = handlerInput.t('WELCOME_MESSAGE', { skillName: handlerInput.t('SKILL_NAME'), sauce: randomRecipe.name });
    const repromptOutput = handlerInput.t('WELCOME_REPROMPT');
    aplUtils.launchScreen(handlerInput);
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const AnimalHandler = {
  canHandle(handlerInput) {
    return ((Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnimalIntent')
      || (Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
        && handlerInput.requestEnvelope.request.arguments.length > 0
        && handlerInput.requestEnvelope.request.arguments[0] === 'sauceInstructions'));
  },
  handle(handlerInput) {
    const animalItem = animalUtils.getanimalItem(handlerInput.requestEnvelope.request);
    return AnimalHandler.generateRecipeOutput(handlerInput, animalItem);
  },
  generateRecipeOutput(handlerInput, animalItem) {
    const { responseBuilder } = handlerInput;
    if (animalItem.id) {
      const animals = handlerInput.t('RECIPES');
      const selectedRecipe = animals[animalItem.id];
      Object.assign(animalItem, selectedRecipe);
      animalItem.image = animalUtils.getAnimalsImage(animalItem.id);
      // Add a Card (displayed in the Alexa App)
      const cardTitle = handlerInput.t('DISPLAY_CARD_TITLE', { skillName: handlerInput.t('SKILL_NAME'), sauce: animalItem.name });
      responseBuilder.withStandardCard(cardTitle, animalItem.image, animalItem.image).speak(animalItem.instructions);
      aplUtils.recipeScreen(handlerInput, animalItem);
    //   responseBuilder.speak(animalItem.instructions);
    } else {
      if (animalItem.spoken) {
        responseBuilder.speak(handlerInput.t('ANIMAL_NOT_FOUND_WITH_ITEM_NAME', { sauce: animalItem.spoken }));
      } else {
        responseBuilder.speak(handlerInput.t('ANIMAL_NOT_FOUND_WITHOUT_ITEM_NAME'));
      }
      responseBuilder.reprompt(handlerInput.t('ANIMAL_NOT_FOUND_REPROMPT'));
    }
    return responseBuilder.getResponse();
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const randomRecipe = animalUtils.getRandomAnimal(handlerInput);
    const speakOutput = handlerInput.t('HELP_MESSAGE', { sauce: randomRecipe.name });
    const repromptOutput = handlerInput.t('HELP_REPROMPT', { sauce: randomRecipe.name });
    aplUtils.helpScreen(handlerInput);
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const PreviousHandler = {
  canHandle(handlerInput) {
    return ((Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent')
      || (Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
        && handlerInput.requestEnvelope.request.arguments.length > 0
        && handlerInput.requestEnvelope.request.arguments[0] === 'goBack'));
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const actionnableHistory = sessionAttributes.actionnableHistory || [];
    let foundActionableRequestInHistory = false;
    let replayRequest;
    while (actionnableHistory.length > 0) {
      replayRequest = actionnableHistory.pop();
      if (replayRequest
        && replayRequest.actionable
        && foundActionableRequestInHistory) {
        if ((replayRequest.type === 'IntentRequest'
          && replayRequest.intent.name === 'AnimalIntent')
          || (replayRequest.type === 'Alexa.Presentation.APL.UserEvent')) {
          actionnableHistory.push(replayRequest);
          const animalItem = animalUtils.getanimalItem(replayRequest);
          return AnimalHandler.generateRecipeOutput(handlerInput, animalItem);
        }
        if (replayRequest.type === 'IntentRequest'
          && replayRequest.intent.name === 'AMAZON.HelpIntent') {
          actionnableHistory.push(replayRequest);
          return HelpHandler.handle(handlerInput);
        }
        break;
      }
      foundActionableRequestInHistory = replayRequest.actionable;
    }
    return LaunchRequestHandler.handle(handlerInput);
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('STOP_MESSAGE');
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = handlerInput.t('REFLECTOR_MESSAGE', { intentName: intentName });
    return handlerInput.responseBuilder
      .speak(speakOutput)
      //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = handlerInput.t('ERROR_MESSAGE');
    console.log(`~~~~ Error handled: ${error.stack}`);
    // Generate the JSON Response
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This request interceptor will bind a translation function 't' to the handlerInput
 */
const LocalizationInterceptor = {
  process(handlerInput) {
    const localisationClient = i18n.init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      resources: languageStrings,
      returnObjects: true
    });
    localisationClient.localise = function localise() {
      const args = arguments;
      const value = i18n.t(...args);
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    handlerInput.t = function translate(...args) {
      return localisationClient.localise(...args);
    }
  }
};

/**
 * This request interceptor will log all incoming requests in the associated Logs (CloudWatch) of the AWS Lambda functions
 */
const LoggingRequestInterceptor = {
  process(handlerInput) {
    console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
  }
};

/**
* This response interceptor will log all outgoing responses in the associated Logs (CloudWatch) of the AWS Lambda functions
*/
const LoggingResponseInterceptor = {
  process(handlerInput, response) {
    console.log(`Outgoing response: ${JSON.stringify(response)}`);
  }
};

const ResponseRepeatInterceptor = {
  process(handlerInput, response) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (response) {
      if (response.outputSpeech && response.outputSpeech.ssml) {
        let speakOutput = response.outputSpeech.ssml;
        speakOutput = speakOutput.replace('<speak>', '').replace('</speak>', '');
        sessionAttributes.speakOutput = speakOutput;
      }
      if (response.reprompt && response.reprompt.outputSpeech
        && response.reprompt.outputSpeech.ssml) {
        let repromptOutput = response.reprompt.outputSpeech.ssml;
        repromptOutput = repromptOutput.replace('<speak>', '').replace('</speak>', '');
        sessionAttributes.repromptOutput = repromptOutput;
      }
    }
  }
};

const ResponseActionnableHistoryInterceptor = {
  process(handlerInput, response) {
    const maxHistorySize = 5;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const actionnableHistory = sessionAttributes.actionnableHistory || [];
    const currentRequest = handlerInput.requestEnvelope.request;
    const recordRequest = {
      type: currentRequest.type,
      intent: {
        name: '',
        slots: {}
      },
      arguments: [],
      actionable: false
    };
    switch (currentRequest.type) {
      case 'IntentRequest':
        recordRequest.intent.name = currentRequest.intent.name;
        recordRequest.intent.slots = currentRequest.intent.slots;
        recordRequest.actionable = (["AnimalIntent", "AMAZON.HelpIntent"].includes(recordRequest.intent.name));
        break;
      case 'Alexa.Presentation.APL.UserEvent':
        recordRequest.arguments = currentRequest.arguments;
        recordRequest.actionable = (recordRequest.arguments[0] === 'sauceInstructions');
        break;
      case 'LaunchRequest':
        recordRequest.actionable = true;
        break;
      default:
        break;
    }
    if (actionnableHistory.length >= maxHistorySize) {
      actionnableHistory.shift();
    }
    if (recordRequest.actionable){
      actionnableHistory.push(recordRequest);
    }
    sessionAttributes.actionnableHistory = actionnableHistory;
  },
};

/**
 * The SkillBuilder acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom.
 */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AnimalHandler,
    HelpHandler,
    RepeatHandler,
    PreviousHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addRequestInterceptors(
    LoggingRequestInterceptor,
    LocalizationInterceptor
  )
  .addResponseInterceptors(
    LoggingResponseInterceptor,
    ResponseRepeatInterceptor,
    ResponseActionnableHistoryInterceptor
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sauce-boss/v2')
  .lambda();
