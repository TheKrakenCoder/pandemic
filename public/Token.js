class Token {
  constructor(x, y, color, imageIndex, letter, size) {
    this.x = x;  // upper left of square/triangle
    this.y = y;
    this.unscaledX = x;  // upper left of square/triangle
    this.unscaledY = y;
    this.color = color;
    this.imageIndex = imageIndex;
    this.letter = letter;
    this.size = size;
    this.selected = false;  // I'm not sure it means anything to have a token selected
  }

  show() {
    // If no image, just draw a circle with a letter i nit
    if (this.imageIndex == -1) {
      fill(this.color);  stroke(0); strokeWeight(1);
      circle(this.x, this.y, this.size*m_s);

      push();
      textAlign(CENTER, CENTER);
      let txtSz = 24*m_s;
      fill(0); stroke(0); textSize(txtSz);
      // text(this.letter, this.x-txtSz/3, this.y+txtSz/3)
      text(this.letter, this.x+this.size/2, this.y+this.size/2)
      pop();
    } else {
      image(m_tokenImages[this.imageIndex], this.x, this.y, this.size*m_s, this.size*m_s);
    }

    // if (this.selected) {
    //   noFill(); stroke(0, 255, 0); strokeWeight(3);
    //   circle(this.x, this.y, m_tokenSize);
    //   strokeWeight(1);
    // }
  }

  // We have to pass extra data into copyFromServerData() because we lose the positions
  // of our tokens when they are recalculated the first time we get server data and our seatPos is -1.
  // Passing the seatPos allows us to calculate the y properly (assuming it is incorrect)
  copyFromServerData(data, seatPos) {
    this.x = data.unscaledX*m_s;
    if (data.y >= 0) this.y = data.unscaledY*m_s;
    else             this.y = seatPos*(height/5) + m_tokenSize/2;
    this.unscaledX = data.unscaledX;  // unneeded after being used above
    this.unscaledY = data.unscaledY;
    this.color = data.color;
    this.imageIndex = data.imageIndex;
    this.letter = data.letter;
    this.size = data.size;
    this.selected = data.selected;
  }
}