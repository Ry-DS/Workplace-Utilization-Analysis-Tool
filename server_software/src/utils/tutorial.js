//a class to easily make new tutorials to show to the user.
class Tutorial {

  constructor() {
    try {
      this.tutorial = localStorage.tutorial ? JSON.parse(localStorage.tutorial) : null;//try load tutorials
    } catch (e) {//failed? Rare but, no tutorials :(
      console.error('Failed loading tutorial, progress will be reset');
      console.error(e);
      this.tutorial = null;
    }
    //tutorial system
    if (!this.tutorial) {
      this.tutorial = [];//if nothing existed already, make a new one.
      localStorage.setItem("tutorial", JSON.stringify(this.tutorial));
    }


  }

  isFinished(entry) {//is tutorial complete
    return this.tutorial.includes(entry);

  }

  clear() {//clear tutorial progress
    localStorage.removeItem('tutorial');
    this.constructor();

  }

  removeFinished(entry) {//removed completed tutorial
    let index = this.tutorial.indexOf(entry);
    if (index === -1)
      return false;
    this.tutorial.splice(index, 1);
    return true;
  }

  addFinished(entry) {//save finished tutorial
    this.tutorial.push(entry);
    localStorage.setItem("tutorial", JSON.stringify(this.tutorial));
  }
}

const tutorial = new Tutorial();//tutorial global object, we export this.
export default tutorial;
