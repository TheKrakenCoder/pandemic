// Player should have a seatPosition, that never changes.  When a new Player
// comes on board, we (the server) pick the lowest unused seat position.
//         2
//     1       3
//         0
// When we draw the players, we always draw a player at the bottom of the screen
// in seat position 0.  So we draw based on a relative seat position.
class Player {
  constructor(idx, name, charClass=0) {
    // index will end up getting set by the server
    this.socketId = 0;       // string
    this.seatPos = idx;      // integer
    this.name = name;        // string
    this.class = charClass;  // integer - used as an index into different arrays
    this.cards = [];
    // this.cards.push(m_decks[DECK_CLASSES].cards[this.class]);
    this.cards[0] = m_decks[DECK_CLASSES].cards[this.class];
    
    
  }  // xtor

  show() {
    // // background
    let startx = 1200*m_s;
    let starty = this.seatPos*((900*m_s)/4);
    // fill(m_playerBackgroundColors[this.class]); noStroke();
    // rect(startx, starty, width-startx, height/5);

    // make sure the player has the right role card
    // this.cards[0] = m_decks[DECK_CLASSES].cards[this.class];
    this.cards.sort((a, b) => {return a.index - b.index});
    // this.cards[0].x = startx;
    // this.cards[0].y = starty;
    // this.cards[0].show();
    // Draw up to the first 4 cards
    let len = Math.min(this.cards.length, 4);
    for (let i = 0; i < len; i++) {
      this.cards[i].x = startx + i*m_cw;
      this.cards[i].y = starty;
      this.cards[i].show();
    }
    // the second row might need to accomodate more than 4 cards
    for (let i = 4; i < this.cards.length; i++) {
      let offset = Math.min(400*m_s / (this.cards.length-4), m_cw);
      this.cards[i].x = startx + (i-4)*offset;
      this.cards[i].y = starty + 50*m_s;
      this.cards[i].show();
    }

    // name
    fill(0); stroke(0); strokeWeight(1);
    let txtSz = 12*m_s;
    textSize(txtSz);
    text(this.name, startx, starty+txtSz);

  }


  // data: a Player object
  // playerNum: if -1 this is server data, otherwise this is a saved game restore
  copyFromServerData(data, playerNum = -1) {
    if (playerNum == -1) this.socketId = data.socketId;
    else                 this.socketId = m_players[playerNum].socketId;
    this.seatPos = data.seatPos;
    this.name = data.name;
    this.class = data.class;
    this.cards = [];

    if (data.cards) {
      for (let c of data.cards) {
        let card = new Card();
        card.copyFromServerData(c);
        this.cards.push(card);
      }
    } else {
      this.cards = [];
    }
  }  // copyFromServerData

}  // class Player