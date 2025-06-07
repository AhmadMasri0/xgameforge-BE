exports.setUploadFolder = (folderName) => {
    return function (req, res, next) {
        req.folderName = folderName;
        next();
    };
}