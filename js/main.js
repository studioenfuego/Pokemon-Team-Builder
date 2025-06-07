import { POKEMON_TYPES, POKEMON_DATA } from './constants.js';
import {
    gridContainer, addPersonBtn, personNameInput,
    pokemonSelectionModal, closeModalBtn, modalPokemonList, modalTitle,
    viewSummaryBtn, teamSummaryModal, closeSummaryModalBtn, summaryContent, exportTeamBtn,
    teamData,
    trainerRowCells,
    fixedTrainerColumn,
    updateTeamData,
    setFixedTrainerColumn
} from './domElements.js';

document.addEventListener('DOMContentLoaded', () => {
    // Declarations for POKEMON_TYPES, gridContainer, addPersonBtn, personNameInput
    // (originally at the start of this block) have been removed as they are now imported.
    // The rest of the script logic from original line 9 (or equivalent) onwards follows.
    
    // Declarations for pokemonSelectionModal and closeModalBtn
    // were removed as they are now imported.
    // Declarations for modalPokemonList, modalTitle,
    // viewSummaryBtn, teamSummaryModal, closeSummaryModalBtn, summaryContent, exportTeamBtn,
    // teamData, trainerRowCells, and fixedTrainerColumn
    // have been removed as they are now imported.

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

        setFixedTrainerColumn(document.createElement('div')); // Assign to global
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

        // Add Favorite Header
        const favoriteHeaderCell = document.createElement('div');
        favoriteHeaderCell.classList.add('grid-header-cell', 'favorite-header-cell');
        favoriteHeaderCell.textContent = 'Favorite';
        typeHeadersContainer.appendChild(favoriteHeaderCell);

        // Configure gridContainer (now for Pokémon cells only) and typeHeadersContainer
        // They will have one column per Pokémon type.
        const allHeadersLayout = [...POKEMON_TYPES, 'Favorite'].map(() => `minmax(120px, 1fr)`).join(' ');
        // gridContainer itself should stack rows vertically. Its grid-template-columns are not for individual type cells.
        // Each pokemon-cells-row will use pokemonCellGridLayout for its own columns.
        typeHeadersContainer.style.gridTemplateColumns = allHeadersLayout; // Ensure alignment
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
        const allCellsLayout = [...POKEMON_TYPES, 'Favorite'].map(() => `minmax(120px, 1fr)`).join(' '); 
        pokemonCellsRow.style.gridTemplateColumns = allCellsLayout;
        
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

        // Add Favorite Cell
        const favoriteCell = document.createElement('div');
        favoriteCell.classList.add('grid-pokemon-cell', 'grid-favorite-cell'); // Add class for potential styling
        favoriteCell.dataset.trainer = trainerName;
        favoriteCell.dataset.type = 'favorite'; // Special identifier for this cell's purpose
        favoriteCell.innerHTML = '<span>-</span>'; // Placeholder, to be replaced by selection logic
        trainerRowCells[trainerName]['favorite'] = favoriteCell; // Store reference
        pokemonCellsRow.appendChild(favoriteCell);

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
    function getPokemonOfType(type) {
        const pokemonOfType = [];
        for (const id in POKEMON_DATA) {
            if (POKEMON_DATA[id].types.includes(type)) {
                pokemonOfType.push({ id, ...POKEMON_DATA[id] });
            }
        }
        return pokemonOfType;
    }

    // --- Phase 3.2.4: Function to populate modal with Pokémon images of the relevant type ---\\

    // const POKEMON_DATA = { ... }; // Removed as it's now imported from js/constants.js
    

function populateModal(pokemonArray, trainerName, pokemonType) {
    modalPokemonList.innerHTML = ''; // Clear previous Pokémon previews

    if (pokemonArray.length === 0) {
        const noPokemonMessage = document.createElement('p');
        if (pokemonType === 'favorite') {
            noPokemonMessage.textContent = `${trainerName} has not selected any Pokémon yet to choose a favorite from.`;
        } else {
            noPokemonMessage.textContent = `No Pokémon of type "${pokemonType}" found in Gen 9 data.`;
        }
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

    if (pokemonType === 'favorite') {
        modalTitle.textContent = `Select Favorite Pokémon for ${trainerName}`;
        const selectedPokemonForTrainer = [];
        if (teamData[trainerName]) {
            POKEMON_TYPES.forEach(type => {
                if (teamData[trainerName][type] && teamData[trainerName][type].id) {
                    selectedPokemonForTrainer.push(teamData[trainerName][type]);
                }
            });
        }
        populateModal(selectedPokemonForTrainer, trainerName, 'favorite');
    } else {
        modalTitle.textContent = `Select ${pokemonType} Pokémon for ${trainerName}`;
        const pokemonOfType = getPokemonOfType(pokemonType);
        populateModal(pokemonOfType, trainerName, pokemonType);
    }

    pokemonSelectionModal.style.display = 'flex'; // Show the modal
}

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
        let targetCell;
        if (pokemonType === 'favorite') {
            targetCell = trainerRowCells[trainerName]['favorite'];
        } else {
            targetCell = trainerRowCells[trainerName][pokemonType];
        }

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
        if (pokemonType === 'favorite') {
            teamData[trainerName].favorite = {
                id: pokemonId,
                name: selectedPokemonData.name,
                image_path: selectedPokemonData.image_path
            };
        } else {
            teamData[trainerName][pokemonType] = {
                id: pokemonId,
                name: selectedPokemonData.name,
                image_path: selectedPokemonData.image_path
            };
        }

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
            updateTeamData(savedData.selections); // Restore teamData object

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
                // Load and display favorite Pokémon
                const favoritePokemonInfo = teamData[trainerName].favorite;
                if (favoritePokemonInfo && favoritePokemonInfo.id) {
                    const favoriteCell = trainerRowCells[trainerName]['favorite'];
                    if (favoriteCell) { // Ensure the cell exists in case of any inconsistencies
                        updateGridCellDisplay(favoriteCell, favoritePokemonInfo);
                    }
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

            // Display Favorite Pokémon
            const favoriteSelection = teamData[trainerName]?.favorite;
            if (favoriteSelection && favoriteSelection.id) {
                hasSelections = true; // A favorite counts as a selection
                const favoriteEntry = document.createElement('div');
                favoriteEntry.classList.add('summary-pokemon-entry', 'summary-favorite-entry'); // Added 'summary-favorite-entry' for potential styling

                const favoriteLabel = document.createElement('strong');
                favoriteLabel.textContent = 'Favorite: ';
                favoriteEntry.appendChild(favoriteLabel);

                const img = document.createElement('img');
                img.src = favoriteSelection.image_path;
                img.alt = favoriteSelection.name;
                img.onerror = () => img.alt = 'Img not found';
                favoriteEntry.appendChild(img);

                const nameSpan = document.createElement('span');
                nameSpan.textContent = favoriteSelection.name;
                favoriteEntry.appendChild(nameSpan);
                
                // Prepend favorite to the list or append, depending on desired order. Let's prepend.
                pokemonListDiv.prepend(favoriteEntry); 
            }

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

            // Add Favorite Pokémon to text summary
            const favoriteSelection = teamData[trainerName]?.favorite;
            if (favoriteSelection && favoriteSelection.id) {
                textSummary += `  Favorite: ${favoriteSelection.name}\n`;
                selectionsMade = true; // A favorite counts as a selection
            }

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
