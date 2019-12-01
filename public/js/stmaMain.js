window.addEventListener('load', ()=>{
    c = ':';
    function displayTime(){
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        if(minutes <= 9){
            minutes = `0${minutes}`;
        }
        ampm = ' am';
        if(hours > 12){
            hours -= 12;
            ampm = ' pm';
        }
         if(c == ':'){
            c = ' ';
        }
        else{
            c = ':';
        }
        document.getElementById('clock').innerHTML = `${hours}${c}${minutes}${ampm}`;
        setTimeout(displayTime, 500);
    }
    displayTime();
});