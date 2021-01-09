const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const app = express();
app.use(express.json());

var corsOptions = {
  origin: 'http://localhost:4200',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(express.urlencoded({
  extended: true
}));
app.options('*', cors());
app.listen(8888);


console.log("Server listening on port 8888");

app.get("/listmot/:pattern", cors(corsOptions), (req, res) => {
  let pattern = req.params.pattern;

  console.log("pattern :  " + pattern);

  if (fs.existsSync("./cache/pattern_autocomplete/" + pattern)) {
    console.log("lire dans le fichier");

    fs.readFile("./cache/pattern_autocomplete/" + pattern, function read(err, data) {
      let result = data.toString("utf8");
      result = result.split("\n");
      res.end(JSON.stringify(result));
    })
  } else {
    //  console.error(err)
    fs.readFile("./cache/listmot.txt", function read(err, data) {
      const regex = new RegExp("[a-z|A-Z]*" + pattern + "[a-z|A-Z]*", 'gm');
      let result = data.toString("utf8").match(regex);
      let cache = "";

      for (var i = 0; i < 10; i++) {
        cache += result[i] + "\n";
      }

      fs.writeFile("./cache/pattern_autocomplete/" + pattern, cache, (err) => {
        if (err) throw err;

        console.log("cache edited");
      });
      res.end(JSON.stringify(result));
    });

  }
});

app.get("/relations", cors(corsOptions), (req, res) => {

  fs.readFile("./cache/id_relation.cache",
    function read(err, data) {
      let tab = data.toString("utf8").split("\n");
      for (var i = 0; i < tab.length; i++) {
        tab[i] = tab[i].split(";");
      }
      res.end(JSON.stringify(tab));
    });

});

app.get("/reqJDMRel/:word/:rel", cors(corsOptions), (req, res) => {
  let word = req.params.word;
  let idrel = req.params.rel;

  let code = "";
  for (var i = 0; i < word.length; i++) {
    console.log(word[i])
    if (word[i] == word[i].toUpperCase()) {
      code += 1;
    }
    if (word[i] == word[i].toLowerCase()) {
      code += 0;
    }
  }
  console.log(code);
  console.log(word);

  if (fs.existsSync("./cache/relations/" + word + "-" + idrel + code)) {
    console.log("ici");
    fs.readFile("./cache/relations/" + word + "-" + idrel + code,
      function read(err, data) {
        let result = data.toString("utf8");
        res.end(result);
      });
  } else {
    http.get("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=" +
      word + "&rel=36?gotermsubmit=Chercher&gotermrel=" + word +
      "&rel=" + idrel, (resp) => {
        resp.setEncoding('binary');
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          const regex = /((e;[0-9]+;.*)|(r;[0-9]+;.*))/gm;
          let senay = data.toString("utf8").match(regex);

          if (senay == undefined) {
            res.end("not found");
          } else {
            let obj = {
              "nodes": [],
              "inbounds": [],
              "outgoing": []

            };
            for (var i = 0; i < senay.length; i++) {
              senay[i] = senay[i].split(";");
              console.log(senay[i]);
              if (senay[i][0].localeCompare("e") == 0) {
                let insert = {};
                insert.id = senay[i][1];
                insert.word = senay[i][2].replace("'", "").replace("'", "");
                insert.wtype = senay[i][3];
                insert.weight = senay[i][4];
                for (var j = 0; j < senay[i].length; j++) {
                  //  console.log("at" + j + " -> " + senay[i][j]);
                }
                obj.nodes.push(insert);

              }
              if (senay[i][0].localeCompare("r") == 0) {
                console.log("[" + senay[0][1] + "]at 2 :" +
                  senay[i][2] + " ||||| at 3 :" + senay[i][3] + "-->" + senay[i]);
                if (senay[i][2].localeCompare(senay[0][1]) == 0) {
                  console.log("find");
                  let insert = {};
                  insert.id = senay[i][1];
                  insert.rwith = senay[i][3];
                  insert.rtype = senay[i][4];
                  insert.weight = senay[i][5];
                  console.log(insert);
                  obj.inbounds.push(insert);

                }
                if (senay[i][3].localeCompare(senay[0][1]) == 0) {
                  console.log("find2");

                  let insert = {};
                  insert.id = senay[i][1];
                  insert.rwith = senay[i][2];
                  insert.rtype = senay[i][4];
                  insert.weight = senay[i][5];
                  console.log(insert);
                  obj.outgoing.push(insert);

                }
              }
            }
            console.log(JSON.stringify(obj));
            fs.writeFile("./cache/relations/" + word + "-" + idrel + code, JSON.stringify(obj), (err) => {
              if (err) throw err;

              console.log("cache edited");
            });
            res.end(JSON.stringify(obj));
          }
        });

      }).on("error", (err) => {
      console.log("Error: " + err.message);
    });

  }

});

app.get("/reqJDM/:word", cors(corsOptions), (req, res) => {
  let word = req.params.word;
  let idrel = req.params.idrel;


  let code = "";
  for (var i = 0; i < word.length; i++) {
    console.log(word[i])
    if (word[i] == word[i].toUpperCase()) {
      code += 1;
    }
    if (word[i] == word[i].toLowerCase()) {
      code += 0;
    }
  }

  console.log(word);

  if (fs.existsSync("./cache/relations/" + word + code)) {
    console.log("ici");
    fs.readFile("./cache/relations/" + word + code,
      function read(err, data) {
        let result = data.toString("utf8");
        res.end(result);
      });
  } else {
    http.get("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=" +
      word + "&rel=36?gotermsubmit=Chercher&gotermrel=" + word +
      "&rel=", (resp) => {
        resp.setEncoding('binary');
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          const regex = /((e;[0-9]+;.*)|(r;[0-9]+;.*))/gm;
          let senay = data.toString("utf8").match(regex);

          if (senay == undefined) {
            res.end("not found");
          } else {
            let obj = {
              "nodes": [],
              "inbounds": [],
              "outgoing": []

            };
            for (var i = 0; i < senay.length; i++) {
              senay[i] = senay[i].split(";");
              if (senay[i][0].localeCompare("e") == 0) {
                let insert = {};
                insert.id = senay[i][1];
                insert.word = senay[i][2].replace("'", "").replace("'", "");
                insert.wtype = senay[i][3];
                insert.weight = senay[i][4];
                for (var j = 0; j < senay[i].length; j++) {
                  //  console.log("at" + j + " -> " + senay[i][j]);
                }
                obj.nodes.push(insert);

              }
              if (senay[i][0].localeCompare("r") == 0) {
                //    console.log("[" + senay[0][1] + "]at 2 :" +
                //    senay[i][2] + " ||||| at 3 :" + senay[i][3] + "-->" + senay[i]);
                if (senay[i][2].localeCompare(senay[0][1]) == 0) {
                  let insert = {};
                  insert.id = senay[i][1];
                  insert.rwith = senay[i][3];
                  insert.rtype = senay[i][4];
                  insert.weight = senay[i][5];
                  obj.inbounds.push(insert);

                }
                if (senay[i][3].localeCompare(senay[0][1]) == 0) {
                  let insert = {};
                  insert.id = senay[i][1];
                  insert.rwith = senay[i][2];
                  insert.rtype = senay[i][4];
                  insert.weight = senay[i][5];
                  obj.outgoing.push(insert);

                }
              }
            }
            //  console.log(JSON.stringify(obj));
            fs.writeFile("./cache/relations/" + word + code, JSON.stringify(obj), (err) => {
              if (err) throw err;

              console.log("cache edited");
            });
            res.end(JSON.stringify(obj));
          }
        });

      }).on("error", (err) => {
      console.log("Error: " + err.message);
    });

  }
});


app.get("/defintions/:word", cors(corsOptions), (req, res) => {
  let word = req.params.word;

  let code = "";
  for (var i = 0; i < word.length; i++) {
    console.log(word[i])
    if (word[i] == word[i].toUpperCase()) {
      code += 1;
    }
    if (word[i] == word[i].toLowerCase()) {
      code += 0;
    }
  }

  if (fs.existsSync("./cache/def/" + word + code)) {
    fs.readFile("./cache/def/" + word + code,
      function read(err, data) {
        let result = data.toString("utf8");
        res.end(result);
      });
  } else {
    http.get("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=" +
      word + "&rel=36?gotermsubmit=Chercher&gotermrel=" + word +
      "&rel=1", (resp) => {
        resp.setEncoding('binary');
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          const regex = /([a-z|A-Z]*>[0-9]*')/gm;
          let senay = data.toString("utf8").match(regex);
          let defs = [];
          for (var i = 0; i < senay.length; i++) {
            senay[i] = senay[i].slice(0, -1);
            console.log("rel : " + senay[i]);
            http.get("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=" +
              word + "&rel=36?gotermsubmit=Chercher&gotermrel=" + senay[i] +
              "&rel=1", (resp) => {
                resp.setEncoding('binary');
                let data = '';

                resp.on('data', (chunk) => {
                  data += chunk;
                });

                resp.on('end', () => {
                  let regex2 = /(<def>|<DEF>).*(<\/def>|<\/DEF>)/gs;
                  let response = data.toString("utf8").match(regex2);
                  let regex3 = /(\<[(|\/)a-z|A-Z( )*]+\>)/gs;
                  let result = response[0].replace(regex3, '');
                  //  console.log(senay[0] + " : " + result);
                  let def = {
                    "d": ""
                  }

                  def.d = result;
                  defs.push(def);
                  console.log(defs.length);

                  if (defs.length == senay.length) {
                    //  console.log("new obj[" + defs.length + "] =>" + JSON.stringify(defs));

                    fs.writeFile("./cache/def/" + word + code, JSON.stringify(defs), {
                      flag: 'w'
                    }, (err) => {
                      if (err) throw err;

                      console.log("cache edited");
                      res.end(JSON.stringify(defs));
                    });

                  }

                })
              })

          }

        });
      });
  }
});