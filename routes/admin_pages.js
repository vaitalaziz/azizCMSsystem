var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;


 // Get page model
 var Page = require('../models/page');


/*
 * Get pages index
 */
// getting data from collection of page DB 
router.get('/', isAdmin, function(req, res){
//    res.send('Server listening!!!');
// res.send('Admin Area'); find({}) the {} means everything of DB
// sorting: 1 mean getting data, and of the view is in 'pages.ejs'
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

router.get('/test', function(req, res){
    res.send('Admin Test Page');
});


/*
 *  Get add pages
 */
router.get('/add-page', isAdmin, function(req, res){
    var title = '';
    var slug = '';
    var content = '';
    
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

/*
    Post add page
*/
router.post('/add-page', function(req, res){
    req.checkBody('title', 'Need Title value.').notEmpty();
    req.checkBody('content', 'Need Content value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug =="") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();

    if (errors){
        console.log('errorssss!!!');
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        // console.log('Success Post!');
        // checking to be unique,  
        // 1st slug from collection, 2nd slug is variable from above,findOne: from mongoose 
        Page.findOne({slug: slug}, function(err, page){
            if(page){
                req.flash('danger', 'Page slug already exists, choose another.');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
               });
            } else { // if all is unique then storing field data here
                var page = new Page ({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                }); 
                // then goingto save into DB 
                page.save(function(err) {
                    if (err) return console.log(err);


                    //  app.locals.pages  storing all pages
                    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    

                    req.flash('success', 'Page added sussessfully!'); // 'success' & top 'danger' class name of bootstrap that pass to 'type' into 'messages.ejs' 
                    res.redirect('/admin/pages');
                });
            }
        });
    }
});


// Sort pages function
function sortPages(ids, callback){

    var count = 0;

    for (var i = 0; i < ids.length; i++){
        var id = ids[i];
        count++;

        (function (count) {
        Page.findById(id, function (err, page) {
            page.sorting = count;
            page.save(function (err) {
                if (err)
                    return console.log(err);
                ++count;
                if (count >= ids.length) {
                    callback();
                }
            });
        });
        }) (count);
    }
}

// POST reorder pages 
router.post('/reorder-pages', function(req, res){
//    console.log(req.body);
    var ids = req.body['id[]'];

    sortPages(ids, function() {
    //  app.locals.pages  storing all pages
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});


/*
 *  Get edit page
 */
router.get('/edit-page/:id', isAdmin, function(req, res){
    
    Page.findById(req.params.id, function(err, page) {
        if (err)
            return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        }); 
    });
});


/*
    Post edit page
*/
router.post('/edit-page/:id', function(req, res){
    req.checkBody('title', 'Need Title value.').notEmpty();
    req.checkBody('content', 'Need Content value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug =="") 
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    // var id = req.body.id;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors){
        console.log('errorssss!!!');
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        // checking to be unique, but not for the particular page, so _id:{'$ne':id}    
        // 1st slug from collection, 2nd slug is variable from above,findOne: from mongoose 
        Page.findOne({slug: slug, _id:{'$ne':id}}, function(err, page){
            if(page){ // means there is slug without value. 
                req.flash('danger', 'Page slug already exists, choose another.');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
               });
            } else { // if all is unique then storing field data here

                Page.findById(id, function(err,page) {
                    if (err)
                        return console.log(err);
                    
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                // then goingto update into DB 
                    page.save(function(err) {
                        if (err) return console.log(err);

                    //  app.locals.pages  storing all pages
                    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });

                        req.flash('success', 'Page edited sussessfully!'); // 'success' & top 'danger' class name of bootstrap that pass to 'type' into 'messages.ejs' 
                        res.redirect('/admin/pages/edit-page/'+ id); // redirct to same page so , 'id'
                    });
                });
                
            }
        });
    }
});


/*
 * Get delete page
 */
router.get('/delete-page/:id', isAdmin, function(req, res){
    Page.findByIdAndRemove(req.params.id, function(err) {
        if (err) return console.log(err);

        //  app.locals.pages  storing all pages
        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page deleted sussessfully!'); // 'success' & top 'danger' class name of bootstrap that pass to 'type' into 'messages.ejs' 
        res.redirect('/admin/pages/');
    });
});

// exports
module.exports = router;