let ErrorCode = require("./ErrorCode");

let str = "";

for(let src in ErrorCode)
{
	console.log(src);//+"\t"+ErrorCode[src]);
}

for(let src in ErrorCode)
{
	console.log(ErrorCode[src]);
}