const Storage = require("../models/Storage");

module.exports = {
    listStorage: (req, res) => {
        Storage.getAll((err, storage) => {
            res.render("storage_list", { storage });
        });
    }
};
