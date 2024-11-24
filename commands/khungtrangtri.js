const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
} = require('discord.js');
const config = require(`../config.json`);
const emoji = require('../utils/emoji');

module.exports = {
    name: 'khungtrangtri',
    execute: (message) => {
        // console.log('khung trang tri');
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Chọn bảng giá')
                .addOptions([
                    {
                        label: 'DARK FANTASY',
                        value: 'khung1',
                        emoji: emoji.darkFantasy,
                    },
                    {
                        label: 'GALAXY',
                        value: 'khung3  ',
                        emoji: emoji.galaxy,
                    },
                    {
                        label: 'ANIME',
                        value: 'khung4',
                        emoji: emoji.anime,
                    },
                    {
                        label: 'LOFIVIBES',
                        value: 'khung5',
                        emoji: emoji.lofivibes,
                    },
                    {
                        label: 'FANTASY',
                        value: 'khung6',
                        emoji: emoji.fantasy,
                    },
                    {
                        label: 'SPTRINGTOON',
                        value: 'khung7',
                        emoji: emoji.sptringtoon,
                    },
                    {
                        label: 'CYPERPUNK',
                        value: 'khung8',
                        emoji: emoji.cyberpunk,
                    },
                    {
                        label: 'ELEMENTS',
                        value: 'khung9',
                        emoji: emoji.elements,
                    },
                    {
                        label: 'PIRATES',
                        value: 'khung10',
                        emoji: emoji.pirates,
                    },
                    {
                        label: 'ACADE',
                        value: 'khung11',
                        emoji: emoji.arcade,
                    },
                    {
                        label: 'SPONGEBOB25',
                        value: 'khung12',
                        emoji: emoji.spongebob25,
                    },
                    {
                        label: 'FEELIN RETRO',
                        value: 'khung13',
                        emoji: emoji.retro,
                    },
                    {
                        label: 'VALORANT',
                        value: 'khung14',
                        emoji: emoji.valorant,
                    },
                    {
                        label: 'DOJO',
                        value: 'khung15',
                        emoji: emoji.dojo,
                    },
                    {
                        label: 'FALL',
                        value: 'khung16',
                        emoji: emoji.fall,
                    },
                    {
                        label: 'AUTUMN EQUINOX',
                        value: 'khung17',
                        emoji: emoji.autumnequinox,
                    },
                    {
                        label: 'STREET FIGHTER',
                        value: 'khung18',
                        emoji: emoji.street,
                    },
                    {
                        label: 'SPOOKY NIGHT',
                        value: 'khung19',
                        emoji: emoji.spooky,
                    },
                    {
                        label: 'DUNGEONS DRAGONS',
                        value: 'khung20',
                        emoji: emoji.dragon,
                    },
                    {
                        label: 'MYTHICAL CREATURES',
                        value: 'khung21',
                        emoji: emoji.fox,
                    },
                ])
        );

        const embed = new EmbedBuilder()
            .setThumbnail(
                'https://cdn.discordapp.com/attachments/1284392505189859339/1296141393579868291/smartphone.png?ex=6711353d&is=670fe3bd&hm=9d947a5469ea574841f363fda6a9b753b8c5a4e1241af40029467f3d5bada17b&'
            )
            .setColor('#CC99FF')
            .setDescription(
                `> ${emoji.dot} Nhấn vào thanh công cụ phía dưới để chọn giá sản phẩm.\n> \n> ${emoji.fire} Cửa hàng nhận thanh toán qua các phương thức **Ngân hàng**, **Momo**, Thẻ cào **(+20% phí gạch thẻ)**\n> \n> ${emoji.dot} Sau khi xem giá nếu muốn mua dịch vụ [vui lòng nhấn vào đây!](https://discord.com/channels/1262128190915088495/1267984880076066910)`
            )
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar server cho footer
            })
            .setAuthor({
                name: 'Bảng Giá Khung Trang Trí',
                iconURL:
                    'https://cdn-icons-png.flaticon.com/512/3900/3900101.png',
            });

        message.channel.send({
            embeds: [embed],
            components: [row],
        });
    },
};
