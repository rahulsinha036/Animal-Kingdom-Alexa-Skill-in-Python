const animals = require("./animals");

// List of localized strings (all locales)
module.exports = {
    en: {
        translation: {
            RECIPES: animals.en,
            SKILL_NAME: `Animal Kingdom`,
            HEADER_TITLE: `Welcome to {{skillName}}`,
            ANIMAL_HEADER_TITLE: `#LEARN {{sauce}} SPELLING!`,
            HELP_HEADER_TITLE: `HELP`,
            HELP_HEADER_SUBTITLE: `Select the animal to learn the spelling.`,
            WELCOME_MESSAGE: `Welcome to {{skillName}}. Here, you'll learn the spelling of different kinds of animals. Simply say animal name like Tiger or say help to learn more.`,
            WELCOME_REPROMPT: `For instructions on what you can say, please say help me.`,
            DISPLAY_CARD_TITLE: `{{skillName}}  - Spelling of {{sauce}}`,
            HELP_MESSAGE: `You can speak {{sauce}} to learn the spelling, or, else say exit ...`,
            HELP_REPROMPT: `Try to say the animal name to know the spelling, or else say exit ... `,
            STOP_MESSAGE: `Goodbye! See you tomorrow`,
            ANIMAL_REPEAT_MESSAGE: `Try saying repeat.`,
            ANIMAL_NOT_FOUND_WITH_ITEM_NAME: `I'm sorry, I currently do not know the spelling of {{sauce}}, we'll add it soon. Try to select other animal from the list or say help.`,
            ANIMAL_NOT_FOUND_WITHOUT_ITEM_NAME: `I'm sorry, I currently do not know the spelling of that animal. Try to to select other animal from the list or say help.`,
            ANIMAL_NOT_FOUND_REPROMPT: `Which animal's spelling would you like to learn first?`,
            ERROR_MESSAGE: `I'm sorry I didn't catch that. Can you reformulate please ?`,
            HINT_TEMPLATE: `Say {{sauce}} to know the spelling`,
            REFLECTOR_MESSAGE: `You just triggered {{intentName}}`
        }
    },
};