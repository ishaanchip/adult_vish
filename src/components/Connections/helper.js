import axios from "axios";

export const superSecretPassword = "avishter🥕🥕"

//FUNCTIONALITY
export const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms)
})

//DUMMY DATA [TO DELETE]
export const SAMPLE_CONNECTION_2 = {
    groups: [
        "FIRST PART OF RESTURANTS WE’VE GONE TO",
        "RHYMES OF MY FAVORITE NAMES TO CALL YOU",
        "ITEMS ON OUR 'THINGS TO-DO' LIST",
        "MY FAVORITE ADJECTIVES TO DESCRIBE YOU",
    ],
    phrases: [
      // Restaurants we’ve gone to
      { phrase: "SWEET", group: "FIRST PART OF RESTURANTS WE’VE GONE TO"},
      { phrase: "CHEESE", group: "FIRST PART OF RESTURANTS WE’VE GONE TO"},
      { phrase: "MATCH", group: "FIRST PART OF RESTURANTS WE’VE GONE TO"},
      { phrase: "MC", group: "FIRST PART OF RESTURANTS WE’VE GONE TO"},

      // Rhymes with my favorite names to call you
      { phrase: "MERIT", group: "RHYMES OF MY FAVORITE NAMES TO CALL YOU"},
      { phrase: "CHUNKY", group: "RHYMES OF MY FAVORITE NAMES TO CALL YOU"},
      { phrase: "SHREESH", group: "RHYMES OF MY FAVORITE NAMES TO CALL YOU"},
      { phrase: "SWISH", group: "RHYMES OF MY FAVORITE NAMES TO CALL YOU"},

      // Things to do list
      { phrase: "GOLF", group: "ITEMS ON OUR 'THINGS TO-DO' LIST"},
      { phrase: "ROCKET", group: "ITEMS ON OUR 'THINGS TO-DO' LIST"},
      { phrase: "LEGO SET", group: "ITEMS ON OUR 'THINGS TO-DO' LIST"},
      { phrase: "NAP", group: "ITEMS ON OUR 'THINGS TO-DO' LIST"},

      // Adjectives to describe you
      { phrase: "STINKY", group: "MY FAVORITE ADJECTIVES TO DESCRIBE YOU"},
      { phrase: "GENUINE", group: "MY FAVORITE ADJECTIVES TO DESCRIBE YOU"},
      { phrase: "FUNKY", group: "MY FAVORITE ADJECTIVES TO DESCRIBE YOU"},
      { phrase: "BOSSY", group: "MY FAVORITE ADJECTIVES TO DESCRIBE YOU"},
    ],
  };



//FUNCTIONALITY

export const retrieveUnsortedConnection = async () =>{
    try{
      let localConnectionPieces = JSON.parse(localStorage.getItem("vish_connection_pieces")) || []
      if (localConnectionPieces.length === 0){
        await delay(300)
        return SAMPLE_CONNECTION_2
      }
      else{
        await delay(500)
      }
    }
    catch(err){
          console.log(`Frontend error getting  connection game info: ${err}`);
    }
  }

  //initial randomization of data
  export const randomizeConnectionSet =  (unsortedConnection) =>{

      //1. randomizer logic
      let sample = []
      let indexes = Array(unsortedConnection.phrases.length).fill(0).map((n, i) => i + n)
      while (indexes.length > 0){
        let selectedIndex = Math.floor(Math.random()*indexes.length)
        sample.push(
          {
            status:-1,
            content:unsortedConnection.phrases[indexes[selectedIndex]]
          }
        )
        indexes.splice(selectedIndex, 1)
      }
      return sample
  }



  //sorting data after successful connection
  export const sortCorrectGuess = (fullConnectionSet, correctCategory) =>{
    let newConnectionSet = []
    let copyArr = [...fullConnectionSet]
    for (let i = 0; i < copyArr.length; i++){
      if (correctCategory === copyArr[i].content.group){
        newConnectionSet.push(copyArr[i])
        copyArr.splice(i, 1)
        i = i - 1
      }
    }
    newConnectionSet = newConnectionSet.concat(copyArr)

    return newConnectionSet    
  }

  //removes user guess
  export const removeLife = (arr) =>{
    let newArr = [...arr].reverse()
    let firstOne = newArr.indexOf(1)
    if (firstOne != -1){
      newArr[firstOne] = 0
    }
    return newArr.reverse()
  }
