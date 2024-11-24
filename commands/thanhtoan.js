const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const config = require(`../config.json`);

function parseAmount(amountStr) {
    const match = /^(\d+)(k?)$/i.exec(amountStr);
    if (!match) {
        throw new Error("Invalid amount format");
    }
    let [_, amount, k] = match;
    amount = parseInt(amount);
    if (k === "k") {
        amount *= 1000;
    }
    return amount;
}

function generateRandomString(length) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

module.exports = {
    name: "thanhtoan",
    async execute(message, args) {
        const content = message.content.toLowerCase().trim();

        // Log nội dung tin nhắn
        console.log("Nội dung tin nhắn:", content);

        // Kiểm tra nếu tin nhắn chứa "thanhtoan" hoặc "stk"
        if (!content.includes("thanhtoan") && !content.includes("stk")) return;

        // Tách phần tin nhắn thành các phần tử
        const parts = content.split(/\s+/); // Tách từ dựa trên dấu cách hoặc khoảng trắng
        const command = parts[0]; // Lấy từ khóa đầu tiên (có thể là "thanhtoan" hoặc "stk")
        const amountStr = parts[1] || null; // Nếu có số tiền phía sau, lấy nó
        const productName = parts.slice(2).join(" "); // Phần còn lại của tin nhắn

        let amount;
        let qrUrl;
        const randomPaymentInfo = generateRandomString(10); // Tạo chuỗi ngẫu nhiên 10 ký tự
        const productNameEncoded = productName.replace(/ /g, "");

        if (amountStr) {
            try {
                amount = parseAmount(amountStr);
                qrUrl = `https://img.vietqr.io/image/mbbank-15052799999-compact2.png?amount=${amount}&addInfo=${randomPaymentInfo}%${productNameEncoded}&accountName=LE%20DANG%20KHOA`;
            } catch (error) {
                await message.reply(
                    "Số tiền không hợp lệ. Vui lòng nhập số tiền chính xác (ví dụ: 50000 hoặc 50k).",
                );
                return;
            }
        } else {
            // Không có số tiền, gửi QR mặc định
            qrUrl =
                "https://img.vietqr.io/image/mbbank-15052799999-compact.png";
        }

        // Tạo phần mô tả embed, không hiển thị số tiền nếu không có
        let description = `**Ngân Hàng: MB Bank <:ps_mb:1288759890189226039>\nSố Tài Khoản: \`15052799999\`\nChủ Tài Khoản: LE DANG KHOA <a:ps_succes:1310182870962274344>**`;

        if (amount) {
            const formattedAmount = amount.toLocaleString("vi-VN"); // Định dạng số theo chuẩn Việt Nam
            description += `\n**Số Tiền: ${formattedAmount}đ**`;
        }

        // Tạo embed thanh toán
        const embed = new EmbedBuilder()
            .setTitle("Thông Tin Thanh Toán")
            .setColor("#2d2d31")
            .setDescription(description)
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }), // Lấy avatar server cho footer
            })
            .setImage(qrUrl);

        // Tạo nút "Copy" để sao chép số tài khoản
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("copy-account")
                .setLabel("Copy Số Tài Khoản")
                .setStyle(ButtonStyle.Secondary),
        );
        await message.channel.send(
            `Bạn có thể quét **QR** phía dưới để chuyển tiền hoặc có thể sao chép số tài khoản bằng cách bấm **Copy Số Tài Khoản** để nhập theo cách thủ công!`,
        );

        // Gửi embed kèm theo nút "Copy"
        const replyMessage = await message.channel.send({
            embeds: [embed],
            components: [row],
        });

        // Xử lý sự kiện nhấn nút mà không giới hạn thời gian
        const collector = replyMessage.createMessageComponentCollector();

        collector.on("collect", async (interaction) => {
            if (
                interaction.isButton() &&
                interaction.customId === "copy-account"
            ) {
                await interaction.reply({
                    content: "15052799999",
                    ephemeral: true,
                });
            }
        });
    },
};
