var host = "http://127.0.0.1:5500"
var displayingFile = 0
var candidateCount = 0
var info
var current

function adjustBody() {
    document.getElementById("subdir-list").style.height = document.getElementById("navigation").offsetHeight - document.getElementById("up").offsetHeight - document.getElementById("down").offsetHeight + 'px'
}

window.onload = () => {
    adjustBody()
    get(host+"/public/info.json", (text)=>{
        info = JSON.parse(text)
        current = info
        refresh()
    })
}

window.addEventListener("keydown", (event)=>{
    if (event.key == 'h') left()
    else if (event.key == "j") down()
    else if (event.key == "k") up()
    else if (event.key == "l") right()
})

function refresh(){
    var count = 0
    var navhtml = ""
    document.getElementById("nav-title").innerHTML = current.selfname
    current.subdirs.forEach(element => {
        navhtml = navhtml + `<div id=op${count} style="text-align: center">${element.selfname}[d]</div>`
        count ++
    })
    current.files.forEach(element => {
        navhtml = navhtml + `<div id=op${count} style="text-align: center">${element}[-]</div>`
        count ++
    })
    document.getElementById("subdir-list").innerHTML = navhtml
    get(host+'/'+current.selfpath+'index', (text)=>{
        document.getElementById('mainframe').innerHTML = text
    })
    document.getElementById("nav-par").innerText = findParent(info, current).selfname
    adjustBody()
    document.getElementById("time").innerText = info.date
    highlightcount()
}

function get(path, func){
    var request = new XMLHttpRequest()
    document.getElementById("statuscode").innerHTML = '---'
    document.getElementById("statuscode").style.color = 'yellow'
    document.getElementById("size").innerHTML = '----'
    document.getElementById("loaded").innerHTML = 'loading'
    document.getElementById("loaded").style.color = 'yellow'
    var result
    request.addEventListener("loadend",()=>{
        if(request.status==200){
            var text = request.responseText
            var btext = new Blob([text])
            document.getElementById("statuscode").innerHTML = '200'
            document.getElementById("statuscode").style.color = 'lawngreen'
            document.getElementById("size").innerHTML = ((btext.size/1024)+"").slice(0,4)
            func(text)
            renderMathInElement(document.body)
            document.getElementById("loaded").innerHTML = 'loaded'
            document.getElementById("loaded").style.color = 'lawngreen'
        } else{
            document.getElementById("statuscode").innerHTML = request.status
            document.getElementById("mainframe").innerHTML = 
            `<h1>错误: ${request.status}</h1><hr>似乎有错误发生. 绝对不是什么稀奇的事情.`
        }
    })
    request.open("GET",path)
    request.send()
}

function up(){
    if (displayingFile == 1){ scrollUpFile() }
    else if (candidateCount-- < 1)
        {candidateCount = current.subdirs.length+current.files.length - 1}
    highlightcount()
    adjustNav()
}

function down(){
    if (displayingFile == 1){ scrollDownFile() }
    else if (candidateCount++ > current.subdirs.length + current.files.length - 2)
        {candidateCount = 0}
    highlightcount()
    adjustNav()
}
function left(){
    if (displayingFile==0){
        current = findParent(info, current)
        candidateCount = 0
        refresh()
    }
    else { refresh(); displayingFile = 0; focusNav() }
}
function right(){
    if (candidateCount >= current.subdirs.length){
        get(host+'/'+current.selfpath+current.files[candidateCount-current.subdirs.length], (text)=>{
            document.getElementById('mainframe').innerHTML = text
        })
        displayingFile = 1
        focusMF()
    } else {
        current = current.subdirs[candidateCount]
        candidateCount = 0
        refresh()
    }
}

function findParent(parent ,current){
    if(current == parent) return info
    else if(parent.subdirs != undefined){
        for(let element of parent.subdirs){
            if (element == current) { return parent }
            else{
                var result = findParent(element, current)
                if (result != undefined) return result
            }
        }
    }
    else return undefined
}

function highlightcount(){
    for (var loop = 0;
        loop != current.subdirs.length+current.files.length; loop++){
        if (loop == candidateCount){
            document.getElementById(`op${candidateCount}`).style.color="black"
            document.getElementById(`op${candidateCount}`).style.backgroundColor="white"
        } else {
            document.getElementById(`op${loop}`).style.color="white"
            document.getElementById(`op${loop}`).style.backgroundColor="black"
    }}
}

function focusNav(){
    document.getElementById("navigation").style.borderColor = "white"
    document.getElementById("mainframe").style.borderColor = "black"
}
function focusMF(){
    document.getElementById("navigation").style.borderColor = "black"
    document.getElementById("mainframe").style.borderColor = "white"
}
function scrollDownFile(){
    document.getElementById("mainframe").scrollTop = document.getElementById("mainframe").scrollTop + document.getElementById("mainframe").clientHeight*0.05
}
function scrollUpFile(){
    document.getElementById("mainframe").scrollTop = document.getElementById("mainframe").scrollTop - document.getElementById("mainframe").clientHeight*0.05
}
function adjustNav(){    
    var canHeight = 0
    for(var i = 0; i<candidateCount; i++){
        canHeight += document.getElementById(`op${i}`).getBoundingClientRect().height
    }
    if(canHeight < document.getElementById("subdir-list").scrollTop + document.getElementById(`op${candidateCount}`).getBoundingClientRect().height){
        document.getElementById("subdir-list").scrollTop = canHeight - document.getElementById(`op${candidateCount}`).getBoundingClientRect().height
    }
    if(canHeight > document.getElementById("subdir-list").scrollTop + document.getElementById("subdir-list").offsetHeight-document.getElementById(`op${candidateCount}`).offsetHeight){
        document.getElementById("subdir-list").scrollTop = canHeight - document.getElementById("subdir-list").offsetHeight + document.getElementById(`op${candidateCount}`).getBoundingClientRect().height
    }
}