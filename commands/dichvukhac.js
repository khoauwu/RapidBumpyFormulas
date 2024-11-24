module.exports = {
    name: 'dichvukhac',
    description: 'Gửi thông tin về các dịch vụ khác',
    execute(message) {
        // Nội dung tin nhắn mà bot sẽ gửi
        const content = `<:ps_arrow:1296511891933237258> **Xem thêm nhiều dịch vụ khác tại __Pretty Store__\n<:ps_links:1296511827177508874> Link : || https://discord.gg/628xMMjMMV ||**`;

        // Bot gửi tin nhắn với nội dung trên
        message.channel.send(content);
    },
};
