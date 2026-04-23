SMART_LABELS = [
    # People / body / roles
    "Person", "People", "Man", "Woman", "Child", "Baby", "Toddler", "Teenager",
    "Adult", "Senior", "Face", "Portrait", "Close-Up Portrait", "Profile View",
    "Selfie", "Group Photo", "Crowd", "Smile", "Hands", "Eyes", "Beard", "Hair",
    "Sports Player", "Athlete", "Runner", "Cyclist", "Swimmer", "Dancer", "Musician",
    "Singer", "Guitarist", "Drummer", "Dj", "Chef", "Doctor", "Nurse", "Teacher",
    "Student", "Engineer", "Business Person", "Worker", "Construction Worker",
    "Police Officer", "Firefighter", "Farmer", "Artist", "Photographer", "Tourist",

    # Animals - general
    "Animal", "Pet", "Wild Animal", "Mammal", "Bird", "Fish", "Reptile", "Amphibian",
    "Insect", "Sea Animal",

    # Animals - common pets / farm
    "Dog", "Puppy", "Cat", "Kitten", "Rabbit", "Hamster", "Guinea Pig", "Parrot",
    "Canary", "Goldfish", "Horse", "Cow", "Sheep", "Goat", "Pig", "Chicken", "Rooster",
    "Duck", "Goose", "Turkey",

    # Animals - wildlife
    "Deer", "Moose", "Reindeer", "Fox", "Wolf", "Bear", "Panda", "Koala", "Monkey",
    "Gorilla", "Chimpanzee", "Kangaroo", "Lion", "Tiger", "Leopard", "Cheetah",
    "Elephant", "Giraffe", "Zebra", "Hippo", "Rhino", "Camel", "Otter", "Seal",
    "Dolphin", "Whale", "Shark", "Penguin", "Eagle", "Hawk", "Falcon", "Owl",
    "Swan", "Peacock", "Flamingo", "Butterfly", "Bee", "Spider",

    # Vehicles / transport
    "Vehicle", "Car", "Sports Car", "Race Car", "Classic Car", "Electric Car", "Taxi",
    "Police Car", "Ambulance", "Truck", "Pickup Truck", "Delivery Van", "Van", "Bus",
    "School Bus", "Motorcycle", "Scooter", "Bicycle", "Mountain Bike", "Train", "Tram",
    "Subway", "Airplane", "Passenger Plane", "Private Jet", "Helicopter", "Drone",
    "Boat", "Ship", "Ferry", "Sailboat", "Yacht", "Kayak", "Canoe", "Snowmobile",
    "Tractor", "Bulldozer", "Excavator",

    # Buildings / architecture / urban places
    "Building", "House", "Cabin", "Cottage", "Apartment Building", "Skyscraper",
    "Office Building", "Store", "Mall", "Restaurant", "Cafe", "Bar", "Bakery", "Hotel",
    "School", "University", "Hospital", "Church", "Mosque", "Temple", "Museum",
    "Library", "Theater", "Cinema", "Stadium", "Arena", "Airport", "Train Station",
    "Gas Station", "Factory", "Warehouse", "Bridge", "Tunnel", "Tower", "Castle",
    "Palace", "Monument", "Memorial", "Fountain",

    # Urban scenes
    "City", "Town", "Village", "Suburb", "Downtown", "Street", "Road", "Highway",
    "Intersection", "Crosswalk", "Sidewalk", "Parking Lot", "Playground", "Park",
    "Market", "Construction Site", "Harbor", "Port",

    # Nature / outdoor
    "Nature", "Landscape", "Forest", "Jungle", "Tree", "Flower", "Grass", "Field",
    "Farm", "Garden", "Mountain", "Hill", "Valley", "Cliff", "Cave", "Rock Formation",
    "Lake", "River", "Waterfall", "Stream", "Ocean", "Sea", "Beach", "Coast", "Island",
    "Desert", "Dune", "Volcano", "Glacier", "Snow", "Ice",

    # Weather / time / atmosphere
    "Sky", "Clouds", "Blue Sky", "Sunrise", "Sunset", "Night", "Day", "Golden Hour",
    "Fog", "Mist", "Rain", "Storm", "Lightning", "Rainbow",

    # Indoor rooms / environments
    "Indoor", "Kitchen", "Bathroom", "Bedroom", "Living Room", "Dining Room", "Office Room",
    "Classroom", "Library Interior", "Gym", "Garage", "Basement", "Hallway", "Studio",
    "Shop Interior", "Warehouse Interior", "Laboratory", "Restaurant Interior",

    # Technology / electronics
    "Technology", "Phone", "Smartphone", "Tablet", "Laptop", "Desktop Computer", "Monitor",
    "Keyboard", "Mouse", "Printer", "Camera", "Tripod", "Television", "Remote Control",
    "Headphones", "Earbuds", "Speaker", "Microphone", "Game Console", "Controller",
    "Smartwatch", "Watch", "Clock", "Robot",

    # Home / furniture / objects
    "Chair", "Table", "Desk", "Sofa", "Bed", "Lamp", "Mirror", "Window", "Door",
    "Curtain", "Shelf", "Cabinet", "Bookshelf", "Plant", "Vase", "Bottle", "Cup", "Mug",
    "Plate", "Bowl", "Fork", "Knife", "Spoon", "Backpack", "Suitcase", "Handbag",
    "Wallet", "Umbrella", "Key", "Glasses",

    # Food / drink
    "Food", "Meal", "Snack", "Dessert", "Drink", "Coffee", "Tea", "Juice", "Beer",
    "Wine", "Cocktail", "Water Bottle", "Pizza", "Burger", "Sandwich", "Hot Dog", "Taco",
    "Salad", "Soup", "Pasta", "Rice", "Sushi", "Bread", "Cake", "Donut", "Ice Cream",
    "Fruit", "Apple", "Banana", "Orange", "Lemon", "Grapes", "Strawberry", "Watermelon",
    "Vegetables",

    # Clothing / fashion
    "Clothing", "Fashion", "Shirt", "T-Shirt", "Sweater", "Hoodie", "Jacket", "Coat",
    "Suit", "Dress", "Skirt", "Jeans", "Shorts", "Shoes", "Sneakers", "Boots", "Sandals",
    "Hat", "Cap", "Helmet", "Scarf", "Gloves", "Uniform",

    # Sports / hobbies / activities
    "Sport", "Football", "Soccer", "Basketball", "Volleyball", "Baseball", "Tennis",
    "Golf", "Boxing", "Martial Arts", "Running", "Cycling", "Hiking", "Camping", "Climbing",
    "Skiing", "Snowboarding", "Skating", "Surfing", "Swimming", "Fishing", "Yoga",
    "Workout", "Concert", "Festival", "Party", "Wedding",

    # Art / media / culture
    "Art", "Painting", "Drawing", "Illustration", "Graffiti", "Street Art", "Sculpture",
    "Statue", "Poster", "Billboard", "Sign", "Text", "Book", "Notebook", "Pen", "Paper",

    # Materials / visual properties
    "Pattern", "Texture", "Reflection", "Shadow", "Silhouette", "Blur", "Bokeh", "Macro",
    "Glass", "Metal", "Wood", "Plastic", "Stone", "Ceramic",

    # Safety / infrastructure / symbols
    "Traffic Light", "Stop Sign", "Warning Sign", "Road Sign", "Flag", "Fence", "Barrier"
]

# Backward compatibility for existing imports.
SMART_LABELS_200 = SMART_LABELS
