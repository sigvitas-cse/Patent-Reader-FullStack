const myObject = {
  city: "Madrid",
  greet() {
    console.log(`Greetings from ${this.city}`);
  },
};

// myObject.greet();

const myObject1 = {
    city:"New York",
    greet(){
        console.log(`${this.city} is beautiful`);       
    }
}

myObject1.greet();