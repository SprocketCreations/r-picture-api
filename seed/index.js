require("dotenv").config();
const sequelize = require("../config/connection");
const { User, Comment, GalleryPicture, Like, GalleryUser, Gallery, Picture, PictureTag, Tag, UserUser } = require("../models");

const words = ["control", "seashore", "eager", "tangy", "attractive", "disgusted", "label", "quixotic", "engine", "table", "end", "auspicious", "scarf", "hesitant", "alcoholic", "deceive", "snotty", "flagrant", "call", "wild", "cows", "poison", "frail", "clean", "shake", "productive", "omniscient", "sniff", "mice", "thank", "freezing", "pets", "signal", "soothe", "develop", "absorbed", "watch", "internal", "remember", "misty", "efficacious", "disapprove", "icky", "heat", "robin", "boundary", "week", "extend", "string", "turn", "calculator", "wonderful", "fang", "request", "rings", "bomb", "room", "aspiring", "level", "bucket", "exultant", "roomy", "store", "trouble", "alike", "shocking", "elastic", "square", "delight", "heavy", "paste", "tacit", "twist", "club", "apparatus", "play", "inconclusive", "important", "comparison", "worthless", "glow", "wood", "scorch", "tent", "digestion", "supreme", "abnormal", "alive", "cruel", "pat", "sofa", "puncture", "winter", "guttural", "upset", "peaceful", "land", "eyes", "aberrant", "shivering", "interrupt", "gate", "tremendous", "known", "planes", "enormous", "sticks", "guard", "wipe", "fill", "knowledge", "flower", "powerful", "print", "panicky", "cowardly", "degree", "zipper", "stove", "hall", "swift", "boundless", "dolls", "hose", "unkempt", "bright", "unique", "dramatic", "spiders", "bouncy", "wealthy", "promise", "entertaining", "branch", "cover", "damage", "clip", "flimsy", "fall", "story", "bawdy", "furry", "wide", "excited", "flight", "illegal", "giants", "spotless", "toothbrush", "silky", "channel", "vase", "tiresome", "design", "succeed", "ubiquitous", "cold", "belong", "obese", "spoon", "phobic", "melodic", "squash", "hulking", "voyage", "yielding", "soap", "well-off", "educate", "sedate", "shave", "deep", "ugly", "unadvised", "pencil", "annoying", "fuel", "interest", "spoil", "hunt", "flat", "vanish", "tail", "distribution", "wrestle", "frog", "friendly", "observe", "pretty", "acrid", "recondite", "act", "system", "hands", "trucks", "juicy", "neck", "sack", "knowing", "zonked", "sip", "wax", "creator", "carve", "itch", "listen", "labored", "fowl", "second", "muscle", "bottle", "quick", "observant", "pour", "touch", "axiomatic", "enchanting", "whirl", "snow", "van", "repair", "cart", "uninterested", "general", "fascinated", "abortive", "elite", "dog", "outgoing", "cemetery", "angle", "spooky", "park", "exotic", "tickle", "many", "juvenile", "breakable", "determined", "blue-eyed", "tap", "private", "suck", "shelf", "birds", "high-pitched", "redundant", "collect", "tawdry", "classy", "punish", "yard", "search", "nimble", "birth", "inquisitive", "strengthen", "beginner", "paint", "meaty", "nasty", "house", "psychedelic", "old", "savory", "bathe", "frogs", "remind", "want", "unbecoming", "graceful", "appreciate", "property", "halting", "vacation", "sheep", "obnoxious", "company", "pretend", "jog", "scare", "thankful", "drown", "bulb", "bird", "discovery", "dare", "mate", "chase", "bumpy", "buzz", "introduce", "icy", "disarm", "tub", "afterthought", "pack", "decide", "melt", "maddening", "grape", "boast", "talented", "honey", "kind", "toes", "expert", "apparel", "number", "range", "pet", "opposite", "overrated", "bored", "mighty", "tall", "divide", "descriptive", "scold", "nifty", "toothsome", "feigned", "stream", "thing", "intend", "gleaming", "recognise", "accurate", "adjoining", "annoyed", "sad", "corn", "gullible", "hobbies", "calendar", "victorious", "suppose", "borrow", "example", "hammer", "needy", "wheel", "fire", "disappear", "wish", "roof", "crown", "female", "regular", "normal", "offend", "card", "pink", "roll", "admire", "float", "verdant", "rifle", "lowly", "one", "loaf", "nail", "arm", "moaning", "servant", "tested", "steer", "elfin", "voracious", "spot", "representative", "pathetic", "noiseless", "heap", "cast", "messy", "boot", "maniacal", "industry", "military", "shock", "humorous", "cave", "gray", "writer", "shaggy", "depressed", "recess", "current", "reproduce", "selection", "skillful", "bow", "angry", "crabby", "river", "flavor", "word", "oceanic", "nation", "comfortable", "kitty", "juggle", "beef", "add", "honorable", "satisfying", "marry", "rebel", "pocket", "dull", "chance", "hurt", "beneficial", "laughable", "screeching", "public", "addicted", "literate", "drunk", "surprise", "abounding", "can", "curve", "obeisant", "mass", "easy", "dynamic", "magical", "sassy", "thought", "ocean", "lethal", "dock", "dam", "deeply", "stormy", "drag", "secretary", "credit", "waste", "stupid", "self", "peace", "swim", "slow", "scream", "acidic", "scene", "knife", "drum", "limping", "whistle", "injure", "curl", "canvas", "entertain", "finicky", "hard", "sisters", "crawl", "airplane", "year", "ship", "invention", "income", "white", "debonair", "separate", "occur", "hook", "overwrought", "gaping", "agree", "balance", "laugh", "right", "remain", "wary", "spring", "profit", "plausible", "slimy", "elated", "empty", "soggy", "sugar", "milky", "raise", "refuse", "activity", "tug", "desert", "blink", "destruction", "gigantic", "fabulous", "wakeful", "pricey", "plantation", "object", "shop", "evasive", "eatable", "explode", "hospital", "pen", "suspend", "rustic", "prefer", "clam", "adventurous", "tight", "bite-sized", "harbor", "stem", "unnatural", "matter", "fat", "crayon", "cause", "majestic", "parcel", "duck", "black-and-white", "street", "delicate", "cheap", "mammoth", "slope", "periodic", "ice", "versed", "stocking", "business", "serious", "festive", "imaginary", "expand", "plug", "cloth", "poke", "cloistered", "believe", "dogs", "hurry", "tendency", "legal", "pedal", "ruin", "knee", "authority", "trap", "placid", "x-ray", "bang", "volatile", "materialistic", "rice", "breezy", "crowded", "check", "malicious", "kindly", "field", "tire", "sick", "foregoing", "argument", "fearful", "night", "brief", "caption", "cup", "letters", "fog", "yak", "lunchroom", "circle", "shirt", "spurious", "discussion", "third", "compete", "cultured", "medical", "zoo", "naughty", "escape", "bore", "zoom", "kiss", "frightening", "look", "move", "wealth", "concern", "boy", "abrasive", "dream", "volleyball", "quilt", "actually", "wrathful", "fry", "special", "haircut", "frame", "undress", "tasteful", "star", "blade", "gusty", "vast", "support", "bare", "plan", "warn", "thumb", "change", "pickle", "subsequent", "bitter", "bear", "momentous", "overflow", "burn", "baby", "press", "madly", "face", "lazy", "billowy", "locket", "texture", "faithful", "amuck", "advertisement", "vegetable", "attraction", "scary", "absurd", "experience", "snatch", "earsplitting", "industrious", "sudden", "educated", "partner", "well-to-do", "transport", "grandfather", "feeble", "magnificent", "paper", "competition", "burst", "bikes", "dapper", "invite", "nice", "snail", "hungry", "tender", "need", "insidious", "superb", "puffy", "anger", "shut", "teeny", "note", "peel", "fanatical", "beg", "march", "hill", "plot", "puzzling", "answer", "protest", "meeting", "nine", "incompetent", "coil", "acid", "wretched", "craven", "walk", "grin", "difficult", "death", "embarrassed", "root", "announce", "art", "hissing", "cable", "bee", "copper", "grouchy", "guiltless", "puny", "offbeat", "middle", "doctor", "encourage", "numerous", "sparkling", "protect", "sable", "repulsive", "increase", "toys", "hop", "talk", "stain", "rate", "painstaking", "various", "line", "fretful", "relation", "friction", "greet", "prickly", "glistening", "poor", "zinc", "charming", "fresh", "tray", "godly", "attend", "whip", "familiar", "alleged", "trees", "cuddly", "attempt", "ban", "psychotic", "school", "zippy", "home", "nut", "alarm", "analyze", "jaded", "visitor", "secretive", "skinny", "lace", "rightful", "question", "rest", "haunt", "diligent", "mixed", "unarmed", "exclusive", "jealous", "cool", "avoid", "melted", "tenuous", "draconian", "rapid", "parsimonious", "appliance", "terrific", "tin", "smooth", "instrument", "cough", "box", "great", "team", "sloppy", "mess up", "cap", "ragged", "peep", "ruthless", "quarter", "hollow", "children", "chop", "complain", "grip", "risk", "rainy", "instinctive", "ashamed", "overt", "pumped", "extra-small", "provide", "rescue", "wistful", "impress", "minister", "calculating", "ill-informed", "jumpy", "venomous", "elegant", "quiet", "flesh", "fireman", "dinosaurs", "tomatoes", "tie", "cry", "gabby", "silly", "error", "dreary", "film", "unwritten", "devilish", "sort", "zephyr", "stone", "abundant", "harmonious", "women", "stare", "permissible", "rotten", "slap", "quirky", "head", "sink", "awful", "flaky", "aboard", "respect", "ignorant", "narrow", "wiggly", "oil", "hushed", "desire", "stroke", "teeny-tiny", "fallacious", "unsuitable", "premium", "meddle", "cooing", "connect", "murder", "weary", "few", "achiever", "obsolete", "sleepy", "bone", "luxuriant", "unpack", "nonchalant", "cellar", "switch", "serve", "long-term", "homely", "lewd", "cactus", "count", "stranger", "claim", "bless", "hair", "pollution", "weak", "nonstop", "hanging", "perfect", "untidy", "rub", "rude", "bushes", "fixed", "wiry", "regret", "uptight", "size", "spiffy", "cheat", "zesty", "long", "solid", "fuzzy", "celery", "actor", "tough", "camera", "scale", "boiling", "scratch", "dizzy", "flame", "dirt", "yell", "precious", "summer", "shrug", "office", "science", "command", "sigh", "found", "unknown", "didactic", "share", "replace", "bloody", "rod", "library", "waggish", "strong", "amazing", "fumbling", "behavior", "standing", "jazzy", "fear", "reduce", "cloudy", "fine", "tree", "belief", "hover", "pop", "party", "stitch", "save", "approval", "ossified", "hour", "curtain", "improve", "absorbing", "island", "animal", "cycle", "employ", "previous", "scissors", "market", "clear", "approve", "stale", "account", "spy", "railway", "witty", "pipe", "mindless", "busy", "view", "handle", "superficial", "dress", "tense", "warlike", "earth", "collar", "large", "rambunctious", "tow", "gainful", "kittens", "value", "secret", "include", "friends", "fasten", "governor", "muddled", "learn", "cake", "fearless", "wonder", "arithmetic", "tooth", "cub", "tease", "chicken", "hug", "awesome", "rule", "skin", "mom", "purpose", "sophisticated", "tightfisted", "imagine", "optimal"];

const randomWord = () => words[Math.floor(words.length * Math.random())];
const randomWords = numberOfWords => {
	const selectedWords = [];
	for (let i = 0; i < numberOfWords; ++i) {
		selectedWords.push(randomWord());
	}
	return selectedWords.join(" ");
}

const generateUsers = numberOfUsers => {
	const users = [];
	for (let i = 0; i < numberOfUsers; ++i) {
		users.push({
			email: `${randomWord()}${i}@${randomWord()}.com`,
			password: `${randomWord()}${randomWord().toUpperCase()}#${i}`,
			displayName: randomWords(3),
			bio: randomWords(25),
		});
	}
	return users;
}

const generatePictures = (numberOfPictures, numberOfUsers) => {
	const pictures = [];
	for (let i = 0; i < numberOfPictures; ++i) {
		pictures.push({
			userId: Math.ceil(numberOfUsers * Math.random()),
			name: randomWords(5),
			description: randomWords(25),
			S3URL: "Test.url",
		});
	}
	return pictures;
}

const generateTags = numberOfTags => {
	const tags = [];
	for (let i = 0; i < numberOfTags; ++i) {
		tags.push({
			name: `${randomWord()}${i}`,
		});
	}
	return tags;
}

const generatePictureTags = (numberOfPictures, numberOfTags) => {
	const pictureTag = [];
	for (let i = 1; i < numberOfPictures + 1; ++i) {
		const tagIds = new Set();
		for (let j = 0; j < 5; ++j) {
			tagIds.add(Math.ceil(Math.random() * numberOfTags));
		}
		tagIds.forEach(tagId => {
			pictureTag.push({
				pictureId: i,
				tagId: tagId,
			});
		});
	}
	return pictureTag;
}

const generateComments = (numberOfComments, numberOfPictures, numberOfUsers) => {
	const comments = [];
	for (let i = 0; i < numberOfComments; ++i) {
		comments.push({
			userId: Math.ceil(numberOfUsers * Math.random()),
			pictureId: Math.ceil(numberOfPictures * Math.random()),
			text: randomWords(23)
		});
	}
	return comments;
}

const generateGalleries = (numberOfGalleries, numberOfUsers) => {
	const galleries = [];
	for (let i = 0; i < numberOfGalleries; ++i) {
		galleries.push({
			userId: Math.ceil(numberOfUsers * Math.random()),
			name: randomWords(2 + Math.round(Math.random())),
			description: randomWords(25)
		});
	}
	return galleries;
}

const generateGalleryPictures = (numberOfGalleries, numberOfPictures, numberOfUsers) => {
	const galleryPictures = [];
	for (let i = 0; i < numberOfPictures; ++i) {
		galleryPictures.push({
			userId: Math.ceil(numberOfUsers * Math.random()),
			galleryId: Math.ceil(numberOfGalleries * Math.random()),
			pictureId: Math.ceil(numberOfPictures * Math.random())
		});
	}
	return galleryPictures;
}

const generateGalleryUsers = (numberOfGalleries, numberOfUsers) => {
	const galleryUsers = [];
	for (let i = 1; i < numberOfUsers + 1; ++i) {
		const galleriesToFollow = new Set();
		for (let j = 0; j < 5; ++j){
			galleriesToFollow.add(Math.ceil(Math.random() * numberOfGalleries));
		}
		galleriesToFollow.forEach(galleryId => {
			galleryUsers.push({
				followerUserId: i,
				followedGalleryId: galleryId
			});
		});
	}
	return galleryUsers;
}

const generateLikes = (numberOfPictures, numberOfUsers) => {
	const likes = [];
	for (let i = 1; i < numberOfUsers + 1; ++i) {
		const picturesToLike = new Set();
		for (let j = 0; j < 50; ++j){
			picturesToLike.add(Math.ceil(Math.random() * numberOfPictures));
		}
		picturesToLike.forEach(pictureId => {
			likes.push({
				userId: i,
				pictureId: pictureId,
				delta: Math.random() > 0.5 ? 1 : -1
			});
		});
	}
	return likes;
}

const generateUserUsers = (numberOfUsers) => {
	const userUsers = [];
	for (let i = 1; i < numberOfUsers + 1; ++i) {
		const usersToFollow = new Set();
		for (let j = 0; j < 50; ++j){
			usersToFollow.add(Math.ceil(Math.random() * numberOfUsers));
		}
		// Users cannot follow themselves
		usersToFollow.delete(i);
		usersToFollow.forEach(pictureId => {
			userUsers.push({
				followerUserId: i,
				followedUserId: pictureId,
			});
		});
	}
	return userUsers;
}

const seed = async () => {
	try {
		await sequelize.sync({ force: true });

		const NUMBER_OF_USERS = 10;
		const NUMBER_OF_PICTURES = 10;
		const NUMBER_OF_TAGS = 100;
		const NUMBER_OF_COMMENTS = 100;
		const NUMBER_OF_GALLERIES = 10;

		//Create Users
		await User.bulkCreate(generateUsers(NUMBER_OF_USERS));
		//Create Pictures
		await Picture.bulkCreate(generatePictures(NUMBER_OF_PICTURES, NUMBER_OF_USERS));
		await Tag.bulkCreate(generateTags(NUMBER_OF_TAGS));
		await PictureTag.bulkCreate(generatePictureTags(NUMBER_OF_PICTURES, NUMBER_OF_TAGS));
		//Create Comments
		await Comment.bulkCreate(generateComments(NUMBER_OF_COMMENTS, NUMBER_OF_PICTURES, NUMBER_OF_USERS));

		//Create Galleries
		await Gallery.bulkCreate(generateGalleries(NUMBER_OF_GALLERIES, NUMBER_OF_USERS));
		await GalleryPicture.bulkCreate(generateGalleryPictures(NUMBER_OF_GALLERIES, NUMBER_OF_PICTURES, NUMBER_OF_USERS), { ignoreDuplicates: true });

		//Have users interact with things
		await GalleryUser.bulkCreate(generateGalleryUsers(NUMBER_OF_GALLERIES, NUMBER_OF_USERS));
		await Like.bulkCreate(generateLikes(NUMBER_OF_USERS, NUMBER_OF_PICTURES));
		await UserUser.bulkCreate(generateUserUsers(NUMBER_OF_USERS));

		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

seed();