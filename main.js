const pokemonNumber = document.getElementById("pokemon-number");
const guessInput = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const guessList = document.getElementById("guess-list");
const suggestions = document.getElementById("suggestions");
const message = document.getElementById("message");
const surrenderButton = document.getElementById("surrender-button");
const replayButton = document.getElementById("replay-button");

let targetPokemon;
let speciesTarget;
let evolutionChainTarget;

let selectedPokemon;
let guesses = [];

let allPokemon = [];
let pokemonGuion = ["mr-mime","mr-rime","mime-jr","porygon-2","porygon-z","ho-oh","jangmo-o","hakamo-o","kommo-o"];
let removeGuion = ["nidoran-f","nidoram-m","mr-mime","mr-rime","mime-jr","type-null","tapu-koko","tapu-lele","tapu-bulu","tapu-fini","scream-tail","brute-bonnet","great-tusk","flutter-mane","slither-wing","sandy-shocks","iron-treads","iron-bundle","iron-hands","iron-jugulis","iron-moth","iron-thorns","roaring-moon","iron-valiant","walking-wake","iron-leaves","raging-bolt","gouging-fire","iron-boulder","iron-crown"];
let removeAfterGuion = [
    "deoxys","wormadam","giratina","shaymin","basculin","darmanitan",
    "frillish","jellicent","tornadus","thundurus","landorus",
    "keldeo","meloetta","pyroar","meowstic","aegislash",
    "pumpkaboo","gourgeist","zygarde","oricorio","lycanroc",
    "wishiwashi","minior","mimikyu","toxtricity","eiscue",
    "indeedee","morpeko","urshifu","basculegion","enamorus",
    "oinkologne","maushold","squawkabilly","palafin",
    "tatsugiri","dudunsparce"
];



let URL = "https://pokeapi.co/api/v2/pokemon/";
let speciesURL = "https://pokeapi.co/api/v2/pokemon-species/";
let evolutionLineURL = "https://pokeapi.co/api/v2/evolution-chain/";
let lineNumber = 1;
let promises = [];

for (let i = 1; i <= 1025; i++) {
    promises.push(
        fetch(URL + i)
            .then(res => res.json())
    );
}

Promise.all(promises).then(pokemon => {
    allPokemon=pokemon;
    startGame();
})

async function startGame(){
    const r = Math.floor(Math.random()*1025);
    targetPokemon = allPokemon[r];
    let speciesResponse = await fetch(targetPokemon.species.url);
    speciesTarget = await speciesResponse.json();
    let evolutionChainResponse = await fetch(speciesTarget.evolution_chain.url);
    evolutionChainTarget = await evolutionChainResponse.json();
    pokemonNumber.textContent = `#${String(targetPokemon.id).padStart(3,"0")}`
}

guessInput.addEventListener("input", () => {
    const search = guessInput.value.toLowerCase().trim();
    clearMessage();
    suggestions.innerHTML = "";

    if (search.length < 2) return;
    const filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.includes(search)
    );

    filteredPokemon.slice(0,5).forEach(pokemon => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion");
        let nombre = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        suggestion.innerHTML = `<img src="${pokemon.sprites.front_default}"> ${nombre}`

        suggestion.addEventListener("click", () => {
            selectedPokemon = pokemon;
            guessInput.value = nombre;
            suggestions.innerHTML = "";
        })

        suggestions.appendChild(suggestion);
    })
    
})

guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        const firstSuggestion = suggestions.querySelector(".suggestion");

        if (firstSuggestion) {
            firstSuggestion.click();
        } else if (selectedPokemon){
            checkGuess()
            guessInput.value="";
        } else{
            message.textContent = "Select a Pokemon.";
        }
    }
});

function clearMessage() {
    message.textContent = "";
}

guessButton.addEventListener("click", () => {
    if (!selectedPokemon){
        message.textContent = "Select a Pokemon.";
        return;
    }
    checkGuess();
})

function checkGuess(){
    if (guesses.includes(targetPokemon)){
        message.textContent = "¡Pokémon ya adivinado!";
        return;
    }

    const guess = guessInput.value.toLowerCase().trim();
    if (guess===targetPokemon.name){
        message.textContent = "¡Felicidades!"
    } else {
        message.textContent = "¡Incorrecto!";
    }
    addGuessList(guess);
}

function addGuessList(guess){
    const pokemon = allPokemon.find(pokemon => pokemon.name === guess);
    if (!pokemon || guesses.includes(pokemon)) return;
    guesses.push(pokemon);
    loadGuess(pokemon);
}

async function loadGuess(pokemon){
    const speciesResponse = await fetch(pokemon.species.url);
    const species = await speciesResponse.json();
    const evolutionChainResponse = await fetch(species.evolution_chain.url);
    const evolutionChain = await evolutionChainResponse.json();

    const type1 = pokemon.types[0].type.name.charAt(0).toUpperCase() + pokemon.types[0].type.name.slice(1);
    const type2 = pokemon.types[1] ? pokemon.types[1].type.name.charAt(0).toUpperCase() + pokemon.types[1].type.name.slice(1) : "None"
    const generation = formatGen(species.generation.name);
    const stage = getStage(pokemon.name, evolutionChain.chain, 1);
    const color = species.color.name.charAt(0).toUpperCase() + species.color.name.slice(1);
    const hints = getHints(pokemon, species, evolutionChain);

    guessList.innerHTML += `
        <div class="guess-row">
            <div class="pokemon-cell">
                <img src="${pokemon.sprites.front_default}">
            </div>
            <div class="hint ${hints.numberComp}">
                ${pokemon.id}
            </div>
            <div class="hint ${hints.type1Comp}">
                ${type1}
            </div>
            <div class="hint ${hints.type2Comp}">
                ${type2}
            </div>
            <div class="hint ${hints.generationComp}">
                ${generation}
            </div>
            <div class="hint ${hints.stageComp}">
                ${stage}
            </div>
            <div class="hint ${hints.colorComp}">
                ${color}
            </div>
        </div>
    `;
}

function formatGen(gen){
    switch (gen){
        case "generation-i": gen = "Generation I"; break;
        case "generation-ii": gen = "Generation II"; break;
        case "generation-iii": gen = "Generation III"; break;
        case "generation-iv": gen = "Generation IV"; break;
        case "generation-v": gen = "Generation V"; break;
        case "generation-vi": gen = "Generation VI"; break;
        case "generation-vii": gen = "Generation VII"; break;
        case "generation-viii": gen = "Generation VIII"; break;
        case "generation-ix": gen = "Generation IX"; break;
    }
    return gen;
}

function getStage(name, chain, currentStage){
    if (chain.species.name === name){
        return currentStage;
    }
    for (const evolution of chain.evolves_to){
        const result = getStage(name, evolution, currentStage+1);
        if (result != null) return result;
    }
    return null;
}

function getHints(guess, guessSpecies, guessChain){
    const guessStage = getStage(guess.name, guessChain.chain, 1);
    const targetStage = getStage(targetPokemon.name, evolutionChainTarget.chain, 1);

    let ans = {numberComp:"", type1Comp:"", type2Comp:"", generationComp:"", stageComp:"", colorComp:""}

    if (guess.id!==targetPokemon.id){
        ans.numberComp = guess.id<targetPokemon.id ? "partial" : "wrong";
    } else ans.numberComp = "correct";

    if (guess.types[0].type.name!==targetPokemon.types[0].type.name) 
        ans.type1Comp = "wrong"; 
    else ans.type1Comp = "correct";

    if ((guess.types[1] ? guess.types[1].type.name : "None") !== (targetPokemon.types[1] ? targetPokemon.types[1].type.name : "None"))
        ans.type2Comp = "wrong";
    else ans.type2Comp = "correct";

    if(guessSpecies.generation.name === speciesTarget.generation.name) 
        ans.generationComp = "correct";
    else ans.generationComp = compareGen(guessSpecies.generation.name, speciesTarget.generation.name)<0 ? "partial" : "wrong";

    if (guessStage !== targetStage)
        ans.stageComp = guessStage>targetStage ? "partial" : "wrong";
    else ans.stageComp = "correct";

    if (guessSpecies.color.name !== speciesTarget.color.name)
        ans.colorComp = "wrong";
    else ans.colorComp = "correct";

    return ans;
}

function compareGen(guessGen, targetGen){
    let gens = [guessGen, targetGen];

    for (let i=0; i<gens.length; i++){
        switch (gens[i]){
            case "generation-i": gens[i]=1; break;
            case "generation-ii": gens[i]=2; break;
            case "generation-iii": gens[i]=3; break;
            case "generation-iv": gens[i]=4; break;
            case "generation-v": gens[i]=5; break;
            case "generation-vi": gens[i]=6; break;
            case "generation-vii": gens[i]=7; break;
            case "generation-viii": gens[i]=8; break;
            case "generation-ix": gens[i]=9; break;
        }
    }    
    return gens[0]>gens[1] ? 1 : -1;
}

surrenderButton.addEventListener("click", () => {
    addGuessList(targetPokemon.name);
})

replayButton.addEventListener("click", () => {
    guesses = [];
    selectedPokemon = null;
    guessList.innerHTML = "";
    guessInput.value = "";
    message.textContent = "";
    startGame();
})

