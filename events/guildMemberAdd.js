const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = async (member) => {
    if (member.user.bot) return; // Bỏ qua bot
    const embed = new EmbedBuilder()
        .setColor('#f0f0f0')
        .setThumbnail(
            'https://cdn-icons-png.flaticon.com/512/12484/12484179.png'
        )
        .setImage(
            'https://cdn.discordapp.com/attachments/1262131507636473856/1278935974327484456/Video_chua_at_ten_uoc_tao_bang_Clipchamp.gif?ex=66d29d71&is=66d14bf1&hm=52c399c06112e6e40b8c659932e79e376e604732d5e5c0414ca2f95a1fa92fe8&'
        )
        .setTitle('Xác Minh Tài Khoản')
        .setDescription(
            '> <:ps_dot:1278233714857611347> Nhấn vào nút **"Xác Minh"** phía dưới để xác minh tài khoản tại cửa hàng\n> \n> <:ps_dot:1278233714857611347> Sau khi bạn **Xác minh** bạn sẽ có được role thấy được bảng giá và kênh mua hàng.\n> \n> <:ps_dot:1278233714857611347> Nội dung xác minh sẽ không ảnh hưởng tới tài khoản của bạn. Nó chỉ giúp cửa hàng nếu bị **Discord** xóa thì bên mình sẽ mời các bạn vào **máy chủ** mới.'
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('cachmuahang')
            .setEmoji('<:ps_shop:1274435956296122594>')
            .setLabel('Cách Mua Hàng')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setLabel('Xác Minh')
            .setEmoji('<:ps_qr:1271390305282949130>')
            .setURL(
                'https://discord.com/oauth2/authorize?client_id=1262133297920610405&redirect_uri=https://restorecord.com/api/callback&response_type=code&scope=identify+guilds.join+email&state=1262128190915088495'
            )
            .setStyle(ButtonStyle.Link)
    );

    try {
        await member.send({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn đến thành viên:', error);
    }
};
