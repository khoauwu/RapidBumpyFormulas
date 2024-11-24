const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emoji = require('../utils/emoji.js');

module.exports = {
    name: 'verify',
    description: 'Những yêu cầu khi tham gia giveaway',
    execute(message) {
        // Tạo một embed mới
        const embed = new EmbedBuilder()
            .setColor('#CC99FF') // Màu của embed
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/9385/9385289.png')
            .setImage('https://cdn.discordapp.com/attachments/1262131507636473856/1278935974327484456/Video_chua_at_ten_uoc_tao_bang_Clipchamp.gif?ex=672308f1&is=6721b771&hm=3ba49e0711fb4b6d60fe3989c7b8b81bbbf2152db1cdd474418ea7fda5534923&')
            .setAuthor({
                name: 'Xác Minh Tài Khoản',
                iconURL:
                    'https://cdn-icons-png.flaticon.com/512/7641/7641727.png',
            })
            .setDescription(`> ${emoji.dot} Nhấn vào nút **"Xác Minh"** phía dưới để xác minh tài khoản tại cửa hàng\n> \n> ${emoji.dot} Sau khi bạn **Xác minh** bạn sẽ có được role thấy được bảng giá và kênh mua hàng.\n> \n> ${emoji.dot} Nội dung xác minh sẽ không ảnh hưởng tới tài khoản của bạn. Nó chỉ giúp cửa hàng nếu bị **Discord** xóa thì bên mình sẽ mời các bạn vào **máy chủ mới.**`)
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar server cho footer
            });

        // Tạo một button với link
        const button = new ButtonBuilder()
            .setLabel('Xác minh') // Nhãn trên nút
            .setEmoji('<:ps_qr:1268976922646286444>')
            .setURL('https://discord.com/oauth2/authorize?client_id=1262133297920610405&redirect_uri=https://restorecord.com/api/callback&response_type=code&scope=identify+guilds.join+email&state=1262128190915088495') // Liên kết
            .setStyle(ButtonStyle.Link); // Đặt kiểu button là Link

        // Tạo hàng chứa button
        const row = new ActionRowBuilder().addComponents(button);

        // Bot gửi tin nhắn dạng embed kèm button
        message.channel.send({ embeds: [embed], components: [row] });
    },
};
