class Tutorial {

  constructor() {
    try {
      this.tutorial = localStorage.tutorial ? JSON.parse(localStorage.tutorial) : null;
    } catch (e) {
      console.error('Failed loading tutorial, progress will be reset');
      console.error(e);
      this.tutorial = null;
    }
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
