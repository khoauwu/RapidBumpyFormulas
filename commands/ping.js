module.exports = {
    name: 'ping',
    description: 'Gửi tin nhắn riêng về ticket cho một người dùng.',
    async execute(message, args) {
        // Kiểm tra xem có mention user hoặc id không
        if (!args.length) {
            return message.reply("Vui lòng mention một người dùng hoặc nhập ID người dùng.");
        }

        // Lấy thông tin người dùng
        const targetUser = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
        
        if (!targetUser) {
            return message.reply("Không thể tìm thấy người dùng. Vui lòng thử lại với mention hoặc ID.");
        }

        // Lấy kênh hiện tại
        const channel = message.channel;

        // Nội dung tin nhắn riêng
        const dmMessage = `> **<:ps_ticket:1296512200990789682> ${targetUser}, Bạn đang có 1 ticket tại __Pretty Store__**.\n\nNếu bạn không còn **nhu cầu** **mua hàng** hoặc **hỗ trợ** thì **hãy trả lời tại ticket.**\n<:ps_arrow:1296511891933237258> **Đây là kênh ticket của bạn:** ${channel}\n\n<:ps_links:1296511827177508874> **Server Link: https://discord.gg/prettystore **`;

        try {
            // Gửi tin nhắn riêng cho người dùng
            await targetUser.send(dmMessage);

            // Xóa tin nhắn lệnh sau khi thực hiện xong
            await message.delete();
        } catch (error) {
            console.error(`Không thể gửi tin nhắn cho ${targetUser.tag}.`, error);
            await message.reply("Không thể gửi tin nhắn cho người dùng này. Họ có thể đã tắt tin nhắn riêng (DM)!");
        }
    },
};
