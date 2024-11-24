const { PermissionsBitField, parseEmoji } = require('discord.js');

module.exports = {
    name: 'steal',
    description: 'Thêm emoji vào server với tên ps_<tên_mặc_định>',
    async execute(message, args) {
        // Kiểm tra quyền quản lý emoji của người dùng
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send('Bạn không có quyền quản lý emoji.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Kiểm tra xem có emoji không
        if (!args[0]) {
            return message.channel.send('Vui lòng cung cấp một emoji để thêm vào server.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        const emoji = parseEmoji(args[0]);

        let emojiURL;
        let emojiName;

        // Nếu là custom emoji
        if (emoji && emoji.id) {
            emojiURL = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
            emojiName = emoji.name;
        } else {
            // Nếu là Unicode emoji thì không thể thêm vào server
            return message.channel.send('Không thể lấy emoji từ emoji mặc định của Discord. Vui lòng cung cấp custom emoji.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Đặt tên theo mẫu 'ps_<tên_mặc_định>'
        const customEmojiName = `ps_${emojiName}`;

        try {
            // Thêm emoji vào server
            const addedEmoji = await message.guild.emojis.create({ attachment: emojiURL, name: customEmojiName });
            return message.channel.send(`Emoji đã được thêm thành công với tên: \`${addedEmoji.name}\``);
        } catch (error) {
            console.error(error);
            return message.channel.send('Đã xảy ra lỗi khi thêm emoji. Vui lòng thử lại sau.').then(msg => setTimeout(() => msg.delete(), 5000));
        }
    },
};
