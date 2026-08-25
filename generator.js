// generator.js - Generator page and News page functionality

document.addEventListener('DOMContentLoaded', () => {
    // --- Generator Page Elements ---
    const masterPasswordInput = document.getElementById('master-password');
    const outputPassword = document.getElementById('output-password');
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const includeLowercase = document.getElementById('include-lowercase');
    const includeUppercase = document.getElementById('include-uppercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSpecial = document.getElementById('include-special');
    const specialCharsInput = document.getElementById('special-chars-input');
    const encryption1Select = document.getElementById('encryption-1');
    const encryption2Select = document.getElementById('encryption-2');
    const termsConsentBanner = document.getElementById('terms-consent-banner');
    const btnAgreeTerms = document.getElementById('btn-agree-terms');

    // Only run generator logic if we're on the generator page
    if (!masterPasswordInput) return;

    const ALL_INPUTS = [
        masterPasswordInput, encryption1Select, encryption2Select, lengthSlider,
        includeLowercase, includeUppercase, includeNumbers, includeSpecial, specialCharsInput
    ];

    // One-time terms acceptance
    function checkTermsConsentUI() {
        const accepted = localStorage.getItem('terms_accepted') === 'true';
        if (!accepted) {
            termsConsentBanner.classList.remove('hidden');
        } else {
            termsConsentBanner.classList.add('hidden');
        }
    }

    if (btnAgreeTerms) {
        btnAgreeTerms.addEventListener('click', () => {
            localStorage.setItem('terms_accepted', 'true');
            termsConsentBanner.classList.add('hidden');
            generatePassword(); // Generate immediately
        });
    }

    // Password Generation Logic
    const customAlgos = {
        custom1: (str) => Array.from(str).map(char => String.fromCharCode((char.charCodeAt(0) * 15 + 4) % 94 + 33)).join(''),
        custom2: (str) => Array.from(str).reverse().map(char => String.fromCharCode((char.charCodeAt(0) ^ 42) % 94 + 33)).join(''),
        custom3: (str) => Array.from(str).map(char => String.fromCharCode(((char.charCodeAt(0) << 2) | (char.charCodeAt(0) >> 6)) % 94 + 33)).join(''),
        customA: (str) => Array.from(str).map(char => String.fromCharCode((char.charCodeAt(0) + 13) % 94 + 33)).join(''),
        customB: (str) => Array.from(str).map((char, i) => String.fromCharCode((char.charCodeAt(0) + str.charCodeAt(str.length - 1 - i)) % 94 + 33)).join(''),
        customC: (str) => { let res = Array.from(str).map(c => c.charCodeAt(0)); for(let i=0; i < res.length-1; i++) { res[i] = (res[i] ^ res[i+1]) % 94 + 33; } return res.map(c => String.fromCharCode(c)).join(''); }
    };

    function generatePassword() {
        // One-Time Local Storage Verification
        const termsAccepted = localStorage.getItem('terms_accepted') === 'true';
        if (!termsAccepted) {
            outputPassword.value = "";
            outputPassword.classList.remove('text-green-400', 'font-bold');
            outputPassword.classList.add('italic', 'text-gray-500');
            outputPassword.placeholder = "Please agree to the Terms above";
            termsConsentBanner.classList.remove('hidden');
            return;
        }

        const masterPassword = masterPasswordInput.value;
        if (!masterPassword) {
            outputPassword.value = '';
            outputPassword.classList.remove('text-green-400', 'font-bold');
            outputPassword.classList.add('italic', 'text-gray-500');
            outputPassword.placeholder = "Enter remembered password to generate";
            return;
        }
        
        // Show solid bold green text to make password highly visible
        outputPassword.classList.remove('italic', 'text-gray-500');
        outputPassword.classList.add('text-green-400', 'font-bold');

        let processedString = '';
        const enc1 = encryption1Select.value;
        if (enc1 === 'sha256') { processedString = CryptoJS.SHA256(masterPassword).toString(); } 
        else if (enc1 === 'md5') { processedString = CryptoJS.MD5(masterPassword).toString(); } 
        else {
            const customOutput = customAlgos[enc1](masterPassword);
            processedString = CryptoJS.SHA3(customOutput).toString();
        }
        
        const enc2 = encryption2Select.value;
        if (enc2 !== 'skip') {
            if (enc2 === 'sha256') { processedString = CryptoJS.SHA256(processedString).toString(); } 
            else if (enc2 === 'md5') { processedString = CryptoJS.MD5(processedString).toString(); } 
            else { 
                const customOutput = customAlgos[enc2](processedString);
                processedString = CryptoJS.SHA256(customOutput).toString();
            }
        }
        
        let charPool = '';
        if (includeLowercase.checked) charPool += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase.checked) charPool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers.checked) charPool += '0123456789';
        if (includeSpecial.checked) charPool += specialCharsInput.value;
        if (charPool.length === 0) charPool = 'abcdefghijklmnopqrstuvwxyz'; 
        
        const finalLength = parseInt(lengthSlider.value, 10);
        let finalPassword = '';
        let workingBuffer = processedString;

        for (let i = 0; i < finalLength; i++) {
            if (i > 0 && i % workingBuffer.length === 0) {
                workingBuffer = CryptoJS.SHA256(workingBuffer + i).toString();
            }
            const index1 = workingBuffer.charCodeAt(i % workingBuffer.length);
            const index2 = workingBuffer.charCodeAt((i + Math.floor(workingBuffer.length / 3) + i) % workingBuffer.length);
            const poolIndex = (index1 + index2 + i) % charPool.length;
            finalPassword += charPool[poolIndex];
        }
        
        outputPassword.value = finalPassword;
    }

    ALL_INPUTS.forEach(input => {
        if (input) {
            input.addEventListener('input', generatePassword);
            input.addEventListener('change', generatePassword);
        }
    });

    if (lengthSlider) {
        lengthSlider.addEventListener('input', () => { 
            if (lengthValue) lengthValue.textContent = lengthSlider.value; 
        });
    }
    
    // Copy button
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            if (outputPassword.value) {
                const textarea = document.createElement('textarea');
                textarea.value = outputPassword.value;
                document.body.appendChild(textarea);
                textarea.select();
                try { 
                    document.execCommand('copy'); 
                    document.getElementById('copy-feedback').textContent = 'Copied to clipboard!'; 
                } catch (err) { 
                    document.getElementById('copy-feedback').textContent = 'Failed to copy!'; 
                }
                document.body.removeChild(textarea);
                setTimeout(() => { document.getElementById('copy-feedback').textContent = ''; }, 2000);
            }
        });
    }

    // Virtual Keyboard logic
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    let capsLock = false;
    let shift = false;
    
    const keyboardLayout = [
        ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
        ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
        ["CapsLock", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
        ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
        ["Space"]
    ];

    const shiftedSymbols = {
        "`":"~", "1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", "8":"*", "9":"(", "0":")", 
        "-":"_", "=":"+", "[":"{", "]":"}", "\\":"|", ";":":", "'":'"', ",":"<", ".":">", "/":"?"
    };

    function updateKeyboardCase() {
        if (!virtualKeyboard) return;
        const isUpperCase = (shift && !capsLock) || (!shift && capsLock);
        
        virtualKeyboard.querySelectorAll('.keyboard-key').forEach(key => {
            const keyVal = key.dataset.key;
            if (!keyVal) return;

            if (keyVal.length === 1 && keyVal.match(/[a-z]/i)) {
                key.textContent = isUpperCase ? keyVal.toUpperCase() : keyVal.toLowerCase();
            } else if (keyVal.length === 1 && shiftedSymbols[keyVal]) {
                key.textContent = shift ? shiftedSymbols[keyVal] : keyVal;
            }
        });
    }

    const toggleKbBtn = document.getElementById('toggle-keyboard');
    if (toggleKbBtn) {
        toggleKbBtn.addEventListener('click', () => { 
            if (virtualKeyboard) virtualKeyboard.classList.toggle('hidden'); 
        });
    }

    if (virtualKeyboard) {
        // Re-initialize standard hardware keyboard flex layout container
        virtualKeyboard.innerHTML = '';
        virtualKeyboard.className = "virtual-keyboard hidden flex flex-col w-full bg-gray-800 p-3 rounded-lg gap-1 border border-gray-700";

        keyboardLayout.forEach(row => {
            const rowContainer = document.createElement('div');
            rowContainer.className = "flex w-full justify-center gap-1";

            row.forEach(key => {
                const b = document.createElement('button');
                b.dataset.key = key;
                b.innerText = key;
                
                // Default base styling properties
                b.className = "keyboard-key flex items-center justify-center text-xs sm:text-sm font-semibold h-10 rounded transition-all duration-100 cursor-pointer shadow bg-gray-600 text-gray-200 hover:bg-gray-500 active:translate-y-0.5";
                
                // Row alignment definitions
                if (key === "Space") b.className += " flex-grow max-w-[24rem] key-space";
                else if (key === "Backspace" || key === "CapsLock" || key === "Enter") b.className += " w-16 sm:w-20 font-bold bg-gray-700 text-gray-400";
                else if (key === "Tab" || key === "Shift") b.className += " w-12 sm:w-16 font-bold bg-gray-700 text-gray-400";
                else b.className += " w-8 sm:w-10";

                rowContainer.appendChild(b);
            });
            virtualKeyboard.appendChild(rowContainer);
        });

        virtualKeyboard.addEventListener('click', (e) => {
            const keyElement = e.target.closest('.keyboard-key');
            if (!keyElement) return;

            const key = keyElement.dataset.key;
            let value = masterPasswordInput.value;

            switch(key) {
                case 'Backspace': masterPasswordInput.value = value.slice(0, -1); break;
                case 'CapsLock': 
                    capsLock = !capsLock; 
                    keyElement.classList.toggle('key-active', capsLock);
                    keyElement.classList.toggle('bg-indigo-600', capsLock);
                    updateKeyboardCase(); 
                    break;
                case 'Shift': 
                    shift = !shift; 
                    virtualKeyboard.querySelectorAll('[data-key="Shift"]').forEach(el => {
                        el.classList.toggle('key-active', shift);
                        el.classList.toggle('bg-indigo-600', shift);
                    });
                    updateKeyboardCase(); 
                    break;
                case 'Tab': masterPasswordInput.value += '\t'; break;
                case 'Enter': break;
                case 'Space': masterPasswordInput.value += ' '; break;
                default: 
                    masterPasswordInput.value += keyElement.textContent; 
                    // Auto-release shift modifier if tapped inside character frames
                    if (shift) {
                        shift = false;
                        virtualKeyboard.querySelectorAll('[data-key="Shift"]').forEach(el => {
                            el.classList.remove('key-active', 'bg-indigo-600');
                        });
                        updateKeyboardCase();
                    }
                    break;
            }
            masterPasswordInput.focus();
            masterPasswordInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    // Toggle password visibility
    const togglePwBtn = document.getElementById('toggle-password-visibility');
    if (togglePwBtn) {
        togglePwBtn.addEventListener('click', () => {
            const isPassword = masterPasswordInput.type === 'password';
            masterPasswordInput.type = isPassword ? 'text' : 'password';
            document.getElementById('eye-icon').classList.toggle('hidden', isPassword);
            document.getElementById('eye-off-icon').classList.toggle('hidden', !isPassword);
        });
    }

    // Memorable Passphrase Data
    const memorableWords = [
        "apple", "banana", "orange", "grape", "lemon", "melon", "berry", "peach", "cherry", "mango",
        "ocean", "river", "mountain", "forest", "valley", "desert", "island", "planet", "star", "cloud",
        "tiger", "lion", "elephant", "monkey", "zebra", "panda", "giraffe", "kangaroo", "dolphin", "whale",
        "happy", "brave", "clever", "bright", "gentle", "calm", "swift", "strong", "proud", "fierce",
        "summer", "winter", "spring", "autumn", "morning", "evening", "night", "dawn", "dusk", "noon",
        "guitar", "piano", "violin", "flute", "drums", "trumpet", "cello", "harp", "bass", "horn",
        "purple", "yellow", "orange", "green", "silver", "golden", "crimson", "violet", "indigo", "azure",
        "coffee", "butter", "cheese", "bread", "sugar", "honey", "water", "juice", "cream", "syrup",
        "copper", "bronze", "iron", "steel", "brass", "nickel", "zinc", "stone", "wood", "glass",
        "rocket", "engine", "motor", "wheel", "brake", "wing", "sail", "rudder", "anchor", "cabin",
        "circle", "square", "triangle", "sphere", "cube", "cone", "prism", "spiral", "pyramid", "oval",
        "spider", "lizard", "beetle", "turtle", "snake", "frog", "toad", "snail", "gecko", "iguana",
        "castle", "palace", "tower", "bridge", "tunnel", "house", "lodge", "mansion", "villa", "fort",
        "falcon", "eagle", "hawk", "owl", "raven", "dove", "swan", "robin", "finch", "crane",
        "shadow", "spirit", "phantom", "ghost", "vision", "dream", "mirage", "echo", "aura", "halo",
        "puzzle", "riddle", "enigma", "secret", "mystery", "cipher", "maze", "labyrinth", "code", "myth"
    ];

    // Randomizer UI Logic
    const randomPwModal = document.getElementById('random-pw-modal');
    const randomPwLengthInput = document.getElementById('random-pw-length');
    const randomPwWordsInput = document.getElementById('random-pw-words');
    const typeRadios = document.querySelectorAll('input[name="pw-type"]');
    const lengthContainer = document.getElementById('length-container');
    const wordCountContainer = document.getElementById('word-count-container');
    
    const randPwBtn = document.getElementById('randomize-password');
    if (randPwBtn) {
        randPwBtn.addEventListener('click', () => { 
            if (randomPwModal) randomPwModal.classList.remove('hidden'); 
        });
    }
    
    const cancelRandPwBtn = document.getElementById('cancel-random-pw');
    if (cancelRandPwBtn) {
        cancelRandPwBtn.addEventListener('click', () => { 
            if (randomPwModal) randomPwModal.classList.add('hidden'); 
        });
    }

    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'chars') {
                lengthContainer.classList.remove('hidden');
                wordCountContainer.classList.add('hidden');
            } else {
                lengthContainer.classList.add('hidden');
                wordCountContainer.classList.remove('hidden');
            }
        });
    });
    
    const confirmRandPwBtn = document.getElementById('confirm-random-pw');
    if (confirmRandPwBtn) {
        confirmRandPwBtn.addEventListener('click', () => {
            const typeChecked = document.querySelector('input[name="pw-type"]:checked');
            if (!typeChecked) return;
            
            const type = typeChecked.value;
            let result = '';

            if (type === 'chars') {
                let length = parseInt(randomPwLengthInput.value, 10);
                if (isNaN(length) || length < 16) length = 16;
                else if (length > 64) length = 64;
                randomPwLengthInput.value = length;

                const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?";
                const randomValues = new Uint32Array(length);
                window.crypto.getRandomValues(randomValues); 
                
                for (let i = 0; i < length; i++) { 
                    result += charset[randomValues[i] % charset.length]; 
                }
            } else {
                let wordCount = parseInt(randomPwWordsInput.value, 10);
                if (isNaN(wordCount) || wordCount < 3) wordCount = 3;
                else if (wordCount > 12) wordCount = 12;
                randomPwWordsInput.value = wordCount;

                const randomValues = new Uint32Array(wordCount);
                window.crypto.getRandomValues(randomValues);

                let chosenWords = [];
                for (let i = 0; i < wordCount; i++) {
                    chosenWords.push(memorableWords[randomValues[i] % memorableWords.length]);
                }
                const randomNum = Math.floor(Math.random() * 90) + 10;
                result = chosenWords.join('-') + '-' + randomNum;
            }
            
            masterPasswordInput.value = result;
            masterPasswordInput.type = 'text'; 
            document.getElementById('eye-icon').classList.add('hidden');
            document.getElementById('eye-off-icon').classList.remove('hidden');

            masterPasswordInput.dispatchEvent(new Event('input', { bubbles: true }));
            randomPwModal.classList.add('hidden');
        });
    }

    // Initialize length label
    if (lengthValue && lengthSlider) {
        lengthValue.innerText = lengthSlider.value;
        lengthSlider.addEventListener('input', (e) => {
            lengthValue.innerText = e.target.value;
        });
    }

    // Initial terms check
    checkTermsConsentUI();
});
