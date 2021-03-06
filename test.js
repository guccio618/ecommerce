var async = require('async');



// array of functions, and each function is dependent on the next function
async.waterfall([
function(callback) {
  Category.find({}, function(err, category) {
    if (err) return next(err);
    callback(null, category);
  });
},
function(category, callback) {
  Product.findOne({ category: category._id }, function(err, productSingle) {
    if (err) return next(err);
    callback(null, productSingle);
  });
},
function(productSingle, callback) {
  Product.findById({ _id: productSingle._id }, function(err, product) {
    if (err) return next(err);
    res.render();
  });
}
]);



Category.find({}, function(err, category) {
  Product.findOne({ category: category._id }, function(err, productSingle) {
    Product.findById({ _id: productSingle._id }, function(err, productSingleById) {

    });
  });
});
