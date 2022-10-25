# tper-realtime
## Description
A simple API server that gives information about the next buses arriving at a certain bus stop covered by italian public transportation company "TPER"

## Requirements
1. Docker

## Installation
1. Clone this repository
2. In the main directory just enter
    `docker-compose up --build `

## Get the buses for a given bus stop
### Request
`GET fermata/idFermata `

### Response
a JSON object like this

```json
{"message":

{"Autobus":
[

    {"Line":"39","Time":"11:35","Satellite":true},
    {"Line":"33","Time":"11:36","Satellite":true}

    ]
    }
    }

```




