const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require(`../config.json`);

module.exports = {
    name: 'done',
    description: 'Hoàn thành đơn hàng và gửi thông báo cho người dùng.',
    async execute(message, args) {
        // Kiểm tra xem lệnh có bắt đầu bằng prefix không
        if (!message.content.startsWith(config.prefix)) {
            return; // Không làm gì nếu không có prefix
        }

        let mentionedUser;

        // Kiểm tra nếu người dùng được đề cập (mention) hoặc sử dụng user ID
        if (message.mentions.users.first()) {
            mentionedUser = message.mentions.users.first();
        } else if (args[0]) {
            try {
                mentionedUser = await message.client.users.fetch(args[0]);
            } catch (error) {
                return message.reply('Không thể tìm thấy người dùng với ID đã cung cấp.');
            }
        }

        if (!mentionedUser) {
            return message.reply('Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID của họ.');
        }

        // Tạo embed cảm ơn vì đã mua hàng
        const thankYouEmbed = new EmbedBuilder()
            .setColor('#CC99FF')
            .setAuthor({ name: 'Đơn Hàng Của Bạn Đã Hoàn Thành!', iconURL: 'https://cdn-icons-png.flaticon.com/512/2324/2324510.png' })
            .setThumbnail(message.guild.iconURL({ dynamic: true })) // Lấy avatar server cho thumbnail
            .setDescription(`<a:ps_cat:1277771313238249532> **Chúc mừng**! Đơn hàng \`${args.slice(1).join(' ')}\` của bạn tại **Pretty Store** đã được hoàn tất!\n\nĐể được bảo hành khi sản phẩm bị lỗi, hư bạn cần phải để lại 1 đánh giá ở kênh https://discord.com/channels/1262128190915088495/1267984984619221146`);

        // Tạo embed hướng dẫn đánh giá
        const reviewEmbed = new EmbedBuilder()
            .setColor('#CC99FF')
            .setAuthor({ name: 'Hướng Dẫn Đánh Giá', iconURL: 'https://cdn-icons-png.flaticon.com/512/276/276020.png' })
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar server cho footer
            })
            .setDescription(`Để đánh giá, sao chép nội dung dưới đây, bấm vào nút **"Đánh Giá"** và dán vào kênh đánh giá. Chúng tôi **rất biết ơn** sự ủng hộ của bạn! \n\n\`\`\`yaml\n+1 legit ${args.slice(1).join(' ')}\`\`\``);

        // Tạo nút chính sách bảo hành
        const warrantyButton = new ButtonBuilder()
            .setLabel('Chính Sách Bảo Hành')
            .setEmoji('<:ps_deliverybike:1283387493210787921>')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('warranty_policy');

        // Tạo nút đánh giá
        const reviewButton = new ButtonBuilder()
            .setLabel('Đánh Giá')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/channels/1262128190915088495/1267984984619221146');

        const row = new ActionRowBuilder().addComponents(warrantyButton, reviewButton);

        try {
            await mentionedUser.send({ embeds: [thankYouEmbed, reviewEmbed], components: [row] });
        } catch (error) {
            console.error(`Không thể gửi tin nhắn tới ${mentionedUser.tag}`, error);
            await message.channel.send('Có lỗi xảy ra khi gửi tin nhắn đến người dùng.');
        }

        // Xóa tin nhắn gọi lệnh `done`
        await message.delete();

        // Thêm role cho người dùng sau khi hoàn thành đơn hàng
        const roleId = '1262132207112159242'; // ID của vai trò muốn gán
        const member = message.guild.members.cache.get(mentionedUser.id);
        if (member) {
            try {
                await member.roles.add(roleId);
                console.log(`Đã gán role cho ${mentionedUser.tag}`);
            } catch (error) {
                console.error(`Không thể gán role cho ${mentionedUser.tag}`, error);
            }
        } else {
            console.error(`Không tìm thấy thành viên với ID ${mentionedUser.id}`);
        }
    }
};
