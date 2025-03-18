document.addEventListener('DOMContentLoaded', function() {
    const pokemonSelect = document.getElementById('pokemonSelect');
    const pokemonInfo = document.getElementById('pokemonInfo');
    const pokemonDetails = document.getElementById('pokemonDetails');
    const startButton = document.querySelector('.start').parentElement;
    
    // Variable per controlar si el dispositiu està encès
    let dsEncendida = false;
    
    // Deshabilitar el select inicialment
    pokemonSelect.disabled = true;
    pokemonSelect.classList.add('disabled-select');
    
    // Efecte visual al botó START per indicar que és clicable
    startButton.style.cursor = 'pointer';
    
    const btnUp = document.querySelector('.frwd');
    const btnDown = document.querySelector('.bkwrd');
    const btnLeft = document.querySelector('.left-2');
    const btnRight = document.querySelector('.right-2');
    
    // Afegir classe visual per als botons deshabilitars
    [btnUp, btnDown, btnLeft, btnRight].forEach(btn => {
        btn.classList.add('disabled-button');
    });
    
    // Listener per al botó START
    startButton.addEventListener('click', function() {
        // Animació visual del botó
        this.classList.add('active-button');
        setTimeout(() => this.classList.remove('active-button'), 300);
        
        // Marcar el dispositiu com encès
        dsEncendida = true;
        
        // Ocultar pantalla inicial i mostrar contingut principal
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
        // Habilitar el select i treure la classe visual de deshabilitat
        pokemonSelect.disabled = false;
        pokemonSelect.classList.remove('disabled-select');
        
        // També actualitzar el botó personalitzat
        const customSelectButton = document.querySelector('.custom-select-button');
        if (customSelectButton) {
            customSelectButton.classList.remove('disabled-select');
            customSelectButton.setAttribute('tabindex', '0'); // Ara pot rebre focus
        }
        
        // Habilitar botons de direcció (treure classe visual de deshabilitat)
        [btnUp, btnDown, btnLeft, btnRight].forEach(btn => {
            btn.classList.remove('disabled-button');
        });
        
        // Carregar la llista de Pokémon
        if (pokemonSelect.options.length > 1) {
            // Si ja tenim opcions, seleccionar la primera
            pokemonSelect.selectedIndex = 1; // L'índex 0 és l'opció per defecte
            
            // Actualitzar el text del botó personalitzat
            const customSelectButton = document.querySelector('.custom-select-button');
            if (customSelectButton && pokemonSelect.options[1]) {
                customSelectButton.textContent = pokemonSelect.options[1].textContent;
            }
            
            // Actualitzar l'opció seleccionada al dropdown personalitzat
            const customDropdown = document.querySelector('.custom-select-dropdown');
            if (customDropdown) {
                const selectedValue = pokemonSelect.value;
                const selectedOption = customDropdown.querySelector(`.select-option[data-value="${selectedValue}"]`);
                if (selectedOption) {
                    document.querySelectorAll('.select-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    selectedOption.classList.add('selected');
                }
            }
            
            pokemonSelect.dispatchEvent(new Event('change'));
        } else {
            // Si encara no hi ha opcions, esperar fins que estiguin carregades
            const checkInterval = setInterval(() => {
                if (pokemonSelect.options.length > 1) {
                    pokemonSelect.selectedIndex = 1;
                    pokemonSelect.dispatchEvent(new Event('change'));
                    clearInterval(checkInterval);
                }
            }, 100);
        }
    });
    
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
    
    // Modificar els event listeners per a verificar si la DS està encesa
    btnUp.addEventListener('click', function() {
        if (dsEncendida) scrollArriba();
    });
    
    btnDown.addEventListener('click', function() {
        if (dsEncendida) scrollAbajo();
    });
    
    btnLeft.addEventListener('click', function() {
        if (dsEncendida) navegarSiguiente();
    });
    
    btnRight.addEventListener('click', function() {
        if (dsEncendida) navegarAnterior();
    });
    
    // Actualitzar esdeveniments de mousedown/mouseup/mouseleave
    [btnUp, btnDown, btnLeft, btnRight].forEach(btn => {
        btn.addEventListener('mousedown', function() {
            if (dsEncendida) this.classList.add('active');
        });
        
        btn.addEventListener('mouseup', function() {
            if (dsEncendida) this.classList.remove('active');
        });
        
        btn.addEventListener('mouseleave', function() {
            if (dsEncendida) this.classList.remove('active');
        });
    });
    // Afegir estils per als botons deshabilitars
    const styleButtons = document.createElement('style');
    styleButtons.textContent = `
        .buttons-3 li.disabled-button {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
        
        .buttons-3 li.active {
            transform: scale(0.95) !important;
            filter: brightness(0.9) !important;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.5) !important;
            transition: all 0.05s ease !important;
        }
    `;
    document.head.appendChild(styleButtons);
    
    // Afegir estils per als elements deshabilitars
    const styleDisabled = document.createElement('style');
    styleDisabled.textContent = `
        .custom-select-button.disabled-select {
            opacity: 0.7;
            cursor: not-allowed;
            background-color: #e9e9e9;
            color: #888;
        }
    `;
    document.head.appendChild(styleDisabled);
    
    // Variable per controlar el volum i estat de la musica
    let musicaReproduciendo = false;
    let musicVolume = 0.5; // Valor inicial (50%)
    
    // Slider del volum
    const volumeSlider = document.getElementById('volumeSlider');
    const volumenControl = document.querySelector('.vol');
    
    // Intentar reproducir música después de alguna interacción del usuario
    document.addEventListener('click', iniciarMusicaSiNoReproduciendo, { once: true });
    document.addEventListener('keydown', iniciarMusicaSiNoReproduciendo, { once: true });
    
    function iniciarMusicaSiNoReproduciendo() {
        if (!musicaReproduciendo) {
            reproducirMusicaPokemon();
        }
    }
    
  
    /**
     * Creates and manages a hidden YouTube music player for Pokemon background music.
     * This function embeds a YouTube iframe player with Pokemon music, sets it to autoplay,
     * and positions it off-screen while still allowing audio playback.
     * 
     * The function:
     * - Removes any existing music player if present
     * - Creates a new container with specific styling to hide it
     * - Embeds a YouTube iframe with Pokemon music
     * - Sets up autoplay and looping
     * - Updates the music playing state
     * - Attempts to set the volume after a delay
     * 
     * @function reproducirMusicaPokemon
     * @global
     * @requires musicaReproduciendo - Global boolean to track music state
     * @requires volumenControl - DOM element for volume control
     * @requires musicVolume - Global variable for music volume level
     * @requires actualizarVolumenMusica - Function to update music volume
     */
    function reproducirMusicaPokemon() {
        // Eliminar reproductor anterior si existeix
        if (document.getElementById('music-player')) {
            document.getElementById('music-player').remove();
        }
        
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player';
        playerContainer.style.position = 'fixed';
        playerContainer.style.bottom = '-1000px';
        playerContainer.style.right = '-1000px';
        playerContainer.style.zIndex = '-1';
        playerContainer.style.opacity = '0.01';
        playerContainer.style.pointerEvents = 'none';
        
        // Incrustar la BSO desde YouTube amb paràmetres correctes per autoplay (no es lo més eficient però ara per ara funciona i no necesitem careegar 1h de música)
        playerContainer.innerHTML = `
            <iframe width="1" height="1" 
            src="https://www.youtube.com/embed/cO78s2g7Wag?autoplay=1&loop=1&playlist=cO78s2g7Wag&enablejsapi=1"
            frameborder="0" allow="autoplay; encrypted-media" style="opacity:0.01" id="youtube-player"></iframe>
        `;
        
        document.body.appendChild(playerContainer);
        
        // Marcar la música com reproduint-se
        musicaReproduciendo = true;
        volumenControl.classList.add('playing');
        
        // Verificar si l'iframe s'ha carregat correctament
        const iframe = document.querySelector('#youtube-player');
        if (iframe) {
            console.log('Iframe de música creat correctament');
            // Provar establir el volum després d'un temps major
            setTimeout(() => {
                try {
                    actualizarVolumenMusica(musicVolume);
                    console.log('Volum establert a:', musicVolume);
                } catch (e) {
                    console.error('Error al establir volum:', e);
                }
            }, 3000); // Major temps d'espera
        } else {
            console.error('No s\'ha pogut crear l\'iframe de música');
        }
    }
    
    // Control de volum millorat
    volumeSlider.addEventListener('input', function() {
        musicVolume = this.value / 100;
        
        // Gestió de classes segons el volum
        if (musicVolume === 0) {
            volumenControl.classList.remove('playing');
        } else {
            volumenControl.classList.add('playing');
            if (!musicaReproduciendo) {
                reproducirMusicaPokemon();
            }
        }
        
        actualizarVolumenMusica(musicVolume);
    });
    
    /**
     * Updates the volume of the embedded music player
     * @param {number} volume - The volume level to set (between 0 and 1)
     * @description Sends a postMessage to the iframe containing the music player to adjust its volume
     * @throws {Error} If there's an error setting the volume through postMessage
     */
    function actualizarVolumenMusica(volume) {
        const iframe = document.querySelector('#music-player iframe');
        if (iframe && iframe.contentWindow) {
            try {
                iframe.contentWindow.postMessage(
                    JSON.stringify({
                        event: 'command',
                        func: 'setVolume',
                        args: [volume * 100]
                    }), 
                    '*'
                );
                console.log('Comando de volumen enviado:', volume * 100);
            } catch (e) {
                console.error('Error al establecer volumen:', e);
            }
        } else {
            console.warn('No se encontró el iframe o su contentWindow');
        }
    }
    
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
            currentPokemonIndex = pokemonSelect.selectedIndex;
            
      
            const selectedText = pokemonSelect.options[currentPokemonIndex].text;
            
         
            const customSelectButton = document.querySelector('.custom-select-button');
            if (customSelectButton) {
                customSelectButton.textContent = selectedText;
            }
   
            const customDropdown = document.querySelector('.custom-select-dropdown');
            if (customDropdown) {
                const options = customDropdown.querySelectorAll('.select-option');
                options.forEach(opt => opt.classList.remove('selected'));
                
                const selectedValue = pokemonSelect.value;
                const selectedOption = customDropdown.querySelector(`.select-option[data-value="${selectedValue}"]`);
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                }
            }

            pokemonSelect.dispatchEvent(new Event('change'));
        }
        
        btnRight.classList.add('active');
        setTimeout(() => btnRight.classList.remove('active'), 150);
    }
    
    /**
     * Navigates to the next Pokémon in the list
     * Selects the next option in the dropdown if available
     */
    function navegarSiguiente() {
        if (currentPokemonIndex < pokemonSelect.options.length - 1) {
        
            pokemonSelect.selectedIndex = currentPokemonIndex + 1;
            currentPokemonIndex = pokemonSelect.selectedIndex;
            
           
            const selectedText = pokemonSelect.options[currentPokemonIndex].text;
            
            const customSelectButton = document.querySelector('.custom-select-button');
            if (customSelectButton) {
                customSelectButton.textContent = selectedText;
            }
           
            const customDropdown = document.querySelector('.custom-select-dropdown');
            if (customDropdown) {
                const options = customDropdown.querySelectorAll('.select-option');
                options.forEach(opt => opt.classList.remove('selected'));
                
                const selectedValue = pokemonSelect.value;
                const selectedOption = customDropdown.querySelector(`.select-option[data-value="${selectedValue}"]`);
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                }
            }
        
            pokemonSelect.dispatchEvent(new Event('change'));
        }
        
        btnLeft.classList.add('active');
        setTimeout(() => btnLeft.classList.remove('active'), 150);
    }
    
    /**
     * Loads the Pokémon list from the API and populates the select dropdown
     * Retrieves Pokémon from Sinnoh Pokédex (Platinum) and sorts them by Pokédex number
     * @async
     */
    async function cargarListaPokemon() {
        try {
            pokemonSelect.innerHTML = '<option value="">-- Select a Pokémon --</option>';
            
            // Obtenim les dades de la Pokédex de Sinnoh (ID: 6)
            const respuesta = await fetch('https://pokeapi.co/api/v2/pokedex/6/');
            const datos = await respuesta.json();
            const pokemonEntries = datos.pokemon_entries;
            
            // Ordenem les entrades per número de Pokédex
            pokemonEntries.sort((a, b) => a.entry_number - b.entry_number);
            
            // Netegem el select existent i afegim l'opció per defecte
            pokemonSelect.innerHTML = '<option disable value="">-- Select a Pokémon --</option>';
            
            // Creem el contenidor pel dropdown personalitzat
            const selectContainer = document.createElement('div');
            selectContainer.className = 'select-container';
            pokemonSelect.parentNode.insertBefore(selectContainer, pokemonSelect);
            
            // Movem el select original al contenidor i l'ocultem completament
            selectContainer.appendChild(pokemonSelect);
            pokemonSelect.style.opacity = '0';
            pokemonSelect.style.position = 'absolute';
            pokemonSelect.style.pointerEvents = 'none';
            pokemonSelect.style.height = '0';
            pokemonSelect.style.width = '0'; // Afegim amplada 0
            pokemonSelect.tabIndex = -1; // Evitar que rebi el focus
            pokemonSelect.disabled = true; // Deshabilita el select fins que es premi START
            
            // Creem el botó personalitzat que es mostrarà en lloc del select
            const customSelectButton = document.createElement('div');
            customSelectButton.className = 'custom-select-button disabled-select'; // Afegim classe disabled-select
            customSelectButton.textContent = '-- Select a Pokémon --';
            customSelectButton.setAttribute('tabindex', '-1'); // Deshabilitem també el focus al custom select
            selectContainer.appendChild(customSelectButton);
            
            // Creem el dropdown personalitzat que contindrà les opcions
            const customDropdown = document.createElement('div');
            customDropdown.className = 'custom-select-dropdown';
            selectContainer.appendChild(customDropdown);
            
            // Array temporal per emmagatzemar les opcions abans d'ordenar-les
            const opciones = [];
            
            // Iterem sobre cada Pokémon per crear les seves opcions
            for (const entry of pokemonEntries) {
                // Extraiem l'ID del Pokémon de la URL
                const pokemonId = entry.pokemon_species.url.split('/').filter(Boolean).pop();
                
                // Afegim el Pokémon a la llista general
                pokemonList.push({
                    id: pokemonId,
                    entryNumber: entry.entry_number
                });
                
                // Creem l'opció pel select original
                const option = document.createElement('option');
                option.value = pokemonId;
                option.dataset.entryNumber = entry.entry_number;
                option.textContent = `#${entry.entry_number.toString().padStart(3, '0')} ${entry.pokemon_species.name.charAt(0).toUpperCase() + entry.pokemon_species.name.slice(1)}`;
                
                // Guardem l'opció a l'array temporal
                opciones.push({
                    entryNumber: entry.entry_number,
                    option: option,
                    id: pokemonId,
                    text: option.textContent
                });
                
                // Obtenim el nom en català/espanyol del Pokémon
                obtenerNombreEspanol(pokemonId, entry.entry_number, option, customDropdown);
            }
            
            // Ordenem i afegim les opcions tant al select com al dropdown
            opciones.sort((a, b) => a.entryNumber - b.entryNumber);
            opciones.forEach(item => {
                pokemonSelect.appendChild(item.option);
                
                // Creem l'element pel dropdown personalitzat
                const dropdownOption = document.createElement('div');
                dropdownOption.className = 'select-option';
                dropdownOption.dataset.value = item.id;
                dropdownOption.textContent = item.text;
                
                // Gestionem el clic en una opció del dropdown
                dropdownOption.addEventListener('click', function() {
                    pokemonSelect.value = this.dataset.value;
                    customSelectButton.textContent = this.textContent;
                    pokemonSelect.dispatchEvent(new Event('change'));
                    customDropdown.classList.remove('show');
                    
                    // Actualitzem la visualització de l'opció seleccionada
                    document.querySelectorAll('.select-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                });
                
                customDropdown.appendChild(dropdownOption);
            });
            
            // Gestió de la visualització del dropdown - bloqueja fins que la DS estigui encesa
            customSelectButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Només mostrar el dropdown si la DS està encesa
                if (dsEncendida) {
                    customDropdown.classList.toggle('show');
                }
            });
            
            // Tanquem el dropdown quan es fa clic fora
            document.addEventListener('click', function(e) {
                if (!selectContainer.contains(e.target)) {
                    customDropdown.classList.remove('show');
                }
            });
            
            // Configurem els controls de teclat per navegar
            document.addEventListener('keydown', function(event) {
                // Si la DS no està encesa, sortim
                if (!dsEncendida) return;
                
                switch(event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        scrollArriba();
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        scrollAbajo();
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        navegarAnterior();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        navegarSiguiente();
                        break;
                }
            });
            
        } catch (error) {
            console.error('Error carregant la llista de Pokémon:', error);
            pokemonSelect.innerHTML = '<option value="">Error carregant Pokémon</option>';
        }
    }
    
    /**
     * Fetches and sets the Spanish name for a Pokémon
     * @async
     * @param {string} pokemonId - The ID of the Pokémon
     * @param {number} entryNumber - The Pokédex entry number
     * @param {HTMLElement} optionElement - The select option element to update
     */
    async function obtenerNombreEspanol(pokemonId, entryNumber, optionElement, customDropdown) {
        try {
            // Make API call to get species data
            const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
            const datos = await respuesta.json();
            
            // Busquem el nom en espanyol dins l'array de noms
            const nombreEspanol = datos.names.find(n => n.language.name === "es")?.name;
            if (nombreEspanol) {
                // Formem el text complet amb el número i el nom
                const textoCompleto = `#${entryNumber} ${nombreEspanol}`;
                optionElement.textContent = textoCompleto;
                
                // Si existeix el dropdown personalitzat, actualitzem també la seva opció corresponent
                if (customDropdown) {
                    const dropdownOption = customDropdown.querySelector(`[data-value="${pokemonId}"]`);
                    if (dropdownOption) {
                        dropdownOption.textContent = textoCompleto;
                    }
                }
            }
        } catch (error) {
            // Si hi ha un error, el mostrem a la consola
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
            // Ocultem la pantalla de càrrega per defecte i mostrem la info del Pokémon
            document.getElementById('defaultScreen').style.display = 'none';
            pokemonInfo.classList.remove('d-none');
            pokemonDetails.classList.remove('d-none');
            
            // Establim una imatge de càrrega mentre esperem les dades
            document.getElementById('pokemonImage').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png";
            document.getElementById('pokemonName').textContent = "Loading...";
            document.getElementById('pokemonTypes').innerHTML = '';
            
            // Fem dues crides en paral·lel per obtenir les dades de l'espècie i del Pokémon
            const [datosEspecie, datosPokemon] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`).then(r => r.json()),
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`).then(r => r.json())
            ]);
            
            // Obtenim el nom en espanyol o utilitzem el nom per defecte
            const nombreEspanol = datosEspecie.names.find(n => n.language.name === "es")?.name || datosPokemon.name;
            
            // Obtenim la descripció en espanyol
            const descripcionEntries = datosEspecie.flavor_text_entries.filter(entry => entry.language.name === "es");
            let descripcion = "No information available for this Pokémon.";
            if (descripcionEntries.length > 0) {
                descripcion = descripcionEntries[descripcionEntries.length - 1].flavor_text;
                descripcion = descripcion.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
            }
            document.getElementById('pokemonDesc').textContent = descripcion;

            // Actualitzem la imatge i informació bàsica
            document.getElementById('pokemonImage').src = datosPokemon.sprites.other["official-artwork"].front_default || datosPokemon.sprites.front_default;
            document.getElementById('pokemonName').textContent = nombreEspanol;
            document.getElementById('pokemonNumber').textContent = `N° ${datosPokemon.id.toString().padStart(3, '0')}`;
            
            // AFEGIR AQUESTA LÍNIA PER REPRODUIR EL SO AUTOMÀTICAMENT
            // Reproduir el so del Pokémon automàticament quan canvia
            reproducirSonidoPokemon(datosPokemon.id, datosPokemon.name);
            
            // Creem el botó de so
            const soundButton = document.createElement('button');
            soundButton.className = 'sound-button';
            soundButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

            // Afegim el botó al contenidor de la imatge
            const imageContainer = document.querySelector('.pokemon-image-container');
            if (imageContainer) {
                // Eliminem el botó anterior si existeix per evitar duplicats
                const oldButton = imageContainer.querySelector('.sound-button');
                if (oldButton) {
                    oldButton.remove();
                }
                imageContainer.appendChild(soundButton);
            }

            // Afegim l'esdeveniment per reproduir el so novament si es fa clic
            soundButton.addEventListener('click', function(e) {
                e.preventDefault();
                reproducirSonidoPokemon(datosPokemon.id, datosPokemon.name);
            });
            
            // Mostrem els tipus del Pokémon
            const tiposContainer = document.getElementById('pokemonTypes');
            tiposContainer.innerHTML = '';
            datosPokemon.types.forEach(type => {
                const tipoEspanol = obtenerTipoEspanol(type.type.name);
                const tipoElement = document.createElement('div');
                tipoElement.className = `pokemon-type type-${type.type.name}`;
                tipoElement.textContent = tipoEspanol;
                tiposContainer.appendChild(tipoElement);
            });
            
            // Actualitzem l'alçada i el pes
            document.getElementById('pokemonHeight').textContent = `${datosPokemon.height / 10} m`;
            document.getElementById('pokemonWeight').textContent = `${datosPokemon.weight / 10} kg`;
            
            // Mostrem les estadístiques
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
            
            // Mostrem les habilitats
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
            
            // Obtenir el tipus principal (primer tipus) per el fons
            if (datosPokemon.types && datosPokemon.types.length > 0) {
                const primaryType = datosPokemon.types[0].type.name;
                const background = getTypeBackground(primaryType);
                
                // Aplicar el fons a la pantalla superior
                const display = document.querySelector('.display');
                display.style.background = `linear-gradient(90deg, ${background.primary} 33.34%, ${background.secondary} 66.66%)`;
                
                // Afegir una animació de fons per al tipus principal
                display.style.backgroundSize = '300% 300%';
                display.style.animation = 'type-bg-animation 8s ease infinite';
                
                // Eliminar partícules anteriors i afegir-ne de noves
                const previousParticles = display.querySelector('.type-particles');
                if (previousParticles) {
                    previousParticles.remove();
                }
                
               
                const particlesElement = document.createElement('div');
                particlesElement.className = `type-particles type-particles-${primaryType}`;
                display.appendChild(particlesElement);
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
    
    /**
     * Plays the Pokémon cry sound
     * @param {number} pokemonId - The ID of the Pokémon
     * @param {string} pokemonName - The name of the Pokémon (for fallback)
     */
    function reproducirSonidoPokemon(pokemonId, pokemonName) {
    
        const audioElement = new Audio();
        
      
        let audioUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ogg`;
        
     
        const fallbackUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemonId}.ogg`;
        

        audioElement.src = audioUrl;
        audioElement.onerror = function() {
           
            console.log(`Error cargando sonido ${audioUrl}, intentando alternativa...`);
            audioElement.src = fallbackUrl;
            audioElement.onerror = function() {
                console.log(`No se pudo cargar el sonido para ${pokemonName} (ID: ${pokemonId})`);
            };
            audioElement.play().catch(e => console.log('Error reproduciendo sonido:', e));
        };
  
        audioElement.play().catch(e => console.log('Error reproduciendo sonido:', e));
        
       
        const imgPokemon = document.getElementById('pokemonImage');
        imgPokemon.classList.add('playing-sound');
        
        audioElement.onended = function() {
            imgPokemon.classList.remove('playing-sound');
        };
    }
    
    /**
     * Gets the background color for a Pokémon type
     * @param {string} type - The Pokémon type
     * @returns {object} Background gradient colors
     */
    function getTypeBackground(type) {
       
        const backgrounds = {
            'normal': { primary: '#A8A77A50', secondary: '#A8A77A30' },
            'fire': { primary: '#EE813050', secondary: '#FFA07A40' },
            'water': { primary: '#6390F050', secondary: '#92C4DE40' },
            'electric': { primary: '#F7D02C50', secondary: '#FFE87040' },
            'grass': { primary: '#7AC74C50', secondary: '#A8E06040' },
            'ice': { primary: '#96D9D650', secondary: '#BAFFFA40' },
            'fighting': { primary: '#C22E2850', secondary: '#E0696940' },
            'poison': { primary: '#A33EA150', secondary: '#CF9FE740' },
            'ground': { primary: '#E2BF6550', secondary: '#E6D69D40' },
            'flying': { primary: '#A98FF350', secondary: '#C6B7ED40' },
            'psychic': { primary: '#F9558750', secondary: '#FFC0CB40' },
            'bug': { primary: '#A6B91A50', secondary: '#C6E06040' },
            'rock': { primary: '#B6A13650', secondary: '#D5C37840' },
            'ghost': { primary: '#73579750', secondary: '#A292BC40' },
            'dragon': { primary: '#6F35FC50', secondary: '#A27DFA40' },
            'dark': { primary: '#70574650', secondary: '#A2918740' },
            'steel': { primary: '#B7B7CE50', secondary: '#D8D8E640' },
            'fairy': { primary: '#D685AD50', secondary: '#F4BDC940' }
        };
        
        return backgrounds[type] || backgrounds['normal'];
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
    
    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
        .vol.active-sound {
            box-shadow: 0 0 8px rgba(76, 175, 80, 0.7);
        }
        
        .vol.active-sound ul {
            background: linear-gradient(to bottom, #9cff9c 0%, #44c767 100%);
        }
        
        .vol.active-sound::after {
            content: "♫";
            position: absolute;
            top: -15px;
            right: -5px;
            font-size: 14px;
            color: #44c767;
            animation: float 2s infinite ease-in-out;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(extraStyle);
});