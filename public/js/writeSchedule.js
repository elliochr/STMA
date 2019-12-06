window.addEventListener('load', () => {
    // add staff member to schedule list
    function addShift(){
        shift = document.getElementById('shiftBox');
        let sched = document.createElement('li');
        sched.setAttribute('class', 'list-group-item');
        sched.innerHTML = `<div class='row'><div class='col-md-4'><center>${this.lName}, ${this.fName}</center></div><div class='col-md-4'><div class="form-group"><label for="start-time">Start Time</label><input data-id='${this.id}' type='time' name='start-time'></div></div><div class='col-md-4'><div class="form-group"><label for="end-time">End Time</label><input data-id='${this.id}' type='time' name='end-time'></div></div>`;
        shift.appendChild(sched);
        let close = document.createElement('span');
        close.setAttribute('class', 'remSched');
        close.innerText = 'x';
        close.addEventListener('click', ()=>{
            shift.removeChild(sched);
            this.style.color = '#333';
            this.addEventListener('click', addShift);
        });
        sched.firstElementChild.firstElementChild.appendChild(close);
        this.style.color = 'gray';
        this.removeEventListener('click', addShift);
    }
    // create list of staff members
    function processList(staffList) {
        for (let i = 0; i < staffList.length; i++) {
            console.log(`i:${i}, lname:${staffList[i].lName}`);
            let staff = document.createElement('li');
            staff.setAttribute('class', 'list-group-item');
            staff.id = staffList[i].id;
            staff.fName = staffList[i].fName;
            staff.lName = staffList[i].lName;
            staff.position = staffList[i].position;
            staff.textContent = `${staff.lName}, ${staff.fName} - ${staff.position}`;
            staff.addEventListener('click', addShift);
            staffBox.appendChild(staff);
        }
    }
    // get staff members
    function getStaffList(){
        let req = new XMLHttpRequest();
        req.open('GET', `/getStaff`, true);
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 400) {
                console.log(`Success: ${req.statusText}`);
                console.log(req.responseText);
                staffBox = document.getElementById('staffBox');
                staffList = JSON.parse(req.responseText);
                processList(staffList);
            }
            else{
                console.log(`Oops!`);
            }
        });
        req.send();
    }
    getStaffList();

    
    function alert(message){
        let pickDate = document.getElementById('pickDate');
        let alert = document.getElementById('alert');
        if (alert != null) {
            pickDate.parentElement.removeChild(alert);
        }
        alert = document.createElement('span');
        alert.setAttribute('class', 'alert');
        alert.id = 'alert'
        alert.innerText = message;
        pickDate.parentElement.appendChild(alert);
    }

    function checkTimes(start, end){
        if(start.length == 0 || end.length == 0){
            return 0;
        }
        if(start > end){
            return 0;
        }
        return 1;
    }

    // save schedule
    document.getElementById('saveSchedBtn').addEventListener('click', ()=>{
        let pickDate = document.getElementById('pickDate');
        let schedList = document.getElementById('shiftBox').querySelectorAll('input[type="time"]');
        if (pickDate.value.length == 0) {
            alert('Please pick a date');
        }
        else if(schedList.length == 0){
            return;
        }
        else{
            console.log(`pickDate: ${pickDate.value.toString()}`);
            memberArr = [];
            j = 0;
            for(let i = 0; i < schedList.length; i++){
                let check = checkTimes(schedList[i].value, schedList[i + 1].value);
                if(check == 0){
                    alert(`Please assign valid times`);
                    return;
                }
                let id = schedList[i].getAttribute('data-id');
                let startTime = `${pickDate.value} 00:${schedList[i].value}`;
                let endTime = `${pickDate.value} 00:${schedList[i + 1].value}`;
                memberArr.push([id, startTime, endTime]);
                i++;
            }
            let schedule = JSON.stringify(memberArr);
            let fd = new FormData();
            fd.append('schedule', schedule);
            let req = new XMLHttpRequest();
            req.open('POST', '/writeSchedDate', true);
            req.addEventListener('load', function(){
                if(req.status >= 200 && req.status < 400){
                    console.log(`Success: ${req.statusText}`);
                    alert(`${pickDate.value} Saved`);
                }
                else{
                    console.log(`didn't save schedule`);
                }
            });
            req.send(fd);
        }
    });
});