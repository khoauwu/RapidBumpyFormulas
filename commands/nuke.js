// commands/nuke.js
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    description: 'Xóa tất cả tin nhắn trong kênh hiện tại.',
    async execute(message, args, client) {
        // Kiểm tra quyền của người gửi lệnh
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Bạn không có quyền xóa tin nhắn.');
        }

        try {
            // Lấy tin nhắn trong kênh
            const fetched = await message.channel.messages.fetch({ limit: 100 });

            // Xóa tất cả tin nhắn
            await message.channel.bulkDelete(fetched);

            // Gửi thông báo sau khi xóa tin nhắn
            await message.channel.send('Đã dọn sạch tin nhắn.');
        } catch (error) {
            console.error('**Lỗi khi xóa tin nhắn:**', error);
            // Đảm bảo thông báo lỗi không có tham chiếu không hợp lệ
            await message.channel.send('**Có lỗi xảy ra khi xóa tin nhắn**.');
        }
    },
};
