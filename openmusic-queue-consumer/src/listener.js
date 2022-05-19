class Listener {
    constructor(playlistService, mailSender) {
      this.playlistService = playlistService;
      this.mailSender = mailSender;

      this.listen = this.listen.bind(this);
    }
   
    async listen(message) {
        try {
            const { targetEmail, playlistId } = JSON.parse(message.content.toString());
            const playlist = await this.playlistService.getSongfromPlaylist(playlistId);
            const result = await this.mailSender.sendEmail(targetEmail, JSON.stringify(playlist));
            console.log(result);
        } catch (error) {
            console.error(error);
        }     
    }
}

 
module.exports = Listener;