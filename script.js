document.addEventListener('DOMContentLoaded', () => {
    const POKEMON_TYPES = [
        "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground",
        "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Steel", "Dark", "Fairy"
    ];

    const gridContainer = document.getElementById('pokemon-grid-container');
    const addPersonBtn = document.getElementById('add-person-btn');
    const personNameInput = document.getElementById('person-name');
    
    const pokemonSelectionModal = document.getElementById('pokemon-selection-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalPokemonList = document.getElementById('modal-pokemon-list');
    const modalTitle = document.getElementById('modal-title');

    // Team Summary Modal Elements
    const viewSummaryBtn = document.getElementById('view-summary-btn');
    const teamSummaryModal = document.getElementById('team-summary-modal');
    const closeSummaryModalBtn = document.getElementById('close-summary-modal-btn');
    const summaryContent = document.getElementById('summary-content');
    const exportTeamBtn = document.getElementById('export-team-btn');

    // Store team data: { "TrainerName": { "TypeName": {name: "PokemonName", image: "path"}, ... }, ... }
    let teamData = {};
    // Store DOM elements for rows to easily update cells later
    const trainerRowCells = {};
    let fixedTrainerColumn; // Will hold the fixed trainer name column element

    // Helper function to update the display of a grid cell
    function updateGridCellDisplay(cell, pokemon) {
        cell.innerHTML = ''; // Clear previous content
        cell.title = ''; // Clear previous tooltip

        if (!pokemon || !pokemon.id) {
            // Cell remains empty or could have a placeholder if desired
            return;
        }

        const img = document.createElement('img');
        img.src = pokemon.image_path;
        img.alt = pokemon.name;
        img.classList.add('pokemon-image-in-cell');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('pokemon-name-in-cell');
        nameSpan.textContent = pokemon.name;

        // Handle image loading error: show name only
        img.onerror = () => {
            console.warn(`Image not found for ${pokemon.name} at ${pokemon.image_path}. Displaying name only.`);
            cell.innerHTML = ''; // Clear potentially broken img tag
            const errorNameSpan = nameSpan.cloneNode(true);
            cell.appendChild(errorNameSpan);
            cell.title = pokemon.name; // Set tooltip
        };

        cell.appendChild(img);
        cell.appendChild(nameSpan);
        cell.title = pokemon.name; // Set tooltip for full name (hover)
        syncAllRowHeights();
    }

    // --- Phase 1.5: Initial Grid Display (Restructured for Scrolling) ---
    function initializeGrid() {
        const mainContainer = gridContainer.parentElement; // Should be <main>
        mainContainer.removeChild(gridContainer); // Temporarily remove original gridContainer
        gridContainer.innerHTML = ''; // Clear original gridContainer as it will be reused

        // Create new structural elements
        const gridSystemWrapper = document.createElement('div');
        gridSystemWrapper.id = 'grid-system-wrapper';

        const gridScrollControls = document.createElement('div');
        gridScrollControls.id = 'grid-scroll-controls';

        const scrollLeftBtn = document.createElement('button');
        scrollLeftBtn.id = 'scroll-left-btn';
        scrollLeftBtn.innerHTML = '&lt;'; // <
        gridScrollControls.appendChild(scrollLeftBtn);

        const scrollRightBtn = document.createElement('button');
        scrollRightBtn.id = 'scroll-right-btn';
        scrollRightBtn.innerHTML = '&gt;'; // >
        gridScrollControls.appendChild(scrollRightBtn);

        const gridLayoutWrapper = document.createElement('div');
        gridLayoutWrapper.id = 'grid-layout-wrapper';

        fixedTrainerColumn = document.createElement('div'); // Assign to global
        fixedTrainerColumn.id = 'fixed-trainer-column';

        const scrollableTypesArea = document.createElement('div');
        scrollableTypesArea.id = 'scrollable-types-area';

        const typeHeadersContainer = document.createElement('div');
        typeHeadersContainer.id = 'type-headers-container';

        // Assemble the new structure
        scrollableTypesArea.appendChild(typeHeadersContainer);
        scrollableTypesArea.appendChild(gridContainer); // gridContainer now holds only Pokémon cells

        gridLayoutWrapper.appendChild(fixedTrainerColumn);
        gridLayoutWrapper.appendChild(scrollableTypesArea);

        gridSystemWrapper.appendChild(gridScrollControls);
        gridSystemWrapper.appendChild(gridLayoutWrapper);

        mainContainer.appendChild(gridSystemWrapper); // Add the new system to main

        // Populate Fixed Trainer Column Header
        const nameHeaderCell = document.createElement('div');
        nameHeaderCell.classList.add('grid-header-cell', 'grid-name-header');
        nameHeaderCell.textContent = 'Trainer';
        fixedTrainerColumn.appendChild(nameHeaderCell);

        // Populate Type Headers in Scrollable Area
        POKEMON_TYPES.forEach(type => {
            const headerCell = document.createElement('div');
            headerCell.classList.add('grid-header-cell', 'type-header-cell'); // Added 'type-header-cell' for specific styling
            headerCell.textContent = type;
            typeHeadersContainer.appendChild(headerCell);
        });

        // Configure gridContainer (now for Pokémon cells only) and typeHeadersContainer
        // They will have one column per Pokémon type.
        const pokemonCellGridLayout = POKEMON_TYPES.map(() => `minmax(120px, 1fr)`).join(' ');
        // gridContainer itself should stack rows vertically. Its grid-template-columns are not for individual type cells.
        // Each pokemon-cells-row will use pokemonCellGridLayout for its own columns.
        typeHeadersContainer.style.gridTemplateColumns = pokemonCellGridLayout; // Ensure alignment
        // gridContainer's display:grid is already set via CSS, so that should be fine.

        // Helper function to update scroll button states
        function updateScrollButtonStates() {
            const scrollAmount = scrollableTypesArea.clientWidth * 0.8; // Scroll by 80% of visible width
            // A small tolerance for floating point comparisons
            const tolerance = 1;

            scrollLeftBtn.disabled = scrollableTypesArea.scrollLeft <= tolerance;

            const maxScrollLeft = scrollableTypesArea.scrollWidth - scrollableTypesArea.clientWidth;
            scrollRightBtn.disabled = scrollableTypesArea.scrollLeft >= maxScrollLeft - tolerance;
        }

        // Add event listeners for scroll buttons
        scrollLeftBtn.addEventListener('click', () => {
            const scrollAmount = scrollableTypesArea.clientWidth * 0.8;
            scrollableTypesArea.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            // Update buttons after scroll animation (smooth behavior is async)
            setTimeout(updateScrollButtonStates, 300); // Adjust timeout if scroll is longer/shorter
        });

        scrollRightBtn.addEventListener('click', () => {
            const scrollAmount = scrollableTypesArea.clientWidth * 0.8;
            scrollableTypesArea.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            // Update buttons after scroll animation
            setTimeout(updateScrollButtonStates, 300);
        });

        // Initial state of scroll buttons
        // Use a small delay to ensure layout is stable for scrollWidth/clientWidth calculations
        setTimeout(updateScrollButtonStates, 100);
    setTimeout(syncAllRowHeights, 110); // Sync heights after initial layout
        // Also listen for window resize if the layout is responsive
        window.addEventListener('resize', () => setTimeout(updateScrollButtonStates, 100));
    }

    // Helper function to create and display a trainer's row in the UI
    function createAndDisplayTrainerRow(trainerName) {
        const fixedTrainerColumn = document.getElementById('fixed-trainer-column');
        if (!fixedTrainerColumn) {
            console.error('#fixed-trainer-column not found');
            return;
        }

        trainerRowCells[trainerName] = {}; // Initialize cell storage for this trainer's Pokémon cells

        // Create the name cell for the trainer (name and delete button)
        const nameCell = document.createElement('div');
        nameCell.classList.add('grid-name-cell'); // Existing class for styling
        nameCell.dataset.trainerName = trainerName; // For easier identification if needed
        
        const nameText = document.createElement('span');
        nameText.textContent = trainerName;
        nameCell.appendChild(nameText);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-trainer-btn');
        deleteBtn.innerHTML = '&times;'; // 'X' symbol
        deleteBtn.title = `Delete trainer ${trainerName}`;
        deleteBtn.dataset.trainer = trainerName;
        nameCell.appendChild(deleteBtn);

        fixedTrainerColumn.appendChild(nameCell); // Add name cell to the fixed column

        // Create a new row in the scrollable gridContainer for this trainer's Pokémon cells
        const pokemonCellsRow = document.createElement('div');
        pokemonCellsRow.classList.add('pokemon-cells-row');
        pokemonCellsRow.dataset.trainerName = trainerName; // For easier identification / deletion
        pokemonCellsRow.style.display = 'grid';
        // Ensure this layout matches typeHeadersContainer and gridContainer's overall column defs for types
        const typesColumnLayout = POKEMON_TYPES.map(() => `minmax(120px, 1fr)`).join(' '); 
        pokemonCellsRow.style.gridTemplateColumns = typesColumnLayout;
        
        // Create a Pokémon cell for each type in this trainer's row
        POKEMON_TYPES.forEach(type => {
            const typeCell = document.createElement('div');
            typeCell.classList.add('grid-pokemon-cell');
            typeCell.dataset.trainer = trainerName;
            typeCell.dataset.type = type;
            // Store reference for easy access
            trainerRowCells[trainerName][type] = typeCell;
            pokemonCellsRow.appendChild(typeCell);
        });

        gridContainer.appendChild(pokemonCellsRow); // Add the row of Pokémon cells to the main scrollable grid
        syncAllRowHeights(); // Add the row of Pokémon cells to the main scrollable grid
        saveTeamDataToLocalStorage(); // Save after adding new trainer row structure
    }

    // --- Phase 2: Row Management (Adding & Naming Persons) ---
    function handleAddPerson() {
        const trainerName = personNameInput.value.trim();
        if (!trainerName) {
            alert("Please enter a trainer's name.");
            return;
        }
        if (teamData.hasOwnProperty(trainerName)) {
            alert(`Trainer "${trainerName}" already exists.`);
            return;
        }

        // Initialize data structure for the new trainer
        teamData[trainerName] = {};
        
        createAndDisplayTrainerRow(trainerName);

        personNameInput.value = ''; // Clear input field
        console.log("Team Data:", teamData);
        console.log("Trainer Row Cells:", trainerRowCells);
        saveTeamDataToLocalStorage(); // Save after adding a person
    }

    // --- Phase 3: Pokémon Data & Selection Modal ---
    const POKEMON_DATA = {
        "SPRIGATITO": { name: "Sprigatito", types: ["Grass"], image_path: "Front/SPRIGATITO.png" },
        "FLORAGATO": { name: "Floragato", types: ["Grass"], image_path: "Front/FLORAGATO.png" },
        "MEOWSCARADA": { name: "Meowscarada", types: ["Grass", "Dark"], image_path: "Front/MEOWSCARADA.png" },
        "FUECOCO": { name: "Fuecoco", types: ["Fire"], image_path: "Front/FUECOCO.png" },
        "CROCALOR": { name: "Crocalor", types: ["Fire"], image_path: "Front/CROCALOR.png" },
        "SKELEDIRGE": { name: "Skeledirge", types: ["Fire", "Ghost"], image_path: "Front/SKELEDIRGE.png" },
        "QUAXLY": { name: "Quaxly", types: ["Water"], image_path: "Front/QUAXLY.png" },
        "QUAXWELL": { name: "Quaxwell", types: ["Water"], image_path: "Front/QUAXWELL.png" },
        "QUAQUAVAL": { name: "Quaquaval", types: ["Water", "Fighting"], image_path: "Front/QUAQUAVAL.png" },
        "LECHONK": { name: "Lechonk", types: ["Normal"], image_path: "Front/LECHONK.png" },
        "OINKOLOGNE": { name: "Oinkologne", types: ["Normal"], image_path: "Front/OINKOLOGNE.png" },
        "TAROUNTULA": { name: "Tarountula", types: ["Bug"], image_path: "Front/TAROUNTULA.png" },
        "SPIDOPS": { name: "Spidops", types: ["Bug"], image_path: "Front/SPIDOPS.png" },
        "NYMBLE": { name: "Nymble", types: ["Bug"], image_path: "Front/NYMBLE.png" },
        "LOKIX": { name: "Lokix", types: ["Bug", "Dark"], image_path: "Front/LOKIX.png" },
        "PAWMI": { name: "Pawmi", types: ["Electric"], image_path: "Front/PAWMI.png" },
        "PAWMO": { name: "Pawmo", types: ["Electric", "Fighting"], image_path: "Front/PAWMO.png" },
        "PAWMOT": { name: "Pawmot", types: ["Electric", "Fighting"], image_path: "Front/PAWMOT.png" },
        "TANDEMAUS": { name: "Tandemaus", types: ["Normal"], image_path: "Front/TANDEMAUS.png" },
        "MAUSHOLD": { name: "Maushold", types: ["Normal"], image_path: "Front/MAUSHOLD.png" },
        "FIDOUGH": { name: "Fidough", types: ["Fairy"], image_path: "Front/FIDOUGH.png" },
        "DACHSBUN": { name: "Dachsbun", types: ["Fairy"], image_path: "Front/DACHSBUN.png" },
        "SMOLIV": { name: "Smoliv", types: ["Grass", "Normal"], image_path: "Front/SMOLIV.png" },
        "DOLLIV": { name: "Dolliv", types: ["Grass", "Normal"], image_path: "Front/DOLLIV.png" },
        "ARBOLIVA": { name: "Arboliva", types: ["Grass", "Normal"], image_path: "Front/ARBOLIVA.png" },
        "SQUAWKABILLY": { name: "Squawkabilly", types: ["Normal", "Flying"], image_path: "Front/SQUAWKABILLY.png" },
        "NACLI": { name: "Nacli", types: ["Rock"], image_path: "Front/NACLI.png" },
        "NACLSTACK": { name: "Naclstack", types: ["Rock"], image_path: "Front/NACLSTACK.png" },
        "GARGANACL": { name: "Garganacl", types: ["Rock"], image_path: "Front/GARGANACL.png" },
        "CHARCADET": { name: "Charcadet", types: ["Fire"], image_path: "Front/CHARCADET.png" },
        "ARMAROUGE": { name: "Armarouge", types: ["Fire", "Psychic"], image_path: "Front/ARMAROUGE.png" },
        "CERULEDGE": { name: "Ceruledge", types: ["Fire", "Ghost"], image_path: "Front/CERULEDGE.png" },
        "TADBULB": { name: "Tadbulb", types: ["Electric"], image_path: "Front/TADBULB.png" },
        "BELLIBOLT": { name: "Bellibolt", types: ["Electric"], image_path: "Front/BELLIBOLT.png" },
        "WATTREL": { name: "Wattrel", types: ["Electric", "Flying"], image_path: "Front/WATTREL.png" },
        "KILOWATTREL": { name: "Kilowattrel", types: ["Electric", "Flying"], image_path: "Front/KILOWATTREL.png" },
        "MASCHIFF": { name: "Maschiff", types: ["Dark"], image_path: "Front/MASCHIFF.png" },
        "MABOSSTIFF": { name: "Mabosstiff", types: ["Dark"], image_path: "Front/MABOSSTIFF.png" },
        "SHROODLE": { name: "Shroodle", types: ["Poison", "Normal"], image_path: "Front/SHROODLE.png" },
        "GRAFAIAI": { name: "Grafaiai", types: ["Poison", "Normal"], image_path: "Front/GRAFAIAI.png" },
        "BRAMBLIN": { name: "Bramblin", types: ["Grass", "Ghost"], image_path: "Front/BRAMBLIN.png" },
        "BRAMBLEGHAST": { name: "Brambleghast", types: ["Grass", "Ghost"], image_path: "Front/BRAMBLEGHAST.png" },
        "TOEDSCOOL": { name: "Toedscool", types: ["Ground", "Grass"], image_path: "Front/TOEDSCOOL.png" },
        "TOEDSCRUEL": { name: "Toedscruel", types: ["Ground", "Grass"], image_path: "Front/TOEDSCRUEL.png" },
        "KLAWF": { name: "Klawf", types: ["Rock"], image_path: "Front/KLAWF.png" },
        "CAPSAKID": { name: "Capsakid", types: ["Grass"], image_path: "Front/CAPSAKID.png" },
        "SCOVILLAIN": { name: "Scovillain", types: ["Grass", "Fire"], image_path: "Front/SCOVILLAIN.png" },
        "RELLOR": { name: "Rellor", types: ["Bug"], image_path: "Front/RELLOR.png" },
        "RABSCA": { name: "Rabsca", types: ["Bug", "Psychic"], image_path: "Front/RABSCA.png" },
        "FLITTLE": { name: "Flittle", types: ["Psychic"], image_path: "Front/FLITTLE.png" },
        "ESPATHRA": { name: "Espathra", types: ["Psychic"], image_path: "Front/ESPATHRA.png" },
        "TINKATINK": { name: "Tinkatink", types: ["Fairy", "Steel"], image_path: "Front/TINKATINK.png" },
        "TINKATUFF": { name: "Tinkatuff", types: ["Fairy", "Steel"], image_path: "Front/TINKATUFF.png" },
        "TINKATON": { name: "Tinkaton", types: ["Fairy", "Steel"], image_path: "Front/TINKATON.png" },
        "WIGLETT": { name: "Wiglett", types: ["Water"], image_path: "Front/WIGLETT.png" },
        "WUGTRIO": { name: "Wugtrio", types: ["Water"], image_path: "Front/WUGTRIO.png" },
        "BOMBIRDIER": { name: "Bombirdier", types: ["Flying", "Dark"], image_path: "Front/BOMBIRDIER.png" },
        "FINIZEN": { name: "Finizen", types: ["Water"], image_path: "Front/FINIZEN.png" },
        "PALAFIN": { name: "Palafin", types: ["Water"], image_path: "Front/PALAFIN.png" },
        "VAROOM": { name: "Varoom", types: ["Steel", "Poison"], image_path: "Front/VAROOM.png" },
        "REVAVROOM": { name: "Revavroom", types: ["Steel", "Poison"], image_path: "Front/REVAVROOM.png" },
        "CYCLIZAR": { name: "Cyclizar", types: ["Dragon", "Normal"], image_path: "Front/CYCLIZAR.png" },
        "ORTHWORM": { name: "Orthworm", types: ["Steel"], image_path: "Front/ORTHWORM.png" },
        "GLIMMET": { name: "Glimmet", types: ["Rock", "Poison"], image_path: "Front/GLIMMET.png" },
        "GLIMMORA": { name: "Glimmora", types: ["Rock", "Poison"], image_path: "Front/GLIMMORA.png" },
        "GREAVARD": { name: "Greavard", types: ["Ghost"], image_path: "Front/GREAVARD.png" },
        "HOUNDSTONE": { name: "Houndstone", types: ["Ghost"], image_path: "Front/HOUNDSTONE.png" },
        "FLAMIGO": { name: "Flamigo", types: ["Flying", "Fighting"], image_path: "Front/FLAMIGO.png" },
        "CETODDLE": { name: "Cetoddle", types: ["Ice"], image_path: "Front/CETODDLE.png" },
        "CETITAN": { name: "Cetitan", types: ["Ice"], image_path: "Front/CETITAN.png" },
        "VELUZA": { name: "Veluza", types: ["Water", "Psychic"], image_path: "Front/VELUZA.png" },
        "DONDOZO": { name: "Dondozo", types: ["Water"], image_path: "Front/DONDOZO.png" },
        "TATSUGIRI": { name: "Tatsugiri", types: ["Dragon", "Water"], image_path: "Front/TATSUGIRI.png" },
        "ANNIHILAPE": { name: "Annihilape", types: ["Fighting", "Ghost"], image_path: "Front/ANNIHILAPE.png" },
        "CLODSIRE": { name: "Clodsire", types: ["Poison", "Ground"], image_path: "Front/CLODSIRE.png" },
        "FARIGIRAF": { name: "Farigiraf", types: ["Normal", "Psychic"], image_path: "Front/FARIGIRAF.png" },
        "DUDUNSPARCE": { name: "Dudunsparce", types: ["Normal"], image_path: "Front/DUDUNSPARCE.png" },
        "KINGAMBIT": { name: "Kingambit", types: ["Dark", "Steel"], image_path: "Front/KINGAMBIT.png" },
        "GREATTUSK": { name: "Great Tusk", types: ["Ground", "Fighting"], image_path: "Front/GREATTUSK.png" },
        "SCREAMTAIL": { name: "Scream Tail", types: ["Fairy", "Psychic"], image_path: "Front/SCREAMTAIL.png" },
        "BRUTEBONNET": { name: "Brute Bonnet", types: ["Grass", "Dark"], image_path: "Front/BRUTEBONNET.png" },
        "FLUTTERMANE": { name: "Flutter Mane", types: ["Ghost", "Fairy"], image_path: "Front/FLUTTERMANE.png" },
        "SLITHERWING": { name: "Slither Wing", types: ["Bug", "Fighting"], image_path: "Front/SLITHERWING.png" },
        "SANDYSHOCKS": { name: "Sandy Shocks", types: ["Electric", "Ground"], image_path: "Front/SANDYSHOCKS.png" },
        "IRONTHREADS": { name: "Iron Treads", types: ["Ground", "Steel"], image_path: "Front/IRONTHREADS.png" },
        "IRONMOTH": { name: "Iron Moth", types: ["Fire", "Poison"], image_path: "Front/IRONMOTH.png" },
        "IRONHANDS": { name: "Iron Hands", types: ["Fighting", "Electric"], image_path: "Front/IRONHANDS.png" },
        "IRONJUGULIS": { name: "Iron Jugulis", types: ["Dark", "Flying"], image_path: "Front/IRONJUGULIS.png" },
        "IRONTHORNS": { name: "Iron Thorns", types: ["Rock", "Electric"], image_path: "Front/IRONTHORNS.png" },
        "IRONBUNDLE": { name: "Iron Bundle", types: ["Ice", "Water"], image_path: "Front/IRONBUNDLE.png" },
        "IRONVALIANT": { name: "Iron Valiant", types: ["Fairy", "Fighting"], image_path: "Front/IRONVALIANT.png" },
        "TINGLU": { name: "Ting-Lu", types: ["Dark", "Ground"], image_path: "Front/TINGLU.png" },
        "CHIENPAO": { name: "Chien-Pao", types: ["Dark", "Ice"], image_path: "Front/CHIENPAO.png" },
        "WOCHIEN": { name: "Wo-Chien", types: ["Dark", "Grass"], image_path: "Front/WOCHIEN.png" },
        "CHIYU": { name: "Chi-Yu", types: ["Dark", "Fire"], image_path: "Front/CHIYU.png" },
        "ROARINGMOON": { name: "Roaring Moon", types: ["Dragon", "Dark"], image_path: "Front/ROARINGMOON.png" },
        "IRONLEAVES": { name: "Iron Leaves", types: ["Grass", "Psychic"], image_path: "Front/IRONLEAVES.png" },
        "WALKINGWAKE": { name: "Walking Wake", types: ["Water", "Dragon"], image_path: "Front/WALKINGWAKE.png" },
        "KORAIDON": { name: "Koraidon", types: ["Fighting", "Dragon"], image_path: "Front/KORAIDON.png" },
        "MIRAIDON": { name: "Miraidon", types: ["Electric", "Dragon"], image_path: "Front/MIRAIDON.png" },
        "OKIDOGI": { name: "Okidogi", types: ["Poison", "Fighting"], image_path: "Front/OKIDOGI.png" },
        "MUNKIDORI": { name: "Munkidori", types: ["Poison", "Psychic"], image_path: "Front/MUNKIDORI.png" },
        "FEZANDIPITI": { name: "Fezandipiti", types: ["Poison", "Fairy"], image_path: "Front/FEZANDIPITI.png" },
        "OGERPON": { name: "Ogerpon", types: ["Grass"], image_path: "Front/OGERPON.png" },
        "ARCHALUDON": { name: "Archaludon", types: ["Steel", "Dragon"], image_path: "Front/ARCHALUDON.png" },
        "HYDRAPPLE": { name: "Hydrapple", types: ["Grass", "Dragon"], image_path: "Front/HYDRAPPLE.png" },
        "GOUGINGFIRE": { name: "Gouging Fire", types: ["Fire", "Dragon"], image_path: "Front/GOUGINGFIRE.png" },
        "RAGINGBOLT": { name: "Raging Bolt", types: ["Electric", "Dragon"], image_path: "Front/RAGINGBOLT.png" },
        "IRONBOULDER": { name: "Iron Boulder", types: ["Rock", "Psychic"], image_path: "Front/IRONBOULDER.png" },
        "IRONCROWN": { name: "Iron Crown", types: ["Steel", "Psychic"], image_path: "Front/IRONCROWN.png" },
        "TERAPAGOS": { name: "Terapagos", types: ["Normal"], image_path: "Front/TERAPAGOS.png" },
        "PECHARUNT": { name: "Pecharunt", types: ["Poison", "Ghost"], image_path: "Front/PECHARUNT.png" }
    };

    function getPokemonOfType(type) {
        const pokemonOfType = [];
        for (const id in POKEMON_DATA) {
            if (POKEMON_DATA[id].types.includes(type)) {
                pokemonOfType.push({ id, ...POKEMON_DATA[id] });
            }
        }
        return pokemonOfType;
    }

    // --- Phase 3.2.4: Function to populate modal with Pokémon images of the relevant type ---
    function populateModal(pokemonArray, trainerName, pokemonType) {
        modalPokemonList.innerHTML = ''; // Clear previous Pokémon previews

        if (pokemonArray.length === 0) {
            const noPokemonMessage = document.createElement('p');
            noPokemonMessage.textContent = `No Pokémon of type "${pokemonType}" found in Gen 9 data.`;
            modalPokemonList.appendChild(noPokemonMessage);
            return;
        }

        pokemonArray.forEach(pokemon => {
            const previewDiv = document.createElement('div');
            previewDiv.classList.add('pokemon-preview');
            previewDiv.dataset.pokemonId = pokemon.id; // e.g., "SPRIGATITO"

            const img = document.createElement('img');
            img.src = pokemon.image_path;
            img.alt = pokemon.name;
            // Add error handling for images, though not strictly required by plan
            img.onerror = () => { 
                img.alt = `Image not found for ${pokemon.name}`;
                // Optionally, replace src with a placeholder image or style the broken image
            };

            const nameSpan = document.createElement('span');
            nameSpan.textContent = pokemon.name;

            previewDiv.appendChild(img);
            previewDiv.appendChild(nameSpan);
            modalPokemonList.appendChild(previewDiv);
        });
    }

    // --- Phase 3.2.3: Function to open modal on grid cell click ---
    function handleGridCellClick(event) {
        const clickedCell = event.target.closest('.grid-pokemon-cell');
        if (!clickedCell) {
            return; // Click was not on a Pokémon cell or its child
        }

        const trainerName = clickedCell.dataset.trainer;
        const pokemonType = clickedCell.dataset.type;

        if (!trainerName || !pokemonType) {
            console.error("Clicked cell is missing trainer or type data attributes.", clickedCell);
            return;
        }
        
        // Store current cell context on the modal itself for later use when a Pokémon is selected (Phase 4)
        pokemonSelectionModal.dataset.currentTargetCellTrainer = trainerName;
        pokemonSelectionModal.dataset.currentTargetCellType = pokemonType;

        modalTitle.textContent = `Select ${pokemonType} Pokémon for ${trainerName}`;
        
        const pokemonOfType = getPokemonOfType(pokemonType);
        populateModal(pokemonOfType, trainerName, pokemonType); // Call to (currently placeholder) populate function

        pokemonSelectionModal.style.display = 'flex'; // Show the modal
    }

    // --- Phase 4: Implementing Pokémon Selection ---
    // --- Phase 4.1.1 & 4.1.2 (Initial): Handle Pokémon selection in modal ---
    function handleModalPokemonSelect(event) {
        const clickedPreview = event.target.closest('.pokemon-preview');
        if (!clickedPreview) {
            return; // Click was not on a Pokémon preview or its child
        }

        const pokemonId = clickedPreview.dataset.pokemonId;
        const trainerName = pokemonSelectionModal.dataset.currentTargetCellTrainer;
        const pokemonType = pokemonSelectionModal.dataset.currentTargetCellType;

        if (!pokemonId || !trainerName || !pokemonType) {
            console.error("Missing data for Pokémon selection:", { pokemonId, trainerName, pokemonType });
            return;
        }

        // 4.1.2.1. Get the selected Pokémon's data
        const selectedPokemonData = POKEMON_DATA[pokemonId];
        if (!selectedPokemonData) {
            console.error(`Pokémon data not found for ID: ${pokemonId}`);
            return;
        }

        // 4.1.2.2. Update the corresponding cell in the main grid
        const targetCell = trainerRowCells[trainerName][pokemonType];

        // Construct the object for display, ensuring it has an 'id' property
        const pokemonToDisplay = {
            id: pokemonId,
            name: selectedPokemonData.name,
            image_path: selectedPokemonData.image_path
        };
        updateGridCellDisplay(targetCell, pokemonToDisplay);

        // 4.1.2.3. Store the selection
        if (!teamData[trainerName]) {
            teamData[trainerName] = {}; // Should already exist from handleAddPerson, but good practice
        }
        teamData[trainerName][pokemonType] = {
            id: pokemonId,
            name: selectedPokemonData.name,
            image_path: selectedPokemonData.image_path
        };
        console.log("Updated Team Data:", teamData);
        saveTeamDataToLocalStorage(); // Save after Pokémon selection

        // 4.1.2.4. Close the modal
        pokemonSelectionModal.style.display = 'none';
    }

    // --- Phase 6.1.1: Save team compositions to localStorage ---
    function saveTeamDataToLocalStorage() {
        const orderedTrainerNameElements = document.querySelectorAll('.grid-name-cell');
        const trainersOrder = Array.from(orderedTrainerNameElements).map(cell => {
            const nameSpan = cell.querySelector('span');
            return nameSpan ? nameSpan.textContent : ''; 
        }).filter(name => name !== '');

        const filteredSelections = {};
        trainersOrder.forEach(trainerName => {
            if (teamData.hasOwnProperty(trainerName)) {
                filteredSelections[trainerName] = teamData[trainerName];
            }
        });

        const dataToSave = {
            trainersOrder: trainersOrder,
            selections: filteredSelections
        };

        try {
            localStorage.setItem('pokemonTeamBuilderData', JSON.stringify(dataToSave));
            console.log('Team data saved to localStorage.');
        } catch (e) {
            console.error('Failed to save team data to localStorage:', e);
        }
    }

    // --- Phase 6.1.2: Load team compositions from localStorage ---
    function loadTeamDataFromLocalStorage() {
        const savedDataString = localStorage.getItem('pokemonTeamBuilderData');
        if (!savedDataString) {
            console.log('No saved team data found in localStorage.');
            return;
        }

        try {
            const savedData = JSON.parse(savedDataString);
            if (savedData && savedData.trainersOrder && savedData.selections) {
                teamData = savedData.selections; // Restore teamData object

                // Rebuild the grid rows based on the saved order and data
                savedData.trainersOrder.forEach(trainerName => {
                    createAndDisplayTrainerRow(trainerName); // Create the UI row

                    // Populate Pokémon in the row if selections exist
                    if (teamData[trainerName]) {
                        POKEMON_TYPES.forEach(type => {
                            const selectedPokemonInfo = teamData[trainerName][type];
                            if (selectedPokemonInfo && selectedPokemonInfo.id) {
                                const targetCell = trainerRowCells[trainerName][type];
                                updateGridCellDisplay(targetCell, selectedPokemonInfo);
                                }
                        });
                    }
                });
                console.log('Team data loaded from localStorage.');
            } else {
                console.warn('Saved data in localStorage is not in the expected format.');
            }
        } catch (e) {
            console.error('Failed to load or parse team data from localStorage:', e);
        }


    }

function syncAllRowHeights() {
    // Sync data rows
    const dataNameCells = Array.from(fixedTrainerColumn.querySelectorAll('.grid-name-cell:not(.grid-name-header)'));
    const dataPokemonRows = Array.from(gridContainer.querySelectorAll('.pokemon-cells-row')); // gridContainer is #pokemon-grid-container

    const numDataRows = Math.min(dataNameCells.length, dataPokemonRows.length);
    for (let i = 0; i < numDataRows; i++) {
        dataNameCells[i].style.height = 'auto'; // Reset to natural height
        dataPokemonRows[i].style.height = 'auto'; // Reset to natural height

        const pokemonRowHeight = dataPokemonRows[i].offsetHeight;
        const nameCellNaturalHeight = dataNameCells[i].offsetHeight;

        const targetHeight = Math.max(pokemonRowHeight, nameCellNaturalHeight);

        dataNameCells[i].style.height = `${targetHeight}px`;
        dataPokemonRows[i].style.height = `${targetHeight}px`; // Ensure Pokémon row also respects this if name cell was taller
    }

    // Sync header row
    const nameHeader = fixedTrainerColumn.querySelector('.grid-name-header');
    const typeHeadersContainer = document.getElementById('type-headers-container');

    if (nameHeader && typeHeadersContainer) {
        nameHeader.style.height = 'auto';
        typeHeadersContainer.style.height = 'auto';

        const nameHeaderNaturalHeight = nameHeader.offsetHeight;
        const typeHeadersContainerHeight = typeHeadersContainer.offsetHeight;
        
        const targetHeaderHeight = Math.max(nameHeaderNaturalHeight, typeHeadersContainerHeight);

        nameHeader.style.height = `${targetHeaderHeight}px`;
        typeHeadersContainer.style.height = `${targetHeaderHeight}px`;
    }
}

    // Initialize the application
    initializeGrid();
    loadTeamDataFromLocalStorage(); // Load any saved data

// --- Handler for Deleting a Trainer ---
function handleDeleteTrainer(event) {
const trainerNameToDelete = event.target.dataset.trainer;
if (!trainerNameToDelete) {
console.error('Delete button clicked, but no trainerNameToDelete found on dataset.');
return;
}
console.log('[Delete] Attempting to delete trainer:', trainerNameToDelete);

if (window.confirm(`Are you sure you want to delete trainer "${trainerNameToDelete}"? This action cannot be undone.`)) {
// Remove the trainer's name cell from the fixed column
const nameCellElement = event.target.closest('.grid-name-cell');
console.log('[Delete] Found nameCellElement:', nameCellElement);
if (nameCellElement) {
nameCellElement.remove();
} else {
console.error('[Delete] nameCellElement not found for trainer:', trainerNameToDelete);
}

// Remove the trainer's row of Pokémon cells from the scrollable gridContainer
console.log('[Delete] gridContainer:', gridContainer);
const selector = `.pokemon-cells-row[data-trainer-name="${trainerNameToDelete}"]`;
console.log('[Delete] Selector for pokemonCellsRowToRemove:', selector);
const pokemonCellsRowToRemove = gridContainer.querySelector(selector);
console.log('[Delete] Found pokemonCellsRowToRemove:', pokemonCellsRowToRemove);
if (pokemonCellsRowToRemove) {
pokemonCellsRowToRemove.remove();
} else {
console.error('[Delete] pokemonCellsRowToRemove not found for trainer:', trainerNameToDelete);
}

// Remove data from internal tracking
delete teamData[trainerNameToDelete];
delete trainerRowCells[trainerNameToDelete];

saveTeamDataToLocalStorage();
console.log(`Trainer ${trainerNameToDelete} deleted.`);
syncAllRowHeights();
}
}

    // --- Phase 6.2.1: Display Team Summary --- 
    function displayTeamSummary() {
        summaryContent.innerHTML = ''; // Clear previous summary

        const orderedTrainerNameElements = document.querySelectorAll('.grid-name-cell');
        const trainersOrder = Array.from(orderedTrainerNameElements).map(cell => {
            const nameSpan = cell.querySelector('span');
            return nameSpan ? nameSpan.textContent : '';
        }).filter(name => name !== '');

        if (trainersOrder.length === 0) {
            summaryContent.innerHTML = '<p>No trainers have been added yet.</p>';
            teamSummaryModal.style.display = 'flex';
            return;
        }

        console.log('Displaying team summary. Current teamData:', JSON.parse(JSON.stringify(teamData)));
        trainersOrder.forEach(trainerName => {
            console.log(`Processing summary for trainer: '${trainerName}'`);
            console.log('Trainer data from teamData for this trainer:', teamData[trainerName]);
            const trainerBlock = document.createElement('div');
            trainerBlock.classList.add('summary-trainer-block');

            const trainerTitle = document.createElement('h3');
            trainerTitle.textContent = trainerName;
            trainerBlock.appendChild(trainerTitle);

            const pokemonListDiv = document.createElement('div');
            pokemonListDiv.classList.add('summary-pokemon-list');

            let hasSelections = false;
            POKEMON_TYPES.forEach(type => {
                const selection = teamData[trainerName]?.[type];
                if (selection && selection.id) {
                    hasSelections = true;
                    const pokemonEntry = document.createElement('div');
                    pokemonEntry.classList.add('summary-pokemon-entry');

                    const img = document.createElement('img');
                    img.src = selection.image_path;
                    img.alt = selection.name;
                    img.onerror = () => img.alt = 'Img not found';
                    pokemonEntry.appendChild(img);

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = selection.name; // Display only the name
                    pokemonEntry.appendChild(nameSpan);
                    pokemonListDiv.appendChild(pokemonEntry);
                }
            });

            if (!hasSelections) {
                const noSelectionText = document.createElement('p');
                noSelectionText.textContent = 'No Pokémon selected for this trainer.';
                noSelectionText.style.fontStyle = 'italic';
                pokemonListDiv.appendChild(noSelectionText);
            }
            
            trainerBlock.appendChild(pokemonListDiv);
            summaryContent.appendChild(trainerBlock);
        });

        teamSummaryModal.style.display = 'flex';
    }

    // --- Phase 6.2.2: Export Team as Text ---
    function exportTeamAsText() {
        const orderedTrainerNameElements = document.querySelectorAll('.grid-name-cell');
        const trainersOrder = Array.from(orderedTrainerNameElements).map(cell => {
            const nameSpan = cell.querySelector('span');
            return nameSpan ? nameSpan.textContent : '';
        }).filter(name => name !== '');
        let textSummary = '';

        if (trainersOrder.length === 0) {
            alert('No team data to export.');
            return;
        }

        trainersOrder.forEach(trainerName => {
            textSummary += `Trainer: ${trainerName}\n`;
            let selectionsMade = false;
            POKEMON_TYPES.forEach(type => {
                const selection = teamData[trainerName]?.[type];
                if (selection && selection.id) {
                    textSummary += `  ${type}: ${selection.name}\n`;
                    selectionsMade = true;
                }
            });
            if (!selectionsMade) {
                textSummary += `  (No Pokémon selected)\n`;
            }
            textSummary += '\n'; // Extra newline between trainers
        });

        const blob = new Blob([textSummary], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokemon-team.txt';
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Team data export initiated.');
    }

    // Event Listeners
    addPersonBtn.addEventListener('click', handleAddPerson);
    document.addEventListener('click', function(event) {
        console.log('[Event] Document clicked. Target:', event.target);
        if (event.target.classList.contains('delete-trainer-btn')) {
            console.log('[Event] Delete button clicked. Target:', event.target);
            handleDeleteTrainer(event);
        } else if (event.target.closest('.grid-pokemon-cell')) {
            console.log('[Event] Grid cell clicked. Target:', event.target);
            handleGridCellClick(event);
        }
    }); // Combined listener for grid cell clicks and delete button clicks
    console.log('CONFIRMED: Main document click listener has been attached.');
    closeModalBtn.addEventListener('click', () => { // Listener for modal close button
        pokemonSelectionModal.style.display = 'none';
    });
    modalPokemonList.addEventListener('click', handleModalPokemonSelect); // Listener for Pokémon selection within the modal

    viewSummaryBtn.addEventListener('click', displayTeamSummary);
    closeSummaryModalBtn.addEventListener('click', () => {
        teamSummaryModal.style.display = 'none';
    });
    exportTeamBtn.addEventListener('click', exportTeamAsText);
});
