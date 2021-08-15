function adjustbody(){
    document.body.style.width = window.innerWidth * 0.9 + 'px'
    document.body.style.height = window.innerHeight * 0.9 + 'px'
    var borderWidth = (document.body.offsetHeight - document.body.clientHeight)/2
    document.getElementById("buffer").innerText = '_'
    document.getElementById("mainframe").style.height=(
       document.body.clientHeight -
        document.getElementById("topbar").offsetHeight -
        document.getElementById("bottombar").offsetHeight - 2 * borderWidth + 'px' 
        )
}

var host = "https://phsnomy.github.io"
var current
var displayingfile = 0
var cancount = 1;

window.addEventListener("keydown",(event)=>{
    if (event.key.length == 1){
        document.getElementById("buffer").innerText = event.key
    setTimeout(()=>{
        document.getElementById("buffer").innerText = '_'
    },100)}
    if (event.key == 'h') left()
    else if (event.key == "j") down()
    else if (event.key == "k") up()
    else if (event.key == "l") right()
})

window.onload = () => {
    adjustbody()
    document.getElementById("host").innerText=host
    document.getElementById("ping").style.color = "yellow"
    document.getElementById("ping").innerText="Testing..."
    document.getElementById("status").innerText = "正在等待響應..."
    var request = new XMLHttpRequest()
    request.addEventListener("loadend",()=>{
        if(request.status==200){
            document.getElementById("ping").style.color = "lawngreen"
            document.getElementById("ping").innerText="Online"
            var dir = JSON.parse(request.responseText)
            current = dir
            updatedir()
            highlightcount()
            document.getElementById("status").innerText = "就緒."
        }
        else{
            document.getElementById("ping").style.color = "red"
            document.getElementById("ping").innerText="Offline"
        }
    })
    request.open("GET",host+"/public/dirinfo.json")
    request.send()
    var request1 = new XMLHttpRequest()
    request1.addEventListener("loadend",()=>{
        if(request1.status==200){
            document.getElementById("content").innerText = request1.responseText
        }
    })
    request1.open("GET",host+"/public/index")
    request1.send()
}

function updatedir(){
    var count = 0
    var navhtml = "";
    navhtml = navhtml + `<parbar id=nav${count}>< ${current.pardir[0]}[d]</parbar>`;
    count ++;
    navhtml = navhtml + `<selfbar id=nav${count}>${current.name[0]}[d]</selfbar>`;
    count ++;
    current.subdir.forEach(element => {
        navhtml = navhtml + `<subbar id=nav${count}>${element[0]}[d] ></subbar>`;
        count ++
    })
    current.files.forEach(element => {
        navhtml = navhtml + `<subbar id=nav${count}>${element[0]}[-] ></subbar>`;
        count ++
    })
    document.getElementById("outline").innerHTML=navhtml
}

function up(){
    if (cancount-- < 2){cancount=current.subdir.length+current.files.length+1}
    highlightcount()
}
function down(){
    if (cancount++ > current.subdir.length+current.files.length){cancount=1}
    highlightcount()
}
function left(){
    if (displayingfile==0) {changedir(current.pardir[1])}
    else {changedir(current.name[1])}
}
function right(){
    if (cancount == 1){}
    else if (cancount > current.subdir.length+1){
        displayfile()
    }
    else{
        changedir(current.subdir[cancount-2][1])
    }
}

function changedir(str){
    document.getElementById("status").innerText = "正在等待響應..."
    cancount = 1
    displayingfile = 0
    var request = new XMLHttpRequest()
    request.addEventListener("loadend",()=>{
        if(request.status==200){
            var dir = JSON.parse(request.responseText)
            current = dir
            updatedir()
            highlightcount()
        }
    })
    request.open("GET",host+"/"+str+"/dirinfo.json")
    request.send()
    var request1 = new XMLHttpRequest()
    request1.addEventListener("loadend",()=>{
        if(request1.status==200){
            document.getElementById("content").innerText = request1.responseText
            document.getElementById("status").innerText = "就緒."
        }
    })
    request1.open("GET",host+"/"+str+"/index")
    request1.send()
}

function highlightcount(){
    for (var loop = 0;
        loop != current.subdir.length+current.files.length+2; loop++){
            if (loop == cancount){
                document.getElementById(`nav${cancount}`).style.color="black"
                document.getElementById(`nav${cancount}`).style.backgroundColor="white"
            }
            else{
                document.getElementById(`nav${loop}`).style.color="white"
                document.getElementById(`nav${loop}`).style.backgroundColor="black"
            }
        }
}

function displayfile(){
    document.getElementById("status").innerText = "正在等待響應..."
    var str = current.files[cancount-2-current.subdir.length][1]
    var request1 = new XMLHttpRequest()
    request1.addEventListener("loadend",()=>{
        if(request1.status==200){
            document.getElementById("content").innerText = request1.responseText
            document.getElementById("status").innerText = "就緒."
        }
    })
    request1.open("GET",host+"/"+str)
    request1.send()
    displayingfile = 1
}
// 邏輯:
// changedir(dir) -> 變更路徑
// displayfile() -> 顯示文件
