var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
 var Product = require('../models/product');

 // Get Category model
 var Category = require('../models/category');

/* 
 * GET all products
 */
// router.get('/', isUser, function(req, res){
router.get('/', function(req, res){
//    res.send('Server listening!!!');
    Product.find(function(err, products) {
        if (err)
            console.log(err);
        
       
        res.render('all_products', {
                title: 'All products',
                products: products
        });
        
    });
});



/* 
 * GET products by category
 */
router.get('/:category', function(req, res){

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);


            res.render('cat_products', {
                title: c.titles,
                products: products
            });

        });
    });
  
});


/* 
 * GET products details
 */
router.get('/:category/:product', function(req, res){

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;


    Product.findOne({slug: req.params.product}, function(err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;
                    
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });
    
  
});

module.exports = router;