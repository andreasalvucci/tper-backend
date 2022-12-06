var express = require('express')
const app = express()
const port = process.env.PORT || 8000
var https = require('https')
const moment = require('moment-timezone')

const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
var parser = new XMLParser()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/fermata/:fermata', async(req, res) => {
    fermata = req.params.fermata
        //linea = req.query.linea

    listaAutobus = await callTPerAPI(fermata)
    console.log(listaAutobus)

    res.json({ message: listaAutobus })

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
        bus = {}
        busToAdd = cleanBus(autobus)
        lineNumber = getLineNumber(busToAdd)
        busTime = getBusTime(busToAdd)
        satellite = getSatellite(busToAdd)
        console.log("LINEA " + lineNumber)
        console.log("ORE: " + busTime)
        console.log("SATELLITE: " + satellite)
        bus["Line"] = lineNumber
        bus["Time"] = busTime
        bus["Satellite"] = satellite
        listaAutobus["Autobus"].push(bus)
    })

    return listaAutobus
}

function getLineNumber(aBusMessage) {
    info = aBusMessage.split(" ")
    return info[0]

}

function getBusTime(aBusMessage) {
    info = aBusMessage.split(" ")
    return info[2]
}

function getSatellite(aBusMessage) {
    info = aBusMessage.split(" ")
    if (info == "Previsto") {
        return false
    } else return true
}

async function callTPerAPI(fermata) {

    return new Promise(function(resolve, reject) {

        var now = moment().tz('Europe/Rome')
        var dst = now.isDST()
        hour = now.hour()
        minute = now.minutes()
        console.log("RICHIESTA PER LE ORE " + hour + ":" + minute)

        if (dst) {
            hour = hour - 1
        }
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
            path: '/web-services/hello-bus.asmx/QueryHellobus?fermata=' + fermata + '&linea=&oraHHMM=' // + ora
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
                resolve(listaAutobus);



            })
        });

        req1.on('error', function(e) {
            console.log('ERROR: ' + e.message);
            reject(e)
        });

    })



}