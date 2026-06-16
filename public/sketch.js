var m_socket;
var m_initialized = false;
var m_mySocketId;
var m_classRadio;
var m_initButton, m_nameInputButton;
var m_initialPlayer, m_players = [], m_thisPlayer;  
let m_standalone = false;
let m_cities= [];
const POS_ABOVE = 0, POS_RIGHT = 1, POS_BELOW = 2, POS_LEFT = 3;
const CLASS_NONE = -1, CLASS_CONTINGENCY = 0, CLASS_DISPATCHER = 1, CLASS_MEDIC = 2, CLASS_OPERATIONS = 3, CLASS_QUARANTINE = 4, 
      CLASS_RESEARCHER = 5; CLASS_SCIENTIST = 6, CLASS_NUM_CLASSES = 7;
const m_classNames = ['Contingency', 'Dispatcher', 'Medic', 'Operations', 'Quarantine', 'Researcher', 'Scientist'];

const SET_PLAYER = 0, SET_INFECTION = 1, SET_CLASSES = 2, SET_NUM_SETS = 3;
const DECK_PLAYER = 0, DECK_PLAYER_DISCARD = 1,   DECK_INFECTION = 2, DECK_INFECTION_DISCARD = 3, DECK_CLASSES = 4, 
      DECK_REMOVED = 5, DECK_GENERIC = 6, DECK_NUM_DECKS = 7;
const NUM_PLAYER_NORMAL = 48, NUM_EVENT = 5, NUM_EPIDEMIC = 6, NUM_INFECTION = 48;
var m_messageColors = ['#000000', '#FF0000', '#55AA55', '#0000FF'];
var m_tokenColors = ['#1F7071', '#C24E97', '#E46423', '#749E3C', '#396C5B', '#794d32', '#B6ADAE'];
var m_diseaseColors = ['#FFFF00', '#FF0000', '#0000FF', '#000000']
var m_diseaseColors2 = ['#FFFF00', '#FF0000', '#0000FF', '#A0A0A0']
var m_diseaseCount = [24, 24, 24, 24];
var m_colorNum = 0;
let m_setImages = [];
let m_cardBackImages = [];
let m_roleImages = [];
let m_tokenImages = [];
let m_tokens = [];
let m_tokenSize = 30;
let m_selectedToken = -1;
const TOKEN_INFECTION = 0, TOKEN_OUTBREAKS = 1, TOKEN_NUM_TOKENS = 2;
let m_gameBoardImage;
let m_decks = [];
const DISEASE_NORMAL = 0, DISEASE_CURED = 1, DISEASE_ERADICATED = 2;
let m_diseaseStates = [0, 0, 0, 0];  // yellow, red, blue, black
let m_debugSet=-1, m_debugDeck=-1;
let m_cw = 100, m_ch = 150;   // card w/h.  Right now I'm using a weird combination of m_cw and m_bcw
let m_bcw = 125, m_bch = 175; // big card w/h
let m_bw = 50, m_bh = 50;
let m_messageP, m_oldMessage;
let m_s = 1.0;
let m_allButtons = [];
let m_difficulty = 4;
var m_qrImageElement, m_qrShowing = false;
let m_buttonYes, m_buttonNo;
let m_savedData, m_saveButton, m_loadButton, m_parseButton, m_restoreButton, m_jsonInput, m_hideSaveButton;

//////////////////////////////////////////////////////////////////////////////////////
function preload() {
  // create the array of sets
  for (let i = 0; i < SET_NUM_SETS; i++) m_setImages[i] = [];

  // player set
  for (let i = 1; i <= NUM_PLAYER_NORMAL; i++) m_setImages[SET_PLAYER].push(loadImage('Assets/playerCards (' + i + ').jpg'));
  for (let i = 1; i <= NUM_EVENT; i++)         m_setImages[SET_PLAYER].push(loadImage('Assets/playerCardsEvents (' + i + ').jpg'));
  for (let i = 1; i <= NUM_EPIDEMIC; i++)      m_setImages[SET_PLAYER].push(loadImage('Assets/epidemicCards (' + i + ').jpg'));

  // infection set
  for (let i = 1; i <= NUM_INFECTION; i++)     m_setImages[SET_INFECTION].push(loadImage('Assets/infectionCards (' + i + ').jpg'));

  // card back images
  m_cardBackImages[SET_PLAYER] = loadImage('Assets/playerCardBack.jpg')
  m_cardBackImages[SET_INFECTION] = loadImage('Assets/infectionCardBack.jpg')

  // role images
  for (let i = 1; i <= CLASS_NUM_CLASSES; i++)     m_setImages[SET_CLASSES].push(loadImage('Assets/rolesCards (' + i + ').jpg'));

  // tokens
  m_tokenImages.push(loadImage('Assets/markerInfection.png'));
  m_tokenImages.push(loadImage('Assets/markerOutbreak.png'));
  m_tokenImages.push(loadImage('Assets/researchStation.png'));

  // game board
  m_gameBoardImage = loadImage('Assets/gameBoard.jpg');

}

//////////////////////////////////////////////////////////////////////////////////////
function setup() {
  createCanvas(1600, 900);
  ellipseMode(CORNER);

  /////////////////////////////////////////////////
  // Cards and Decks
  /////////////////////////////////////////////////

  // Create player deck
  let startIndex = 0;
  m_decks[DECK_PLAYER] = new Deck(DECK_PLAYER, SET_PLAYER, SET_PLAYER, m_bcw, m_bch);
  createCardsAndAddToDeck(SET_PLAYER, DECK_PLAYER, startIndex, NUM_PLAYER_NORMAL+NUM_EVENT);
  m_decks[DECK_PLAYER].shuffle();
  addEpidemicCards();

  // Create player discard deck.  It starts with no cards
  m_decks[DECK_PLAYER_DISCARD] = new Deck(DECK_PLAYER_DISCARD, SET_PLAYER, SET_PLAYER, m_bcw, m_bch);

  // Create infection deck
  startIndex = 0;
  m_decks[DECK_INFECTION] = new Deck(DECK_INFECTION, SET_INFECTION, SET_INFECTION, m_bch, m_bcw);
  createCardsAndAddToDeck(SET_INFECTION, DECK_INFECTION, startIndex, NUM_INFECTION);
  m_decks[DECK_INFECTION].shuffle();

  // Create infection discard deck.  It starts with no cards
  m_decks[DECK_INFECTION_DISCARD] = new Deck(DECK_INFECTION_DISCARD, SET_INFECTION, SET_INFECTION, m_bch, m_bcw);

  // Roles/classes deck
  startIndex = 0;
  m_decks[DECK_CLASSES] = new Deck(DECK_CLASSES, SET_CLASSES, SET_CLASSES, m_bcw, m_bch);
  createCardsAndAddToDeck(SET_CLASSES, DECK_CLASSES, startIndex, CLASS_NUM_CLASSES);

  // The removed deck can have player cards and infection cards.  noone will ever see it so that's ok
  m_decks[DECK_REMOVED] = new Deck(DECK_INFECTION_DISCARD, SET_INFECTION, SET_INFECTION, m_bch, m_bcw);

  // The generic deck is for the FOrecast Event which uses infection cards
  m_decks[DECK_GENERIC] = new Deck(DECK_GENERIC, SET_INFECTION, SET_INFECTION, m_bch, m_bcw);

  // // JMU testing add a card to each discard
  // let card = m_decks[DECK_PLAYER].dealCard();
  // if (card) m_decks[DECK_PLAYER_DISCARD].addCard(card);
  // card = m_decks[DECK_INFECTION].dealCard();
  // if (card) m_decks[DECK_INFECTION_DISCARD].addCard(card);

  /////////////////////////////////////////////
  // Cities
  /////////////////////////////////////////////
  createCities();

  /////////////////////////////////////////////
  // Tokens
  /////////////////////////////////////////////
  for (let i = 0; i < CLASS_NUM_CLASSES; i++) {
    m_tokens[i] = new Token(40*(i+1), 5, m_tokenColors[i], -1, m_classNames[i][0], m_tokenSize);
  }
  m_tokens.push(new Token(40*(CLASS_NUM_CLASSES+1), 5, -1, 0, '', m_tokenSize*1.5));  // infection marker
  m_tokens.push(new Token(40*(CLASS_NUM_CLASSES+2), 5, -1, 1, '', m_tokenSize*1.5));  // outbreak marker
  for (let i = 0; i < 6; i++) {
    m_tokens.push(new Token(40*(CLASS_NUM_CLASSES+3+i), 5, -1, 2, '', m_tokenSize*1.2));  // researchStation
  }

  /////////////////////////////////////////////
  // Network communication
  /////////////////////////////////////////////
  
  // socket
  try {
    m_socket = io();
    console.log('m_socket = ' , m_socket);
  } catch (err) {
    console.log('io exception ', err);
    m_socket = null;
  }  

  // For Standalone play, we don't need a socket connection and we don't even have a server running.
  if (m_socket) {

    // initPlayer message //
    // After the sketch sends the 'start' message, by pressing the Init button, the server responds with the 'initPlayer' message.
    // By the time this gets called, we should have our m_socket.id and this m_players[0].socketId
    // data: a single Player, and it should be ourselves
    m_socket.on('initPlayer', function(data) {
      console.log('initPlayer message: We got ' , data);
      // Only the player who sent the start message to the server wants to process the initPlayer message
      if (m_mySocketId === data.socketId) {
        console.log('initPlayer message: found player');
        m_initialPlayer.copyFromServerData(data, -1);
        console.log('initPlayer message: after copy');
        m_players.push(m_initialPlayer);
        m_initialized = true;
        m_initButton.hide();
        m_nameInputButton.hide();
        m_classRadio.hide();
      } else {
        console.log('initPlayer message: This message intended for another player');
      }

    });

    // heartbeat message //
    // data: object containing a Player array and a Table
    m_socket.on('heartbeat', function(data) {
      // if (!m_initialPlayer) return;
      // console.log('heartbeat message: We got ' , data);
      // createPlayersFromServerData(data.players);
      // createDecksFromServerData(data.decks);
      // createCitiesFromServerData(data.cities);
      // createTokensFromServerData(data.tokens);
      // setMessageFromServerData(data.message);
      // m_difficulty = data.difficulty;
      restoreData(data);

      // // Note I wasn't able to pass in m_discards into the function here and fill it in 
      // // using the function argument.  I had to directly specify m_discards in the function.
      // // This is probably because I keep changing what m_discards is.
      // // createCardArrayFromServerData(data.discards, m_discards);
    });
  }


  //////////////////////////////////////////////
  // GUI stuff
  //////////////////////////////////////////////
  m_messageP = createDiv('Message here');

  /////////////////////////////////////
  // Initialization buttons - all temporary

  // Init Button
  // This only works for games where you don't have to select a class.  As soon as you click
  // outside the input name field, the callback is triggered, so you have to select the
  // class first and then the name.  This is too error prone.
  // m_initButton = createSpan('Type Name and hit Enter');
  // m_nameInputButton = createInput();
  // m_nameInputButton.changed(initPlayerToServer);
  m_initButton = createButton('Init: Enter Name');
  m_initButton.mousePressed(initPlayerToServer);
  m_nameInputButton = createInput();

  /////////////////////////////////////////////
  // Radio Buttons for class
  m_classRadio = createRadio();
  for (let i = 0; i < m_classNames.length; i++) {
    m_classRadio.option(i, m_classNames[i]);

  }
  // Set default
  m_classRadio.selected('0');
  // Style: Make options align horizontally
  // Select all input elements within the radio
  let opts = selectAll('input', m_classRadio);
  for (let i = 0; i < opts.length; i++) {
    opts[i].style('margin', '10px'); // Spacing between buttons
  }

  // Per-player buttons
  let offset = 900/4;
  for (let i = 0; i < 4; i++) {
    let buttonDraw = createNormalButton("Draw", 1150, i*offset, m_bw, m_bh);
    buttonDraw.mousePressed(() => drawCard(i) );
    let buttonDiscard = createNormalButton("Disc Sel", 1150, i*offset+m_bh, m_bw, m_bh);
    buttonDiscard.mousePressed(discardSelected);
    let buttonTakeSelected = createNormalButton("Take Sel", 1150, i*offset+2*m_bh, m_bw, m_bh);
    buttonTakeSelected.mousePressed(() => takeSelected(i));
    // buttonTakeSelected.mousePressed(takeSelected);
  }

  // Infection deal button and bottom deal (for epidemic)
  let buttonInfectionDeal = createNormalButton("Deal", 715, 0, m_bw, m_bh);
  buttonInfectionDeal.mousePressed(dealInfectionCard);
  let buttonInfectionDealBottom = createNormalButton("Deal Bot", 785, 0, m_bw, m_bh);
  buttonInfectionDealBottom.mousePressed(dealBottomInfectionCard);
  let buttonInfectionMoveToTop = createNormalButton("Top", 715, 70, m_bw, m_bh/2);
  buttonInfectionMoveToTop.mousePressed(moveToTopOfInfection);
  let buttonInfectionMoveToBot = createNormalButton("Bot", 715, 100, m_bw, m_bh/2);
  buttonInfectionMoveToBot.mousePressed(moveToBotOfInfection);

  // Infection Discard shuffle and place on top of Infection.  Spread button
  let buttonInfectionDiscardShuffle = createNormalButton("Shuffle", 910, 0, m_bw, m_bh);
  buttonInfectionDiscardShuffle.style('padding', '5px 0px');
  buttonInfectionDiscardShuffle.mousePressed(shuffleAndReplaceInfectionDiscard);
  let buttonInfectionDiscardSpread = createNormalButton("Spread", 980, 0, m_bw, m_bh);
  buttonInfectionDiscardSpread.style('padding', '5px 0px');
  buttonInfectionDiscardSpread.mousePressed(() => m_decks[DECK_INFECTION_DISCARD].isSpread = !m_decks[DECK_INFECTION_DISCARD].isSpread);

  // Player Discard spread
  let buttonPlayerDiscardSpread = createNormalButton("Spread", 875, 800, m_bw, m_bh);
  buttonPlayerDiscardSpread.style('padding', '5px 0px');
  buttonPlayerDiscardSpread.mousePressed(() => m_decks[DECK_PLAYER_DISCARD].isSpread = !m_decks[DECK_PLAYER_DISCARD].isSpread);

  ///////////////////////////////////////////
  // Buttons along the bottom

  // increment/decrement cubes in selected city
  let buttonYellowInc = createNormalButton2("Inc Yel", 0, 850, m_bw, m_bh, "#e0e016");
  buttonYellowInc.mousePressed(() => changeDiseaseNumber(0, 1));  // yellow +1
  let buttonYellowDec = createNormalButton2("Dec Yel", m_bw, 850, m_bw, m_bh, "#e0e016");
  buttonYellowDec.mousePressed(() => changeDiseaseNumber(0, -1));  // yellow +1
  let buttonRedInc = createNormalButton2("Inc Red", 2*m_bw, 850, m_bw, m_bh, "#d81e1e");
  buttonRedInc.mousePressed(() => changeDiseaseNumber(1, 1));  // yellow +1
  let buttonRedDec = createNormalButton2("Dec Red", 3*m_bw, 850, m_bw, m_bh, "#d81e1e");
  buttonRedDec.mousePressed(() => changeDiseaseNumber(1, -1));  // yellow +1
  let buttonBlueInc = createNormalButton2("Inc Blue", 4*m_bw, 850, m_bw, m_bh, "#1E90FF");
  buttonBlueInc.mousePressed(() => changeDiseaseNumber(2, 1));  // yellow +1
  let buttonBlueDec = createNormalButton2("Dec Blue", 5*m_bw, 850, m_bw, m_bh, "#1E90FF");
  buttonBlueDec.mousePressed(() => changeDiseaseNumber(2, -1));  // yellow +1
  let buttonBlackInc = createNormalButton2("Inc Black", 6*m_bw, 850, m_bw, m_bh, "#A0A0A0");
  buttonBlackInc.mousePressed(() => changeDiseaseNumber(3, 1));  // yellow +1
  let buttonBlackDec = createNormalButton2("Dec Black", 7*m_bw, 850, m_bw, m_bh, "#A0A0A0");
  buttonBlackDec.mousePressed(() => changeDiseaseNumber(3, -1));  // yellow +1

  // change disease state
  let buttonYellowState = createNormalButton2("State Yel", 9*m_bw, 850, m_bw, m_bh, "#e0e016");
  buttonYellowState.mousePressed(() => changeDiseaseState(0));  // yellow +1
  let buttonRedState = createNormalButton2("State Red", 10*m_bw, 850, m_bw, m_bh, "#d81e1e");
  buttonRedState.mousePressed(() => changeDiseaseState(1));  // yellow +1
  let buttonBlueState = createNormalButton2("State Blue", 11*m_bw, 850, m_bw, m_bh, "#1E90FF");
  buttonBlueState.mousePressed(() => changeDiseaseState(2));  // yellow +1
  let buttonBlackState = createNormalButton2("State Black", 12*m_bw, 850, m_bw, m_bh, "#A0A0A0");
  buttonBlackState.mousePressed(() => changeDiseaseState(3));  // yellow +1

  // "special" buttons
  let buttonMarkCard = createNormalButton("Mark Card", 14*m_bw, 850, m_bw, m_bh);
  buttonMarkCard.mousePressed(markCard); 
  let buttonForecast = createNormalButton("Fore cast", 15*m_bw, 850, m_bw, m_bh);
  buttonForecast.mousePressed(forecast); 
  let buttonRemoveCardFromGame = createNormalButton2("Rem- ove", 17*m_bw, 850, m_bw, m_bh, "#FFA500");
  buttonRemoveCardFromGame.mousePressed(removeCardFromGame); 


  // Set difficulty
  let buttonDifficulty4 = createNormalButton("Diff 4", 1050, 850, m_bw, m_bh);
  buttonDifficulty4.mousePressed(function(){
      m_difficulty = 4;
      addEpidemicCards();
      update();
    });
  let buttonDifficulty5 = createNormalButton("Diff 5", 1100, 850, m_bw, m_bh);
  buttonDifficulty5.mousePressed(function(){
      m_difficulty = 5;
      addEpidemicCards();
      update();
    });
  let buttonDifficulty6 = createNormalButton("Diff 6", 1150, 850, m_bw, m_bh);
  buttonDifficulty6.mousePressed(function(){
      m_difficulty = 6;
      addEpidemicCards();
      update();
    });

  // let buttonSaveGame = createNormalButton("Save game", 800, 850, m_bw, m_bh);
  // buttonSaveGame.mousePressed(() => saveGame());
  // let buttonReadGame = createNormalButton("Read game", 850, 850, m_bw, m_bh);
  // buttonReadGame.mousePressed(() => readSavedGame());
  // let buttonRestoreGame = createNormalButton("Load game", 900, 850, m_bw, m_bh);
  // buttonRestoreGame.mousePressed(() => restoreSavedGame());

  m_qrImageElement = createImg('Assets/actionCard.jpg');
  m_qrImageElement.size(493, 674);
  if (!m_qrShowing) m_qrImageElement.hide();

  let showQuickReference = createNormalButton("QR", 950, 850, m_bw, m_bh);
  showQuickReference.mousePressed(function(){
      if (m_qrShowing) m_qrImageElement.hide();
      else             m_qrImageElement.show();
      m_qrShowing = !m_qrShowing;
    });

  ////////////////////////////////////////////
  // Are You Sure Buttons. Hidden until needed
  m_buttonYes = createNormalButton("Yes", 700, 375, 75, 50);
  m_buttonYes.mousePressed(function(){
      removeCardFromGamePart2();
      m_buttonYes.hide();
      m_buttonNo.hide();
    });
  m_buttonNo  = createNormalButton("No", 809, 375, 75, 50);
  m_buttonNo.mousePressed(function(){
      m_buttonYes.hide();
      m_buttonNo.hide();
    });
  m_allButtons.push(new Button(m_buttonYes, 700, 375, 75, 50));
  m_allButtons.push(new Button(m_buttonNo, 809, 375, 75, 50));
  m_buttonYes.hide();
  m_buttonNo.hide();

  // Buttons dealing with save and restore.  These are normally hidden.  They are below the canvas.
  m_saveButton = createButton("1 Save");
  m_saveButton.mousePressed(() => saveGame());
  m_loadButton = createButton("2a Read");
  m_loadButton.mousePressed(() => readSavedGame());
  m_parseButton = createButton("2b Parse");
  m_parseButton.mousePressed(() => parseSavedGame());
  m_restoreButton = createButton("3 Load");
  m_restoreButton.mousePressed(() => restoreSavedGame());
  createDiv();
  m_jsonInput = createInput("The number of players in the saved game must match the number of players currently in the game.");
  m_jsonInput.style('width',  '900px');
  m_jsonInput.style('height', '25px');

  m_hideSaveButton = createButton('Hide');
  m_hideSaveButton.mousePressed(function(){
      m_saveButton.hide(); m_loadButton.hide(); m_parseButton.hide(); m_restoreButton.hide(); m_jsonInput.hide(); m_hideSaveButton.hide();
    });
  m_saveButton.hide(); m_loadButton.hide(); m_parseButton.hide(); m_restoreButton.hide(); m_jsonInput.hide(); m_hideSaveButton.hide();
}  // setup()

////////////////////////////////////////////////////////////
// SAVE and RESTORE functions

// called from heartbeat and from restoreSavedGame
function restoreData(data, isSavedGame = false) {
  if (!m_initialPlayer) return;
  console.log('heartbeat message: We got ' , data);
  console.log('heartbeat message: data.players ' , data.players);
  console.log('heartbeat message: data.players ' , data["players"]);
  createPlayersFromServerData(data.players, isSavedGame);
  createDecksFromServerData(data.decks);
  createCitiesFromServerData(data.cities);
  createTokensFromServerData(data.tokens);
  setMessageFromServerData(data.message);
  m_difficulty = data.difficulty;
  m_diseaseCount = data.diseaseCount;
}

function saveGame() {
  update(true);
}

function readSavedGame() {
  m_savedData = loadJSON('pandemicSave.json');
}
function parseSavedGame() {
  m_savedData = JSON.parse(m_jsonInput.value());
}
function restoreSavedGame() {
  console.log('m_savedData = ' , m_savedData);
  console.log('m_savedData.players = ' , m_savedData.players);
  
  restoreData(m_savedData, true);
  update();
}
function showSaveButtons() {
  m_saveButton.show(); m_loadButton.show(); m_parseButton.show(); m_restoreButton.show(); m_jsonInput.show(); m_hideSaveButton.show();
}

////////////////////////////////////////////////////////////////

// This algorithm places the epidemic cards in a the deck.  If there are 4 cards to be placed,
// then there is 1 epidemic card in wach quarter of the deck.  Since the deck might not split
// evenly into 4 pieces, tha larger quarters (with 1 extra card) go first.
function addEpidemicCards() {
  let start = NUM_PLAYER_NORMAL+NUM_EVENT;

  // first remove any existing sumomns cards in the monster deck.  These cards cards with 
  // indexes >= start
  for (let i = m_decks[DECK_PLAYER].cards.length-1; i >= 0; i--) {
    if (m_decks[DECK_PLAYER].cards[i].index >= start) m_decks[DECK_PLAYER].cards.splice(i, 1);
  }

  // Add 1 epidemic card for each level of difficulty
  // I want the smaller packets on the bottom, so I use floor() when calculating packetSize.  If I wanted the smaller
  // packets on top I would use ceil().  If we had 4 epidemic cards, we first calculate 1/4 of the deck size and then
  // put an epidemic card somewhere in that packet.  The next loop we calculate 1/3 of the remaining cards in the
  // deck and put a epidemic card in that packet.
  let lenRemaining = m_decks[DECK_PLAYER].cards.length;  // number of cards remaining in the deck (not counting epidemic cards)
  let packetSizeSum = 0;  // an accumulation of all the packet
  let difficulty = m_difficulty;  // we are going to change the difficulty because we look at 1/4 of the deck, then 1/3 of the remaining, etc
  for (let i = 0; i < m_difficulty; i++) {
    let packetSize = floor(lenRemaining / (difficulty));  // how big is the packet we are going to place the epidemic card in
    lenRemaining -= packetSize;
    difficulty--;
    card = new Card(SET_PLAYER, start, DECK_PLAYER);
    start += 1;
    card.facedown = true;
    let loc = packetSizeSum + floor(random(packetSize+1)); // the extra i is because with N cards, there are N+1 places to put a new card
    m_decks[DECK_PLAYER].cards.splice(loc, 0, card);
    packetSizeSum += packetSize + 1;                       // the extra i is because we are adding a card to the deck each loop
  }

}
function addEpidemicCardsOrig() {
  let start = NUM_PLAYER_NORMAL+NUM_EVENT;

  // first remove any existing sumomns cards in the monster deck.  These cards cards with 
  // indexes >= start
  for (let i = m_decks[DECK_PLAYER].cards.length-1; i >= 0; i--) {
    if (m_decks[DECK_PLAYER].cards[i].index >= start) m_decks[DECK_PLAYER].cards.splice(i, 1);
  }

  // Add 1 summon card for each level of difficulty
  // let packetNum = floor(m_decks[DECK_PLAYER].cards.length / m_difficulty);
  let packetNum = round(m_decks[DECK_PLAYER].cards.length / m_difficulty);
  console.log('packetNum = ' , packetNum);
  console.log('m_difficulty = ' , m_difficulty);
  console.log('start = ' , start);
  console.log('deck len = ' , m_decks[DECK_PLAYER].cards.length);
  
  for (let i = 0; i < m_difficulty; i++) {
    card = new Card(SET_PLAYER, start, DECK_PLAYER);
    start += 1;
    card.facedown = true;
    let loc = i*packetNum + floor(random(packetNum)) + i;  // the extra i is because we are adding cards as we go
    m_decks[DECK_PLAYER].cards.splice(loc, 0, card);
  }

}


////////////////////////////////////////////
// GUI FUNCTIONS
////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function markCard() {
  updateNeeded = false;
  for (let player of m_players) {
    for (let card of player.cards) {
      if (card.selected) {
        card.isMarked = !card.isMarked;
        updateNeeded = true;
      }
    }
  }
  if (updateNeeded) update();
}
//////////////////////////////////////////////////////////////////////////////////////
function forecast() {
  updateNeeded = false;
  for (let i = 0; i < 6; i++) {
    let card = m_decks[DECK_INFECTION].dealCard();
    if (card) {
      m_decks[DECK_GENERIC].addCard(card);
      updateNeeded = true;
    }
  }
  if (updateNeeded) update();
}

//////////////////////////////////////////////////////////////////////////////////////
function moveToTopOfInfection() {
  for (let i = m_decks[DECK_GENERIC].cards.length-1; i >= 0; i--) {
    let card = m_decks[DECK_GENERIC].cards[i];
    if (card.selected) {
      let cards = m_decks[DECK_GENERIC].cards.splice(i, 1);
      m_decks[DECK_INFECTION].addCard(cards[0]);
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////
function moveToBotOfInfection() {
  for (let i = m_decks[DECK_GENERIC].cards.length-1; i >= 0; i--) {
    let card = m_decks[DECK_GENERIC].cards[i];
    if (card.selected) {
      let cards = m_decks[DECK_GENERIC].cards.splice(i, 1);
      m_decks[DECK_INFECTION].cards.unshift(cards[0]);
    }
  }
}

function removeCardFromGame() {
  // let cards = findSelectedCards();
  // if (cards.length == 0) {
  //   m_messageP.html('You must selected at least 1 card');
  //   update();
  //   return;
  // }

  m_buttonYes.show();
  m_buttonNo.show();
}

//////////////////////////////////////////////////////////////////////////////////////
// Can only remove player cards and Infection Discard cards
function removeCardFromGamePart2() {
  updateNeeded = false;
  // look thru the player cards and the infection discard
  for (let player of m_players) {
    for (let i = player.cards.length-1; i >= 0; i--) {
      let card = player.cards[i];
      if (card.selected) {
        let cards = player.cards.splice(i, 1);
        m_decks[DECK_REMOVED].addCard(cards[0]);
        updateNeeded = true;
      }
    }
  }

  for (let i = m_decks[DECK_INFECTION_DISCARD].cards.length-1; i >= 0; i--) {
    let card = m_decks[DECK_INFECTION_DISCARD].cards[i];
    if (card.selected) {
      let cards = m_decks[DECK_INFECTION_DISCARD].cards.splice(i, 1);
      m_decks[DECK_REMOVED].addCard(cards[0]);
      updateNeeded = true;
    }
  }

  if (updateNeeded) update();

}

//////////////////////////////////////////////////////////////////////////////////////
function changeDiseaseState(color) {
  m_diseaseStates[color] += 1;
  if (m_diseaseStates[color] > DISEASE_ERADICATED) m_diseaseStates[color] = 0;
}

//////////////////////////////////////////////////////////////////////////////////////
// color: which disease
// offset: -1 or +1
function changeDiseaseNumber(color, offset) {
  // find the selected city
  let city = null;
  for (let c of m_cities) if (c.selected) city = c;
  if (!city) return;

  // change the correct city disease value, keeping it within the allowable range.
  // Change the overall disease count at the same time
  if ((offset < 0) && (city.diseases[color] > 0)) {
    city.diseases[color] -= 1;
    m_diseaseCount[color] += 1;
  } else if ((offset > 0) && (city.diseases[color] < 3) && m_diseaseCount[color] > 0) {
    city.diseases[color] += 1;
    m_diseaseCount[color] -= 1;
  }

  // city.diseases[color] += offset;
  // if (city.diseases[color] < 0) city.diseases[color] = 0;
  // if (city.diseases[color] > 3) city.diseases[color] = 3;
    
  update();
}

//////////////////////////////////////////////////////////////////////////////////////
function dealInfectionCard() {
  let card = m_decks[DECK_INFECTION].dealCard();
  if (card) {
    m_decks[DECK_INFECTION_DISCARD].addCard(card);
  }
}
function dealBottomInfectionCard() {
  if (m_decks[DECK_INFECTION].cards.length <=0) return;
  let cards = m_decks[DECK_INFECTION].cards.splice(0, 1);
  m_decks[DECK_INFECTION_DISCARD].addCard(cards[0]);
}

function shuffleAndReplaceInfectionDiscard() {
  m_decks[DECK_INFECTION_DISCARD].shuffle();
  let len = m_decks[DECK_INFECTION_DISCARD].cards.length
  for (let i = 0; i < len; i++) {
    let card = m_decks[DECK_INFECTION_DISCARD].dealCard();
    m_decks[DECK_INFECTION].addCard(card);
  }
}

//////////////////////////////////////////////////////////////////////////////////////
function discardSelected() {
  for (player of m_players) {
    // > 0 because you can't give way your role card
    for (let i = player.cards.length-1; i > 0; i--) {
      if (player.cards[i].selected) {
        player.cards[i].selected = false;
        player.cards[i].isNew = false;
        let cards = player.cards.splice(i, 1);
        m_decks[DECK_PLAYER_DISCARD].addCard(cards[0]);
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// returns an array of all selected cards
function findSelectedCardsUntested() {
  let cards = [];
  for (let card of m_decks[DECK_PLAYER_DISCARD]) {
    if (card.selected) cards.push(card);
  }
  for (let player of m_players) {
    for (let card of player.cards) {
      if (card.selected) cards.push(card);
    }
  }
  return cards;
}

//////////////////////////////////////////////////////////////////////////////////////
// I'd like to use findSelectedCards() here.  But I can't allow the Role cards to be take
function takeSelected(playerNum) {
  if (playerNum >= m_players.length) return;
  // check all the player cards
  for (player of m_players) {
    if (player.seatPos == m_players[playerNum].seatPos) continue;
    // if (player.seatPos == m_thisPlayer.seatPos) continue;
    
    // > 0 because you can't give way your role card
    for (let i = player.cards.length-1; i > 0; i--) {
      if (player.cards[i].selected) {
        player.cards[i].selected = false;
        player.cards[i].isNew = false;
        let cards = player.cards.splice(i, 1);
        m_players[playerNum].cards.push(cards[0]);
        // m_thisPlayer.cards.push(cards[0]);
      }
    }
  }

  // check the player discard deck
  for (let i = m_decks[DECK_PLAYER_DISCARD].cards.length-1; i >= 0; i--) {
    if (m_decks[DECK_PLAYER_DISCARD].cards[i].selected) {
      m_decks[DECK_PLAYER_DISCARD].cards[i].selected = false;
      m_decks[DECK_PLAYER_DISCARD].cards[i].isNew = false;
      let cards = m_decks[DECK_PLAYER_DISCARD].cards.splice(i, 1);
      m_players[playerNum].cards.push(cards[0]);
      // m_thisPlayer.cards.push(cards[0]);
    }
  }

}

//////////////////////////////////////////////////////////////////////////////////////
function createNormalButton(name, x, y, w, h) {
  let button = createButton(name);
    button.style('width',  w+'px');
    button.style('height', h+'px');
    button.position(x, y);
    button.style('font-size', '16px');
    button.style('background-color', "#F0F0F0");
    button.style('borderRadius', "8px");
    button.mouseOver(() => button.style('background-color', 'lightblue'));
    button.mouseOut(() => button.style('background-color', '#F0F0F0'));
    // button.style('box-shadow', '3px 3px 8px rgba(0, 0, 0, 0.3)');
    m_allButtons.push(new Button(button, x, y, w, h));
    return button;
}  // createNormalButton()

//////////////////////////////////////////////////////////////////////////////////////
function createNormalButton2(name, x, y, w, h, color) {
  let button = createButton(name);
    button.style('width',  w+'px');
    button.style('height', h+'px');
    button.position(x, y);
    button.style('font-size', '16px');
    button.style('background-color', color);
    button.style('borderRadius', "8px");
    m_allButtons.push(new Button(button, x, y, w, h));
    return button;
}  // createNormalButton()

//////////////////////////////////////////////////////////////////////////////////////
function createCardsAndAddToDeck(setIdx, deckIdx, startIdx, len) {
  for (let i = startIdx; i < startIdx+len; i++) {
    let card = new Card(setIdx, i, deckIdx);
    card.facedown = true;
    m_decks[deckIdx].addCard(card);
  }
}

//////////////////////////////////////////////////////////////////////////////////////
function mousePressed() {
  console.log('mousePressed x = ' ,mouseX, ' y = ', mouseY);
  if (mouseY > 850*m_s) return;

  // Check for tokens
  m_selectedToken = -1;
  for (let i = 0; i < m_tokens.length; i++) {
    let token = m_tokens[i];
    // if (mouseX > token.x-token.size/2 && mouseX < token.x + token.size/2 && mouseY > token.y-token.size/2 && mouseY < token.y + token.size/2) {
    if (mouseX > token.x && mouseX < token.x + token.size && mouseY > token.y && mouseY < token.y + token.size) {
      m_selectedToken = i;
      console.log('m_selectedToken = ' , m_selectedToken);
    }
  }
  if (m_selectedToken != -1) return;

  // if we found a card, select it.  Otherwise unselect all cards.  You can 
  // have multiple cards selected.
  let card = findCardUnderCursor();
  if (card) {
    card.selected = !card.selected;
  } else {
    for (let player of m_players) {
      for (let card of player.cards) {
        card.selected = false;
      }
    }  
  }

  // If we found a card, just unselect all the cities and return
  if (card) {
    for (let city of m_cities) city.selected = false;
    update();
    return;
  }

  // Check for a city
  let foundCity = null;
  for (let city of m_cities) {
    if (mouseX > city.x*m_s && mouseX < city.x*m_s+city.w && mouseY > city.y*m_s-city.h && mouseY < city.y*m_s) {
      foundCity = city;
    }
  }
  // If I found a city turn off all other cities and toggle the state of this city
  // else turn off all cities.  You can only have 1 city selected.
  if (foundCity) {
    let citySelState = foundCity.selected;
    for (let city of m_cities) city.selected = false;
    foundCity.selected = !citySelState;
  } else {
    for (let city of m_cities) city.selected = false;
  }
  update();
}

function mouseDragged() {
  // console.log('mouseDragged');
  // If a die is selected
  if (m_selectedToken != -1) {
    m_tokens[m_selectedToken].x = mouseX;
    m_tokens[m_selectedToken].y = mouseY;
  }
}

function mouseReleased() {
  console.log('mouseReleased');

  if (m_selectedToken != -1) {
    // don't let tokens go off the board
    if (m_tokens[m_selectedToken].x > 0 && m_tokens[m_selectedToken].x < 1200*m_s && m_tokens[m_selectedToken].y > 800*m_s) {
      m_tokens[m_selectedToken].y = 800*m_s;
    }
    if (m_tokens[m_selectedToken].y > 0 && m_tokens[m_selectedToken].y < 800*m_s && m_tokens[m_selectedToken].x > 1100*m_s) {
      m_tokens[m_selectedToken].x = 1100*m_s;
    }
    m_selectedToken = -1;
    update();
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// returns the Card if one is found
function findCardUnderCursor() {

  let foundCard = null;
  let cw = m_decks[DECK_PLAYER].cw, ch = m_decks[DECK_PLAYER].ch;
  for (let player of m_players) {
    for (let card of player.cards) {
      if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
        foundCard = card;
      }
    }
  }
  cw = m_decks[DECK_PLAYER_DISCARD].cw, ch = m_decks[DECK_PLAYER_DISCARD].ch;
  for (let card of m_decks[DECK_PLAYER_DISCARD].cards) {
    if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
      foundCard = card;
    }
  }
  cw = m_decks[DECK_INFECTION_DISCARD].cw, ch = m_decks[DECK_INFECTION_DISCARD].ch;
  if (m_decks[DECK_INFECTION_DISCARD].isSpread) {
    for (let card of m_decks[DECK_INFECTION_DISCARD].cards) {
      if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
        foundCard = card;
      }
    }
  }
  cw = m_decks[DECK_GENERIC].cw, ch = m_decks[DECK_GENERIC].ch;
  if (m_decks[DECK_GENERIC].isSpread) {
    for (let card of m_decks[DECK_GENERIC].cards) {
      if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
        foundCard = card;
      }
    }
  }
  return foundCard;
}

//////////////////////////////////////////////////////////////////////////////////////
function checkCardHover() {
  let card = findCardUnderCursor();
  // only show faceup cards
  if (card ) {
    let deckIndex = card.deckIndex;
    // if (m_decks[deckIndex].isSpread || card.facedown == false) {
    let w = m_decks[deckIndex].cw;
    let h = m_decks[deckIndex].ch;
    let x = width/2 - 1.5*w;
    let y = height/2 - 1.5*h;
    if (deckIndex == DECK_CLASSES || deckIndex == DECK_PLAYER) {
      image(m_setImages[card.setIndex][card.index], x, y, w*3, h*3);
    } 
    // else {
    //   if (card.facedown) image(m_cardBackImages[card.backIndex], x, y, w*3, h*3);
    //   else               image(m_setImages[card.setIndex][card.index], x, y, w*3, h*3);
    // }
  }

}  // checkCardHover()

//////////////////////////////////////////////////////////////////////////////////////
function drawCard(playerNum) {
  if (playerNum >= m_players.length) return;
  let card = m_decks[DECK_PLAYER].dealCard();
  if (card) {
    // Un-new all other cards
    for (let player of m_players) for (let card of player.cards) card.isNew = false;
    card.isNew = true;
    m_players[playerNum].cards.push(card);
    update();
  }
}

////////////////////////////////////////////
// NETWORK FUNCTIONS
////////////////////////////////////////////

// called when user presses the Init button
function initPlayerToServer() {
  if (m_nameInputButton.value().length <= 0) {
    // m_messageP.style('color', '#000000');
    m_messageP.html("Enter a real name, buddy");
    return;
  }

  ///////////////////////////////////////
  // For solo play there should be 4 numbers indicating which classes to play
  let name = m_nameInputButton.value();
  if (name.startsWith('STANDALONE')) {
    m_standalone = true;
    const result = name.slice('STANDALONE'.length);
    console.log('result = ' , result);
    let classes = result.trim().split(/\s+/);
    console.log('classes = ' , classes);
    
    if (classes.length < 1 || classes.length > 4) {
      m_messageP.html("You have to enter between 1 and 4 integers after the string STANDALONE");
      return;
    }
    for (let i = 0; i < classes.length; i++) {
      m_players[i] = new Player(i, 'Solo', classes[i]);
    }
    m_thisPlayer = m_players[0];
    m_initialized = true;
    if (m_socket) m_socket.close();

    m_initButton.hide();
    m_nameInputButton.hide();
    m_classRadio.hide();

    return;
  }

  ///////////////////////////////////////
  // Regular internet play
  console.log("INITPLAYER");
  m_initialPlayer = new Player(-1, m_nameInputButton.value(), m_classRadio.value());
  // m_initialPlayer.dealer = true;
  m_initialPlayer.socketId = '/#' + m_socket.id; 
  m_thisPlayer = m_initialPlayer;
  
  m_socket.emit('start', m_initialPlayer);

}  // initPlayerToServer()

// emit all the players and the table to the server
function update(isSavedGame = false) {
  if (m_initialized && m_socket) {
    for (token of m_tokens) {
      token.unscaledX = token.x / m_s;
      token.unscaledY = token.y / m_s;
    }

    let msg = m_messageP.html();
    let data = {
      players: m_players,
      message: msg,
      decks: m_decks,
      cities: m_cities,
      tokens: m_tokens,
      difficulty: m_difficulty,
      diseaseCount: m_diseaseCount,
      // taskCards: m_taskCards,
      // distress: m_distress,
      // numSandLeft: m_numSandLeft,
    };
    if (!isSavedGame) m_socket.emit('update', data);
    else              saveJSON(data, 'pandemicSave.json', true)
  }
}

// called when we get a heartbeat from the server
// data: array of Player objects
function createPlayersFromServerData(data, isSavedGame) {
  console.log('player data = ' , data);
  
  let playersTemp = [];
  // for (p of data) {
  for (let play = 0; play < data.length; play++) {
    p = data[play];
    let player = new Player(p.seatPos, p.name);
    if (!isSavedGame) player.copyFromServerData(p, -1);
    else              player.copyFromServerData(p, play);
    playersTemp.push(player);
  }
  // sort the array by seatPos, so advancing and changing dealer (next hand) work properlu
  // javascript sort converts to strings first, so returning a.seatPos - b.seatPos correctly sorts numbers
  // playersTemp.sort((a, b) => {return a.seatPos > b.seatPos});
  playersTemp.sort((a, b) => {return a.seatPos - b.seatPos});
  m_players = playersTemp;

}  // createPlayersFromServerData()

// data: String
function setMessageFromServerData(data) {
  // m_messageP.style('background-color', 'FF0000');
  if (m_oldMessage != data) {
    m_oldMessage = data;
    m_colorNum++;
    if (m_colorNum >= m_messageColors.length) m_colorNum = 0;
  }
  m_messageP.style('color', m_messageColors[m_colorNum]);
  m_messageP.html(data);
}  //setMessageFromServerData()

// data: array of Deck objects
function createDecksFromServerData(data) {
  console.log('deck data = ' , data);
  // this line prevents us from overwriting our decks when we first come up and the server
  // doesn't have any decks yet.  This messes things up for the first person and subsequently everyone
  // has no decks.
  if (data.length == 0) return;

  let decksTemp = [];
  for (d of data) {
    let deck = new Deck();
    deck.copyFromServerData(d);
    decksTemp.push(deck);
  }
  m_decks = decksTemp;

}  // createDeckFromServerData()

// data: array of City objects
function createCitiesFromServerData(data) {
  if (data.length == 0) return;

  let citiesTemp = [];
  for (c of data) {
    let city = new City();
    city.copyFromServerData(c);
    citiesTemp.push(city);
  }
  m_cities = citiesTemp;
}

// data: array of TokenShip objects
function createTokensFromServerData(data) {
  // console.log('token data = ' , data);
  // this line prevents us from overwriting our tokens when we first come up and the server
  // doesn't have any decks yet.  This messes things up for the first person and subsequently everyone
  // has no decks.
  if (data.length == 0) return;

  let tokensTemp = [];
  for (st of data) {
    let token = new Token();
    token.copyFromServerData(st);
    tokensTemp.push(token);
  }
  m_tokens = tokensTemp;

}  // createTokensFromServerData()

function setGlobalsFromPlayerInfo() {
  m_thisPlayer = m_players.find(plr => plr.socketId === m_mySocketId);
  // // I really should not use m_taskDeck and m_playDeck, but only use the m_decks array
  // m_taskDeck = m_decks[DECK_TASK];
  // m_playDeck = m_decks[DECK_PLAY];
}

////////////////////////////////////////////
// DRAWING FUNCTIONS
////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
function draw() {
  // The m_socket doesn't get an actual ID until after we are out of setup();
  // Hopefully by the time we receive our first message from the socket, we
  // have executed the lie of code below
  // m_players[0].socketId = '/#' + m_socket.id;
  background(51);
  if (m_standalone == false) {
    if (m_socket) m_mySocketId = '/#' + m_socket.id;
    if (m_players.length > 0) setGlobalsFromPlayerInfo();
  }

  image(m_gameBoardImage, 0, 0, 1200*m_s, 850*m_s);

  // Draw player deck
  m_decks[DECK_PLAYER].show(715*m_s, 620*m_s, true);          // facedown

  // Draw infection deck
  m_decks[DECK_INFECTION].show(715*m_s, 45*m_s, true);          // facedown

  // Draw the discard decks last since they can be spread
  m_decks[DECK_PLAYER_DISCARD].show(875*m_s, 620*m_s, false); // faceup
  m_decks[DECK_INFECTION_DISCARD].show(910*m_s, 45*m_s, false); // faceup

  // Draw players
  for (let player of m_players) player.show();

  // Draw cities
  for (let city of m_cities) city.show();

  // Draw tokens
  for (let toke of m_tokens) toke.show();
  // image(m_tokenImages[0], width/2, height/2, 100, 100);

  // Draw the state of each disease
  for (let i = 0; i < m_diseaseStates.length; i++) {
    let x, y;
    if (m_diseaseStates[i] == DISEASE_CURED || m_diseaseStates[i] == DISEASE_ERADICATED) {
      stroke(255); fill(m_diseaseColors[i]);
      x = (394+i*54)*m_s;
      rect(x, 777*m_s, 30*m_s, 40*m_s);
    }
    if (m_diseaseStates[i] == DISEASE_ERADICATED) {
      stroke(255); fill(255);
      textSize(24*m_s);
      text('🚫', x, 805*m_s);
    }
  }

  // Draw the number if unplayed disease cubes for each disease
  for (let i = 0; i < m_diseaseCount.length; i++) {
    let x = (160 + i*40)*m_s;
    let y = 770*m_s;
    fill(m_diseaseColors2[i]); stroke(m_diseaseColors2[i]);
    rect(x, y, 30*m_s, 30*m_s);
    push();
    textAlign(CENTER, CENTER);
    stroke(0); fill(0);
    textSize(20*m_s);
    text(m_diseaseCount[i], x+15*m_s, y+15*m_s);
    pop();
  }

  // if there's anything in the generic deck, draw it
  if (m_decks[DECK_GENERIC].cards.length > 0) {
    m_decks[DECK_GENERIC].isSpread = true;
    m_decks[DECK_GENERIC].show(0*m_s, 0*m_s, false);
  } else {
    m_decks[DECK_GENERIC].isSpread = false;
  }

  // check for cursor over a card
  checkCardHover();

  if (m_debugSet != -1) debugDrawSet(m_debugSet);
  if (m_debugDeck != -1) debugDrawDeck(m_debugDeck);
}

//////////////////////////////////////////////////////////////////////////////////////
function windowResized() {
  // if (true) {
  // if (windowWidth >= 1600 && windowHeight>= 900) {
    let oldms = m_s;
    let newW, newH;
    let xScale = windowWidth/1600;
    let yScale = windowHeight/900;
    if (xScale <= yScale) {
      newW = windowWidth;
      newH = windowWidth*(900/1600);
      m_s = windowWidth/1600;
    } else {
      newH = windowHeight;
      newW = windowHeight*(1600/900);
      m_s = windowHeight/900;
    }

    // // we have to move tokens manually, because they have  x,y positions
    // // set by moving them, which is not based on 1600x900.  We have to remove the old
    // // scale factor and then apply the new scale factor
    for (let tok of m_tokens) {
      tok.x = tok.x / oldms * m_s;      
      tok.y = tok.y / oldms * m_s;      
    }

    // We have to change the deck's card width and card height.  The x and y are
    // calculated at draw time so they should be ok
    for (let deck of m_decks) {
      deck.cw = deck.cw / oldms * m_s;
      deck.ch = deck.ch / oldms * m_s;
    }


    for (let b of m_allButtons) {
      b.btn.size(b.w * m_s, b.h * m_s);
      b.btn.position(b.x * m_s, b.y * m_s);
    }

    // A few remaining variables
    m_tokenSize = m_tokenSize / oldms * m_s;
    m_cw = m_cw / oldms * m_s;
    m_ch = m_ch / oldms * m_s;
    m_bcw = m_bcw / oldms * m_s;
    m_bch = m_bch / oldms * m_s;

    resizeCanvas(newW, newH);
  // }
}

//////////////////////////////////////////////////////////////////////////////////////
// I need a separate class that stores all the original informaiton.  I tried using the
// button's stats (x, y, w, h) from button.size() and button.position(), but those are
// integers and I quickly lose precision as I resize the window
class Button {
  constructor(btn, x, y, w, h) {
    this.btn = btn;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// Setting m_debugSet to soemthing other than -1 causes this function to be called in draw();
function debugDrawSet(setIdx) {
  let xpos = 0;
  let ypos = -m_ch;
  for (let i = 0; i < m_setImages[setIdx].length; i++) {
    if (i % 10 == 0) {xpos = 0; ypos += m_ch}
    image(m_setImages[setIdx][i], xpos, ypos, m_cw, m_ch);
    xpos += m_cw;
  }
}

// Setting m_debugDeck to soemthing other than -1 causes this function to be called in draw();
function debugDrawDeck(deckIdx) {
  let xpos = 0;
  let ypos = -m_ch;
  let deck = m_decks[deckIdx];
  for (let i = 0; i < deck.cards.length; i++) {
    let card = deck.cards[i];
    let setIdx = card.setIndex;
    let idx = card.index;
    if (i % 10 == 0) {xpos = 0; ypos += m_ch}
    image(m_setImages[setIdx][idx], xpos, ypos, m_cw, m_ch);
    xpos += m_cw;
  }
}