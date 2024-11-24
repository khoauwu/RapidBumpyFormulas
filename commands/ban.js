const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Cấm một người dùng khỏi server',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send('Bạn không có quyền cấm người dùng.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ') || 'Không có lý do cụ thể';

        if (!user) {
            return message.channel.send('Vui lòng chỉ định người dùng cần cấm.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        try {
            const member = await message.guild.members.fetch(user.id);
            await member.ban({ reason });
            message.channel.send(`${user.tag} đã bị cấm khỏi server. Lý do: ${reason}`);
        } catch (err) {
            console.error('Lỗi khi cấm người dùng:', err);
            message.channel.send('Đã xảy ra lỗi khi cấm người dùng này.');
        }
    },
};
