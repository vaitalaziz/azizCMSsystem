var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

 // Get Category model
 var Category = require('../models/category');


/*
 * Get category index
 */
// getting data from collection of page DB 
router.get('/', isAdmin, function(req, res){
    // res.send('cats index !!!');  // just to test that link work
    Category.find(function(err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

router.get('/test', function(req, res){
    res.send('Admin Test Page');
});


/*
 *  Get add category
 */
router.get('/add-category', isAdmin, function(req, res){
    var title = '';

    res.render('admin/add_category', {
        title: title
    });
});

/*
    Post add category
*/
router.post('/add-category', function(req, res){
    req.checkBody('title', 'Need Title value.').notEmpty();
    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    
    var errors = req.validationErrors();

    if (errors){
        console.log('errorssss!!!');
        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    } else {
        // Title need to be unique, that checking by slug 
        Category.findOne({slug: slug}, function(err, category){
            if(category){
                req.flash('danger', 'Category title already exists, choose another.');
                res.render('admin/add_category', {
                    title: title
               });
            } else { 
                var category = new Category ({
                    title: title,
                    slug: slug
                }); 
                // then goingto save into DB 
                category.save(function(err) {
                    if (err) return console.log(err);

                
                Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });


                    req.flash('success', 'Category added sussessfully!'); // 'success' & top 'danger' class name of bootstrap that pass to 'type' into 'messages.ejs' 
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});




/*
 *  Get edit category 
 */
router.get('/edit-category/:id', isAdmin, function(req, res){
    
    Category.findById(req.params.id, function(err, category) {
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        }); 
    });
});


/*
    Post edit category
*/
router.post('/edit-category/:id', function(req, res){
    req.checkBody('title', 'Need Title value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors){
        console.log('errorssss!!!');
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id:{'$ne':id}}, function(err, category){
            if(category){  
                req.flash('danger', 'Category title already exists, choose another.');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
               });
            } else { // if all is unique then storing field data here

                Category.findById(id, function(err,category) {
                    if (err)
                        return console.log(err);
                    
                    category.title = title;
                    category.slug = slug;

                // then goingto update into DB 
                    category.save(function(err) {
                        if (err) return console.log(err);


                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success', 'Category edited sussessfully!'); // 'success' & top 'danger' class name of bootstrap that pass to 'type' into 'messages.ejs' 
                        res.redirect('/admin/categories/edit-category/'+ id);  // redirect to the same page, so 'id'
                    });
                });
                
            }
        });
    }
});


/*
 * Get delete category
 */
router.get('/delete-category/:id', isAdmin, function(req, res){
    Category.findByIdAndRemove(req.params.id, function(err) {
        if (err) return console.log(err);


        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });

        req.flash('success', 'Category deleted sussessfully!'); // 'success' & top 'danger' class name of bootstrap that pass to 'type' into 'messages.ejs' 
        res.redirect('/admin/categories/');
    });
});

// exports
module.exports = router;