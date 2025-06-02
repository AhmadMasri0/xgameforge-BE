const Product = require("../models/Product");
const path = require('path');
const fs = require('fs');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err });
    }
};


exports.getSearchedProducts = async (req, res) => {
    const { q } = req.query;
    const regex = new RegExp(q, 'i');
    const products = await Product.find({
        name: { $regex: regex }
    });
    res.json(products);
};


exports.createProduct = async (req, res) => {
    try {
        const images = req.files.map(file => ({
            url: `/uploads/${file.filename}`,
            alt: file.originalname
        }));

        const productData = {
            ...JSON.parse(req.body.name && typeof req.body.name === 'string' ? JSON.stringify(req.body) : req.body),
            images,
        };

        const product = new Product(productData);
        const saved = await product.save();
        console.log(saved);
        res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Failed to create product', error: err });
    }
};

exports.getProductById = async (req, res) => {

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getFeaturedGames = async (req, res) => {

    try {
        const products = await Product.find({ isFeatured: true });

        if (!products) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(products.slice(0, 3));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        removedImages.forEach(image => {
            const idx = product.images.findIndex((pi) => pi.url === image.url)

            if (idx !== -1) {
                product.images.splice(idx, 1);
                console.log(image.url.split('/uploads/'))
                const tmp = image.url.split('/uploads/');
                if (tmp.length > 1) {
                    const filePath = path.join(__dirname, '../uploads', image.url.split('/uploads/')[1]);

                    if (fs.existsSync(filePath)) {

                        fs.unlinkSync(filePath);
                    }
                }
            }
        });

        if (req.files) {

            const newNames = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                alt: file.originalname
            }));
            product.images.push(...newNames);

        }

        if (product.images.length < 1) {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        if (product.images.length > 5) {
            return res.status(400).json({ error: 'No more than 5 images allowed' });
        }

        for (let key in req.body) {
            product[key] = req.body[key];
        }

        await product.save();
        res.json({ success: true, product });
    } catch (e) {
        res.status(500).json({ message: "Failed to Update product", error: e });

    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Remove image files from the /uploads directory
        product.images.forEach(img => {
            if (img.url.startsWith('/uploads/')) {
                const imagePath = path.join(__dirname, '../', img.url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        });

        // Delete the product document
        await product.deleteOne();

        res.status(200).json({ message: "Product and images deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete product", error: err.message });
    }
};

