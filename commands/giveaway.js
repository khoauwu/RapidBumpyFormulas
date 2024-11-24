const { EmbedBuilder } = require('discord.js');
const emoji = require('../utils/emoji');

module.exports = {
    name: 'giveaway',
    description: 'Tạo một sự kiện giveaway',
    async execute(message, args) {
        // Kiểm tra quyền quản lý tin nhắn
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('Bạn không có quyền quản lý tin nhắn để tạo giveaway!');
        }

        // Kiểm tra đủ tham số
        if (args.length < 4) {
            return message.reply('Cách sử dụng: .giveaway <giải thưởng> <thời gian (ví dụ: 1p, 1h, 1d)> <số người thắng>');
        }

        // Lấy số người thắng
        const winnersCount = parseInt(args.pop());  // Lấy tham số cuối cùng là số người thắng
        if (isNaN(winnersCount)) {
            return message.reply('Vui lòng cung cấp số người thắng hợp lệ.');
        }

        // Lấy thời gian
        const timeInput = args.pop();  // Lấy tham số trước đó là thời gian
        if (!/^\d+[phd]$/.test(timeInput)) { // Kiểm tra định dạng thời gian
            return message.reply('Vui lòng cung cấp thời gian hợp lệ (ví dụ: 1p, 1h, 1d).');
        }

        // Lấy phần thưởng (các tham số còn lại)
        const prize = args.join(' ');  // Kết hợp các phần còn lại thành một chuỗi

        // Xử lý đơn vị thời gian (1p = 1 phút, 1h = 1 giờ, 1d = 1 ngày)
        let timeMultiplier;
        let readableTime;  // Thời gian hiển thị dễ đọc
        const timeUnit = timeInput.slice(-1);  // Lấy ký tự cuối (p, h, d)
        const timeValue = parseInt(timeInput.slice(0, -1));  // Lấy giá trị số (1, 2, 3, ...)

        if (isNaN(timeValue)) {
            return message.reply('Vui lòng cung cấp thời gian hợp lệ (ví dụ: 1p, 1h, 1d).');
        }

        // Kiểm tra đơn vị và chuyển đổi thành mili-giây
        switch (timeUnit) {
            case 'p':  // Phút
                timeMultiplier = timeValue * 60000;  // 1 phút = 60,000 mili-giây
                readableTime = `${timeValue} phút`;
                break;
            case 'h':  // Giờ
                timeMultiplier = timeValue * 60 * 60000;  // 1 giờ = 60 phút
                readableTime = `${timeValue} giờ`;
                break;
            case 'd':  // Ngày
                timeMultiplier = timeValue * 24 * 60 * 60000;  // 1 ngày = 24 giờ
                readableTime = `${timeValue} ngày`;
                break;
            default:
                return message.reply('Đơn vị thời gian không hợp lệ. Vui lòng sử dụng "p" cho phút, "h" cho giờ, hoặc "d" cho ngày.');
        }

        // Lấy thông tin server
        const serverName = message.guild.name;
        const serverIcon = message.guild.iconURL();

        // Tạo embed thông báo giveaway với tên và avatar của server
        const embed = new EmbedBuilder()
            .setAuthor({ name: prize, iconURL: serverIcon })  // Tên tác giả là phần thưởng, icon là avatar của server
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/4470/4470949.png')
            .setDescription(`${emoji.dot} Người tạo: **${message.author}**\n${emoji.dot} Thời gian: **${readableTime}**\n${emoji.dot} Số người thắng: **${winnersCount}**`)
            .setColor('#3498db')
            .setTimestamp();

        // Tag everyone trước khi gửi thông báo giveaway
        await message.channel.send('@everyone');
        const giveawayMessage = await message.channel.send({ embeds: [embed] });

        // Đặt emoji mặc định là emoji đã nhập
        const reactionEmoji = emoji.giveaway; // Sử dụng emoji từ utils

        // Thêm emoji 🎉 để tham gia
        await giveawayMessage.react(reactionEmoji);

        // Xóa tin nhắn của người dùng sau khi gửi thông báo giveaway
        await message.delete();

        // Đợi thời gian đã định trước khi kết thúc giveaway
        setTimeout(async () => {
            const reaction = giveawayMessage.reactions.cache.get(reactionEmoji);

            // Nếu không có ai phản ứng ngoài bot
            if (!reaction || reaction.users.cache.filter(user => !user.bot).size === 0) {
                const cancelEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Giveaway Hủy', iconURL: serverIcon })
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/4470/4470949.png')
                    .setDescription(`**Giải thưởng:** ${prize}\n**Lý do:** Không có người chơi tham gia giveaway.`)
                    .setColor('#e74c3c')  // Màu đỏ cho trạng thái hủy
                    .setTimestamp();

                // Chỉnh sửa embed của giveaway để thông báo đã hủy
                await giveawayMessage.edit({ embeds: [cancelEmbed] });
                return;
            }

            // Lấy người tham gia không phải bot
            const users = await reaction.users.fetch();
            const entrants = users.filter(user => !user.bot).random(winnersCount);

            if (entrants.size === 0) {
                // Không có người tham gia
                const cancelEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Giveaway Hủy', iconURL: serverIcon })
                    .setThumbnail('https://cdn-icons-png.flaticon.com/512/4470/4470949.png')
                    .setDescription(`**Giải thưởng:** ${prize}\n**Lý do:** Không có người chơi tham gia giveaway.`)
                    .setColor('#e74c3c')  // Màu đỏ cho trạng thái hủy
                    .setTimestamp();

                // Chỉnh sửa embed của giveaway để thông báo đã hủy
                await giveawayMessage.edit({ embeds: [cancelEmbed] });
                return;
            }

            // Chọn ngẫu nhiên người thắng
            const winners = entrants.map(user => user.toString()).join(', ');

            // Gửi tin nhắn kết quả giveaway bằng tin nhắn thường
            message.channel.send(`**Chúc mừng!** Người thắng là ${winners}. Giải thưởng: **${prize}**`);
        }, timeMultiplier);
    }
};
