const ANIMAL_IMAGES = {
    TIGER: "https://senecaparkzoo.org/wp-content/uploads/2016/01/Tiger-2017-Wayne-Smith-275-resized-500x500.jpg?x82903", //tiger
    LION: "https://mcdn.wallpapersafari.com/medium/22/41/HjTMF8.jpg", //lion
    DOG: "https://cdn.shopify.com/s/files/1/1238/6620/products/Dots-on-Blue-Dog_500x500.jpg?v=1537565193",//dog
    CAT: "https://i.redd.it/6giqv6zjkog21.jpg",//cat
    ELEPHANT: "https://globotours.net/wp-content/uploads/2014/10/Asian-Elephant-1-500x500.jpg",//elephant
    DONKEY: "https://i.pinimg.com/originals/43/b7/1a/43b71ac683ff687e54aa11564bb54ccf.jpg",//donkey
    COW: "https://www.absolutesoulsecrets.com/wp-content/uploads/2016/05/20160520-Cow-500x500.jpg",//cow
    CROW: "https://static.inaturalist.org/photos/40235543/medium.jpg?1559052693", //crow
    GIRAFFE: "https://cdn.shopify.com/s/files/1/0292/8781/articles/Giraffe_800x.jpg?v=1536620038",
    MONKEY: "https://www.burkemuseum.org/sites/default/files/images/biology/mammalogy/old-world-monkey-rowe-500x500.jpg",
    GOAT: "https://i0.wp.com/thetexaswildflower.com/wp-content/uploads/2018/09/Resources-for-raising-goats-THE-TEXAS-WILDFLOWER-SEPTEMBER-2018.png?fit=500%2C500&ssl=1",
    PANDA: "https://www.pandasinternational.org/wp-content/uploads/2019/07/%E5%8D%9A%E6%96%AF2018%E5%B9%B4%E4%BB%94Bo-Sis-2018-cub-10-500x500.jpg",
    PEACOCK: "https://www.nanseninitiative.org/wp-content/uploads/2014/01/peacock-500x500.jpg",
    SPARROW: "https://shelleyshayner.com/wp-content/uploads/2010/11/sparrow-500x500.jpg",
    PIGEON: "https://www.onlinepigeonauctions.com.au/auction/uploads/cache/34690E2C-24F5-45BD-997E-9B57DB56D943-500x500.jpeg"
};

const ANIMAL_DEFAULT_IMAGE = "https://mcdn.wallpapersafari.com/medium/22/41/HjTMF8.jpg";

module.exports = {


    getanimalItem(request){
        let animalItem = {};
        // Touch Event Request ?
        if (request.type === 'Alexa.Presentation.APL.UserEvent') {
            animalItem.id = request.arguments[1];
        } else {
            // Voice Intent Request
            const itemSlot = request.intent.slots["Item"];
            // Capture spoken value by the User
            if (itemSlot && itemSlot.value) {
                animalItem.spoken = itemSlot.value;
            }
            if (itemSlot &&
                itemSlot.resolutions &&
                itemSlot.resolutions.resolutionsPerAuthority[0] &&
                itemSlot.resolutions.resolutionsPerAuthority[0].status &&
                itemSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                animalItem.id = itemSlot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            }
        }
        return animalItem;
    },
    
    getRandomAnimal(handlerInput){
        const animals = handlerInput.t('RECIPES');
        const keys = Object.keys(animals);
        const randomIndex = Math.floor(Math.random() * keys.length);
        return animals[keys[randomIndex]];
    },

    getAnimalsImage(id){
        const url = ANIMAL_IMAGES[id];
        if (url){
            return url;
        }
        return ANIMAL_DEFAULT_IMAGE;
    }
}