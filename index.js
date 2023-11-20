

//empty array for index
let inputs = [];
        
//define the input index for UI config as well as simon state and trigger simon state change
let inputsArrayUIConfigIndex = 0;
let inputsArraySimonStateIndex = 0;
let inputsArrayTriggerSimonStateChangeIndex = 0;

//initialize the level
//when user first enters simon state, that will be level 1
let level = 0;
//intialize the pattern array - will container integers 1-4
let pattern = [];

//intialize the amount of button presses that the user made. we will erase this after a successful level or at gameover.
let presses = [];

//initialize playerMode as false. when the player enters player mode, this turns true.
let playerMode = false;
let gameOver = false;


/* ^^^^^^^ Variables above ^^^^^^^ */




//play boop function
function playBoop(numberInput){
    switch (numberInput) {
        case 1:
            let greenBoop = new Audio("./assets/audio/greenBoop.mp3");
            greenBoop.play();
            break;

        case 2:
            let redBoop = new Audio("./assets/audio/redBoop.mp3");
            redBoop.play();
            break;

        case 3:
            let blueBoop = new Audio("./assets/audio/blueBoop.mp3");
            blueBoop.play();
            break;

        case 4:
            let yellowBoop = new Audio("./assets/audio/yellowBoop.mp3");
            yellowBoop.play();
            break;
    
        default:
            break;
    }
}

//play fail function
function playFail(){
    let failAudio = new Audio("./assets/audio/fail.mp3");
    failAudio.play();
}

//play click function
function playClick(){
    let click = new Audio("./assets/audio/click.mp3");
    click.play();
}

//play start function
function playStart(){
    let start = new Audio("./assets/audio/game start.mp3");
    start.play();
}


//generate random simon color. 1 is green, 2 is red, 3 is blue, 4 is yellow
function generateRandomSimonColor(){
    return Math.floor(1+4*Math.random());
}

//use this to convert a pattern number to text
function convertPatternElementtoColor(numberInput){
    let textOutput = "";
    switch (numberInput) {
        case 1:
            textOutput = "Green";
            break;

        case 2:
            textOutput = "Red";
            break;

        case 3:
            textOutput = "Blue";
            break;

        case 4:
            textOutput = "Yellow";
            break;
    
        default:
            break;
    }
    return textOutput;
}

//use this to check the pattern at each stage in console
function compilePatternToText(patternArray) {
    let textOutput = "";
    //loop through pattern array that we made and add it into a string
    for (let i = 0; i < patternArray.length; i++) {
        const element = patternArray[i];
        let divider = ", ";
        if(i==0) divider = "";
        textOutput = textOutput + divider + convertPatternElementtoColor(element);
    }
    return textOutput;
}

//use this to:
// 1. add to the presses array
// 2. check if you failed, succeeded but aren't done yet, or fully succeeded and ready to move to next level
function addToPressesAndReferencePatterns(pressNumber){
    presses.push(pressNumber);
    let containsError = false;
    for(let i = 0; i < presses.length; i++){
        if(presses[i]!=pattern[i]) containsError=true;
    }
    if(containsError){ //lose
        console.log("You pressed the wrong button, fail.");
        playerMode = false;
        inputs[inputsArrayUIConfigIndex].value = 4;
        $(".container").addClass("death");
        presses = [];
        gameOver=true;
        playFail();
    }else if(!containsError && presses.length==pattern.length){ //next level
        console.log("Next level!");
        playerMode = false;
        inputs[inputsArrayUIConfigIndex].value = 2;
        presses = [];
        playBoop(pressNumber);
    }else{
        console.log("You pressed the right one. Keep going.");
        playBoop(pressNumber);
    } //continue
    
}


/* ^^^^^^^ Universal functions above ^^^^^^^ */





const r = new rive.Rive({
    src: "./assets/riv/simon.riv",
    // Or the path to a public Rive asset
    // src: '/public/example.riv',
    canvas: document.getElementById("canvas"),
    autoplay: true,
    stateMachines: "Game",
    onLoad: () => {

        //resize on load
        r.resizeDrawingSurfaceToCanvas();

        // Get the inputs via the name of the state machine
        inputs = r.stateMachineInputs('Game');
        for (let i = 0; i < inputs.length; i++) {
            const element = inputs[i];
            if(element.name==="Simon State"){
                inputsArraySimonStateIndex = i;
            }else if(element.name==="UI Config"){
                inputsArrayUIConfigIndex = i;
            }else if(element.name==="Trigger Simon State Change"){
                inputsArrayUIConfigIndex = i;
            }
        }
        //print UI config and simon state index to be sure
        console.log("The inputs index of simon state is " + inputsArraySimonStateIndex + ", let's check: The name you get when you call it is " + inputs[inputsArraySimonStateIndex].name);
        console.log("The inputs index of UI config is " + inputsArrayUIConfigIndex + ", let's check: The name you get when you call it is " + inputs[inputsArrayUIConfigIndex].name);
        console.log("The inputs index of Trigger Simon State Change is " + inputsArrayTriggerSimonStateChangeIndex + ", let's check: The name you get when you call it is " + inputs[inputsArrayTriggerSimonStateChangeIndex].name);
    },
    onStateChange: (event) => {

        const eventData = event.data;

        if(eventData[0]=="Arrow" && level ==0){
            console.log("Simon State Entered for the first time - game started");
        }else if(eventData[0]=="Arrow"){
            console.log("Simon State Entered");
        }else if(eventData[0]=="GO"){
            console.log("Player State Entered");
        }
        
        //play starting sound
        if(eventData[0]=="Play > Arrow"){
            playStart();
        }

        if(eventData.includes("Play Button Press")) playClick();

        //if we're in the Simon State, do three things.
        //first increment levels and add a new thing to the pattern.
        //then playback the accumulated pattern with delays
        //afterwards trigger a transition to the player state.
        if(eventData[0]=="Arrow"){
            //increment pattern and level
            level++;
            pattern.push(generateRandomSimonColor());
            console.log("Currently on level " + level + ". Pattern so far is " + compilePatternToText(pattern));

            //now set a timeout, and then increment the states in the pattern
            setTimeout(() => {
                let i = 0;
                let loop = setInterval(() => {
                    //execute based on the simon state element
                    console.log("Executing " + convertPatternElementtoColor(pattern[i]));
                    //trigger simon state change if the new value is the same as pattern[i]
                    if(inputs[inputsArraySimonStateIndex].value == pattern[i]){
                        inputs[inputsArrayTriggerSimonStateChangeIndex].fire();
                        playBoop(pattern[i]);    
                    }else{
                        inputs[inputsArraySimonStateIndex].value = pattern[i];
                        playBoop(pattern[i]);    
                    }
                    i++;

                    //check to abort the loop
                    if(i>=pattern.length){
                        clearInterval(loop);
                        setTimeout(() => {
                            //reset arrow
                            inputs[inputsArraySimonStateIndex].value = 0;
                            //swtich to player state
                            setTimeout(() => {
                                inputs[inputsArrayUIConfigIndex].value=3;
                            }, 750);
                        }, 750);
                        
                    }
                }, 750);
            }, 100);
        }

        //if go state is on, we turn playerMode to be true, so that we will collect the presses
        if(eventData[0]=="GO"){
            playerMode=true;
            console.log("Playermode on. Presses are recorded now.")
        }

        //while playermode is on, we listen for: Go Red, Go Yellow, Go Blue, Go Green.
        //every time the user triggers this state change, we add the corresponding number to presses
        //if one the user added does not match the pattern, it's game over
        //if presses length and pattern length are equal then we clear the presses array and trigger simon state.
        if(playerMode){
            if(eventData.includes("Go Red")){
                console.log("Red Pressed");
                addToPressesAndReferencePatterns(2);
            }else if(eventData.includes("Go Green")){
                console.log("Green Pressed");
                addToPressesAndReferencePatterns(1);
            }else if(eventData.includes("Go Yellow")){
                console.log("Yellow Pressed");
                addToPressesAndReferencePatterns(4);
            }else if(eventData.includes("Go Blue")){
                console.log("Blue Pressed");
                addToPressesAndReferencePatterns(3);
            }
        }

    }
});


$(document).keypress(function(e){
    if(e.key==="r" && gameOver){
        console.log("Restart!");
        playerMode = false;
        inputs[inputsArrayUIConfigIndex].value = 1;
        $(".container").removeClass("death");
        pattern = [];
        level = 0;
        presses = [];
    }
});