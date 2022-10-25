const express = require('express')
const app = express()
const port = 3000
var https = require('https')
const date = new Date()

const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
var parser = new XMLParser()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/fermata', (req, res) => {
    fermata = req.query.fermata
    linea = req.query.linea
    hour = date.getHours().toString()
    minute = date.getMinutes().toString()
    if (minute.length == 1) {
        minute = "0" + minute
    }
    ora = hour + minute
    console.log("Richiesta la fermata: " + fermata + " per le ore " + ora)
    if (fermata == "") {
        return res.status(500).json({ message: "Fermata is null" });
    }


    var options = {
        host: 'hellobuswsweb.tper.it',
        path: '/web-services/hello-bus.asmx/QueryHellobus?fermata=' + fermata + '&linea=&oraHHMM=' + ora
    };

    myOutput = ""
    body = ""
    var req1 = https.get(options, function(res1) {
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        res1.on('data', function(chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function() {
            var body = Buffer.concat(bodyChunks);
            console.log('BODY: ' + body);
            output = parser.parse(body).string.toString()

            listaAutobus = getJsonList(output)


            res.json({ message: listaAutobus })
        })
    });

    req1.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function cleanBus(toAdd) {
    const regex = /\([^)]*\)/;
    toAdd = toAdd.replace("TperHellobus:", "")
    toAdd = toAdd.replace(regex, "")
    toAdd = toAdd.trimStart()
    toAdd = toAdd.trimEnd()
    return toAdd

}

function getJsonList(output) {
    listaAutobus = {}
    key = "Autobus"
    listaAutobus[key] = []


    lista = output.split(',')

    lista.forEach(function(autobus) {
        busToAdd = cleanBus(autobus)
        listaAutobus["Autobus"].push(busToAdd)
    })

    return listaAutobus


}