const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const emoji = require('../utils/emoji.js');

module.exports = {
    name: '2fa',
    description: 'Gửi một liên kết để kích hoạt 2FA',
    async execute(message) {
        await message.delete();

        // Tạo embed
        const embed = new EmbedBuilder()
            .setColor('#CC99FF')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/2972/2972022.png')
            .setTitle('Cách Bật Mã 2FA Bằng Điện Thoại')
            .setDescription('Nhằm phòng ngừa những trường hợp khách hàng có **công việc cá nhân**,nhân viên mới yêu cầu các bạn bật mã 2FA để bộ phận kĩ thuật có thể xử lý đơn hàng của bạn bất cứ lúc nào. \n\n**Nhấn vào nút "Xem video" để xem video hướng dẫn**.');

        // Tạo nút bấm với đường link
        const button = new ButtonBuilder()
            .setLabel('Xem video')
            .setEmoji(emoji.youtube)
            .setStyle(ButtonStyle.Link)
            .setURL('https://youtu.be/hNS3ICHWIw4') // Thay 'https://example.com/2fa' bằng đường link thực tế

        // Tạo một ActionRow để chứa nút
        const row = new ActionRowBuilder().addComponents(button);

        // Gửi embed và nút bấm
        message.channel.send({ embeds: [embed], components: [row] });
    },
};
