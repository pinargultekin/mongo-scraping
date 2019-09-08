
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
//var request = require("request");
var cheerio = require("cheerio");
var axios = require("axios");


// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
//var results = [];

// Routes

app.get("/", function (req, res) {
  res.render("index");
});

// A GET route for scraping the Daily Universe website

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.scientificamerican.com/section/lateststories/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every article tag, and do the following:
    $("article").each(function (i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h2")
        .children()
        .text();
      result.link = $(this)
        .find("h2")
        .children()
        .attr("href");
      result.picture = $(this)
        .find("picture")
        .children("img")
        .attr("src");
      result.summary = $(this)
        .find(".listing-wide__inner")
        .children("p")
        .text();
      // result.picture = $("div.t_thumb a picture img", this)
      //    // .children("img")
      //     .attr("src");
      // console.log(result.picture);
      //  console.log($("div.t_thumb a picture img", this).length)
      console.log(result)
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    // res.render("scrape", {
    //   articles: result

   // });
   res.redirect("saved");
   


  });
});



// Route for getting all Articles from the db
app.get("/saved", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      console.log(dbArticle);
      res.render("saved", {
        saved: dbArticle
      });
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for creating an Article in the db
app.post("/api/saved", function (req, res) {
  db.Article.create(req.body)
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  console.log(req.params.id);
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      console.log(dbArticle);
      if (dbArticle) {
        res.render("articles", {
          data: dbArticle
        });
      }
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for deleting an article from the db
app.delete("/saved/:id", function (req, res) {
  db.Article.deleteOne({ _id: req.params.id })
    .then(function (removed) {
      res.json(removed);
    }).catch(function (err, removed) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for deleting a note
app.delete("/articles/:id", function (req, res) {
  db.Note.deleteOne({ _id: req.params.id })
    .then(function (removed) {
      res.json(removed);
    }).catch(function (err, removed) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true })
        .then(function (dbArticle) {
          console.log(dbArticle);
          res.json(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    })
    .catch(function (err) {
      res.json(err);
    })
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on http://localhost:" + PORT );
});