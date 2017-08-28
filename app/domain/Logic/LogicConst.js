const HuFa = {
	zimo: 1,
	duiduihu: 2,
	qidui: 4,
	siguihupai: 8,
	hunyise: 16,
	hundui: 32,
	qingyise: 64,
	qingdui: 128,
	wuguijiabei: 256,
	yaojiu: 512,
	quanyao: 1024,
	shisan: 2048,
	quanfeng: 4096,
	chihu: 8192,
	haidi: 16384,
	qiang: 32768,
	gangbao: 65536,
	zanpai: 131072,
	quanbao: 262144
};

const OperationResult = {
	None: 1,
	Play: 2,
	Peng: 4,
	MingGang: 8,
	DianGang: 16,
	AnGang: 32,
	CHI: 64,
	Hu: 128,
	Draw: 256,
	Jian: 512
};

const GameType =
	{
		jihu: 1,
		yibaizhang: 2,
		ningdu: 3,
		xinxing: 4,
	}
const StartPoint = 5000;
const MaxPlayer = 4;
const CheckHuFa =
	{
		qidui: 4,
		siguihupai: 8,
		hunyise: 16,
		hundui: 32,
		qingyise: 64,
		qingdui: 128,
		wuguijiabei: 256,
		yaojiu: 512,
		quanyao: 1024,
		shisan: 2048,
		quanfeng: 4096,
		haidi: 16384,
	};


const WanFa =
	{
		meiwan: 1,
		meibing: 2,
		meisuo: 4,
		meizi: 8,
		qianggang: 16,
		qianggangquanbao: 32,
		gangbaoquanbao: 64,
		zanpaiquanbao: 128,
		genpai: 256,
		yijiuwan: 512,
		magendi: 1024,
		qghfanbei: 2048,
		gangshanggang: 4096
	}


module.exports =
	{
		HuFa: HuFa,
		OperationResult: OperationResult,
		GameType: GameType,
		StartPoint: StartPoint,
		MaxPlayer: MaxPlayer,
		CheckHuFa: CheckHuFa,
		WanFa: WanFa,
	}