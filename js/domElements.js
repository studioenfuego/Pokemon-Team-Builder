export const gridContainer = document.getElementById('pokemon-grid-container');
export const addPersonBtn = document.getElementById('add-person-btn');
export const personNameInput = document.getElementById('person-name');

export const pokemonSelectionModal = document.getElementById('pokemon-selection-modal');
export const closeModalBtn = document.getElementById('close-modal-btn');
export const modalPokemonList = document.getElementById('modal-pokemon-list');
export const modalTitle = document.getElementById('modal-title');

// Team Summary Modal Elements
export const viewSummaryBtn = document.getElementById('view-summary-btn');
export const teamSummaryModal = document.getElementById('team-summary-modal');
export const closeSummaryModalBtn = document.getElementById('close-summary-modal-btn');
export const summaryContent = document.getElementById('summary-content');
export const exportTeamBtn = document.getElementById('export-team-btn');

// Store team data: { "TrainerName": { "TypeName": {name: "PokemonName", image: "path"}, ... }, ... }
export let teamData = {};
// Store DOM elements for rows to easily update cells later
export const trainerRowCells = {};
export let fixedTrainerColumn; // Will hold the fixed trainer name column element

// Function to update teamData (needed because it's imported and can be reassigned)
export function updateTeamData(newData) {
    teamData = newData;
}

// Function to update fixedTrainerColumn (needed because it's imported and can be reassigned)
export function setFixedTrainerColumn(element) {
    fixedTrainerColumn = element;
}
