const express = require('express');
const router = express.Router();
const { Product } = require("../models/Product");
const multer = require('multer');
const cloudinary = require('cloudinary');
require('dotenv').config();
const { auth } = require("../middleware/auth");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

var storage = multer.diskStorage({
    // destination: (req, file, cb) => {
    //     cb(null, 'uploads/')
    // },
    // filename: (req, file, cb) => {
    //     cb(null, `${Date.now()}_${file.originalname}`)
    // },
    // fileFilter: (req, file, cb) => {
    //     const ext = path.extname(file.originalname)
    //     if (ext !== '.jpg' || ext !== '.png') {
    //         return cb(res.status(400).end('only jpg, png are allowed'), false);
    //     }
    //     cb(null, true)
    // }
})

var upload = multer({ storage: storage }).single("file")


//=================================
//             Product
//=================================

router.post("/uploadImage", auth, upload, (req, res, next) => {
    if(req.file){
        cloudinary.v2.uploader.upload(req.file.path)
        .then((result) => {
            return res.json({success: true, image: result.secure_url, filename: result.public_id});
        })
        .catch((err) => {
            return res.json({success: false, err})
        }) 
    } else {
            next();
    }        
});


router.post("/updateProduct", auth, async (req, res) => {


    //update the data we got from the client into the DB 
    const product = req.body;
    await Product.findOneAndUpdate({_id: product._id}, 
        {$set: {images: product.images, title: product.title, description: product.description, price: product.price}}, 
        {new: true})
        .then(data => {
            if(data===null){
                throw new Error('Product not found');
            }
            return res.status(200).json({ success: true });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, err })
        })

});

router.post("/uploadProduct", auth, async (req, res) => {

    //save all the data we got from the client into the DB 
    const product = new Product(req.body)

    await product.save((err) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).json({ success: true })
    })

});

router.post("/deleteProduct", auth, async (req,res) => {
    const product = req.body
    await Product.findByIdAndRemove(product._id, (err) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).json({ success: true })
    })    
});

router.post("/getProducts", (req, res) => {

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm;

    for (let key in req.body.filters) {

        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    console.log(findArgs)

    if (term) {
        Product.find(findArgs)
            .find({ $text: { $search: term } })
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    }

});


//?id=${productId}&type=single
//id=12121212,121212,1212121   type=array 
router.get("/products_by_id", (req, res) => {
    let type = req.query.type
    let productIds = req.query.id

    // console.log("req.query.id", req.query.id)

    if (type === "array") {
        let ids = req.query.id.split(',');
        productIds = [];
        productIds = ids.map(item => {
            return item
        })
    }

    // console.log("productIds", productIds)


    //we need to find the product information that belong to product Id 
    Product.find({ '_id': { $in: productIds } })
        .populate('writer')
        .exec((err, product) => {
            if (err) return res.status(400).send(err)
            return res.status(200).send(product)
        })
});



module.exports = router;
