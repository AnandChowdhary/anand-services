module.exports = () => {
    // Run wayback daily
    require("../services/wayback")({
        body: {}
    }, {
        json: text => {
            console.log(text);
        }
    });
};