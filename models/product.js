var mongoose = require('mongoose');

// Schema of Product

var ProductSchema = mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    image: {
        type: String
    }
});

var Product = module.exports = mongoose.model('Product', ProductSchema);