function adjustbody(){
    document.body.style.width = window.innerWidth * 0.9 + 'px'
    document.body.style.height = window.innerHeight * 0.9 + 'px'
    document.getElementById("ANSA").style.fontSize = window.innerHeight*0.04+'px'
    document.getElementById("bottombar").style.height =
        document.getElementById("topbar").offsetHeight + 'px'
    var borderWidth = (document.body.offsetHeight - document.body.clientHeight)/2
    document.getElementById("buffer").innerText = '_'
    document.getElementById("mainframe").style.height=(
       document.body.clientHeight -
        document.getElementById("topbar").offsetHeight -
        document.getElementById("bottombar").offsetHeight - 2 * borderWidth + 'px' 
        )
    document.getElementById("content").style.height = document.getElementById("mainframe").clientHeight - document.getElementById("topbar").offsetHeight + 'px'
    document.getElementById("outline").style.height = document.getElementById("mainframe").clientHeight - document.getElementById("topbar").offsetHeight + 'px'
    document.getElementById("content").style.width = document.getElementById("content").offsetWidth + 'px'
}

var host = 'http://127.0.0.1:5500' // 
//var host = "https://phsnomy.github.io" //
//var host = "http://10.20.193.16:5500" //
var current
var displayingfile = 0
var cancount = 1;
var showkeys = 0;

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
    getcontent(host+"/public/index" ,"content")
    var ANSon = 0;
    document.getElementById("ANS").onclick = () => {
        if (ANSon == 1) {
            document.getElementById("ANSA").style.display = "none"
            ANSon = 0;
        } else {
            document.getElementById("ANSA").style.display = "block"
            ANSon = 1;
        }
    }
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
}

function updatedir(){
    var count = 0
    var navhtml = "";
    navhtml = navhtml + `<parbar id=nav${count} class="nav">< ${current.pardir[0]}[d]</parbar>`;
    count ++;
    navhtml = navhtml + `<selfbar id=nav${count} class="nav">- ${current.name[0]}[d] -</selfbar>`;
    count ++;
    current.subdir.forEach(element => {
        navhtml = navhtml + `<subbar id=nav${count} class="nav">${element[0]}[d] ></subbar>`;
        count ++
    })
    current.files.forEach(element => {
        navhtml = navhtml + `<subbar id=nav${count} class="nav">${element[0]}[-] ></subbar>`;
        count ++
    })
    document.getElementById("outline").innerHTML=navhtml
    focusnavforce()
}

function up(){
    if (displayingfile==1){
        scrollupfile()
    }
    else if (cancount-- < 2){
        cancount=current.subdir.length+current.files.length+1
    }
    adjustoutline()
    highlightcount()
}
function down(){
    if (displayingfile==1){
        scrolldownfile()
    }
    else if (cancount++ > current.subdir.length+current.files.length){
        cancount=1
    }
    adjustoutline()
    highlightcount()
}
function left(){
    if (displayingfile==0) {changedir(current.pardir[1])}
    else {
        displayingfile=0
        changefocus()
        displayindex()
    }
}

function right(){
    if (cancount == 1){}
    else if (cancount > current.subdir.length+1){
        if(displayingfile==0) displayfile()
    }
    else{
        changedir(current.subdir[cancount-2][1])
    }
}

function checkmacro(){
    var str = document.getElementById("content").innerHTML
    str = str.replaceAll("MACRO-C-START","<c>")
    str = str.replaceAll("MACRO-C-END","</c>")
    str = str.replaceAll(" ","&nbsp;")
    str = str.replaceAll("\n","<br>")
    document.getElementById("content").innerHTML = str
}

function changedir(str){
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
    getcontent(host+"/"+str+"/index","content")
}

function getcontent(path, component){
    var request1 = new XMLHttpRequest()
    document.getElementById("status").innerHTML = '正在等待響應...'
    document.getElementById("status").style.color = 'yellow'
    document.getElementById("size").innerHTML = '----'
    request1.addEventListener("loadend",()=>{
        if(request1.status==200){
            var text = request1.responseText
            document.getElementById(component).innerHTML = text
            checkmacro()
            var btext = new Blob([text])
            document.getElementById("status").innerHTML = '[200]就绪.'
            document.getElementById("status").style.color = 'lawngreen'
            document.getElementById("size").innerHTML = ((btext.size/1024)+"").slice(0,4)
        } else{
            document.getElementById("status").innerHTML = 
                `<span style="color: red">[${request1.status}]错误.</span>`
            document.getElementById(component).innerText = 
                `很不幸, 錯誤時有發生. 這一問題有可能出現在遠端或終端.\n雖然實際上的責任全在與作者沒有實現基本的錯誤處理.\n請鍵入[h]返回N.S.\n\n+- End -+\nPhsnomy.\n概驗式.`
        }
    })
    request1.open("GET",path)
    request1.send()
}

function displayindex(){
    getcontent(host+"/"+current.name[1]+"/index","content")
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
    var str = current.files[cancount-2-current.subdir.length][1]
    getcontent(host+"/"+str,"content")
    changefocus()
    displayingfile = 1
}

function changefocus(){
    var nav = document.getElementById("nav-ind").style
    var con = document.getElementById("con-ind").style
    if (nav.color == "black"){
        nav.color = "white"; con.color = "black"
        nav.backgroundColor = "black"; con.backgroundColor = "white"
    }
    else if(con.color == "black"){
        con.color = "white"; nav.color = "black"
        con.backgroundColor = "black"; nav.backgroundColor = "white"
    }
    else {
        nav.color = "black"
        nav.backgroundColor = "white"
    }
}

function focusnavforce(){
    var nav = document.getElementById("nav-ind").style
    nav.color = "black"
    nav.backgroundColor = "white"
}

function scrolldownfile(){
    document.getElementById("content").scrollTop = document.getElementById("content").scrollTop + document.getElementById("nav0").offsetHeight
}
function scrollupfile(){
    document.getElementById("content").scrollTop = document.getElementById("content").scrollTop - document.getElementById("nav0").offsetHeight
}

function adjustoutline(){
    var canheight = 0
    for(var i = 0; i<cancount; i++){
        canheight += document.getElementById(`nav${i}`).getBoundingClientRect().height
    }
    if(canheight < document.getElementById("outline").scrollTop + document.getElementById(`nav${cancount}`).getBoundingClientRect().height){
        document.getElementById("outline").scrollTop = canheight - document.getElementById(`nav${cancount}`).getBoundingClientRect().height
    }
    if(canheight > document.getElementById("outline").scrollTop + document.getElementById("outline").offsetHeight-document.getElementById(`nav${cancount}`).offsetHeight){
        document.getElementById("outline").scrollTop = canheight - document.getElementById("outline").offsetHeight + document.getElementById(`nav${cancount}`).getBoundingClientRect().height
    }
}

// 邏輯:
// changedir(dir) -> 變更路徑
// displayfile() -> 顯示文件
