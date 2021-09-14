var fs = require("fs")


function recread(selfpath, selfname){
    selfpath = selfpath + '/'
    var dirinfo = {
        "subdirs": [],
        "files": [],
        "selfname": '',
        "selfpath": ''
    }
    dirinfo.selfpath = selfpath
    dirinfo.selfname = selfname
    fs.readdirSync(selfpath).forEach((item, index)=>{
        if(fs.lstatSync(selfpath+item).isDirectory()==true){
            dirinfo.subdirs[dirinfo.subdirs.length] = recread(selfpath+item, item)
        }
        else if(item=='index'||item=="info.json"){}
        else{
            dirinfo.files[dirinfo.files.length] = item
        }
    })
    return dirinfo
}
var result = recread('public', '根目录')
result.date = (new Date()).toLocaleString().split(',')[0]
fs.writeFileSync('public/info.json', JSON.stringify(result))