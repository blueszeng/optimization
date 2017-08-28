
module.exports = {
	OK: 0, 
	FAIL: 500, 
	//参数错误
	PARAMETER_ERROR:502,
	VISIT_TOO_MUCH:503,
	SERVER_IS_BUSY:504,
	
	//PLATFORM
	ACCOUNT_DISABLED: 801,
	AUTH_FAILED:802,


	//databse
	DATABASE_FAILED: 901,

	//USER: 
	INVALIDATE_USER: 1001,
	USER_LOGIN_SOMEWHERE: 1002,
	TOKEN_EXPIRED: 1003,
	LOGIN_FIRST: 1004,
	LOGIN_FAILED: 1005,
	//Room:
	NO_MORE_ROOM: 1101,
	NO_SUCH_ROOM: 1102,
	ROOM_IS_FULL: 1103,
	Card_NOT_ENOUGH: 1104,
	PLAYER_IN_ROOM: 1105,
	ROOM_CREATE_FAIL: 1106,

	//RECORD
	NO_RECORD: 1201
};