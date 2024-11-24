const {
	Client,
	GatewayIntentBits,
	Events,
	Collection,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActivityType,
	ChannelType,
	PermissionFlagsBits,
} = require(`discord.js`);
const {
	createTranscript,
	generateFromMessages,
} = require("discord-html-transcripts");
const { v4: uuidv4 } = require("uuid");
const ticketConfig = require(`./ticket.config.json`);
const fs = require(`fs`);
const path = require(`path`);
require(`dotenv`).config();
const config = require(`./config.json`);
const emoji = require(`./utils/emoji.js`);
const {
	storeTicketToDB,
	getTicketFromDB,
	updateTicket,
	getTickets,
} = require("./utils/db.util.js");

const keep_alive = require("./keep_alive.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
});

client.commands = new Collection();
client.commands.set("rename", require("./commands/rename.js"));
client.config = config;
client.userData = {};
client.commands = new Collection();
client.stickyMessageId = null;
client.setMaxListeners(20); // Điều chỉnh số 20 theo nhu cầu của bạn

const messageDeleteEvent = require("./events/messageDelete");

// Đăng ký sự kiện messageDelete
client.on("messageDelete", messageDeleteEvent.execute);

// Kênh mặc định để gửi thông báo lỗi
const errorChannelId = "1305922161864736782";
// Bắt lỗi không được xử lý (uncaught exceptions)
process.on("uncaughtException", async (error) => {
	console.error("Đã có lỗi xảy ra:", error);
	try {
		const channel = await client.channels.fetch(errorChannelId);
		await channel.send(`**Lỗi không được bắt:**\n\`\`\`${error.stack}\`\`\``);
	} catch (err) {
		console.error("Không thể gửi thông báo lỗi:", err);
	}
});

// Bắt lỗi promise không được xử lý (unhandled rejections)
process.on("unhandledRejection", async (reason, promise) => {
	console.error("Lỗi promise không được xử lý:", reason);
	try {
		const channel = await client.channels.fetch(errorChannelId);
		await channel.send(
			`**Lỗi promise không được xử lý:**\n\`\`\`${reason}\`\`\``,
		);
	} catch (err) {
		console.error("Không thể gửi thông báo lỗi:", err);
	}
});

client.once("ready", () => {
	console.log(`Bot đã sẵn sàng! Đăng nhập dưới tên: ${client.user.tag}`);
});

// Ví dụ một lệnh có thể gây lỗi
client.on("messageCreate", async (message) => {
	if (message.content === "!error") {
		// Gây lỗi giả lập
		throw new Error("Lỗi giả lập!");
	}
});

// Đọc các lệnh từ thư mục `commands`
const commandFiles = fs
	.readdirSync(path.join(__dirname, `commands`))
	.filter((file) => file.endsWith(`.js`));

for (const file of commandFiles) {
	const filePath = path.join(__dirname, `commands`, file);
	const command = require(filePath);
	client.commands.set(command.name, command);
}

// Xử lý sự kiện thành viên gia nhập server
client.on(Events.GuildMemberAdd, async (member) => {
	if (member.user.bot) return; // Bỏ qua bot
	const embed = new EmbedBuilder()
		.setColor("#CC99FF")
		.setThumbnail("https://cdn-icons-png.flaticon.com/512/9385/9385289.png")
		.setImage(
			"https://cdn.discordapp.com/attachments/1262131507636473856/1278935974327484456/Video_chua_at_ten_uoc_tao_bang_Clipchamp.gif?ex=66d29d71&is=66d14bf1&hm=52c399c06112e6e40b8c659932e79e376e604732d5e5c0414ca2f95a1fa92fe8&",
		)
		.setTitle("Xác Minh Tài Khoản")
		.setDescription(
			`> ${emoji.dot} Nhấn vào nút **"Xác Minh"** phía dưới để xác minh tài khoản tại cửa hàng\n> \n> ${emoji.dot} Sau khi bạn **Xác minh** bạn sẽ có được role thấy được bảng giá và kênh mua hàng.\n> \n> ${emoji.dot} Nội dung xác minh sẽ không ảnh hưởng tới tài khoản của bạn. Nó chỉ giúp cửa hàng nếu bị **Discord** xóa thì bên mình sẽ mời các bạn vào **máy chủ** mới.`,
		);

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("cachmuahang")
			.setEmoji("<:ps_shop:1274435956296122594>")
			.setLabel("Cách Mua Hàng")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setLabel("Xác Minh")
			.setEmoji("<:ps_qr:1271390305282949130>")
			.setURL(
				"https://discord.com/oauth2/authorize?client_id=1262133297920610405&redirect_uri=https://restorecord.com/api/callback&response_type=code&scope=identify+guilds.join+email&state=1262128190915088495",
			)
			.setStyle(ButtonStyle.Link),
	);

	try {
		await member.send({ embeds: [embed], components: [row] });
	} catch (error) {
		console.error("Lỗi khi gửi tin nhắn đến thành viên:", error);
	}
});

// Xử lý các tương tác từ người dùng
client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isStringSelectMenu()) {
		const { values } = interaction;
		let embed;

		// Lấy thông tin người yêu cầu
		const user = interaction.user;

		switch (values[0]) {
			case `nitrogift`:
				embed = new EmbedBuilder()
					.setDescription(
						`${emoji.discordLogo} **NITRO 1 THÁNG**\n> ${emoji.nichobasic} Nitro **Basic** Login : **37K**\n> ${emoji.nichoboost} Nitro **Boost** Login : **88K**\n\n${emoji.discordLogo} **NITRO 1 NĂM**\n> ${emoji.nichobasic} Nitro **Basic** Login : **35OK**\n> ${emoji.nichoboost} Nitro **Boost** Login : **75OK**\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Bảo hành suốt quá trình sử dụng\n${emoji.dot} Nitro sẽ có trong vòng **5 - 10** phút (chậm nhất là **2 - 3** tiếng)\n\n**Yêu cầu khi mua :**\n\n${emoji.dot} Cung cấp mã **2FA**\n${emoji.dot}  Không có **Nitro** đang hoạt động trong tài khoản.`,
					)
					.setColor(`#2d2d31`) // Màu vàng
					.setImage(
						`https://media.discordapp.net/attachments/1262131507636473856/1268557708722704405/62a281f083081c68ebb94672_Discord_HQ_-_3.png?ex=66bab3ae&is=66b9622e&hm=72af25aa1753ea1a08acdad90fa475bd9ef944b17db2a2dca795415523553c4d&`,
					)
					.setThumbnail(`https://cdn3.emoji.gg/emojis/3226-boost-12-months.png`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setAuthor({
						name: `NITRO BOOST - CHÍNH HÃNG`,
						iconURL: `https://cdn3.emoji.gg/emojis/6405-discord-boost.png`,
					});
				break;
			case `nitrotrial`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.nichoboost} Nitro Boost **3 THÁNG** Lần Đầu : **40K**\n\n**Yêu cầu khi mua :**\n\n${emoji.dot} Tài khoản phải tạo trên **30 ngày**.\n${emoji.dot} Yêu cầu tài khoản chưa sử dụng **Nitro Boost** & **Nitro Basic** lần nào.\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Bảo hành trong suốt quá trình sử dụng\n${emoji.dot} Không có khả năng bị thu hồi **Nitro**.`,
					)
					.setColor(`#2d2d31`) // Màu xanh dương
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1262131507636473856/1268559589612458035/retirer-l-emballage-des-autocollants-BANNER.png?ex=66bab56e&is=66b963ee&hm=85de1d33a4b0dcf1f6af3fa7156f5585a5641cfa6c488a349f1053cbfa225d1b&`,
					)
					.setThumbnail(
						`https://emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG`,
					)
					.setAuthor({
						name: `NITRO BOOST LẦN ĐẦU - CHÍNH HÃNG`,
						iconURL: `https://cdn3.emoji.gg/emojis/8189-wumpus-ooo.png`,
					});
				break;
			case `boostserver`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.discordLogo} 2 Boost **(Lever 1)** : **3OK**\n> ${emoji.discordLogo} 8 Boost **(Lever 2)** : **11OK**\n> ${emoji.discordLogo} 14 Boost **(Lever 3)** : **19OK**\n\n**Yêu cầu trước khi mua :**\n\n${emoji.dot} Kick hết những con bot bảo vệ máy chủ, chóng raid. Sau khi hoàn thành đơn hàng có thể mời nó vào.\n${emoji.dot} Không được kick tài khoản đã nâng cấp máy chủ của bạn.\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Bảo hành trong suốt quá trình sử dụng đến khi hết thời hạn\n\n${emoji.dot} Không bảo hành những trường hợp như kick tài khoản đã nâng cấp máy chủ... **(tùy trường hợp có thể bảo hành được)**`,
					)
					.setColor(`#2d2d31`) // Màu hồng
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1262131507636473856/1268557646169112708/64f8ce1927fcd30fdfe80a56_23_117_Xbox_Social_1800x720.png?ex=66bab39f&is=66b9621f&hm=5d593beda767b6aa5e99c8f920f5bb482daa1dbe65d5a165e76454f7be723db1&`,
					)
					.setThumbnail(`https://cdn3.emoji.gg/emojis/1964-wumpuswavehi.png`)
					.setAuthor({
						name: `NÂNG CẤP MÁY CHỦ - CHÍNH HÃNG`,
						iconURL: `https://cdn3.emoji.gg/emojis/1214-wumpus-popcorn.png`,
					});
				break;
			case `buffmember`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.discordLogo}**1000** Member **Offline** : **8OK**\n> ${emoji.discordLogo} **1000** Member **Online** : **1OOK**\n\n**Yêu cầu trước khi mua :**\n\n${emoji.dot} Kick hết những con bot bảo vệ máy chủ, chóng raid. Sau khi hoàn thành đơn hàng có thể mời nó vào.\n${emoji.dot} Nếu mua dịch vụ **Member Online** cam kết online 24/7.\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Bảo hành trong suốt quá trình sử dụng đến khi hết thời hạn\n\n${emoji.dot} Những trường hợp không tắt hoặc kick những bot bảo vệ máy chủ, bot kick member vào server thì sẽ không được bảo hành... **(tùy trường hợp có thể bảo hành được)**`,
					)
					.setColor(`#2d2d31`) // Màu hồng
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setThumbnail(
						`https://cdn-icons-png.flaticon.com/512/7186/7186404.png`,
					)
					.setAuthor({
						name: `BUFF THÀNH VIÊN CHO MÁY CHỦ`,
						iconURL: `https://cdn-icons-png.flaticon.com/512/3686/3686930.png`,
					});
				break;
			case `spotify`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.spotify} 1 Tháng : **17K**\n> ${emoji.spotify} 6 Tháng : **160K**\n> ${emoji.spotify} 1 Năm : **260K**\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Bảo hành đến hết thời hạn sử dụng\n${emoji.dot} Premium được up thẳng vào tài khoản chính của bạn\n${emoji.dot} Cam kết chính hãng và an toàn.\n\n**Yêu cầu khi mua :**\n\n${emoji.dot} Tài khoản phải là tài khoản đăng kí của Spotify, không phải đăng nhập Facebook hoặc Google\n${emoji.dot} Tài khoản có Email chính chủ và tồn tại.`,
					)
					.setColor(`#2d2d31`) // Màu xanh của Spotify
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1262131507636473856/1268560437197279263/Spotify-Stock-Image-2021-1024x437-1.webp?ex=66bab638&is=66b964b8&hm=81ce51269fa497eb6827aa6c38dc8ca2d8a545884a526332bf52f1843a06aaaa&`,
					)
					.setThumbnail(
						`https://images-ext-1.discordapp.net/external/NfTH7lYAk_7gHeJWfaheONwlQieF8iWaUNAXHkI_KSY/%3Ff%3Dwebp/https/cdn3d.iconscout.com/3d/premium/thumb/spotify-3d-icon-download-in-png-blend-fbx-gltf-file-formats--logo-social-media-logos-brand-pack-design-development-icons-9148183.png?format=webp&quality=lossless&width=562&height=562`,
					)
					.setAuthor({
						name: `SPOTIFY PREMIUM - CHÍNH HÃNG`,
						iconURL: `https://cdn3d.iconscout.com/3d/premium/thumb/spotify-3d-icon-download-in-png-blend-fbx-gltf-file-formats--logo-social-media-logos-brand-pack-design-development-icons-9148183.png?f=webp`,
					});
				break;
			case `youtube`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.youtube} 1 Tháng : **1OK**\n> ${emoji.youtube} 6 Tháng : **120K**\n> ${emoji.youtube} 1 Năm : **220K**\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Premium được up thẳng vào tài khoản của bạn\n${emoji.dot} Bảo hành suốt quá trình sử dụng đến hết thời hạn\n\n**Yêu cầu khi mua :**\n${emoji.dot} Tài khoản chưa từng sử dụng Premium Family lần nào.`,
					)
					.setColor(`#2d2d31`) // Màu đỏ của YouTube
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1262131507636473856/1268560437549465661/Content-Blog-Banner_Q4-2023_1125x600_47_YouTube-Premium.png?ex=66bab639&is=66b964b9&hm=0190b18e9da480a5013ed70763aa6d4a857184f218d80372c43a644b0cd54109&`,
					)
					.setThumbnail(
						`https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png`,
					)
					.setAuthor({
						name: `YOUTUBE PREMIUM - CHÍNH HÃNG`,
						iconURL: `https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png`,
					});
				break;
			case "netflix":
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.netflix} 1 Tháng : **55K**\n> ${emoji.netflix} 3 Tháng : **15OK**\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Sử dụng đúng profile được chỉ định và **không được thay đổi bất cứ gì trong tài khoản**\n${emoji.dot} Bảo hành suốt quá trình sử dụng đến hết thời hạn\n\n**Thông tin bổ sung :**\n\n${emoji.dot} Chất lượng **4K FULL HD**\n${emoji.dot} Mỗi tài khoản chỉ được đăng nhập **1 thiết bị và xem cùng 1 lúc, bạn có thể xem bất cứ thiết bị gì như Điện thoại, Máy tính, TV.**\n\n${emoji.dot} Dùng đúng profile được chỉ định và **không được thay đổi bất cứ gì trong tài khoản**`,
					)
					.setColor("#2d2d31") // Màu đỏ của YouTube
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						"https://www.whats-on-netflix.com/wp-content/uploads/2022/01/netflix-2021-library-numbers-1.png",
					)
					.setThumbnail(
						"https://www.pngall.com/wp-content/uploads/4/N-Netflix-Logo-Icon.png",
					)
					.setAuthor({
						name: "NETFLIX PREMIUM VIỆT NAM 4K FULL HD",
						iconURL:
							"https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/227_Netflix_logo-512.png",
					});
				break;
			case `canva`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.canva} 1 Tháng : **20K**\n> ${emoji.canva} 1 Năm : **12OK**\n\n**Chính sách bảo hành :**\n\n${emoji.dot} Bảo hành trong suốt quá trình sử dụng\n${emoji.dot} Nâng cấp up thẳng vào tài khoản chính chủ của bạn`,
					)
					.setColor(`#2d2d31`) // Màu của Canva
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://static-cse.canva.com/_next/static/assets/logo_w2000xh641_549791f627e17b8cd987be08a60dbd049233a0e4395c6b32b601cd6abbfcdcc1.png`,
					)
					.setThumbnail(
						`https://kbtech.com.vn/wp-content/uploads/2023/12/canva-pro-icon-1.png`,
					)
					.setAuthor({
						name: `CANVA PRO - CHÍNH HÃNG`,
						iconURL: `https://img.icons8.com/stickers/512/canva.png`,
					});
				break;
			case `cow`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.owo} **Tài khoản trữ COW Lever 20 - 25 : 86K**\n\n**__GHI CHÚ__** : Tài khoản random từ lever 20 đến lever 25 và có thể đổi thông tin.`,
					)
					.setColor(`#2d2d31`) // Màu của OWO
					.setImage(`https://example.com/owo.png`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setThumbnail(
						`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcR1r4Q1684m-kjTRmz5gm59rLr6-H7OR03Q&s`,
					)
					.setAuthor({
						name: `TÀI KHOẢN TRỮ OWO`,
						iconURL: `https://itempazar.b-cdn.net/uploads/post_images/vip-owo-huntbot-otomatik-para-kasma-21778893.jpg`,
					});
				break;
			case `owo`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.owo} 1M **OwO** : **7,5K**\n> ${emoji.owo} 1OM **OwO** : **75K**\n> ${emoji.owo} 3OM **Owo** : **225K**\n\n**__GHI CHÚ__** : Rate tăng và giảm tùy theo thị trường. Mua 100m càng giảm sâu.`,
					)
					.setColor(`#2d2d31`) // Màu của OWO
					.setImage(`https://example.com/owo.png`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setThumbnail(
						`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcR1r4Q1684m-kjTRmz5gm59rLr6-H7OR03Q&s`,
					)
					.setAuthor({
						name: `BẢNG GIÁ OWO CASH`,
						iconURL: `https://itempazar.b-cdn.net/uploads/post_images/vip-owo-huntbot-otomatik-para-kasma-21778893.jpg`,
					});
				break;
			case `chatgpt`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.chatgpt} Chat GPT 1 Tháng **Dạng Add Thẳng Vào Tài Khoản** : **35Ok**\n\n${emoji.dot} Nâng cấp thẳng vào tài khoản của bạn.\n${emoji.dot} Bảo hành 1 tháng`,
					)
					.setColor(`#2d2d31`) // Màu xanh của ChatGPT
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cms.boardmix.com/images/kr/articles/2023/skills/ai-chatbot01.png`,
					)
					.setThumbnail(
						`https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/2048px-ChatGPT_logo.svg.png`,
					)
					.setAuthor({
						name: `CHAT GPT - CẤP TÀI KHOẢN`,
						iconURL: `https://www.freepnglogos.com/uploads/logo-chatgpt-png/round-graphic-design-chatgpt-logo-green-png-17.png`,
					});
				break;
			case `duolingo`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.duolingo} Duolingo Super **1 Năm **: **16Ok**\n\n${emoji.dot} Nâng cấp thẳng vào tài khoản của bạn.\n${emoji.dot} Bảo hành đầy đủ 1 năm\n${emoji.dot} Có thể sẽ lâu vì cần phải tìm đủ slot sốp mới có hàng cho bạn`,
					)
					.setColor(`#2d2d31`) // Màu xanh của ChatGPT
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://images.seeklogo.com/logo-png/52/1/duolingo-logo-png_seeklogo-526568.png`,
					)
					.setThumbnail(`https://img.icons8.com/doodle/200/duolingo-logo.png`)
					.setAuthor({
						name: `Duolingo Super`,
						iconURL: `https://pnghq.com/wp-content/uploads/duolingo-symbol-icon-logo-png-transparent-svg-vector.png`,
					});
				break;

			case `ggone`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.ggone} **GÓI 1OOGB**: **165k**\n> ${emoji.ggone} **GÓI 2OOGB** : **21Ok**\n> ${emoji.ggone} **GÓI 1TB** : **255k**\n> ${emoji.ggone} **GÓI 2TB** : **315k**\n\n${emoji.dot} Nâng cấp dung lượng thẳng vào tài khoản của bạn.\n${emoji.dot} Bảo hành đầy đủ trong suốt thời gian sử dụng\n${emoji.dot} Nâng cấp theo dạng add vào Family`,
					)
					.setColor(`#2d2d31`) // Màu xanh của ChatGPT
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.mos.cms.futurecdn.net/ycyQaMY2uaXWCaANMjUUMQ.jpg`,
					)
					.setThumbnail(
						`https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/69-GoogleDrive_google_drive-512.png`,
					)
					.setAuthor({
						name: `Google One`,
						iconURL: `https://cdn1.iconfinder.com/data/icons/google-new-logos-1/32/google_search_new_logo-512.png`,
					});
				break;

			case `window`:
				embed = new EmbedBuilder()
					.setDescription(
						`> ${emoji.window} **Key Windows 10/11 Pro Volume** : **55k**\n\n${emoji.dot} Nâng cấp thông qua Ultraview / Teamview\n${emoji.dot} Liên kết với tài khoản Microsoft của bạn`,
					)
					.setColor(`#2d2d31`) // Màu xanh của ChatGPT
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://nforceit.com.au/wp-content/uploads/2023/09/nforceit-partner-microsoft-logo.png`,
					)
					.setThumbnail(
						`https://static-00.iconduck.com/assets.00/windows-legacy-icon-2048x1827-pvxpysg1.png`,
					)
					.setAuthor({
						name: `Windows 10/11 Pro`,
						iconURL: `https://img.icons8.com/color/200/microsoft.png`,
					});
				break;

			case `dichvukhac`:
				embed = new EmbedBuilder()
					.setDescription(
						`${emoji.dichvukhac}** Để xem được toàn bộ giá và nhiều dịch vụ khác của Pretty Store thì bạn vui lòng truy cập vào máy chủ bên dưới nhé !** || https://discord.gg/crfBT6CcZT ||`,
					)
					.setColor(`#2d2d31`) // Màu xám
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(`https://example.com/dichvukhac.png`)
					.setThumbnail(`https://example.com/dichvukhac_thumbnail.png`)
					.setAuthor({
						name: `Dịch Vụ Khác`,
						iconURL: client.user.displayAvatarURL(),
					});
				break;
			case `khung1`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261997161646915584/image.png?ex=66bf2df2&is=66bddc72&hm=50fa1dd2d608047d44464f56fe2c74abb7f65871fb08594e4688dfff16d5fa64c&`,
					)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setAuthor({
						name: `CHỦ ĐỀ : DARK FANTASY`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung3`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261994519390322749/Galaxy.png?ex=66bf2b7c&is=66bdd9fc&hm=28a10d94364b168d639c5260ac96acdc6555f98602b386acc8f6febc7226c406&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : GALAXY`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung4`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1177628762800672823/1261994434640220210/Anime.png?ex=66dcd527&is=66db83a7&hm=e488f1aa63049f43c655fbd18054e0a708a130908112b6aac160d22e7bcdb46b&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : ANIME`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung5`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261994545609179146/Untitled.png?ex=66dcd542&is=66db83c2&hm=3dc8ab40e89f18128c9dde4a5db2e35b10e7dbbc077410083ada431d2235bc9e&=&format=webp&quality=lossless&width=1300&height=286`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : LOFIVIBES`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung6`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261994509441433600/Fantasy.png?ex=66bf2b79&is=66bdd9f9&hm=55ef1d4e89502a8736d91ec9682fbfda86d10263e0cf44e7f06f5afc3cb78af6&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : FANTACY`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung7`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261994527921672242/Spring.png?ex=66bf2b7e&is=66bdd9fe&hm=1b6cd34e9aa7ee143259f48ac1bec47ce12dcc46655e663d80137024e4b2aa1d&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : SPTRINGTOON`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **9O.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **9O.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **1OO.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **1OO.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung8`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261994462259707934/Cyberpunk.png?ex=66bf2b6e&is=66bdd9ee&hm=50f24f10e8ac01a26fb409c5c223f50c75ae57300d3d0dabfb295853435ad7fb&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : CYPERPUNK`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung9`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1261994489870815232/El-mnts.png?ex=66bf2b75&is=66bdd9f5&hm=069f6b8fa7ee9195b88733add65bfc30bd42510e174d1e70b91a77f5184d0140&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : ELEMENTS`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung10`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1265337097435480125/image.png?ex=66da7dc0&is=66d92c40&hm=1b53b9aff3e01613324ee632bb1df7eaea005bde36e861d2f9a4a0f2fe7e8018&  `,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : PIRATES`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung11`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1265337326628765728/image.png?ex=66bf7737&is=66be25b7&hm=8e59b2a0b2ffadf50c9fc4b51ceba460a9b5275460d5b087a0be0b3ded653ebf&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : ACADE`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung12`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1177628762800672823/1265333884715794512/image.png?ex=66bf7402&is=66be2282&hm=e4564eca703c6727fcd94c3ced2fb84d0e82c46e9119e1ab081471814b616d54&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : SPONBOB25`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **9O.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **9O.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **1OO.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **1OO.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung13`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1135587001903632454/1268384507493351517/image.png?ex=66c00120&is=66beafa0&hm=d2a3b7a50384b49b8a71f1640ae86fc3e29f5c0804bdaa1c57025efea812eb27&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : FEELIN RETRO`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung14`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1262131507636473856/1275897544509095976/image.png?ex=66c78faf&is=66c63e2f&hm=6ba985932eba68a199ca1218458da98c69501bd642956a7024a294708f45e8a6&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : VALORANT`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **95.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **95.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n${emoji.dot} Khung Avatar :**1O5.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **1O5.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung15`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1262131507636473856/1275897624334962719/image.png?ex=66c78fc2&is=66c63e42&hm=0711d315c79e88522aa76ad94c65969fa7dc926924a8f4a40e4352e180f46b4b&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : DOJO`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung16`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1266634445365186580/1286328286552789022/image.png?ex=66ed8212&is=66ec3092&hm=37386cb60ff34a374c7b68580f62d528803e63fc84be85a491f6355fa0d798e5&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : FALL`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;

			case `khung17`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1266634445365186580/1286328476042793072/image.png?ex=66ed823f&is=66ec30bf&hm=28983ce72e0aa9159ee80381e9e08145bb3d3146e937966663e98771b61b1521&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : AUTUMN EQUINOX`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung18`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1262131507636473856/1288748062176579668/456BE5C2-EB40-4164-9596-FECF24B44BBD.png?ex=66f64fa9&is=66f4fe29&hm=a10273365a16635c8be838b3cf1c0e7f02ac15211303d934b1f3ea93a65e19c0&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : STREET FIGHTER`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **9O.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **9O.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n${emoji.dot} Khung Avatar :**1OO.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **1OO.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung19`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://media.discordapp.net/attachments/1266634445365186580/1291275351728848948/image.png?ex=66ff8162&is=66fe2fe2&hm=b2bf98fb45cf6cd462e7ac1d1e89d513bd32043c80e38c84a61187cfe3ac97ba&=&format=webp&quality=lossless&width=756&height=160`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : SPOOKY NIGHT`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung20`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1262131507636473856/1301438384601829376/image.png?ex=67247a72&is=672328f2&hm=a9851a3040915cde3ed4bab2eb5a6670fddff63911598dabb3703e073d996c2c&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : DUNGEONS DRAGONS`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **90.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **90.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **100.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **100.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			case `khung21`:
				embed = new EmbedBuilder()
					.setColor(`2d2d31`)
					.setFooter({
						text: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setImage(
						`https://cdn.discordapp.com/attachments/1262131507636473856/1301439723369267220/image.png?ex=67247bb1&is=67232a31&hm=6d6ec45ef3ed2cbae933f07f9f36898f067faaefd63bf27acc5326202c5f2dbc&`,
					)
					.setAuthor({
						name: `CHỦ ĐỀ : MYTHICAL CREATURES`,
						iconURL: `https://images-ext-1.discordapp.net/external/1WuJq5VfqLkO6y0MfgmHxcT7bZr2tEFWUCqe-h6tkL0/https/emoji.discadia.com/emojis/ec1c7250-3e6b-4731-bb7b-fffeeffed600.PNG?format=webp&quality=lossless&width=160&height=152`, // Ảnh đại diện của tác giả
					})
					.setDescription(
						`**CÓ NITRO**\n\n${emoji.dot} Khung Avatar : **35.OOO VND**\n${emoji.dot} Hiệu Ứng Hồ Hơ : **35.OOO VND**\n\n**KHÔNG CÓ NITRO**\n\n ${emoji.dot} Khung Avatar : **45.OOO VND**\n ${emoji.dot} Hiệu Ứng Hồ Hơ : **45.OOO VND**\n\n[Nhấn vào đây để xem hiệu ứng!](https://discord.com/shop)`,
					);
				break;
			default:
				embed = new EmbedBuilder()
					.setDescription(`Vui lòng chọn một sản phẩm hợp lệ.`)
					.setColor(`#FF0000`) // Màu đỏ cảnh báo
					.setAuthor({
						name: `Sản phẩm không xác định`,
						iconURL: client.user.displayAvatarURL(),
					});
		}
		const linkButton = new ButtonBuilder()
			.setLabel(`Mua, gia hạn dịch vụ`) // Tên nút
			.setEmoji(`${emoji.cart}`)
			.setURL(
				`https://discord.com/channels/1262128190915088495/1267984880076066910`,
			) // URL mà nút sẽ dẫn đến
			.setStyle(ButtonStyle.Link); // Kiểu của nút là Link

		// Tạo một hàng hành động (Action Row)
		const row = new ActionRowBuilder().addComponents(linkButton);

		interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true, // Đảm bảo row được sử dụng đúng cách ở đây
		});
	} else if (interaction.isButton()) {
		if (interaction.customId === `cachmuahang`) {
			const embed = new EmbedBuilder()
				.setColor(`#CC99FF`)
				.setTitle(`Cách Mua Hàng`)
				.setDescription(
					`${emoji.dot} **Bước 1 **: Ấn vào kênh này https://discord.com/channels/1262128190915088495/1267984880076066910\n${emoji.dot} **Bước 2** : Nhấn vào nút Mua Hàng sau đó nhập tên dịch vụ bạn cần mua/thuê tại ô trống.\n${emoji.dot} **Bước 3 **: Pretty Store sẽ mở 1 kênh riêng để bạn có thể chat/nhắn tin với admin. Bạn có thể chat vào kênh đó để được tư vấn và mua hàng nhé.`,
				);

			try {
				await interaction.reply({ embeds: [embed], ephemeral: true });
			} catch (error) {
				console.error(`Lỗi khi gửi phản hồi tương tác:`, error);
			}
		} else if (interaction.customId === `baohanh`) {
			const command = client.commands.get(`ticket`);
			if (command) {
				await command.baohanhInteraction(interaction);
			}
		} else if (interaction.customId === `muahang`) {
			const command = client.commands.get(`ticket`);
			if (command) {
				await command.muahangInteraction(interaction);
			}
		} else if (interaction.customId.startsWith(`dongTicketBH:`)) {
			const ticketId = interaction.customId.split(":")[1];

			// Kiểm tra xem người dùng có quyền đóng ticket không
			if (
				interaction.user.id !== ticketConfig.ownerId &&
				!ticketConfig.supportIds.includes(interaction.user.id)
			) {
				await interaction.reply({
					content: "Bạn không có quyền đóng ticket này.",
					ephemeral: true,
				});
				return;
			}

			const channel = interaction.channel;

			// Lấy thông tin ticket từ db
			const ticket = await getTicketFromDB(ticketId);
			if (!ticket) {
				await interaction.reply({
					content: "Không tìm thấy thông tin ticket.",
					ephemeral: true,
				});
				return;
			}

			// Tạo transcript
			const transcript = await createTranscript(channel, {
				limit: -1,
				fileName: `transcript.html`,
				poweredBy: false,
			});

			// Gửi transcript cho user
			try {
				const user = await interaction.client.users.fetch(ticket.userId);

				const closingTime = new Date().toLocaleString("vi-VN", {
					timeZone: "Asia/Ho_Chi_Minh",
				});
				const closedBy = interaction.user.tag; // Người đóng ticket

				const embed = new EmbedBuilder()
					.setColor("#CC99FF")
					.setTitle("Bản sao lưu ticket của bạn")
					.setDescription(
						"Dưới đây là bản sao lưu ticket của bạn, vui lòng kiểm tra nếu bạn cần lấy thông tin gì trong kênh ticket cũ mà không kịp lấy thì hãy tải nó xuống.",
					)
					.setTimestamp()
					.addFields(
						{
							name: "Người đóng ticket",
							value: closedBy,
							inline: true,
						},
						{
							name: "Ngày và giờ đóng",
							value: closingTime,
							inline: true,
						},
					);

				await user.send({
					embeds: [embed],
					files: [transcript], // Giả sử transcript là tệp bạn muốn gửi
				});
			} catch (error) {
				console.error("Không thể gửi transcript cho user:", error);
			}

			try {
				await interaction.update({
					content: `Ticket đã được đóng.`,
					components: [],
				});

				// Đánh dấu kết thúc ticket trong kênh
				await channel.send(`Ticket đang được đóng trong \`vài giây tới\``);

				await updateTicket(ticketId, {
					...ticket,
					status: "closed",
				});
				await channel.delete();
			} catch (error) {
				console.error("Lỗi đóng ticket:", error);
			}
		} else if (interaction.customId.startsWith(`dongTicketMH:`)) {
			const ticketId = interaction.customId.split(":")[1];

			// Kiểm tra xem người dùng có quyền đóng ticket không
			if (
				interaction.user.id !== ticketConfig.ownerId &&
				!ticketConfig.supportIds.includes(interaction.user.id)
			) {
				await interaction.reply({
					content: "Bạn không có quyền đóng ticket này.",
					ephemeral: true,
				});
				return;
			}

			const channel = interaction.channel;

			// Lấy thông tin ticket từ db
			const ticket = await getTicketFromDB(ticketId);
			if (!ticket) {
				await interaction.reply({
					content: "Không tìm thấy thông tin ticket.",
					ephemeral: true,
				});
				return;
			}

			// Tạo transcript
			const transcript = await createTranscript(channel, {
				limit: -1,
				fileName: `transcript.html`,
				poweredBy: false,
			});

			// Gửi transcript cho user
			try {
				const user = await interaction.client.users.fetch(ticket.userId);

				const closingTime = new Date().toLocaleString("vi-VN", {
					timeZone: "Asia/Ho_Chi_Minh",
				});
				const closedBy = interaction.user.tag; // Người đóng ticket

				const embed = new EmbedBuilder()
					.setColor("#CC99FF")
					.setThumbnail(
						"https://media.discordapp.net/attachments/1262131507636473856/1298622031365144587/wweee.png?ex=671a3b83&is=6718ea03&hm=d8d6318606dbfd7c47e9e808140f30faee64fa64b07474c7c3b452fc74891443&",
					)
					.setAuthor({
						name: `Bảng sao lưu ticket của bạn`, // Đặt tên cho tác giả
						iconURL:
							"https://cdn-icons-png.freepik.com/256/6030/6030249.png?semt=ais_hybrid", // Lấy avatar của bot cho tác giả
					})
					.setDescription(
						"Dưới đây là bản sao lưu ticket của bạn, vui lòng kiểm tra nếu bạn cần lấy thông tin gì trong kênh ticket cũ mà không kịp lấy thì hãy tải nó xuống.",
					)
					.setTimestamp()
					.addFields(
						{
							name: "Người đóng ticket",
							value: closedBy,
							inline: true,
						},
						{
							name: "Ngày và giờ đóng",
							value: closingTime,
							inline: true,
						},
					);

				await user.send({
					embeds: [embed],
					files: [transcript], // Giả sử transcript là tệp bạn muốn gửi
				});
			} catch (error) {
				console.error("Không thể gửi transcript cho user:", error);
			}

			try {
				await interaction.update({
					content: `Ticket đã được đóng.`,
					components: [],
				});

				// Đánh dấu kết thúc ticket trong kênh
				await channel.send(`Ticket đang được đóng trong \`vài giây tới\``);

				await updateTicket(ticketId, {
					...ticket,
					status: "closed",
				});
				await channel.delete();
			} catch (error) {
				console.error("Lỗi đóng ticket:", error);
			}
		}
	} else if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);
		if (command) {
			try {
				await command.execute(interaction, client);
			} catch (error) {
				console.error(`Lỗi khi thực hiện lệnh:`, error);
				await interaction.reply(`Có lỗi xảy ra khi thực hiện lệnh này.`);
			}
		}
	} else if (interaction.isModalSubmit()) {
		if (interaction.customId === `baohanhModal`) {
			// Kiem tra spam
			const ticketsByUser = await getTickets(interaction.user.id);
			const now = new Date();
			const ticketsByUserInLimitTime = ticketsByUser.filter(
				(ticket) => now - new Date(ticket.createdAt) < ticketConfig.limitTime,
			);
			if (ticketsByUserInLimitTime.length >= ticketConfig.limitOpenTicket) {
				await interaction.reply({
					content: `Bạn đã gửi quá nhiều ticket, vui lòng thử lại sau!`,
					ephemeral: true,
				});
				return;
			}

			const productName = interaction.fields.getTextInputValue(`productName`);
			await interaction.reply({
				content: `Ticket đang được tạo...`,
				ephemeral: true,
			});

			const ticketChannelName = `ticket-${interaction.user.username.toLowerCase()}`;
			const permissionOverwrites = [
				{
					id: interaction.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				},
				...ticketConfig.supportIds.map((supportId) => ({
					id: supportId,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				})),
			];
			const ticketChannel = await interaction.guild.channels.create({
				name: ticketChannelName,
				type: ChannelType.GuildText,
				permissionOverwrites: permissionOverwrites,
				parent: ticketConfig.thumucbaohanhId,
			});
			await interaction.editReply({
				content: `${emoji.success} Ticket đã được tạo ${ticketChannel}`,
			});

			const ticketId = uuidv4(); // Tạo một ID duy nhất cho ticket

			const ticketEmbed2 = new EmbedBuilder()
				.setColor(`#CC99FF`)
				.setAuthor({
					name: `Sản phẩm bạn cần bảo hành là gì?`, // Đặt tên cho tác giả
					iconURL: "https://cdn-icons-png.flaticon.com/512/5469/5469933.png", // Lấy avatar của bot cho tác giả
				})
				.setDescription(`\`\`\`${productName}\`\`\``);

			const ticketEmbed = new EmbedBuilder()
				.setColor("#CC99FF")
				.setDescription(
					"**Chào bạn!**, Chúng tôi đã nhận được yêu cầu của bạn và đội ngũ hỗ trợ sẽ sớm liên hệ với bạn. Cảm ơn bạn đã kiên nhẫn!",
				)
				.addFields({
					name: "Khung giờ hoạt động",
					value: "`12h trưa -> 12h tối`",
				});

			const closeButton = new ButtonBuilder()
				.setCustomId(`dongTicketBH:${ticketId}`)
				.setEmoji(`${emoji.close}`)
				.setLabel(`Đóng Ticket`)
				.setStyle(ButtonStyle.Danger);

			const row = new ActionRowBuilder().addComponents(closeButton);

			const supporters = await Promise.all(
				ticketConfig.supportIds.map(
					async (supportId) => await interaction.client.users.fetch(supportId),
				),
			);

			const ticketMessage = await ticketChannel.send({
				content: `**Xin chào** ${
					interaction.user
				}! Ticket của bạn đã được gửi đến nhân viên bán hàng.\n|| ${supporters
					.map((supporter) => `<@${supporter.id}>`)
					.join(" ")} ||`,
				embeds: [ticketEmbed2, ticketEmbed],
				components: [row],
			});
			await ticketMessage.pin();

			// Lưu thông tin ticket vào db
			const ticket = {
				id: ticketId,
				channelId: ticketChannel.id,
				type: "baohanh",
				userId: interaction.user.id,
				productName: productName,
				note: "",
				status: "pending",
				createdAt: new Date(),
			};
			try {
				await storeTicketToDB(ticket);
			} catch (error) {
				console.error("Lỗi lưu ticket vào DB:", error);
			}
		} else if (interaction.customId === `muahangModal`) {
			// Kiem tra spam
			const ticketsByUser = await getTickets(interaction.user.id);
			const now = new Date();
			const ticketsByUserInLimitTime = ticketsByUser.filter(
				(ticket) => now - new Date(ticket.createdAt) < ticketConfig.limitTime,
			);
			if (ticketsByUserInLimitTime.length >= ticketConfig.limitOpenTicket) {
				await interaction.reply({
					content: `Bạn đã gửi quá nhiều ticket, vui lòng thử lại sau!`,
					ephemeral: true,
				});
				return;
			}

			const productName = interaction.fields.getTextInputValue(`productName`);
			await interaction.reply({
				content: `Ticket đang được tạo...`,
				ephemeral: true,
			});

			const ticketChannelName = `ticket-${interaction.user.username.toLowerCase()}`;
			const permissionOverwrites = [
				{
					id: interaction.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				},
				...ticketConfig.supportIds.map((supportId) => ({
					id: supportId,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				})),
			];
			const ticketChannel = await interaction.guild.channels.create({
				name: ticketChannelName,
				type: ChannelType.GuildText,
				permissionOverwrites: permissionOverwrites,
				parent: ticketConfig.thumucmuahangId,
			});
			await interaction.editReply({
				content: `${emoji.success} Ticket đã được tạo ${ticketChannel}`,
			});

			const ticketId = uuidv4(); // Tạo một ID duy nhất cho ticket

			const ticketEmbed2 = new EmbedBuilder()
				.setColor(`#CC99FF`)
				.setAuthor({
					name: `Sản phẩm bạn cần mua là gì?`, // Đặt tên cho tác giả
					iconURL: "https://cdn-icons-png.freepik.com/512/8890/8890197.png", // Lấy avatar của bot cho tác giả
				})
				.setDescription(`\`\`\`${productName}\`\`\``);

			const ticketEmbed = new EmbedBuilder()
				.setColor("#CC99FF")
				.setDescription(
					"> **Xin chào,** gõ **thanhtoan** để xem thông tin thanh toán.\n> Đội ngũ nhân viên sẽ tiếp nhận yêu cầu của bạn và sẽ sớm phản hồi bạn <a:ps_cat:1277771313238249532>",
				)
				.addFields({
					name: "Khung giờ hoạt động",
					value: "`12h trưa -> 12h tối`",
				});

			const closeButton = new ButtonBuilder()
				.setCustomId(`dongTicketMH:${ticketId}`)
				.setEmoji(`${emoji.close}`)
				.setLabel(`Đóng Ticket`)
				.setStyle(ButtonStyle.Danger);

			const row = new ActionRowBuilder().addComponents(closeButton);

			const supporters = await Promise.all(
				ticketConfig.supportIds.map(
					async (supportId) => await interaction.client.users.fetch(supportId),
				),
			);
			const ticketMessage = await ticketChannel.send({
				content: `**Xin chào** ${
					interaction.user
				}! Ticket của bạn đã được gửi đến nhân viên bán hàng.\n|| ${supporters
					.map((supporter) => `<@${supporter.id}>`)
					.join(" ")} ||`,
				embeds: [ticketEmbed2, ticketEmbed],
				components: [row],
			});
			await ticketMessage.pin();

			// Lưu thông tin ticket vào db
			const ticket = {
				id: ticketId,
				channelId: ticketChannel.id,
				channelName: ticketChannelName,
				type: "muahang",
				userId: interaction.user.id,
				productName: productName,
				note: "",
				status: "pending",
				createdAt: new Date(),
			};
			try {
				await storeTicketToDB(ticket);
			} catch (error) {
				console.error("Lỗi lưu ticket vào DB:", error);
			}
		}
	}
});

// Đường dẫn tới file dữ liệu sản phẩm
const dataFilePath = path.join(__dirname, "data", "productData.json");

// Hàm đọc dữ liệu từ file JSON
function loadProductData() {
	if (fs.existsSync(dataFilePath)) {
		try {
			const rawData = fs.readFileSync(dataFilePath);
			return JSON.parse(rawData);
		} catch (error) {
			console.error("Error loading product data:", error);
			return {};
		}
	}
	return {};
}

// Hàm ghi dữ liệu vào file JSON
function saveProductData(data) {
	try {
		fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error("Error saving product data:", error);
	}
}

// Xử lý các tin nhắn gửi đến server
client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot) return;

	// Xử lý các lệnh từ prefix
	if (message.content.startsWith(config.prefix)) {
		const [commandName, ...args] = message.content
			.slice(config.prefix.length)
			.trim()
			.split(/ +/);
		const command = client.commands.get(commandName.toLowerCase());

		if (command) {
			try {
				await command.execute(message, args, client);
			} catch (error) {
				console.error(`Lỗi khi thực hiện lệnh:`, error);
				await message.reply(`Có lỗi xảy ra khi thực hiện lệnh này.`);
			}
		}
	}

	// Xử lý tin nhắn sticky
	if (message.channel.id === config.stickyChannelId && !message.author.bot) {
		const stickyMessage = `Tin nhắn sticky mặc định của bạn ở đây`;

		try {
			if (client.stickyMessageId) {
				try {
					const lastMessage = await message.channel.messages.fetch(
						client.stickyMessageId,
					);
					await lastMessage.delete();
				} catch (err) {
					console.error(`Lỗi khi xóa tin nhắn cũ:`, err);
				}
			}

			const embed = new EmbedBuilder()
				.setColor(`#CC99FF`)
				.setThumbnail(
					"https://media.discordapp.net/attachments/1262131507636473856/1298638810489426021/logo.gif?ex=671a4b23&is=6718f9a3&hm=a50a7930cd044107295fffe95ef7a1a78a7b0a3693b88c33d013174c40317260&",
				)
				.setDescription(
					`${emoji.dot} Bạn vui lòng để lại **đánh giá** sau khi mua hàng\n${emoji.dot} Nhân viên sẽ ghi chú đơn hàng sau khi bạn **đánh giá** để **bảo hành** khi bạn **gặp lỗi**\n${emoji.dot} **Đánh giá** theo mẫu sau :\n\n \`+1 legit [tên sản phẩm]\`\n\n**Cảm ơn bạn đã tin tưởng và ủng hộ Pretty Store!** ${emoji.heart}`,
				)
				.setFooter({
					text: `${message.client.user.username}`,
					iconURL: message.guild.iconURL({ dynamic: true }), // Lấy avatar server cho footer
				})
				.setAuthor({
					name: `THANK YOU FOR BUYING`,
					iconURL: `https://cdn3.emoji.gg/emojis/24235-animal-jam-heart-eyes.png`,
				});

			const botMessage = await message.channel.send({ embeds: [embed] });
			client.stickyMessageId = botMessage.id;
		} catch (err) {
			console.error(`Lỗi khi gửi tin nhắn sticky:`, err);
		}
	}
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	const content = message.content.toLowerCase();
	const args = content.split(" ");
	const commandName = args.shift();

	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	try {
		await command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply("Đã xảy ra lỗi khi thực thi lệnh này.");
	}
});

client.on("messageCreate", (message) => {
	if (message.author.bot) return; // Bỏ qua tin nhắn từ bot

	// Kiểm tra nếu tin nhắn có chứa dấu phép tính (+, -, *)
	if (
		message.content.includes("+") ||
		message.content.includes("-") ||
		message.content.includes("*")
	) {
		const tinhtienCommand = client.commands.get("tinh");
		if (tinhtienCommand) {
			try {
				tinhtienCommand.execute(message); // Thực thi lệnh tính tiền
			} catch (error) {
				console.error(error);
				message.reply("Có lỗi xảy ra khi thực hiện lệnh!");
			}
		}
	}
});

client.on("messageCreate", async (message) => {
	// Bỏ qua tin nhắn từ bot
	if (message.author.bot) return;

	// ID của kênh bạn muốn theo dõi
	const targetChannelId = "1290545639398309949";

	// Kiểm tra xem tin nhắn có đến từ kênh mong muốn không
	if (message.channel.id === targetChannelId) {
		// Kiểm tra xem nội dung tin nhắn có chứa "mua hàng" hoặc "ticket" không
		const content = message.content.toLowerCase();
		if (content.includes("mua") || content.includes("ticket")) {
			// Gửi phản hồi lại
			message.reply(
				"https://discord.com/channels/1262128190915088495/1267984880076066910",
			);
		}
	}
});

client.on("messageCreate", async (message) => {
	// Bỏ qua tin nhắn từ bot
	if (message.author.bot) return;

	// ID của kênh bạn muốn theo dõi
	const targetChannelId = "1290545639398309949";

	// Kiểm tra xem tin nhắn có đến từ kênh mong muốn không
	if (message.channel.id === targetChannelId) {
		// Kiểm tra xem nội dung tin nhắn có chứa "mua hàng" hoặc "ticket" không
		const content = message.content.toLowerCase();
		if (content.includes("bao nhiêu") || content.includes("giá")) {
			// Gửi phản hồi lại
			message.reply("https://discord.gg/628xMMjMMV");
		}
	}
});

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		// Kiểm tra nếu tin nhắn được gửi trong kênh với ID 1291114071768301671
		if (message.channel.id === "1262131507636473856") {
			// Nội dung tin nhắn bot sẽ gửi
			const content =
				"<:ps_arrow:1296511891933237258> **Lưu ý :** **Đọc kĩ hướng dẫn** ở kênh <#1296789580116267100> và làm theo yêu cầu **trước tham gia giveaway!**";

			// Bot gửi tin nhắn với nội dung trên
			message.channel.send(content);
		}
	},
};

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isButton()) return;

	// Xử lý sự kiện cho các nút
	if (interaction.customId === "warranty_policy") {
		await interaction.reply({
			content:
				"<:ps_dotblue:1290288284748222575> Bạn sẽ được bảo hành trọn đời đối với sản phẩm mà bạn mua\n<:ps_dotblue:1290288284748222575> Sản phẩm chỉ được bảo hành nếu như bạn để lại đánh giá sau khi mua hàng\n<:ps_dotblue:1290288284748222575> Cảm ơn bạn đã tin tưởng và ủng hộ **Pretty Store**.",
			ephemeral: true,
		});
	}
});

// console.log(process.env.BOT_TOKEN);
client
	.login(process.env.BOT_TOKEN)
	.then(() => console.log("Đăng nhập thành công."))
	.catch((err) => console.error("Đăng nhập thất bại:", err));
