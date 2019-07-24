class Tutorial {

  constructor() {
    this.tutorial = localStorage.tutorial ? JSON.parse(localStorage.tutorial) : null;
    //tutorial system
    if (!this.tutorial) {
      this.tutorial = [];
      localStorage.setItem("tutorial", JSON.stringify(this.tutorial));
    }


  }

  isFinished(entry) {
    return this.tutorial.includes(entry);

  }

  clear() {
    localStorage.removeItem('tutorial');
    this.constructor();

  }

  removeFinished(entry) {
    let index = this.tutorial.indexOf(entry);
    if (index === -1)
      return false;
    this.tutorial.splice(index, 1);
    return true;
  }

  addFinished(entry) {
    this.tutorial.push(entry);
    localStorage.setItem("tutorial", JSON.stringify(this.tutorial));
  }
}

const tutorial = new Tutorial();
export default tutorial;
