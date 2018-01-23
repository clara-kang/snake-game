window.addEventListener("keypress", function(event) {
  if (event.keyCode == 32) {
    console.log("start");
    game();
    console.log("out??");
  }
});


// Listen for the event.
window.addEventListener('over', function (event){
    console.log("game over");
});
