var router = require('express').Router();
var User = require('../models/user');
var Product = require('../models/product');



Product.createMapping(function(err, mapping) {
  if (err) {
    console.log("error creating mapping");
    console.log(err);
  } else {
    console.log("Mapping created");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;

stream.on('data', function() {
  count++;
});

stream.on('close', function() {
  console.log("Indexed " + count + " documents");
});

stream.on('error', function(err) {
  console.log(err);
});

router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});


// i.e /search?q=joker = req.query.joker
// results will be as follow, what we want are in the second hit:
// {
//    hits: {
//			hits: {
//        	_source: Value that we want
// 			}
//    }
// }
router.get('/search', function(req, res, next) {
  if (req.query.q) {
    Product.search({
      query_string: { query: req.query.q }
    }, function(err, results) {
      if (err) return next(err);

			// return map which store the results data
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });

			// render webpage and pass the params
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});

router.get('/', function(req, res) {
  res.render('main/home');
});

router.get('/about', function(req, res) {
  res.render('main/about');
});

// show all the users in the database
router.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

// routes for all the product
router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })   // req.params.id is equals to '/products/id'
    .populate('category')            // we can only use populate if the data type is ObjectId
    .exec(function(err, products) {  // populate() is used to get all the data in the category here
      if (err) return next(err);     // likes to traverse the category
      res.render('main/category', { products: products });
    });
});

router.get('/product/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
    if (err) return next(err);
    res.render('main/product', { product, product });
  });
});

module.exports = router;
