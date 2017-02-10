var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');



// search for all the item with the same name as the name user input
router.get('/:name', function(req, res, next) {
  async.waterfall([
    function(callback) {
      // The variable name here will be refer to the '/:name'
      Category.findOne({ name: req.params.name }, function(err, category) {
        if (err) return next(err);
        callback(null, category);
      });
    },

    // function1 will pass category to function2
    function(category, callback) {
        for(var i = 0; i < 30; i++) {
          var product = new Product();
          product.category = category._id;
          // faker.js is used to generate the fake dataset
          product.name = faker.commerce.productName();
          product.price = faker.commerce.price();
          product.image = faker.image.image();
          product.save();
        }
    }
  ]);

  res.json({ message: 'Success' });
});

module.exports = router;
