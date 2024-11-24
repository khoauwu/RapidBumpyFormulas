const { EmbedBuilder } = require('discord.js');
const config = require(`../config.json`);
module.exports = {
    name: 'limitowo',
    description: 'Gửi một tin nhắn embed.',
    execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('#2d2d31') // Màu hồng
            .setTitle('Đọc Từ Trái Sang Phải')
            .setDescription('**Số liệu gửi và nhận giới hạn trong ngày của bot OWO**\n**(Cách đọc : LEVEL - SỐ TIỀN GỬI - SỐ TIỀN NHẬN)**')
            .setImage('https://cdn.discordapp.com/attachments/1262131507636473856/1290713424539680798/654e4f485008f456ad19.png?ex=66fd760c&is=66fc248c&hm=61ffcc8173c43febc1e4bbc1a053fc16d069835ae85b49b78cf7d147efebe328&')
            .setTimestamp()
            .setFooter({ text: `con chó đáng iu`, iconURL: config.IMG }); // Thay thế URL bằng icon của bạn

        message.reply({ embeds: [embed] });
    },
};
