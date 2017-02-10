var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
// pass session to MongoStore; MongoStore is depending on express frame
// use MongoStore to store the session on the server side
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

var User = require('./models/user');
var secret = require('./config/secret');
var Category = require('./models/category');



var app = express();

// connect to the mongoDB
mongoose.connect(secret.database, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});



/*******    Middleware   *******/
// set static file path (css, javascript)
app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// those definition should be defined before routes, or will lead to fault
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true })  // saving the session in database
}));
app.use(flash());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// pass the req.user to the local variable user
// res.locals.user means the local variable user
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

// initial local variable categories
app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {  // search every single document in the database
    if(err) {
      return next(err);
    } else {
      res.locals.categories = categories;
      next();
    }
  });
});

// set the model engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
// sub-url under api, eg: localhost:3000/api/food
// it will directly go to find the route in apiRoutes
app.use('/api', apiRoutes);



/*******    Methods   *******/
app.listen(secret.port, function(err) {
  if(err) {
    throw err;
  }
  console.log("Server is running on port " + secret.port);
});
