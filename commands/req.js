const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'req',
    description: 'Những yêu cầu khi tham gia giveaway',
    execute(message) {
        // Tạo một embed mới
        const embed = new EmbedBuilder()
            .setColor('#CC99FF') // Màu của embed
            .setImage('https://cdn.discordapp.com/attachments/1262131507636473856/1296907197841674240/image.png?ex=6713fe73&is=6712acf3&hm=184a78afb65f329e02f7ba9ef42b2573071be232be98bc2651a28274333b4c44&')
            .setAuthor({
                name: 'CÁCH LÀM REQUEST GIVEAWAY',
                iconURL:
                    'https://cdn-icons-png.freepik.com/256/3790/3790219.png?semt=ais_hybrid',
            })
            .setDescription('**Bước 1 :** Nhấn chuột phải vào kênh bất kì, chọn **"Mời mọi người"**\n**Bước 2 :** Bấm **"Chỉnh sửa lời mời"** chọn 1 thời gian bất kì và gửi đến người bạn muốn mời\n**Bước 3 :** Kiểm tra mình đã mời được bao nhiều người bằng cách vào kênh chat chung hoặc kênh bất kì có thể chat được bấm lệnh `-i`\n\n**Lưu ý :** Nếu bạn mời bằng lời mời `https://discord.gg/prettystore` **thì bot sẽ không nhận diện và không tính lời mời!**')
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar server cho footer
            });

        // Tạo một button với link
        const button = new ButtonBuilder()
            .setLabel('Kiểm tra lời mời') // Nhãn trên nút
            .setEmoji('<:ps_links:1296511827177508874>')
            .setURL('https://discord.com/channels/1262128190915088495/1298638150465486989') // Liên kết
            .setStyle(ButtonStyle.Link); // Đặt kiểu button là Link

        // Tạo hàng chứa button
        const row = new ActionRowBuilder().addComponents(button);

        // Bot gửi tin nhắn dạng embed kèm button
        message.channel.send({ embeds: [embed], components: [row] });
    },
};
