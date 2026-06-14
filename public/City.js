class City {
  constructor(name, x, y, pos) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = 100;
    this.h = 15;
    this.diseases = [0, 0, 0, 0];
    // this.yellow = 0;
    // this.red = 0;
    // this.blue = 0;
    // this.black = 0;
    this.pos = pos;  // where are disease cubes drwn relative to x,y
    this.selected = false;
  }

  show() {
    // console.log('city.show pos=' + this.x + ' ' + this.y);   
    // Draw the city name and a rectangle underneath it
    this.h = 15*m_s;
    textSize(this.h);
    this.w = textWidth(this.name);

    // if we are going to draw any disease counts, make sure the rectangle is wide enough
    let totalCount = 0;
    for (let cnt of this.diseases) totalCount += cnt;
    if (totalCount > 0 && this.w < 16*4*m_s) this.w = 16*4*m_s;

    let sum = this.diseases[0]+this.diseases[1]+this.diseases[2]+this.diseases[3];
    let hite = this.h;
    if (sum > 0) hite *= 2;
    
    if (this.selected) {stroke(0, 255, 0); fill(0, 255, 0);}
    else               {stroke(255); fill(255);}
    rect(this.x*m_s, (this.y+3)*m_s-this.h, this.w, hite); //this.h);
    stroke(0); fill(0);
    text(this.name, this.x*m_s, this.y*m_s);

    // Draw the number of each disease, if greater than 0
    // let y = (this.y + this.h*1)*m_s;
    let y = (this.y+5)*m_s;
    let x = this.x*m_s;
    // let xyel = this.x*m_s + 0.00*this.h;
    // let xred = this.x*m_s + 0.75*this.h;
    // let xblu = this.x*m_s + 1.50*this.h;
    // let xblk = this.x*m_s + 2.25*this.h;

    let txtSz=16;
    for (let i = 0; i < this.diseases.length; i++) {
      if (this.diseases[i] == 0)  continue;

      let newx = x + i*txtSz;
      fill(m_diseaseColors2[i]); stroke(m_diseaseColors2[i]);
      rect(newx, y, txtSz*m_s, txtSz*m_s);
      push();
      textAlign(CENTER, CENTER);
      stroke(0); fill(0);
      textSize(txtSz*m_s);
      text(this.diseases[i], newx+txtSz/2*m_s, y+txtSz/2*m_s);
      pop();

    }

    // if (this.diseases[0] > 0) {
    //   stroke(0); fill(255, 255, 0); 
    //   text(this.diseases[0], xyel, y)
    // }
    // if (this.diseases[1] > 0) {
    //   stroke(255, 0, 0); fill(255, 0, 0); 
    //   text(this.diseases[1], xred, y)
    // }
    // if (this.diseases[2] > 0) {
    //   stroke(0, 0, 255); fill(30, 144, 255); 
    //   text(this.diseases[2], xblu, y)
    // }
    // if (this.diseases[3] > 0) {
    //   stroke(0, 0, 0); fill(0, 0, 0); 
    //   text(this.diseases[3], xblk, y)
    // }
  }

    // data: a City object
  copyFromServerData(data) {
    this.name = data.name;
    this.x = data.x;
    this.y = data.y;
    this.pos = data.pos
    this.diseases[0] = data.diseases[0];
    this.diseases[1] = data.diseases[1];
    this.diseases[2] = data.diseases[2];
    this.diseases[3] = data.diseases[3];
    this.selected = data.selected;
 }  // copyFromServerData
}

function createCities() {
  let city = new City('London', 488, 195, POS_BELOW); m_cities.push(city);
  city = new City('Montreal', 262, 243, POS_BELOW); m_cities.push(city);
  city = new City('St. Petersburg', 624, 171, POS_BELOW); m_cities.push(city);
  city = new City('Chicago', 187, 245, POS_BELOW); m_cities.push(city);
  city = new City('Essen', 574, 185, POS_BELOW); m_cities.push(city);
  city = new City('Atlanta', 209, 343, POS_ABOVE); m_cities.push(city);
  city = new City('Madrid', 447, 313, POS_RIGHT); m_cities.push(city);
  city = new City('Washington', 343, 318, POS_LEFT); m_cities.push(city);
  city = new City('Paris', 526, 262, POS_RIGHT); m_cities.push(city);
  city = new City('San Francisco', 73, 271, POS_BELOW); m_cities.push(city);
  city = new City('Milan', 634, 232, POS_LEFT); m_cities.push(city);
  city = new City('New York', 349, 253, POS_BELOW); m_cities.push(city);

  city = new City('Osaka', 1107, 376, POS_ABOVE); m_cities.push(city);
  // city.diseases[0] = 1;
  city = new City('Beijing', 911, 263, POS_RIGHT); m_cities.push(city);
  // city.diseases[0] = 3; city.diseases[1] = 2;
  city = new City('Manila', 1068, 504, POS_ABOVE); m_cities.push(city);
  city = new City('Hong Kong', 979, 368, POS_BELOW); m_cities.push(city);
  city = new City('Seoul', 1049, 247, POS_LEFT); m_cities.push(city);
  city = new City('Shanghai', 911, 311, POS_RIGHT); m_cities.push(city);
  city = new City('Sydney', 1099, 675, POS_ABOVE); m_cities.push(city);
  city = new City('Toyko', 1110, 280, POS_LEFT); m_cities.push(city);
  city = new City('Taipei', 1050, 398, POS_ABOVE); m_cities.push(city);
  city = new City('Ho Chi Minh', 981, 514, POS_ABOVE); m_cities.push(city);
  city = new City('Jakarta', 905, 567, POS_ABOVE); m_cities.push(city);
  city = new City('Bangkok', 903, 406, POS_BELOW); m_cities.push(city);

  city = new City('Kolkata', 895, 341, POS_BELOW); m_cities.push(city);
  city = new City('Delhi', 847, 317, POS_BELOW); m_cities.push(city);
  city = new City('Algiers', 531, 345, POS_RIGHT); m_cities.push(city);
  // city.diseases[0] = 3; city.diseases[1] = 2; city.diseases[2] = 2; city.diseases[3] = 1;
  city = new City('Istanbul', 601, 293, POS_RIGHT); m_cities.push(city);
  city = new City('Moscow', 729, 226, POS_BELOW); m_cities.push(city);
  city = new City('Baghdad', 699, 314, POS_BELOW); m_cities.push(city);
  city = new City('Karachi', 780, 339, POS_BELOW); m_cities.push(city);
  city = new City('Chennai', 836, 491, POS_ABOVE); m_cities.push(city);
  city = new City('Mumbai', 789, 447, POS_ABOVE); m_cities.push(city);
  city = new City('Riyadh', 714, 432, POS_ABOVE); m_cities.push(city);
  city = new City('Cairo', 618, 386, POS_RIGHT); m_cities.push(city);
  city = new City('Tehran', 793, 267, POS_BELOW); m_cities.push(city);

  city = new City('Los Angeles', 97, 404, POS_ABOVE); m_cities.push(city);
  city = new City('Mexico City', 159, 430, POS_ABOVE); m_cities.push(city);
  city = new City('Sao Paulo', 408, 599, POS_ABOVE); m_cities.push(city);
  city = new City('Khartoum', 677, 466, POS_ABOVE); m_cities.push(city);
  city = new City('Kinshasa', 559, 536, POS_ABOVE); m_cities.push(city);
  city = new City('Buenos Aires', 354, 663, POS_ABOVE); m_cities.push(city);
  city = new City('Lagos', 543, 439, POS_ABOVE); m_cities.push(city);
  city = new City('Bogota', 301, 479, POS_ABOVE); m_cities.push(city);
  city = new City('Miami', 312, 398, POS_ABOVE); m_cities.push(city);
  city = new City('Santiago', 218, 679, POS_ABOVE); m_cities.push(city);
  city = new City('Lima', 222, 587, POS_ABOVE); m_cities.push(city);
  city = new City('Johannesburg', 617, 634, POS_ABOVE); m_cities.push(city);

}