/*


*/

let WinnerChecker = require("./WinnerChecker");

//倍率  

// 最后多少倍 = zimo * 其它
let rate = {
  zimo: 2,
  duiduihu: 2,
  siguihupai: 2,
  shisan: 16,
  qingyise: 4,
  quanfeng: 16,
  yaojiu: 8,
  wuguijiabei: 2,
  chihu: 2,
  haidi: 0,
  hunyise: 2,
  qingdui: 8,
  quanyao: 16,
  hundui: 4,
  qiang: 2,
};

/*
麻将值
0-34 分别表示1-9万 1-9柄 1-9锁 东南西北中发白
*/
let data = [
  [4, 4, 8, 8, 14, 14, 15, 15, 16, 16, 8],
  [33, 32],
  [1, 1, 1, 2, 2, 3, 3, 3]
];
//21,21,21,30,30,30, 24,24,24,0,0,0,
let last = Date.now();

let t = 1;
while (t-- > 0) {
  for (let src in data) {
    /*
      33表示白板做鬼 -1表示无鬼
    */
    let ret = WinnerChecker.CheckWin([{ t: 0, v: 4 }, { t: 0, v: 5 }, { t: 0, v: 6 }, { t: 0, v: 8 }], data[src], rate, 33);

    console.log(ret);
  }
}

