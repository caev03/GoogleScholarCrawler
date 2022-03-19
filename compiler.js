var fs = require('fs');

let rawdata = fs.readFileSync("resultsMH1.json")

let baseJSON = JSON.parse(rawdata);

var keyss = Object.keys(baseJSON);

for (let index = 2; index < 5; index++) {
    
    rawdata = fs.readFileSync("resultsMH"+index+".json")

    newJSON = JSON.parse(rawdata)

    var keys = Object.keys(newJSON);

    keys.forEach(element => {
        if (baseJSON[element]!=undefined) {
            if (baseJSON[element]["searchTerm"][0] != newJSON[element]["searchTerm"][0]) {
                baseJSON[element]["searchTerm"].push(newJSON[element]["searchTerm"][0])
            }
        } else {
            baseJSON[element] = newJSON[element]
        }
    });
    
}

fs.writeFile("resultsMHC1.json", JSON.stringify(baseJSON, null, 4), (err)=>{})