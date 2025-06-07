# Pokémon Team Chooser - Development Plan

## Phase 1: Project Setup & Basic Structure
- [x] **1.1. Create Project Files:**
    - [x] 1.1.1. Create `index.html` for the main page structure.
    - [x] 1.1.2. Create `style.css` for styling.
    - [x] 1.1.3. Create `script.js` for application logic.
- [x] **1.2. Define Pokémon Types:**
    - [x] 1.2.1. Create an array of Pokémon types (e.g., Normal, Fire, Water, Grass, Electric, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Steel, Dark, Fairy) in `script.js`.
- [x] **1.3. Basic HTML Layout (`index.html`):**
    - [x] 1.3.1. Main container for the application.
    - [x] 1.3.2. Header section for the title (e.g., "Pokémon Team Builder").
    - [x] 1.3.3. Controls area:
        - [x] 1.3.3.1. Input field for new person's name.
        - [x] 1.3.3.2. "Add Person" button.
    - [x] 1.3.4. Grid container (`<div id="pokemon-grid-container"></div>`). (Note: ID is pokemon-grid-container)
    - [x] 1.3.5. Modal structure for Pokémon selection (initially hidden).
- [x] **1.4. Link Files:**
    - [x] 1.4.1. Link `style.css` and `script.js` (defer loading) in `index.html`.
- [x] **1.5. Initial Grid Display (`script.js` & `style.css`):**
    - [x] 1.5.1. Function to draw the type headers (vertical columns) in the grid.
    - [x] 1.5.2. Basic CSS to style the grid headers.

## Phase 2: Row Management (Adding & Naming Persons)
- [x] **2.1. "Add Person" Functionality (`script.js`):**
    - [x] 2.1.1. Event listener for the "Add Person" button.
    - [x] 2.1.2. Function to:
        - [x] 2.1.2.1. Get the name from the input field.
        - [x] 2.1.2.2. Create a new row in the grid.
        - [x] 2.1.2.3. The row should display the person's name.
        - [x] 2.1.2.4. The row should have empty cells (boxes) for each Pokémon type.
        - [x] 2.1.2.5. Clear the name input field after adding.
- [x] **2.2. Styling for Rows and Cells (`style.css`):**
    - [x] 2.2.1. Style the person name display.
    - [x] 2.2.2. Style the empty cells to look clickable.

## Phase 3: Pokémon Data & Selection Modal
- [x] **3.1. Prepare Pokémon Data (`script.js`):** (Populated `POKEMON_DATA` with types and standardized names)
    - [x] 3.1.1. Create a JavaScript data structure (e.g., an array of objects) for Gen 9 Pokémon. Each Pokémon object should include: (Sourced from PokemonDB: `https://pokemondb.net/pokedex/stats/gen9`)
        - `id` (e.g., Pokedex number or unique ID) - Used POKEMON_DATA keys
        - `name` (e.g., "Sprigatito") - Standardized
        - `types` (an array, e.g., `["Grass"]`) - Populated
        - `image_path` (e.g., `"Front/SPRIGATITO.png"`) - Pre-existing
    - [x] 3.1.2. (Helper) Function to get all Pokémon of a specific type from your data.
- [x] **3.2. Pokémon Selection Modal (`html`, `css`, `js`):**
    - [x] 3.2.1. Design HTML for the modal (e.g., a title, a grid/flex container for Pokémon previews, a close button).
    - [x] 3.2.2. Style the modal for a modern look (e.g., centered, overlay background).
    - [x] 3.2.3. Function to open the modal when a grid cell (type box for a person) is clicked.
        - [x] 3.2.3.1. Pass the target cell's context (person's row, type column) to the modal (stored in modal's dataset).
    - [x] 3.2.4. Function to populate the modal with Pokémon images of the relevant type.
        - [x] 3.2.4.1. Each Pokémon preview in the modal should be clickable. (Elements are set up; click event listener is part of 4.1.1)
    - [x] 3.2.5. Function to close the modal. (Event listener for close button added previously)

## Phase 4: Implementing Pokémon Selection
- [x] **4.1. Pokémon Selection Logic (`script.js`):**
    - [x] 4.1.1. Add event listeners to Pokémon previews in the modal.
    - [x] 4.1.2. When a Pokémon is clicked in the modal:
        - [x] 4.1.2.1. Get the selected Pokémon's data (e.g., image path).
        - [x] 4.1.2.2. Update the corresponding cell in the main grid to display the selected Pokémon's image.
        - [x] 4.1.2.3. Store the selection (e.g., in a JavaScript object mapping person/type to the chosen Pokémon).
        - [x] 4.1.2.4. Close the modal.
- [x] **4.2. Displaying Selected Pokémon (`style.css`):**
    - [x] 4.2.1. Ensure selected Pokémon images fit nicely within the grid cells. (Existing CSS with `max-width`, `max-height`, and `object-fit: contain` handles this)

## Phase 5: Styling, Refinements & UX
- [x] **5.1. Modern UI/UX Styling (`style.css`):**
    - [x] 5.1.1. Choose a color palette and font scheme.
    - [x] 5.1.2. Refine the styling of the grid, rows, cells, buttons, inputs, and modal.
    - [x] 5.1.3. Add hover effects for clickable elements.
    - [x] 5.1.4. Ensure the application has a clean, intuitive, and visually appealing interface.
- [x] **5.2. Responsiveness (Basic):**
    - [x] 5.2.1. Ensure the grid and modal are usable on smaller screen sizes (e.g., tablets).
- [ ] **5.3. (Optional) Clear Selection:**
    - [ ] 5.3.1. Add a way to remove a selected Pokémon from a cell (e.g., a small 'x' button on the selected Pokémon, or re-clicking the cell opens modal to re-select/clear).

## Phase 6: (Optional) Advanced Features
- [x] **6.1. Data Persistence:**
    - [x] 6.1.1. Save team compositions to browser `localStorage`.
    - [x] 6.1.2. Load saved compositions on page visit.
- [x] **6.2. Team Summary/Export:**
    - [x] 6.2.1. Display a summary of the chosen team.
    - [x] 6.2.2. Option to export the team (e.g., as text).

---
This plan provides a structured approach. We'll check off items as we complete them.
