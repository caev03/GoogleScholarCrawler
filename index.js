const Crawler = require('crawler');
var fs = require('fs');
const cheerio = require('cheerio');

results = {}
queueSize = 0;

const c = new Crawler({
    rateLimit: (Math.floor(Math.random() * 0) + 0) * 1000,
    jQuery: 'cheerio',
    // This will be called for each crawled page
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server

            // ? GET all the pubs in the page
            var pubs = $(".gs_r.gs_or.gs_scl")

            pubs.each(function (i, elem) {
                var indexx = 0;
                if (elem.children.length > 1) {
                    indexx = 1;
                }

                var content = elem.children[indexx];
                var title = content.children[0]
                var indez = (title.children.length > 1) ? 2 : 0
                title = title.children[indez]

                var pubID = title.attribs["data-clk"].match(/.*&d=(\d*)&ei.*/)[1]
                pubJSON = {}
                if (!results[pubID]) {

                    pubJSON["pubID"] = pubID
                    pubJSON["searchTerm"] = res.options.searchTerm 

                    var link = title.attribs.href
                    pubJSON["link"]=link
                    // console.log(link);
                    var tiitle = $(title).html()
                    pubJSON["title"]=tiitle
                    // console.log(tiitle);

                    var pdfURL = ""
                    if (elem.children.length > 1) {
                        var contentt = elem.children[0].children[0].children[0].children[0];
                        if (contentt.children[0].children[0].data == "[PDF]") {
                            pdfURL = contentt.attribs.href
                            pubJSON["pdfURL"]=pdfURL
                        }
                    }
                    // console.log(pdfURL);

                    var authors = content.children[1]
                    authors = $(authors).html().toString().replace("/citations", "https://scholar.google.com/citations");
                    authors = authors.replaceAll("\"","'")
                    pubJSON["authors"]=authors
                    // console.log(authors);

                    var articleContent = content.children[2]
                    articleContent = $(articleContent).html();
                    pubJSON["articleContent"]=articleContent
                    pubJSON["articleContent"]=pubJSON["articleContent"].replaceAll("\r\n", " ")
                    pubJSON["articleContent"]=pubJSON["articleContent"].replaceAll("<br>", " ")
                    // console.log(articleContent);

                    var refs = $(content.children[3])

                    var citations, citationsURL, citationsAmount, relatedArticles;

                    if (refs.children().length > 5) {
                        citations = refs.children().get(2);

                        citationsURL = ("" + citations.attribs.href).replace("/scholar", "https://scholar.google.com/scholar")
                        pubJSON["citationsURL"]=citationsURL
                        // console.log(citationURL);
                        citationsAmount = citations.children[0].data.match(/Citado por (\d*)/)[1]
                        pubJSON["citationsAmount"]=citationsAmount
                        // console.log(citationsAmount);

                        relatedArticles = refs.children().get(3).attribs.href;
                        relatedArticles = relatedArticles.replace("/scholar", "https://scholar.google.com/scholar")
                        pubJSON["relatedArticles"]=relatedArticles
                    }

                    results[pubID]=pubJSON
                }
            })

        }
        if(c.queueSize=1){
            fs.writeFile("results.json", JSON.stringify(results), (err)=>{})
        }
        done();
    }
});

const data = fs.readFileSync("links.txt", "utf8");

// split the contents by new line
const lines = data.split(/\r?\n/);

const amountResults = 30

// print all lines
lines.forEach((line) => {

    // preprocessing
    line = line.replaceAll(" ","+")
    line = line.replaceAll("(","%28")
    line = line.replaceAll(")","%29")

    for (let jndex = 0; jndex < amountResults; jndex += 10) {
        // var newLine = "https://scholar.google.com/scholar?start="+jndex+"&q="+line
        var newLine = line + jndex + ".html"
        console.log("--------------------------");
        console.log(newLine);
        c.queue({ uri: newLine, searchTerm: line })
    }
});



