class Sender {
    constructor(params) {
        this.bot = params.bot;
    }

    sendLunch() {
        var today = new Date();
        this.bot.sendLunch(today);
        this.bot.sendLunchToTwitter(today);
    }

    sendDinner() {
        var today = new Date();
        this.bot.sendDinner(today);
        this.bot.sendDinnerToTwitter(today);
    }
}

module.exports = Sender;