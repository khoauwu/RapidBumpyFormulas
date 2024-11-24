const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../config'); // Đảm bảo đường dẫn đúng nếu config.js nằm cùng thư mục với index.js

module.exports = {
    name: 'rename',
    description: 'Đổi tên kênh.',
    async execute(message, args) {
        // Kiểm tra xem tin nhắn có bắt đầu bằng prefix không
        if (!message.content.startsWith(prefix)) return;

        // Kiểm tra quyền quản lý kênh
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('Bạn không có quyền quản lý kênh.');
        }

        // Lấy tên mới cho kênh
        const newName = args.join(' ');
        if (!newName) {
            return message.reply('Vui lòng cung cấp tên mới cho kênh.');
        }

        try {
            // Đổi tên kênh
            await message.channel.setName(newName);

            // Xóa tin nhắn lệnh sau khi đã xử lý
            await message.delete();
        } catch (error) {
            console.error('Lỗi khi đổi tên kênh:', error);

            // Tạo phản hồi lỗi
            await message.reply('Đã xảy ra lỗi khi đổi tên kênh. Vui lòng thử lại.');
        }
    },
};
