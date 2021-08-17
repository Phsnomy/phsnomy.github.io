var fs = require("fs")

function recread(str, par1, par2, name){
    str = str + '/'
    var dirinfo = {
        "pardir":[],
        "name": [],
        "subdir": [],
        "files": []
    }
    dirinfo.pardir = [par1,par2]
    dirinfo.name[1] = str
    dirinfo.name[0] = name
    fs.readdirSync(str).forEach((item, index)=>{
        if(fs.lstatSync(str+item).isDirectory()==true){
            dirinfo.subdir[dirinfo.subdir.length] = [item, str+item]
            recread(str+item, dirinfo.name[0], dirinfo.name[1], item)
        }
        else if(item=='index'||item=='dirinfo.json'){}
        else{
            dirinfo.files[dirinfo.files.length] = [item, str+item]
        }
    })
    fs.writeFileSync(str+'dirinfo.json', JSON.stringify(dirinfo))
}
recread('public', "無", "public", "根目錄")
/*
fs.readdirSync('public').forEach((item, index)=>{
    var item_n
    if(fs.lstatSync("public/" + item).isDirectory()){
        if (item=='archives') item_n="閣樓"
        if (item=='guestbook') item_n='留言簿'
        if (item=='comments') item_n='評論'
        recread('public/'+item, "根目錄","public", item_n)
    }
})
*/