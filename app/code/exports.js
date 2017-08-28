var ErrorCode = require("./ErrorCode");

var str = "";

for(var src in ErrorCode)
{
	console.log(src);//+"\t"+ErrorCode[src]);
}

for(var src in ErrorCode)
{
	console.log(ErrorCode[src]);
}