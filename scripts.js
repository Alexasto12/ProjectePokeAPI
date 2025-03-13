document.addEventListener('DOMContentLoaded', function() {
    const pokemonSelect = document.getElementById('pokemonSelect');
    const pokemonForm = document.getElementById('pokemonForm');
    const pokemonInfo = document.getElementById('pokemonInfo');
    const pokemonDetails = document.getElementById('pokemonDetails');
    
    const btnUp = document.querySelector('.frwd');
    const btnDown = document.querySelector('.bkwrd');
    const btnLeft = document.querySelector('.left-2');
    const btnRight = document.querySelector('.right-2');
    
    let currentPokemonIndex = -1;
    let pokemonList = [];
    
    cargarListaPokemon();
    
    pokemonSelect.addEventListener('change', function() {
        const pokemonId = pokemonSelect.value;
        if (pokemonId) {
            cargarPokemon(pokemonId);
            currentPokemonIndex = pokemonSelect.selectedIndex;

            pokemonSelect.blur();
        }
    });
    
    btnUp.addEventListener('click', scrollArriba);
    btnDown.addEventListener('click', scrollAbajo);
    btnLeft.addEventListener('click', navegarSiguiente); 
    btnRight.addEventListener('click', navegarAnterior); 
    
    [btnUp, btnDown, btnLeft, btnRight].forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.classList.add('active');
        });
        
        btn.addEventListener('mouseup', function() {
            this.classList.remove('active');
        });
        
        btn.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });
    
    /**
     * Scrolls the bottom screen upward
     * Moves the content of the lower display up by 40px with smooth animation
     */
    function scrollArriba() {
        const pantallaInferior = document.querySelector('.b-display');
        if (pantallaInferior) {
            pantallaInferior.scrollBy({
                top: -40,
                behavior: 'smooth'
            });
        }
        
        btnUp.classList.add('active');
        setTimeout(() => btnUp.classList.remove('active'), 150);
    }
    
    /**
     * Scrolls the bottom screen downward
     * Moves the content of the lower display down by 40px with smooth animation
     */
    function scrollAbajo() {
        const pantallaInferior = document.querySelector('.b-display');
        if (pantallaInferior) {
            pantallaInferior.scrollBy({
                top: 40,
                behavior: 'smooth'
            });
        }
        
        btnDown.classList.add('active');
        setTimeout(() => btnDown.classList.remove('active'), 150);
    }
    
    /**
     * Navigates to the previous Pokémon in the list
     * Selects the previous option in the dropdown if available
     */
    function navegarAnterior() {
        if (currentPokemonIndex > 1) {
            pokemonSelect.selectedIndex = currentPokemonIndex - 1;
            pokemonSelect.dispatchEvent(new Event('change'));
        }
        
        btnRight.classList.add('active'); // Changed from btnLeft
        setTimeout(() => btnRight.classList.remove('active'), 150);
    }
    
    /**
     * Navigates to the next Pokémon in the list
     * Selects the next option in the dropdown if available
     */
    function navegarSiguiente() {
        if (currentPokemonIndex < pokemonSelect.options.length - 1) {
            pokemonSelect.selectedIndex = currentPokemonIndex + 1;
            pokemonSelect.dispatchEvent(new Event('change'));
        }
        
        btnLeft.classList.add('active'); // Changed from btnRight
        setTimeout(() => btnLeft.classList.remove('active'), 150);
    }
    
    /**
     * Loads the Pokémon list from the API and populates the select dropdown
     * Retrieves Pokémon from Sinnoh Pokédex (Platinum) and sorts them by Pokédex number
     * @async
     */
    async function cargarListaPokemon() {
        try {
            pokemonSelect.innerHTML = '<option value="">Loading Pokémon...</option>';
            
            const respuesta = await fetch('https://pokeapi.co/api/v2/pokedex/7/');
            const datos = await respuesta.json();
            const pokemonEntries = datos.pokemon_entries;
            
            pokemonEntries.sort((a, b) => a.entry_number - b.entry_number);
            
            pokemonSelect.innerHTML = '<option value="">-- Select a Pokémon --</option>';
            
            const opciones = [];
            
            for (const entry of pokemonEntries) {
                const pokemonId = entry.pokemon_species.url.split('/').filter(Boolean).pop();
                
                pokemonList.push({
                    id: pokemonId,
                    entryNumber: entry.entry_number
                });
                
                const option = document.createElement('option');
                option.value = pokemonId;
                option.dataset.entryNumber = entry.entry_number;
                option.textContent = `#${entry.entry_number.toString().padStart(3, '0')} ${entry.pokemon_species.name.charAt(0).toUpperCase() + entry.pokemon_species.name.slice(1)}`;
                
                opciones.push({
                    entryNumber: entry.entry_number,
                    option: option,
                    id: pokemonId
                });
                
                obtenerNombreEspanol(pokemonId, entry.entry_number, option);
            }
            
            opciones.sort((a, b) => a.entryNumber - b.entryNumber);
            opciones.forEach(item => {
                pokemonSelect.appendChild(item.option);
            });
            
            document.addEventListener('keydown', function(event) {
                switch(event.key) {
                    case 'ArrowUp':
                        scrollArriba();
                        break;
                    case 'ArrowDown':
                        scrollAbajo();
                        break;
                    case 'ArrowLeft':
                        navegarAnterior();
                        break;
                    case 'ArrowRight':
                        navegarSiguiente();
                        break;
                }
            });
            
        } catch (error) {
            console.error('Error loading Pokémon list:', error);
            pokemonSelect.innerHTML = '<option value="">Error loading Pokémon</option>';
        }
    }
    
    /**
     * Fetches and sets the Spanish name for a Pokémon
     * @async
     * @param {string} pokemonId - The ID of the Pokémon
     * @param {number} entryNumber - The Pokédex entry number
     * @param {HTMLElement} optionElement - The select option element to update
     */
    async function obtenerNombreEspanol(pokemonId, entryNumber, optionElement) {
        try {
            const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
            const datos = await respuesta.json();
            
            const nombreEspanol = datos.names.find(n => n.language.name === "es")?.name;
            if (nombreEspanol) {
                optionElement.textContent = `#${entryNumber} ${nombreEspanol}`;
            }
        } catch (error) {
            console.error(`Error fetching Spanish name for Pokémon ${pokemonId}:`, error);
        }
    }
    
    /**
     * Loads detailed information about a specific Pokémon
     * Fetches species and base data, then populates the UI with translated information
     * @async
     * @param {string} pokemonId - The ID of the Pokémon to load
     */
    async function cargarPokemon(pokemonId) {
        try {
            pokemonInfo.classList.remove('d-none');
            pokemonDetails.classList.remove('d-none');
            
            document.getElementById('pokemonImage').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png";
            document.getElementById('pokemonName').textContent = "Loading...";
            document.getElementById('pokemonTypes').innerHTML = '';
            
            const [datosEspecie, datosPokemon] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`).then(r => r.json()),
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`).then(r => r.json())
            ]);
            
            const nombreEspanol = datosEspecie.names.find(n => n.language.name === "es")?.name || datosPokemon.name;
            
            const descripcionEntries = datosEspecie.flavor_text_entries.filter(entry => entry.language.name === "es");
            let descripcion = "No information available for this Pokémon.";
            if (descripcionEntries.length > 0) {
                descripcion = descripcionEntries[descripcionEntries.length - 1].flavor_text;
                descripcion = descripcion.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
            }
            document.getElementById('pokemonDesc').textContent = descripcion;

            document.getElementById('pokemonImage').src = datosPokemon.sprites.other["official-artwork"].front_default || datosPokemon.sprites.front_default;
            document.getElementById('pokemonName').textContent = nombreEspanol;
            document.getElementById('pokemonNumber').textContent = `N° ${datosPokemon.id.toString().padStart(3, '0')}`;
            
            const tiposContainer = document.getElementById('pokemonTypes');
            tiposContainer.innerHTML = '';
            datosPokemon.types.forEach(type => {
                const tipoEspanol = obtenerTipoEspanol(type.type.name);
                const tipoElement = document.createElement('div');
                tipoElement.className = `pokemon-type type-${type.type.name}`;
                tipoElement.textContent = tipoEspanol;
                tiposContainer.appendChild(tipoElement);
            });
            
            document.getElementById('pokemonHeight').textContent = `${datosPokemon.height / 10} m`;
            document.getElementById('pokemonWeight').textContent = `${datosPokemon.weight / 10} kg`;
            
            const statsContainer = document.getElementById('pokemonStats');
            statsContainer.innerHTML = '';
            datosPokemon.stats.forEach(stat => {
                const nombreStat = obtenerNombreEstadistica(stat.stat.name);
                const statRow = document.createElement('div');
                statRow.className = 'stat-row';
                
                const statName = document.createElement('div');
                statName.className = 'stat-name';
                statName.textContent = nombreStat;
                
                const statBar = document.createElement('div');
                statBar.className = 'stat-bar';
                
                const statValue = document.createElement('div');
                statValue.className = 'stat-value';
                statValue.style.width = `${Math.min(stat.base_stat, 100)}%`;
                
                statBar.appendChild(statValue);
                statRow.appendChild(statName);
                statRow.appendChild(statBar);
                
                statsContainer.appendChild(statRow);
            });
            
            const abilitiesContainer = document.getElementById('pokemonAbilities');
            abilitiesContainer.innerHTML = '';
            for (const ability of datosPokemon.abilities) {
                const abilityItem = document.createElement('li');
                
                try {
                    const abilityResponse = await fetch(ability.ability.url);
                    const abilityData = await abilityResponse.json();
                    const abilityName = abilityData.names.find(n => n.language.name === "es")?.name || ability.ability.name;
                    abilityItem.textContent = abilityName;
                    if (ability.is_hidden) {
                        abilityItem.innerHTML += ' <small style="color: #999">(Hidden)</small>';
                    }
                } catch (error) {
                    abilityItem.textContent = ability.ability.name;
                }
                
                abilitiesContainer.appendChild(abilityItem);
            }
            
        } catch (error) {
            console.error('Error loading Pokémon:', error);
            pokemonInfo.innerHTML = '<div class="error-message">Error loading Pokémon</div>';
            pokemonDetails.innerHTML = '<div class="error-message">Error loading details</div>';
        }
    }
    
    /**
     * Translates Pokémon type names from English to Spanish
     * @param {string} tipoIngles - The English name of the type
     * @returns {string} The Spanish translation of the type name
     */
    function obtenerTipoEspanol(tipoIngles) {
        const tiposTraduccion = {
            'normal': 'Normal',
            'fighting': 'Lucha',
            'flying': 'Volador',
            'poison': 'Veneno',
            'ground': 'Tierra',
            'rock': 'Roca',
            'bug': 'Bicho',
            'ghost': 'Fantasma',
            'steel': 'Acero',
            'fire': 'Fuego',
            'water': 'Agua',
            'grass': 'Planta',
            'electric': 'Eléctrico',
            'psychic': 'Psíquico',
            'ice': 'Hielo',
            'dragon': 'Dragón',
            'dark': 'Siniestro',
            'fairy': 'Hada'
        };
        
        return tiposTraduccion[tipoIngles] || tipoIngles;
    }
    
    /**
     * Translates Pokémon stat names from English to Spanish
     * @param {string} statIngles - The English name of the stat
     * @returns {string} The Spanish translation of the stat name
     */
    function obtenerNombreEstadistica(statIngles) {
        const statsTraduccion = {
            'hp': 'PS',
            'attack': 'Ataque',
            'defense': 'Defensa',
            'special-attack': 'At. Esp.',
            'special-defense': 'Def. Esp.',
            'speed': 'Velocidad'
        };
        
        return statsTraduccion[statIngles] || statIngles;
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .buttons-3 li.active {
            transform: scale(0.95);
            filter: brightness(0.9);
            box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
        }
    `;
    document.head.appendChild(style);
});